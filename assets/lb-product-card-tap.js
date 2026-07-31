/**
 * lb-product-card-tap.js
 * Reliable single-tap flash + navigation for iOS Safari product cards.
 *
 * Problem: CSS :active is unreliable on iOS — it only fires if the browser
 * decides the touch isn't a scroll attempt, which can be after navigation
 * has already started. The flash is never seen.
 *
 * Solution:
 *   touchstart  → add .lb-tapped immediately (flash visible first frame)
 *   touchend    → remove .lb-tapped after 180ms (flash fades out)
 *   touchmove   → remove .lb-tapped instantly (user is scrolling, cancel flash)
 *   touchcancel → remove .lb-tapped instantly
 *
 * Navigation is handled entirely by the existing product-card.js click
 * handler (navigateToProduct). This script only manages the visual flash
 * class — zero interference with theme JS.
 */

(function () {
  // Only run on touch devices
  if (!('ontouchstart' in window)) return;

  const TAPPED_CLASS = 'lb-tapped';
  const FLASH_DURATION = 180; // ms — matches CSS transition

  document.addEventListener('touchstart', (e) => {
    const card = e.target.closest('product-card');
    if (!card) return;

    // Add flash class immediately on first touch
    card.classList.add(TAPPED_CLASS);

    // Remove on touchend after flash duration
    const cleanup = () => {
      setTimeout(() => card.classList.remove(TAPPED_CLASS), FLASH_DURATION);
      card.removeEventListener('touchend', cleanup);
      card.removeEventListener('touchcancel', cancelImmediate);
      card.removeEventListener('touchmove', cancelImmediate);
    };

    // Remove immediately if user scrolls or cancels
    const cancelImmediate = () => {
      card.classList.remove(TAPPED_CLASS);
      card.removeEventListener('touchend', cleanup);
      card.removeEventListener('touchcancel', cancelImmediate);
      card.removeEventListener('touchmove', cancelImmediate);
    };

    card.addEventListener('touchend', cleanup, { passive: true });
    card.addEventListener('touchcancel', cancelImmediate, { passive: true });
    card.addEventListener('touchmove', cancelImmediate, { passive: true });
  }, { passive: true });
})();
