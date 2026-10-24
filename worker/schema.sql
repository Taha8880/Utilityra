-- Utilityra D1 schema (optional: analytics, admin throttling, incident log).
-- Apply with:  npx wrangler d1 execute utilityra-data --remote --file=worker/schema.sql
-- No raw IPs, user agents or tool inputs are stored.
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_key TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view','tool_open','tool_action','search','search_miss')),
  path TEXT NOT NULL DEFAULT '/',
  tool_key TEXT NOT NULL DEFAULT '',
  search_term TEXT NOT NULL DEFAULT '',
  referrer_host TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ae_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ae_type_created ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_ae_tool_created ON analytics_events(tool_key, created_at);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);

-- "Technical engineer" incident log: every failed health check becomes a numbered incident.
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  check_key TEXT NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','diagnosed','fix_proposed','resolved','ignored')),
  detail TEXT NOT NULL DEFAULT '',
  diagnosis TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status, created_at);

-- Durable rate limiter for /api/* (replaces per-isolate memory when D1 is bound).
CREATE TABLE IF NOT EXISTS rate_limits (k TEXT NOT NULL, w INTEGER NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (k, w));

-- Admin: tools manager, site settings, audit log.
CREATE TABLE IF NOT EXISTS tool_flags (tool_key TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS site_settings (k TEXT PRIMARY KEY, v TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS admin_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);


-- Public feedback reports submitted through the on-site contact form.
CREATE TABLE IF NOT EXISTS contact_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('bug','suggestion','other')),
  page TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','resolved','closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contact_reports_status ON contact_reports(status, created_at);
