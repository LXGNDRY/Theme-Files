/**
 * lb-image-optimizer.js — dynamic-image safety net
 *
 * Server-rendered theme images are already authored through Shopify Liquid
 * image_tag/image_url with responsive srcset, sizes, dimensions, loading and
 * fetch-priority decisions. Rewriting those images after first paint can cause
 * duplicate downloads, forced layout reads and cache fragmentation.
 *
 * This module therefore handles only IMG nodes inserted after initial render
 * (cart drawer updates, quick-add content, asynchronously rendered cards, etc.).
 * It never rescans or mutates the initial document image set.
 */

(() => {
  'use strict';

  const SHOPIFY_IMAGE = /(?:cdn\.shopify\.com|\/cdn\/shop\/files\/)/i;
  const WIDTHS = [320, 480, 640, 828, 1080, 1440];

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && (
    connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'
  ));

  function withWidth(rawUrl, width) {
    try {
      const url = new URL(rawUrl, window.location.href);
      if (!SHOPIFY_IMAGE.test(url.href)) return rawUrl;
      url.searchParams.set('width', String(width));
      return url.href;
    } catch (_) {
      return rawUrl;
    }
  }

  function buildSrcset(src) {
    return WIDTHS.map(width => `${withWidth(src, width)} ${width}w`).join(', ');
  }

  function enhanceDynamicImage(img) {
    if (!(img instanceof HTMLImageElement) || img.dataset.lbDynamicOptimized === '1') return;

    const src = img.getAttribute('src') || '';
    if (!SHOPIFY_IMAGE.test(src)) return;

    img.dataset.lbDynamicOptimized = '1';

    // Preserve responsive decisions emitted by Shopify/Liquid or the component
    // that inserted the image. Only fill genuinely missing metadata.
    if (!img.hasAttribute('decoding')) img.decoding = 'async';

    if (!img.getAttribute('sizes')) {
      const owner = img.closest('[data-img-sizes]');
      img.setAttribute('sizes', owner?.dataset.imgSizes || '100vw');
    }

    // Save-data users should not be opted into a broader responsive candidate
    // set after insertion. The browser keeps the source supplied by the feature.
    if (!saveData && !img.getAttribute('srcset')) {
      img.setAttribute('srcset', buildSrcset(src));
    }
  }

  function inspectAddedNode(node) {
    if (!(node instanceof Element)) return;
    if (node.matches('img')) enhanceDynamicImage(node);
    node.querySelectorAll?.('img').forEach(enhanceDynamicImage);
  }

  function start() {
    if (!document.body || !('MutationObserver' in window)) return;

    const observer = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(inspectAddedNode);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
