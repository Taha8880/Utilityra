# Utilityra — Cloudflare tools workspace

Utilityra is an Arabic-first, Arabic/English tools platform. **The active frontend and API are deployed on Cloudflare Workers**:

- Public app: https://utilityra.tavengers16.workers.dev/
- Source: `worker/public/index.html` (single-page app with individual `/tools/<slug>` routes)
- API/Worker: `worker/src/index.js`
- D1 schema and seed data: `worker/schema.sql`, `worker/seed.sql`
- Deployment: `.github/workflows/deploy-worker.yml`
- Cloudflare-specific validation: `scripts/validate-cloudflare.mjs`
- Browser regression tests: `tests/e2e/cloudflare-tools.spec.js`

## Current tool suite

The Cloudflare app registers 51 distinct tool pages covering text, data/JSON, calculations, URLs, image operations, QR, PDF merge/split/rotation/metadata, image-to-PDF, Markdown preview, SEO, PageSpeed, accessibility, security headers, contrast, API requests and the AI assistant. Each registered slug is served at `/tools/<slug>`; the Worker returns the SPA shell and the frontend loads the corresponding tool view.

QR and PDF operations use trusted browser libraries from public CDNs. Those tools require an internet connection to load the library, but the selected file/content operations are performed in the browser. The PageSpeed tool calls Google's PageSpeed Insights API and can be rate-limited; the API tester is subject to target-server CORS rules. The accessibility checker is a basic static HTML audit, not a complete WCAG certification. The security-header checker evaluates pasted response headers and does not silently scan a URL.

## Validation and deployment

- The Cloudflare deployment workflow configures D1, sets the required admin/session secrets, deploys the Worker and smoke-tests the homepage plus registered tool routes.
- The Cloudflare browser workflow checks tool interactions on desktop and mobile. A successful deployment proves delivery, not that every browser-side tool passed its functional tests; consult the latest GitHub Actions result before calling the whole suite verified.
- Run `node scripts/validate-cloudflare.mjs`, `node --check worker/src/index.js`, and `node --test tests/worker.test.mjs` for local validation.
- Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `UTILITYRA_ADMIN_PASSWORD` (16+ characters), and `UTILITYRA_ADMIN_SESSION_SECRET` (32+ characters). Optional provider secrets: `UTILITYRA_OPENAI_API_KEY`, `UTILITYRA_GEMINI_API_KEY`. Never put secrets in browser code or committed files.

## Legacy files

`blogger-pages/`, the Blogger workflows and `scripts/validate-site.py` are retained as **legacy artifacts** for reference and URL history. They are not the active Cloudflare frontend deployment target. Changes to the Cloudflare app should be made in `worker/` and validated through the Cloudflare workflows.

## Privacy and limitations

- The AI assistant sends the prompt and optional context to the selected configured provider through the Worker.
- Local text, image and PDF tools are designed to process inputs in the browser. QR/PDF library scripts are fetched from the named CDNs.
- Google controls indexing, PageSpeed API quotas and AdSense approval; none can be guaranteed by this repository.
