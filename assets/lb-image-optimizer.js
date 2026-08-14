/**
 * lb-image-optimizer.js
 * Legendary Branding — Dynamic Image Quality Optimizer
 *
 * Handles images that Liquid cannot reach:
 *   - Cart drawer images
 *   - Quick-add modal images
 *   - Dynamically injected product cards
 *   - Any img tag loaded via JS after page render
 *
 * Strategy:
 *   1. On DOM ready, upgrade all existing <img> tags that use Shopify CDN
 *      to request the highest-quality srcset available.
 *   2. Use MutationObserver to catch dynamically added images.
 *   3. Apply image-rendering: high-quality CSS hint via JS.
 *   4. Respect prefers-reduced-data media query — skip upgrades on
 *      metered connections.
 */

(function () {
  'use strict';

  // Matches both Shopify's legacy CDN (cdn.shopify.com) and storefront-domain CDN
  // path (/cdn/shop/files/) used since ~2022 for product/preview images served from
  // the store's own domain (e.g. legendary-branding.com/cdn/shop/files/...).
  const CDN_PATTERN = /(?:cdn\.shopify\.com|\/cdn\/shop\/files\/)/;
  const SIZE_PARAM  = /(_\d+x(\d+)?)(\.(jpg|jpeg|png|webp|gif))/i;
  const SRCSET_WIDTHS = [375, 750, 1100, 1500, 1920, 2048];

  // Respect users on metered/slow connections
  const saveData = navigator.connection && (
    navigator.connection.saveData ||
    navigator.connection.effectiveType === '2g' ||
    navigator.connection.effectiveType === 'slow-2g'
  );

  if (saveData) return;

  /**
   * Rewrites a Shopify CDN image URL to a specific width and requests WebP.
   * Removes any existing size suffix and injects the new one.
   * Appends &format=webp — Shopify CDN converts on the fly, ~30-50% smaller.
   */
  function rewriteUrl(url, width) {
    if (!url || !CDN_PATTERN.test(url)) return url;
    // Remove existing size param e.g. _480x, _480x640
    let clean = url.replace(SIZE_PARAM, '$3');
    // Insert new width before extension
    clean = clean.replace(/(\.(jpg|jpeg|png|webp|gif))(\?|$)/i, `_${width}x$1$3`);
    // Request WebP — Shopify CDN converts any JPEG/PNG to WebP on the fly
    if (!clean.includes('format=webp')) {
      clean += (clean.includes('?') ? '&' : '?') + 'format=webp';
    }
    return clean;
  }

  /**
   * Builds a full srcset string for a Shopify CDN image URL.
   */
  function buildSrcset(url) {
    return SRCSET_WIDTHS
      .map(w => `${rewriteUrl(url, w)} ${w}w`)
      .join(', ');
  }

  /**
   * Upgrades a single <img> element if it uses the Shopify CDN.
   * Skips images already upgraded (marked with data-lb-optimized).
   */
  function upgradeImage(img) {
    if (img.dataset.lbOptimized) return;
    const src = img.getAttribute('src') || '';
    if (!CDN_PATTERN.test(src)) return;

    // Build srcset if not already present or only has one entry
    const existingSrcset = img.getAttribute('srcset') || '';
    if (!existingSrcset || existingSrcset.split(',').length < 3) {
      img.setAttribute('srcset', buildSrcset(src));
    }

    // Upgrade sizes if missing — use data-sizes from calling context if provided,
    // otherwise infer from closest grid container column count.
    if (!img.getAttribute('sizes')) {
      const dataSizes = img.closest('[data-img-sizes]');
      if (dataSizes) {
        img.setAttribute('sizes', dataSizes.dataset.imgSizes);
      } else {
        // Infer from grid: count sibling cards to approximate column width
        const card = img.closest('.product-card, .collection-card, .featured-blog-posts-card');
        const grid = card && card.parentElement;
        const cols = grid ? Math.round(grid.getBoundingClientRect().width / (card.getBoundingClientRect().width || 1)) : 1;
        if (cols >= 4) {
          img.setAttribute('sizes', '(min-width: 1200px) 25vw, (min-width: 750px) 50vw, 100vw');
        } else if (cols >= 2) {
          img.setAttribute('sizes', '(min-width: 750px) 50vw, 100vw');
        } else {
          img.setAttribute('sizes', '100vw');
        }
      }
    }

    // Ensure decoding is async for non-LCP images
    if (!img.getAttribute('fetchpriority') || img.getAttribute('fetchpriority') === 'auto') {
      img.setAttribute('decoding', 'async');
    }

    // CSS rendering hint
    img.style.imageRendering = 'high-quality';

    img.dataset.lbOptimized = '1';
  }

  /**
   * Runs upgradeImage on all <img> elements in a given root.
   */
  function upgradeAll(root) {
    root.querySelectorAll('img').forEach(upgradeImage);
  }

  /**
   * MutationObserver — watches for dynamically added nodes
   * (cart drawer, quick-add, recommendations, etc.)
   */
  function observeDynamicImages() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') {
            upgradeImage(node);
          } else {
            upgradeAll(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Init — upgrade existing images then watch for new ones.
   */
  function init() {
    upgradeAll(document);
    observeDynamicImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
