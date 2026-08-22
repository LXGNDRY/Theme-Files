# Repository Audit — 2026-08-21

Repository: `LXGNDRY/Theme-Files`  
Audited production-connected branch: `edits-here`

## Executive assessment

The theme is a mature, heavily customized Shopify Online Store 2.0 codebase with substantial performance, SEO, merchandising, accessibility, payment UX, and brand-system work already merged. The largest immediate engineering risk is not a missing redesign; it is release governance and branch drift around a live Shopify-connected repository.

The audit therefore prioritizes preserving checkout/revenue behavior, preventing silent regressions, and making future changes testable before more aggressive refactoring.

## Confirmed repository state

- Repository default branch: `edits-here`.
- `edits-here` is the current production-connected source of truth used by recent Shopify sync commits and merged feature PRs.
- `edits-here-2` had no unique commits and was seven commits behind `edits-here`; it was safely fast-forwarded to the current `edits-here` head before this hardening slice.
- `Main` is not a safe promotion target in its current state. It has diverged from `edits-here`: five commits ahead and 109 commits behind at audit time.
- `complete-redesign` is also highly divergent: 55 commits ahead and 159 commits behind `edits-here`, with broad template/section/config differences. It must be treated as an experimental historical branch, not merged wholesale.
- The recently used `claude/repo-familiarization-ancqda` branch has no unique commits remaining after PRs #46 and #47; its changes are already contained in `edits-here`.

## Recent work verified in history

Recent merged work includes:

- AI customer-service widget integration behind disabled-by-default theme settings.
- International payment notice and market-based payment icon filtering.
- Brand identity system, vector goat mark, editorial texture, scroll refinements, and product garment specification readout.
- SEO/internal-linking work: collection BreadcrumbList, homepage ItemList data, subcollection navigation, and homepage contextual links.
- Performance fixes for responsive images, image priority, alt text, and hero-video timing.
- Removal of the custom `content-visibility:auto` layer after it caused mobile collection pagination failures.

The commit history also documents repeated Shopify GitHub sync anomalies, especially around `sections/main-collection.liquid`. Deployment verification must remain a release gate.

## Architecture findings

### Strong areas

