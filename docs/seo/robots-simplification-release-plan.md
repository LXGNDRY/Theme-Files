# Robots.txt simplification — release and rollback plan (2026-10-20)

## Proposed change
Remove `templates/robots.txt.liquid` **only after production acceptance checks pass**. Shopify then regenerates `/robots.txt` using its platform-managed defaults. This replaces all hand-maintained wildcard, AI-bot, Googlebot-Image, tracking-parameter, and CDN restrictions without copying stale Shopify defaults.

Official reference: https://shopify.dev/docs/storefronts/themes/architecture/templates/robots-txt-liquid

## Exact baseline
- Production theme: `Theme-Files/edits-here`, Shopify theme ID `151242866841` (MAIN when audited).
- Source file before change: `templates/robots.txt.liquid`, git blob SHA `698708c04d3ea25b1dec96c4d8c5aaab453a8400`.
- Retrieve previous file via Git history or `git show <BASE_SHA>:templates/robots.txt.liquid`.
- Base branch: `edits-here`. Do **not** merge this PR without reviewing whether the theme repository automatically syncs to the live Shopify theme.

## Preconditions — currently unverified
1. Fetch the public `https://www.legendary-branding.com/robots.txt` as HTTP 200 (previous web fetch was unsuccessful) and archive raw HTTP headers and body.
2. Fetch `https://www.legendary-branding.com/sitemap.xml` and get representative URLs for product, collection, locale and product images. Confirm actual image hostname separately.
3. Compare Shopify's automatically generated default on a temporary theme/store where feasible. Shopify warns `robots.default_groups` output can differ from generated defaults.
4. Check Google Search Console robot-blocked examples and image Search impressions; do not infer traffic causation from this file alone.
5. Obtain a staging/preview test of the intended Shopify-generated result. Preview URLs may not independently simulate domain-level robots.txt; a test must examine actual output.

## Critical validation matrix
- Allow clean product, collection, homepage, policy and published locale URLs for Googlebot and Googlebot-Image.
- Verify media/image paths are not blocked on their actual hosts.
- Keep appropriate Shopify-generated checkout, cart, order, admin and private-route restrictions.
- Verify sitemap URL is reachable and references canonical URLs.
- Confirm no unexpected redirect or 404 on /robots.txt, no `Disallow: /` for Googlebot.
- Test user agents Googlebot, Googlebot-Image, Bingbot and public-content AI agents against the **rendered** rules, not guesses about the Liquid template.
- Canonical checks and Search Console coverage checks are distinct from robots controls.

## Deployment gate
Require evidence of the above tests and explicit owner approval for publishing to MAIN. If `edits-here` is auto-synced to the Shopify theme, *merging this PR is a production deployment*. Do not bypass this gate.

## Rollback
Restore the prior exact `templates/robots.txt.liquid` from the base commit or recorded blob SHA, deploy to the originally published theme, and verify live `/robots.txt` and sitemap. Check the original file checksum before deployment.

## Monitoring
Record crawl-blocking errors and sitemap coverage immediately; monitor Search Console crawl and image discovery over 7, 14, 30 and 60 days. No organic traffic guarantee.
