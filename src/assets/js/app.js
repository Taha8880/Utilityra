/* Utilityra site shell: theme, language, search, filters, 3D carousel, hero demo. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = () => (root.lang === 'en' ? 'en' : 'ar');

  /* ---------- language + theme ---------- */
  function applyLang(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr'; store.set('ur-lang', l);
    $$('[data-ar][data-en]').forEach((e) => { e.textContent = e.dataset[l]; });
    $$('[data-ph-ar]').forEach((e) => { e.placeholder = l === 'en' ? e.dataset.phEn : e.dataset.phAr; });
    const t = $('#doc-title'); if (t && t.dataset[l]) document.title = t.dataset[l];
    const lb = $('#lang-btn'); if (lb) lb.textContent = l === 'ar' ? 'EN' : 'عربي';
    if (window.__relayout) window.__relayout();
  }
  $('#lang-btn') && $('#lang-btn').addEventListener('click', () => applyLang(lang() === 'ar' ? 'en' : 'ar'));
  applyLang(lang());
  function applyTheme(t) { if (t) { root.dataset.theme = t; store.set('ur-theme', t); } }
  $('#theme-btn') && $('#theme-btn').addEventListener('click', () => { const cur = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); applyTheme(cur === 'dark' ? 'light' : 'dark'); });
  const burger = $('#burger'), nav = $('#nav'); if (burger) burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });

  /* sticky header on home */
  const hdr = $('.hdr'); if (hdr && document.body.classList.contains('home')) { const f = () => hdr.classList.toggle('stuck', scrollY > 40); addEventListener('scroll', f, { passive: true }); f(); }

  /* ---------- search ---------- */
  const IDX = window.UT_INDEX || [];
  const norm = (s) => String(s).toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
  const rows = IDX.map((t) => ({ t, key: norm([t[3], t[4], t[5], t[6], t[0].replace(/-/g, ' ')].join(' ')), nameKey: norm(t[3] + ' ' + t[4] + ' ' + t[0].replace(/-/g, ' ')) }));
  function search(q, limit) {
    const toks = norm(q).split(/\s+/).filter(Boolean); if (!toks.length) return [];
    return rows.map((r) => { let s = 0; for (const k of toks) { if (r.nameKey.startsWith(k)) s += 6; else if (r.nameKey.includes(' ' + k)) s += 4; else if (r.nameKey.includes(k)) s += 3; else if (r.key.includes(k)) s += 1; else return null; } return [s, r.t]; }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, limit || 8).map((x) => x[1]);
  }
  const L = lang;
  const icon = (n) => '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ((window.UT_ICONS || {})[n] || '') + '</svg>';
  const toolUrl = (t) => '/tools/' + t[0] + '/';
  $$('[data-search]').forEach((inp) => {
    const box = $('.sugg', inp.parentElement); if (!box) return; let act = -1;
    const render = () => {
      const res = search(inp.value, 7); if (!inp.value.trim() || !res.length) { box.classList.remove('open'); box.innerHTML = ''; return; }
      box.innerHTML = res.map((t) => `<a href="${toolUrl(t)}"><span class="g" style="width:36px;height:36px;border-radius:10px;background:var(--paper);display:grid;place-items:center;font:500 11px var(--mono);color:var(--accent);direction:ltr">${icon(t[2])}</span><span><b>${L() === 'en' ? t[4] : t[3]}</b><small>${L() === 'en' ? t[6] : t[5]}</small></span></a>`).join(''); box.classList.add('open'); act = -1;
    };
    inp.addEventListener('input', render); inp.addEventListener('focus', render);
    inp.addEventListener('keydown', (e) => {
      const items = $$('a', box);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('act', i === act)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (act >= 0 && items[act]) location.href = items[act].href; else if (items[0]) location.href = items[0].href; else location.href = '/tools/?q=' + encodeURIComponent(inp.value); }
      else if (e.key === 'Escape') box.classList.remove('open');
    });
    document.addEventListener('click', (e) => { if (!inp.parentElement.contains(e.target)) box.classList.remove('open'); });
  });
  addEventListener('keydown', (e) => { if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { const i = $('[data-search]'); if (i) { e.preventDefault(); i.focus(); } } });

  /* ---------- grid filter (tools page) ---------- */
  const grid = $('#tgrid');
  if (grid) {
    const cards = $$('.tcard', grid), chips = $$('.chip[data-cat]'), box = $('#gsearch'), empty = $('#gempty'); let cat = grid.dataset.cat || '';
    const apply = () => {
      const q = box ? box.value : ''; const hit = q.trim() ? new Set(search(q, 200).map((t) => t[0])) : null; let n = 0;
      cards.forEach((c) => { const ok = (!cat || c.dataset.cat === cat) && (!hit || hit.has(c.dataset.id)); c.hidden = !ok; if (ok) n++; });
      chips.forEach((c) => c.classList.toggle('on', c.dataset.cat === cat)); if (empty) empty.hidden = n > 0;
    };
    chips.forEach((c) => c.addEventListener('click', (e) => { if (grid.dataset.static) return; e.preventDefault(); cat = c.dataset.cat; history.replaceState(null, '', cat ? '#' + cat : location.pathname + location.search); apply(); }));
    if (box) { box.addEventListener('input', apply); const q = new URLSearchParams(location.search).get('q'); if (q) box.value = q; }
    if (!grid.dataset.static && location.hash.length > 1) cat = location.hash.slice(1);
    apply();
  }

  /* ---------- hero demo steps ---------- */
  const steps = $$('.aw-ai li');
  if (steps.length) {
    let i = 0; const tick = () => { if (i < steps.length) { steps[i++].classList.add('on'); } else { steps.forEach((s) => s.classList.remove('on')); i = 0; } };
    if (reduce) steps.forEach((s) => s.classList.add('on')); else { tick(); setInterval(tick, 1100); }
  }

  /* ---------- scroll reveal ---------- */
  const rv = $$('.reveal'); if (rv.length) { if (!('IntersectionObserver' in window) || reduce) rv.forEach((e) => e.classList.add('in')); else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 }); rv.forEach((e) => io.observe(e)); } }

  /* ---------- 3D carousel ---------- */
  const car = $('#carousel');
  if (car) {
    const stage = $('#stage'), cards = $$('.ccard', stage), N = cards.length, HOLD = 2300, TURN = 950, SIDE_ROT = 125;
    let pos = 0, W = 0, w = 0, xSide = 0, timer = null, raf = 0, target = 0, dragging = false, sx = 0, spos = 0, st = 0, moved = false;
    const dots = $$('.cdots button', car);
    const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function measure() { W = stage.clientWidth; w = cards[0].offsetWidth; xSide = Math.max(w * 1.05, Math.min(W / 2, w * 2.2)); render(); }
    function render() {
      cards.forEach((c, i) => {
        const p = (((i - pos + 2) % N) + N) % N - 2, a = Math.abs(p), s = p < 0 ? -1 : 1; let x, z, r, o;
        if (a <= 1) { x = s * xSide * a; z = -0.325 * w * a; r = s * SIDE_ROT * (1 - Math.pow(1 - a, 1.6)); o = 1; }
        else { const t = a - 1; x = s * xSide * (1 + t * 1.6); z = -0.325 * w; r = s * (SIDE_ROT + 55 * t); o = Math.max(0, 1 - t * 1.6); }
        c.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${r}deg)`; c.style.opacity = o; c.style.zIndex = 10 - Math.round(a * 4); c.style.visibility = o === 0 ? 'hidden' : 'visible'; c.setAttribute('aria-hidden', a > 0.5 ? 'true' : 'false');
      });
      const f = ((pos % N) + N) % N, i0 = Math.floor(f), fr = f - i0, g0 = cards[i0].dataset.glow.split(',').map(Number), g1 = cards[(i0 + 1) % N].dataset.glow.split(',').map(Number);
      car.style.setProperty('--glow', g0.map((v, k) => Math.round(v + (g1[k] - v) * fr)).join(','));
      const cur = Math.round(f) % N; dots.forEach((d, k) => d.classList.toggle('on', k === cur));
    }
    window.__relayout = measure;
    function go(t, dur) {
      cancelAnimationFrame(raf); clearTimeout(timer); target = t; dur = dur == null ? TURN : dur;
      if (reduce) { pos = t; render(); return; }
      const from = pos, t0 = performance.now();
      const frame = (now) => { const k = Math.min(1, (now - t0) / dur); pos = from + (t - from) * easeIO(k); render(); if (k < 1) raf = requestAnimationFrame(frame); else schedule(); };
      raf = requestAnimationFrame(frame);
    }
    function schedule() { clearTimeout(timer); if (reduce || document.hidden) return; timer = setTimeout(() => go(Math.round(pos) + 1), HOLD); }
    function step(d) { clearTimeout(timer); go(Math.round(target != null ? target : pos) + d); }
    car.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; if (e.target.closest('.cdots')) return; clearTimeout(timer); cancelAnimationFrame(raf); dragging = true; moved = false; sx = e.clientX; spos = pos; st = performance.now(); });
    car.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - sx; if (!moved && Math.abs(dx) > 6) { moved = true; car.classList.add('is-dragging'); try { car.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } } if (moved) { pos = spos - dx / (xSide * 0.9); render(); } });
    const up = (e) => {
      if (!dragging) return; dragging = false; car.classList.remove('is-dragging');
      if (!moved) {
        const rect = car.getBoundingClientRect(), fx = (e.clientX - rect.left) / rect.width;
        if (fx < 0.3) step(-1); else if (fx > 0.7) step(1); else { const front = cards[((Math.round(pos) % N) + N) % N]; if (front && front.dataset.href && e.type === 'pointerup') { location.href = front.dataset.href; return; } schedule(); }
        return;
      }
      const v = (pos - spos) / Math.max(1, performance.now() - st); let t = Math.round(pos + v * 220); if (t === Math.round(spos) && Math.abs(pos - spos) > 0.18) t = Math.round(spos) + (pos > spos ? 1 : -1); go(t, 650);
    };
    car.addEventListener('pointerup', up); car.addEventListener('pointercancel', up);
    addEventListener('keydown', (e) => { if (!car.matches(':hover, :focus-within') && document.activeElement !== document.body) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
    dots.forEach((d, k) => d.addEventListener('click', (e) => { e.stopPropagation(); const cur = Math.round(pos), idx = ((cur % N) + N) % N; go(cur + ((k - idx) + N) % N); }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(); });
    addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    // ruler ticks (card 2)
    const ruler = $('#ruler'); if (ruler) { let h = ''; for (let i = 0; i < 64; i++) { const v = Math.sin(i * 12.9898) * 43758.5453, fr = v - Math.floor(v), ht = i === 32 ? 20 : 5 + fr * 10; h += `<rect x="${i * 4}" y="${(20 - ht) / 2}" width="1" height="${ht}" fill="${i === 32 ? '#ff4b3a' : 'rgba(255,205,215,.5)'}"/>`; } ruler.innerHTML = h; }
    measure(); schedule();
  }


  /* ---------- privacy-minimised analytics (no cookies, no IP, skipped on Do-Not-Track) ---------- */
  (function () {
    try {
      if (/^\/admin(\/|$)/.test(location.pathname)) { try { localStorage.setItem('ur-notrack', '1'); } catch (e) { /* ignore */ } return; }
      if (navigator.doNotTrack === '1' || navigator.webdriver || localStorage.getItem('ur-notrack') === '1' || /[?&]notrack=1/.test(location.search)) { if (/[?&]notrack=1/.test(location.search)) localStorage.setItem('ur-notrack', '1'); return; }
      let vk = localStorage.getItem('ur-vk'); if (!vk) { vk = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now().toString(16) + 'xxxxxxxx'); localStorage.setItem('ur-vk', vk); }
      const send = (eventType, extra) => { const body = JSON.stringify(Object.assign({ visitorKey: vk, eventType, path: location.pathname, referrer: document.referrer }, extra || {})); const url = ((window.UTILITYRA || {}).apiBase || '') + '/api/analytics/event'; try { fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {}); } catch (e) { /* ignore */ } };
      window.URAnalytics = { send };
      send('page_view');
      const tr0 = document.querySelector('#tool-root'); if (tr0) { const id = tr0.dataset.tool; send('tool_open', { toolKey: id }); let once = false; const act = (e) => { if (!once && (e.type === 'input' || e.target.closest('[data-run]'))) { once = true; send('tool_action', { toolKey: id }); } }; tr0.addEventListener('click', act); tr0.addEventListener('input', act); }
    } catch (e) { /* analytics must never break the page */ }
  })();


  /* ---------- admin-controlled config: disabled tools + announcement ---------- */
  (function () {
    try {
      if (/^\/admin(\/|$)/.test(location.pathname)) return;
      fetch(((window.UTILITYRA || {}).apiBase || '') + '/api/config').then((r) => (r.ok ? r.json() : null)).then((c) => {
        if (!c) return; const off = new Set(c.disabled || []);
        off.forEach((id) => document.querySelectorAll('[data-id="' + id + '"]').forEach((e) => e.remove()));
        const root = document.querySelector('#tool-root'); if (root && off.has(root.dataset.tool)) root.innerHTML = '<p class="tool-status err">' + (document.documentElement.lang === 'en' ? 'This tool is temporarily unavailable.' : 'هذه الأداة متوقفة مؤقتًا.') + '</p>';
        const s = c.settings || {}, msg = document.documentElement.lang === 'en' ? s.announcement_en : s.announcement_ar;
        if (msg) { const d = document.createElement('div'); d.className = 'note'; d.setAttribute('role', 'status'); d.style.cssText = 'margin:0;border-radius:0;justify-content:center;text-align:center'; d.textContent = msg; document.body.prepend(d); }
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  })();

  /* ---------- offline support (service worker) ---------- */
  try { if ('serviceWorker' in navigator && location.protocol === 'https:' && !/^\/admin/.test(location.pathname)) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); } catch (e) { /* optional */ }

  /* ---------- tool page ---------- */
  const tr = $('#tool-root');
  if (tr && window.UT) { try { window.UT.mount(tr, tr.dataset.tool); } catch (e) { tr.innerHTML = '<p class="tool-status err">Could not start this tool: ' + String(e.message).replace(/</g, '&lt;') + '</p>'; console.error(e); } document.body.dataset.toolReady = '1'; }
})();
