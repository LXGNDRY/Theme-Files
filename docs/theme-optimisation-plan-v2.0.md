# Theme Optimization Programme — edits-here-2

Document owner: _______________   Approver: _______________   Version: 2.0   Date: _______________

Store: legendary-branding.com   Repo: LXGNDRY/Theme-Files   Target branch: edits-here-2
Theme base: Shopify Dawn-family "Horizon" variant, heavily customised.

---

## 1. EXECUTIVE SUMMARY

A 24-template Shopify theme carrying 478 KB CSS (16 files) and 699 KB JS (85 files),
with 365 KB of CSS (chaos-theme-styles 265 KB + base.aio.min.css 104 KB) loading on
every page regardless of need. The theme is well engineered; this programme removes
structural waste rather than rewriting.

Estimated effort: 35-42 engineering hours across 8 workstreams.
Primary risk: this is a live revenue-generating storefront with a documented
history of silent GitHub→Shopify sync failures.

Expected outcome: 150-200 KB removed from the average page, measurable LCP/TBT
improvement, and a materially smaller maintenance surface.

---

## 2. OBJECTIVES AND SUCCESS CRITERIA

Each objective is binary — met or not met. No subjective assessment.

  ID    Objective                        Metric              Baseline  Target
  O-1   Reduce per-page CSS weight       KB CSS / page       365 KB    <=180 KB
  O-2   Improve mobile LCP               PSI p75 mobile      TBD §7.1  <=2.5 s
  O-3   Reduce main-thread blocking      PSI TBT mobile      TBD §7.1  <=200 ms
  O-4   Hold layout stability            PSI CLS mobile      TBD §7.1  <=0.1
  O-5   Reduce template count            product templates   6         <=3
  O-6   Eliminate dead code              unreferenced files  8         0
  O-7   Close schema coverage gaps       templates w/ schema 5 of 9     7 of 9
  O-8   Restore analytics assurance      GA4 events verified unknown   4 of 4

O-2/O-3/O-4 are Core Web Vitals thresholds.
O-7 counts templates where structured data is meaningfully emitted: product,
collection, article, index, search qualify; blog and 404 are non-goals (blog
archives carry Article schema per-post, not per-page; 404 pages carry no
schema by design).
O-8 is a precondition, not an outcome — see §4.

O-1 baseline note: 365 KB = chaos-theme-styles.css (265) + base.aio.min.css (100).
The target of <=180 KB assumes splitting chaos-theme-styles into ~100 KB critical
+ ~80 KB conditional component bundles; base.aio.min.css is presumed global.

---

## 3. GUARDRAILS (NON-NEGOTIABLE)

Any change that violates a guardrail is reverted immediately, without discussion.

  G-1  Revenue path integrity
       Add-to-cart, cart drawer, checkout initiation and payment buttons must
       function on every release. Verified manually pre- and post-deploy.

  G-2  Attribution integrity
       GA4, Meta and Klaviyo event flow must not regress. Broken attribution
       corrupts ad optimisation and is more expensive than any speed gain here.

  G-3  No unreviewed writes to the live theme
       edits-here (role MAIN) receives changes only via merged PR, never by
       direct API write or admin edit during the programme.

  G-4  One workstream per release
       Bundled changes make regressions unattributable and rollback destructive.

  G-5  Accessibility must not regress
       WCAG 2.1 AA. US e-commerce carries real ADA litigation exposure; alt text
       and focus states are compliance items, not polish.

  G-6  No deployment during a freeze window
       See §9.

---

## 4. PRECONDITIONS (BLOCKING — no workstream may begin until all three are GREEN)

  P-1  Analytics assurance
       snippets/lb-ga4-events.liquid only FORWARDS events; it bridges postMessage
       from a Shopify Web Pixel into dataLayer. If that pixel is absent, disabled,
       or its origin is missing from ALLOWED_ORIGINS, GA4 ecommerce events stop
       silently — no console error, no visible symptom.
       Action: Admin > Settings > Customer events. Confirm active. Then GA4
       DebugView: view_item, add_to_cart, begin_checkout, purchase.
       Exit criteria: all four events observed.
       Rationale: without this, every measurement in §7 is unverifiable.

  P-2  Deployment channel integrity
       sections/main-collection.liquid has been observed stale on the live theme
       in the past. The GitHub→Shopify sync has silently dropped individual files
       on this repo.
       Action: either theme-editor save on affected section, or disconnect/
       reconnect the GitHub integration.
       Exit criteria: deployed byte size == local byte size for ALL files on a
       clean test deploy (at minimum: WS-1 first, see below).
       Rationale: a single silently-dropped file invalidates all measurement.

  P-3  Performance baseline captured
       See §7.1. Exit criteria: three runs per template recorded, median taken.

