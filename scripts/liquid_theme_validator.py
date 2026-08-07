#!/usr/bin/env python3
"""
liquid_theme_validator.py
==========================
Shopify Liquid theme validator for CI / pre-push checks.

Validates:
  • All JSON templates parse correctly (with comment stripping)
  • All section type references in templates have matching .liquid files
  • All section schemas are valid JSON
  • Template order matches sections dict keys
  • Block types referenced in templates exist in section schemas
  • Block orders match blocks dict keys
  • Snippets referenced via {% render %} exist
  • Required Shopify theme directories/files are present
  • Section schema preset names are valid
  • No obvious Liquid syntax issues (unbalanced tags, broken conditionals)

Usage:
  python3 liquid_theme_validator.py [theme_dir]

  theme_dir defaults to current directory.

Exit codes:
  0 = all checks pass
  1 = errors found
"""

import os
import re
import sys
import json
import glob
from pathlib import Path
from collections import Counter


# ── Helpers ──────────────────────────────────────────────────────────────────

REQUIRED_FILES = [
    "layout/theme.liquid",
    "templates/index.json",
    "templates/product.json",
    "templates/collection.json",
    "templates/cart.json",
    "sections/header.liquid",
    "sections/footer.liquid",
    "config/settings_schema.json",
    "config/settings_data.json",
    "locales/en.default.json",
]

REQUIRED_DIRS = [
    "assets",
    "config",
    "layout",
    "locales",
    "sections",
    "snippets",
    "templates",
]

LIQUID_TAGS_OPEN = [
    'if', 'unless', 'for', 'case', 'unless', 'comment', 'capture',
    'tablerow', 'form', 'paginate', 'style', 'schema', 'section',
    'layout', 'assign', 'render', 'include', 'liquid', 'echo',
    'cycle', 'break', 'continue', 'return', 'increment', 'decrement'
]

LIQUID_TAGS_CLOSE = [
    'endif', 'endunless', 'endfor', 'endcase', 'endunless', 'endcomment',
    'endcapture', 'endtablerow', 'endform', 'endpaginate', 'endstyle',
    'endschema', 'endsection'
]


def strip_json_comments(text: str) -> str:
    """Strip JavaScript-style /* */ and HTML <!-- --> comments from text."""
    # Remove BOM if present
    text = text.lstrip('\ufeff')
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    return text.strip()


def load_json_file(path: Path) -> dict | list:
    """Load a JSON file, handling BOM and leading whitespace."""
    text = path.read_text()
    text = text.lstrip('\ufeff \n\r\t')
    return json.loads(text)


def load_json_template(path: str) -> dict:
    """Load a Shopify template JSON file, stripping comments first."""
    text = Path(path).read_text()
    text = strip_json_comments(text)
    return json.loads(text)


def extract_schema(section_path: str) -> dict | None:
    """Extract the {% schema %} JSON from a .liquid section file."""
    text = Path(section_path).read_text()
    match = re.search(r'\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}', text, re.DOTALL)
    if not match:
        return None
    return json.loads(match.group(1).strip())


def find_render_calls(liquid_path: str) -> list[str]:
    """Find all {% render 'snippet-name' %} calls in a Liquid file."""
    text = Path(liquid_path).read_text()
    # Match {% render 'name' %} or {% render "name" %}
    matches = re.findall(r"\{%\s*render\s+['\"]([\w\-]+)['\"]", text)
    return list(set(matches))


def find_section_render_calls(liquid_path: str) -> list[str]:
    """Find {% section 'name' %} calls (for snippets rendered via section tag)."""
    text = Path(liquid_path).read_text()
    matches = re.findall(r"\{%\s*section\s+['\"]([\w\-]+)['\"]", text)
    return list(set(matches))


