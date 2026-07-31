# The Legends Theme

Custom Shopify theme for Legendary Branding.

This repository is the source of truth for a fully custom Shopify theme designed for speed, maintainability, strong merchandising control, and safe AI-assisted development. The theme is intended to be built with Claude Code, versioned in GitHub, and connected to Shopify through the GitHub theme integration.

## Overview

The Legends Theme is not a lightly modified stock theme. It is a custom-built Shopify storefront architecture focused on:

- Fast storefront performance.
- Clean Liquid structure.
- Online Store 2.0 flexibility.
- Merchant-editable content through sections, blocks, settings, and metafields.
- Safe GitHub-based collaboration.
- Controlled AI-assisted development through Claude Code.

The goal is to create a production-grade storefront system that can scale with new campaigns, product storytelling, merchandising changes, and technical improvements without turning the codebase into a maintenance problem.

## Core goals

- Build a performant custom Shopify theme from scratch.
- Keep Liquid modular, explicit, and easy to debug.
- Reduce technical debt by avoiding deprecated and fragile patterns.
- Make more content editable without developer intervention.
- Keep the repo safe for AI-assisted development and GitHub sync.
- Support long-term growth for Legendary Branding.

## Theme principles

### 1. Performance-first
The theme should prioritize HTML and CSS for core storefront behavior and keep JavaScript intentional and lightweight. Shopify’s guidance emphasizes performance as a core theme quality standard, especially across home, product, and collection pages. [cite:40][cite:56]

### 2. Modern Liquid patterns
The codebase should prefer clear snippet boundaries, explicit parameter passing, and maintainable section architecture. Deprecated or fragile patterns should be avoided in favor of current Shopify theme practices. [cite:39][cite:42][cite:53]

### 3. Merchant-safe customization
Content that should be editable by the brand team should live in:
- section settings
- blocks
- metafields
- dynamic sources

This reduces hardcoded content and makes the theme easier to operate without touching code. Shopify supports dynamic theme editing through the GitHub-connected workflow and metafield-based content models. [cite:61][cite:68]

### 4. GitHub as source of truth
All durable theme development should flow through GitHub. Shopify’s GitHub integration keeps connected themes synchronized with repository branches and also commits Shopify admin changes back to the branch. [cite:68][cite:69]

### 5. Safe AI-assisted development
Claude Code can accelerate theme development, but it should operate inside a guarded engineering workflow:
- feature branches only
- pull request review
- branch protection
- secret scanning and push protection
- no direct production edits by AI

GitHub push protection can block supported secrets before they reach the repository. [cite:67]

## Build philosophy

This repo is designed around the idea that a custom theme should behave like a product system, not a pile of edited templates.

That means:

- reusable snippets instead of duplicated markup
- clear separation between layout, templates, sections, snippets, and assets
- predictable schema-driven customization
- controlled use of JavaScript
- performance-aware Liquid
- cleaner upgrade and merge paths over time

## What we are intentionally avoiding

The theme should avoid the common flaws that make Shopify themes difficult to scale:

- deprecated Liquid patterns such as `include` where `render` is the modern pattern [cite:53]
- oversized or nested loops that hurt render performance [cite:40][cite:42]
- hardcoded content that should live in settings or metafields [cite:42][cite:61]
- raw output without proper filters for prices, JSON, images, and structured data [cite:39][cite:42]
- global asset loading for page-specific features [cite:40][cite:69]
- fragile inline scripts duplicated across sections [cite:68][cite:69]

## Repository role

This repository should hold the Shopify-compatible theme code that can safely connect to a GitHub branch in Shopify.

Shopify’s GitHub integration only supports branches that match the default Shopify theme folder structure. If build tooling is introduced later, the deploy branch must still remain Shopify-compatible. [cite:68][cite:69]

## Suggested structure

```text
layout/
templates/
sections/
snippets/
assets/
config/
locales/
```

If a source/build pipeline is introduced later, use a deploy-branch strategy or another Shopify-compatible structure for connected branches. Shopify recommends separating source and compiled code using branches when a build pipeline is involved. [cite:69]

## Development workflow

### Standard workflow

1. Claude Code generates or refactors theme code locally or in a controlled branch.
2. Changes are committed to a feature branch.
3. A human reviews the diff before merge.
4. Pull requests must pass required checks.
5. Approved changes merge into the connected branch.
6. Shopify syncs the connected branch to the theme.
7. Any edits made in the Shopify admin are committed back to the branch by Shopify.

