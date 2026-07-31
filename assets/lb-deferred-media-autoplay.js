/**
 * lb-deferred-media-autoplay.js  —  v1.0
 * Legendary Branding | Deferred Media Viewport Autoplay
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Problem solved:
 *   video.liquid previously rendered {{ media_content }} twice when
 *   video_autoplay == true: once inside <template> (inert, correct) and once
 *   directly in the DOM. That second bare render placed <video><source src>
 *   tags outside the deferred-media content gate, letting Chrome's preload
 *   scanner fetch full video bytes (4.5 MB+) before any JS could intervene —
 *   collapsing LCP and TBT on every PDP load.
 *
 * What this does:
 *   Observes every <deferred-media autoplay> element with IntersectionObserver.
 *   When the element is 200px from the viewport, calls loadContent() on the
 *   DeferredMedia web component — the same method the play button calls.
 *   The video bytes only start downloading at that point. The poster image
 *   (already in the DOM) displays correctly until then.
 *
 *   Elements above the fold at page-load time are handled immediately via
 *   a synchronous check so hero/featured videos still play without delay.
 *
 * Safety:
 *   - Only targets deferred-media[autoplay] — does not affect click-to-play
 *     videos or product media gallery videos
 *   - Guards against calling loadContent() before the custom element is
 *     defined (unlikely but safe)
 *   - No-ops gracefully if IntersectionObserver is unavailable (loads
 *     content immediately as fallback)
 *   - Handles Shopify theme editor section:load events for dynamic sections
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  var ROOT_MARGIN = '0px 0px 200px 0px';

  function triggerAutoplay(el) {
    // Guard: ensure custom element is upgraded before calling instance methods
    if (typeof el.loadContent !== 'function') {
      // Not yet upgraded — wait for definition then retry once
      customElements.whenDefined('deferred-media').then(function () {
        if (typeof el.loadContent === 'function' && !el.getAttribute('data-media-loaded')) {
          el.loadContent(false);
        }
      });
      return;
    }
    // Already loaded (e.g. section re-render) — skip
    if (el.getAttribute('data-media-loaded')) return;
    el.loadContent(false);
  }

  function observeAutoplays(root) {
    var elements = (root || document).querySelectorAll('deferred-media[autoplay]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: trigger all immediately
      elements.forEach(triggerAutoplay);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        triggerAutoplay(entry.target);
      });
    }, { rootMargin: ROOT_MARGIN });

    elements.forEach(function (el) {
      // If already in the viewport at load time, trigger immediately
      // (handles above-fold hero/featured videos)
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight + 200;
      if (inView) {
        triggerAutoplay(el);
      } else {
        observer.observe(el);
      }
    });
  }

  // Initial run — after DOMContentLoaded so deferred-media elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { observeAutoplays(); });
  } else {
    observeAutoplays();
  }

  // Shopify theme editor: re-observe when sections are added dynamically
  document.addEventListener('shopify:section:load', function (event) {
    observeAutoplays(event.target);
  });

})();