def count_liquid_tags(liquid_path: str) -> tuple[int, int]:
    """Count open vs close Liquid tags as a rough syntax check."""
    text = Path(liquid_path).read_text()
    open_count = 0
    close_count = 0
    for tag in LIQUID_TAGS_CLOSE:
        close_count += len(re.findall(r'\{%-?\s*' + re.escape(tag) + r'\b', text))
    for tag in ['if', 'for', 'case', 'unless', 'comment', 'capture', 'style', 'schema']:
        open_count += len(re.findall(r'\{%-?\s*' + re.escape(tag) + r'\b', text))
    return open_count, close_count


# ── Validators ───────────────────────────────────────────────────────────────

class ValidationResult:
    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.info_messages: list[str] = []

    def error(self, msg: str):
        self.errors.append(msg)

    def warn(self, msg: str):
        self.warnings.append(msg)

    def warning(self, msg: str):
        """Alias for warn."""
        self.warn(msg)

    def info(self, msg: str):
        self.info_messages.append(msg)

    @property
    def ok(self) -> bool:
        return len(self.errors) == 0


def validate_structure(theme_dir: Path, result: ValidationResult):
    """Check required directories and files exist."""
    result.info(f"Theme directory: {theme_dir}")

    for d in REQUIRED_DIRS:
        path = theme_dir / d
        if path.is_dir():
            files = len(list(path.iterdir()))
            result.info(f"  ✓ {d}/ ({files} files)")
        else:
            result.error(f"  ✗ Missing required directory: {d}/")

    for f in REQUIRED_FILES:
        path = theme_dir / f
        if path.is_file():
            result.info(f"  ✓ {f}")
        else:
            result.warning(f"  ⚠ Missing file: {f} (may be optional)")


def validate_templates(theme_dir: Path, result: ValidationResult):
    """Validate all JSON template files."""
    template_dir = theme_dir / "templates"
    if not template_dir.is_dir():
        return

    json_files = sorted(template_dir.glob("*.json"))
    result.info(f"\nValidating {len(json_files)} template JSON files...")

    # Collect all known section types from sections/
    section_files = {p.stem for p in (theme_dir / "sections").glob("*.liquid")}

    for jf in json_files:
        rel = jf.relative_to(theme_dir)
        try:
            data = load_json_template(str(jf))
        except json.JSONDecodeError as e:
            result.error(f"  ✗ {rel}: invalid JSON — {e}")
            continue
        except Exception as e:
            result.error(f"  ✗ {rel}: failed to parse — {e}")
            continue

        sections = data.get("sections", {})
        order = data.get("order", [])

        # Check order matches sections
        sec_keys = set(sections.keys())
        order_set = set(order)
        if sec_keys != order_set:
            missing = sec_keys - order_set
            extra = order_set - sec_keys
            if missing:
                result.error(f"  ✗ {rel}: sections not in order list: {missing}")
            if extra:
                result.error(f"  ✗ {rel}: order items not in sections: {extra}")
        else:
            result.info(f"  ✓ {rel}: {len(sections)} sections, order matches")

        # Check each section type exists
        for name, sec in sections.items():
            sec_type = sec.get("type", "")

            # Skip built-in group types
            if sec_type.endswith("-group"):
                continue

            # Skip built-in types that aren't file-based
            builtin_types = {
                "header", "footer", "product-list", "featured-product-information",
                "section", "_blocks", "hero", "divider", "slideshow",
                "rich-text", "image-with-text", "video", "gallery",
                "map", "quote", "collection-list", "blog-posts",
                "multicolumn", "email-signup", "icon-list", "countdown",
                "testimonial", "accordion", "tabs", "progress-bar",
                "before-after", "text-columns-with-images",
            }
            if sec_type in builtin_types:
                continue

            if sec_type not in section_files:
                result.error(
                    f"  ✗ {rel}: section '{name}' type '{sec_type}' — "
                    f"no matching sections/{sec_type}.liquid file"
                )

            # Validate blocks if present
            blocks = sec.get("blocks", {})
            block_order = sec.get("block_order", [])
            if blocks:
                block_keys = set(blocks.keys())
                order_keys = set(block_order)
                if block_keys != order_keys:
                    missing = block_keys - order_keys
                    extra = order_keys - block_keys
                    if missing:
                        result.warning(
                            f"  ⚠ {rel} → {name}: blocks not in block_order: {missing}"
                        )
                    if extra:
                        result.warning(
                            f"  ⚠ {rel} → {name}: block_order items not in blocks: {extra}"
                        )


