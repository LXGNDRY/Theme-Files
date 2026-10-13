# Revenue remediation: initial engineering slice

Scope: Shopify Liquid repository, based on edits-here-2 at fc129060bc6ea7d59d9fcb65501dbc9c0fad3f25. No headless changes or production publication.

## Implemented

| Change | Owner | Acceptance evidence |
| --- | --- | --- |
| Clear stale variant IDs and disable submission for nonexistent combinations | Theme engineer | Node regression: select Blue/S when only Red/S and Blue/M exist; submission blocked; Blue/M recovers |
| Preserve image path/version and add valid width/format query parameters | Theme engineer | Node regression checks pathname, version, width and selection recovery |
| Match analytics preview/debug parameter names exactly | Analytics engineer | Node regression: campaign values containing markers remain measurable; real preview parameters suppress |
| Derive cart tax/duties disclosure from Shopify cart flags | Theme engineer | Local Liquid parsing passes; live four-state render remains required |
| Correct taxes-only discount branch translation keys | Theme engineer | Both policy/no-policy branches now use taxes-only strings |
| Replace unconfigured PDP delivery/returns claims with native policy links | Theme engineer | Local Liquid parsing passes; merchant shipping_text override preserved |

Run behavioral checks: `node tests/purchase-path.cjs`.

## Validation boundaries

Local JavaScript syntax, behavioral regressions, Liquid/HTML parsing and English JSONC parsing pass. These are not browser, Shopify runtime, live checkout or supplier-handoff tests.

The Shopify toolkit validator was blocked by automatic approval review because it may transmit private source to shopify.dev. Local checks use Shopify's installed parser directly without uploading source. Full semantic Theme Check remains required; existing GitHub workflows can provide repository checks where available.

## Remaining acceptance tests

1. In a theme preview, confirm invalid combinations cannot add the prior variant; valid selection recovers; sticky purchase control agrees.
2. Change color and confirm successful image requests and correct garment image.
3. Verify campaign URL `?utm_campaign=fall_school` does not suppress GTM; `?preview_theme_id=123` does.
4. Render cart duties/taxes flags in all four combinations, with and without a shipping policy and discount configuration; verify no false duties-included claim.
5. Confirm configured shipping_text remains unchanged and native shipping/refund links resolve.
6. Verify product descriptions, claims and template assignments against actual catalog records.

## Blockers and findings requiring current store access

Shopify get_shop_info returned Authentication required. No fulfillment, inventory, shipping, market, payment, product-template or order settings were verified or changed.

Footer menus are Shopify-managed resources rather than hardcoded URLs in the inspected footer configuration. The public FAQ/contact retrieval failures cannot be corrected confidently through these theme files alone.

The custom product template contains fixed 460GSM/composition/durability copy and free-return/free-shipping promises. Confirm actual template assignment and source facts before revising merchant-authored settings.

The cart local-payment notice hardcodes countries. Actual dLocal merchant eligibility must be checked before claiming methods are available.

The GA4 bridge accepts opaque-origin messages and forwards payloads with minimal validation. Its pixel sender and GTM contract were unavailable; changing that contract without inspection could stop real events. Order/event reconciliation remains unverified.

## Rollback

Before merging, record the current edits-here-2 head and confirm it has not changed since review. Revert the remediation commit to restore all affected theme behavior. For a partial rollback, restore only the affected paths from the parent revision. Re-run purchase-path regression checks and preview smoke tests. These changes do not alter inventory, prices, orders, shipping rates or payment configuration.

## Next work

Priority 1: current variant/location/profile audit and checkout eligibility matrix.
Priority 2: approved customer-policy matrix and Shopify-managed menu corrections.
Priority 3: pixel/GTM inspection, event testing and eligible-order reconciliation.
Priority 4: full browser product/cart checks and measured mobile performance optimization.

Commercial success criteria require a clean traffic baseline; no revenue improvement is claimed from source checks.
