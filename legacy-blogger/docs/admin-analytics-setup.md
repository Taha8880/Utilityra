# Private admin analytics and Cloudflare deployment

The private dashboard is served at the Worker origin's `/admin`, is not linked from the public homepage, and sends `noindex` headers. It becomes functional only after the Worker and D1 are deployed and the Blogger theme is installed with the actual Worker API origin.

## One-time deployment setup
1. In GitHub repository Settings → Secrets and variables → Actions, add these secrets. Never paste values into chat or source files:
   - `CLOUDFLARE_API_TOKEN`: a Cloudflare API token scoped to the account and Workers/D1 permissions needed for this deployment.
   - `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
   - `UTILITYRA_ADMIN_PASSWORD`: a unique password with at least 16 characters.
   - `UTILITYRA_ADMIN_SESSION_SECRET`: a different random secret with at least 32 characters.
   - Cloudflare Workers AI is the default provider through the Worker AI binding. `UTILITYRA_OPENAI_API_KEY` and `UTILITYRA_GEMINI_API_KEY` are optional alternatives; if added, they may have provider usage costs, so set usage limits with the provider.
2. Open Actions → **Deploy Utilityra API and private analytics** → Run workflow. The workflow finds or creates the D1 database, applies the schema and draft seed, writes Worker secrets, and deploys the API. It does not publish Blogger pages or change the live Blogger theme.
3. Open the successful run log and Cloudflare Workers & Pages to copy the real Worker URL. Do not guess or use a placeholder URL.
4. The AI assistant page must set `window.UTILITYRA_API_BASE` to that exact Worker URL, then the new theme must be installed in Blogger. This is a one-time platform integration step; Blogger's public API does not provide a supported theme-upload endpoint. Export a theme backup first.

## Dashboard and security
- Visit `https://YOUR-WORKER-ORIGIN/admin` and sign in with the password stored as the Cloudflare Worker secret. The password is checked server-side; the signed session cookie is HttpOnly, Secure, SameSite=Strict and expires after eight hours.
- Repeated login failures are throttled. The dashboard's stats endpoint rejects unauthenticated requests.
- Keep the GitHub repository's secret values private. Never commit API keys, passwords, OAuth tokens or session secrets.
- The D1 seed rows remain drafts and collections private; do not expose them before verifying the official source, license and each record.

## What analytics collects
- Aggregate page views, tool opens/actions, on-site searches, and searches that find no matching tool.
- A random session identifier to estimate sessions; this is not a verified count of individual people.
- A limited path, tool key, referring host and normalized failed-search phrase. Email-like and phone-like patterns are redacted. No raw IP, full user-agent, uploaded files or raw tool input is intentionally stored.
- To exclude your own browser, click **استبعاد زياراتي من الإحصائيات** in the dashboard. The opened Blogger page stores an exclusion flag in that browser's local storage. Use it on every device/browser you own. The include button reverses the choice.
- Known bots, automated browser runs and pages marked `?utilityra_review=1` / `?preview=1` are excluded on a best-effort basis. It is impossible to identify every human AI reviewer with certainty.
- This affects the new first-party analytics only; existing Google Analytics data cannot be retroactively cleaned.

## AI tool-demand recommendations
- The dashboard's AI report uses first-party usage and failed searches from the last 30 days. It will wait for a minimum of 20 eligible events and does not pretend to know external Google keyword volume.
- For broader demand, the next evidence source should be a verified Google Search Console property or a licensed keyword/trend API. Search Console credentials and property ownership are not currently configured in this repository.
- AI outputs are recommendations only. A tool must have a clear user need, a verified implementation, browser tests, accessibility review and human approval before it is published.

## Launch checks
- [ ] Worker deployment completed without exposing any secret values.
- [ ] `/health` reports the data store configured.
- [ ] Wrong passwords are rejected and repeated failures are throttled.
- [ ] `/api/admin/stats` rejects requests without a valid session.
- [ ] `/admin` works on mobile and desktop, including a private browser session.
- [ ] Owner exclusion and restoration work on the same browser.
- [ ] Blogger theme is backed up and manually reviewed before installation.
- [ ] AdSense and existing indexing settings remain intact; verify the deployed site in Search Console and AdSense after the theme change.
