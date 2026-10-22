# Utilityra — Platform v1 rebuild

Utilityra is being rebuilt as a bilingual, practical tools platform for students, office workers, designers and developers. This branch is a **staging candidate**; it does not replace the live Blogger theme or publish pages automatically.

## Current staging work
- `blogger-pages/utilityra-theme-v1.xml`: responsive Arabic/English Blogger theme with search, categories, light/dark mode, progressive tool-card loading, accessible GSAP motion and a reduced-motion fallback.
- `blogger-pages/`: 69 standalone browser-local utility pages plus an AI assistant draft and About, Privacy, Contact and Disclaimer pages. The homepage has 64 cards including the AI assistant.
- `blogger-pages/manifest.json`: pages for GitHub Actions Blogger sync. The workflow defaults to drafts; never choose publish until the generated page URLs and content are reviewed.
- `worker/src/index.js`: AI gateway for OpenAI, Gemini and optional Cloudflare Workers AI; read-only D1 endpoints; private admin sessions; privacy-minimized analytics; AI recommendations based on on-site usage and failed searches.
- `worker/public/admin.html`: Worker-hosted private analytics dashboard, noindex, password protected through server-side secrets and a signed HttpOnly session.
- `worker/schema.sql` and `worker/seed.sql`: D1 schema and initial MIME reference records. Data collections and seed records stay private until verified.
- `docs/admin-analytics-setup.md`: exact Cloudflare setup steps, secret names, owner exclusion and privacy notes.
- `tests/worker.test.mjs`, `tests/e2e/tool-pages.spec.js`, and `scripts/validate-site.py`: API tests, browser interaction tests, theme/page/admin JavaScript checks and isolated SQL validation.

## Architecture
- **Blogger**: public pages and SEO landing pages.
- **GitHub + Actions**: source control, automated checks, browser tests and draft sync.
- **Cloudflare Worker**: AI/data gateway and private `/admin` dashboard. Provider secrets and admin secrets belong in Cloudflare only.
- **Cloudflare D1**: planned data store. The schema exists, but no live database has been provisioned by this staging work.
- **GSAP Core**: subtle hero/card entrance motion; the site respects reduced-motion settings and falls back to CSS if the library is unavailable.
- **Demand discovery**: first-party analytics reports tool usage and failed internal searches. This is not external Google keyword volume; connect a verified Search Console property or licensed trends source before making external demand claims.
- **Context7, Strix, ScrapeGraphAI, Scrapling, MCP Agent Reach, GDELT and RSS/Atom**: optional developer/data integrations. Listing them does not mean they are connected or running.

## Safety and launch gates
1. Keep the live Blogger theme, existing pages, settings and AdSense configuration unchanged during staging.
2. Do not upload the theme or publish tool pages until Actions are green and the theme is visually reviewed on a test copy and Android.
3. Blogger may normalize page permalinks from titles; inspect actual generated URLs before using homepage links.
4. Create and bind D1 only after confirming account access and usage limits; verify source and license data before making records public.
5. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as Cloudflare secrets. Never put them in Git or client-side code.
6. Configure the actual Worker origin once in `window.UTILITYRA_API_BASE`; do not guess a deployment URL.
7. AI demand reports create suggestions only. Any generated tool must be reviewed and tested before it is merged or published.
8. No AI can guarantee correct answers to every question. The assistant must avoid fabricated facts and citations, state uncertainty and recommend verification.
9. Technical SEO improves eligibility for discovery but does not guarantee indexing, ranking, traffic or AdSense approval.
