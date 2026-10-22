# Utilityra — practical tools platform

Utilityra is the Arabic-first, bilingual workspace for students, office teams, designers and developers. The public Blogger address, current AdSense publisher ID, and planned tool-page permalinks are preserved.

## Fresh design
- `blogger-pages/utilityra-theme-v5.xml` is the validated new Blogger theme: an original animated globe/orbit hero, glass information panels, responsive navigation, dark/light mode, Arabic/English switching, daily wisdom, search and category filters, and 70 tool cards.
- Motion follows the three supplied visual prompts as inspiration rather than copying their brands or product scenes. The design uses CSS motion rather than an external looping video. `prefers-reduced-motion` disables entrance and continuous animations.
- `blogger-pages/manifest.json` lists 74 Blogger pages: 70 tools plus essential information pages. The existing sync workflow reported all pages unchanged and successful.
- `scripts/validate-site.py` validates the v5 XML, page manifest, tool links, AdSense publisher ID, motion support, and private analytics schema.
- `worker/src/index.js` and `worker/public/admin.html` contain the AI/API gateway and private analytics dashboard. These are not live until Cloudflare deployment succeeds and required secrets are configured.

## Preserved settings
- Live blog: https://utilityra.blogspot.com/
- AdSense publisher ID: `ca-pub-1235197294708204`
- Existing tool page URL paths are retained to avoid unnecessary URL changes.
- The theme includes canonical and robots metadata. Google indexing, ranking, and AdSense approval are controlled by Google and cannot be guaranteed.

## Deployment status
- The v5 theme passed XML and project validation; 70 card links match the manifest.
- The new theme source is committed, but Blogger did not receive the new theme during the automated browser attempt. The current live site was checked afterward and still shows the old template. Install the v5 XML through Blogger **Theme → Restore → Upload** (or the full-template HTML editor) before treating the design as live.
- The old theme backup was downloaded in the browser before the installation attempt. No save/apply action was completed, so the live template was not intentionally replaced.
- The Cloudflare deployment workflow currently fails before deployment because `CLOUDFLARE_API_TOKEN` is missing from GitHub Actions secrets. The private admin page and server-side AI cannot be described as active until Cloudflare is configured.
- Required deployment secrets include `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `UTILITYRA_ADMIN_PASSWORD` (at least 16 characters), and `UTILITYRA_ADMIN_SESSION_SECRET` (at least 32 characters). Optional AI provider secrets are `UTILITYRA_OPENAI_API_KEY` and `UTILITYRA_GEMINI_API_KEY`. Never place secret keys in browser code or public repository files.

## Trust and privacy
- AI responses must distinguish verified facts from estimates and must not invent citations or claim that actions were completed when they were not.
- Tool suggestions can use first-party usage and failed-search signals after analytics is deployed; those signals are not external keyword-volume data.
- GDELT is a public news-coverage source, not a universal fact-checking database. Context7, Strix, ScrapeGraphAI, Scrapling and MCP Agent Reach are not claimed to be live integrations unless configured and tested.
- Analytics excludes recognized crawlers and review/owner signals on a best-effort basis, not with a guarantee of perfect exclusion.
