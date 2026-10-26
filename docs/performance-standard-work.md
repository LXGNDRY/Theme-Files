# Storefront performance standard work

This is the operating record for performance changes on `edits-here-2`.

## Rules

- Work one performance hypothesis at a time.
- Compare three mobile and three desktop runs per route; record the median.
- A performance gain is valid only when storefront behavior and analytics still pass.
- Stop promotion when an app, checkout path, or primary analytics event regresses.
- Promote only a measured winner; revert an inconclusive experiment.

## Required routes

Homepage, primary collection, primary PDP, secondary PDP, search, and cart.

## Slice 1 — streamed HTML

**Hypothesis:** rendering `content_for_header` directly allows Shopify streamed HTML on eligible JSON templates and reduces response delivery delay.

**Implementation:** `layout/theme.liquid` emits `{{ content_for_header }}` directly. The previous capture-and-rewrite path is retained in the repository for rollback but is no longer rendered.

**Canary verification:**

1. Publish the branch to a non-production theme, then use a controlled published-theme canary. Shopify preview URLs do not demonstrate streamed HTML behavior reliably.
2. Confirm response streaming and compare FCP, LCP discovery time, resource count, transfer size, and long tasks against the control.
3. Verify Judge.me, Klaviyo, localization, predictive search, cart, checkout handoff, and the `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` event contract.
4. Promote only if the median is better with no behavior or analytics regression.

## Slice 2 — component-owned media helpers

**Hypothesis:** a helper with no matching DOM target is pure request and parse waste.

**Implementation:** `lb-idle-defer.liquid` now loads video helpers only when a matching video or deferred-media element exists.

**Verification:** capture a home, collection, cart, and text-only page trace and confirm that neither video helper loads when its anchor is absent. Confirm autoplay media still initializes when it becomes visible.

## Next slices

- Establish the full six-route baseline in `docs/performance-baseline.md`.
- Identify actual LCP candidates before adding any preload.
- Use a route/component JavaScript loading matrix before pruning modulepreloads or changing interaction-triggered components.
- Reduce CSS preloads only when a trace shows they contend with first paint.

## Rollback

Revert the commit that introduced the measured regression. Do not compensate by adding another global deferrer, preload, or timeout.