1. Standard Shopify theme directory structure is preserved (`assets`, `blocks`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`).
2. Modern `{% render %}` usage is preferred; repository search found no legacy `include` usage.
3. The repository contains explicit engineering guidance (`README.md`, `CLAUDE.md`) and optimization workstream documentation.
4. Major CSS payloads are already deferred/non-blocking according to the optimization programme. The existing audit reports ~31 KB render-blocking CSS rather than the earlier assumed 260 KB.
5. Page-specific/custom assets are increasingly gated rather than blindly loaded globally.
6. Recent fixes show good regression discipline: destructive dead-code removals were reversed when an active campaign dependency was discovered.
7. Secret-oriented repository search did not surface obvious hardcoded API keys/tokens in theme code.

### Risks / gaps

#### P0 — Release governance was documented but not enforced

The repository had no GitHub Actions workflow and no `.theme-check.yml`, despite documentation calling for required checks. This hardening slice adds Shopify's official Theme Check action and the recommended Theme Check configuration.

#### P0 — Production branch naming/model is inconsistent in documentation

`README.md` describes an aspirational `main` / `dev` model, while `CLAUDE.md` instructs direct work on `edits-here`, and current operations use `edits-here` as the live branch. Until `Main` is reconciled, automation and contributors must treat `edits-here` as production and `edits-here-2` as development/staging.

#### P0 — `Main` is materially divergent

Do not merge `Main` into `edits-here`, or vice versa, without a file-by-file reconciliation plan. The current delta includes large changes to `lb-product-page.liquid`, collection/index templates, pagination code, and multiple branded sections. A force update would risk silently discarding legitimate work on one side.

#### P1 — `complete-redesign` is too divergent for a normal PR

It contains a large alternate design system and many added editorial/Veonn sections while being far behind production history. Cherry-pick only explicitly desired, independently audited components.

#### P1 — Live Shopify sync has a documented history of silently missing files

A green GitHub PR is not sufficient proof of deployment. After every production merge, changed files must be compared against the connected Shopify theme before the release is considered complete.

#### P1 — Analytics assurance remains an admin-side precondition

The optimization programme correctly notes that storefront Liquid forwards analytics events but cannot prove the underlying Shopify Web Pixel/customer-events configuration is active. GA4 `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` should be verified in Shopify/GA4 before using conversion data to judge theme changes.

#### P1 — Core Web Vitals baseline remains incomplete

The existing plan still has TBD mobile LCP/TBT/CLS baselines. Any further performance work should be evidence-driven from PageSpeed/CrUX rather than another broad CSS rewrite.

#### P2 — Product template consolidation is data-dependent

The existing workstream correctly avoids deleting product templates until Shopify Admin assignments are verified. Do not infer template usage from repository references alone.

#### P2 — AI chat integration is correctly disabled by default but backend E2E is unverified here

The theme-side integration appears intentionally secret-free and guarded. Production enablement still requires a real backend, CORS/security validation, failure-state testing, keyboard/focus verification, rate limiting/abuse protection server-side, and privacy review for any future authenticated order lookup.

## Changes made by this audit

1. Fast-forwarded `edits-here-2` to the current `edits-here` head because staging was seven commits behind with no unique commits.
2. Created isolated branch `feat/repo-hardening-2026-08-21`.
3. Added `.theme-check.yml` extending `theme-check:recommended`.
4. Added `.github/workflows/theme-check.yml` using `shopify/theme-check-action@v2`, failing CI on Theme Check errors.
5. Added `.github/pull_request_template.md` with explicit commerce, accessibility, performance, analytics, Shopify-sync, and rollback gates.
6. Added this audit record.

## Required branch model until reconciliation is complete

- `edits-here` — production-connected branch. No direct feature development.
- `edits-here-2` — development/staging integration branch.
- `feat/*` / `fix/*` — isolated implementation branches, normally based on `edits-here-2`.
- `Main` — quarantine/reconciliation branch until its five unique commits are dispositioned.
- `complete-redesign` — experimental archive; cherry-pick only, never wholesale merge.

Recommended promotion path:

`feat/*` -> PR -> `edits-here-2` -> preview/QA -> PR -> `edits-here` -> Shopify sync verification.

## Definition of done for future production releases

A release is complete only when all applicable items are true:

- Shopify Theme Check passes.
- Liquid/schema references are valid.
- Mobile and desktop storefront behavior is verified.
- Add-to-cart, cart, checkout initiation, and payment UI work.
- Interactive changes pass keyboard/focus checks.
- No new secrets or private credentials are present.
- Performance-sensitive changes have a before/after measurement.
- SEO/schema changes validate.
- Analytics-sensitive changes preserve event flow.
- Shopify's connected theme actually received every changed file.
- A rollback path is recorded.

## Next engineering sequence

1. Land this hardening slice into `edits-here-2` after CI is green.
2. Verify the staging-connected Shopify theme receives every hardening file.
3. Promote the same slice to `edits-here` through a separate PR after staging verification.
4. Reconcile the five unique `Main` commits individually; do not merge the branch wholesale.
5. Capture PageSpeed/CrUX baseline for homepage, collection, and PDP.
6. Verify GA4/customer-event pipeline in Shopify Admin and GA4 DebugView.
7. Continue only evidence-backed workstreams: product-template assignment audit, live asset/coverage review, and targeted UX fixes.

## Explicit non-actions

- No forced update of `Main`.
- No wholesale merge of `complete-redesign`.
- No deletion of templates whose Shopify product assignments are unknown.
- No removal of Razorpay/payment integration code without merchant-side confirmation.
- No broad CSS rewrite; existing documentation shows the original blocking-CSS premise is obsolete.
- No enabling of the AI assistant without a validated backend.
