# Performance Budgets and Release Gates

These budgets govern the UX/PageSpeed optimization programme.

## Core Web Vitals / Lighthouse budgets

| Metric | Warn | Fail / investigate | Target |
|---|---:|---:|---:|
| Mobile PSI Performance | < 90 | < 85 after an optimization release | >= 90 |
| Desktop PSI Performance | < 95 | < 90 after an optimization release | >= 95 |
| LCP | > 2.5 s | > 3.0 s | <= 2.5 s |
| INP | > 200 ms | > 300 ms | <= 200 ms |
| CLS | > 0.10 | > 0.15 | <= 0.10 |
| Lighthouse TBT | > 200 ms | > 300 ms | <= 200 ms |

A single lab run is never sufficient evidence. Compare median-of-three against the prior median using the same page/device conditions.

## Regression policy

A release is blocked when any of the following occur without a documented, justified tradeoff:

- LCP regresses by >= 200 ms
- TBT regresses by >= 100 ms
- CLS increases by >= 0.03
- mobile PSI drops by >= 5 points
- transfer size rises materially with no customer benefit
- new long tasks appear on the critical interaction path
- the LCP candidate becomes lazy-loaded or JS-discovered
- duplicate responsive images download above the fold

Small movements within normal test noise are not treated as wins or losses.

## Commerce gates

The following are hard release gates regardless of performance score:

- [ ] PDP renders correctly
- [ ] variants select correctly
- [ ] Add to Cart succeeds
- [ ] cart drawer opens and updates
- [ ] cart page updates quantity/removal
- [ ] discount behavior remains correct
- [ ] accelerated payment buttons remain functional
- [ ] checkout initiation succeeds
- [ ] localization/market behavior remains correct
- [ ] mobile navigation/search/filter flows remain usable

## Analytics gates

When a change can affect measurement or script timing, verify:

- [ ] `view_item`
- [ ] `add_to_cart`
- [ ] `begin_checkout`
- [ ] `purchase`

No performance release may intentionally trade attribution integrity for a PageSpeed score.

## Accessibility gates

- [ ] keyboard navigation still works
- [ ] focus indicators are visible
- [ ] dialog/drawer focus return is correct
- [ ] touch targets remain usable
- [ ] meaningful images retain alt handling
- [ ] reduced-motion preferences remain respected
- [ ] no new horizontal overflow at supported mobile widths

## Image budgets

Rules rather than hard byte limits are used because product/editorial imagery varies.

- LCP media should be near the rendered dimensions for its viewport.
- Mobile should not routinely receive desktop-width assets.
- Below-fold imagery should lazy-load.
- Hidden responsive variants must not both download.
- Decorative poster/background assets should not compete with the actual LCP candidate.
- Do not preload more than one competing hero/LCP candidate per viewport unless measurement proves benefit.

## JavaScript budgets

- No new global JavaScript for a page-specific feature without explicit justification.
- New components should initialize only where rendered.
- Noncritical UI should prefer deferred, idle, viewport, or interaction-triggered initialization.
- Revenue-path code must remain deterministic and must not depend on fragile idle timing.
- Every new third-party script requires an owner, business purpose, and classification.

## CSS budgets

- Do not rewrite the existing CSS architecture solely to reduce source-file size.
- New page-specific CSS should be conditional where practical.
- Layout-critical CSS must arrive before the layout depends on it.
- Duplicate/specificity-heavy rules should be removed only with coverage evidence.

## Complexity budget

An optimization is rejected when its measured benefit is within normal test noise but it materially increases implementation or maintenance complexity.

The preferred outcome is the simplest change that produces a durable, repeatable improvement.
