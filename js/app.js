/* IntelliHub — application logic (local concept prototype) */
(function () {
  const D = window.HUB_DATA;
  const { I18N, LANGUAGES } = window.HUB_I18N;

  const state = {
    lang: "fr",
    paneTab: "resolution",
    paneCollapsed: false,
    activeRec: "rec-travel",
    demoPosted: false,
    sloanReasoning: {},
  };

  /* ---- helpers ---- */
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const t = (key, vars) => {
    let s = (I18N[state.lang] && I18N[state.lang][key]) || (I18N.en[key]) || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  };
  const L = (obj) => (obj && (obj[state.lang] != null ? obj[state.lang] : obj.en)) || "";
  const langName = () => t("lang.name." + state.lang);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const ICONS = {
    bell: '<path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5a6 6 0 00-5-5.91V4a1 1 0 10-2 0v1.09A6 6 0 006 11v5l-2 2v1h16v-1l-2-2z"/>',
    chat: '<path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z"/>',
    people: '<path d="M16 11a3 3 0 10-3-3 3 3 0 003 3zm-8 0a3 3 0 10-3-3 3 3 0 003 3zm0 2c-2.7 0-8 1.3-8 4v3h9v-3c0-1 .4-1.9 1-2.6A14 14 0 008 13zm8 0c-.4 0-.9 0-1.4.1A5 5 0 0118 17v3h6v-3c0-2.7-5.3-4-8-4z"/>',
    calendar: '<path d="M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 8v10H5V10h14z"/>',
    hub: '<path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5L4.2 6 12 3 19.8 6 12 9.5zM2 12l10 5 10-5-2.2-1.1L12 14.5 4.2 10.9 2 12zm0 5l10 5 10-5-2.2-1.1L12 19.5 4.2 15.9 2 17z"/>',
  };
  const icon = (name) => `<svg class="ic" viewBox="0 0 24 24">${ICONS[name] || ""}</svg>`;

  function toast(msg) {
    const wrap = $("#toastWrap");
    const n = el("div", "toast", esc(msg));
    wrap.appendChild(n);
    setTimeout(() => n.remove(), 4200);
  }

  /* ---- Sloan reasoning API ---- */
  async function getSloanReasoning(rec, questionText) {
    if (state.sloanReasoning[rec.id] && state.sloanReasoning[rec.id].lang === state.lang) {
      return state.sloanReasoning[rec.id];
    }
    const evidence = (rec.citations || []).map((id) => {
      const k = D.KNOWLEDGE[id];
      if (k) return `${k.id} [${L(k.authority)}]: ${L(k.excerpt)}`;
      const c = D.CRM_CASES[id];
      if (c) return `${c.ref}: root cause "${L(c.rootCause)}" → resolution "${L(c.resolution)}" (${c.region})`;
      return null;
    }).filter(Boolean);

    const payload = {
      language: state.lang,
      languageName: langName(),
      question: questionText || L(rec.title),
      recommendedStep: rec.nextStep.en,
      evidence,
    };

    try {
      const base = window.location.origin;
      if (!base || base === "null" || base.startsWith("file")) throw new Error("no_server");
      const res = await fetch(base + "/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("status " + res.status);
      const data = await res.json();
      if (!data || !data.reasoning) throw new Error("empty");
      const result = { lang: state.lang, source: "sloan", text: data.reasoning.trim() };
      state.sloanReasoning[rec.id] = result;
      return result;
    } catch (err) {
      const result = { lang: state.lang, source: "fallback", text: L(rec.why) };
      if (err.message !== "no_server") toast(t("toast.sloanOffline"));
      return result;
    }
  }

  /* ---- top bar ---- */
  function renderLangSelect() {
    const sel = $("#langSelect");
    sel.innerHTML = "";
    LANGUAGES.forEach((l) => {
      const o = el("option");
      o.value = l.code;
      o.textContent = `${l.flag} · ${t("lang.name." + l.code)}`;
      sel.appendChild(o);
    });
    sel.value = state.lang;
    sel.onchange = () => {
      state.lang = sel.value;
      document.documentElement.lang = state.lang;
      state.sloanReasoning = {};
      renderAll();
    };
  }

  /* ---- rail + sidebar ---- */
  function renderRail() {
    const rail = $("#rail");
    rail.innerHTML = "";
    D.NAV_ITEMS.forEach((item) => {
      const b = el("button", "rail-item" + (item.active ? " active" : ""));
      b.innerHTML = icon(item.icon) + `<span>${esc(t(item.labelKey))}</span>`;
      rail.appendChild(b);
    });
  }

  function renderSidebar() {
    const tree = $("#teamTree");
    tree.innerHTML = "";
    D.TEAMS.forEach((team) => {
      const wrap = el("div", "team");
      const name = el("div", "team-name");
      const initials = team.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
      name.innerHTML = `<span class="team-badge">${esc(initials)}</span><span>${esc(team.name)}</span>`;
      wrap.appendChild(name);
      team.channels.forEach((ch) => {
        const c = el("div", "channel-item" + (ch.active ? " active" : ""));
        c.innerHTML = `<span class="hash">#</span><span>${esc(ch.name)}</span>` +
          (ch.unread ? `<span class="unread">${ch.unread}</span>` : "");
        wrap.appendChild(c);
      });
      tree.appendChild(wrap);
    });
  }

  /* ---- conversation ---- */
  function renderMessage(item) {
    const p = D.PEOPLE[item.person];
    const row = el("div", "msg" + (item.highlight ? " highlight" : ""));
    const av = el("div", "msg-av");
    av.style.background = p.color;
    av.textContent = p.initials;
    row.appendChild(av);
    const main = el("div", "msg-main");
    main.innerHTML =
      `<div class="msg-meta">
         <span class="msg-name">${esc(p.name)}</span>
         <span class="msg-role">${esc(L(p.role))}${p.region && p.region !== "—" ? " · " + esc(p.region) : ""}</span>
         <span class="msg-time">${esc(item.time)}</span>
       </div>
       <div class="msg-body">${esc(L(item.body))}</div>`;
    row.appendChild(main);
    return row;
  }

  function authChip(authority) {
    return `<span class="chip ${authority.cls}"><span class="swatch"></span>${esc(L(authority))}</span>`;
  }

  function translationIndicator(rec) {
    if (!rec || !rec.translation || state.lang === "en") return "";
    const conf = Math.round(rec.translation.confidence * 100) + "%";
    return `<div class="trans-ind">
      <span>${esc(t("trans.displayedIn", { lang: langName() }))}</span>
      <span class="sep">·</span>
      <span>${esc(t("trans.sourceOfRecord"))}</span>
      <span class="sep">·</span>
      <span>${esc(t("trans.confidence", { value: conf }))}</span>
      <span class="sep">·</span>
      <span class="trans-illustrative">${esc(t("trans.illustrative"))}</span>
      <div class="trans-caution">${esc(t("trans.cautionNote"))}</div>
      <div class="trans-actions">
        <span class="tlink" data-action="view-english" data-rec="${rec.id}">${esc(t("btn.viewEnglish"))}</span>
        <span class="sep">·</span>
        <span class="tlink" data-action="report" data-rec="${rec.id}">${esc(t("btn.reportIssue"))}</span>
      </div>
    </div>`;
  }

  function renderAdvisorCard(recId) {
    const rec = D.RECOMMENDATIONS[recId];
    const card = el("div", "advisor");
    card.dataset.rec = recId;

    card.innerHTML = `
      <div class="advisor-head">
        <div class="advisor-av">AI</div>
        <span class="advisor-name">${esc(t("advisor.name"))}</span>
        <span class="advisor-tag">${esc(t("advisor.tag"))}</span>
      </div>
      <div class="advisor-summary">${esc(t("advisor.found"))}</div>

      <div class="advisor-block">
        <div class="advisor-label">${esc(t("advisor.recommendedStep"))}</div>
        <div class="advisor-step">${esc(L(rec.nextStep))}</div>
      </div>

      <div class="advisor-block reasoning-slot">
        <div class="advisor-label">${esc(t("advisor.why"))}</div>
        <div class="advisor-why" data-why="${recId}"><span class="thinking">${esc(t("advisor.thinking"))} <span class="d"></span><span class="d"></span><span class="d"></span></span></div>
        <div class="reasoning-by" data-by="${recId}" hidden><span class="dot"></span>${esc(t("advisor.reasoningBy"))}</div>
      </div>

      ${translationIndicator(rec)}

      <div class="advisor-actions">
        <button class="btn btn-primary" data-action="review-evidence" data-rec="${recId}">${esc(t("btn.reviewEvidence"))}</button>
        <button class="btn" data-action="draft" data-rec="${recId}">${esc(t("btn.draftResponse"))}</button>
        <button class="btn" data-action="view-english" data-rec="${recId}">${esc(t("btn.openEnglish"))}</button>
        <button class="btn btn-ghost" data-action="dismiss" data-rec="${recId}">${esc(t("btn.dismiss"))}</button>
      </div>`;

    const question = L(rec.title);
    getSloanReasoning(rec, question).then((r) => {
      const whyEl = card.querySelector(`[data-why="${recId}"]`);
      const byEl = card.querySelector(`[data-by="${recId}"]`);
      if (whyEl) whyEl.textContent = r.text;
      if (byEl && r.source === "sloan") byEl.hidden = false;
    });

    return card;
  }

  function renderConversation() {
    const box = $("#messages");
    box.innerHTML = "";
    const items = D.CONVERSATION.slice();
    if (state.demoPosted) {
      items.push(D.DEMO_QUESTION);
    }
    items.forEach((item) => {
      if (item.type === "message") {
        box.appendChild(renderMessage(item));
      } else if (item.type === "advisor") {
        box.appendChild(renderAdvisorCard(item.recommendation));
      }
    });
    box.scrollTop = box.scrollHeight;
  }

  /* ---- right pane ---- */
  const PANE_TABS = [
    { id: "resolution", key: "tab.resolution" },
    { id: "cases", key: "tab.cases" },
    { id: "knowledge", key: "tab.knowledge" },
    { id: "context", key: "tab.context" },
  ];

  function renderPaneTabs() {
    const box = $("#paneTabs");
    box.innerHTML = "";
    PANE_TABS.forEach((tab) => {
      const b = el("button", "pane-tab" + (state.paneTab === tab.id ? " active" : ""));
      b.textContent = t(tab.key);
      b.onclick = () => { state.paneTab = tab.id; renderPaneTabs(); renderPaneBody(); };
      box.appendChild(b);
    });
  }

  function renderPaneBody() {
    const box = $("#paneBody");
    box.innerHTML = "";
    const rec = D.RECOMMENDATIONS[state.activeRec];
    if (state.paneTab === "resolution") box.appendChild(paneResolution(rec));
    else if (state.paneTab === "cases") box.appendChild(paneCases(rec));
    else if (state.paneTab === "knowledge") box.appendChild(paneKnowledge());
    else if (state.paneTab === "context") box.appendChild(paneContext());
  }

  function citationChip(id) {
    const k = D.KNOWLEDGE[id];
    if (k) return `<span class="chip ${k.authority.cls}"><span class="swatch"></span>${esc(k.id)}</span>`;
    const cs = D.CRM_CASES[id];
    if (cs) return `<span class="chip auth-precedent"><span class="swatch"></span>${esc(cs.ref)}</span>`;
    return "";
  }

  /* ---- Tab 1: Recommended Action ---- */
  function paneResolution(rec) {
    const c = el("div");
    const conf = Math.round(rec.confidence * 100);
    const steps = (rec.steps ? (rec.steps[state.lang] || rec.steps.en) : [])
      .map((s, i) => `<li>${esc(s)}</li>`).join("");

    c.innerHTML = `
      <div class="section-card">
        <h3>${esc(L(rec.title))}</h3>
        <div class="gov-row">
          ${authChip(rec.authority)}
          <span class="chip chip-conf">${esc(t("res.confidence"))}: ${conf}%</span>
        </div>
        <div class="kv"><div class="k">${esc(t("res.recommendedSteps"))}</div>
          <ol class="steps">${steps}</ol>
        </div>
        <div class="kv"><div class="k">${esc(t("res.approval"))}</div><div class="v">${esc(L(rec.approval))}</div></div>
        <div class="kv"><div class="k">${esc(t("res.confidence"))}</div>
          <div class="meter"><span style="width:${conf}%"></span></div>
          <div class="v">${conf}%</div>
        </div>
        <div class="kv highlight-note"><div class="v">${esc(t("res.humanReview"))}</div></div>
        <div class="kv"><div class="k">${esc(t("res.escalation"))}</div><div class="v">${esc(L(rec.escalation))}</div></div>
        <div class="kv"><div class="k">${esc(t("res.citations"))}</div>
          <div class="v">${rec.citations.map((id) => citationChip(id)).join(" ")}</div>
        </div>
      </div>
      ${translationIndicator(rec)}`;
    return c;
  }

  /* ---- Tab 2: Similar Configuration Cases ---- */
  function paneCases(rec) {
    const c = el("div");
    const rate = Math.round(rec.resolutionRate.value * 100);
    const stats = rec.caseStats;

    c.innerHTML = `<div class="section-card">
      <h3>${esc(t("cases.title"))}</h3>
      <div class="kv"><div class="k">${esc(t("cases.summary"))}</div></div>
      <div class="kv"><div class="k">${esc(t("cases.pattern"))}</div><div class="v">${esc(L(stats.pattern))}</div></div>
      <div class="kv"><div class="k">${esc(t("cases.rate"))}</div>
        <div class="meter"><span style="width:${rate}%"></span></div>
        <div class="v">${stats.resolved} / ${stats.total} — ${rate}%</div>
        <div class="v illustrative-tag">${esc(t("cases.illustrative"))}</div>
      </div>
      <div class="disclaimer-box">
        <div>${esc(t("cases.evidenceClass"))}</div>
        <div>${esc(t("cases.authorityNote"))}</div>
        <div class="disclaimer-note">${esc(t("cases.disclaimer"))}</div>
      </div>
    </div>`;

    rec.cases.forEach((id) => {
      const cs = D.CRM_CASES[id];
      if (!cs) return;
      const card = el("div", "case");
      card.innerHTML = `
        <div class="case-top"><span class="case-ref">${esc(cs.ref)}</span>
          <span class="sim">${esc(t("cases.similarity"))} ${Math.round(cs.similarity * 100)}%</span></div>
        <div class="kv"><div class="k">${esc(t("cases.rootCause"))}</div><div class="v">${esc(L(cs.rootCause))}</div></div>
        <div class="kv"><div class="k">${esc(t("cases.resolution"))}</div><div class="v">${esc(L(cs.resolution))}</div></div>
        <div class="kv"><div class="k">${esc(t("cases.outcome"))}</div><div class="v">${esc(L(cs.outcome))}</div></div>
        <div class="kv"><div class="k">${esc(t("cases.region"))}</div><div class="v"><span class="region-tag">${esc(cs.region)}</span></div></div>`;
      c.appendChild(card);
    });
    return c;
  }

  /* ---- Tab 3: Knowledge & Best Practices ---- */
  function knowCard(k, tagKey) {
    const statusText = L(k.status);
    const isProposed = k.authority.id === "conversation";
    return `<div class="know-card ${k.authority.cls}">
      <span class="know-tag ${k.authority.cls}">${esc(t(tagKey))}</span>
      ${isProposed ? `<span class="know-pending">${esc(t("know.pendingReview"))}</span>` : ""}
      <h4>${esc(L(k.title))}</h4>
      <p>${esc(L(k.excerpt))}</p>
      <div class="sor">${esc(t("res.sourceOfRecord"))}: ${esc(k.sourceOfRecord)} · ${esc(statusText)}</div>
      ${k.workflow ? `<div class="workflow-note">${esc(k.workflow)}</div>` : ""}
    </div>`;
  }

  function paneKnowledge() {
    const c = el("div");
    // Governance hierarchy
    const govRows = D.GOVERNANCE_HIERARCHY.map((g) =>
      `<tr><td><span class="rank-num">${g.rank}</span></td><td>${esc(L(g))}</td></tr>`
    ).join("");

    // BP Workflow
    const wfSteps = D.BP_WORKFLOW.steps.map((s) => `<span class="wf-step">${esc(L(s))}</span>`).join(`<span class="wf-arrow">→</span>`);

    c.innerHTML =
      knowCard(D.KNOWLEDGE["kb-demo-204"], "know.approved") +
      knowCard(D.KNOWLEDGE["play-demo-015"], "know.playbook") +
      knowCard(D.KNOWLEDGE["play-proposed-test"], "know.proposed") +
      `<div class="section-card">
        <h3>${esc(t("know.govHierarchy"))}</h3>
        <table class="gov-table"><tbody>${govRows}</tbody></table>
      </div>
      <div class="section-card">
        <h3>${esc(t("know.workflow"))}</h3>
        <div class="wf-flow">${wfSteps}</div>
        <div class="wf-note">${esc(t("know.workflowNote"))}</div>
      </div>`;
    return c;
  }

  /* ---- Tab 4: Team Context ---- */
  function paneContext() {
    const c = el("div");
    const ctx = D.TEAM_CONTEXT;

    const capabilities = (ctx.capabilities[state.lang] || ctx.capabilities.en)
      .map((cap) => `<li>${esc(cap)}</li>`).join("");

    const experts = ctx.experts.map((e) => {
      const p = D.PEOPLE[e.person];
      return `<div class="expert"><div class="av" style="background:${p.color}">${esc(p.initials)}</div>
        <div><strong>${esc(p.name)}</strong> · ${esc(L(p.role))}<br><span class="sor">${esc(L(e.reason))}</span></div></div>`;
    }).join("");

    const roles = Object.values(D.PEOPLE)
      .filter((p) => !p.bot)
      .map((p) => `<span class="role-chip">${esc(L(p.role))}</span>`)
      .join("");

    c.innerHTML = `
      <div class="section-card">
        <h3>${esc(t("ctx.threadSummary"))}</h3>
        <p>${esc(L(ctx.threadSummary))}</p>
      </div>
      <div class="section-card">
        <h3>${esc(t("ctx.capabilities"))}</h3>
        <ul class="cap-list">${capabilities}</ul>
      </div>
      <div class="section-card">
        <h3>${esc(t("ctx.experts"))}</h3>
        ${experts}
      </div>
      <div class="section-card">
        <h3>${esc(t("ctx.roles"))}</h3>
        <div class="roles-wrap">${roles}</div>
      </div>`;
    return c;
  }

  /* ---- future note / executive callout ---- */
  function renderFutureNote() {
    const box = $("#futureNote");
    box.innerHTML = `
      <div class="exec-callout">
        <h4>${esc(t("future.title"))}</h4>
        <p class="exec-body">${esc(t("future.body"))}</p>
        <p class="exec-next">${esc(t("future.nextStep"))}</p>
        <p class="disclaimer">${esc(t("future.disclaimer"))}</p>
      </div>`;
  }

  /* ---- modals ---- */
  function openModal(html) {
    $("#modal").innerHTML = html;
    $("#modalBackdrop").classList.add("visible");
  }
  function closeModal() { $("#modalBackdrop").classList.remove("visible"); }

  function evidenceModal(rec) {
    const items = rec.citations.map((id) => {
      const k = D.KNOWLEDGE[id];
      if (k) return `<div class="evidence-item">
          <div class="gov-row">${authChip(k.authority)}</div>
          <div class="etitle">${esc(L(k.title))}</div>
          <div class="eexcerpt">${esc(L(k.excerpt))}</div>
          <div class="sor" style="margin-top:6px">${esc(t("res.sourceOfRecord"))}: ${esc(k.sourceOfRecord)}</div>
        </div>`;
      const cs = D.CRM_CASES[id];
      if (cs) return `<div class="evidence-item">
          <div class="etitle">${esc(cs.ref)} · ${esc(cs.region)} · ${esc(t("cases.similarity"))} ${Math.round(cs.similarity * 100)}%</div>
          <div class="eexcerpt">${esc(L(cs.rootCause))} → ${esc(L(cs.resolution))} (${esc(L(cs.outcome))})</div>
        </div>`;
      return "";
    }).join("");
    openModal(`<h3>${esc(t("evidence.title"))}</h3>
      <div class="modal-note">${esc(t("res.sourceOfRecord"))}: English</div>
      ${items}
      <div class="modal-actions"><button class="btn" id="mClose">${esc(t("btn.dismiss"))}</button></div>`);
    $("#mClose").onclick = closeModal;
  }

  async function draftModal(rec) {
    openModal(`<h3>${esc(t("draft.title"))}</h3>
      <div class="modal-note">${esc(t("draft.note"))}</div>
      <textarea id="draftText">${esc(t("advisor.thinking"))}</textarea>
      <div class="modal-actions">
        <button class="btn" id="mDiscard">${esc(t("draft.discard"))}</button>
        <button class="btn btn-primary" id="mPost">${esc(t("draft.post"))}</button>
      </div>`);
    $("#mDiscard").onclick = closeModal;
    $("#mPost").onclick = () => { closeModal(); toast(t("toast.drafted")); };

    const r = await getSloanReasoning(rec, L(rec.title));
    const opener = state.lang === "fr"
      ? `Bonjour, voici une réponse proposée (à votre revue) :`
      : state.lang === "es" ? `Hola, aquí una respuesta propuesta (para su revisión):`
      : state.lang === "ja" ? `こんにちは、レビュー用の提案回答です：`
      : `Hi all — here's a proposed reply (for your review):`;
    const step = `• ${L(rec.nextStep)}`;
    const gov = `${rec.citations[0]} (${t("res.sourceOfRecord")}: English)`;
    const ta = $("#draftText");
    if (ta) ta.value = `${opener}\n\n${r.text}\n\n${step}\n\n${gov}`;
  }

  function englishModal(rec) {
    openModal(`<h3>${esc(rec.title.en)}</h3>
      <div class="modal-note">English source of record</div>
      <div class="evidence-item"><div class="etitle">Recommended next step</div>
        <div class="eexcerpt">${esc(rec.nextStep.en)}</div></div>
      <div class="evidence-item"><div class="etitle">Why</div>
        <div class="eexcerpt">${esc(rec.why.en)}</div></div>
      <div class="evidence-item"><div class="etitle">Governance</div>
        <div class="eexcerpt">${esc(rec.governanceNote.en)}</div></div>
      <div class="evidence-item"><div class="etitle">Escalation trigger</div>
        <div class="eexcerpt">${esc(rec.escalation.en)}</div></div>
      <div class="modal-actions"><button class="btn" id="mClose">${esc(t("btn.dismiss"))}</button></div>`);
    $("#mClose").onclick = closeModal;
  }

  /* ---- actions ---- */
  function handleAction(action, recId) {
    const rec = D.RECOMMENDATIONS[recId];
    if (!rec) return;
    switch (action) {
      case "review-evidence":
        state.activeRec = recId; state.paneTab = "cases"; openPane(); renderPaneTabs(); renderPaneBody();
        evidenceModal(rec); break;
      case "draft": draftModal(rec); break;
      case "view-english": englishModal(rec); break;
      case "dismiss": {
        const card = document.querySelector(`.advisor[data-rec="${recId}"]`);
        if (card) card.remove();
        toast(t("toast.dismissed")); break;
      }
      case "report": toast(t("toast.reported")); break;
      case "propose": toast(t("toast.proposed")); break;
    }
  }

  /* ---- pane collapse ---- */
  function openPane() {
    state.paneCollapsed = false;
    $("#pane").classList.remove("collapsed");
    $("#paneReopen").hidden = true;
  }
  function collapsePane() {
    state.paneCollapsed = true;
    $("#pane").classList.add("collapsed");
    $("#paneReopen").hidden = false;
  }

  /* ---- demo question ---- */
  function postDemoQuestion() {
    if (state.demoPosted) return;
    state.demoPosted = true;
    renderConversation();
  }

  /* ---- static i18n bindings ---- */
  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); });
    document.title = t("app.title") + " — " + t("app.poweredBy");
  }

  /* ---- render orchestration ---- */
  function renderAll() {
    applyStaticI18n();
    renderLangSelect();
    renderRail();
    renderSidebar();
    renderConversation();
    renderPaneTabs();
    renderPaneBody();
    renderFutureNote();
  }

  /* ---- events ---- */
  function wireEvents() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (btn) handleAction(btn.dataset.action, btn.dataset.rec);
    });
    $("#paneCollapse").onclick = collapsePane;
    $("#paneReopen").onclick = openPane;
    $("#paneToggleTop").onclick = () => (state.paneCollapsed ? openPane() : collapsePane());
    $("#demoBtn").onclick = postDemoQuestion;
    $("#modalBackdrop").onclick = (e) => { if (e.target.id === "modalBackdrop") closeModal(); };

    const send = () => {
      const input = $("#composeInput");
      const v = input.value.trim();
      if (!v) return;
      const norm = v.toLowerCase();
      if (norm.includes("travel") || norm.includes("partial") || norm.includes("multi-day") || norm.includes("reimbursement")) {
        input.value = "";
        postDemoQuestion();
        return;
      }
      input.value = "";
      toast(t("toast.dismissed"));
    };
    $("#sendBtn").onclick = send;
    $("#composeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  }

  /* ---- boot ---- */
  document.documentElement.lang = state.lang;
  wireEvents();
  renderAll();
})();
