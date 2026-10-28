(function () {
  const { ta, tx, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return (h ? pad(h) + ':' : '') + pad(m) + ':' + pad(s % 60); };
  const beep = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, 0.25, 0.5].forEach((d) => { const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(a.currentTime + d); o.stop(a.currentTime + d + 0.15); }); } catch (e) { /* audio unavailable */ } };

  /* ---------- morse ---------- */
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.', '-': '-....-', ':': '---...', "'": '.----.', '(': '-.--.', ')': '-.--.-' };
  const UNMORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
  def('morse-code', {
    fields: [sel('m', 'الاتجاه', 'Direction', [['enc', 'نص ← مورس', 'Text → Morse'], ['dec', 'مورس ← نص', 'Morse → Text']]), ta('t', 'المدخل', 'Input', { rows: 6, mono: true, ph: ['اكتب بالإنجليزية (A-Z وأرقام)', 'Type text, or Morse with spaces between letters and / between words'] })],
    sample: { m: 'enc', t: 'SOS Utilityra' },
    note: ['يدعم الحروف اللاتينية والأرقام وعلامات الترقيم الشائعة.', 'Supports Latin letters, digits and common punctuation.'],
    run(v, h) {
      if (!v.t.trim()) return null;
      if (v.m === 'enc') { const out = v.t.toUpperCase().split(/\s+/).filter(Boolean).map((w) => Array.from(w).map((c) => MORSE[c]).filter(Boolean).join(' ')).join(' / '); return out || { error: h.t('لا توجد أحرف مدعومة.', 'No supported characters.') }; }
      return v.t.trim().split(/\s*\/\s*|\s{3,}/).map((w) => w.trim().split(/\s+/).map((c) => UNMORSE[c] || '?').join('')).join(' ');
    }
  });

  /* ---------- roman numerals ---------- */
  const ROM = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  def('roman-numerals', {
    fields: [tx('v', 'رقم أو رقم روماني', 'Number or Roman numeral', { ph: ['مثال: 2026 أو MMXXVI', 'e.g. 2026 or MMXXVI'], dir: 'ltr' })],
    sample: { v: '2026' },
    run(v, h) {
      const s = v.v.trim().toUpperCase(); if (!s) return null;
      if (/^\d+$/.test(s)) { let n = parseInt(s, 10); if (n < 1 || n > 3999) return { error: h.t('أدخل رقمًا بين 1 و3999.', 'Enter a number from 1 to 3999.') }; let r = ''; for (const [a, b] of ROM) while (n >= a) { r += b; n -= a; } return r; }
      if (!/^[MDCLXVI]+$/.test(s)) return { error: h.t('مدخل غير صالح.', 'Invalid input.') };
      let n = 0; for (let i = 0; i < s.length; i++) { const a = ROM.find((x) => x[1] === s[i])[0], b = (ROM.find((x) => x[1] === s[i + 1]) || [0])[0]; n += a < b ? -a : a; }
      let back = ''; let m = n; for (const [a, b] of ROM) while (m >= a) { back += b; m -= a; }
      return back === s ? String(n) : { error: h.t('رقم روماني غير صحيح التركيب.', 'Not a well-formed Roman numeral.') };
    }
  });

  /* ---------- text <-> binary / hex ---------- */
  def('text-binary', {
    fields: [sel('m', 'التحويل', 'Conversion', [['t2b', 'نص ← ثنائي', 'Text → Binary'], ['b2t', 'ثنائي ← نص', 'Binary → Text'], ['t2h', 'نص ← Hex', 'Text → Hex'], ['h2t', 'Hex ← نص', 'Hex → Text']]), ta('t', 'المدخل', 'Input', { rows: 6, mono: true })],
    sample: { m: 't2b', t: 'Utilityra' },
    run(v, h) {
      if (!v.t.trim()) return null; const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
      try {
        if (v.m === 't2b') return Array.from(enc.encode(v.t)).map((b) => b.toString(2).padStart(8, '0')).join(' ');
        if (v.m === 't2h') return Array.from(enc.encode(v.t)).map((b) => pad(b.toString(16))).join(' ');
        const parts = v.t.trim().split(/[\s,]+/).filter(Boolean); const base = v.m === 'b2t' ? 2 : 16;
        if (parts.some((p) => !(base === 2 ? /^[01]{1,8}$/ : /^[0-9a-fA-F]{1,2}$/).test(p))) return { error: h.t('تحقق من الصيغة: بايتات مفصولة بمسافات.', 'Check the format: space-separated bytes.') };
        return dec.decode(Uint8Array.from(parts.map((p) => parseInt(p, base))));
      } catch (e) { return { error: h.t('تعذّر فك الترميز.', 'Could not decode.') }; }
    }
  });

  /* ---------- random picker ---------- */
  def('random-picker', {
    button: ['اختر عشوائيًا', 'Pick randomly'],
    fields: [ta('items', 'القائمة (عنصر في كل سطر)', 'Items (one per line)', { rows: 8, ph: ['أحمد\nسارة\nمحمد', 'Alice\nBob\nCarol'] }), nm('n', 'عدد المختارين', 'How many', 1, { min: 1, max: 100 }), ck('uniq', 'بدون تكرار', 'No repeats', true)],
    sample: { items: 'Ahmed\nSara\nMohamed\nLayla', n: 2, uniq: true },
    run(v, h) {
      const items = v.items.split('\n').map((x) => x.trim()).filter(Boolean); if (!items.length) return null;
      let n = Math.max(1, Math.min(100, Math.floor(Number(v.n) || 1))); if (v.uniq) n = Math.min(n, items.length);
      const rnd = (k) => { const a = new Uint32Array(1); const lim = Math.floor(4294967296 / k) * k; do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % k; };
      const pool = items.slice(), out = [];
      for (let i = 0; i < n; i++) { const j = rnd(pool.length); out.push(pool[j]); if (v.uniq) pool.splice(j, 1); }
      return { text: out.join('\n'), note: h.t(`اختير ${out.length} من ${items.length}`, `Picked ${out.length} of ${items.length}`), out: { rows: Math.min(10, out.length + 1) } };
    }
  });

  /* ---------- invoice ---------- */
  def('invoice-generator', {
    layout: 'stack', button: ['أنشئ الفاتورة', 'Build invoice'],
    fields: [tx('from', 'من (اسمك / شركتك)', 'From (you / your company)', { value: 'Utilityra Studio' }), tx('to', 'إلى (العميل)', 'Bill to (client)', { value: 'Client Name' }), tx('no', 'رقم الفاتورة', 'Invoice no.', { value: 'INV-001' }), tx('cur', 'العملة', 'Currency', { value: 'EGP' }), nm('tax', 'الضريبة %', 'Tax %', 14, { min: 0, max: 100 }),
      ta('lines', 'البنود: الوصف | الكمية | السعر (سطر لكل بند)', 'Lines: description | qty | price (one per line)', { rows: 6, mono: true, value: 'Website design | 1 | 5000\nHosting (12 months) | 1 | 1200\nExtra pages | 3 | 400' })],
    run(v, h) {
      const rows = v.lines.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((r) => r[0]);
      if (!rows.length) return null; let sub = 0;
      const body = rows.map((r) => { const q = Number(r[1]) || 0, p = Number(r[2]) || 0, t = q * p; sub += t; return `<tr><td>${esc(r[0])}</td><td>${q}</td><td>${p.toFixed(2)}</td><td>${t.toFixed(2)}</td></tr>`; }).join('');
      const tax = sub * (Math.max(0, Number(v.tax) || 0) / 100), total = sub + tax, c = esc(v.cur);
      const html = `<div class="invoice" dir="auto"><h3>${h.t('فاتورة', 'Invoice')} ${esc(v.no)}</h3><p>${h.t('من', 'From')}: <b>${esc(v.from)}</b><br>${h.t('إلى', 'To')}: <b>${esc(v.to)}</b><br>${new Date().toLocaleDateString()}</p><div class="tblwrap"><table class="tbl"><thead><tr><th>${h.t('الوصف', 'Description')}</th><th>${h.t('الكمية', 'Qty')}</th><th>${h.t('السعر', 'Price')}</th><th>${h.t('الإجمالي', 'Total')}</th></tr></thead><tbody>${body}</tbody></table></div><p>${h.t('المجموع الفرعي', 'Subtotal')}: ${sub.toFixed(2)} ${c}<br>${h.t('الضريبة', 'Tax')}: ${tax.toFixed(2)} ${c}<br><b>${h.t('الإجمالي', 'Total')}: ${total.toFixed(2)} ${c}</b></p><button type="button" class="btn" onclick="window.print()">${h.t('طباعة / حفظ PDF', 'Print / save as PDF')}</button></div>`;
      return { html, copy: `${v.no}\n${v.from} -> ${v.to}\n${rows.map((r) => r.join(' | ')).join('\n')}\nSubtotal ${sub.toFixed(2)} ${v.cur}\nTax ${tax.toFixed(2)}\nTotal ${total.toFixed(2)} ${v.cur}` };
    }
  });

  /* ---------- timers (custom UI) ---------- */
  const clockUI = (root, h, { title, stateHtml }) => root;
  def('countdown-timer', {
    mount(root, h) {
      root.innerHTML = `<div class="tool-grid stack"><form class="tool-in" onsubmit="return false"><div class="fld"><label>${h.L('الدقائق', 'Minutes')}</label><input id="cd-m" type="number" min="0" max="999" value="5"></div><div class="fld"><label>${h.L('الثواني', 'Seconds')}</label><input id="cd-s" type="number" min="0" max="59" value="0"></div>
      <div class="btnrow"><button class="btn primary" id="cd-go" type="button" data-run>${h.L('ابدأ', 'Start')}</button><button class="btn" id="cd-pause" type="button">${h.L('إيقاف مؤقت', 'Pause')}</button><button class="btn ghost" id="cd-reset" type="button">${h.L('إعادة', 'Reset')}</button></div></form>
      <div class="out"><p class="tool-time" id="cd-t" role="timer" aria-live="off" style="font:700 clamp(48px,12vw,96px) var(--sans);font-variant-numeric:tabular-nums;text-align:center;margin:12px 0" dir="ltr">05:00</p><p class="tool-status" id="cd-msg" role="status"></p></div></div>`;
      const $ = (s) => root.querySelector(s); let left = 300, end = 0, tid = 0, running = false;
      const draw = () => { $('#cd-t').textContent = fmt(left); document.title = (running ? fmt(left) + ' · ' : '') + document.title.replace(/^\d[\d:]* · /, ''); };
      const read = () => Math.min(999 * 60 + 59, (Math.max(0, +$('#cd-m').value || 0)) * 60 + Math.min(59, Math.max(0, +$('#cd-s').value || 0)));
      const stop = () => { clearInterval(tid); running = false; };
      const tick = () => { left = Math.ceil((end - Date.now()) / 1000); if (left <= 0) { left = 0; stop(); $('#cd-msg').textContent = h.t('انتهى الوقت!', 'Time is up!'); beep(); } draw(); };
      $('#cd-go').onclick = () => { if (!running) { if (left <= 0 || $('#cd-msg').textContent) left = read(); if (left <= 0) return; $('#cd-msg').textContent = ''; end = Date.now() + left * 1000; running = true; tid = setInterval(tick, 250); tick(); } };
      $('#cd-pause').onclick = () => { if (running) { stop(); draw(); } };
      $('#cd-reset').onclick = () => { stop(); left = read(); $('#cd-msg').textContent = ''; draw(); };
      ['#cd-m', '#cd-s'].forEach((s) => $(s).addEventListener('input', () => { if (!running) { left = read(); draw(); } }));
      left = read(); draw();
    }
  });

  def('pomodoro-timer', {
    mount(root, h) {
      const MODES = { focus: [25, h.t('تركيز', 'Focus')], short: [5, h.t('استراحة قصيرة', 'Short break')], long: [15, h.t('استراحة طويلة', 'Long break')] };
      root.innerHTML = `<div class="tool-grid stack"><div class="chips" id="pm-modes">${Object.entries(MODES).map(([k, v], i) => `<button type="button" class="chip${i ? '' : ' on'}" data-mode="${k}">${v[1]}</button>`).join('')}</div>
      <div class="out"><p id="pm-t" role="timer" aria-live="off" style="font:700 clamp(56px,14vw,110px) var(--sans);font-variant-numeric:tabular-nums;text-align:center;margin:8px 0" dir="ltr">25:00</p><p class="tool-status" id="pm-info" role="status"></p></div>
      <div class="btnrow"><button class="btn primary" id="pm-go" type="button" data-run>${h.L('ابدأ', 'Start')}</button><button class="btn" id="pm-pause" type="button">${h.L('إيقاف مؤقت', 'Pause')}</button><button class="btn ghost" id="pm-reset" type="button">${h.L('إعادة', 'Reset')}</button></div></div>`;
      const $ = (s) => root.querySelector(s); let mode = 'focus', left = 1500, end = 0, tid = 0, running = false, done = 0;
      const info = () => { $('#pm-info').textContent = h.t(`جلسات التركيز المكتملة اليوم: ${done}`, `Focus sessions completed: ${done}`); };
      const draw = () => { $('#pm-t').textContent = fmt(left); };
      const stop = () => { clearInterval(tid); running = false; };
      const set = (m) => { stop(); mode = m; left = MODES[m][0] * 60; root.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m)); draw(); };
      const tick = () => { left = Math.ceil((end - Date.now()) / 1000); if (left <= 0) { stop(); left = 0; beep(); if (mode === 'focus') { done++; info(); set(done % 4 === 0 ? 'long' : 'short'); } else set('focus'); return; } draw(); };
      $('#pm-go').onclick = () => { if (!running && left > 0) { end = Date.now() + left * 1000; running = true; tid = setInterval(tick, 250); } };
      $('#pm-pause').onclick = () => { stop(); };
      $('#pm-reset').onclick = () => set(mode);
      root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => set(b.dataset.mode)));
      info(); draw();
    }
  });

  /* ---------- typing speed test ---------- */
  const SENT_EN = ['The quick brown fox jumps over the lazy dog while the sun sets slowly behind the hills.', 'Good tools save time, and small habits turn into great results when you repeat them every day.', 'A clear mind and a steady rhythm will carry you further than speed without care.'];
  const SENT_AR = ['العلم نور والجهل ظلام، ومن جدّ وجد ومن زرع حصد، فاجتهد في يومك لتفرح بغدك.', 'الوقت كالسيف إن لم تقطعه قطعك، فاغتنم كل لحظة في ما ينفعك وينفع الناس من حولك.', 'خير الكلام ما قلّ ودلّ، وخير العمل ما دام وإن قلّ، فاحرص على الإتقان قبل السرعة.'];
  def('typing-speed-test', {
    mount(root, h) {
      const pick = () => { const a = h.lang() === 'ar' ? SENT_AR : SENT_EN; return a[Math.floor(Math.random() * a.length)]; };
      let text = pick(), start = 0, over = false;
      root.innerHTML = `<div class="tool-grid stack"><div class="fld full"><label>${h.L('اكتب النص التالي', 'Type the text below')}</label><p id="ty-ref" dir="auto" style="font-size:20px;line-height:2;padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--card)"></p><textarea id="ty-in" rows="3" dir="auto" autocomplete="off" spellcheck="false" aria-label="${h.t('منطقة الكتابة', 'Typing area')}"></textarea></div>
      <div class="btnrow"><button class="btn primary" id="ty-new" type="button" data-run>${h.L('نص جديد', 'New text')}</button></div><div class="out" id="ty-out" role="status" aria-live="polite"></div></div>`;
      const $ = (s) => root.querySelector(s); const ref = $('#ty-ref'), inp = $('#ty-in');
      const paint = (typed) => { ref.innerHTML = Array.from(text).map((c, i) => { const t = typed[i]; const cls = t == null ? '' : t === c ? 'color:var(--ok)' : 'color:var(--err);text-decoration:underline'; return `<span style="${cls}">${esc(c)}</span>`; }).join(''); };
      const reset = () => { text = pick(); start = 0; over = false; inp.value = ''; inp.disabled = false; $('#ty-out').innerHTML = ''; paint(''); };
      inp.addEventListener('input', () => {
        if (over) return; if (!start) start = Date.now(); const typed = inp.value; paint(typed);
        if (typed.length >= text.length) { over = true; inp.disabled = true; const mins = Math.max((Date.now() - start) / 60000, 1 / 600); let ok = 0; for (let i = 0; i < text.length; i++) if (typed[i] === text[i]) ok++;
          const acc = Math.round((ok / text.length) * 100), wpm = Math.round((ok / 5) / mins);
          UT.renderResult($('#ty-out'), { cards: [['السرعة (كلمة/دقيقة)', 'Speed (WPM)', String(wpm)], ['الدقة', 'Accuracy', acc + '%'], ['الوقت', 'Time', ((Date.now() - start) / 1000).toFixed(1) + 's']] }, {}); }
      });
      $('#ty-new').onclick = reset; reset();
    }
  });
})();
(function () {
  const { ta, nm, sel, ck, esc } = UT.H;
  const def = UT.def;
  const rnd = (k) => { const a = new Uint32Array(1); const lim = Math.floor(4294967296 / k) * k; do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % k; };
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  /* ---------- team splitter ---------- */
  def('team-splitter', {
    button: ['وزّع الفرق', 'Split teams'],
    fields: [ta('names', 'الأسماء (اسم في كل سطر)', 'Names (one per line)', { rows: 8, ph: ['أحمد\nسارة\nمحمد\nليلى', 'Alice\nBob\nCarol\nDan'] }), nm('n', 'عدد الفرق', 'Number of teams', 2, { min: 2, max: 20 })],
    sample: { names: 'Ahmed\nSara\nMohamed\nLayla\nOmar\nNour\nYoussef', n: 2 },
    run(v, h) {
      const names = lines(v.names); const n = Math.floor(Number(v.n) || 0);
      if (!names.length) return null;
      if (n < 2 || n > 20) return { error: h.t('عدد الفرق من 2 إلى 20.', 'Teams must be between 2 and 20.') };
      if (names.length < n) return { error: h.t('عدد الأسماء أقل من عدد الفرق.', 'There are fewer names than teams.') };
      for (let i = names.length - 1; i > 0; i--) { const j = rnd(i + 1); [names[i], names[j]] = [names[j], names[i]]; }
      const teams = Array.from({ length: n }, () => []); names.forEach((x, i) => teams[i % n].push(x));
      const html = `<div class="cards">${teams.map((t, i) => `<div class="rc"><span class="rc-l">${h.t('الفريق', 'Team')} ${i + 1}</span><b class="rc-v" dir="auto" style="white-space:pre-line">${esc(t.join('\n'))}</b></div>`).join('')}</div>`;
      return { html, copy: teams.map((t, i) => `${h.t('الفريق', 'Team')} ${i + 1}: ${t.join(', ')}`).join('\n') };
    }
  });

  /* ---------- dice & coin ---------- */
  def('dice-coin', {
    button: ['ارمِ', 'Roll'],
    fields: [{ id: 'm', type: 'select', label: ['الأداة', 'Tool'], choices: [['dice', 'نرد', 'Dice'], ['coin', 'عملة', 'Coin']], value: 'dice' }, nm('c', 'عدد النرد', 'Number of dice', 2, { min: 1, max: 12 }), nm('s', 'عدد أوجه النرد', 'Sides per die', 6, { min: 2, max: 100 })],
    sample: { m: 'dice', c: 2, s: 6 },
    run(v, h) {
      if (v.m === 'coin') { const r = rnd(2); return { cards: [['النتيجة', 'Result', r ? h.t('كتابة', 'Tails') : h.t('صورة', 'Heads')]] }; }
      const c = Math.max(1, Math.min(12, Math.floor(Number(v.c) || 1))), s = Math.max(2, Math.min(100, Math.floor(Number(v.s) || 6)));
      const rolls = Array.from({ length: c }, () => rnd(s) + 1);
      return { cards: [['النتائج', 'Rolls', rolls.join(' + ')], ['المجموع', 'Total', String(rolls.reduce((a, b) => a + b, 0))]] };
    }
  });

  /* ---------- spin the wheel ---------- */
  def('spin-wheel', {
    mount(root, h) {
      root.innerHTML = `<div class="tool-grid"><form class="tool-in" onsubmit="return false"><div class="fld full"><label for="sw-items">${h.L('الخيارات (واحد في كل سطر)', 'Options (one per line)')}</label><textarea id="sw-items" rows="9" dir="auto">${esc(h.lang() === 'ar' ? 'بيتزا\nشاورما\nكشري\nسوشي\nبرجر' : 'Pizza\nShawarma\nSushi\nBurgers\nSalad')}</textarea></div>
        <label class="ck"><input type="checkbox" id="sw-rm"> ${h.L('أزل الفائز بعد كل لفّة', 'Remove the winner after each spin')}</label>
        <div class="btnrow"><button type="button" class="btn primary" id="sw-go" data-run>${h.L('أدر العجلة', 'Spin')}</button></div></form>
        <div class="out" style="text-align:center"><canvas id="sw-c" width="420" height="420" role="img" aria-label="${h.t('عجلة الاختيار', 'Spinning wheel')}" style="max-width:100%;height:auto"></canvas><p class="tool-status" id="sw-res" role="status" aria-live="polite" style="font-size:20px;font-weight:700"></p></div></div>`;
      const $ = (s) => root.querySelector(s), cv = $('#sw-c'), ctx = cv.getContext('2d');
      const COL = ['#0B5D52', '#12806F', '#F4C430', '#2F6F9F', '#C8553D', '#6B8F3A', '#7A5CA8', '#D98E04'];
      let ang = 0, spinning = false;
      const items = () => lines($('#sw-items').value).slice(0, 60);
      const draw = () => {
        const it = items(), n = Math.max(it.length, 1), R = 200, cx = 210, cy = 210; ctx.clearRect(0, 0, 420, 420);
        for (let i = 0; i < n; i++) {
          const a0 = ang + (i * 2 * Math.PI) / n, a1 = ang + ((i + 1) * 2 * Math.PI) / n;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fillStyle = COL[i % COL.length]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          if (it[i]) { ctx.save(); ctx.translate(cx, cy); ctx.rotate((a0 + a1) / 2); ctx.fillStyle = COL[i % COL.length] === '#F4C430' ? '#2a2100' : '#fff'; ctx.font = '600 16px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(it[i].length > 18 ? it[i].slice(0, 17) + '…' : it[i], R - 14, 5); ctx.restore(); }
        }
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(420 - 4, cy - 14); ctx.lineTo(420 - 34, cy); ctx.lineTo(420 - 4, cy + 14); ctx.closePath(); ctx.fillStyle = '#11201C'; ctx.fill();
      };
      const spin = () => {
        const it = items(); if (it.length < 2 || spinning) { if (it.length < 2) $('#sw-res').textContent = h.t('أضف خيارين على الأقل.', 'Add at least two options.'); return; }
        spinning = true; $('#sw-res').textContent = '';
        const win = rnd(it.length), n = it.length, slice = (2 * Math.PI) / n;
        // pointer is at angle 0 (right side); land the middle of the winning slice there
        const target = -(win + 0.5) * slice + 2 * Math.PI * (5 + rnd(3)); const start = ang % (2 * Math.PI), t0 = performance.now(), dur = 4200;
        const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
        const fin = () => { ang = target; draw(); spinning = false; $('#sw-res').textContent = '🎉 ' + it[win]; if ($('#sw-rm').checked) { const left = it.filter((_, i) => i !== win); $('#sw-items').value = left.join('\n'); ang = 0; draw(); } };
        if (reduce) return fin();
        const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); ang = start + (target - start) * e; draw(); if (k < 1) requestAnimationFrame(step); else fin(); };
        requestAnimationFrame(step);
      };
      $('#sw-go').onclick = spin; $('#sw-items').addEventListener('input', () => { if (!spinning) { ang = 0; draw(); } }); draw();
    }
  });

  /* ---------- zakat ---------- */
  def('zakat-calculator', {
    fields: [nm('gold', 'سعر جرام الذهب عيار 24 (بعملتك)', 'Price of 1 g of 24k gold (your currency)', 3500, { min: 0 }), nm('cash', 'النقد والمدخرات', 'Cash and savings', 0, { min: 0 }), nm('goldg', 'وزن الذهب المدّخر (جرام عيار 24)', 'Saved gold (grams, 24k)', 0, { min: 0 }), nm('trade', 'قيمة عروض التجارة', 'Value of trade goods', 0, { min: 0 }), nm('debt', 'ديون مستحقة عليك حالّة', 'Debts you owe now', 0, { min: 0 })],
    sample: { gold: 3500, cash: 500000, goldg: 20, trade: 0, debt: 10000 },
    note: ['النصاب = 85 جرامًا من الذهب عيار 24، والنسبة 2.5% بعد مرور حول هجري كامل. هذه حاسبة إرشادية؛ للحالات الخاصة راجع جهة الفتوى.', 'Nisab = 85 g of 24k gold, rate 2.5% after a full lunar year. Indicative only; consult a scholar for special cases.'],
    run(v, h) {
      const net = (v.cash || 0) + (v.goldg || 0) * (v.gold || 0) + (v.trade || 0) - (v.debt || 0), nisab = 85 * (v.gold || 0);
      if (!(v.gold > 0)) return null;
      const due = net >= nisab && net > 0, z = due ? net * 0.025 : 0, f = (x) => Math.round(x).toLocaleString('en-US');
      return { cards: [['صافي المال الخاضع للزكاة', 'Net zakatable wealth', f(net)], ['النصاب', 'Nisab', f(nisab)], ['الزكاة المستحقة', 'Zakat due', due ? f(z) : '0'], ['الحالة', 'Status', due ? h.t('بلغ النصاب', 'Above nisab') : h.t('لم يبلغ النصاب', 'Below nisab')]] };
    }
  });

  /* ---------- calories ---------- */
  def('calorie-calculator', {
    fields: [sel('g', 'الجنس', 'Sex', [['m', 'ذكر', 'Male'], ['f', 'أنثى', 'Female']], 'm'), nm('a', 'العمر', 'Age', 30, { min: 10 }), nm('w', 'الوزن (كجم)', 'Weight (kg)', 70, { min: 20 }), nm('hg', 'الطول (سم)', 'Height (cm)', 175, { min: 100 }), sel('act', 'مستوى النشاط', 'Activity', [['1.2', 'خامل', 'Sedentary'], ['1.375', 'خفيف (1-3 أيام)', 'Light (1-3 d/wk)'], ['1.55', 'متوسط (3-5 أيام)', 'Moderate (3-5 d/wk)'], ['1.725', 'عالٍ (6-7 أيام)', 'High (6-7 d/wk)']], '1.375'), sel('goal', 'الهدف', 'Goal', [['lose', 'خسارة وزن', 'Lose weight'], ['keep', 'ثبات الوزن', 'Maintain'], ['gain', 'زيادة وزن', 'Gain weight']], 'keep')],
    sample: { g: 'm', a: 30, w: 70, hg: 175, act: '1.375', goal: 'keep' },
    note: ['تقدير بمعادلة Mifflin-St Jeor، وليس بديلًا عن استشارة مختص تغذية.', 'Estimate via the Mifflin-St Jeor equation; not a substitute for professional advice.'],
    run(v, h) {
      if (!(v.a > 0 && v.w > 0 && v.hg > 0)) return null;
      const bmr = 10 * v.w + 6.25 * v.hg - 5 * v.a + (v.g === 'm' ? 5 : -161), tdee = bmr * parseFloat(v.act), t = v.goal === 'lose' ? tdee - 500 : v.goal === 'gain' ? tdee + 400 : tdee;
      return { cards: [['معدل الحرق الأساسي', 'BMR', Math.round(bmr) + ' kcal'], ['احتياجك للثبات', 'Maintenance', Math.round(tdee) + ' kcal'], ['هدفك اليومي', 'Daily target', Math.round(Math.max(t, v.g === 'm' ? 1500 : 1200)) + ' kcal']] };
    }
  });

  /* ---------- tip & split ---------- */
  def('tip-calculator', {
    fields: [nm('b', 'قيمة الفاتورة', 'Bill amount', 500, { min: 0 }), nm('p', 'نسبة الإكرامية %', 'Tip %', 10, { min: 0 }), nm('n', 'عدد الأشخاص', 'People', 4, { min: 1 })],
    sample: { b: 500, p: 10, n: 4 },
    run(v, h) {
      if (!(v.b >= 0) || !(v.n >= 1)) return null;
      const tip = v.b * (v.p || 0) / 100, total = v.b + tip, f = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
      return { cards: [['الإكرامية', 'Tip', f(tip)], ['الإجمالي', 'Total', f(total)], ['نصيب كل شخص', 'Per person', f(total / Math.floor(v.n))]] };
    }
  });
})();