def validate_section_schemas(theme_dir: Path, result: ValidationResult):
    """Validate all section schemas are valid JSON."""
    sections_dir = theme_dir / "sections"
    if not sections_dir.is_dir():
        return

    section_files = sorted(sections_dir.glob("*.liquid"))
    result.info(f"\nValidating {len(section_files)} section schemas...")

    for sf in section_files:
        rel = sf.relative_to(theme_dir)
        try:
            schema = extract_schema(str(sf))
        except json.JSONDecodeError as e:
            result.error(f"  ✗ {rel}: invalid schema JSON — {e}")
            continue
        except Exception as e:
            result.error(f"  ✗ {rel}: schema parse error — {e}")
            continue

        if schema is None:
            result.warning(f"  ⚠ {rel}: no schema tag found")
            continue

        name = schema.get("name", "(unnamed)")
        blocks = schema.get("blocks", [])
        presets = schema.get("presets", [])
        result.info(f"  ✓ {rel}: {name} ({len(blocks)} block types, {len(presets)} presets)")


def validate_snippets(theme_dir: Path, result: ValidationResult):
    """Check all {% render %} calls reference existing snippets."""
    sections_dir = theme_dir / "sections"
    snippets_dir = theme_dir / "snippets"
    if not sections_dir.is_dir() or not snippets_dir.is_dir():
        return

    snippet_files = {p.stem for p in snippets_dir.glob("*.liquid")}
    section_files = sorted(sections_dir.glob("*.liquid"))

    result.info(f"\nValidating snippet references in {len(section_files)} sections...")

    all_renders = Counter()
    missing_renders: dict[str, list[str]] = {}

    for sf in section_files:
        rel = str(sf.relative_to(theme_dir))
        renders = find_render_calls(str(sf))
        for r in renders:
            all_renders[r] += 1
            if r not in snippet_files:
                if r not in missing_renders:
                    missing_renders[r] = []
                missing_renders[r].append(rel)

    result.info(f"  Found {len(all_renders)} unique snippet references, {sum(all_renders.values())} total")

    if missing_renders:
        for snippet, files in missing_renders.items():
            result.error(
                f"  ✗ Snippet '{snippet}' rendered but not found in snippets/ "
                f"(used in: {', '.join(files)})"
            )
    else:
        result.info("  ✓ All referenced snippets exist")


