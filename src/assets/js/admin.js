(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const base = (window.UTILITYRA || {}).apiBase || '';
  const api = (p, o) => fetch(base + p, Object.assign({ credentials: 'same-origin', headers: { 'accept': 'application/json' } }, o)).then(async (r) => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) })).catch(() => ({ ok: false, status: 0, j: { error: 'NETWORK_ERROR' } }));
  const post = (p, body) => api(p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) });
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = $('#admin-root'); const ar = () => document.documentElement.lang !== 'en'; const t = (a, e) => (ar() ? a : e);
  const TOOLS = (window.UT_INDEX || []).map((x) => ({ id: x[0], cat: x[1], ar: x[3], en: x[4] }));
  let tab = 'dash';

  function login(msg) {
    root.innerHTML = `<form id="lf" class="panel" style="max-width:420px"><h2>${t('تسجيل دخول المسؤول', 'Admin sign-in')}</h2>${msg ? `<p class="tool-status err" role="alert">${esc(msg)}</p>` : ''}<div class="fld"><label for="pw">${t('كلمة المرور', 'Password')}</label><input id="pw" type="password" dir="ltr" autocomplete="current-password" required></div><button class="btn primary" type="submit">${t('دخول', 'Sign in')}</button></form>`;
    $('#lf').addEventListener('submit', async (e) => {
      e.preventDefault(); const button = $('#lf button[type="submit"]'); button.disabled = true; button.textContent = t('جارٍ التحقق…', 'Checking…');
      const r = await post('/api/admin/login', { password: $('#pw').value });
      if (r.ok) {
        const session = await api('/api/admin/session');
        if (session.ok && session.j && session.j.authenticated) return shell();
        login(session.status === 0
          ? t('تم قبول كلمة المرور، لكن تعذّر تأكيد الجلسة. افحص إعدادات النطاق والكوكيز في Cloudflare.', 'Password accepted, but the session could not be verified. Check Cloudflare domain and cookie settings.')
          : t('تم قبول كلمة المرور لكن جلسة الإدارة لم تُحفظ. تحقق من نشر آخر إصدار وإعدادات الكوكيز.', 'Password accepted, but the admin session was not retained. Check the deployed version and cookie settings.'));
        return;
      }
      const error = r.j && r.j.error;
      const message = r.status === 0 ? t('تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجددًا.', 'Could not reach the server. Check your connection and try again.') : r.status === 503 || error === 'ADMIN_NOT_CONFIGURED' ? t('لوحة الإدارة غير مهيأة: تحقق من أسرار الإدارة وربط قاعدة D1.', 'Admin is not configured: check admin secrets and the D1 binding.') : r.status === 429 ? t('محاولات دخول كثيرة. انتظر 15 دقيقة قبل المحاولة مجددًا.', 'Too many login attempts. Wait 15 minutes before trying again.') : r.status === 401 ? t('كلمة المرور غير صحيحة. تأكد من ADMIN_PASSWORD المحفوظ في Cloudflare، ولا ترسلها هنا.', 'Incorrect password. Verify the ADMIN_PASSWORD secret in Cloudflare; do not send it here.') : t('حدث خطأ في الخادم أثناء تسجيل الدخول. راجع إعدادات Cloudflare وسجلات Worker.', 'The server failed during sign-in. Check Cloudflare settings and Worker logs.');
      login(message);
    });
  }
  const tbl = (head, rows) => `<div class="tblwrap"><table class="tbl"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">—</td></tr>`}</tbody></table></div>`;
  const TABS = [['dash', 'لوحة المعلومات', 'Dashboard'], ['tools', 'إدارة الأدوات', 'Tools'], ['inc', 'المهندس التقني', 'Engineer'], ['reports', 'بلاغات الزوار', 'Reports'], ['knowledge', 'ذاكرة المعرفة', 'AI Knowledge'], ['set', 'إعدادات الموقع', 'Settings'], ['dev', 'مساعد المطوّر', 'Dev assistant'], ['log', 'سجل النشاط', 'Activity log']];
  function shell() {
    root.innerHTML = `<div class="chips" role="tablist">${TABS.map((x) => `<button class="chip${x[0] === tab ? ' on' : ''}" role="tab" aria-selected="${x[0] === tab}" data-tab="${x[0]}">${t(x[1], x[2])}</button>`).join('')}<button class="chip" id="out" style="margin-inline-start:auto">${t('تسجيل الخروج', 'Sign out')}</button></div><div id="view" aria-live="polite"></div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; shell(); }));
    $('#out').onclick = async () => { await post('/api/admin/logout'); login(); };
    ({ dash, tools, inc, reports, knowledge, set, dev, log })[tab]();
  }
  const guard = (r) => { if (r.status === 401) { login(); return false; } if (!r.ok) { $('#view').innerHTML = `<p class="tool-status err">${t('تعذّر جلب البيانات.', 'Could not load data.')}</p>`; return false; } return true; };

  async function dash() {
    const r = await api('/api/admin/stats'); if (!guard(r)) return; const j = r.j, m = j.summary || {};
    const days = Array.isArray(j.daily) ? j.daily : [];
    const hasData = Number(m.events) > 0;
    const metric = (value) => value == null ? t('غير متاح', 'Unavailable') : (!hasData ? t('لا توجد بيانات بعد', 'No data yet') : Number(value).toLocaleString(ar() ? 'ar-EG' : 'en-US'));
    const max = Math.max(1, ...days.map((d) => Number(d.page_views) || 0));
    const bars = days.map((d, i) => { const h = Math.round(((Number(d.page_views) || 0) / max) * 90); return `<rect x="${i * 14}" y="${100 - h}" width="10" height="${h}" rx="2" fill="currentColor"><title>${esc(d.day)}: ${esc(d.page_views)} / ${esc(d.visitors)}</title></rect>`; }).join('');
    $('#view').innerHTML = `<p class="stats-note">${hasData ? t('بيانات فعلية مسجلة خلال آخر 30 يومًا.', 'Recorded analytics from the last 30 days.') : t('لم تُسجّل بيانات زيارات بعد. لن نعرض أصفارًا على أنها إحصائيات فعلية.', 'No visit data has been recorded yet. Zeros are not presented as real analytics.')}</p><div class="cards">${[['الزوار (30 يومًا)', 'Visitors (30d)', m.visitors], ['مشاهدات الصفحات', 'Page views', m.page_views], ['فتح الأدوات', 'Tool opens', m.tool_opens], ['عمليات البحث', 'Searches', m.searches], ['بحث بلا نتيجة', 'Missed searches', m.search_misses]].map((c) => `<div class="rc"><span class="rc-l">${t(c[0], c[1])}</span><b class="rc-v">${metric(c[2])}</b></div>`).join('')}
    <h2>${t('مشاهدات يومية', 'Daily page views')}</h2>${days.length ? `<svg viewBox="0 0 ${Math.max(days.length * 14, 14)} 100" role="img" aria-label="${t('رسم المشاهدات اليومية', 'Daily page views chart')}" style="width:100%;height:140px;color:var(--accent)" preserveAspectRatio="none">${bars}</svg>` : `<p>${t('لا يوجد سجل يومي متاح حتى الآن.', 'No daily records available yet.')}</p>`}
    `;
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
  async function reports() {
    const r = await api('/api/admin/reports'); if (!guard(r)) return;
    const items = r.j.reports || [];
    const labels = { new: t('جديد', 'New'), reviewing: t('قيد المراجعة', 'Reviewing'), resolved: t('تم الحل', 'Resolved'), closed: t('مغلق', 'Closed') };
    const kinds = { bug: t('مشكلة', 'Bug'), suggestion: t('اقتراح', 'Suggestion'), other: t('أخرى', 'Other') };
    $('#view').innerHTML = `<p>${t('بلاغات ومقترحات الزوار المرسلة من صفحة اتصل بنا. تغيير الحالة يحفظ مباشرة في قاعدة البيانات.', 'Visitor reports and suggestions submitted through Contact. Status changes are saved to the database.')}</p><div class="cards">${[['new', items.filter(x => x.status === 'new').length], ['reviewing', items.filter(x => x.status === 'reviewing').length], ['resolved', items.filter(x => x.status === 'resolved').length]].map(x => `<div class="rc"><span class="rc-l">${labels[x[0]]}</span><b class="rc-v">${x[1]}</b></div>`).join('')}</div>${items.length ? items.map(x => `<details class="panel" style="margin-block:12px" ${x.status === 'new' ? 'open' : ''}><summary><b>#${x.id}</b> ${esc(kinds[x.type] || x.type)} — <span class="label">${esc(labels[x.status] || x.status)}</span> <small>${esc(x.created_at)}</small></summary><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(x.message)}</p>${x.page ? `<p>${t('الصفحة:', 'Page:')} <a href="${esc(x.page)}">${esc(x.page)}</a></p>` : ''}${x.email ? `<p>${t('بريد التواصل:', 'Contact email:')} <a href="mailto:${esc(x.email)}">${esc(x.email)}</a></p>` : `<p>${t('لم يترك الزائر بريدًا للتواصل.', 'No contact email provided.')}</p>`}<div class="chips">${['new', 'reviewing', 'resolved', 'closed'].map(s => `<button class="btn ghost" data-report="${x.id}" data-st="${s}" ${x.status === s ? 'disabled' : ''}>${labels[s]}</button>`).join('')}</div></details>`).join('') : `<p>${t('لا توجد بلاغات حتى الآن.', 'No reports yet.')}</p>`}`;
    $('#view').onclick = async (e) => {
      const button = e.target.closest('[data-report]'); if (!button) return;
      button.disabled = true;
      const saved = await post('/api/admin/reports/status', { id: Number(button.dataset.report), status: button.dataset.st });
      if (!saved.ok) { button.disabled = false; alert(t('تعذّر تحديث حالة البلاغ.', 'Could not update report status.')); return; }
      reports();
    };
  }
  async function knowledge() {
    const r = await api('/api/admin/knowledge'); if (!guard(r)) return;
    const entries = r.j.entries || [];
    $('#view').innerHTML = `<p>${t('هذه ذاكرة معرفة موثقة يراجعها المسؤول ويعتمدها قبل أن يستخدمها المساعد. لا يتعلم النظام تلقائيًا من محادثات الزوار ولا يحوّل إجابات غير مؤكدة إلى حقائق.', 'This is a curated knowledge memory. An administrator reviews and approves entries before the assistant can use them. The system does not automatically learn facts from visitor chats or turn unverified answers into truth.')}</p>
      <form id="kf" class="panel" style="max-width:760px"><h3>${t('إضافة معرفة للمراجعة', 'Add knowledge for review')}</h3>
      <div class="fld"><label for="kt">${t('العنوان', 'Title')}</label><input id="kt" required minlength="3" maxlength="180"></div>
      <div class="fld"><label for="kc">${t('المعلومة أو الملخص', 'Fact or summary')}</label><textarea id="kc" required minlength="20" maxlength="5000" rows="4"></textarea></div>
      <div class="fld"><label for="ku">${t('رابط المصدر (مستحسن)', 'Source URL (recommended)')}</label><input id="ku" type="url" maxlength="1000" placeholder="https://..."></div>
      <label class="ck"><input id="ka" type="checkbox"> ${t('اعتمادها فورًا بعد المراجعة', 'Approve after review')}</label>
      <button class="btn primary" type="submit">${t('حفظ المعرفة', 'Save knowledge')}</button><span id="km" role="status"></span></form>
      <h3>${t('المعرفة المحفوظة', 'Saved knowledge')}</h3>
      ${entries.length ? entries.map(x => `<details class="panel" style="margin-block:10px"><summary><b>#${x.id}</b> ${esc(x.title)} — <span class="label">${Number(x.approved) ? t('معتمدة', 'Approved') : t('بانتظار المراجعة', 'Pending review')}</span></summary><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(x.content)}</p>${x.source_url ? `<p><a href="${esc(x.source_url)}" target="_blank" rel="noopener noreferrer">${esc(x.source_url)}</a></p>` : ''}<button class="btn ghost" data-kid="${x.id}" data-approved="${Number(x.approved) ? '0' : '1'}">${Number(x.approved) ? t('إلغاء الاعتماد', 'Unapprove') : t('اعتماد المعرفة', 'Approve knowledge')}</button></details>`).join('') : `<p>${t('لا توجد معرفة محفوظة بعد.', 'No saved knowledge yet.')}</p>`}`;
    $('#kf').onsubmit = async (e) => {
      e.preventDefault();
      const button = $('#kf button[type="submit"]'); button.disabled = true;
      const saved = await post('/api/admin/knowledge', { title: $('#kt').value.trim(), content: $('#kc').value.trim(), source_url: $('#ku').value.trim(), approved: $('#ka').checked });
      button.disabled = false;
      $('#km').textContent = saved.ok ? t('تم الحفظ ✓', 'Saved ✓') : t('تعذّر الحفظ. تحقق من البيانات وقاعدة البيانات.', 'Could not save. Check the fields and database.');
      if (saved.ok) knowledge();
    };
    $('#view').onclick = async (e) => {
      const b = e.target.closest('[data-kid]'); if (!b) return;
      b.disabled = true;
      const saved = await post('/api/admin/knowledge/status', { id: Number(b.dataset.kid), approved: b.dataset.approved === '1' });
      if (!saved.ok) { b.disabled = false; alert(t('فشل تحديث حالة المعرفة.', 'Could not update knowledge status.')); return; }
      knowledge();
    };
  }
  async function set() {
    const r = await api('/api/admin/settings'); if (!guard(r)) return; const s = r.j.settings || {};
    const f = (k, ar_, en_) => `<div class="fld"><label for="s-${k}">${t(ar_, en_)}</label><input id="s-${k}" data-s="${k}" value="${esc(s[k] || '')}" maxlength="400" dir="auto"></div>`;
    $('#view').innerHTML = `<div class="panel" style="max-width:640px"><p>${t('رسالة تظهر أعلى الموقع (مثلاً صيانة). اتركها فارغة لإخفائها.', 'A message shown at the top of the site (e.g. maintenance). Leave empty to hide it.')}</p>${f('announcement_ar', 'إعلان بالعربية', 'Announcement (Arabic)')}${f('announcement_en', 'إعلان بالإنجليزية', 'Announcement (English)')}<button class="btn primary" id="save">${t('حفظ', 'Save')}</button> <span id="sm" role="status"></span></div>`;
    $('#save').onclick = async () => { const settings = {}; root.querySelectorAll('[data-s]').forEach((i) => { settings[i.dataset.s] = i.value; }); const x = await post('/api/admin/settings', { settings }); $('#sm').textContent = x.ok ? t('تم الحفظ ✓', 'Saved ✓') : t('فشل الحفظ', 'Save failed'); };
  }
  const hist = [];
  function dev() {
    $('#view').innerHTML = `<p>${t('اسأل عن عطل أو اطلب كودًا. يقدّم تشخيصًا وتعديلًا مقترحًا للمراجعة، ولا ينفّذ أو ينشر شيئًا. الجودة تتحسن كثيرًا عند ضبط مزود قوي (ANTHROPIC_API_KEY).', 'Ask about a problem or request code. It proposes a diagnosis and patch for your review; it never runs or deploys anything. Quality improves a lot with a strong provider (ANTHROPIC_API_KEY).')}</p><div class="chat-log" id="dl" tabindex="0">${hist.map((h) => `<div class="msg ${h.role}"><pre style="white-space:pre-wrap;margin:0" dir="auto">${esc(h.content)}</pre></div>`).join('')}</div><div class="chat-form"><textarea id="dm" rows="3" dir="auto" placeholder="${t('صف المشكلة أو الصق الخطأ…', 'Describe the problem or paste the error…')}"></textarea><button class="btn primary" id="ds">${t('إرسال', 'Send')}</button></div>`;
    const add = (role, content) => { hist.push({ role, content }); const d = document.createElement('div'); d.className = 'msg ' + role; d.innerHTML = `<pre style="white-space:pre-wrap;margin:0" dir="auto">${esc(content)}</pre>`; $('#dl').appendChild(d); $('#dl').scrollTop = 1e9; };
    $('#ds').onclick = async () => { const m = $('#dm').value.trim(); if (!m) return; const prev = hist.slice(); $('#dm').value = ''; add('user', m); $('#ds').disabled = true; const r = await post('/api/admin/assistant', { message: m, history: prev }); $('#ds').disabled = false; if (r.status === 401) return login(); add('assistant', r.ok ? r.j.answer : t('تعذّر الحصول على إجابة (تحقق من مزود الذكاء الاصطناعي).', 'Could not get an answer (check the AI provider).')); };
  }
  async function log() {
    const r = await api('/api/admin/audit'); if (!guard(r)) return;
    $('#view').innerHTML = tbl([t('الوقت', 'Time'), t('الإجراء', 'Action'), t('التفاصيل', 'Detail')], (r.j.log || []).map((x) => [x.created_at, x.action, x.detail]));
  }
  api('/api/admin/session').then((r) => (r.ok ? shell() : login())).catch(() => login('Network error'));
})();
