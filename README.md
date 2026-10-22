# Utilityra — Platform v1 rebuild

Utilityra is being rebuilt as a practical bilingual tools and structured-data platform. This branch is a **staging candidate**; it does not replace the live Blogger theme or publish new pages automatically.

## Current staging work
- `blogger-pages/utilityra-theme-v1.xml`: new responsive Arabic/English Blogger theme candidate with search, category filters, light/dark mode, dedicated tool links, and accessibility states.
- `blogger-pages/`: 11 standalone browser-local tool pages plus About, Privacy, Contact and Disclaimer drafts.
- `blogger-pages/manifest.json`: pages for the GitHub Actions Blogger sync. Default workflow mode is draft; do not choose publish until each draft and permalink is reviewed.
- `worker/src/index.js`: secure AI gateway for OpenAI, Gemini and optional Cloudflare Workers AI; read-only D1 collection/search/record endpoints; origin checks and bounded input.
- `worker/schema.sql` and `worker/seed.sql`: D1 data-hub schema and initial MIME reference records. Seed records and collections intentionally remain private drafts until verified.
- `tests/worker.test.mjs`, `tests/e2e/tool-pages.spec.js`, and `scripts/validate-site.py`: API unit tests, browser interaction tests, XML/manifest/script checks and isolated SQL validation.
- `.github/dependabot.yml`: weekly dependency update checks.

## Architecture
- **Blogger**: public pages, content, and search-engine landing pages.
- **GitHub + Actions**: source control, checks, browser tests, and safe draft sync.
- **Cloudflare Worker**: optional AI and data API gateway. Provider keys must be configured as Worker secrets; never commit them.
- **Cloudflare D1**: planned curated data store. The schema is present, but no database has been created or bound by this PR.
- **Playwright + Lighthouse**: browser and performance/accessibility/SEO checks.
- **Context7, Strix, ScrapeGraphAI, Scrapling, MCP Agent Reach, GDELT and RSS/Atom**: developer/data integrations with separate setup and safety requirements. Listing them here does not mean the tools are connected or actively ingesting data.

## Safety and launch gates
1. Keep the live Blogger theme, existing pages, settings and AdSense configuration unchanged during staging.
2. Do not merge or upload the theme until Actions are green and the theme is manually reviewed on a test copy and Android.
3. Review all Blogger draft titles and actual generated URLs. Blogger may derive permalinks from titles; do not assume the file name sets the URL.
4. Create and bind D1 only after confirming account access and usage limits. Keep seed data private until sources and licensing notes are verified.
5. Configure Cloudflare rate limiting/abuse protection before exposing public AI endpoints.
6. Never expose provider secrets, arbitrary URL fetching, raw private tool inputs or unreviewed AI-generated code.
7. Useful pages and technical SEO improve eligibility for discovery but do not guarantee indexing, rankings, traffic or AdSense approval.
