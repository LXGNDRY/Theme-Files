# Performance Workstream Board

This board is the execution order for the storefront UX/PageSpeed programme.

| ID | Workstream | Priority | Status | Branch | Exit evidence |
|---|---|---|---|---|---|
| PERF-00 | Baseline + instrumentation | P0 | READY | `feat/perf-baseline` | median PSI/CWV scorecard completed |
| PERF-01 | LCP / above-the-fold | P0 | BLOCKED by PERF-00 | `feat/perf-lcp` | before/after LCP evidence |
| PERF-02 | Third-party containment | P0 | BLOCKED by PERF-00 | `feat/perf-third-party` | provider inventory + timing changes |
| PERF-03 | Main-thread JavaScript | P0 | BLOCKED by PERF-00 | `feat/perf-js` | JS execution matrix + TBT evidence |
| PERF-04 | Responsive images | P0 | BLOCKED by PERF-00 | `feat/perf-images` | image sizing/payload evidence |
| PERF-05 | CLS + fonts | P1 | BLOCKED | `feat/perf-cls-fonts` | CLS/font waterfall evidence |
| PERF-06 | Mobile UX + perceived speed | P1 | BLOCKED | `feat/perf-mobile-ux` | 360/390/412/430 QA matrix |
| PERF-07 | DOM + Liquid efficiency | P2 | BLOCKED | `feat/perf-dom-liquid` | DOM/render evidence |
| PERF-08 | CSS surgical cleanup | P2 | BLOCKED | `feat/perf-css` | coverage-driven before/after evidence |
| PERF-09 | Resource hints/speculation | P2 | BLOCKED | `feat/perf-resource-hints` | request-chain/navigation evidence |
| PERF-10 | Final score polish | P3 | BLOCKED | `feat/perf-polish` | final multi-page scorecard |

## State definitions

- **READY** — prerequisites complete; work may start.
- **IN PROGRESS** — active branch exists and implementation is underway.
- **QA** — merged to `edits-here-2`, awaiting verification.
- **BLOCKED** — prerequisite evidence is incomplete.
- **DONE** — verified on `edits-here-2` and promoted to `edits-here` when applicable.
- **REVERTED** — measured regression or guardrail failure.

## PERF-00 tasks

- [ ] Choose production URLs for all six required surfaces.
- [ ] Run mobile PSI/Lighthouse three times per surface.
- [ ] Run desktop PSI/Lighthouse three times per surface.
- [ ] Record medians in `docs/performance-baseline.md`.
- [ ] Identify homepage, collection and PDP LCP elements.
- [ ] Record top five main-thread/JS offenders.
- [ ] Inventory third parties.
- [ ] Inventory largest image mismatches.
- [ ] Inventory font requests.
- [ ] Identify material CLS sources.
- [ ] Verify core mobile flows at 360/390/412/430 px.
- [ ] Freeze the baseline before PERF-01 starts.

## Promotion rule

Every implementation workstream follows:

`feature branch -> PR -> edits-here-2 -> QA -> PR -> edits-here -> Shopify sync verification`

No workstream is promoted simply because Lighthouse reports a higher number. Commerce integrity and UX are hard gates.

## Parallelism rule

PERF-01 through PERF-04 may be researched in parallel after PERF-00, but storefront implementation should remain isolated by workstream so regressions can be attributed and reverted cleanly.

## Evidence rule

Every workstream PR must link or quote:

1. baseline measurement
2. hypothesis
3. before/after median
4. files changed
5. commerce QA result
6. mobile QA result
7. Theme Check result
8. rollback path
