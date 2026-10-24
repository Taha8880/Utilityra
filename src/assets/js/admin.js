(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const api = (p, o) => fetch((window.UTILITYRA || {}).apiBase + p, Object.assign({ credentials: 'same-origin' }, o)).then(async (r) => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = $('#admin-root'); const ar = () => document.documentElement.lang !== 'en'; const t = (a, e) => (ar() ? a : e);
  function login(msg) {
    root.innerHTML = `<form id="lf" class="panel" style="max-width:420px"><h2>${t('تسجيل دخول المسؤول', 'Admin sign-in')}</h2>${msg ? `<p class="tool-status err">${esc(msg)}</p>` : ''}<div class="field"><label for="pw">${t('كلمة المرور', 'Password')}</label><input id="pw" type="password" dir="ltr" autocomplete="current-password" required></div><button class="btn" type="submit">${t('دخول', 'Sign in')}</button></form>`;
    $('#lf').addEventListener('submit', async (e) => {
      e.preventDefault(); const r = await api('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
      if (r.ok) return dash();
      login(r.status === 503 ? t('لوحة الإدارة غير مهيأة (تحتاج D1 وأسرار ADMIN_PASSWORD وADMIN_SESSION_SECRET).', 'Admin is not configured (needs D1 and the ADMIN_PASSWORD / ADMIN_SESSION_SECRET secrets).') : r.status === 429 ? t('محاولات كثيرة. حاول بعد 15 دقيقة.', 'Too many attempts. Try again in 15 minutes.') : t('كلمة المرور غير صحيحة.', 'Wrong password.'));
    });
  }
  const tbl = (head, rows) => `<div class="tblwrap"><table class="tbl"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">—</td></tr>`}</tbody></table></div>`;
  async function dash() {
    const [s, inc] = await Promise.all([api('/api/admin/stats'), api('/api/admin/incidents')]);
    if (s.status === 401) return login();
    if (!s.ok) { root.innerHTML = `<p class="tool-status err">${t('تعذّر جلب الإحصاءات.', 'Could not load stats.')}</p>`; return; }
    const m = s.j.summary || {};
    root.innerHTML = `<div class="cards">${[['الزوار (30 يومًا)', 'Visitors (30d)', m.visitors], ['مشاهدات الصفحات', 'Page views', m.page_views], ['فتح الأدوات', 'Tool opens', m.tool_opens], ['عمليات البحث', 'Searches', m.searches], ['بحث بلا نتيجة', 'Missed searches', m.search_misses]].map((c) => `<div class="rc"><span class="rc-l">${t(c[0], c[1])}</span><b class="rc-v">${esc(c[2] || 0)}</b></div>`).join('')}</div>
    <h2>${t('الأدوات الأكثر استخدامًا', 'Top tools')}</h2>${tbl([t('الأداة', 'Tool'), t('فتح', 'Opens'), t('تشغيل', 'Runs')], (s.j.topTools || []).map((x) => [x.tool_key, x.opens, x.actions]))}
    <h2>${t('الصفحات الأكثر زيارة', 'Top pages')}</h2>${tbl([t('الصفحة', 'Path'), t('مشاهدات', 'Views')], (s.j.topPages || []).map((x) => [x.path, x.views]))}
    <h2>${t('عمليات بحث لم تجد نتيجة (أفكار أدوات جديدة)', 'Searches with no result (new tool ideas)')}</h2>${tbl([t('الكلمة', 'Term'), t('العدد', 'Count')], (s.j.missedSearches || []).map((x) => [x.search_term, x.searches]))}
    <h2>${t('المهندس التقني — سجل الحوادث', 'Technical engineer — incident log')}</h2>
    <p>${t('يفحص الموقع (الصفحات، الـ sitemap، الروابط القديمة، صفحة 404) ويسجّل أي عطل ويقترح تشخيصًا. لا يُنفَّذ أي تعديل تلقائيًا؛ كل إصلاح يمر بمراجعتك واختبار CI.', 'Checks the site (pages, sitemap, legacy links, 404) and logs any failure with a proposed diagnosis. Nothing is changed automatically; every fix goes through your review and CI.')}</p>
    <button class="btn" id="run">${t('شغّل الفحص الآن', 'Run health check now')}</button> <button class="btn ghost" id="out">${t('تسجيل الخروج', 'Sign out')}</button>
    <div id="chk" aria-live="polite"></div><div id="incs">${incTable((inc.j || {}).incidents || [])}</div>`;
    $('#out').onclick = async () => { await api('/api/admin/logout', { method: 'POST' }); login(); };
    $('#run').onclick = async (e) => {
      e.target.disabled = true; $('#chk').innerHTML = `<p>${t('جارٍ الفحص…', 'Checking…')}</p>`; const r = await api('/api/admin/engineer/run', { method: 'POST' }); e.target.disabled = false;
      if (!r.ok) { $('#chk').innerHTML = `<p class="tool-status err">${t('فشل الفحص.', 'Check failed.')}</p>`; return; }
      $('#chk').innerHTML = `<p class="tool-status ${r.j.ok ? 'ok' : 'err'}">${r.j.ok ? t('كل الفحوص ناجحة ✓', 'All checks passed ✓') : t('توجد فحوص فاشلة', 'Some checks failed')}</p>` + tbl(['check', 'path', 'status', 'ms', 'ok'], r.j.results.map((x) => [x.key, x.path, x.status, x.ms, x.ok ? '✓' : '✗']));
      const i = await api('/api/admin/incidents'); $('#incs').innerHTML = incTable((i.j || {}).incidents || []);
    };
  }
  const incTable = (list) => list.length ? list.map((i) => `<details class="panel"><summary><b>#${i.id}</b> ${esc(i.title)} — <span class="label">${esc(i.severity)} / ${esc(i.status)}</span></summary><pre dir="ltr">${esc(i.detail)}</pre>${i.diagnosis ? `<h3>${t('التشخيص المقترح (للمراجعة)', 'Proposed diagnosis (for review)')}</h3><pre dir="auto" style="white-space:pre-wrap">${esc(i.diagnosis)}</pre>` : ''}</details>`).join('') : `<p>${t('لا توجد حوادث مسجلة.', 'No incidents recorded.')}</p>`;
  api('/api/admin/session').then((r) => (r.ok ? dash() : login())).catch(() => login('Network error'));
})();
