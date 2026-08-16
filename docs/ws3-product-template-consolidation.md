# WS-3: Product Template Consolidation — Analysis

**Status:** Research complete. Admin action required before implementation.
**Target end-state:** 2 product templates (from 6).

---

## Baseline

| Template | Sections | Size | Distinct from product.json |
|---|---|---|---|
| product.json | 9 | 67 KB | baseline (brand-story, fit-check, product-info, product-list, recommendations, section) |
| product.clear-pvc-travel-bag.json | 9 | 76 KB | removes brand-story + fit-check |
| product.featured-productss.json | 9 | 77 KB | removes brand-story + fit-check (typo'd name) |
| product.clear-pvc-stadium-travel.json | 12 | 77 KB | removes brand-story + fit-check, adds slideshow |
| product.legendary-d20-speaker.json | 12 | 83 KB | removes brand-story + fit-check |
| product.legendary-x20-speaker.json | 12 | 78 KB | removes brand-story + fit-check, adds slideshow |
| product.lb-product-page.json | 3 | 2.4 KB | completely different layout (lb-product-page section) |

**Key insight:** 5 of 6 variants differ from product.json by at most 2 section additions/removals. All can be consolidated using section visibility toggles.

---

## Consolidation Plan

### Step 1: Add visibility toggles to product.json

Add section-level "Enable" checkboxes (or reuse existing show/hide) for:
- `lb-brand-story` section (currently always present)
- `lb-fit-check` section (currently always present)
- `slideshow` section (currently absent — add one instance, hidden by default)

### Step 2: Reassign products (ADMIN ACTION)

In Shopify admin:
1. Products > Filter by template > Export list (write a record)
2. For each product on a consolidatable template:
   - Switch template to `product.json`
   - Adjust section visibility settings to match the original

### Step 3: Verify and delete

- Confirm zero products assigned to deleted templates
- Delete empty templates from the theme
- Visual regression check on one product per original template

---

## Templates to Delete (after Step 2)

1. `product.clear-pvc-travel-bag.json` — simple (remove 2 sections)
2. `product.featured-productss.json` — simple (remove 2 sections), likely typo/orphaned
3. `product.clear-pvc-stadium-travel.json` — medium (remove 2, add slideshow)
4. `product.legendary-d20-speaker.json` — simple (remove 2 sections)
5. `product.legendary-x20-speaker.json` — medium (remove 2, add slideshow)

## Template to Retain

- `product.lb-product-page.json` — structurally distinct, used for the D20/X20 speaker custom layout

---

## Risk and Rollback

**Rollback requires manual admin work** (reassigning products back to their original templates). This is slow. Treat WS-3 as a one-way change once templates are deleted.

**Risk mitigation:**
- Keep a written record of all pre-change product-to-template assignments
- Delete templates one at a time, verifying each batch
- If a template is deleted but products still reference it, Shopify falls back to the default product.json template automatically (no crash, just different layout)

---

## Implementation Sequence

```
[ ] 1. Add visibility toggles to product.json (brand-story, fit-check, slideshow)
[ ] 2. Export product template assignment record from admin
[ ] 3. Reassign products from simplest templates first (clear-pvc-travel-bag, featured-productss, legendary-d20-speaker)
[ ] 4. Delete the 3 simple templates
[ ] 5. Reassign products from slideshow templates (stadium-travel, x20-speaker)
[ ] 6. Delete the 2 slideshow templates
[ ] 7. Final visual QA on all 6 original product layouts
```
