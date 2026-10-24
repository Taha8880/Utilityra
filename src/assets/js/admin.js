(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const base = (window.UTILITYRA || {}).apiBase || '';
  const api = (p, o) => fetch(base + p, Object.assign({ credentials: 'same-origin' }, o)).then(async (r) => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }));
  const post = (p, body) => api(p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) });
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = $('#admin-root'); const ar = () => document.documentElement.lang !== 'en'; const t = (a, e) => (ar() ? a : e);
  const TOOLS = (window.UT_INDEX || []).map((x) => ({ id: x[0], cat: x[1], ar: x[3], en: x[4] }));
  let tab = 'dash';

  function login(msg) {
    root.innerHTML = `<form id="lf" class="panel" style="max-width:420px"><h2>${t('تسجيل دخول المسؤول', 'Admin sign-in')}</h2>${msg ? `<p class="tool-status err" role="alert">${esc(msg)}</p>` : ''}<div class="fld"><label for="pw">${t('كلمة المرور', 'Password')}</label><input id="pw" type="password" dir="ltr" autocomplete="current-password" required></div><button class="btn primary" type="submit">${t('دخول', 'Sign in')}</button></form>`;
    $('#lf').addEventListener('submit', async (e) => {
      e.preventDefault(); const r = await post('/api/admin/login', { password: $('#pw').value });
      if (r.ok) return shell();
      login(r.status === 503 ? t('لوحة الإدارة غير مهيأة بعد: تحتاج قاعدة D1 وأسرار ADMIN_PASSWORD وADMIN_SESSION_SECRET (انظر docs/DEPLOY_AR.md).', 'Admin is not configured yet: it needs D1 and the ADMIN_PASSWORD / ADMIN_SESSION_SECRET secrets (see docs/DEPLOY_AR.md).') : r.status === 429 ? t('محاولات كثيرة. حاول بعد 15 دقيقة.', 'Too many attempts. Try again in 15 minutes.') : t('كلمة المرور غير صحيحة.', 'Wrong password.'));
    });
  }
  const tbl = (head, rows) => `<div class="tblwrap"><table class="tbl"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">—</td></tr>`}</tbody></table></div>`;
  const TABS = [['dash', 'لوحة المعلومات', 'Dashboard'], ['tools', 'إدارة الأدوات', 'Tools'], ['inc', 'المهندس التقني', 'Engineer'], ['set', 'إعدادات الموقع', 'Settings'], ['log', 'سجل النشاط', 'Activity log']];
  function shell() {
    root.innerHTML = `<div class="chips" role="tablist">${TABS.map((x) => `<button class="chip${x[0] === tab ? ' on' : ''}" role="tab" aria-selected="${x[0] === tab}" data-tab="${x[0]}">${t(x[1], x[2])}</button>`).join('')}<button class="chip" id="out" style="margin-inline-start:auto">${t('تسجيل الخروج', 'Sign out')}</button></div><div id="view" aria-live="polite"></div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; shell(); }));
    $('#out').onclick = async () => { await post('/api/admin/logout'); login(); };
    ({ dash, tools, inc, set, log })[tab]();
  }
  const guard = (r) => { if (r.status === 401) { login(); return false; } if (!r.ok) { $('#view').innerHTML = `<p class="tool-status err">${t('تعذّر جلب البيانات.', 'Could not load data.')}</p>`; return false; } return true; };

  async function dash() {
    const r = await api('/api/admin/stats'); if (!guard(r)) return; const j = r.j, m = j.summary || {};
    const days = j.daily || [], max = Math.max(1, ...days.map((d) => d.page_views || 0));
    const bars = days.map((d, i) => { const h = Math.round(((d.page_views || 0) / max) * 90); return `<rect x="${i * 14}" y="${100 - h}" width="10" height="${h}" rx="2" fill="currentColor"><title>${esc(d.day)}: ${d.page_views} / ${d.visitors}</title></rect>`; }).join('');
    $('#view').innerHTML = `<div class="cards">${[['الزوار (30 يومًا)', 'Visitors (30d)', m.visitors], ['مشاهدات الصفحات', 'Page views', m.page_views], ['فتح الأدوات', 'Tool opens', m.tool_opens], ['عمليات البحث', 'Searches', m.searches], ['بحث بلا نتيجة', 'Missed searches', m.search_misses]].map((c) => `<div class="rc"><span class="rc-l">${t(c[0], c[1])}</span><b class="rc-v">${esc(c[2] || 0)}</b></div>`).join('')}</div>
    <h2>${t('مشاهدات يومية', 'Daily page views')}</h2><svg viewBox="0 0 ${Math.max(days.length * 14, 14)} 100" role="img" aria-label="${t('رسم المشاهدات اليومية', 'Daily page views chart')}" style="width:100%;height:140px;color:var(--accent)" preserveAspectRatio="none">${bars}</svg>
    <h2>${t('الأدوات الأكثر استخدامًا', 'Top tools')}</h2>${tbl([t('الأداة', 'Tool'), t('فتح', 'Opens'), t('تشغيل', 'Runs')], (j.topTools || []).map((x) => [x.tool_key, x.opens, x.actions]))}
    <h2>${t('الصفحات الأكثر زيارة', 'Top pages')}</h2>${tbl([t('الصفحة', 'Path'), t('مشاهدات', 'Views')], (j.topPages || []).map((x) => [x.path, x.views]))}
    <h2>${t('عمليات بحث بلا نتيجة (أفكار أدوات جديدة)', 'Searches with no result (new tool ideas)')}</h2>${tbl([t('الكلمة', 'Term'), t('العدد', 'Count')], (j.missedSearches || []).map((x) => [x.search_term, x.searches]))}`;
  }
  async function tools() {
    const r = await api('/api/admin/tools'); if (!guard(r)) return; const fl = Object.fromEntries((r.j.flags || []).map((f) => [f.tool_key, f]));
    $('#view').innerHTML = `<p>${t('عطّل أداة لإخفائها من الموقع وإيقاف أداة الذكاء الاصطناعي المرتبطة بها فورًا.', 'Disable a tool to hide it from the site and stop its AI endpoint immediately.')}</p><div class="tblwrap"><table class="tbl"><thead><tr><th>${t('الأداة', 'Tool')}</th><th>${t('مفعّلة', 'Enabled')}</th><th>${t('مميّزة', 'Featured')}</th></tr></thead><tbody>${TOOLS.map((x) => { const f = fl[x.id] || { enabled: 1, featured: 0 }; return `<tr><td><a href="/tools/${x.id}/">${esc(ar() ? x.ar : x.en)}</a> <small dir="ltr">${x.id}</small></td><td><input type="checkbox" data-k="${x.id}" data-f="enabled" ${Number(f.enabled) ? 'checked' : ''} aria-label="enabled ${x.id}"></td><td><input type="checkbox" data-k="${x.id}" data-f="featured" ${Number(f.featured) ? 'checked' : ''} aria-label="featured ${x.id}"></td></tr>`; }).join('')}</tbody></table></div>`;
    $('#view').onchange = async (e) => { const c = e.target.closest('[data-k]'); if (!c) return; const row = c.closest('tr'); const g = (f) => row.querySelector(`[data-f="${f}"]`).checked; c.disabled = true; const r2 = await post('/api/admin/tools/flag', { tool_key: c.dataset.k, enabled: g('enabled'), featured: g('featured') }); c.disabled = false; if (!r2.ok) { c.checked = !c.checked; alert(t('فشل الحفظ', 'Save failed')); } };
  }
  const incTable = (list) => list.length ? list.map((i) => `<details class="panel"><summary><b>#${i.id}</b> ${esc(i.title)} — <span class="label">${esc(i.severity)} / ${esc(i.status)}</span></summary><pre dir="ltr">${esc(i.detail)}</pre>${i.diagnosis ? `<h3>${t('التشخيص المقترح (للمراجعة)', 'Proposed diagnosis (for review)')}</h3><pre dir="auto" style="white-space:pre-wrap">${esc(i.diagnosis)}</pre>` : ''}<p>${['open', 'diagnosed', 'fix_proposed', 'resolved', 'ignored'].map((s) => `<button class="btn ghost" data-inc="${i.id}" data-st="${s}">${s}</button>`).join(' ')}</p></details>`).join('') : `<p>${t('لا توجد حوادث مسجلة.', 'No incidents recorded.')}</p>`;
  async function inc() {
    const r = await api('/api/admin/incidents'); if (!guard(r)) return;
    $('#view').innerHTML = `<p>${t('يفحص الموقع ويسجّل أي عطل مع تشخيص مقترح. لا يُنفَّذ أي تعديل تلقائيًا.', 'Checks the site and logs any failure with a proposed diagnosis. Nothing is changed automatically.')}</p><button class="btn primary" id="run">${t('شغّل الفحص الآن', 'Run health check now')}</button><div id="chk" aria-live="polite"></div><div id="incs">${incTable(r.j.incidents || [])}</div>`;
    $('#run').onclick = async (e) => { e.target.disabled = true; $('#chk').innerHTML = `<p>${t('جارٍ الفحص…', 'Checking…')}</p>`; const x = await post('/api/admin/engineer/run'); e.target.disabled = false; if (!x.ok) { $('#chk').innerHTML = `<p class="tool-status err">${t('فشل الفحص.', 'Check failed.')}</p>`; return; } $('#chk').innerHTML = `<p class="tool-status ${x.j.ok ? '' : 'err'}">${x.j.ok ? t('كل الفحوص ناجحة ✓', 'All checks passed ✓') : t('توجد فحوص فاشلة', 'Some checks failed')}</p>` + tbl(['check', 'path', 'status', 'ms', 'ok'], x.j.results.map((y) => [y.key, y.path, y.status, y.ms, y.ok ? '✓' : '✗'])); const i = await api('/api/admin/incidents'); $('#incs').innerHTML = incTable((i.j || {}).incidents || []); };
    $('#view').onclick = async (e) => { const b = e.target.closest('[data-inc]'); if (!b) return; await post('/api/admin/incidents/status', { id: +b.dataset.inc, status: b.dataset.st }); inc(); };
  }
  async function set() {
    const r = await api('/api/admin/settings'); if (!guard(r)) return; const s = r.j.settings || {};
    const f = (k, ar_, en_) => `<div class="fld"><label for="s-${k}">${t(ar_, en_)}</label><input id="s-${k}" data-s="${k}" value="${esc(s[k] || '')}" maxlength="400" dir="auto"></div>`;
    $('#view').innerHTML = `<div class="panel" style="max-width:640px"><p>${t('رسالة تظهر أعلى الموقع (مثلاً صيانة). اتركها فارغة لإخفائها.', 'A message shown at the top of the site (e.g. maintenance). Leave empty to hide it.')}</p>${f('announcement_ar', 'إعلان بالعربية', 'Announcement (Arabic)')}${f('announcement_en', 'إعلان بالإنجليزية', 'Announcement (English)')}<button class="btn primary" id="save">${t('حفظ', 'Save')}</button> <span id="sm" role="status"></span></div>`;
    $('#save').onclick = async () => { const settings = {}; root.querySelectorAll('[data-s]').forEach((i) => { settings[i.dataset.s] = i.value; }); const x = await post('/api/admin/settings', { settings }); $('#sm').textContent = x.ok ? t('تم الحفظ ✓', 'Saved ✓') : t('فشل الحفظ', 'Save failed'); };
  }
  async function log() {
    const r = await api('/api/admin/audit'); if (!guard(r)) return;
    $('#view').innerHTML = tbl([t('الوقت', 'Time'), t('الإجراء', 'Action'), t('التفاصيل', 'Detail')], (r.j.log || []).map((x) => [x.created_at, x.action, x.detail]));
  }
  api('/api/admin/session').then((r) => (r.ok ? shell() : login())).catch(() => login('Network error'));
})();
