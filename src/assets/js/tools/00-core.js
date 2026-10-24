/* Utilityra tool framework — declarative tools, bilingual, no dependencies. */
(function () {
  'use strict';
  const REG = {};
  const CFG = window.UTILITYRA || {};
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const t = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (ar, en) => `<span class="ar">${ar}</span><span class="en">${en}</span>`;
  const Lp = (pair) => L(esc(pair[0]), esc(pair[1]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- field helpers ---------- */
  const ta = (id, ar, en, o) => Object.assign({ id, type: 'textarea', label: [ar, en], rows: 8, value: '' }, o);
  const tx = (id, ar, en, o) => Object.assign({ id, type: 'text', label: [ar, en], value: '' }, o);
  const nm = (id, ar, en, value, o) => Object.assign({ id, type: 'number', label: [ar, en], value }, o);
  const sel = (id, ar, en, choices, value, o) => Object.assign({ id, type: 'select', label: [ar, en], choices, value: value == null ? choices[0][0] : value }, o);
  const ck = (id, ar, en, value) => ({ id, type: 'checkbox', label: [ar, en], value: !!value });
  const fl = (id, ar, en, o) => Object.assign({ id, type: 'file', label: [ar, en] }, o);

  /* ---------- utilities ---------- */
  function copyText(s) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s).catch(() => legacyCopy(s));
    legacyCopy(s);
    return Promise.resolve();
  }
  function legacyCopy(s) {
    const a = document.createElement('textarea');
    a.value = s; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    a.remove();
  }
  function download(name, data, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[data-lib="${src}"]`)) return res();
      const s = document.createElement('script'); s.src = src; s.dataset.lib = src;
      s.onload = () => res(); s.onerror = () => rej(new Error('LIB_LOAD'));
      document.head.appendChild(s);
    });
  }
  const fmtNum = (n, d) => (Number.isFinite(n) ? n.toLocaleString(lang() === 'en' ? 'en-US' : 'ar-EG-u-nu-latn', { maximumFractionDigits: d == null ? 4 : d }) : '—');
  const money = (n) => fmtNum(n, 2);
  const bytes = (n) => { const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; } return (i ? n.toFixed(2) : n) + ' ' + u[i]; };
  function readFileAs(file, how) {
    return new Promise((res, rej) => {
      const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error);
      how === 'text' ? r.readAsText(file) : how === 'dataurl' ? r.readAsDataURL(file) : r.readAsArrayBuffer(file);
    });
  }
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => res(img); img.onerror = () => rej(new Error('BAD_IMAGE')); img.src = url;
    });
  }
  function canvasBlob(canvas, type, q) { return new Promise((res) => canvas.toBlob(res, type, q)); }

  /* ---------- tiny markdown -> html (escapes first; safe) ---------- */
  function md(src) {
    const blocks = []; let s = String(src || '').replace(/\r\n?/g, '\n');
    s = s.replace(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g, (m, lng, code) => { blocks.push('<pre><code>' + esc(code.replace(/\n$/, '')) + '</code></pre>'); return '\u0000B' + (blocks.length - 1) + '\u0000'; });
    const inline = (x) => esc(x)
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    const out = []; let list = null;
    const close = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    s.split('\n').forEach((line) => {
      let m;
      if ((m = line.match(/^\u0000B(\d+)\u0000$/))) { close(); out.push(blocks[+m[1]]); }
      else if (/^\s*\|.*\|\s*$/.test(line)) { close(); out.push('\u0000T' + line); }
      else if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { close(); out.push(`<h${m[1].length + 2}>${inline(m[2])}</h${m[1].length + 2}>`); }
      else if ((m = line.match(/^\s*[-*+]\s+(.*)$/))) { if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = line.match(/^>\s?(.*)$/))) { close(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); }
      else if (/^---+$/.test(line.trim())) { close(); out.push('<hr>'); }
      else if (line.trim() === '') { close(); }
      else { close(); out.push('<p>' + inline(line) + '</p>'); }
    });
    close();
    // group table rows
    const res = []; let rows = [];
    const flushT = () => { if (!rows.length) return; const cells = (r) => r.replace(/^\s*\||\|\s*$/g, '').split('|').map((c) => inline(c.trim()));
      const hasSep = rows.length > 1 && /^[\s|:-]+$/.test(rows[1]);
      const head = hasSep ? rows[0] : null, body = hasSep ? rows.slice(2) : rows;
      res.push('<table>' + (head ? '<thead><tr>' + cells(head).map((c) => '<th>' + c + '</th>').join('') + '</tr></thead>' : '') + '<tbody>' + body.map((r) => '<tr>' + cells(r).map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>'); rows = []; };
    out.forEach((l) => { if (l.startsWith('\u0000T')) rows.push(l.slice(2)); else { flushT(); res.push(l); } }); flushT();
    return res.join('\n');
  }

  /* ---------- AI client ---------- */
  function aiErrorMessage(status, code) {
    if (status === 404 || status === 405 || status === 0) return t('خدمة الذكاء الاصطناعي غير متصلة بهذا الموقع بعد. تحتاج إلى نشر Worker على Cloudflare (راجع README).', 'The AI service is not connected to this site yet. Deploy the Cloudflare Worker (see README).');
    if (status === 429) return t('عدد الطلبات كبير. انتظر دقيقة ثم أعد المحاولة.', 'Too many requests. Wait a minute and try again.');
    if (status === 503 || code === 'PROVIDER_NOT_CONFIGURED') return t('مزوّد الذكاء الاصطناعي غير مفعّل في الخادم.', 'No AI provider is configured on the server.');
    if (status === 413) return t('النص طويل جدًا. قلّصه وأعد المحاولة.', 'The text is too long. Shorten it and try again.');
    if (status === 400) return t('المدخلات غير صالحة. تأكد من كتابة النص المطلوب.', 'Invalid input. Make sure you entered the required text.');
    return t('تعذّر الحصول على إجابة الآن. حاول مرة أخرى.', 'Could not get an answer right now. Please try again.');
  }
  async function ai(body) {
    let r;
    try {
      r = await fetch((CFG.apiBase || '') + '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ lang: lang() }, body)) });
    } catch (e) { throw new Error(aiErrorMessage(0)); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(aiErrorMessage(r.status, j.error));
    return j.answer || '';
  }

  async function aiStream(body, onDelta, onSources) {
    let r;
    try { r = await fetch((CFG.apiBase || '') + '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ lang: lang(), stream: true }, body)) }); } catch (e) { throw new Error(aiErrorMessage(0)); }
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || ct.includes('application/json')) {
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(aiErrorMessage(r.status, j.error));
      if (j.sources && onSources) onSources(j.sources); onDelta(j.answer || '', true); return j.answer || '';
    }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', full = '';
    for (;;) {
      const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf('\n\n')) >= 0) {
        const ev = buf.slice(0, i); buf = buf.slice(i + 2);
        for (const line of ev.split('\n')) { if (!line.startsWith('data:')) continue; const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue; try { const j = JSON.parse(d); if (j.sources && onSources) onSources(j.sources); if (typeof j.response === 'string' && j.response) { full += j.response; onDelta(full, false); } } catch (e) { /* ignore partial */ } }
      }
    }
    if (!full) throw new Error(aiErrorMessage(502));
    onDelta(full, true); return full;
  }

  /* ---------- field rendering ---------- */
  function fieldHTML(f, uid) {
    const id = uid + '-' + f.id;
    const label = f.label ? `<label for="${id}">${Lp(f.label)}</label>` : '';
    const hint = f.hint ? `<small class="hint">${Lp(f.hint)}</small>` : '';
    const ph = f.ph ? `placeholder="${esc(f.ph[lang() === 'en' ? 1 : 0])}" data-ph-ar="${esc(f.ph[0])}" data-ph-en="${esc(f.ph[1])}"` : '';
    const mono = f.mono ? ' mono' : '';
    const dir = f.mono ? 'dir="ltr"' : 'dir="auto"';
    let c = '';
    switch (f.type) {
      case 'textarea': c = `<textarea id="${id}" data-f="${f.id}" rows="${f.rows || 8}" ${ph} ${dir} class="${mono}" spellcheck="false">${esc(f.value)}</textarea>`; break;
      case 'text': c = `<input id="${id}" data-f="${f.id}" type="text" value="${esc(f.value)}" ${ph} ${dir} class="${mono}" autocomplete="off">`; break;
      case 'password': c = `<input id="${id}" data-f="${f.id}" type="password" value="${esc(f.value)}" ${ph} dir="ltr" class="mono" autocomplete="off">`; break;
      case 'number': c = `<input id="${id}" data-f="${f.id}" type="number" inputmode="decimal" value="${esc(f.value)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} step="${f.step || 'any'}" ${ph} dir="ltr">`; break;
      case 'range': c = `<input id="${id}" data-f="${f.id}" type="range" value="${esc(f.value)}" min="${f.min}" max="${f.max}" step="${f.step || 1}"><output>${esc(f.value)}</output>`; break;
      case 'date': c = `<input id="${id}" data-f="${f.id}" type="date" value="${esc(f.value)}" dir="ltr">`; break;
      case 'datetime': c = `<input id="${id}" data-f="${f.id}" type="datetime-local" value="${esc(f.value)}" dir="ltr">`; break;
      case 'color': c = `<input id="${id}" data-f="${f.id}" type="color" value="${esc(f.value)}">`; break;
      case 'file': c = `<input id="${id}" data-f="${f.id}" type="file" ${f.accept ? `accept="${f.accept}"` : ''} ${f.multiple ? 'multiple' : ''}>`; break;
      case 'select': c = `<select id="${id}" data-f="${f.id}">${f.choices.map((o) => `<option value="${esc(o[0])}" data-ar="${esc(o[1])}" data-en="${esc(o[2])}" ${String(o[0]) === String(f.value) ? 'selected' : ''}>${esc(o[lang() === 'en' ? 2 : 1])}</option>`).join('')}</select>`; break;
      case 'checkbox': return `<div class="fld fld-checkbox"><label class="ck"><input id="${id}" data-f="${f.id}" type="checkbox" ${f.value ? 'checked' : ''}> <span>${Lp(f.label)}</span></label></div>`;
      default: c = '';
    }
    const full = f.type === 'textarea' || f.wide ? ' full' : '';
    return `<div class="fld fld-${f.type}${full}">${label}${c}${hint}</div>`;
  }
  function readValues(root, fields) {
    const v = {};
    fields.forEach((f) => {
      const el = $(`[data-f="${f.id}"]`, root); if (!el) return;
      if (f.type === 'checkbox') v[f.id] = el.checked;
      else if (f.type === 'number' || f.type === 'range') v[f.id] = el.value === '' ? NaN : Number(el.value);
      else if (f.type === 'file') v[f.id] = Array.from(el.files || []);
      else v[f.id] = el.value;
    });
    return v;
  }
  function setValues(root, fields, vals) {
    Object.keys(vals).forEach((k) => {
      const el = $(`[data-f="${k}"]`, root); if (!el) return;
      if (el.type === 'checkbox') el.checked = !!vals[k]; else el.value = vals[k];
      const o = el.nextElementSibling; if (o && o.tagName === 'OUTPUT') o.textContent = el.value;
    });
  }

  /* ---------- result rendering ---------- */
  function renderResult(box, res, d) {
    box.innerHTML = '';
    if (res == null) return;
    if (typeof res === 'string') res = { text: res };
    if (Array.isArray(res)) res = { cards: res };
    if (res.error) { box.innerHTML = `<p class="tool-status err" role="alert">${esc(res.error)}</p>`; return; }
    let html = '';
    if (res.note) html += `<p class="tool-status">${esc(res.note)}</p>`;
    if (res.cards && res.cards.length) {
      html += '<div class="cards">' + res.cards.map((c, i) => `<div class="rc"><span class="rc-l">${L(esc(c[0]), esc(c[1]))}</span><b class="rc-v" dir="auto">${esc(c[2])}</b><button type="button" class="mini" data-copy-card="${i}" aria-label="copy">⧉</button></div>`).join('') + '</div>';
    }
    if (res.html) html += `<div class="rich">${res.html}</div>`;
    if (res.md != null) html += `<div class="rich md" dir="auto">${md(res.md)}</div>`;
    if (res.text != null) {
      const o = d.out || {};
      html += `<div class="fld full"><label>${Lp(o.label || ['النتيجة', 'Result'])}</label><textarea readonly class="out-text${o.mono === false ? '' : ' mono'}" rows="${o.rows || 10}" dir="${o.dir || 'auto'}" spellcheck="false">${esc(res.text)}</textarea></div>`;
    }
    const copyVal = res.copy != null ? res.copy : res.text != null ? res.text : res.md != null ? res.md : null;
    const dls = res.downloads || (res.download ? [res.download] : []);
    if (copyVal != null || dls.length) {
      html += '<div class="btnrow">';
      if (copyVal != null) html += `<button type="button" class="btn" data-act="copy">${L('نسخ', 'Copy')}</button>`;
      if (res.text != null || res.md != null) html += `<button type="button" class="btn ghost" data-act="dl">${L('تنزيل', 'Download')}</button>`;
      dls.forEach((dl, i) => { html += `<button type="button" class="btn" data-dl="${i}">${Lp(dl.label || ['تنزيل الملف', 'Download file'])}</button>`; });
      html += '</div>';
    }
    box.innerHTML = html;
    $$('[data-copy-card]', box).forEach((b) => b.addEventListener('click', () => { copyText(res.cards[+b.dataset.copyCard][2]); flash(b); }));
    const bind = (sel, fn) => { const b = $(sel, box); if (b) b.addEventListener('click', () => fn(b)); };
    bind('[data-act="copy"]', (b) => { copyText(copyVal); flash(b); });
    bind('[data-act="dl"]', () => download((d.out && d.out.name) || 'utilityra-result.' + ((d.out && d.out.ext) || 'txt'), res.text != null ? res.text : res.md));
    $$('[data-dl]', box).forEach((b) => b.addEventListener('click', () => download(dls[+b.dataset.dl].name, dls[+b.dataset.dl].blob)));
    if (res.after) res.after(box);
  }
  function flash(b) { const o = b.innerHTML; b.classList.add('ok'); b.textContent = '✓'; setTimeout(() => { b.classList.remove('ok'); b.innerHTML = o; }, 900); }

  /* ---------- tool mounting ---------- */
  let uidN = 0;
  const H = { lang, t, esc, L, Lp, $, $$, copy: copyText, download, loadScript, fmtNum, money, bytes, readFileAs, loadImage, canvasBlob, md, ai, aiStream, ta, tx, nm, sel, ck, fl, base: CFG.assetBase || '/assets/' };

  function mount(root, id) {
    const d = REG[id];
    if (!d) { root.innerHTML = '<p class="tool-status err">Tool not found.</p>'; return; }
    const uid = 't' + (++uidN);
    if (d.mount) { d.mount(root, H); return; }
    const fields = d.fields || [];
    const live = d.live !== false && !d.button;
    root.innerHTML = `<div class="tool-grid${d.layout ? ' ' + d.layout : ''}">
      <form class="tool-in" novalidate onsubmit="return false">${fields.map((f) => fieldHTML(f, uid)).join('')}
        <div class="btnrow">
          ${live ? '' : `<button type="button" class="btn primary" data-run>${Lp(d.button || ['تنفيذ', 'Run'])}</button>`}
          ${(d.actions || []).map((a, i) => `<button type="button" class="btn" data-action="${i}">${Lp(a.label)}</button>`).join('')}
          ${d.sample ? `<button type="button" class="btn ghost" data-sample>${L('جرّب مثالًا', 'Try an example')}</button>` : ''}
          <button type="button" class="btn ghost" data-reset>${L('مسح', 'Clear')}</button>
        </div>
      </form>
      <div class="tool-out"><div class="out" aria-live="polite"></div></div></div>`;
    const form = $('.tool-in', root), out = $('.out', root);
    let token = 0, timer = null;
    async function run(fn) {
      const my = ++token;
      const vals = readValues(form, fields);
      out.classList.add('busy');
      let res;
      try { res = await (fn || d.run)(vals, H); } catch (e) { res = { error: e && e.message ? e.message : String(e) }; }
      if (my !== token) return;
      out.classList.remove('busy');
      renderResult(out, res, d);
    }
    if (live) {
      const sched = () => { clearTimeout(timer); timer = setTimeout(() => run(), 140); };
      form.addEventListener('input', sched); form.addEventListener('change', sched);
    } else {
      $('[data-run]', form).addEventListener('click', () => run());
    }
    $$('input[type=range]', form).forEach((r) => r.addEventListener('input', () => { r.nextElementSibling.textContent = r.value; }));
    $$('[data-action]', form).forEach((b) => b.addEventListener('click', () => run(d.actions[+b.dataset.action].fn)));
    const sm = $('[data-sample]', form);
    if (sm) sm.addEventListener('click', () => { setValues(form, fields, d.sample); run(); });
    $('[data-reset]', form).addEventListener('click', () => {
      fields.forEach((f) => { const el = $(`[data-f="${f.id}"]`, form); if (!el) return; if (f.type === 'checkbox') el.checked = !!f.value; else if (f.type === 'file') el.value = ''; else el.value = f.value == null ? '' : f.value; });
      token++; out.innerHTML = ''; if (live) run();
    });
    if (live) run();
  }

  window.UT = { REG, H, def: (id, d) => { REG[id] = d; }, mount, renderResult };
})();
