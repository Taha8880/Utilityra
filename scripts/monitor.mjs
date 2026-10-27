// Live-site monitor used by CI and the monitor workflow. Exit code 1 on any failure.
// Usage: SITE_URL=https://example.com node scripts/monitor.mjs [--strict] [--report file.md]
import { writeFileSync } from 'node:fs';
const site = (process.env.SITE_URL || 'https://utilityra.tavengers16.workers.dev').replace(/\/$/, '');
const args = process.argv.slice(2);
const checks = [
  ['home', '/', 200, /Utilityra/],
  ['tools index', '/tools/', 200, /<h1/],
  ['tool page', '/tools/word-counter/', 200, /data-tool="word-counter"/],
  ['ai tool page', '/tools/ai-summarizer/', 200, /data-tool="ai-summarizer"/],
  ['sitemap', '/sitemap.xml', 200, /<urlset/],
  ['robots', '/robots.txt', 200, /Sitemap:/i],
  ['ads.txt', '/ads.txt', 200, /google\.com/],
  ['health', '/health', 200, /"ok":true/],
  ['404', '/definitely-missing-page-xyz/', 404, null],
  ['legacy alias', '/tools/sort-lines', 200, /data-tool="line-sorter"/]
];
const rows = []; let bad = 0;
for (const [name, path, status, re] of checks) {
  const t0 = Date.now();
  try {
    const r = await fetch(site + path, { redirect: 'follow', headers: { 'user-agent': 'UtilityraMonitor/1.0' } });
    const body = await r.text();
    let detail = '';
    let ok = r.status === status && (!re || re.test(body));
    if (path === '/sitemap.xml') {
      const type = (r.headers.get('content-type') || '').toLowerCase();
      const locs = [...body.matchAll(/<loc>([^<]+)<\\/loc>/g)].map((m) => m[1]);
      ok = ok && type.includes('application/xml') && body.startsWith('<?xml') &&
        /<urlset\\b[^>]*xmlns="http:\\/\\/www\\.sitemaps\\.org\\/schemas\\/sitemap\\/0\\.9"/.test(body) &&
        /<\\/urlset>\\s*$/.test(body) && locs.length >= 50 &&
        locs.every((loc) => { try { const u = new URL(loc); return u.origin === site && !u.pathname.startsWith('/admin') && !u.pathname.includes('404'); } catch { return false; } });
      if (!ok) detail = ` content-type=${type || '(missing)'}, loc-count=${locs.length}`;
    }
    if (path === '/robots.txt') {
      const type = (r.headers.get('content-type') || '').toLowerCase();
      ok = ok && type.startsWith('text/plain') && body.includes(site + '/sitemap.xml') && !body.includes('&lt;');
      if (!ok) detail = ` content-type=${type || '(missing)'}`;
    }
    rows.push({ name, path, status: r.status, ms: Date.now() - t0, ok, detail }); if (!ok) bad++;
    rows.push({ name, path, status: r.status, ms: Date.now() - t0, ok }); if (!ok) bad++;
  } catch (e) { rows.push({ name, path, status: 0, ms: Date.now() - t0, ok: false, err: String(e.message) }); bad++; }
}
const md = `# Utilityra live check — ${new Date().toISOString()}\n\nSite: ${site}\n\n| check | path | status | ms | result |\n|---|---|---|---|---|\n` + rows.map((r) => `| ${r.name} | \`${r.path}\` | ${r.status} | ${r.ms} | ${r.ok ? 'PASS' : 'FAIL' + (r.err ? ' ' + r.err : '')} |`).join('\n') + '\n';
console.log(md);
const i = args.indexOf('--report'); if (i >= 0) writeFileSync(args[i + 1], md);
process.exit(bad ? 1 : 0);
