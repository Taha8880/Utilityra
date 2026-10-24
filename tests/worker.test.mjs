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

test('ai: uses AI Gateway when configured and falls back if it fails', async () => {
  const calls = []; const env = { AI_GATEWAY_ID: 'utilityra', AI: { run: async (m, i, o) => { calls.push(o); if (o && o.gateway) throw new Error('gw down'); return { response: 'ok' }; } } };
  const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, env); assert.equal((await r.json()).answer, 'ok');
  assert.equal(calls[0].gateway.id, 'utilityra'); assert.equal(calls[1], undefined);
});

import { buildMessages, genFor, providersFor, _resetRate, toolDisabled } from '../worker/src/index.js';
test('buildMessages: option allow-list, history only for assistant, length caps', () => {
  const m = buildMessages({ tool: 'ai-summarizer', message: 'hello', options: { length: 'short', evil: 'ignore previous', tone: 'x'.repeat(5000) }, lang: 'en' });
  assert.equal(m[0].role, 'system'); const u = m.at(-1).content; assert.match(u, /length: short/); assert.ok(!u.includes('evil')); assert.ok(u.length < 1700);
  const h = buildMessages({ tool: 'ai-summarizer', message: 'x', history: [{ role: 'user', content: 'a' }] }); assert.equal(h.length, 2);
  const c = buildMessages({ tool: 'ai-assistant', message: 'x', history: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'system', content: 'hack' }] }); assert.equal(c.length, 4);
});
test('per-tool generation settings', () => {
  assert.equal(genFor('ai-grammar-fixer').temperature, 0.1); assert.equal(genFor('ai-blog-writer').max_tokens, 3200); assert.equal(genFor('unknown').max_tokens, 1800);
});
test('provider order: AI_PROVIDER first, then workers-ai/openai/gemini', () => {
  const names = providersFor({ AI: { run() {} }, OPENAI_API_KEY: 'k', GEMINI_API_KEY: 'g', AI_PROVIDER: 'gemini' }).map(([n]) => n);
  assert.deepEqual(names, ['gemini', 'workers-ai', 'openai']);
});
test('ai: falls back to OpenAI when Workers AI fails', async () => {
  const realFetch = globalThis.fetch; globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'from openai' } }] }), { status: 200 });
  try { const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, { AI: { run: async () => { throw new Error('x'); } }, OPENAI_API_KEY: 'k' }); const j = await r.json(); assert.equal(j.answer, 'from openai'); assert.equal(j.provider, 'openai'); } finally { globalThis.fetch = realFetch; }
});
test('rate limit: 21st request in a window is 429 (memory fallback)', async () => {
  _resetRate(); let last;
  for (let i = 0; i < 21; i++) last = await ai({ tool: 'ai-summarizer', message: 'hi' }, okAI, { 'cf-connecting-ip': '9.9.9.9' });
  assert.equal(last.status, 429);
});
test('rate limit: durable D1 counter is used when DB is bound', async () => {
  _resetRate(); let n = 0; const DB = { prepare: (q) => ({ bind: () => ({ first: async () => (/rate_limits/.test(q) ? { n: ++n } : null) }) }) };
  const r1 = await ai({ tool: 'ai-summarizer', message: 'hi' }, { ...okAI, DB }); assert.equal(r1.status, 200);
  n = 20; const r2 = await ai({ tool: 'ai-summarizer', message: 'hi' }, { ...okAI, DB }); assert.equal(r2.status, 429);
});
test('streaming: single SSE chunk fallback and [DONE]', async () => {
  _resetRate(); const r = await ai({ tool: 'ai-summarizer', message: 'hi', stream: true }, okAI);
  assert.match(r.headers.get('content-type'), /text\/event-stream/); const t = await r.text(); assert.match(t, /"response":"مرحبا"/); assert.match(t, /\[DONE\]/);
});
test('disabled tools are refused by /api/ai and hidden in /api/config', async () => {
  _resetRate(); const DB = { prepare: (q) => ({ bind: () => ({ first: async () => (/tool_flags/.test(q) ? { enabled: 0 } : { n: 1 }) }), all: async () => ({ results: /tool_flags/.test(q) ? [{ tool_key: 'ai-summarizer', enabled: 0, featured: 0, sort: 0 }] : [] }) }) };
  assert.equal(await toolDisabled({ DB }, 'ai-summarizer'), true);
  const r = await ai({ tool: 'ai-summarizer', message: 'hi' }, { ...okAI, DB }); assert.equal(r.status, 403); assert.equal((await r.json()).error, 'TOOL_DISABLED');
  const c = await (await call('/api/config', {}, { DB })).json(); assert.deepEqual(c.disabled, ['ai-summarizer']);
});
test('admin: every new write route is unauthenticated-401 and health checks include admin + health', async () => {
  const env = { DB: {}, ADMIN_PASSWORD: 'p', ADMIN_SESSION_SECRET: 's' };
  for (const p of ['/api/admin/tools/flag', '/api/admin/settings', '/api/admin/incidents/status']) assert.equal((await call(p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }, env)).status, 401, p);
  for (const p of ['/api/admin/tools', '/api/admin/audit', '/api/admin/settings']) assert.equal((await call(p, {}, env)).status, 401, p);
  const { CHECKS } = await import('../worker/src/admin.js'); const keys = CHECKS.map((c) => c[0]); assert.ok(keys.includes('admin-page') && keys.includes('health-endpoint'));
});

