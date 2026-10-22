import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const workerModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const worker = workerModule.default;
const origin = "https://utilityra.blogspot.com";

function req(path, options = {}) {
  return new Request("https://api.example.test" + path, {
    ...options,
    headers: { Origin: origin, ...(options.headers || {}) }
  });
}

test("health endpoint reports safe capability flags without exposing secrets", async () => {
  const response = await worker.fetch(req("/health"), {});
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.capabilities.dataStoreConfigured, false);
  assert.equal(body.capabilities.workersAIConfigured, false);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(JSON.stringify(body).includes("API_KEY"), false);
});

test("unapproved browser origin is rejected", async () => {
  const response = await worker.fetch(new Request("https://api.example.test/health", {
    headers: { Origin: "https://attacker.example" }
  }), {});
  assert.equal(response.status, 403);
});

test("D1 endpoints fail closed when no database binding exists", async () => {
  const collections = await worker.fetch(req("/api/data/collections"), {});
  const search = await worker.fetch(req("/api/data/search?q=json"), {});
  assert.equal(collections.status, 503);
  assert.equal((await collections.json()).error, "DATA_STORE_NOT_CONFIGURED");
  assert.equal(search.status, 503);
  assert.equal((await search.json()).error, "DATA_STORE_NOT_CONFIGURED");
});

test("data search rejects short queries and invalid collection keys", async () => {
  const db = { prepare() { return { bind() { return this; }, all: async () => ({ results: [] }) }; } };
  const short = await worker.fetch(req("/api/data/search?q=a"), { DB: db });
  const invalid = await worker.fetch(req("/api/data/search?q=json&collection=bad%20key"), { DB: db });
  assert.equal(short.status, 400);
  assert.equal(invalid.status, 400);
});

test("data search uses a parameterized query and returns only normalized public fields", async () => {
  let sql = "";
  let params = [];
  const row = {
    id: 7, collection_key: "mime-types", record_key: "json", title: "JSON data",
    summary: "MIME type", payload_json: '{"mime":"application/json"}',
    source_name: "IANA", source_url: "https://www.iana.org/assignments/media-types/media-types.xhtml",
    license_notes: "Check source", fetched_at: null, verified_at: "2026-10-22T00:00:00Z", updated_at: "2026-10-22T00:00:00Z"
  };
  const db = { prepare(query) { sql = query; return { bind(...values) { params = values; return this; }, all: async () => ({ results: [row] }) }; } };
  const response = await worker.fetch(req("/api/data/search?q=json"), { DB: db });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.count, 1);
  assert.equal(body.results[0].data.mime, "application/json");
  assert.equal(body.results[0].sourceUrl, row.source_url);
  assert.match(sql, /r\.status = 'verified'/);
  assert.ok(params.length >= 5);
});

test("malformed JSON is rejected before provider calls", async () => {
  const response = await worker.fetch(req("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{"
  }), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "INVALID_JSON");
});

test("invalid AI provider is rejected", async () => {
  const response = await worker.fetch(req("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "unknown", message: "hello" })
  }), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "INVALID_PROVIDER");
});

test("AI endpoint reports missing provider configuration without leaking details", async () => {
  const response = await worker.fetch(req("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "openai", message: "Explain JSON" })
  }), {});
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error, "PROVIDER_NOT_CONFIGURED");
  assert.equal(body.message, "This AI provider is not configured yet.");
});


test("Workers AI can run through the gateway when explicitly bound", async () => {
  let model = "";
  const AI = { run: async (requestedModel, options) => {
    model = requestedModel;
    assert.equal(options.messages[1].role, "user");
    return { response: "Safe test response" };
  }};
  const response = await worker.fetch(req("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "workers-ai", message: "Explain JSON" })
  }), { AI });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.provider, "workers-ai");
  assert.equal(body.reply, "Safe test response");
  assert.equal(model, "@cf/meta/llama-3.1-8b-instruct");
});

test("Workers AI fails safely when the optional binding is absent", async () => {
  const response = await worker.fetch(req("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "workers-ai", message: "Explain JSON" })
  }), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "PROVIDER_NOT_CONFIGURED");
});


test("admin statistics are not public without a signed session", async () => {
  const response = await worker.fetch(req("/api/admin/stats"), {});
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "UNAUTHORIZED");
});

test("admin login issues an HttpOnly Secure session and session check accepts it", async () => {
  const statements = [];
  const DB = {
    prepare(sql) {
      const statement = { sql, args: [],
        bind(...args) { this.args = args; return this; },
        first: async () => null,
        run: async () => { statements.push({ sql: this.sql, args: this.args }); return { success: true }; },
        all: async () => ({ results: [] })
      };
      return statement;
    }
  };
  const env = { DB, ADMIN_PASSWORD: "test-only-admin-password", ADMIN_SESSION_SECRET: "test-only-session-secret-which-is-long" };
  const login = await worker.fetch(req("/api/admin/login", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: env.ADMIN_PASSWORD })
  }), env);
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  const token = cookie.split(";")[0];
  const session = await worker.fetch(req("/api/admin/session", { headers: { Cookie: token } }), env);
  assert.equal(session.status, 200);
  assert.equal((await session.json()).authenticated, true);
  assert.ok(statements.some(s => s.sql.includes("DELETE FROM admin_login_attempts")));
});

test("analytics drops flagged review traffic and stores only minimized event fields", async () => {
  const writes = [];
  const DB = { prepare(sql) { return { sql, args: [], bind(...args) { this.args = args; return this; }, run: async function(){ writes.push({sql:this.sql,args:this.args}); return {success:true}; } }; } };
  const review = await worker.fetch(req("/api/analytics/event", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ visitorKey: "visitor-session-123456", eventType: "page_view", path: "/", reviewMode: true })
  }), { DB });
  assert.equal(review.status, 202);
  assert.equal((await review.json()).ignored, true);
  assert.equal(writes.length, 0);
  const response = await worker.fetch(req("/api/analytics/event", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ visitorKey: "visitor-session-123456", eventType: "search_miss", path: "/?q=x", searchTerm: "Need help at user@example.com 123-456-7890", referrer: "https://search.example/path" })
  }), { DB });
  assert.equal(response.status, 202);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].args[0], "visitor-session-123456");
  assert.equal(writes[0].args[1], "search_miss");
  assert.match(writes[0].args[4], /\[email\]/);
  assert.match(writes[0].args[4], /\[number\]/);
  assert.equal(writes[0].args[2], "/");
});

test("unknown routes return JSON 404", async () => {
  const response = await worker.fetch(req("/not-a-route"), {});
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, "NOT_FOUND");
});
