# Utilityra — Rebuild Project

Utilityra is being rebuilt as a Blogger-hosted tools site with GitHub-based source control, automated validation, and a Cloudflare Worker for server-side AI requests.

## Architecture
- Blogger: public pages and SEO.
- GitHub Actions: validation and browser/performance checks.
- Cloudflare Worker: secure gateway for OpenAI and Gemini; provider keys must be configured as Worker secrets and never committed here.
- Playwright: browser checks for desktop/mobile.
- Lighthouse: performance, accessibility, best practices, and SEO audits.
- Context7, Strix, ScrapeGraphAI, Scrapling, MCP Agent Reach, GDELT, and RSS are optional developer/data integrations; they are not active merely by being listed.

## Current status
The repository is being populated. The existing Blogger site must remain unchanged until new pages and the Worker are configured and tested. Blogger theme publication is a separate step; a GitHub commit alone does not deploy a Blogger theme.

## Security
Never commit API keys, cookies, access tokens, or private data. Store AI provider keys as Cloudflare Worker secrets. Treat AI output as suggestions, not permission to deploy untested production changes.

## SEO note
Unique useful tool pages, clear titles/descriptions, canonical URLs, internal links, structured data, and Search Console help discoverability but do not guarantee indexing or rankings.
