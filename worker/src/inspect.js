// Safe URL inspector used by the SEO / security-header / accessibility / speed checkers.
// Fetches a public page server-side (browsers cannot, because of CORS) and returns
// status, timing, headers and a size-capped HTML body. Blocks private/loopback targets.
const MAX_BYTES = 400 * 1024;
const MAX_REDIRECTS = 4;

export function isBlockedHost(host) {
  const h = String(host || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || !h.includes(".") && !h.includes(":")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (h.includes(":")) return true; // block IPv6 literals entirely
  if (/^\d+$/.test(h) || /^0x/i.test(h)) return true; // decimal/hex IP tricks
  return false;
}

export function parseTarget(raw) {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
  if (u.port && !["80", "443"].includes(u.port)) return null;
  if (isBlockedHost(u.hostname)) return null;
  return u;
}

export async function inspectUrl(raw, fetchImpl = fetch) {
  let u = parseTarget(raw);
  if (!u) return { status: 400, body: { error: "INVALID_URL" } };
  const started = Date.now();
  const chain = [];
  let res;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    try {
      res = await fetchImpl(u.toString(), { redirect: "manual", headers: { "user-agent": "UtilityraInspector/1.0 (+https://utilityra.com)", accept: "text/html,*/*;q=0.8" }, signal: AbortSignal.timeout(10000) });
    } catch { return { status: 502, body: { error: "FETCH_FAILED" } }; }
    chain.push({ url: u.toString(), status: res.status });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      let next; try { next = new URL(res.headers.get("location"), u); } catch { return { status: 502, body: { error: "BAD_REDIRECT" } }; }
      if (!parseTarget(next.toString())) return { status: 400, body: { error: "REDIRECT_BLOCKED" } };
      u = next; continue;
    }
    break;
  }
  const ttfb = Date.now() - started;
  const headers = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  const type = (res.headers.get("content-type") || "").toLowerCase();
  let html = "", bytes = 0, truncated = false;
  if (res.body && (type.includes("text/html") || type.includes("xml") || type.includes("text/plain"))) {
    const reader = res.body.getReader(); const parts = [];
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength; parts.push(value);
      if (bytes > MAX_BYTES) { truncated = true; reader.cancel(); break; }
    }
    const all = new Uint8Array(parts.reduce((a, p) => a + p.byteLength, 0)); let o = 0; parts.forEach((p) => { all.set(p, o); o += p.byteLength; });
    html = new TextDecoder("utf-8").decode(all);
  }
  return { status: 200, body: { url: u.toString(), httpStatus: res.status, redirects: chain, ttfbMs: ttfb, totalMs: Date.now() - started, bytes, truncated, contentType: type, headers, html } };
}
