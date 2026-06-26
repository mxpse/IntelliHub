/* IntelliHub — Application Logic
   Handles: Navigation, AI Q&A, Excel Upload/Conversion, Knowledge Base rendering */

(function () {
  const KB = window.KNOWLEDGE_BASE;

  /* ---- State ---- */
  const state = {
    currentSection: 'ask',
    workbook: null,
    fileName: '',
    selectedSheet: 0,
    sheetData: null,
    archivedPractices: [],
  };

  /* ---- Helpers ---- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---- Navigation ---- */
  function initNav() {
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        switchSection(section);
      });
    });
  }

  function switchSection(name) {
    state.currentSection = name;
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === name));
    $$('.section').forEach(s => s.classList.toggle('active', s.id === 'section-' + name));
  }

  /* ---- AI Q&A ---- */
  function initAsk() {
    const input = $('#askInput');
    const btn = $('#askBtn');
    const hints = $$('.hint-chip');

    btn.addEventListener('click', () => submitQuestion());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitQuestion();
      }
    });

    hints.forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.q;
        submitQuestion();
      });
    });
  }

  function submitQuestion() {
    const input = $('#askInput');
    const question = input.value.trim();
    if (!question) return;

    // Hide welcome state
    const welcome = $('#welcomeState');
    if (welcome) welcome.remove();

    // Add user message
    addChatMessage('user', question);
    input.value = '';

    // Show loading
    const loadingEl = addLoadingIndicator();

    // Simulate AI processing
    setTimeout(() => {
      loadingEl.remove();
      const answer = generateAnswer(question);
      addChatMessage('ai', answer.text, answer.citations);
    }, 1200 + Math.random() * 800);
  }

  function addChatMessage(type, text, citations) {
    const conv = $('#conversation');
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;

    const sender = type === 'user' ? 'You' : 'IntelliHub AI';
    let html = `<div class="chat-sender">${sender}</div><div class="chat-body">`;

    if (type === 'ai') {
      // Render paragraphs
      const paragraphs = text.split('\n\n');
      paragraphs.forEach(p => {
        if (p.startsWith('- ')) {
          html += '<p>' + p.split('\n').map(l => esc(l)).join('<br>') + '</p>';
        } else {
          html += `<p>${esc(p)}</p>`;
        }
      });
    } else {
      html += `<p>${esc(text)}</p>`;
    }

    html += '</div>';

    if (citations && citations.length > 0) {
      html += `<div class="chat-citations">
        <div class="citation-label">Sources referenced</div>
        <div class="citation-list">`;
      citations.forEach(c => {
        html += `<span class="citation-tag ${c.type}">${esc(c.id)} — ${esc(c.title)}</span>`;
      });
      html += '</div></div>';
    }

    msg.innerHTML = html;
    conv.appendChild(msg);
    conv.scrollTop = conv.scrollHeight;
  }

  function addLoadingIndicator() {
    const conv = $('#conversation');
    const loading = document.createElement('div');
    loading.className = 'chat-loading';
    loading.innerHTML = `
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <span class="loading-text">Searching internal knowledge base...</span>`;
    conv.appendChild(loading);
    conv.scrollTop = conv.scrollHeight;
    return loading;
  }

  function generateAnswer(question) {
    const q = question.toLowerCase();
    const allItems = [...KB.policies, ...KB.playbooks, ...KB.precedents, ...KB.wiki];

    // Score relevance
    const scored = allItems.map(item => {
      let score = 0;
      const words = q.split(/\s+/);
      words.forEach(word => {
        if (word.length < 3) return;
        if (item.title.toLowerCase().includes(word)) score += 3;
        if (item.content.toLowerCase().includes(word)) score += 2;
        if (item.tags && item.tags.some(t => t.toLowerCase().includes(word))) score += 4;
      });
      return { item, score };
    });

    // Get top matches
    const relevant = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);

    if (relevant.length === 0) {
      return {
        text: "I couldn't find specific information about that in our internal knowledge base. Here are some suggestions:\n\n- Try rephrasing your question with specific configuration or process terms\n- Check if the topic falls under a specific KB article number\n- For new topics not yet documented, consider reaching out to your team lead or SME\n\nI only provide answers sourced from confirmed internal resources — I won't guess or provide unverified information.",
        citations: []
      };
    }

    // Build answer from relevant sources
    const primary = relevant[0].item;
    let answer = '';

    if (q.includes('troubleshoot') || q.includes('issue') || q.includes('problem') || q.includes('partial') || q.includes('reimbursement')) {
      answer = `Based on our approved documentation, here's what I found:\n\n${primary.content}\n\n`;
      if (relevant.length > 1) {
        answer += `Additional context from related sources:\n\n`;
        relevant.slice(1, 3).forEach(r => {
          answer += `- ${r.item.title}: ${r.item.content.substring(0, 150)}...\n\n`;
        });
      }
    } else if (q.includes('escalat')) {
      answer = `Here's the escalation guidance from our approved policy:\n\n${primary.content}\n\n`;
      if (relevant.length > 1) {
        answer += `Related: ${relevant[1].item.title} — ${relevant[1].item.content.substring(0, 120)}...`;
      }
    } else if (q.includes('process') || q.includes('how do') || q.includes('steps') || q.includes('checklist')) {
      answer = `Here's the documented process:\n\n${primary.content}\n\n`;
      if (relevant.length > 1) {
        answer += `You may also find this helpful: ${relevant[1].item.title}.`;
      }
    } else if (q.includes('rule') || q.includes('evaluation') || q.includes('sequence') || q.includes('precedence')) {
      answer = `Regarding rule evaluation and precedence:\n\n${primary.content}\n\n`;
      if (relevant.length > 1) {
        answer += `See also: ${relevant[1].item.title} — ${relevant[1].item.content.substring(0, 150)}...`;
      }
    } else {
      answer = `Here's what I found in our knowledge base:\n\n${primary.content}\n\n`;
      if (relevant.length > 1) {
        answer += `Related resources:\n\n`;
        relevant.slice(1, 3).forEach(r => {
          answer += `- ${r.item.title}\n\n`;
        });
      }
    }

    const citations = relevant.slice(0, 4).map(r => ({
      id: r.item.id,
      title: r.item.title,
      type: r.item.type
    }));

    return { text: answer.trim(), citations };
  }

  /* ---- File Converter ---- */
  function initConverter() {
    const zone = $('#uploadZone');
    const fileInput = $('#fileInput');
    const removeBtn = $('#fileRemove');
    const convertBtn = $('#convertBtn');
    const sheetSelect = $('#sheetSelect');

    // Click to upload
    zone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // Drag and drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    // Remove file
    removeBtn.addEventListener('click', resetConverter);

    // Convert
    convertBtn.addEventListener('click', convertFile);

    // Sheet selection change
    sheetSelect.addEventListener('change', () => {
      state.selectedSheet = parseInt(sheetSelect.value);
      renderPreview();
    });
  }

  function handleFile(file) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !['xlsx', 'xls'].includes(ext)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    state.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        state.workbook = XLSX.read(data, { type: 'array' });
        state.selectedSheet = 0;
        showFilePreview();
      } catch (err) {
        alert('Error reading file. Please make sure it is a valid Excel file.');
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function showFilePreview() {
    const wb = state.workbook;
    const sheets = wb.SheetNames;

    // Show preview panel, hide upload zone
    $('#uploadZone').hidden = true;
    $('#filePreview').hidden = false;

    // File info
    $('#fileName').textContent = state.fileName;
    $('#fileMeta').textContent = `${sheets.length} sheet${sheets.length > 1 ? 's' : ''} detected`;

    // Sheet selector
    if (sheets.length > 1) {
      const sel = $('#sheetSelect');
      sel.innerHTML = '';
      sheets.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name;
        sel.appendChild(opt);
      });
      $('#sheetSelector').hidden = false;
    } else {
      $('#sheetSelector').hidden = true;
    }

    renderPreview();
    showAiReview();
  }

  function renderPreview() {
    const wb = state.workbook;
    const sheetName = wb.SheetNames[state.selectedSheet];
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    state.sheetData = json;

    if (json.length === 0) {
      $('#previewTableWrap').hidden = true;
      return;
    }

    $('#previewTableWrap').hidden = false;
    const table = $('#previewTable');
    let html = '';

    // Header row
    if (json[0]) {
      html += '<thead><tr>';
      json[0].forEach(cell => {
        html += `<th>${esc(String(cell || ''))}</th>`;
      });
      html += '</tr></thead>';
    }

    // Data rows (first 5)
    html += '<tbody>';
    json.slice(1, 6).forEach(row => {
      html += '<tr>';
      const maxCols = json[0] ? json[0].length : row.length;
      for (let i = 0; i < maxCols; i++) {
        html += `<td>${esc(String(row[i] != null ? row[i] : ''))}</td>`;
      }
      html += '</tr>';
    });
    html += '</tbody>';

    table.innerHTML = html;
  }

  function showAiReview() {
    const wb = state.workbook;
    const sheetName = wb.SheetNames[state.selectedSheet];
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const totalRows = json.length;
    const totalCols = json[0] ? json[0].length : 0;
    const emptyRows = json.filter(r => r.every(c => c == null || String(c).trim() === '')).length;
    const headers = json[0] ? json[0].map(h => String(h || 'Unnamed')).join(', ') : 'No headers detected';

    let review = `<strong>Structure:</strong> ${totalRows} rows, ${totalCols} columns across ${wb.SheetNames.length} sheet(s).<br>`;
    review += `<strong>Headers:</strong> ${esc(headers)}<br>`;

    if (emptyRows > 0) {
      review += `<strong>Note:</strong> ${emptyRows} empty row(s) detected — these will be preserved in the conversion.<br>`;
    }

    if (totalRows > 1000) {
      review += `<strong>Large file:</strong> This file has ${totalRows} rows. Conversion may take a moment.<br>`;
    }

    review += `<strong>Ready:</strong> File is valid and ready for conversion to CSV or TXT format.`;

    $('#aiReview').hidden = false;
    $('#aiReviewBody').innerHTML = review;
  }

  function convertFile() {
    if (!state.workbook) return;

    const wb = state.workbook;
    const sheetName = wb.SheetNames[state.selectedSheet];
    const sheet = wb.Sheets[sheetName];
    const format = document.querySelector('input[name="format"]:checked').value;

    let output = '';
    let mimeType = '';
    let fileExt = '';

    if (format === 'csv') {
      output = XLSX.utils.sheet_to_csv(sheet);
      mimeType = 'text/csv;charset=utf-8;';
      fileExt = '.csv';
    } else {
      output = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
      mimeType = 'text/plain;charset=utf-8;';
      fileExt = '.txt';
    }

    // Download
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.fileName.replace(/\.(xlsx|xls)$/i, '') + fileExt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function resetConverter() {
    state.workbook = null;
    state.fileName = '';
    state.selectedSheet = 0;
    state.sheetData = null;

    $('#uploadZone').hidden = false;
    $('#filePreview').hidden = true;
    $('#aiReview').hidden = true;
    $('#previewTableWrap').hidden = true;
    $('#sheetSelector').hidden = true;
    $('#fileInput').value = '';
  }

  /* ---- Knowledge Base ---- */
  function initKnowledgeBase() {
    const grid = $('#knowledgeGrid');
    const allItems = [...KB.policies, ...KB.playbooks, ...KB.precedents, ...KB.wiki];

    allItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'kb-card';

      const typeLabel = {
        policy: 'Approved Policy',
        playbook: 'Validated Playbook',
        precedent: 'CRM Precedent',
        wiki: 'Internal Wiki'
      }[item.type];

      const statusText = item.status || item.outcome || '';

      card.innerHTML = `
        <div class="kb-card-header">
          <span class="kb-type-tag ${item.type}">${esc(typeLabel)}</span>
          ${statusText ? `<span class="kb-status">${esc(statusText)}</span>` : ''}
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.content.substring(0, 160))}${item.content.length > 160 ? '...' : ''}</p>
        <div class="kb-card-footer">
          ${item.id} ${item.region ? '· ' + item.region : ''} ${item.lastUpdated ? '· Updated ' + item.lastUpdated : ''}
        </div>`;

      grid.appendChild(card);
    });
  }

  /* ---- Capture Confirmed Practice ---- */
  function initCapture() {
    const btn = $('#captureBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const title = $('#captureTitle').value.trim();
      const summary = $('#captureSummary').value.trim();
      const keywords = $('#captureKeywords').value.trim();
      const type = document.querySelector('input[name="captureType"]:checked').value;

      if (!title || !summary) {
        alert('Please provide both a title and resolution summary.');
        return;
      }

      // Archive to state (in a real app this would persist)
      const entry = {
        id: 'ARCH-' + String(state.archivedPractices.length + 1).padStart(3, '0'),
        type: type === 'best-practice' ? 'playbook' : 'precedent',
        title: title,
        content: summary,
        tags: keywords.split(',').map(k => k.trim()).filter(Boolean),
        status: type === 'best-practice' ? 'Validated' : 'Workaround',
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      state.archivedPractices.push(entry);
      KB.playbooks.push(entry);

      // Show success, reset form
      $('#captureForm').hidden = true;
      $('#captureSuccess').hidden = false;

      setTimeout(() => {
        $('#captureForm').hidden = false;
        $('#captureSuccess').hidden = true;
        $('#captureTitle').value = '';
        $('#captureSummary').value = '';
        $('#captureKeywords').value = '';
      }, 3000);
    });
  }

  /* ---- Statutory Wiki ---- */
  function initStatutoryWiki() {
    const grid = $('#statutoryGrid');
    if (!grid) return;
    const items = window.STATUTORY_WIKI || [];

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'kb-card statutory-card';

      card.innerHTML = `
        <div class="kb-card-header">
          <span class="kb-type-tag statutory">${esc(item.country)}</span>
          <span class="kb-status">${esc(item.status)}</span>
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.content.substring(0, 180))}${item.content.length > 180 ? '...' : ''}</p>
        <div class="kb-card-footer">
          ${esc(item.id)} · ${esc(item.category)} · Updated ${esc(item.lastUpdated)}
        </div>`;

      grid.appendChild(card);
    });
  }

  /* ---- Team Conversation Panel ---- */
  function initTeamPanel() {
    const TC = window.TEAM_CONVERSATION;
    if (!TC) return;

    const container = $('#panelMessages');
    if (!container) return;

    TC.messages.forEach((msg, idx) => {
      const person = TC.people[msg.person];
      const el = document.createElement('div');

      if (msg.isRecommendation) {
        el.className = 'panel-msg panel-msg-ai';
        el.innerHTML = `
          <div class="panel-msg-head">
            <span class="panel-av" style="background:${person.color}">${esc(person.initials)}</span>
            <span class="panel-name">${esc(person.name)}</span>
            <span class="panel-badge">AI</span>
            <span class="panel-time">${esc(msg.time)}</span>
          </div>
          <div class="panel-rec">
            <div class="panel-rec-title">${esc(msg.title)}</div>
            <div class="panel-rec-body">${esc(msg.body)}</div>
            <div class="panel-rec-step"><strong>Next step:</strong> ${esc(msg.nextStep)}</div>
            <div class="panel-rec-meta">
              <span class="panel-conf">Confidence: ${Math.round(msg.confidence * 100)}%</span>
              <span class="panel-cite">${msg.citations.length} sources cited</span>
            </div>
          </div>
          <div class="panel-msg-actions">
            <button class="approve-btn" data-idx="${idx}" data-type="best-practice">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Approve as Best Practice
            </button>
          </div>`;
      } else {
        el.className = 'panel-msg';
        el.innerHTML = `
          <div class="panel-msg-head">
            <span class="panel-av" style="background:${person.color}">${esc(person.initials)}</span>
            <span class="panel-name">${esc(person.name)}</span>
            <span class="panel-role">${esc(person.role)}</span>
            <span class="panel-time">${esc(msg.time)}</span>
          </div>
          <div class="panel-msg-body">${esc(msg.body)}</div>
          <div class="panel-msg-actions">
            <button class="approve-btn" data-idx="${idx}" data-type="confirmed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Confirm as Approved Practice
            </button>
          </div>`;
      }

      container.appendChild(el);
    });

    // Wire up approve buttons
    container.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const msg = TC.messages[idx];
        const person = TC.people[msg.person];

        // Archive the message content
        const entry = {
          id: 'ARCH-' + String(state.archivedPractices.length + 1).padStart(3, '0'),
          type: 'playbook',
          title: msg.isRecommendation ? msg.title : `Confirmed practice from ${person.name}`,
          content: msg.isRecommendation ? `${msg.body} Next step: ${msg.nextStep}` : msg.body,
          tags: ['team-confirmed', 'conversation-sourced'],
          status: 'Validated — Team Confirmed',
          lastUpdated: new Date().toISOString().split('T')[0],
        };

        state.archivedPractices.push(entry);
        KB.playbooks.push(entry);

        // Visual feedback
        btn.disabled = true;
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Archived to Knowledge Base`;
        btn.classList.add('approved');
      });
    });
  }

  /* ---- Initialize ---- */
  function init() {
    initNav();
    initAsk();
    initCapture();
    initConverter();
    initKnowledgeBase();
    initStatutoryWiki();
    initTeamPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
