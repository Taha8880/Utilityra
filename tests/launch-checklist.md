# Launch and regression checklist

## Before publishing
- [ ] Export a Blogger theme backup and keep it outside the repository.
- [ ] Confirm the GitHub repository visibility is intentional.
- [ ] Add Worker secrets through Cloudflare dashboard; never commit keys.
- [ ] Set allowed origin to the exact Blogger/custom domain.
- [ ] Verify GET /health does not expose secret values.
- [ ] Verify AI requests fail safely when provider keys are absent.
- [ ] Verify malformed JSON, empty messages, unsupported providers, and oversized messages are rejected.
- [ ] Test each tool on Android Chrome and desktop.
- [ ] Check keyboard access, labels, readable contrast, and screen-reader status.
- [ ] Confirm each public tool has a unique title, description, useful instructions, and internal links.
- [ ] Inspect canonical URLs and sitemap in Blogger/Search Console.
- [ ] Test pages while logged out and in a private browser session.
- [ ] Do not promise indexing or AdSense approval; monitor real reports.

## AI security
- [ ] No API key appears in page source, repository, or client-side JavaScript.
- [ ] Add Cloudflare rate limiting / abuse protection before public launch.
- [ ] Set usage budgets and provider limits.
- [ ] Never let AI directly deploy code or change Blogger settings without human approval.