# Performance Baseline

**Status:** NOT YET CAPTURED  
**Branch:** `edits-here-2`  
**Production reference:** `edits-here`  
**Measurement rule:** three runs per page/device; record the median.

## Required URLs

| Surface | URL | Mobile complete | Desktop complete |
|---|---|---:|---:|
| Homepage |  | No | No |
| Primary collection |  | No | No |
| Best-selling PDP |  | No | No |
| Secondary PDP |  | No | No |
| Cart |  | No | No |
| Search |  | No | No |

## Baseline scorecard

| Surface | Device | PSI | LCP | FCP | CLS | INP | TBT | Speed Index | Transfer KB | JS KB | DOM nodes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Homepage | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Homepage | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Collection | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Collection | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PDP primary | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PDP primary | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PDP secondary | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PDP secondary | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Cart | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Cart | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Search | Mobile | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Search | Desktop | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## LCP inventory

| Surface | LCP element | Source asset | Discovery path | Priority | Lazy? | Width served | Render width | Finding |
|---|---|---|---|---|---|---:|---:|---|
| Homepage | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Collection | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PDP | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Main-thread / JavaScript offenders

| Rank | Resource / task | Page(s) | Bytes | Main-thread ms | Third-party? | Critical? | Candidate action |
|---:|---|---|---:|---:|---|---|---|
| 1 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 2 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 3 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 4 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 5 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Third-party inventory

| Provider | Purpose | Pages | Transfer KB | Main-thread ms | Classification | Action |
|---|---|---|---:|---:|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |

Classification values: Revenue critical / Measurement critical / Useful / Unnecessary.

## Image findings

| Page | Asset | Served px | Rendered px | Transfer KB | Loading | Priority | Action |
|---|---|---:|---:|---:|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Font findings

| Font | Weight/style | Format | Preloaded? | Transfer KB | Used above fold? | Action |
|---|---|---|---|---:|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Layout stability findings

| Surface | Shifting element | CLS contribution | Trigger | Proposed fix |
|---|---|---:|---|---|
| TBD | TBD | TBD | TBD | TBD |

## Mobile UX findings

Test widths: 360 / 390 / 412 / 430 CSS px.

| Flow | 360 | 390 | 412 | 430 | Finding |
|---|---|---|---|---|---|
| Header/navigation | TBD | TBD | TBD | TBD | TBD |
| Search | TBD | TBD | TBD | TBD | TBD |
| Collection filters | TBD | TBD | TBD | TBD | TBD |
| PDP gallery | TBD | TBD | TBD | TBD | TBD |
| Variants | TBD | TBD | TBD | TBD | TBD |
| Add to Cart | TBD | TBD | TBD | TBD | TBD |
| Cart drawer | TBD | TBD | TBD | TBD | TBD |
| Checkout CTA | TBD | TBD | TBD | TBD | TBD |

## Baseline exit gate

The baseline workstream is GREEN only when:

- [ ] all six surfaces have three mobile and three desktop runs
- [ ] medians are recorded
- [ ] homepage, collection and PDP LCP elements are identified
- [ ] top five JS/main-thread offenders are recorded
- [ ] third-party inventory is populated
- [ ] biggest image inefficiencies are recorded
- [ ] font requests are inventoried
- [ ] material CLS sources are identified
- [ ] mobile flows are checked at all four widths
- [ ] commerce behavior remains unchanged

Only then should `feat/perf-lcp` begin.
