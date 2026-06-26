#!/usr/bin/env node
/*
 * IntelliHub — Knowledge Portal Server
 * ----------------------------------------
 * Serves the static portal and provides API endpoints for:
 *   1. Static file serving (HTML, CSS, JS)
 *   2. POST /api/ask — AI Q&A backed by internal knowledge base
 *   3. Health check at GET /api/status
 *
 * The Excel conversion is handled entirely client-side via SheetJS.
 * The AI Q&A can optionally call Sloan for enhanced reasoning,
 * but falls back to local knowledge matching if unavailable.
 *
 * Config (set in .env):
 *   PORT                default 4173
 *   SLOAN_BASE_URL      default https://aaoellis.com
 *   SLOAN_SHORTCUT_PATH default /api/shortcut/text
 *   SLOAN_TOKEN         shortcut API token (optional)
 *   SLOAN_TOKEN_HEADER  header name, default X-Shortcut-Token
 *   SLOAN_MESSAGE_KEY   JSON body key, default message
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

/* ---- .env loader ---- */
function loadEnv() {
  const p = path.join(__dirname, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadEnv();

const CFG = {
  port: parseInt(process.env.PORT || "4173", 10),
  baseUrl: (process.env.SLOAN_BASE_URL || "https://aaoellis.com").replace(/\/$/, ""),
  shortcutPath: process.env.SLOAN_SHORTCUT_PATH || "/api/shortcut/text",
  token: process.env.SLOAN_TOKEN || "",
  tokenHeader: process.env.SLOAN_TOKEN_HEADER || "X-Shortcut-Token",
  messageKey: process.env.SLOAN_MESSAGE_KEY || "message",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

/* ---- Sloan integration (optional) ---- */
async function askSloan(prompt) {
  if (!CFG.token) return { ok: false, reason: "no_token" };

  const headers = { "Content-Type": "application/json" };
  if (CFG.tokenHeader.toLowerCase() === "authorization") {
    headers["Authorization"] = "Bearer " + CFG.token;
  } else {
    headers[CFG.tokenHeader] = CFG.token;
  }

  const body = {};
  body[CFG.messageKey] = prompt;
  body.tts = false;
  body.voice = false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);

  try {
    const res = await fetch(CFG.baseUrl + CFG.shortcutPath, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    if (!res.ok) return { ok: false, reason: "http_" + res.status };

    let reasoning = "";
    try {
      const j = JSON.parse(text);
      reasoning = j.reply || j.response || j.text || j.message || j.answer || j.result || "";
      if (!reasoning && typeof j === "string") reasoning = j;
    } catch {
      reasoning = text;
    }
    reasoning = String(reasoning).trim();
    if (!reasoning) return { ok: false, reason: "empty" };
    return { ok: true, reasoning };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, reason: "fetch_error" };
  }
}

/* ---- JSON helpers ---- */
function sendJson(res, code, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(s);
}

/* ---- Static file serving ---- */
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.normalize(path.join(__dirname, urlPath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

/* ---- Server ---- */
const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // API: Ask endpoint
  if (req.method === "POST" && req.url === "/api/ask") {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", async () => {
      let payload = {};
      try { payload = JSON.parse(raw || "{}"); } catch { return sendJson(res, 400, { error: "bad_json" }); }

      const question = payload.question || "";
      if (!question.trim()) return sendJson(res, 400, { error: "no_question" });

      // Try Sloan if configured
      const prompt = `You are IntelliHub, an internal knowledge assistant. Answer the following question using only verified internal knowledge. Be concise and cite sources. Question: "${question}"`;
      const sloan = await askSloan(prompt);

      if (sloan.ok) {
        return sendJson(res, 200, { source: "sloan", answer: sloan.reasoning });
      }

      // Fallback: return indicator for client-side processing
      return sendJson(res, 200, { source: "local", answer: null });
    });
    return;
  }

  // API: Status
  if (req.method === "GET" && req.url === "/api/status") {
    return sendJson(res, 200, {
      status: "ok",
      sloan: CFG.token ? "configured" : "not_configured",
      version: "2.0.0",
    });
  }

  // Static files
  if (req.method === "GET") return serveStatic(req, res);

  res.writeHead(405);
  res.end("method not allowed");
});

server.listen(CFG.port, "0.0.0.0", () => {
  const ifaces = require("os").networkInterfaces();
  const lanIP = Object.values(ifaces).flat().find(i => i.family === "IPv4" && !i.internal)?.address || "localhost";
  console.log(`\n  IntelliHub Knowledge Portal running:`);
  console.log(`    Local:   http://localhost:${CFG.port}`);
  console.log(`    Network: http://${lanIP}:${CFG.port}`);
  console.log(`  Sloan AI:  ${CFG.token ? "ENABLED" : "DISABLED (client-side KB matching active)"}`);
  console.log(`\n`);
});