This workflow matches Shopify’s documented GitHub-connected theme behavior and creates a safer path for AI-assisted theme development. [cite:68][cite:69]

### Branch strategy

Recommended branch model:

- `main` — stable production-ready theme branch.
- `dev` — integration branch for reviewed in-progress work.
- `feat/*` — feature branches for new sections, templates, merchandising systems, or UX improvements.
- `hotfix/*` — urgent production fixes.
- `campaign/*` — temporary branches for launches, drops, seasonal edits, or promotional storefront variants.

Shopify recommends planning branch organization and publishing strategy early, and using non-main branches for temporary event or campaign themes when needed. [cite:69]

## Shopify connection model

The intended Shopify setup is:

- one unpublished theme connected to a development branch for testing
- one stable published theme connected to the approved production branch
- optional campaign themes connected to short-lived campaign branches

Important behavior:
- Shopify pushes admin edits back into GitHub automatically for connected themes.
- Connected branches and the Shopify theme are kept synchronized.
- If conflicts occur, GitHub resolution or reset-to-last-commit may be required. [cite:68]

## Safety rules

### Secrets
No secrets, tokens, credentials, or private keys should ever be committed to this repository.

GitHub push protection is designed to block supported hardcoded credentials before they are pushed. [cite:67]

### Branch protection
The production branch should require:
- pull requests
- review approval
- restricted direct pushes
- required checks where applicable

### AI guardrails
Claude Code should:
- work only in feature branches
- never push directly to the production branch
- never store secrets in code
- avoid mass refactors without review
- keep changes scoped and auditable

### Shopify schema changes
If `config/settings_schema.json` changes introduce new settings referenced by templates or sections, push schema changes first, then push dependent files. This avoids GitHub-to-Shopify sync validation issues documented by developers using connected themes. [cite:108]

## Theme architecture goals

The long-term architecture should support:

- modular PDP structure
- collection and merchandising flexibility
- modular homepage sections
- metafield-driven product storytelling
- campaign landing pages
- editorial and brand storytelling sections
- configurable CTAs, badges, banners, and content blocks
- maintainable CSS and JavaScript organization

## Coding standards

### Liquid
- Prefer `render` over deprecated `include` patterns. [cite:53]
- Keep snippets explicit and parameter-driven.
- Limit heavy loops and nested iteration. [cite:40][cite:42]
- Use proper filters for money, JSON, and image output. [cite:39]
- Avoid hardcoded data that belongs in settings or metafields. [cite:42][cite:61]

### Theme customization
- Use sections and blocks wherever merchant control is valuable.
- Use metafields for structured product and collection content.
- Keep content models predictable and scalable. [cite:61]

### Assets
- Load only what is needed for the current page or feature when possible.
- Minimize JavaScript required for basic storefront functionality. [cite:40]
- Keep the connected branch Shopify-compatible. [cite:68][cite:69]

## Collaboration notes

Because Shopify admin edits can write commits back to the connected branch, contributors should avoid making overlapping edits in multiple places at the same time. Shopify documents that conflicts can occur when files are edited concurrently between GitHub and the Shopify admin. [cite:68]

Recommended discipline:
- make structural/theme-code changes in GitHub
- keep merchant edits intentional and traceable
- review the commit history regularly
- use reset/re-sync procedures carefully when a branch and theme drift apart [cite:68]

## Current direction

This repository is being positioned as the foundation for:

- a custom Shopify storefront for Legendary Branding
- a GitHub-controlled development workflow
- Claude Code-assisted implementation
- stronger performance and cleaner Liquid architecture
- a safer long-term foundation than ad hoc theme edits

## Future enhancements

Potential future phases may include:

- deeper metafield systems
- advanced product storytelling modules
- campaign branch workflow for launches
- stricter CI checks for theme quality
- Theme Check integration
- performance auditing and optimization passes
- structured docs for section inventory and content models

## Contributor expectations

Anyone working in this repo should:

- respect branch strategy
- avoid direct production edits
- keep commits scoped and readable
- preserve merchant-safe customization patterns
- protect repo security
- document significant architecture changes in this README or supporting docs

## Summary

The Legends Theme is a custom Shopify theme repo built to balance speed, flexibility, maintainability, and safe AI-assisted development. GitHub is the control layer, Shopify is the deployment target, and Claude Code is used as a development accelerator inside a protected workflow. [cite:67][cite:68][cite:69]
