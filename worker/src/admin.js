// Optional admin / analytics / "technical engineer" module. Requires D1 (DB) plus the
// secrets ADMIN_PASSWORD and ADMIN_SESSION_SECRET. Without them every route answers 503 and
// the public site is unaffected.
const COOKIE = "ur_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const enc = new TextEncoder();

const b64u = (bytes) => { let s = ""; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); };
const unb64u = (v) => { const b = v.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(b + "=".repeat((4 - (b.length % 4)) % 4)), (c) => c.charCodeAt(0)); };
const hmacKey = (secret, usage) => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
export async function makeToken(secret, expires) { return `${expires}.${b64u(await crypto.subtle.sign("HMAC", await hmacKey(secret, "sign"), enc.encode(String(expires))))}`; }
export async function validToken(token, secret) {
  try {
    const [exp, sig] = String(token).split(".");
    if (!Number(exp) || Number(exp) < Math.floor(Date.now() / 1000) || !sig) return false;
    return await crypto.subtle.verify("HMAC", await hmacKey(secret, "verify"), unb64u(sig), enc.encode(exp));
  } catch { return false; }
}
const sha = async (v) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(v)));
const hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
export async function sameSecret(a, b) { const x = await sha(a), y = await sha(b); let d = 0; for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i]; return d === 0; }
export function cookieValue(request, name) { const p = (request.headers.get("cookie") || "").split(";").map((v) => v.trim()).find((v) => v.startsWith(name + "=")); return p ? decodeURIComponent(p.slice(name.length + 1)) : ""; }
export const configured = (env) => !!(env.DB && env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET);
export async function isAdmin(request, env) { return !!env.ADMIN_SESSION_SECRET && validToken(cookieValue(request, COOKIE), env.ADMIN_SESSION_SECRET); }

async function throttleKey(request, env) { return hex(await sha((request.headers.get("cf-connecting-ip") || "unknown") + ":" + env.ADMIN_SESSION_SECRET)); }
async function throttle(request, env) {
  const key = await throttleKey(request, env), now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare("SELECT attempts, window_started, blocked_until FROM admin_login_attempts WHERE ip_hash=?").bind(key).first();
  if (row && row.blocked_until > now) return { allowed: false, key };
  return { allowed: true, key };
}
async function failLogin(env, key) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare("SELECT attempts, window_started FROM admin_login_attempts WHERE ip_hash=?").bind(key).first();
  if (!row || now - row.window_started >= 900) await env.DB.prepare("INSERT INTO admin_login_attempts(ip_hash,attempts,window_started,blocked_until) VALUES(?,1,?,0) ON CONFLICT(ip_hash) DO UPDATE SET attempts=1, window_started=excluded.window_started, blocked_until=0").bind(key, now).run();
  else { const a = Number(row.attempts) + 1; await env.DB.prepare("UPDATE admin_login_attempts SET attempts=?, blocked_until=? WHERE ip_hash=?").bind(a, a >= 8 ? now + 900 : 0, key).run(); }
}

const BOT = /bot|crawler|spider|headless|playwright|puppeteer|lighthouse|inspectiontool|chatgpt|openai|anthropic|claude|perplexity|gemini|bingpreview|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp|curl\/|wget\/|node-fetch|undici|pagespeed|validator|ahrefsbot|semrushbot|screaming.?frog/i;
const EVENTS = ["page_view", "tool_open", "tool_action", "search", "search_miss"];
export async function recordEvent(request, env, body) {
  if (!env.DB) return { ignored: true, reason: "analytics_not_configured" };
  if (body?.reviewMode === true || BOT.test(request.headers.get("user-agent") || "") || cookieValue(request, COOKIE)) return { ignored: true, reason: "review_or_bot" };
  const visitor = typeof body.visitorKey === "string" ? body.visitorKey : "", type = typeof body.eventType === "string" ? body.eventType : "";
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitor)) throw new Error("INVALID_VISITOR_KEY");
  if (!EVENTS.includes(type)) throw new Error("INVALID_EVENT_TYPE");
  let path = typeof body.path === "string" ? body.path.split("?")[0].slice(0, 180) : "/";
  if (!path.startsWith("/") || path.startsWith("//") || /\/admin(\/|$)/i.test(path)) path = "/";
  const tool = typeof body.toolKey === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/i.test(body.toolKey) ? body.toolKey.toLowerCase() : "";
  let term = "";
  if (type === "search_miss" && typeof body.searchTerm === "string") term = body.searchTerm.toLowerCase().replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[email]").replace(/\+?\d[\d\s().-]{7,}\d/g, "[number]").replace(/[^\p{L}\p{N}\s_-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 70);
  let ref = ""; try { ref = new URL(String(body.referrer || "")).hostname.slice(0, 120); } catch { /* none */ }
  await env.DB.prepare("INSERT INTO analytics_events(visitor_key,event_type,path,tool_key,search_term,referrer_host) VALUES(?,?,?,?,?,?)").bind(visitor, type, path, tool, term, ref).run();
  return { accepted: true };
}

