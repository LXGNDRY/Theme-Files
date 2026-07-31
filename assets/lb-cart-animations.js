/**
 * lb-cart-animations.js  v3.1
 * Fly-to-cart product image animation + cart icon feedback.
 *
 * On ATC click:
 *   1. Grab variant image from data-product-variant-media (kept live via variant:change listener)
 *   2. Create a ghost <img> clone at the button's position
 *   3. Arc it to the cart icon with 3D transform mid-flight
 *   4. On arrival: impact shake + bubble entrance / count flip
 *
 * On cart:update / cart:add events:
 *   5. Bubble entrance, count flip, idle heartbeat pulse
 *
 * v3 change: variant image attribute stays current when customer switches variant
 */
(function () {
  'use strict';

  /* ─── Classes ───────────────────────────────────────────────────── */
  const CLS = {
    iconBounce  : 'lb-cart-icon-bounce',
    iconImpact  : 'lb-cart-icon-impact',
    bubbleEnter : 'lb-bubble-enter',
    countOut    : 'lb-count-flip-out',
    countIn     : 'lb-count-flip-in',
    idlePulse   : 'lb-cart-idle-pulse',
    ghost       : 'lb-fly-ghost',
    ghostAnim   : 'lb-fly-ghost--flying',
  };

  const IDLE_DELAY_MS  = 3200;
  const FLIGHT_TIME_MS = 820;   // must match CSS animation duration

  let idleTimer  = null;
  let lastCount  = 0;
  let flyLocked  = false;       // prevent double-fire within same flight

  /* ─── DOM helpers ───────────────────────────────────────────────── */
  const getCartLink  = () => document.getElementById('cart-icon-bubble');
  const getBubble    = (l) => l && l.querySelector('.cart-count-bubble');
  const getCountSpan = (l) => l && l.querySelector('.cart-count-bubble span');

  function removeOnEnd(el, cls) {
    if (!el) return;
    const fn = () => { el.classList.remove(cls); el.removeEventListener('animationend', fn); };
    el.addEventListener('animationend', fn);
  }

  /* ─── Animation restart without forced reflow ────────────────────── */
  // void el.offsetWidth forces a synchronous reflow (layout recalc) to
  // reset CSS animations — costs 10-50ms on low-end mobile and blocks
  // the main thread. Double-rAF defers the class add to the next two
  // paint frames, achieving the same animation restart with zero reflow.
  function restartAnimation(el, removeCls, addCls, onDone) {
    if (!el) return;
    el.classList.remove(removeCls);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add(addCls);
        if (onDone) onDone();
      });
    });
  }

  /* ─── Idle heartbeat ────────────────────────────────────────────── */
  function scheduleIdlePulse(cartLink, count) {
    clearTimeout(idleTimer);
    if (count <= 0) return;
    idleTimer = setTimeout(() => {
      if (!cartLink) return;
      cartLink.classList.add(CLS.idlePulse);
      removeOnEnd(cartLink, CLS.idlePulse);
    }, IDLE_DELAY_MS);
  }

  /* ─── Cart icon reaction (runs after flight lands) ──────────────── */
  function animateCartUpdate(itemCount, fromFlight) {
    const cartLink = getCartLink();
    if (!cartLink) return;

    const bubble   = getBubble(cartLink);
    const countEl  = getCountSpan(cartLink);
    const prev     = lastCount;
    lastCount      = itemCount;

    if (fromFlight) {
      restartAnimation(cartLink, CLS.iconImpact, CLS.iconImpact, function () {
        removeOnEnd(cartLink, CLS.iconImpact);
      });
    } else if (itemCount > prev) {
      restartAnimation(cartLink, CLS.iconBounce, CLS.iconBounce, function () {
        removeOnEnd(cartLink, CLS.iconBounce);
      });
    }

    if (prev === 0 && itemCount > 0 && bubble) {
      restartAnimation(bubble, CLS.bubbleEnter, CLS.bubbleEnter, function () {
        removeOnEnd(bubble, CLS.bubbleEnter);
      });
    }

    if (prev > 0 && itemCount > 0 && itemCount !== prev && countEl) {
      countEl.classList.add(CLS.countOut);
      setTimeout(() => {
        if (!countEl) return;
        countEl.classList.remove(CLS.countOut);
        countEl.classList.add(CLS.countIn);
        removeOnEnd(countEl, CLS.countIn);
      }, 120);
    }

    scheduleIdlePulse(cartLink, itemCount);
  }

  /* ─── Fly-to-cart ───────────────────────────────────────────────── */
  function launchFlyAnimation(atcComponent, btnEl) {
    if (flyLocked) return;

    const cartLink = getCartLink();
    if (!cartLink) return;

    const imgSrc = atcComponent.dataset.productVariantMedia || '';

    const btnRect  = btnEl.getBoundingClientRect();
    const cartRect = cartLink.getBoundingClientRect();

    const startX = btnRect.left + btnRect.width  / 2;
    const startY = btnRect.top  + btnRect.height / 2;
    const endX   = cartRect.left + cartRect.width  / 2;
    const endY   = cartRect.top  + cartRect.height / 2;

    const ghost = document.createElement('div');
    ghost.className = CLS.ghost;
    ghost.setAttribute('aria-hidden', 'true');

    if (imgSrc) {
      const img = document.createElement('img');
      img.src   = imgSrc;
      img.alt   = '';
      img.width = 80;
      img.height = 80;
      ghost.appendChild(img);
    } else {
      ghost.classList.add('lb-fly-ghost--no-img');
    }

    Object.assign(ghost.style, {
      position : 'fixed',
      left     : startX - 40 + 'px',
      top      : startY - 40 + 'px',
      zIndex   : '99999',
      pointerEvents: 'none',
    });

    const dx = endX - startX;
    const dy = endY - startY;
    ghost.style.setProperty('--lb-fly-dx', dx + 'px');
    ghost.style.setProperty('--lb-fly-dy', dy + 'px');

    const arcY = Math.min(-80, dy * -0.4);
    ghost.style.setProperty('--lb-fly-arc-y', arcY + 'px');

    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.classList.add(CLS.ghostAnim);
      });
    });

    flyLocked = true;

    ghost.addEventListener('animationend', () => {
      ghost.remove();
      flyLocked = false;
      const currentSpan = getCountSpan(getCartLink());
      const currentCount = currentSpan ? (parseInt(currentSpan.textContent, 10) || 0) : lastCount;
      animateCartUpdate(currentCount + 1, true);
    }, { once: true });
  }

  /* ─── ATC click intercept ───────────────────────────────────────── */
  function attachAtcListeners() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button[name="add"]');
      if (!btn) return;
      const component = btn.closest('add-to-cart-component');
      if (!component) return;
      launchFlyAnimation(component, btn);
    }, true);
  }

  /* ─── Variant image sync ────────────────────────────────────────── */
  // Keep data-product-variant-media current whenever the customer
  // switches variant so the fly animation always shows the right image.
  function attachVariantSyncListener() {
    document.addEventListener('variant:change', (e) => {
      const variant = e.detail?.variant;
      if (!variant) return;

      // Find all add-to-cart-component elements on the page
      document.querySelectorAll('add-to-cart-component').forEach((component) => {
        // Only update the component that belongs to this product
        const form = component.closest('form[action="/cart/add"]') ||
                     component.closest('[data-product-id]');

        const productId = form && (form.dataset.productId || form.querySelector('[name="id"]')?.value);

        // Match by variant's product_id if available, otherwise update all (single-product pages)
        if (productId && variant.product_id && String(variant.product_id) !== String(productId)) return;

        const mediaSrc = variant.featured_image
          ? variant.featured_image.src
          : (variant.featured_media?.preview_image?.src || '');

        if (mediaSrc) {
          // Shopify image URLs — append width param for consistency with server-rendered version
          const sized = mediaSrc.includes('?')
            ? mediaSrc.replace(/width=\d+/, 'width=100')
            : mediaSrc + '?width=100';
          component.dataset.productVariantMedia = sized;
        }
      });
    });
  }

  /* ─── Cart event listeners (bubble sync) ───────────────────────── */
  function attachCartListeners() {
    document.addEventListener('cart:update', (e) => {
      const count = e.detail?.data?.itemCount ?? e.detail?.itemCount ?? lastCount;
      if (!flyLocked) animateCartUpdate(count, false);
      else lastCount = count;
    });

    document.addEventListener('cart:add', (e) => {
      const count = e.detail?.resource?.item_count ?? (lastCount + 1);
      if (!flyLocked) animateCartUpdate(count, false);
      else lastCount = count;
    });
  }

  /* ─── Init ──────────────────────────────────────────────────────── */
  function init() {
    const cartLink = getCartLink();
    if (cartLink) {
      const span = getCountSpan(cartLink);
      if (span) {
        const parsed = parseInt(span.textContent, 10);
        if (!isNaN(parsed)) lastCount = parsed;
      }
    }
    attachAtcListeners();
    attachVariantSyncListener();
    attachCartListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
