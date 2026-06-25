#!/usr/bin/env node
/*
 * Resolution Hub — local prototype server
 * ---------------------------------------
 * Two jobs only:
 *   1. Serve the static prototype (index.html, css, js).
 *   2. Expose POST /api/reason, which forwards a governed prompt to Sloan's
 *      intelligence pipeline (POST /api/shortcut/text on the AI portal) and
 *      returns the generated reasoning text.
 *
 * The browser never talks to Sloan directly (avoids CORS and keeps the token
 * server-side). Everything else in the prototype is synthetic.
 *
 * Config (set in .env next to this file, or as real env vars):
 *   SLOAN_BASE_URL      default https://aaoellis.com
 *   SLOAN_SHORTCUT_PATH default /api/shortcut/text
 *   SLOAN_TOKEN         the shortcut API token (required to reach Sloan)
 *   SLOAN_TOKEN_HEADER  header name for the token, default X-Shortcut-Token
 *   SLOAN_MESSAGE_KEY   JSON body key for the prompt, default message
 *   PORT                default 4173
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

/* ---- tiny .env loader (no deps) ---- */
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
};

/* ---- build the governed prompt for Sloan ---- */
function buildPrompt(p) {
  const lang = p.languageName || (p.language === "fr" ? "French" : "English");
  const evidence = (p.evidence || []).map((e, i) => `  ${i + 1}. ${e}`).join("\n");
  return [
    `You are MockupAI, a governed resolution advisor embedded in a team collaboration channel.`,
    `A teammate asked: "${p.question}".`,
    ``,
    `The approved recommended next step (already governed, do not change it) is:`,
    `  "${p.recommendedStep}"`,
    ``,
    `Supporting evidence (synthetic, for reasoning only):`,
    evidence || "  (none provided)",
    ``,
    `Write a concise 2-3 sentence explanation of WHY this is the right next step,`,
    `grounded only in the evidence above. Do not invent policy, approval status,`,
    `case numbers, or statistics. Keep CRM control names (for example`,
    `"Account Ownership Override", "KB-204") in English exactly as written.`,
    `Respond in ${lang}. Return only the explanation text, no preamble.`,
  ].join("\n");
}

/* ---- call Sloan ---- */
async function askSloan(prompt) {
  if (!CFG.token) {
    return { ok: false, reason: "no_token" };
  }
  const headers = { "Content-Type": "application/json" };
  if (CFG.tokenHeader.toLowerCase() === "authorization") headers["Authorization"] = "Bearer " + CFG.token;
  else headers[CFG.tokenHeader] = CFG.token;

  const body = {};
  body[CFG.messageKey] = prompt;
  body.tts = false;
  body.voice = false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(CFG.baseUrl + CFG.shortcutPath, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    if (!res.ok) return { ok: false, reason: "http_" + res.status, detail: text.slice(0, 300) };
    let reasoning = "";
    try {
      const j = JSON.parse(text);
      reasoning = j.reply || j.response || j.text || j.message || j.answer || j.result || "";
      if (!reasoning && typeof j === "string") reasoning = j;
    } catch {
      reasoning = text; // plain-text response
    }
    reasoning = String(reasoning).trim();
    if (!reasoning) return { ok: false, reason: "empty" };
    return { ok: true, reasoning };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, reason: "fetch_error", detail: String(err && err.message || err) };
  }
}

function sendJson(res, code, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(s);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(__dirname, urlPath));
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/reason") {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", async () => {
      let payload = {};
      try { payload = JSON.parse(raw || "{}"); } catch { return sendJson(res, 400, { error: "bad_json" }); }
      const prompt = buildPrompt(payload);
      const result = await askSloan(prompt);
      if (result.ok) return sendJson(res, 200, { source: "sloan", reasoning: result.reasoning });
      // 502 so the browser falls back to prepared (synthetic) guidance
      return sendJson(res, 502, { source: "fallback", reason: result.reason, detail: result.detail || "" });
    });
    return;
  }
  if (req.method === "GET" && req.url === "/api/sloan-status") {
    return sendJson(res, 200, {
      configured: Boolean(CFG.token),
      baseUrl: CFG.baseUrl,
      path: CFG.shortcutPath,
      tokenHeader: CFG.tokenHeader,
    });
  }
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405); res.end("method not allowed");
});

server.listen(CFG.port, "0.0.0.0", () => {
  const ifaces = require("os").networkInterfaces();
  const lanIP = Object.values(ifaces).flat().find(i => i.family === "IPv4" && !i.internal)?.address || "unknown";
  console.log(`\n  Resolution Hub prototype running:`);
  console.log(`    Local:   http://localhost:${CFG.port}`);
  console.log(`    Network: http://${lanIP}:${CFG.port}`);
  console.log(`  Sloan reasoning: ${CFG.token ? "ENABLED" : "DISABLED (set SLOAN_TOKEN in .env)"} -> ${CFG.baseUrl}${CFG.shortcutPath}`);
  console.log(`  (All CRM/Teams/knowledge content is synthetic.)\n`);
});