---

## 5. ENVIRONMENTS AND CHANGE CONTROL

  Environment    Theme ID               Role         Purpose
  Development    151147413657           UNPUBLISHED  All work lands here first
  Production     151242866841 (edits-here)  MAIN    Live storefront

  Promotion path:  feature branch -> PR -> edits-here-2 -> soak -> PR -> edits-here

  Change control:
    - Every change is a PR. No direct pushes to either theme branch.
    - PR must state: workstream ID, files touched, rollback commit, DoD evidence.
    - Minimum soak on edits-here-2: 24 hours for P0/P1 workstreams, 2 hours for P3+.
    - Production deploys occur only after §6 Definition of Done is fully met.

  Post-deploy verification (MANDATORY, every release):
    Query the live theme via Shopify MCP and compare byte size per changed file
    against local. A single silently-dropped file invalidates the release and
    all measurement from it.

---

## 6. WORKSTREAMS

Each carries: scope, Definition of Done, rollback, risk rating.

---
### WS-1 — Dead code removal
Priority P1 · Effort 0.25h · Risk: NONE

Delete (all verified zero render / zero section references):
  sections/predictive-search.liquid
  sections/predictive-search-empty.liquid
  sections/section-rendering-product-card.liquid
  snippets/image.liquid
  snippets/lb-cart-upsell.liquid
  snippets/lb-font-unicode-range.liquid
  snippets/lb-header-comment-template.liquid

EXCLUDED — sections/password-footer.liquid is NOT dead.
  layout/password.liquid:52 contains {% section 'password-footer' %}.
  Deletion breaks the password page whenever the store is password-protected.

DoD:
  [ ] grep for render/section references across all directories returns zero
  [ ] Password page renders correctly (enable password mode, verify, disable)
  [ ] Theme compiles with no Liquid errors
Rollback: single revert commit.

---
### WS-2 — Section retirement (ATOMIC — both steps or neither)
Priority P3 · Effort 1h · Risk: MEDIUM

These sections ship presets, so merchants can insert them from the editor at any
time. Deleting their JS while the preset remains converts a latent feature into a
production defect. Steps A and B ship together or not at all.

Step A — remove `presets` from {% schema %} (retain files):
  carousel, collection-links, collection-list, custom-liquid, featured-blog-posts,
  featured-product, layered-slideshow, lb-before-after, lb-lookbook,
  lb-newsletter-popup, lb-press, marquee, media-with-content, product-hotspots,
  quick-order-list

  EXCLUDED — `logo` is in active use (password.json, footer-group.json).
  RETAINED — featured-product-information (used on homepage), hero (homepage),
  product-information (PDP), product-list (9 templates), slideshow (2 PDPs),
  all main-* and search-* sections (template-level).

Step B — delete the corresponding JS:
  collection-links.js, layered-slideshow.js, marquee.js, quick-order-list.js,
  product-hotspot.js, comparison-slider.js, lb-before-after.js, lb-countdown.js

  carousel.js — does not exist as a standalone file (carousel uses shared components).
  lb-razorpay.js — HOLD pending written confirmation that Razorpay is not an
  enabled payment method. Deleting an active gateway integration is a G-1 violation.

DoD:
  [ ] No template JSON references any retired section type
  [ ] Theme editor insert menu no longer offers the 15 sections
  [ ] All 24 templates spot-checked and render unchanged
  [ ] Razorpay status confirmed in writing before lb-razorpay.js deletion
Rollback: revert as a unit — JS restore and preset restore must be simultaneous.

---
### WS-3 — Product template consolidation
Priority P2 · Effort 2h · Risk: LOW (data-dependent)

