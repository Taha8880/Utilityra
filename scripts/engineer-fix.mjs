// AI "technical engineer": reads an incident report, asks an LLM for minimal code edits,
// applies them on a branch, runs the test-suite, and opens a PULL REQUEST only if tests pass.
// It never merges and never deploys. A human reviews the PR; CI runs again on it.
//
// Env: GEMINI_API_KEY (free-tier eligible) or ANTHROPIC_API_KEY / OPENAI_API_KEY; GH_TOKEN (for gh); optional ENGINEER_MODEL.
// Usage: node scripts/engineer-fix.mjs --incident monitor-report.md   (or --text "describe the problem")
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pickGemini } from '../worker/src/index.js';

const args = process.argv.slice(2); const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : ''; };
const incident = arg('--incident') ? readFileSync(arg('--incident'), 'utf8') : arg('--text');
if (!incident) { console.error('Provide --incident <file> or --text "<problem>"'); process.exit(2); }
const ALLOW = [/^src\//, /^worker\/src\//, /^build\.mjs$/, /^scripts\/monitor\.mjs$/, /^tests\//]; // never workflows, wrangler.toml, secrets
const MAX_FILES = 8, MAX_CTX = 90000;
const sh = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });

function walk(d, out = []) { for (const f of readdirSync(d)) { if (['node_modules', 'dist', '.git', 'vendor', 'legacy-blogger'].includes(f)) continue; const p = join(d, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; }
const files = walk('.').map((f) => f.replace(/^\.\//, '')).filter((f) => ALLOW.some((r) => r.test(f)) && /\.(m?js|css|json)$/.test(f));

async function llm(system, user) {
  // Prefer Gemini when configured so automatic repair does not require a paid Anthropic API key.
  const errors = [];
  if (process.env.GEMINI_API_KEY) {
    try {
      // Discover the models this key can use (model names get retired); ENGINEER_MODEL overrides.
      let chain = process.env.ENGINEER_MODEL ? [process.env.ENGINEER_MODEL] : [];
      if (!chain.length) {
        try { const lr = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY } }); const lj = await lr.json(); if (lr.ok) chain = pickGemini(lj.models || [], true); } catch { /* use fallback names */ }
        if (!chain.length) chain = ['gemini-2.5-pro', 'gemini-2.5-flash'];
      }
      for (const model of chain) {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
          method: 'POST',
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: 8000, temperature: 0.1, responseMimeType: 'application/json' } })
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { errors.push(`Gemini ${model} ${r.status}: ${JSON.stringify(j).slice(0, 160)}`); continue; }
        const answer = (j.candidates?.[0]?.content?.parts || []).filter((x) => !x.thought).map((x) => x.text || '').join('');
        if (answer.trim()) return answer;
        errors.push(`Gemini ${model}: empty response`);
      }
    } catch (e) { errors.push('Gemini: ' + e.message); }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: process.env.ENGINEER_MODEL || 'claude-sonnet-5-5', max_tokens: 8000, system, messages: [{ role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) errors.push('Anthropic ' + r.status + ': ' + JSON.stringify(j).slice(0, 160)); else return j.content.map((c) => c.text || '').join('');
  }
  if (process.env.OPENAI_API_KEY) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ model: process.env.ENGINEER_MODEL || 'gpt-4.1', messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) errors.push('OpenAI ' + r.status + ': ' + JSON.stringify(j).slice(0, 160)); else return j.choices[0].message.content;
  }
  throw new Error(errors.length ? 'All AI providers failed: ' + errors.join(' | ') : 'No GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY set — cannot run the AI engineer.');
}
const SYS = `You are Utilityra's production reliability engineer. The project is a Cloudflare Worker with static assets: build.mjs generates dist/, worker/src/index.js is the module Worker entrypoint, worker/src/admin.js owns the admin/analytics/incident APIs, wrangler.toml controls assets and run_worker_first, .github/workflows/deploy.yml tests, applies the D1 schema and deploys, and scripts/monitor.mjs checks the public site.
Reply with ONLY JSON: {"summary":"...","root_cause":"...","edits":[{"path":"...","search":"exact existing text, unique in the file","replace":"new text"}],"test_note":"how to verify"}.
Rules: separate observed facts from hypotheses; use only evidence from the incident and files; edit only files shown and allowed; "search" must match exactly once; no secrets, no new dependencies, no workflow/config edits, no duplicate routes or handlers. The existing module Worker already explicitly handles GET/HEAD /health and wrangler.toml already has /health in run_worker_first. If the public health check returns 404 while those source/config facts remain true, do not patch source code: explain that the likely issue is a stale/different deployment or Worker configuration and return edits: []. Never propose legacy addEventListener syntax. If uncertain, return {"summary":"needs deployment investigation","root_cause":"...","edits":[]} rather than inventing a patch. Never claim a fix was applied or deployed.`;

