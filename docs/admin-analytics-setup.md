# Private admin analytics setup

This dashboard is served by the Cloudflare Worker at `/admin`; it is not linked from the public homepage and sends `noindex` headers. The dashboard is only functional after Cloudflare D1, Worker secrets, and the analytics API URL are configured.

## 1. Create the D1 database
1. In Cloudflare, create a D1 database named `utilityra-data`.
2. Update the database ID in your private deployment config / `worker/wrangler.toml` (never replace the example file with a fake ID).
3. From the `worker` directory, execute the schema against the remote database:
   `npx wrangler d1 execute utilityra-data --remote --file=./schema.sql`
4. Do not mark seed records public without checking source URLs, licensing and correctness.

## 2. Configure secrets in Cloudflare
Use **Worker Settings → Variables and Secrets** or Wrangler secret commands to set:
- `ADMIN_PASSWORD`: a unique, long password known only to the site owner.
- `ADMIN_SESSION_SECRET`: a separate random secret with at least 32 random bytes.
- `OPENAI_API_KEY` or `GEMINI_API_KEY` (optional, for AI opportunity analysis).
- Existing AI provider secrets remain server-side; never paste them into Blogger, GitHub source, or chat.

Never commit real values to Git. Do not use the same password as email or GitHub.

## 3. Configure deployment and analytics
- Bind D1 as `DB` and static assets as `ASSETS` as shown in `wrangler.toml.example`.
- Deploy the Worker only after reviewing the actual database ID, origin and limits.
- Set the public theme's `window.UTILITYRA_API_BASE` once to the real Worker origin. This enables first-party analytics events from Blogger. Do not guess the Worker URL.
- Open `https://YOUR-WORKER-ORIGIN/admin` to sign in. The password is validated server-side; the signed session cookie is HttpOnly, Secure, SameSite=Strict and expires after eight hours.

## 4. What the dashboard records
- Aggregated page views, tool opens/actions, on-site searches and searches that return no matching tool.
- A random session identifier to estimate unique visitors. No raw IP address, full user-agent, file contents or tool input is stored.
- Search misses are normalized and common email/phone-like strings are redacted, but do not collect search terms that could contain sensitive data without updating the privacy notice.
- The owner can use **Exclude visits from this device** on the dashboard. It opens the site with an exclusion flag stored in that browser's local storage. This is per browser/device; use it on every device you own.
- Known bots, automated browser runs and URLs marked `?utilityra_review=1` / `?preview=1` are excluded on a best-effort basis. No analytics system can identify every possible AI reviewer with certainty.
- The custom dashboard excludes flagged owner/review traffic; GA4 also skips known bots and owner-excluded browsers after this theme is installed, but pre-existing GA data cannot be retroactively cleaned.

## 5. AI opportunity recommendations
The dashboard's AI report is based on on-site tool usage and failed searches only. It does **not** claim to know external Google search volume. To measure broader demand, connect a verified Google Search Console property or a licensed keyword/trend source in a later step. AI ideas must be reviewed, researched and tested before a tool is added or published.

## Launch checklist
- [ ] D1 schema executes without errors.
- [ ] Secrets set in Cloudflare; no secret exists in Git.
- [ ] `/health` reports D1 configured.
- [ ] Wrong passwords are rejected; repeated failures are throttled.
- [ ] `/api/admin/stats` rejects requests without a valid session.
- [ ] `/admin` works in a private window and on mobile.
- [ ] The owner's browser exclusion is active.
- [ ] Analytics and privacy wording are reviewed before public release.
