# CLAUDE.md

This repository is a custom Shopify theme for The Legends / Legendary Branding.

## Purpose

Claude should use this file as the operating guide for theme work in this repo. The goal is to produce clean, maintainable, performant Shopify Liquid code with a safe GitHub workflow.

## Core priorities

- Keep the theme fast.
- Keep Liquid modular and explicit.
- Prefer merchant-editable content over hardcoded values.
- Avoid deprecated or fragile Liquid patterns.
- Keep changes small, reviewable, and safe to merge.
- Preserve Shopify compatibility in connected branches.

## Tech stack

- Shopify Online Store 2.0.
- Liquid.
- HTML, CSS, and JavaScript.
- GitHub for version control.
- Claude Code for assisted development.
- Shopify GitHub integration for sync.

## Repository expectations

- This repo should remain Shopify-theme compatible.
- Connected branches must keep the standard Shopify theme folder structure.
- Do not introduce build output that breaks Shopify theme sync unless a separate deploy branch strategy is in place.
- Treat GitHub as the source of truth and Shopify as the publishing target.

## Branch workflow — REQUIRED

**All edits to this repo must be made on `make-edits-here-branch` only.**
**Changes reach `main` exclusively through pull requests from `make-edits-here-branch`.**
This is the only and standard process for this repository — no exceptions.

- Never commit directly to `main`.
- Never push to any branch other than `make-edits-here-branch`.
- Always open a PR from `make-edits-here-branch` → `main` when changes are ready.

## Safe workflow for Claude

- Work on `make-edits-here-branch` only (see Branch workflow above).
- Make small, scoped changes.
- Do not push directly to main.
- Do not add secrets, tokens, or credentials.
- Ask before deleting or heavily refactoring files.
- When changing schema, verify all dependent sections and templates.
- Prefer readable diffs over large rewrites.

## Liquid flaws to watch for

### 1. Deprecated or fragile patterns
Problem:
- Using outdated tags or patterns that are harder to maintain.
- Relying on parent scope too much.

Fix:
- Prefer `{% render %}` over older include-style patterns.
- Pass variables explicitly into snippets.
- Keep snippets independent and predictable.

### 2. Hardcoded content
Problem:
- Product copy, banners, CTA text, or settings are hardcoded in Liquid.
- Merchants need a code change for simple edits.

Fix:
- Move editable content into section settings, blocks, and metafields.
- Use dynamic sources where appropriate.
- Keep product and collection content model-driven.

### 3. Heavy Liquid logic
Problem:
- Too many nested loops.
- Repeated filters on large collections.
- Complex conditional trees inside templates.
- Doing expensive work repeatedly inside loops.

Fix:
- Simplify logic.
- Cache values in variables.
- Reduce nested iteration.
- Move repeated or expensive calculations to metafields, settings, or client-side code when appropriate.

### 4. Weak output handling
Problem:
- Raw output for money, JSON, images, or rich content.
- Missing filters.
- Unsafe assumptions about object existence.

Fix:
- Use the correct filters for each output type.
- Check whether objects exist before referencing them.
- Prefer structured, predictable output.
- Keep image output responsive and accessible.

### 5. Poor architecture boundaries
Problem:
- Layout, templates, sections, snippets, and assets are mixed together.
- One file does too much.
- JavaScript is embedded everywhere.

Fix:
- Keep clear separation of concerns.
- Use sections for merchant-controlled page composition.
- Use snippets for reusable UI pieces.
- Keep page-specific JS localized.
- Avoid duplicated inline scripts.

## Liquid debugging rules

When Liquid breaks, debug in this order:

1. Check for syntax errors.
2. Check whether the object exists before referencing it.
3. Isolate the smallest failing block.
4. Remove nested complexity.
5. Verify the output filter being used.
6. Confirm the data is actually present in Shopify.
7. Test one expression at a time.

## Common theme fixes

- Replace hardcoded values with settings or metafields.
- Replace repeated inline blocks with reusable snippets.
- Replace monolithic templates with smaller sections.
- Replace nested loops with simpler data models.
- Replace slow or redundant logic with cached variables.
- Replace vague output with explicit filters and validation.
- Replace duplicate JS with reusable assets.

## Performance rules

- Prefer HTML and CSS for basic storefront behavior.
- Keep JavaScript lightweight and intentional.
- Load scripts only where needed.
- Avoid unnecessary libraries.
- Avoid deep nesting in Liquid.
- Reduce repeated metafield access in hot templates.
- Keep collection and product pages lean.

## Shopify-specific patterns

- Use sections and blocks for merchant-editable layouts.
- Use metafields for structured product and collection data.
- Use dynamic sources when they reduce manual content work.
- Keep schema files aligned with section usage.
- Validate connected-theme changes carefully, especially if settings schema changes.

## GitHub and security rules

- Never commit secrets.
- Use branch protection.
- Use pull requests for production changes.
- Use secret scanning and push protection.
- Treat Shopify-admin edits as part of the branch history.
- Keep commits focused and easy to review.

## Claude output standards

Before writing code, Claude should:
- inspect the existing structure.
- preserve conventions already in the repo.
- make the smallest useful change.
- avoid unnecessary abstractions.
- keep theme edits Shopify-safe.

Before finishing, Claude should:
- check for broken Liquid references.
- check for duplicated logic.
- check for missing accessibility attributes.
- check that the theme still fits Shopify’s expected structure.
- summarize what changed in plain language.

## Anti-patterns to avoid

- Hardcoded merchant content.
- Giant Liquid files.
- Deeply nested loops.
- Unnecessary JavaScript.
- Deprecated Liquid patterns.
- Silent assumptions about object availability.
- Copy-paste sections that should be reusable.
- Destructive refactors without a migration path.

## Working style

- Prefer clarity over cleverness.
- Prefer stable theme architecture over fast hacks.
- Prefer explicit data flow over hidden dependencies.
- Prefer reusable components over duplicated templates.
- Prefer maintainability over novelty.

## Final rule

If a change makes the theme harder to understand, harder to edit, or harder to deploy safely, simplify it.