export async function stats(env) {
  const W = "created_at >= datetime('now','-30 days')";
  const q = (sql) => env.DB.prepare(sql).all().then((r) => r.results || []);
  const [summary] = await q(`SELECT COUNT(*) events, COUNT(DISTINCT visitor_key) visitors, SUM(event_type='page_view') page_views, SUM(event_type='tool_open') tool_opens, SUM(event_type='search') searches, SUM(event_type='search_miss') search_misses FROM analytics_events WHERE ${W}`);
  return {
    periodDays: 30, summary: summary || {},
    daily: await q(`SELECT date(created_at) day, COUNT(*) events, COUNT(DISTINCT visitor_key) visitors, SUM(event_type='page_view') page_views FROM analytics_events WHERE ${W} GROUP BY day ORDER BY day`),
    topPages: await q(`SELECT path, COUNT(*) views FROM analytics_events WHERE event_type='page_view' AND ${W} GROUP BY path ORDER BY views DESC LIMIT 12`),
    topTools: await q(`SELECT tool_key, SUM(event_type='tool_open') opens, SUM(event_type='tool_action') actions FROM analytics_events WHERE tool_key<>'' AND ${W} GROUP BY tool_key ORDER BY opens DESC, actions DESC LIMIT 15`),
    missedSearches: await q(`SELECT search_term, COUNT(*) searches FROM analytics_events WHERE event_type='search_miss' AND search_term<>'' AND ${W} GROUP BY search_term ORDER BY searches DESC LIMIT 20`)
  };
}