Six product templates; five are near-identical to product.json, differing only
by section selection and settings.

Sequence is MANDATORY:
  1. Admin > Products, filter by template. Record every product assignment.
  2. Consolidate the five variants onto product.json via section visibility
     toggles and block-level settings.
  3. Reassign affected products to product.json.
  4. Delete emptied templates — never before step 3.

product.lb-product-page.json is structurally distinct (lb-product-page section
instead of product-information) — RETAIN as the second template.
product.featured-productss.json is likely orphaned (typo'd name) — verify via
admin product assignment, do not assume.

Target end state: 2 product templates (product.json, product.lb-product-page.json).

DoD:
  [ ] Written record of pre-change product-to-template assignments
  [ ] Zero products assigned to a deleted template
  [ ] Visual regression check on one product per consolidated template
  [ ] Product schema still validates (Rich Results Test)
Rollback: restore templates from git; reassign products from the §6 record.
Note: rollback requires manual admin work. Treat as slow to reverse.

WS-3 RESEARCH DELIVERABLE: docs/ws3-product-template-consolidation.md
  - Full analysis of all 6 product templates
  - Consolidation strategy: 5 templates → product.json + section visibility toggles
  - Required admin actions sequence
  - Risk and rollback plan

---
### WS-4 — CSS architecture
Priority P0 · Effort 8h + QA · Risk: MEDIUM

4a. Split chaos-theme-styles.css (265 KB, currently loaded on every page)

  Bundle       Target      Contents
  critical     80-100 KB   layout, header, footer, buttons, typography, variables,
                           product card base, cart drawer base, form base
  component    80-100 KB   product card (full), collection grid, filters,
                           PDP details, media gallery, quick-add
  rare         80-100 KB   slideshow, layered-slideshow, quick-order-list,
                           comparison-slider, marquee, lookbook, fit-check,
                           before-after, countdown, press, testimonials,
                           ticker, brand-story

  Classification method: Chrome Coverage across homepage, PDP, collection.
    used on 3 of 3 -> critical ; 2 of 3 -> component ; 0-1 of 3 -> rare

  CONSTRAINT: retain the existing preload-swap delivery mechanism
  (rel="preload" as="style" onload="this.rel='stylesheet'"). Converting critical
  CSS to fully-blocking changes the render architecture and risks an LCP
  regression. Split the bundles; do not change the mechanism.

  CONTEXT: content-visibility was removed theme-wide on 2026-08-12, so there is
  no lazy-render cushion if a bundle is misclassified. Full-template QA is
  mandatory. The critical CSS inline block (critical-css.liquid, ~31 KB) is
  already in place and must remain — it covers first-paint layout rules.

4b. Extract inline CSS

  40 files carry inline {% style %} / {% stylesheet %} / <style> blocks.
  Total: ~102 KB across the codebase. These are uncacheable and duplicated per
  section render.

  Extract to assets/, load conditionally per-template:
    ai_gen_block_04acd56  (621 lines total, ~190 lines CSS)
    ai_gen_block_70d7c08  (573 lines total, ~165 lines CSS)
    lb-newsletter-popup   (~190 lines CSS)
    lb-size-guide         (~164 lines CSS)
    lb-fit-check          (~156 lines CSS)
    lb-lookbook           (~136 lines CSS)
    lb-ticker             (~37 lines CSS)
    lb-press              (~55 lines CSS)
    lb-testimonials       (~80 lines CSS)

  RETAIN INLINE (intentional, performance-motivated):
    theme-styles-variables.liquid    (687 lines — CSS variables, critical path)
    chaos_unleashed_lcp_preload.liquid (407 lines — LCP guard, must be early)
    lb-bebas-neue.liquid              (107 lines — font preload, critical path)
    color-schemes.liquid              (98 lines — per-scheme variables)

DoD:
  [ ] All 24 templates visually verified at 375px, 768px, 1440px
  [ ] No FOUC on any template
  [ ] CLS <= 0.1 on homepage, PDP, collection (O-4)
  [ ] LCP not regressed vs §7.1 baseline
  [ ] Per-page CSS <= 180 KB (O-1)
Rollback: revert commit; bundles are additive so the original file can be restored
without template changes.

---
### WS-5 — JavaScript delivery
Priority P2 · Effort 2.5h · Risk: LOW

5a. Gate scrolling.js (12.1 KB), currently one of 8 unguarded modulepreloads.
    Consumers: slideshow, zoom-dialog, collection-links.
    Follow the existing pattern at snippets/scripts.liquid:46-50 (collection/search
    pattern). Gate to templates where slideshow or collection-links sections exist.
    Saves 12 KB preload on blog, article, page, cart, 404, password templates.

    RETAIN GLOBAL: focus.js (3.3 KB, header-drawer, present on all pages)
                   events.js (9.3 KB, imported by 26+ modules)
                   utilities.js, component.js, section-renderer.js,
                   section-hydration.js, morph.js — all used by the
                   section hydration system present on every page.

5b. Extend idle deferral.
    Current state: lb-idle-defer.liquid defers exactly four scripts
    (lb-deferred-media-autoplay, lb-video-optimizer, lb-cart-animations,
    lb-image-optimizer) with no template conditionals.

    Add to idle deferral: header-menu.js (12.8 KB)
                          localization.js (17.1 KB)
                          predictive-search.js (13.4 KB)
    ~43 KB of parse cost moved outside the TBT measurement window.

    These are all interaction-driven features (hover menu, country selector,
    search input) — never needed for first paint. Idle load is safe.

DoD:
  [ ] Mega menu, country selector and predictive search all function correctly
  [ ] Verified on cold cache and on throttled Fast 3G
  [ ] TBT improved or unchanged (O-3)
Rollback: single revert commit.

---
### WS-6 — SEO and structured data
Priority P2 · Effort 5h · Risk: LOW

  STATUS: 6a, 6b, 6c, 6d, 6e, and image srcset/sizes fixes are DONE on edits-here-2
  (commits 8b4fed7, d4488ed, 162ee34). Remaining: 6g (Consent Mode v2) and
  verification of the shipped items.

  6a  ✅ Wire lb-subcollection-nav — was referenced ZERO times. Done.
  6b  ✅ Add BreadcrumbList to collection template. Done.
  6c  ✅ Add ItemList schema to homepage (emitted from product-list section). Done.
  6d  ✅ Render lb-internal-links on the homepage. Done.
  6e  Alt text: explicit alt on all meaningful images; empty alt for decorative
      video posters and the logo. Done.
  6f  Image srcset/sizes/fetchpriority:
        ✅ Added missing sizes to _blog-post-image.liquid
        ✅ Capped uncapped image_url (was serving full-res originals)
        ✅ Demoted header logo fetchpriority from high to low
        Remaining: no further systemic issues found in audit. 145 fetchpriority
        references total, but 116 are fetchpriority="low" on JS modules and
        are correct. 29 fetchpriority="high" references, all targeting
        legitimate LCP candidates (hero first slide, PDP main image,
        first blog card, featured collection image).
  6g  Google Consent Mode v2 — HOLD pending business decision. Required for
      EU/UK compliance and GA4 data quality. Does not apply if the store
      serves only North America. Confirm with marketing/legal.

DoD:
  [ ] Rich Results Test passes for Product, Collection, Article, Organization, ItemList
  [ ] Search Console shows no new structured-data errors after 7 days
  [ ] Lighthouse Accessibility >= 95 on homepage, PDP, collection
  [ ] Consent Mode v2 decision documented (implement or explicitly waive)
Rollback: single revert commit per item; 6a-6f are independent.

---
### WS-7 — Liquid maintainability
Priority P4 · Effort 7h · Risk: MEDIUM

  7a  hero.liquid (1039 lines, 10 for-loops) — extract hero-image.liquid and
      hero-video.liquid; consolidate srcset width loops. Target ~600 lines.
      CONSTRAINT: this file is already performance-tuned (preload metadata,
      1x1 GIF poster, fetchpriority poster for LCP, video_tag renditions,
      chaos_unleashed_hero_video_defer integration). Refactor for readability
      only. Loading behaviour must not change.
      DoD addition: rendered HTML output is byte-identical before and after.

  7b  header-drawer.liquid (761 lines) — loads on every page.
      ✅ ALREADY DONE: the 5x link-featured-image and 4x resource-card renders
      are already gated behind block_settings.menu_style conditionals.
      Current store config uses menu_style: "text" (verified in header-group.json),
      so these code paths never execute. No refactor needed.
      If the store ever switches to collection_images/featured_collections/
      featured_products style, the imagery renders will activate automatically
      via the existing conditionals.

  7c  section.liquid (1765 lines) — DEFERRED. Only justified under sustained
      active development on the theme.

DoD:
  [ ] Rendered HTML output is byte-identical before and after (WS-7a)
  [ ] Hero LCP unchanged vs baseline
  [ ] Header drawer mobile open/close, search, navigation all function correctly
Rollback: single revert commit.

---
### WS-8 — Performance features
Priority P4 · Effort 3h · Risk: LOW

  8a  Critical CSS — ALREADY IMPLEMENTED. critical-css.liquid (~31 KB) is wired
      via stylesheets.liquid. Do not expand blindly — that bloats the critical
      path. Revisit only after WS-4 and only if measurement shows specific
      above-the-fold rules are missing from the inline block.

  8b  Speculation rules — lb-speculation-rules ships prerender/prefetch at
      moderate/conservative.
      ✅ DONE (2026-08-16): Raised collection URL eagerness from conservative
      → moderate. Collection nav links are high-intent hover targets; majority
      of hover→click is on nav items. CDN-heavy, minimal waste.
      PDP → PDP already moderate. Catch-all pages remain conservative.
      Excluded: PDP → cart/checkout (these are form POSTs, not link navigations;
      Speculation Rules API doesn't prerender form submissions).
  8c  Fonts — DONE by existing v23 setup (2026-05-01):
      - Only 1 font preload (body regular 400)
      - font-display: swap on all faces
      - Bebas Neue inlined separately (well-documented, display font)
      - JetBrains Mono is a system font stack (no download)
      No further optimization needed.

DoD:
  [ ] No increase in wasted prefetch bandwidth (measure in DevTools Network)
  [ ] No FOIT on any template
  [ ] Collection -> PDP navigation feels instant on hover
Rollback: single revert commit.

---

## 7. MEASUREMENT PROTOCOL

7.1 Baseline capture (precondition P-3)
    URLs:
      - Homepage (index)
      - One PDP (default product template, e.g. the featured product)
      - One collection (marque-legendaire-luxury-streetwear — 2+ pages of products)
    Tool: PageSpeed Insights, mobile profile
    Method: three runs per URL, record the MEDIAN. Single runs are unreliable.
    Record: LCP, TBT, CLS, total CSS bytes, total JS bytes, request count,
    LCP element, LCP candidate count.

7.2 Per-release measurement
    Same URLs, same method, after CDN cache has settled (allow 10 minutes).
    A release that regresses any of O-2/O-3/O-4 is rolled back, not tuned forward.

7.3 Measurement integrity
    - Never compare a cold-cache run against a warm one
    - Never measure while another workstream is mid-deploy (G-4)
    - Theme-editor and preview contexts set __lbSuppressAnalytics; measure the
      real storefront, not a preview URL, for analytics verification

---

## 8. RISK REGISTER

  ID   Risk                                  L    I     Mitigation
  R-1  Silent sync failure ships partial     HIGH HIGH  P-2; per-file byte
       release; results misattributed                   verification every deploy
  R-2  CSS misclassification breaks a        MED  HIGH  Full 24-template QA at
       low-traffic template unnoticed                   3 breakpoints (WS-4 DoD)
  R-3  Web Pixel dead; all measurement       MED  HIGH  P-1 blocking precondition
       and ad attribution invalid
  R-4  Section retirement breaks a page a    MED  MED   WS-2 atomicity; preset
       merchant later inserts                           removal precedes JS deletion
  R-5  Template deletion orphans products    LOW  HIGH  WS-3 sequencing; written
                                                        assignment record
  R-6  Razorpay deletion breaks a live       LOW  HIGH  Explicit written
       payment path                                     confirmation before deletion
  R-7  Refactor changes hero loading         MED  MED   WS-7a output-diff DoD
       behaviour and regresses LCP
  R-8  Accessibility regression -> ADA       LOW  HIGH  G-5; Lighthouse a11y gate
       exposure

---

## 9. RELEASE SEQUENCE AND DEPENDENCIES

  P-1, P-2, P-3  (blocking, parallel)
        |
        +-- WS-1 (independent, ship first — builds deployment confidence)
        |
        +-- WS-6a-f (image + SEO fixes — already done; verify first)
        |
        +-- WS-4a --> WS-4b --> WS-8a (re-evaluate only)
        |
        +-- WS-6g (decision point, independent of all CSS/JS work)
        |
        +-- WS-3 (independent; admin-coordinated)
        |
        +-- WS-5a --> WS-5b
        |
        +-- WS-2 (after WS-1 proves the deploy path works reliably)
        |
        +-- WS-7a/b, WS-8b/c (last; maintainability and tuning)

  Freeze windows — no production deploys:
    - Black Friday / Cyber Monday week (Wed before -> Mon after)
    - Any active paid campaign launch week (attribution risk, G-2)
    - Fridays after 12:00 ET (no rollback coverage over the weekend)
    - Major product drops / restocks (revenue path risk, G-1)

---

## 10. QA MATRIX (per release)

  Template          375px  768px  1440px  Notes
  Homepage           R      R       R     Hero video, LCP element, collection pills
  Product (default)  R      R       R     ATC, variant picker, gallery (G-1)
  Product (lb-page)  R      -       R     Distinct layout; 1 product to verify
  Collection         R      R       R     Filters, pagination, subcollection nav
  Cart               R      -       R     Quantity, remove, checkout CTA (G-1)
  Search             R      -       R     Predictive search, results grid
  Blog / Article     R      -       R     Thin templates; verify schema
  Page / Contact     R      -       R     Form submission
  404 / Password     R      -       R     Password page after WS-1
  List collections   R      -       R

  R = required.  Every release also re-verifies G-1 (add-to-cart -> checkout) and
  G-2 (one tracked event reaching GA4 DebugView).

---

## 11. SIGN-OFF

  Workstream  Implemented by  Reviewed by  QA by  Deployed  Verified (§5)  Date
  WS-1
  WS-2
  WS-3
  WS-4a
  WS-4b
  WS-5a
  WS-5b
  WS-6a-f
  WS-6g
  WS-7a
  WS-7b
  WS-8b
  WS-8c

---

## 12. RIGHT-SIZING NOTE

This document is scaled for a live revenue-generating store with a documented
deployment-reliability problem. For a lower-stakes build, the defensible
reductions are: collapse §11 into PR approvals, reduce the §10 matrix to the top
four templates, and drop the soak periods. Do NOT reduce §3 guardrails, §4
preconditions, or the §5 post-deploy byte verification — those exist because of
failures already observed on this repo, not as generic process.

---

## A. FACTUAL BASIS

Numbers in this document were verified against the codebase at commit
37b91bf (edits-here-2 baseline) by static audit. Key verifications:

  Metric                          Value        Source
  CSS files                       16           ls assets/*.css
  Total CSS                       478 KB       du -ck assets/*.css
  chaos-theme-styles.css          265 KB       ls
  base.aio.min.css                104 KB       ls
  JS files                        85           ls assets/*.js
  Total JS                        699 KB       du -ck assets/*.js
  Liquid templates (total)        24           ls templates/
  Product JSON templates          6            ls templates/product.*.json
  Sections (liquid files)         51           ls sections/*.liquid
  Snippets                        147          ls snippets/
  Blocks                          99           ls blocks/
  Section presets available       40           grep presets sections/*.liquid
  Truly dead sections             4            static reference analysis
  Unreferenced snippets           4            static reference analysis
  Inline CSS files                40           grep style/stylesheet/style tags
  Modulepreloads (global + cond.) 12           grep modulepreload scripts.liquid
  Hero lines                      1039         wc -l sections/hero.liquid
  Header-drawer lines             761          wc -l snippets/header-drawer.liquid
  section.liquid lines            1765         wc -l sections/section.liquid
  critical-css.liquid size        ~31 KB       ls
  Schema-emit templates           5            seo-schema.liquid case statement
