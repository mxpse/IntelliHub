/* IntelliHub — Application Logic */
(function () {
  const KB = window.KNOWLEDGE_BASE;
  const state = { currentSection: 'ask', workbook: null, fileName: '', selectedSheet: 0, sheetData: null, archivedPractices: [], questionAsked: false };
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function timeNow() { return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }

  /* ---- Navigation ---- */
  function initNav() {
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => { e.preventDefault(); switchSection(link.dataset.section); });
    });
  }
  function switchSection(name) {
    state.currentSection = name;
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === name));
    $$('.section').forEach(s => s.classList.toggle('active', s.id === 'section-' + name));
  }

  /* ---- Ask AI SME ---- */
  function initAsk() {
    const input = $('#askInput');
    const btn = $('#askBtn');
    btn.addEventListener('click', () => submitQuestion());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuestion(); } });
    $$('.hint-chip').forEach(chip => { chip.addEventListener('click', () => { input.value = chip.dataset.q; submitQuestion(); }); });
    $('#askTeamBtn').addEventListener('click', () => { const input = $('#panelChatInput'); input.focus(); input.placeholder = 'Share findings with the team...'; });
  }

  function submitQuestion(questionText) {
    const input = $('#askInput');
    const question = questionText || input.value.trim();
    if (!question) return;
    // Hide welcome, show findings at top
    const welcome = $('#welcomeState');
    if (welcome) welcome.hidden = true;
    const hints = $('#askHints');
    if (hints) hints.hidden = true;
    const findingsPanel = $('#findingsPanel');
    findingsPanel.hidden = false;
    // Generate answer
    const answer = generateAnswer(question);
    // Populate findings (left panel - informative)
    let sourcesHtml = '';
    if (answer.citations && answer.citations.length > 0) {
      sourcesHtml = `<div class="findings-sources"><div class="findings-sources-label">Sources Referenced</div>${answer.citations.map(c => {
        const item = findKBItem(c.id);
        return `<div class="findings-source-item type-${c.type}"><div class="source-id">${esc(c.id)}</div><div class="source-title">${esc(c.title)}</div>${item ? `<div class="source-excerpt">${esc(item.content.substring(0, 140))}...</div>` : ''}</div>`;
      }).join('')}</div>`;
    }
    const paragraphs = answer.text.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('');
    $('#findingsContent').innerHTML = `<div class="findings-answer">${paragraphs}</div>${sourcesHtml}`;
    // Post to right panel chat
    addPanelMessage('user', 'You', question);
    setTimeout(() => { addPanelMessage('ai', 'IntelliHub AI', answer.text, answer.citations); }, 800);
    input.value = '';
    state.questionAsked = true;
  }

  function findKBItem(id) { return [...KB.policies, ...KB.playbooks, ...KB.precedents, ...KB.wiki].find(item => item.id === id); }

  function generateAnswer(question) {
    const q = question.toLowerCase();
    const allItems = [...KB.policies, ...KB.playbooks, ...KB.precedents, ...KB.wiki];
    const scored = allItems.map(item => {
      let score = 0;
      q.split(/\s+/).forEach(word => { if (word.length < 3) return; if (item.title.toLowerCase().includes(word)) score += 3; if (item.content.toLowerCase().includes(word)) score += 2; if (item.tags && item.tags.some(t => t.toLowerCase().includes(word))) score += 4; });
      return { item, score };
    });
    const relevant = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    if (relevant.length === 0) {
      return { text: "I couldn't find specific information about that in our internal knowledge base. Try rephrasing with specific configuration or process terms.", citations: [] };
    }
    const primary = relevant[0].item;
    let answer = primary.content + '\n\n';
    if (relevant.length > 1) { answer += 'Related: ' + relevant.slice(1, 3).map(r => r.item.title).join(', ') + '.'; }
    return { text: answer.trim(), citations: relevant.slice(0, 4).map(r => ({ id: r.item.id, title: r.item.title, type: r.item.type })) };
  }

  /* ---- Right Panel: Live Discussion ---- */
  function addPanelMessage(type, sender, text, citations, extras) {
    const container = $('#panelMessages');
    const msg = document.createElement('div');
    const displayText = text.replace(/@statutory/gi, '<span class="mention">@statutory</span>');
    if (type === 'ai') {
      msg.className = 'panel-msg panel-msg-ai';
      msg.innerHTML = `<div class="panel-msg-head"><span class="panel-av" style="background:#1a73e8">AI</span><span class="panel-name">${esc(sender)}</span><span class="panel-badge">AI</span><span class="panel-time">${timeNow()}</span></div><div class="panel-msg-body">${displayText.substring(0, 400)}${text.length > 400 ? '...' : ''}</div>${citations && citations.length > 0 ? `<div class="panel-rec-meta"><span class="panel-cite">${citations.length} sources cited</span></div>` : ''}${extras || ''}`;
    } else if (type === 'team') {
      msg.className = 'panel-msg';
      msg.innerHTML = `<div class="panel-msg-head"><span class="panel-av" style="background:${sender.color}">${esc(sender.initials)}</span><span class="panel-name">${esc(sender.name)}</span><span class="panel-role">${esc(sender.role)}</span><span class="panel-time">${timeNow()}</span></div><div class="panel-msg-body">${displayText}</div>${extras || ''}`;
    } else {
      msg.className = 'panel-msg';
      msg.innerHTML = `<div class="panel-msg-head"><span class="panel-av" style="background:#3572a5">Y</span><span class="panel-name">${esc(sender)}</span><span class="panel-time">${timeNow()}</span></div><div class="panel-msg-body">${displayText}</div>${extras || ''}`;
    }
    container.insertBefore(msg, container.firstChild);
  }

  function handleStatutoryMention(text) {
    const match = text.match(/@statutory\s+(.+)/i);
    if (!match) return null;
    const query = match[1].trim().toLowerCase();
    const items = window.STATUTORY_WIKI || [];
    const found = items.filter(item => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query) || item.country.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));
    if (found.length === 0) return `No statutory entries found for "${match[1].trim()}". Try country names or categories like "Travel & Expense".`;
    let response = `Found ${found.length} statutory reference(s):\n\n`;
    found.slice(0, 2).forEach(item => { response += `[${item.country}] ${item.title}: ${item.content.substring(0, 200)}...\n\n`; });
    return response;
  }

  function generateFlatFileCSV(figures) {
    const header = 'EmployeeID,TravelDate,DestinationCountry,DaysAbsent,FullDayRate,PartialDayRate,TotalReimbursement';
    const rows = figures.map(f => f.join(','));
    return header + '\n' + rows.join('\n');
  }

  function initPanelChat() {
    const sendBtn = $('#panelChatSend');
    const chatInput = $('#panelChatInput');
    if (!sendBtn || !chatInput) return;
    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      addPanelMessage('user', 'You', text);
      chatInput.value = '';
      if (text.toLowerCase().includes('@statutory')) {
        const resp = handleStatutoryMention(text);
        if (resp) setTimeout(() => { addPanelMessage('ai', 'IntelliHub AI', resp); updateFindings(resp); }, 900);
      }
    };
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  }

  function updateFindings(newText) {
    const content = $('#findingsContent');
    if (!content || !state.questionAsked) return;
    const update = document.createElement('div');
    update.className = 'findings-answer';
    update.innerHTML = `<p style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)"><strong>Update from discussion:</strong></p><p>${esc(newText.substring(0, 300))}</p>`;
    content.appendChild(update);
  }

  /* ---- Resolved Feature ---- */
  function initResolved() {
    const resolveBtn = $('#resolveBtn');
    const banner = $('#resolvedBanner');
    const approveBtn = $('#resolvedApproveBtn');
    const followupBtn = $('#resolvedFollowupBtn');
    if (!resolveBtn) return;
    resolveBtn.addEventListener('click', () => {
      resolveBtn.classList.add('resolved');
      resolveBtn.innerHTML = '&#x2705; Resolved';
      resolveBtn.disabled = true;
      banner.hidden = false;
      addPanelMessage('ai', 'IntelliHub AI', 'This discussion has been marked as resolved. The submitter can approve the resolution or submit follow-up questions.');
    });
    approveBtn.addEventListener('click', () => {
      banner.innerHTML = '<div class="resolved-content"><span class="resolved-badge">&#x2705; Resolution Approved — Archived to Knowledge Vault</span></div>';
      addPanelMessage('ai', 'IntelliHub AI', 'Resolution approved and archived to the Knowledge Vault. This is now searchable via Ask AI SME.');
    });
    followupBtn.addEventListener('click', () => {
      banner.hidden = true;
      resolveBtn.classList.remove('resolved');
      resolveBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Mark as Resolved';
      resolveBtn.disabled = false;
      const input = $('#panelChatInput');
      input.focus();
      input.placeholder = 'Type your follow-up question...';
    });
  }

  /* ---- DEMO SIMULATION ---- */
  function initDemo() {
    const btn = $('#demoTriggerBtn');
    if (!btn) return;
    btn.addEventListener('click', runDemo);
  }

  function runDemo() {
    const TC = window.TEAM_CONVERSATION;
    const SW = window.STATUTORY_WIKI;
    switchSection('ask');
    // Reset state
    const welcome = $('#welcomeState'); if (welcome) welcome.hidden = true;
    const hints = $('#askHints'); if (hints) hints.hidden = true;
    const panel = $('#findingsPanel'); panel.hidden = false;
    const container = $('#panelMessages'); container.innerHTML = '';
    $('#findingsContent').innerHTML = '<p style="color:var(--ink-muted)">Demo starting...</p>';

    const marco = TC.people.marco;
    const lena = TC.people.lena;

    // Step 1: Marco asks a question
    setTimeout(() => {
      const q = 'What is the correct flat file specification for submitting multi-country travel reimbursement data?';
      $('#askInput').value = q;
      submitQuestion(q);
    }, 1000);

    // Step 2: Marco reviews findings, sends to team
    setTimeout(() => {
      addPanelMessage('team', marco, 'I just asked the AI SME about the flat file spec for multi-country travel reimbursement. Let me know if anyone has dealt with this format before.');
    }, 4000);

    // Step 3: Lena responds referencing statutory wiki
    setTimeout(() => {
      addPanelMessage('team', lena, 'I remember there is a statutory requirement for Germany that affects the per-diem columns. Let me check @statutory Germany per-diem for the exact spec.');
    }, 6500);

    // Step 4: AI responds with statutory reference
    setTimeout(() => {
      const germanyItem = SW.find(s => s.country === 'Germany');
      const response = `[Germany] ${germanyItem.title}: ${germanyItem.content}\n\nThe flat file template requires columns: EmployeeID, TravelDate, DestinationCountry, DaysAbsent, FullDayRate, PartialDayRate, TotalReimbursement.`;
      addPanelMessage('ai', 'IntelliHub AI', response, null, '<a class="chat-download-link" id="demoTemplateLink">&#x1F4E5; Download Template (CSV)</a>');
      updateFindings('Statutory reference found: Germany per-diem rates apply. Flat file template identified with required columns.');
      // Wire download
      setTimeout(() => {
        const dl = document.getElementById('demoTemplateLink');
        if (dl) dl.addEventListener('click', () => downloadTemplate());
      }, 100);
    }, 9000);

    // Step 5: Marco asks @statutory for specific figures
    setTimeout(() => {
      addPanelMessage('team', marco, '@statutory I just need these 3 figures plugged in: EMP-4021 traveled to Germany 2025-03-10 for 5 days at full-day rate 28.00 EUR partial 14.00 EUR totaling 126.00 EUR; EMP-7833 traveled to France 2025-03-12 for 3 days at 25.50 EUR partial 12.75 EUR totaling 63.75 EUR; EMP-1190 traveled to Japan 2025-03-15 for 4 days at 35.00 EUR partial 17.50 EUR totaling 122.50 EUR.');
    }, 12000);

    // Step 6: @statutory replies with populated flat file
    setTimeout(() => {
      const figures = [
        ['EMP-4021','2025-03-10','Germany','5','28.00','14.00','126.00'],
        ['EMP-7833','2025-03-12','France','3','25.50','12.75','63.75'],
        ['EMP-1190','2025-03-15','Japan','4','35.00','17.50','122.50']
      ];
      const csv = generateFlatFileCSV(figures);
      const response = 'Here is your populated flat file with the 3 records:\n\n' + csv;
      addPanelMessage('ai', 'IntelliHub AI', response, null, '<a class="chat-download-link" id="demoFlatFileLink">&#x1F4E5; Download Populated Flat File (CSV)</a>');
      updateFindings('Flat file generated with 3 employee travel records for Germany, France, and Japan.');
      setTimeout(() => {
        const dl = document.getElementById('demoFlatFileLink');
        if (dl) dl.addEventListener('click', () => {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'travel_reimbursement_data.csv';
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        });
      }, 100);
    }, 15000);
  }

  function downloadTemplate() {
    const template = 'EmployeeID,TravelDate,DestinationCountry,DaysAbsent,FullDayRate,PartialDayRate,TotalReimbursement\n,,,,,,\n,,,,,,\n,,,,,,';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'travel_reimbursement_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  /* ---- Team Chat Section ---- */
  function initTeamChat() {
    const feed = $('#teamChatFeed');
    if (!feed) return;
    const TC = window.TEAM_CONVERSATION;
    if (!TC) return;
    const sendBtn = $('#teamChatSend');
    const input = $('#teamChatInput');
    if (sendBtn && input) {
      const postMessage = () => {
        const text = input.value.trim(); if (!text) return;
        const el = document.createElement('div'); el.className = 'chat-message user'; el.style.marginLeft = '0';
        el.innerHTML = `<div class="chat-sender">You · Team Member</div><div class="chat-body"><p>${esc(text)}</p></div>`;
        feed.insertBefore(el, feed.firstChild); input.value = '';
      };
      sendBtn.addEventListener('click', postMessage);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postMessage(); } });
    }
    // Load initial messages (newest first)
    TC.messages.slice().reverse().forEach(msg => {
      const person = TC.people[msg.person]; const el = document.createElement('div');
      if (msg.isRecommendation) {
        el.className = 'chat-message ai';
        el.innerHTML = `<div class="chat-sender">${esc(person.name)} · AI</div><div class="chat-body"><p><strong>${esc(msg.title)}</strong></p><p>${esc(msg.body)}</p></div>`;
      } else {
        el.className = 'chat-message user'; el.style.marginLeft = '0';
        el.innerHTML = `<div class="chat-sender">${esc(person.name)} · ${esc(person.role)}</div><div class="chat-body"><p>${esc(msg.body)}</p></div>`;
      }
      feed.appendChild(el);
    });
  }

  /* ---- Team Panel (right side initial load) ---- */
  function initTeamPanel() {
    const TC = window.TEAM_CONVERSATION;
    if (!TC) return;
    const container = $('#panelMessages');
    if (!container) return;
    TC.messages.slice().reverse().forEach(msg => {
      const person = TC.people[msg.person]; const el = document.createElement('div');
      if (msg.isRecommendation) {
        el.className = 'panel-msg panel-msg-ai';
        el.innerHTML = `<div class="panel-msg-head"><span class="panel-av" style="background:${person.color}">${esc(person.initials)}</span><span class="panel-name">${esc(person.name)}</span><span class="panel-badge">AI</span><span class="panel-time">${esc(msg.time)}</span></div><div class="panel-rec"><div class="panel-rec-title">${esc(msg.title)}</div><div class="panel-rec-body">${esc(msg.body)}</div></div>`;
      } else {
        el.className = 'panel-msg';
        el.innerHTML = `<div class="panel-msg-head"><span class="panel-av" style="background:${person.color}">${esc(person.initials)}</span><span class="panel-name">${esc(person.name)}</span><span class="panel-role">${esc(person.role)}</span><span class="panel-time">${esc(msg.time)}</span></div><div class="panel-msg-body">${esc(msg.body)}</div>`;
      }
      container.appendChild(el);
    });
  }

  /* ---- File Converter ---- */
  function initConverter() {
    const zone = $('#uploadZone'); const fileInput = $('#fileInput'); const removeBtn = $('#fileRemove'); const convertBtn = $('#convertBtn'); const sheetSelect = $('#sheetSelect');
    if (!zone) return;
    zone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });
    removeBtn.addEventListener('click', resetConverter);
    convertBtn.addEventListener('click', convertFile);
    sheetSelect.addEventListener('change', () => { state.selectedSheet = parseInt(sheetSelect.value); renderPreview(); });
  }
  function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx','xls'].includes(ext)) { alert('Please upload an Excel file (.xlsx or .xls)'); return; }
    state.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => { try { state.workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' }); state.selectedSheet = 0; showFilePreview(); } catch(err) { alert('Error reading file.'); } };
    reader.readAsArrayBuffer(file);
  }
  function showFilePreview() {
    const wb = state.workbook; const sheets = wb.SheetNames;
    $('#uploadZone').hidden = true; $('#filePreview').hidden = false;
    $('#fileName').textContent = state.fileName; $('#fileMeta').textContent = `${sheets.length} sheet(s)`;
    if (sheets.length > 1) { const sel = $('#sheetSelect'); sel.innerHTML = ''; sheets.forEach((n,i) => { const o = document.createElement('option'); o.value = i; o.textContent = n; sel.appendChild(o); }); $('#sheetSelector').hidden = false; } else { $('#sheetSelector').hidden = true; }
    renderPreview(); showAiReview();
  }
  function renderPreview() {
    const sheet = state.workbook.Sheets[state.workbook.SheetNames[state.selectedSheet]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); state.sheetData = json;
    if (!json.length) { $('#previewTableWrap').hidden = true; return; }
    $('#previewTableWrap').hidden = false;
    let html = '<thead><tr>' + (json[0]||[]).map(c => `<th>${esc(String(c||''))}</th>`).join('') + '</tr></thead><tbody>';
    json.slice(1,6).forEach(row => { html += '<tr>'; for (let i=0;i<(json[0]?json[0].length:row.length);i++) html += `<td>${esc(String(row[i]!=null?row[i]:''))}</td>`; html += '</tr>'; });
    html += '</tbody>'; $('#previewTable').innerHTML = html;
  }
  function showAiReview() {
    const sheet = state.workbook.Sheets[state.workbook.SheetNames[state.selectedSheet]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const cols = json[0] ? json[0].length : 0;
    $('#aiReview').hidden = false;
    $('#aiReviewBody').innerHTML = `<strong>Structure:</strong> ${json.length} rows, ${cols} columns.<br><strong>Ready:</strong> File is valid for conversion.`;
  }
  function convertFile() {
    if (!state.workbook) return;
    const sheet = state.workbook.Sheets[state.workbook.SheetNames[state.selectedSheet]];
    const format = document.querySelector('input[name="format"]:checked').value;
    let output, mime, ext;
    if (format === 'csv') { output = XLSX.utils.sheet_to_csv(sheet); mime = 'text/csv;charset=utf-8;'; ext = '.csv'; }
    else { output = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' }); mime = 'text/plain;charset=utf-8;'; ext = '.txt'; }
    const blob = new Blob([output], { type: mime }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = state.fileName.replace(/\.(xlsx|xls)$/i,'') + ext;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  function resetConverter() {
    state.workbook = null; state.fileName = ''; state.selectedSheet = 0; state.sheetData = null;
    $('#uploadZone').hidden = false; $('#filePreview').hidden = true; $('#aiReview').hidden = true; $('#previewTableWrap').hidden = true; $('#sheetSelector').hidden = true; $('#fileInput').value = '';
  }

  /* ---- Knowledge Vault ---- */
  function initKnowledgeBase() {
    const pendingGrid = $('#pendingGrid'); const validatedGrid = $('#validatedGrid');
    if (!pendingGrid || !validatedGrid) return;
    const allItems = [...KB.policies, ...KB.playbooks, ...KB.precedents, ...KB.wiki];
    let pc = 0, vc = 0;
    allItems.forEach(item => {
      const card = document.createElement('div'); card.className = 'kb-card';
      const typeLabel = { policy:'Approved Policy', playbook:'Validated Playbook', precedent:'CRM Precedent', wiki:'Internal Wiki' }[item.type];
      const statusText = item.status || item.outcome || '';
      const isPending = statusText.toLowerCase().includes('pending') || statusText.toLowerCase().includes('under review');
      card.innerHTML = `<div class="kb-card-header"><span class="kb-type-tag ${item.type}">${esc(typeLabel)}</span>${statusText ? `<span class="kb-status">${esc(statusText)}</span>` : ''}</div><h3>${esc(item.title)}</h3><p>${esc(item.content.substring(0,160))}${item.content.length>160?'...':''}</p><div class="kb-card-footer">${item.id} ${item.region?'· '+item.region:''} ${item.lastUpdated?'· Updated '+item.lastUpdated:''}</div>`;
      if (isPending) { pendingGrid.appendChild(card); pc++; } else { validatedGrid.appendChild(card); vc++; }
    });
    const pce = $('#pendingCount'); if (pce) pce.textContent = pc;
    const vce = $('#validatedCount'); if (vce) vce.textContent = vc;
    if (pc === 0) { const e = $('#pendingEmpty'); if (e) e.hidden = false; }
  }

  /* ---- Capture (Knowledge Core) ---- */
  function initCapture() {
    const btn = $('#captureBtn'); if (!btn) return;
    btn.addEventListener('click', () => {
      const title = $('#captureTitle').value.trim(); const summary = $('#captureSummary').value.trim();
      if (!title || !summary) { alert('Please provide both a title and summary.'); return; }
      const keywords = $('#captureKeywords').value.trim();
      KB.playbooks.push({ id: 'ARCH-' + String(state.archivedPractices.length+1).padStart(3,'0'), type: 'playbook', title, content: summary, tags: keywords.split(',').map(k=>k.trim()).filter(Boolean), status: 'Validated', lastUpdated: new Date().toISOString().split('T')[0] });
      state.archivedPractices.push(title);
      $('#captureForm').hidden = true; $('#captureSuccess').hidden = false;
      setTimeout(() => { $('#captureForm').hidden = false; $('#captureSuccess').hidden = true; $('#captureTitle').value = ''; $('#captureSummary').value = ''; $('#captureKeywords').value = ''; }, 3000);
    });
  }

  /* ---- Statutory Wiki ---- */
  function initStatutoryWiki() {
    const grid = $('#statutoryGrid'); if (!grid) return;
    (window.STATUTORY_WIKI || []).forEach(item => {
      const card = document.createElement('div'); card.className = 'kb-card statutory-card';
      card.innerHTML = `<div class="kb-card-header"><span class="kb-type-tag statutory">${esc(item.country)}</span><span class="kb-status">${esc(item.status)}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.content.substring(0,180))}${item.content.length>180?'...':''}</p><div class="kb-card-footer">${esc(item.id)} · ${esc(item.category)} · Updated ${esc(item.lastUpdated)}</div>`;
      grid.appendChild(card);
    });
  }

  /* ---- Init ---- */
  function init() { initNav(); initAsk(); initPanelChat(); initResolved(); initDemo(); initTeamChat(); initTeamPanel(); initConverter(); initKnowledgeBase(); initCapture(); initStatutoryWiki(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
