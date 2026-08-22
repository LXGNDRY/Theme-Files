# Storefront UX + Google PageSpeed Optimization Programme

**Repository:** `LXGNDRY/Theme-Files`  
**Integration branch:** `edits-here-2`  
**Production branch:** `edits-here`  
**Programme status:** BOOTSTRAPPED  
**Primary objective:** improve real storefront UX and Core Web Vitals without weakening commerce, analytics, SEO, accessibility, or visual quality.

## 1. Success criteria

Performance work is accepted only when it improves measurable speed/UX and preserves the revenue path.

| Metric | Required target | Stretch target |
|---|---:|---:|
| Mobile PageSpeed Performance | >= 90 where realistically achievable | >= 95 |
| Desktop PageSpeed Performance | >= 95 | >= 98 |
| LCP | <= 2.5 s | <= 2.0 s |
| INP | <= 200 ms | <= 150 ms |
| CLS | <= 0.10 | <= 0.05 |
| Lighthouse TBT | <= 200 ms | <= 100 ms |

PageSpeed score alone is never a release gate if the proposed change damages usability or commerce reliability.

## 2. Non-negotiable guardrails

Every performance release must preserve:

- product page rendering and media
- variant selection
- Add to Cart
- cart drawer and cart page
- quantity changes
- discount behavior
- accelerated payment buttons
- checkout initiation
- localization/market behavior
- mobile navigation and search
- analytics attribution
- structured data / SEO output
- WCAG 2.1 AA fundamentals

A performance improvement that breaks or weakens any of the above is reverted.

## 3. Baseline protocol

Before modifying storefront behavior, capture three Google PageSpeed/Lighthouse runs per page and use the median.

Required surfaces:

1. Homepage
2. Primary collection
3. Best-selling PDP
4. Secondary PDP
5. Cart
6. Search

Capture mobile and desktop for each surface.

Record:

- Performance score
- LCP
- FCP
- CLS
- INP when field data exists
- TBT
- Speed Index
- transfer size
- total JS bytes
- JS execution time
- long tasks
- unused JavaScript
- unused CSS
- render-blocking resources
- largest image payloads
- font payload
- third-party payload and main-thread time
- DOM element count
- LCP element and request chain

Store results in `docs/performance-baseline.md` using the provided template.

## 4. Workstream sequence

### P0-1 — Baseline and instrumentation

No code optimization begins until a repeatable production baseline exists.

Definition of Done:

- all six required surfaces measured
- three runs per device class
- medians recorded
- LCP element identified per major template
- top five network/main-thread offenders recorded
- no storefront code change in the baseline slice

### P0-2 — LCP / above-the-fold

Inspect the complete critical rendering chain:

`HTML -> CSS -> resource discovery -> network -> decode -> paint`

Audit:

- hero media
- PDP primary media
- collection lead image/card
- `chaos_unleashed_lcp_preload.liquid`
- collection LCP preload logic
- `fetchpriority`
- `loading`
- `srcset`
- `sizes`
- image dimensions/aspect ratio
- hidden desktop/mobile duplicate downloads
- hero video poster strategy

Rules:

- genuine LCP images must not be lazy-loaded
- only genuine high-confidence LCP assets receive `fetchpriority="high"`
- do not preload competing candidates
- do not require JavaScript to discover the primary visual
- do not send oversized desktop assets to mobile

### P0-3 — JavaScript execution

Create a JS execution matrix before deleting or deferring code.

For every meaningful JS asset record:

- templates/pages loaded on
- feature owner
- bytes
- whether required before interaction
- whether execution is global or conditional
- defer / idle / interaction / viewport / remove decision

Prioritize:

- global scripts supporting page-specific features
- carousels/sliders
- predictive search
- product gallery
- recommendations
- popup/newsletter logic
- countdown/lookbook components
- AI chat initialization
- duplicated listeners
- long synchronous initialization

Revenue-critical cart/ATC logic must remain deterministic.

### P0-4 — Third-party containment

Inventory every third-party script and classify:

1. Revenue critical
2. Measurement critical
3. Useful
4. Unnecessary

Audit Google/GA4/GTM, Meta, Klaviyo, Shopify apps, reviews, payment integrations, chat, consent tooling and personalization.