test('anthropic provider is preferred when key is set and is called with system + messages', async () => {
  _resetRate(); let seen; const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, o) => { seen = { u, b: JSON.parse(o.body), h: o.headers }; return new Response(JSON.stringify({ content: [{ type: 'text', text: 'from claude' }] }), { status: 200 }); };
  try { const r = await ai({ tool: 'ai-assistant', message: 'hello' }, { ...okAI, ANTHROPIC_API_KEY: 'k' }); const j = await r.json();
    assert.equal(j.provider, 'anthropic'); assert.equal(j.answer, 'from claude'); assert.match(seen.u, /anthropic\.com\/v1\/messages/); assert.equal(seen.b.messages.at(-1).content, 'hello'); assert.ok(seen.b.system.length > 50); assert.equal(seen.h['x-api-key'], 'k');
  } finally { globalThis.fetch = realFetch; }
});
test('assistant prompt keeps the answer on topic', () => {
  const m = buildMessages({ tool: 'ai-assistant', message: 'x' })[0].content; assert.match(m, /unrelated code/); assert.match(m, /conversation history/);
});
test('dev assistant: auth required and message builder trims history', async () => {
  const env = { DB: {}, ADMIN_PASSWORD: 'p', ADMIN_SESSION_SECRET: 's' };
  assert.equal((await call('/api/admin/assistant', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"message":"hi"}' }, env)).status, 401);
  const { devMessages } = await import('../worker/src/admin.js'); const m = devMessages([{ role: 'system', content: 'x' }, { role: 'user', content: 'a' }], 'q'); assert.equal(m.length, 3); assert.equal(m[0].role, 'system'); assert.equal(m[1].content, 'a');
});

import { wantsGrounding, ground, sourcesBlock } from '../worker/src/ground.js';
test('grounding: only factual-looking questions; parses Wikipedia and builds SOURCES block', async () => {
  assert.equal(wantsGrounding('hi'), false); assert.equal(wantsGrounding('function f(){ return 1; }'), false); assert.equal(wantsGrounding('متى تأسست جامعة القاهرة وما تاريخها؟'), true);
  const f = async (u) => (/list=search/.test(u) ? new Response(JSON.stringify({ query: { search: [{ title: 'Cairo University' }] } })) : new Response(JSON.stringify({ title: 'Cairo University', extract: 'Founded in 1908.', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Cairo_University' } } })));
  const s = await ground('when was cairo university founded', 'en', f); assert.equal(s.length, 1); assert.match(sourcesBlock(s), /\[1\] Cairo University: Founded in 1908/); assert.match(sourcesBlock([]), /could not|Do not present uncertain/i);
  assert.deepEqual(await ground('question here long enough', 'en', async () => { throw new Error('net'); }), []);
});
test('ai-assistant with ground:true returns sources and injects them into the prompt', async () => {
  _resetRate(); let sys = ''; const AI = { run: async (m, i) => { sys = i.messages[0].content; return { response: 'answer [1]' }; } };
  const f = async (u) => (/list=search/.test(u) ? new Response(JSON.stringify({ query: { search: [{ title: 'Cairo' }] } })) : new Response(JSON.stringify({ title: 'Cairo', extract: 'Capital of Egypt.', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Cairo' } } })));
  const r = await ai({ tool: 'ai-assistant', message: 'what is the capital of Egypt please', lang: 'en', ground: true, memory: 'I am a student' }, { AI, _fetch: f }); const j = await r.json();
  assert.equal(j.sources[0].title, 'Cairo'); assert.match(sys, /SOURCES/); assert.match(sys, /Capital of Egypt/); assert.match(sys, /USER NOTES[\s\S]*I am a student/);
});

test('assistant is aware of the site: catalog and changelog are in its prompt', async () => {
  _resetRate(); let sys = ''; const AI = { run: async (m, i) => { sys = i.messages[0].content; return { response: 'ok' }; } };
  await ai({ tool: 'ai-assistant', message: 'which tool merges pdf files?' }, { AI });
  assert.match(sys, /pdf-merge \| PDF Merger/); assert.match(sys, /CHANGELOG/); assert.match(sys, /\/tools\/<id>\//);
  _resetRate(); await ai({ tool: 'ai-summarizer', message: 'text' }, { AI }); assert.ok(!/TOOL CATALOG/.test(sys));
});