/* ---------- Technical engineer: detect -> record -> diagnose (AI) -> propose. Never self-deploys. ---------- */
export const CHECKS = [
  ["home", "/", (r, t) => r.status === 200 && /Utilityra/.test(t)],
  ["tools-index", "/tools/", (r, t) => r.status === 200 && /<h1/.test(t)],
  ["tool-page", "/tools/word-counter/", (r, t) => r.status === 200 && /data-tool="word-counter"/.test(t)],
  ["tool-page-ai", "/tools/ai-summarizer/", (r, t) => r.status === 200 && /data-tool="ai-summarizer"/.test(t)],
  ["sitemap", "/sitemap.xml", (r, t) => r.status === 200 && /<urlset/.test(t)],
  ["robots", "/robots.txt", (r, t) => r.status === 200 && /Sitemap:/i.test(t)],
  ["ads-txt", "/ads.txt", (r) => r.status === 200],
  ["not-found", "/this-page-does-not-exist-xyz/", (r) => r.status === 404],
  ["legacy-redirect", "/tools/sort-lines", (r) => r.status === 200],
  ["admin-page", "/admin/", (r, t) => r.status === 200 && /admin-root/.test(t)],
  ["health-endpoint", "/health", (r, t) => r.status === 200 && /"ok":true/.test(t)]
];
export async function runChecks(origin, fetchImpl = fetch) {
  const out = [];
  for (const [key, path, test] of CHECKS) {
    const t0 = Date.now();
    try {
      const r = await fetchImpl(origin + path, { redirect: "follow", headers: { "user-agent": "UtilityraEngineer/1.0" } });
      const text = await r.text();
      out.push({ key, path, ok: !!test(r, text), status: r.status, ms: Date.now() - t0 });
    } catch (e) { out.push({ key, path, ok: false, status: 0, ms: Date.now() - t0, error: String(e.message || e) }); }
  }
  return out;
}
const DEV_SYSTEM = "You are the senior engineer for the Utilityra website (static site generated by build.mjs from src/meta.mjs and src/assets/js/tools/*.js into dist/, served by a Cloudflare Worker in worker/src/: index.js (AI gateway, /api/ai), inspect.js (URL inspector), admin.js (admin API); D1 optional; tests in tests/). Help the site owner diagnose problems and write fixes. Give: likely cause, exact files, a minimal patch as a unified diff or replacement snippet, and how to verify (which test/command). Never claim you ran or deployed anything; the owner reviews and applies changes. Never ask for or repeat secrets. Answer in the owner's language.";
export const devMessages = (history, message) => [{ role: "system", content: DEV_SYSTEM }, ...(Array.isArray(history) ? history.slice(-10).filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string").map((h) => ({ role: h.role, content: h.content.slice(0, 6000) })) : []), { role: "user", content: String(message || "").slice(0, 12000) }];
const DIAG_SYSTEM = "You are the Utilityra site reliability engineer. Given failed health checks of a static site served by a Cloudflare Worker (assets in dist/, redirects in _redirects, API in worker/src/index.js), give: 1) the most likely root cause, 2) the exact files to inspect, 3) a minimal proposed fix as a unified diff or steps, 4) the test that proves it is fixed. Be concise. A human reviews everything; never claim a fix is applied.";
export async function engineerRun(env, origin, ask) {
  const results = await runChecks(origin, env.ASSETS ? (u, o) => env.ASSETS.fetch(new Request(u, o)) : fetch);
  const failed = results.filter((r) => !r.ok);
  let incident = null;
  if (failed.length) {
    const detail = JSON.stringify(failed).slice(0, 2000);
    const open = await env.DB.prepare("SELECT id FROM incidents WHERE status IN ('open','diagnosed','fix_proposed') AND check_key=? LIMIT 1").bind(failed.map((f) => f.key).sort().join(",")).first();
    let diagnosis = "";
    if (ask) { try { diagnosis = await ask([{ role: "system", content: DIAG_SYSTEM }, { role: "user", content: "Failed checks:\n" + detail }]); } catch { diagnosis = ""; } }
    if (!open) {
      const r = await env.DB.prepare("INSERT INTO incidents(check_key,title,severity,status,detail,diagnosis) VALUES(?,?,?,?,?,?)").bind(failed.map((f) => f.key).sort().join(","), `Health check failed: ${failed.map((f) => f.key).join(", ")}`, failed.length > 2 || failed.some((f) => f.key === "home") ? "high" : "medium", diagnosis ? "diagnosed" : "open", detail, diagnosis).run();
      incident = r.meta?.last_row_id ?? true;
    } else if (diagnosis) await env.DB.prepare("UPDATE incidents SET diagnosis=?, status='diagnosed', detail=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(diagnosis, detail, open.id).run();
  } else await env.DB.prepare("UPDATE incidents SET status='resolved', updated_at=CURRENT_TIMESTAMP WHERE status IN ('open','diagnosed','fix_proposed')").run();
  return { ok: !failed.length, checkedAt: new Date().toISOString(), results, incident };
}
export async function listIncidents(env) { return (await env.DB.prepare("SELECT id,check_key,title,severity,status,detail,diagnosis,created_at,updated_at FROM incidents ORDER BY id DESC LIMIT 50").all()).results || []; }

/* ---------- tools manager, settings, audit log ---------- */
const SETTING_KEYS = ["maintenance_banner_ar", "maintenance_banner_en", "ai_enabled", "announcement_ar", "announcement_en"];
export async function audit(env, action, detail) { try { await env.DB.prepare("INSERT INTO admin_audit_log(action,detail) VALUES(?,?)").bind(action, String(detail || "").slice(0, 500)).run(); } catch { /* never break the action */ } }
export async function publicConfig(env) {
  if (!env.DB) return { disabled: [], featured: [], settings: {} };
  try {
    const flags = (await env.DB.prepare("SELECT tool_key, enabled, featured, sort FROM tool_flags").all()).results || [];
    const st = (await env.DB.prepare("SELECT k, v FROM site_settings").all()).results || [];
    return { disabled: flags.filter((f) => Number(f.enabled) === 0).map((f) => f.tool_key), featured: flags.filter((f) => Number(f.featured) === 1).map((f) => f.tool_key), sort: Object.fromEntries(flags.filter((f) => f.sort).map((f) => [f.tool_key, f.sort])), settings: Object.fromEntries(st.filter((x) => SETTING_KEYS.includes(x.k) && !/^(ai_enabled)$/.test(x.k)).map((x) => [x.k, x.v])) };
  } catch { return { disabled: [], featured: [], settings: {} }; }
}

/* ---------- router ---------- */
export async function handleAdmin(request, env, url, json, origin, readJson, ask) {
  const p = url.pathname, m = request.method;
  const needCfg = () => (configured(env) ? null : json({ error: "ADMIN_NOT_CONFIGURED" }, 503, origin));
  if (p === "/api/analytics/event" && m === "POST") {
    if (!env.DB) return json({ ignored: true, reason: "analytics_not_configured" }, 202, origin);
    try { return json(await recordEvent(request, env, await readJson(request, 2000)), 202, origin); } catch (e) { return json({ error: e.message || "REJECTED" }, e.status || 400, origin); }
  }
  if (!p.startsWith("/api/admin/")) return null;
  if (p === "/api/admin/login" && m === "POST") {
    const c = needCfg(); if (c) return c;
    let body; try { body = await readJson(request, 2000); } catch { return json({ error: "INVALID_REQUEST" }, 400, origin); }
    const t = await throttle(request, env); if (!t.allowed) return json({ error: "LOGIN_RATE_LIMITED" }, 429, origin);
    const pw = typeof body.password === "string" ? body.password : "";
    if (!pw || pw.length > 1024 || !(await sameSecret(pw, env.ADMIN_PASSWORD))) { await failLogin(env, t.key); return json({ error: "INVALID_CREDENTIALS" }, 401, origin); }
    await env.DB.prepare("DELETE FROM admin_login_attempts WHERE ip_hash=?").bind(t.key).run();
    await audit(env, "login", "success");
    const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    return json({ ok: true, expiresAt: exp }, 200, origin, { "set-cookie": `${COOKIE}=${encodeURIComponent(await makeToken(env.ADMIN_SESSION_SECRET, exp))}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}` });
  }
  if (p === "/api/admin/logout" && m === "POST") return json({ ok: true }, 200, origin, { "set-cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` });
  const c = needCfg(); if (c) return c;
  if (!(await isAdmin(request, env))) return json({ error: "UNAUTHORIZED" }, 401, origin);
  if (p === "/api/admin/session") return json({ authenticated: true }, 200, origin);
  try {
    if (p === "/api/admin/reports" && m === "GET") {
      const reports = (await env.DB.prepare("SELECT id,type,page,email,message,status,created_at,updated_at FROM contact_reports ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END, id DESC LIMIT 200").all()).results || [];
      return json({ reports }, 200, origin);
    }
    if (p === "/api/admin/reports/status" && m === "POST") {
      const b = await readJson(request, 1000);
      if (!Number.isInteger(b.id) || !["new", "reviewing", "resolved", "closed"].includes(b.status)) return json({ error: "INVALID_REQUEST" }, 400, origin);
      const r = await env.DB.prepare("UPDATE contact_reports SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(b.status, b.id).run();
      await audit(env, "report_status", `#${b.id} -> ${b.status}`);
      return json({ ok: true, changed: r.meta?.changes || 0 }, 200, origin);
    }
    if (p === "/api/admin/stats" && m === "GET") return json(await stats(env), 200, origin);
    if (p === "/api/admin/analytics/reset" && m === "POST") {
      let b; try { b = await readJson(request, 1000); } catch { return json({ error: "INVALID_REQUEST" }, 400, origin); }
      if (b.confirm !== "RESET ANALYTICS") return json({ error: "CONFIRMATION_REQUIRED" }, 400, origin);
      const r = await env.DB.prepare("DELETE FROM analytics_events").run();
      const deleted = Number(r.meta?.changes || 0);
      await audit(env, "analytics_reset", "deleted=" + deleted);
      return json({ ok: true, deleted, resetAt: new Date().toISOString() }, 200, origin);
    }
    if (p === "/api/admin/incidents" && m === "GET") return json({ incidents: await listIncidents(env) }, 200, origin);
    if (p === "/api/admin/engineer/run" && m === "POST") { await audit(env, "health_check", "manual run"); return json(await engineerRun(env, url.origin, ask), 200, origin); }
    if (p === "/api/admin/assistant" && m === "POST") {
      const b = await readJson(request, 40000);
      if (typeof b.message !== "string" || !b.message.trim()) return json({ error: "EMPTY_MESSAGE" }, 400, origin);
      if (!ask) return json({ error: "PROVIDER_NOT_CONFIGURED" }, 503, origin);
      await audit(env, "dev_assistant", b.message.slice(0, 120));
      try { return json({ answer: await ask(devMessages(b.history, b.message)) }, 200, origin); } catch { return json({ error: "UPSTREAM_ERROR" }, 502, origin); }
    }
    if (p === "/api/admin/tools" && m === "GET") return json({ flags: (await env.DB.prepare("SELECT tool_key, enabled, featured, sort FROM tool_flags").all()).results || [] }, 200, origin);
    if (p === "/api/admin/tools/flag" && m === "POST") {
      const b = await readJson(request, 1000);
      if (typeof b.tool_key !== "string" || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(b.tool_key)) return json({ error: "INVALID_REQUEST" }, 400, origin);
      const en = b.enabled === false || b.enabled === 0 ? 0 : 1, ft = b.featured ? 1 : 0, so = Number.isInteger(b.sort) ? Math.max(0, Math.min(9999, b.sort)) : 0;
      await env.DB.prepare("INSERT INTO tool_flags(tool_key,enabled,featured,sort) VALUES(?,?,?,?) ON CONFLICT(tool_key) DO UPDATE SET enabled=excluded.enabled, featured=excluded.featured, sort=excluded.sort").bind(b.tool_key, en, ft, so).run();
      await audit(env, "tool_flag", `${b.tool_key} enabled=${en} featured=${ft} sort=${so}`);
      return json({ ok: true }, 200, origin);
    }
    if (p === "/api/admin/settings" && m === "GET") return json({ settings: Object.fromEntries(((await env.DB.prepare("SELECT k, v FROM site_settings").all()).results || []).map((x) => [x.k, x.v])) }, 200, origin);
    if (p === "/api/admin/settings" && m === "POST") {
      const b = await readJson(request, 4000); const entries = Object.entries(b.settings || {}).filter(([k, v]) => SETTING_KEYS.includes(k) && typeof v === "string");
      for (const [k, v] of entries) await env.DB.prepare("INSERT INTO site_settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, v.slice(0, 400)).run();
      await audit(env, "settings", entries.map(([k]) => k).join(","));
      return json({ ok: true, saved: entries.length }, 200, origin);
    }
    if (p === "/api/admin/audit" && m === "GET") return json({ log: (await env.DB.prepare("SELECT id, action, detail, created_at FROM admin_audit_log ORDER BY id DESC LIMIT 100").all()).results || [] }, 200, origin);
    if (p === "/api/admin/incidents/status" && m === "POST") {
      const b = await readJson(request, 1000);
      if (!Number.isInteger(b.id) || !["open", "diagnosed", "fix_proposed", "resolved", "ignored"].includes(b.status)) return json({ error: "INVALID_REQUEST" }, 400, origin);
      await env.DB.prepare("UPDATE incidents SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(b.status, b.id).run();
      await audit(env, "incident_status", `#${b.id} -> ${b.status}`);
      return json({ ok: true }, 200, origin);
    }
  } catch (e) { return json({ error: "ADMIN_QUERY_FAILED" }, 502, origin); }
  return json({ error: "NOT_FOUND" }, 404, origin);
}