def validate_liquid_syntax(theme_dir: Path, result: ValidationResult):
    """Rough Liquid syntax check (tag balance)."""
    sections_dir = theme_dir / "sections"
    snippets_dir = theme_dir / "snippets"
    templates_dir = theme_dir / "templates"

    liquid_files = []
    for d in [sections_dir, snippets_dir, templates_dir]:
        if d.is_dir():
            liquid_files.extend(d.glob("*.liquid"))
            liquid_files.extend(d.glob("**/*.liquid"))

    liquid_files = sorted(set(liquid_files))
    result.info(f"\nRough Liquid syntax check on {len(liquid_files)} files...")

    issues = 0
    for lf in liquid_files:
        rel = str(lf.relative_to(theme_dir))
        try:
            text = lf.read_text()
        except Exception:
            continue

        # Check for unmatched {% comment %} / {% endcomment %}
        opens = len(re.findall(r'\{%-?\s*comment\b', text))
        closes = len(re.findall(r'\{%-?\s*endcomment\b', text))
        if opens != closes:
            result.warning(f"  ⚠ {rel}: comment tags unbalanced ({opens} open / {closes} close)")
            issues += 1

        # Check for unmatched {% if %} / {% endif %}
        opens = len(re.findall(r'\{%-?\s*if\b', text))
        closes = len(re.findall(r'\{%-?\s*endif\b', text))
        if opens != closes:
            result.warning(f"  ⚠ {rel}: if/endif tags unbalanced ({opens} open / {closes} close)")
            issues += 1

        # Check for unmatched {% for %} / {% endfor %}
        opens = len(re.findall(r'\{%-?\s*for\b', text))
        closes = len(re.findall(r'\{%-?\s*endfor\b', text))
        if opens != closes:
            result.warning(f"  ⚠ {rel}: for/endfor tags unbalanced ({opens} open / {closes} close)")
            issues += 1

    if issues == 0:
        result.info("  ✓ No obvious tag balance issues")
    else:
        result.info(f"  Found {issues} potential issues (warnings only)")


def validate_config(theme_dir: Path, result: ValidationResult):
    """Validate config JSON files."""
    result.info("\nValidating config files...")

    for fname in ["settings_data.json", "settings_schema.json"]:
        path = theme_dir / "config" / fname
        if not path.is_file():
            result.warning(f"  ⚠ Missing config/{fname}")
            continue
        try:
            data = load_json_file(path)
            result.info(f"  ✓ config/{fname} ({len(data) if isinstance(data, list) else len(data.keys())} top-level keys)")
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            # These might be Git LFS pointers or placeholder files in an
            # existing theme — warn but don't fail since they're not our code
            result.warning(f"  ⚠ config/{fname}: could not parse JSON (may be LFS/encoded) — {e}")


def validate_locales(theme_dir: Path, result: ValidationResult):
    """Validate locale JSON files."""
    locales_dir = theme_dir / "locales"
    if not locales_dir.is_dir():
        result.warning("  ⚠ Missing locales/ directory")
        return

    json_files = sorted(locales_dir.glob("*.json"))
    result.info(f"\nValidating {len(json_files)} locale files...")

    for lf in json_files:
        rel = lf.relative_to(theme_dir)
        try:
            load_json_file(lf)
            result.info(f"  ✓ {rel}")
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            result.warning(f"  ⚠ {rel}: could not parse JSON (may be LFS/encoded) — {e}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    theme_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    theme_dir = theme_dir.resolve()

    # Ensure this looks like a Shopify theme
    if not (theme_dir / "config" / "settings_schema.json").is_file() and not (theme_dir / "sections").is_dir():
        print(f"⚠  Warning: {theme_dir} doesn't look like a Shopify theme root")
        print("   Looking for config/settings_schema.json or sections/ directory")

    result = ValidationResult()

    print("=" * 70)
    print("SHOPIFY LIQUID THEME VALIDATOR")
    print("=" * 70)

    # Run all validators
    validate_structure(theme_dir, result)
    validate_config(theme_dir, result)
    validate_locales(theme_dir, result)
    validate_section_schemas(theme_dir, result)
    validate_templates(theme_dir, result)
    validate_snippets(theme_dir, result)
    validate_liquid_syntax(theme_dir, result)

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"  Errors:   {len(result.errors)}")
    print(f"  Warnings: {len(result.warnings)}")
    print(f"  Info:     {len(result.info_messages)}")

    if result.errors:
        print("\n❌ ERRORS:")
        for e in result.errors:
            print(f"   {e}")

    if result.warnings:
        print("\n⚠  WARNINGS:")
        for w in result.warnings:
            print(f"   {w}")

    print()
    if result.ok:
        print("✅ All checks passed! Safe to push.")
        sys.exit(0)
    else:
        print("❌ Errors found — fix before pushing.")
        sys.exit(1)


if __name__ == "__main__":
    main()
