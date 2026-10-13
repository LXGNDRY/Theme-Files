# Mobile performance: native account navigation

Scope: edits-here-2 only. Production theme is separate (151242866841); staging theme is 151147413657.

## Evidence

Production Lighthouse workflow 38469503998 used three mobile runs per surface. Median performance scores were home 27, collection 27, product 26, cart 29. Simulated LCP medians were 19,937 ms, 21,882 ms, 22,514 ms and 12,941 ms respectively. These simulated mobile metrics are not real-user field measurements.

The first run for home, product and cart each downloaded approximately 955,600 bytes across 155 checkout-web resource requests. The header renders an embedded shopify-account component. Its account/login rendering is a candidate source of avoidable storefront work; the account change's actual request reduction and timing impact must be measured after staging sync. These production reports alone do not prove causation.

The reports also show duplicate Google-tag script downloads and substantial script/layout work. Analytics loaders require event-contract verification before any removal. No analytics or payment loader was changed in this slice.

## Change

Replace the header embedded account dialog with Shopify's native account/sign-in navigation routes. Guests navigate to account_login_url; members navigate to account_url. Preserve merchant account enablement, icon/text display modes, accessible labels and minimum 44-pixel targets. Update mobile header account-presence selectors so the link retains the account column layout.

The visible behavior changes from an embedded popup to account-page navigation. The hosted account/login service remains Shopify's.

## Acceptance

- Guest and signed-in rendered fixtures resolve their localized native routes.
- Disabled customer accounts render no link.
- Icon and text modes retain a visible control and accessible name.
- Mobile header rules recognize the native account link.
- Existing purchase, cart recovery and size-guide regressions pass.
- Header Liquid/HTML parsing passes; GitHub Theme Check and static checks must pass before merge.
- After sync, confirm the preview's theme ID and native link markup, then compare repeatable mobile metrics and checkout-web requests. Do not claim an improvement before measurement.

## Rollback

Revert the squash merge commit for this slice to restore the embedded account component, its original mobile selector and CI changes. Run purchase/cart checks and verify account navigation.