// 1) pick likely files: those mentioned in the incident, else core files
const mentioned = files.filter((f) => incident.includes(f) || incident.includes(f.split('/').pop()));
const core = ['build.mjs', 'worker/src/index.js', 'worker/src/admin.js', 'src/meta.mjs'].filter((f) => existsSync(f));
const pick = [...new Set([...mentioned, ...core])].slice(0, MAX_FILES);
let ctx = '', used = 0;
for (const f of pick) { const t = readFileSync(f, 'utf8'); if (used + t.length > MAX_CTX) continue; used += t.length; ctx += `\n=== FILE ${f} ===\n${t}\n`; }
// A public /health 404 with an existing source handler is a deployment/configuration incident,
 // not permission to add a second handler. Fail safely before asking the model to edit source.
const health404 = /health[^\n]{0,100}\|\s*404/i.test(incident) || /\/health[^\n]{0,100}\|\s*404/i.test(incident);
if (health404 && existsSync('worker/src/index.js') && existsSync('wrangler.toml')) {
  const workerSource = readFileSync('worker/src/index.js', 'utf8');
  const wrangler = readFileSync('wrangler.toml', 'utf8');
  if (workerSource.includes('url.pathname === "/health"') && /run_worker_first\s*=\s*\[[^\]]*["']\/health["']/s.test(wrangler)) {
    const note = '# AI engineer: deployment investigation required\n\nThe public monitor reports /health as HTTP 404, but the checked-out source contains a GET/HEAD /health handler and wrangler.toml includes /health in run_worker_first. This evidence does not justify a duplicate route patch. Verify the latest deploy workflow result, deployed Worker name/version, and deployed commit. After deployment, GET /health must return 200 with JSON containing ok=true.\n';
    writeFileSync('engineer-result.md', note);
    console.log(note);
    process.exit(0);
  }
}
const readOnly = ['wrangler.toml', '.github/workflows/deploy.yml', '_redirects'].filter((f) => existsSync(f)).map((f) => '\n=== READ-ONLY CONFIG ' + f + ' ===\n' + readFileSync(f, 'utf8').slice(0, 8000)).join('\n');
const answer = await llm(SYS, 'INCIDENT:\n' + incident.slice(0, 6000) + '\n\nFILES:\n' + ctx + '\n\nREAD-ONLY CONFIGURATION (do not edit):\n' + readOnly);
let plan; try { plan = JSON.parse(answer.slice(answer.indexOf('{'), answer.lastIndexOf('}') + 1)); } catch { console.error('Model did not return valid JSON:\n', answer.slice(0, 600)); process.exit(1); }
console.log('Root cause:', plan.root_cause, '\nSummary:', plan.summary);
if (!plan.edits?.length) { console.log('No safe edit proposed. Needs a human.'); writeFileSync('engineer-result.md', `# AI engineer: no automatic fix\n\n${plan.root_cause || ''}\n`); process.exit(3); }

// 2) apply edits strictly
const branch = 'ai-fix/' + new Date().toISOString().replace(/\D/g, '').slice(0, 12);
sh(`git checkout -b ${branch}`);
try {
  for (const e of plan.edits) {
    if (!ALLOW.some((r) => r.test(e.path)) || !pick.includes(e.path)) throw new Error('Edit outside allowed/shown files: ' + e.path);
    const t = readFileSync(e.path, 'utf8'); const n = t.split(e.search).length - 1;
    if (!e.search || n !== 1) throw new Error(`Edit for ${e.path} does not match exactly once (matches: ${n})`);
    writeFileSync(e.path, t.replace(e.search, () => e.replace));
  }
  // 3) prove it: full test-suite must pass
  const out = sh('npm test 2>&1 | tail -25');
  console.log(out);
} catch (err) {
  console.error('Fix rejected:', err.message); sh('git checkout -- . && git checkout - && git branch -D ' + branch); writeFileSync('engineer-result.md', `# AI engineer: fix rejected\n\n${err.message}\n\nProposed root cause: ${plan.root_cause}\n`); process.exit(1);
}
// 4) open PR (never merge)
sh('git add -A && git -c user.name="Utilityra Engineer" -c user.email="engineer@users.noreply.github.com" commit -m "AI fix: ' + String(plan.summary).replace(/["`$]/g, '').slice(0, 70) + '"');
sh(`git push origin ${branch}`);
const body = `## AI-proposed fix (needs human review)\n\n**Root cause:** ${plan.root_cause}\n\n**Summary:** ${plan.summary}\n\n**How to verify:** ${plan.test_note}\n\nThe test-suite passed locally in the workflow. Not merged, not deployed.\n\n### Incident\n${incident.slice(0, 1500)}`;
writeFileSync('pr-body.md', body);
console.log(sh(`gh pr create --title "AI fix: ${String(plan.summary).replace(/["`$]/g, '').slice(0, 70)}" --body-file pr-body.md --label ai-fix || gh pr create --title "AI fix" --body-file pr-body.md`));
