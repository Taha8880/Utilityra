import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/src/index.js';
import { parseTarget, isBlockedHost, inspectUrl } from '../worker/src/inspect.js';
import { makeToken, validToken, sameSecret, runChecks } from '../worker/src/admin.js';

const ASSETS = { fetch: async (req) => new Response('<html>asset ' + new URL(req.url).pathname + '</html>', { headers: { 'content-type': 'text/html' } }) };
const call = (path, init = {}, env = {}) => worker.fetch(new Request('https://utilityra.test' + path, init), { ASSETS, ...env });
const ai = (body, env, headers = {}) => call('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }, env);
const okAI = { AI: { run: async () => ({ response: 'مرحبا' }) } };

test('health reports providers', async () => {
  const r = await call('/health', {}, okAI); const j = await r.json();
  assert.equal(r.status, 200); assert.equal(j.ok, true); assert.deepEqual(j.ai, ['workers-ai']);
});
test('non-API paths fall through to assets', async () => {
  const r = await call('/tools/word-counter/'); assert.match(await r.text(), /asset \/tools\/word-counter/);
});
test('ai: success via Workers AI', async () => {
  const r = await ai({ tool: 'ai-summarizer', message: 'نص طويل للتلخيص' }, okAI); const j = await r.json();
  assert.equal(r.status, 200); assert.equal(j.answer, 'مرحبا'); assert.equal(j.provider, 'workers-ai');
});
test('ai: rejects unknown tool, empty and oversize messages', async () => {
  assert.equal((await ai({ tool: 'nope', message: 'x' }, okAI)).status, 400);
  assert.equal((await ai({ tool: 'ai-summarizer', message: '   ' }, okAI)).status, 400);
  assert.equal((await ai({ tool: 'ai-summarizer', message: 'x'.repeat(8001) }, okAI)).status, 413);
});
test('ai: requires JSON content-type', async () => {
  const r = await call('/api/ai', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }, okAI);
  assert.equal(r.status, 415);
});
test('ai: 503 when no provider configured', async () => {
  const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, {}); assert.equal(r.status, 503); assert.equal((await r.json()).error, 'PROVIDER_NOT_CONFIGURED');
});
test('ai: GET not allowed; foreign origin blocked', async () => {
  assert.equal((await call('/api/ai', {}, okAI)).status, 405);
  assert.equal((await ai({ tool: 'ai-summarizer', message: 'hi' }, okAI, { origin: 'https://evil.example' })).status, 403);
});
test('ai: allow-listed origin gets CORS header', async () => {
  const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, { ...okAI, ALLOWED_ORIGINS: 'https://utilityra.com' }, { origin: 'https://utilityra.com' });
  assert.equal(r.headers.get('access-control-allow-origin'), 'https://utilityra.com');
});
test('ai: falls back to next provider and hides upstream errors', async () => {
  const bad = { AI: { run: async () => { throw new Error('secret upstream detail'); } } };
  const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, bad); const t = await r.text();
  assert.equal(r.status, 502); assert.ok(!t.includes('secret upstream'));
});
test('unknown /api path is 404 JSON', async () => { const r = await call('/api/zzz'); assert.equal(r.status, 404); });

test('inspect: SSRF guard blocks private/loopback targets', () => {
  for (const h of ['localhost', '127.0.0.1', '10.0.0.5', '192.168.1.1', '172.16.0.1', '169.254.169.254', '[::1]', 'intranet', '2130706433', '0x7f000001', 'foo.local'])
    assert.equal(isBlockedHost(h.replace(/^\[|\]$/g, '')), true, h);
  assert.equal(isBlockedHost('example.com'), false);
  assert.equal(parseTarget('http://user:pw@example.com'), null);
  assert.equal(parseTarget('ftp://example.com'), null);
  assert.equal(parseTarget('https://example.com:8080'), null);
  assert.ok(parseTarget('example.com'));
});
test('inspect: returns headers/html and blocks redirect to private host', async () => {
  const f = async () => new Response('<title>x</title>', { headers: { 'content-type': 'text/html', 'x-test': '1' } });
  const r = await inspectUrl('example.com', f); assert.equal(r.status, 200); assert.equal(r.body.headers['x-test'], '1'); assert.match(r.body.html, /title/);
  const g = async () => new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } });
  assert.equal((await inspectUrl('example.com', g)).body.error, 'REDIRECT_BLOCKED');
  assert.equal((await inspectUrl('http://localhost')).status, 400);
});
test('inspect endpoint validates url', async () => {
  const r = await call('/api/inspect?url=http://127.0.0.1'); assert.equal(r.status, 400);
});

test('admin: token sign/verify, expiry and tamper detection', async () => {
  const exp = Math.floor(Date.now() / 1000) + 60; const tok = await makeToken('s3cret', exp);
  assert.equal(await validToken(tok, 's3cret'), true);
  assert.equal(await validToken(tok, 'other'), false);
  assert.equal(await validToken(tok.replace(/^\d+/, String(exp + 999)), 's3cret'), false);
  assert.equal(await validToken(await makeToken('s3cret', 1), 's3cret'), false);
  assert.equal(await sameSecret('a', 'a'), true); assert.equal(await sameSecret('a', 'b'), false);
});
test('admin: routes are 503 unconfigured and 401 unauthenticated', async () => {
  assert.equal((await call('/api/admin/stats')).status, 503);
  const env = { DB: {}, ADMIN_PASSWORD: 'p', ADMIN_SESSION_SECRET: 's' };
  assert.equal((await call('/api/admin/stats', {}, env)).status, 401);
  assert.equal((await call('/api/admin/engineer/run', { method: 'POST' }, env)).status, 401);
});
test('analytics: ignores when DB missing, rejects bad payloads', async () => {
  const post = (b, env) => call('/api/analytics/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }, env);
  assert.equal((await post({ visitorKey: 'a'.repeat(20), eventType: 'page_view' }, {})).status, 202);
  const rows = []; const DB = { prepare: () => ({ bind: (...a) => ({ run: async () => rows.push(a) }) }) };
  assert.equal((await post({ visitorKey: 'short', eventType: 'page_view' }, { DB })).status, 400);
  assert.equal((await post({ visitorKey: 'a'.repeat(20), eventType: 'hack' }, { DB })).status, 400);
  const ok = await post({ visitorKey: 'a'.repeat(20), eventType: 'search_miss', path: '/x', searchTerm: 'mail me a@b.com 01012345678' }, { DB });
  assert.equal(ok.status, 202); assert.equal(rows.length, 1); assert.ok(!/a@b\.com|01012345678/.test(rows[0].join('|')));
});
test('engineer: health checks detect failures', async () => {
  const f = async (u) => (u.endsWith('/') && !u.includes('word') ? new Response('Utilityra <h1', { status: 200 }) : new Response('x', { status: 500 }));
  const res = await runChecks('https://x.test', f); assert.ok(res.some((r) => r.ok)); assert.ok(res.some((r) => !r.ok));
});
