(function () {
  const form = document.getElementById('report-form');
  if (!form) return;
  const status = document.getElementById('report-status');
  const submit = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (document.getElementById('report-company').value) return;
    const body = {
      type: document.getElementById('report-type').value,
      page: document.getElementById('report-page').value.trim(),
      email: document.getElementById('report-email').value.trim(),
      message: document.getElementById('report-message').value.trim(),
      company: document.getElementById('report-company').value
    };
    submit.disabled = true;
    status.textContent = document.documentElement.lang === 'en' ? 'Sending…' : 'جارٍ إرسال البلاغ…';
    try {
      const response = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'SEND_FAILED');
      form.reset();
      status.textContent = document.documentElement.lang === 'en' ? 'Report received. You can follow its status from the site administrator.' : 'تم استلام البلاغ. سيظهر لدى إدارة الموقع لمراجعته.';
      status.className = 'tool-status';
    } catch (_) {
      status.textContent = document.documentElement.lang === 'en' ? 'Could not send. Please try again later.' : 'تعذّر إرسال البلاغ. حاول مرة أخرى لاحقًا.';
      status.className = 'tool-status err';
    } finally { submit.disabled = false; }
  });
})();