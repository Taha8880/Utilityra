# Utilityra

موقع أدوات مجانية ثنائي اللغة (عربي/إنجليزي): **115 أداة**، كل أداة في صفحتها المستقلة `/tools/<slug>/`، منها 19 أداة ذكاء اصطناعي.
A free bilingual toolbox: **115 tools**, each on its own page, including 19 AI tools.

## How it works
- `node build.mjs` generates a static site into `dist/` (home, categories, 115 tool pages, SEO files, redirects).
- `worker/src/index.js` is a Cloudflare Worker that serves `dist/` and exposes `/api/ai`, `/api/inspect`, `/health`, and (optional, needs D1) `/api/analytics/event` + `/api/admin/*`.
- Tool logic lives in `src/assets/js/tools/*.js`; the tool list in `src/meta.mjs` (single source of truth).

## Run / test
```
npm run build        # -> dist/
npm test             # build + Worker tests (node:test)
npm run test:e2e     # Playwright: every tool page, functions, nav, 404, overflow, screenshots
npm run dev          # wrangler dev
```
Latest recorded results: `docs/test-logs/e2e-latest.md`.

## Deploy (Cloudflare — the supported host)
See `docs/DEPLOY_AR.md`. Short version: GitHub secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, push to `main`, `.github/workflows/deploy.yml` builds, tests and deploys.
Blogger cannot host this project (no Workers/static assets/API). Old Blogger files are archived in `legacy-blogger/`.

## Environment knobs (build time)
`SITE_URL`, `API_BASE`, `ADSENSE_ID`, `GA_ID`, `CONTACT_EMAIL`.

## Secrets
Never commit keys. Optional Worker secrets: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