Do not blindly defer attribution code. Verify `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` after any measurement change.

### P0-5 — Responsive image pipeline

Standardize image output across:

- hero
- collection cards
- PDP primary/gallery
- recommendation cards
- editorial images
- below-fold media

Requirements:

- accurate `srcset`
- accurate `sizes`
- dimensions/aspect ratio
- Shopify CDN transforms
- appropriate mobile widths
- lazy load below fold
- eager only when justified

### P1-1 — CLS + fonts

Eliminate layout movement from header, announcements, hero, product media, price, variants, reviews, payment messaging, recommendations, chat and popups.

Fonts:

- audit families and weights
- prefer WOFF2
- preload only critical faces
- `font-display: swap`
- remove duplicate/unused loads
- avoid icon fonts when inline SVG is simpler

### P1-2 — Mobile UX

Verify at minimum 360, 390, 412 and 430 CSS px widths.

Audit:

- tap targets
- navigation
- search
- filters
- gallery gestures
- variant controls
- sticky ATC
- quantity controls
- cart drawer
- checkout CTA
- text wrapping
- horizontal overflow
- loading/disabled/success states

The product path should remain simple:

`understand product -> inspect media -> select variant -> see confidence information -> add to cart -> checkout`

### P1-3 — Perceived performance

Provide immediate feedback for:

- Add to Cart
- variant changes
- quantity changes
- filters
- search
- cart updates
- checkout initiation

Do not leave a customer unsure whether an interaction registered.

### P2-1 — DOM + Liquid

Measure before refactoring.

Target:

- duplicate mobile/desktop markup
- unnecessary wrappers
- hidden duplicated content
- giant section trees
- repeated Liquid calculations
- expensive nested loops
- oversized menus
- excessive product-card DOM

Prefer lean server-rendered HTML over rendering everything and hiding it with CSS/JS.

### P2-2 — CSS surgery

Do not restart the historical "minify everything" programme.

The current architecture already defers the large global stylesheets and carries a relatively small critical CSS layer. Changes here must be evidence-driven.

Target only:

- genuinely unused rules
- duplicate selectors
- stale feature styles
- specificity wars
- large component CSS that can safely become template-conditional
- late-arriving layout-critical rules

### P2-3 — Resource hints / navigation

Audit current preload, prefetch, preconnect and speculation rules.

High-confidence navigation paths include:

- homepage -> collection
- collection -> PDP
- PDP -> cart

Never add speculative bandwidth that competes with LCP.

## 5. Vertical-slice branch model

Use one measurable concern per branch:

- `feat/perf-baseline`
- `feat/perf-lcp`
- `feat/perf-js`
- `feat/perf-third-party`
- `feat/perf-images`
- `feat/perf-cls-fonts`
- `feat/perf-mobile-ux`
- `feat/perf-dom-liquid`

Promotion path:

`feat/* -> PR -> edits-here-2 -> QA -> PR -> edits-here -> Shopify verification`

Do not bundle unrelated optimization work.

## 6. Release Definition of Done

Every optimization PR must include:

- problem statement
- baseline evidence
- hypothesis
- files changed
- expected metric impact
- before/after measurement
- mobile verification
- desktop verification
- commerce-path verification
- analytics verification if relevant
- accessibility verification
- Theme Check result
- rollback commit/instructions

No PR is promoted on score improvement alone.

## 7. Stop conditions

Stop or revert a workstream when:

- conversion path regresses
- LCP improves but INP/CLS materially worsens
- analytics events stop or duplicate
- mobile interaction becomes less reliable
- a change depends on brittle timing hacks
- Shopify sync does not deploy every changed file
- improvement is within normal test noise and adds complexity

## 8. Execution order

1. Baseline
2. LCP
3. Third-party execution
4. Main-thread JavaScript
5. Responsive images
6. CLS/fonts
7. Mobile UX and perceived performance
8. DOM/Liquid
9. CSS dead-code surgery
10. Resource hints
11. Score polishing only after CWV and commerce UX are healthy

## 9. Programme principle

The storefront is optimized for customers first and Lighthouse second. A score of 95 with a weaker checkout experience is a failed release. A score of 90 with green Core Web Vitals, fast interaction, stable layout and a reliable purchase path is the stronger outcome.
