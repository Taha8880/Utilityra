# Utilityra — practical tools platform

Utilityra is being rebuilt around students, office teams, designers and developers. The public Blogger address and verified page URLs are preserved; the new theme is staged separately until it passes validation and is installed on Blogger.

## Current implementation
- `blogger-pages/utilityra-theme-v2.xml`: fresh responsive dark-first theme with an original animated grid/orbit hero, glass data cards, RTL/LTR switch, working category/search controls, light/dark mode, reduced-motion support and 70 tool cards linking to the currently published page URLs.
- `blogger-pages/manifest.json`: 74 pages with verified existing Blogger URLs. The sync script continues to match pages by title and preserve their existing permalinks.
- `blogger-pages/`: 70 practical browser-based tools plus About, Privacy, Contact and Disclaimer pages. The tools cover study, writing, calculations, office files, images, data conversion, web development and AI assistance.
- `worker/src/index.js`: API gateway for AI providers, first-party privacy-minimized analytics, password-protected admin sessions, private D1 records and GDELT public-coverage discovery.
- `worker/public/admin.html`: private, noindex analytics dashboard with server-side password validation and signed HttpOnly session cookies.
- `scripts/validate-site.py`: XML, URL-preservation, tool count, embedded JavaScript and D1 schema/seed checks.

## Motion and accessibility
The hero uses CSS-only floating glass layers and a soft animated orbit instead of unrelated stock video. The entrance system arms synchronously, waits for fonts with a 900ms ceiling, and removes its animation classes after the secondary CTA finishes. Reduced-motion users get a static hero and no entrance or continuous motion. The mobile navigation supports click-outside and Escape-to-close.

## Important deployment gates
1. The v2 theme is staged in GitHub. Blogger's supported API can publish/update pages but cannot upload the main theme; the theme must be installed once from Blogger's Theme interface.
2. The Cloudflare Worker is not live yet. The last deployment attempt failed because `CLOUDFLARE_API_TOKEN` and other required Actions secrets were absent. No fake Worker URL is embedded in the public theme.
3. The private dashboard and AI endpoints become usable only after Cloudflare deployment, D1 binding, and server-side secrets are configured. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `UTILITYRA_ADMIN_PASSWORD` (16+ characters), and `UTILITYRA_ADMIN_SESSION_SECRET` (32+ random characters) to GitHub Actions secrets. `UTILITYRA_OPENAI_API_KEY` and `UTILITYRA_GEMINI_API_KEY` are optional provider keys; never put secrets in source or browser code.
4. AI tool-demand recommendations are based on first-party usage and failed searches only. They must not be described as external keyword-volume research. Suggestions require owner review and functional tests before publishing.
5. GDELT is a public news-coverage source, not a universal fact database. Context7, Strix, ScrapeGraphAI, Scrapling and MCP Agent Reach are not claimed to be live integrations unless their actual credentials/servers are configured. Official documentation sources and public RSS/GDELT discovery are the safer initial fallback.
6. Analytics excludes recognized crawlers, browser automation/review visits, admin paths and visitors who enable `?utilityra_owner=exclude`. Owner exclusion is stored locally in the browser; it does not identify a person across devices.
7. AdSense publisher ID `ca-pub-1235197294708204` is preserved. Existing ad-slot IDs are not fabricated. A valid publisher ID or correct markup does not guarantee AdSense approval or revenue.
8. SEO metadata and the existing live URLs are retained, but indexing, ranking, traffic and AdSense approval are controlled by Google and are not guaranteed.
