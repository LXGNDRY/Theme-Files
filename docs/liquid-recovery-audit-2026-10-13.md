# Legendary Branding — Liquid Recovery Baseline (2026-10-13)

## Authorized scope
- Repository: `LXGNDRY/Theme-Files`
- Source/PR target: `edits-here-2`
- Working branch: `audit/liquid-recovery-20261013`
- Excluded: `LXGNDRY/legendary-branding-headless`, theme default branch `edits-here`, and live Shopify settings mutations.
- No merge or publication without reviewed test evidence.

## Verified source observations
1. `layout/theme.liquid` is present on `edits-here-2`; it captures `content_for_header` and renders `chaos_unleashed_cfh_defer`. This is a compatibility-sensitive customization; it is **not yet proven to cause** traffic or checkout issues.
2. `layout/theme.liquid` implements GTM bootstrapping, delayed loading, and analytics suppression for preview-like contexts. Verify that real shoppers with legitimate URL parameters are not inadvertently suppressed.
3. `snippets/lb-consent-mode-v2.liquid` sets conservative consent defaults and updates from Shopify's customerPrivacy API. Verify actual consent behavior without bypassing user choice.
4. `templates/product.json` includes Judge.me review preview, product price, variant picker, and buy buttons. A disabled product text block mentions free shipping; verify all visible shipping claims against actual Shopify checkout settings.
5. `templates/robots.txt.liquid` **is present** on `edits-here-2` (159 lines; header identifies v3.1.0 dated 2026-08-26). Its comments describe locale and crawler directives; inspect rendered robots output and Search Console evidence before modifying it.
6. Repository default branch is `edits-here`, but user explicitly requires `edits-here-2`. Do not confuse default branch with published Shopify theme.

## Next engineering tasks
- [ ] Inspect `templates/robots.txt.liquid`, `snippets/seo-*`, canonical markup, redirects and structured data; compare with live output.
- [ ] Inspect actual cart implementation, buy buttons, checkout link generation, and variant state changes. Test US and representative international markets without completing payment.
- [ ] Inventory all GA4/GTM/Meta purchase event emitters in Liquid/assets; document dedup and consent logic. Preserve current working behavior until tests exist.
- [ ] Add regression checks for canonical tags, add-to-cart, checkout handoff, and safe `content_for_header` handling.
- [ ] Run Shopify Theme Check, automated tests and manual preview smoke tests where available.

## Release gate / rollback
Changes remain on this audit branch and must target `edits-here-2` in a draft PR. Revert the PR or delete the working branch to roll back code-only audit additions. Production changes require a verified theme ID, backup, smoke-test results and owner approval.
