#!/usr/bin/env node
// Build a portable status snapshot from GitHub Actions and public HTTP smoke checks.
// Never logs secrets or response bodies.
// Keep this script dependency-free so the status report can be regenerated in CI and from a ZIP checkout.
import fs from 'node:fs';
import path from 'node:path';

const repository = process.env.GITHUB_REPOSITORY || 'Taha8880/Utilityra';
const token = process.env.GITHUB_TOKEN || '';
const base = 'https://utilityra.tavengers16.workers.dev';
const api = 'https://api.github.com/repos/' + repository;

async function json(url) {
  const r = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    signal: AbortSignal.timeout(15000)
  });
  if (!r.ok) throw new Error('GitHub API HTTP ' + r.status);
  return r.json();
}
async function check(url) {
  const start = Date.now();
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
    await r.body?.cancel();
    return { url, status: r.status, ok: r.status >= 200 && r.status < 400, ms: Date.now() - start };
  } catch (e) {
    return { url, status: null, ok: false, ms: Date.now() - start, error: String(e?.name || 'NetworkError') };
  }
}
const clean = (v) => String(v ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('\r', ' ');
const date = (v) => v ? new Date(v).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC') : 'غير متاح';
const outcome = (r) => !r ? 'لم يُعثر على تشغيل' : r.status !== 'completed' ? 'قيد التنفيذ: ' + r.status : ({success:'نجاح',failure:'فشل',cancelled:'أُلغي',timed_out:'انتهت المهلة',action_required:'يتطلب إجراء',skipped:'تخطٍّ'})[r.conclusion] || String(r.conclusion || 'غير معروف');

let runs = [], commits = [], validateRuns = [], browserRuns = [], deployRuns = [], warning = '';
try {
  const results = await Promise.all([
    json(api + '/actions/runs?per_page=15'),
    json(api + '/commits?per_page=8'),
    json(api + '/actions/workflows/validate.yml/runs?per_page=3'),
    json(api + '/actions/workflows/playwright.yml/runs?per_page=3'),
    json(api + '/actions/workflows/deploy-worker.yml/runs?per_page=3')
  ]);
  runs = results[0].workflow_runs || [];
  commits = results[1] || [];
  validateRuns = results[2].workflow_runs || [];
  browserRuns = results[3].workflow_runs || [];
  deployRuns = results[4].workflow_runs || [];
} catch (e) { warning = String(e.message || 'تعذر جلب بيانات GitHub'); }

const checks = await Promise.all([
  check(base + '/'),
  check(base + '/robots.txt'),
  check(base + '/sitemap.xml'),
  check(base + '/tools/word-counter'),
  check(base + '/tools/pdf-to-text')
]);
const latest = (pattern) => runs.find((r) => pattern.test(r.name || ''));
const validate = validateRuns[0] || latest(/validate/i), browser = browserRuns[0] || latest(/playwright|browser/i), deploy = deployRuns[0] || latest(/deploy/i);
const lines = [
  '# Utilityra — الحالة الآلية للمشروع',
  '',
  '> آخر تحديث تلقائي: ' + date(new Date().toISOString()),
  '> يولّد هذا الملف GitHub Actions. هو فحص مؤشرات وليس ضمانًا أن كل أداة صحيحة، ولا يحتوي أسرارًا.',
  '',
  '## الملخص',
  '',
  '- المستودع: https://github.com/' + repository,
  '- الموقع العام: ' + base + '/',
  '- آخر commit معروف: ' + (commits[0] ? '[' + commits[0].sha.slice(0,7) + '](https://github.com/' + repository + '/commit/' + commits[0].sha + ') — ' + clean(commits[0].commit?.message?.split('\n')[0]) : 'غير متاح'),
  '- فحص الموقع: ' + (checks.every((c) => c.ok) ? 'كل مسارات الفحص الأساسية استجابت بنجاح' : 'يوجد فشل أو استجابة غير ناجحة؛ راجع الجدول'),
  warning ? '- تحذير API: ' + clean(warning) : '',
  '',
  '## فحوصات الموقع المباشرة',
  '',
  '| المسار | HTTP | النتيجة | الزمن (ms) |',
  '|---|---:|---|---:|',
  ...checks.map((c) => '| [' + clean(c.url.replace(base, '') || '/') + '](' + c.url + ') | ' + (c.status ?? 'لا توجد استجابة') + ' | ' + (c.ok ? 'نجاح HTTP' : 'فشل' + (c.error ? ' (' + clean(c.error) + ')' : '')) + ' | ' + c.ms + ' |'),
  '',
  '> الفحص الحي يقيس الاستجابة فقط؛ لا يثبت صحة وظائف الأدوات أو جودة التصميم أو قبول الفهرسة من Google.',
  '',
  '## آخر تشغيل معروف لكل نوع',
  '',
  '| النوع | الحالة | آخر تحديث | commit | الرابط |',
  '|---|---|---|---|---|',
  ...[['التحقق الأساسي',validate],['اختبارات المتصفح',browser],['النشر',deploy]].map(([label,r]) => '| ' + label + ' | ' + outcome(r) + ' | ' + date(r?.updated_at) + ' | ' + (r ? r.head_sha.slice(0,7) : '—') + ' | ' + (r ? '[عرض التشغيل](' + r.html_url + ')' : '—') + ' |'),
  '',
  '## آخر تشغيلات GitHub Actions',
  '',
  '| Workflow | الحالة | بدأ | commit | الرابط |',
  '|---|---|---|---|---|',
  ...runs.slice(0,12).map((r) => '| ' + clean(r.name) + ' | ' + outcome(r) + ' | ' + date(r.run_started_at || r.created_at) + ' | ' + r.head_sha.slice(0,7) + ' | [التفاصيل](' + r.html_url + ') |'),
  '',
  '## آخر التعديلات',
  '',
  '| commit | التاريخ | التعديل |',
  '|---|---|---|',
  ...commits.slice(0,8).map((c) => '| [' + c.sha.slice(0,7) + '](https://github.com/' + repository + '/commit/' + c.sha + ') | ' + date(c.commit?.author?.date) + ' | ' + clean(c.commit?.message?.split('\n')[0]) + ' |'),
  '',
  '## تفسير التقرير',
  '',
  '- هذا الملف مولّد من GitHub Actions وطلبات HTTP عامة.',
  '- سجل الكود الكامل في Git history؛ المتطلبات في docs/UTILITYRA_REQUIREMENTS_AR.md والمرجع الفني في docs/UTILITYRA_MASTER_REFERENCE_AR.md.',
  '- لا تعتبر المشكلة محلولة إلا بعد نجاح الاختبار المرتبط بها وفحص الإنتاج عند الحاجة.',
  '- عند فشل فحص حي، افحص سجل Cloudflare ونتائج الاختبارات. لا يتضمن هذا التقرير تفاصيل حساسة.',
  ''
].filter((line) => line !== '');
const output = path.join(process.cwd(), 'docs', 'STATUS_LATEST_AR.md');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, lines.join('\n') + '\n', 'utf8');
console.log('Generated status report. Public checks: ' + checks.filter((c) => c.ok).length + '/' + checks.length + '; workflows: ' + runs.length + '; commits: ' + commits.length);
