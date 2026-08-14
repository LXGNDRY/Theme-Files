(function () {
  'use strict';

  var cfg = (function () {
    var el = document.getElementById('lb-pdp-config');
    try { return el ? JSON.parse(el.textContent) : {}; } catch (e) { return {}; }
  }());

  var _moneyFormat = cfg.moneyFormat || '{{amount}}';
  var _atcLabel    = cfg.atcLabel    || 'Add to Cart';

  /* ── DOM refs ── */
  var gallery      = document.getElementById('lb-pdp-gallery');
  var mainImg      = document.getElementById('lb-pdp-main-img');
  var thumbs       = gallery ? gallery.querySelectorAll('.lb-pdp__thumb') : [];
  var optBtns      = document.querySelectorAll('.lb-pdp__opt-btn');
  var variantInput = document.getElementById('lb-pdp-variant-id');
  var atcBtn       = document.getElementById('lb-pdp-atc');
  var stickyBar    = document.getElementById('lb-pdp-sticky');
  var stickyBtn    = document.getElementById('lb-pdp-sticky-btn');
  var stickyPrice  = document.getElementById('lb-pdp-sticky-price');
  var priceEl      = document.getElementById('lb-pdp-price');
  var compareEl    = document.getElementById('lb-pdp-compare');
  var lowStock     = document.getElementById('lb-pdp-low-stock');
  var stockCount   = document.getElementById('lb-pdp-stock-count');
  var sgOverlay    = document.getElementById('lb-pdp-sg-overlay');
  var sgTrigger    = document.getElementById('lb-pdp-sg-trigger');
  var sgClose      = document.getElementById('lb-pdp-sg-close');
  var qtyInput     = document.getElementById('lb-pdp-qty');
  var qtyMinus     = document.getElementById('lb-pdp-qty-minus');
  var qtyPlus      = document.getElementById('lb-pdp-qty-plus');

  /* ── Parse variants ── */
  var variantsJson = document.getElementById('lb-pdp-variants-json');
  var variants     = variantsJson ? JSON.parse(variantsJson.textContent) : [];

  /* ── Current selections (0-indexed per option) ── */
  var selections = {};
  optBtns.forEach(function (btn) {
    var idx = btn.dataset.optionIndex;
    if (btn.classList.contains('is-selected')) {
      selections[idx] = btn.dataset.optionValue;
    }
  });

  /* ── Gallery ── */
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (mainImg) {
        mainImg.src    = thumb.dataset.src;
        mainImg.srcset = thumb.dataset.srcset || '';
        mainImg.alt    = thumb.dataset.alt || '';
      }
      thumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  });

  /* ── Variant matching ── */
  function findVariant() {
    return variants.find(function (v) {
      return Object.keys(selections).every(function (idx) {
        return v['option' + (parseInt(idx, 10) + 1)] === selections[idx];
      });
    });
  }

  function formatMoney(cents) {
    if (window.Shopify && window.Shopify.formatMoney) {
      return window.Shopify.formatMoney(cents, _moneyFormat);
    }
    var amount = (cents / 100).toFixed(2);
    return _moneyFormat.replace(/\{\{?\s*amount\s*\}?\}/, amount);
  }

  function updateUI(variant) {
    if (!variant) return;

    /* price */
    if (priceEl) {
      priceEl.textContent = formatMoney(variant.price);
      priceEl.classList.toggle('lb-pdp__price--sale', variant.compare_at_price > variant.price);
    }
    if (compareEl) {
      if (variant.compare_at_price > variant.price) {
        compareEl.style.display = '';
        compareEl.textContent   = formatMoney(variant.compare_at_price);
      } else {
        compareEl.style.display = 'none';
      }
    }

    /* variant id + ATC state */
    if (variantInput) variantInput.value = variant.id;
    if (atcBtn) {
      atcBtn.disabled    = !variant.available;
      atcBtn.textContent = variant.available ? (atcBtn.dataset.label || _atcLabel) : 'Sold Out';
    }
    if (stickyBtn) {
      stickyBtn.disabled    = !variant.available;
      stickyBtn.textContent = variant.available ? _atcLabel : 'Sold Out';
    }

    /* sticky price */
    if (stickyPrice) stickyPrice.textContent = formatMoney(variant.price);

    /* low-stock */
    if (lowStock && stockCount) {
      var qty  = variant.inventory_quantity;
      var show = variant.inventory_management === 'shopify' && qty >= 1 && qty <= 9;
      lowStock.classList.toggle('is-visible', show);
      if (show) stockCount.textContent = qty;
    }

    /* gallery image — switch to variant image if different */
    if (variant.featured_image && mainImg) {
      var imgData = variant.featured_image;
      function sizeSrc(base, w) {
        var stripped = base.replace(/_(pico|icon|thumb|small|compact|medium|large|grande|original|\d+x\d*|\d*x\d+)(\.[a-z]+)(\?|$)/i, '$2$3');
        return stripped.replace(/(\.[a-z]+)(\?|$)/i, '_' + w + 'x$1$2');
      }
      var baseSrc = imgData.src.split('?')[0];
      var newSrc    = sizeSrc(baseSrc, '1000') + '&format=webp';
      var newSrcset = [600, 900, 1200].map(function (w) {
        return sizeSrc(baseSrc, w) + '&format=webp ' + w + 'w';
      }).join(', ');

      if (mainImg.getAttribute('src') !== newSrc) {
        mainImg.src    = newSrc;
        mainImg.srcset = newSrcset;
        mainImg.alt    = imgData.alt || '';
      }
      thumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumbs.forEach(function (t) {
        var thumbBase = t.dataset.src ? t.dataset.src.split('?')[0].split('/').pop().split('_')[0] : '';
        if (thumbBase && baseSrc.indexOf(thumbBase) !== -1) {
          t.classList.add('is-active');
        }
      });
    }

    /* option value label update */
    document.querySelectorAll('[id^="lb-pdp-opt-val-"]').forEach(function (el) {
      var pos = el.id.replace('lb-pdp-opt-val-', '');
      var sel = selections[String(parseInt(pos, 10) - 1)];
      if (sel) el.textContent = '— ' + sel;
    });

    /* fire event for other scripts */
    document.dispatchEvent(new CustomEvent('variant:update', { detail: { variant: variant } }));
  }

  /* ── Option button clicks ── */
  optBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-unavailable')) return;
      var idx = btn.dataset.optionIndex;
      var val = btn.dataset.optionValue;
      selections[idx] = val;

      document.querySelectorAll('.lb-pdp__opt-btn[data-option-index="' + idx + '"]').forEach(function (b) {
        b.classList.toggle('is-selected', b.dataset.optionValue === val);
      });

      var v = findVariant();
      if (v) updateUI(v);
    });
  });

  /* ── Quantity controls ── */
  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
  }
  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = v + 1;
    });
  }

  /* ── Sticky ATC bar — show when ATC scrolls out of view ── */
  if (stickyBar && atcBtn) {
    var obs = new IntersectionObserver(function (entries) {
      stickyBar.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    obs.observe(atcBtn);

    stickyBtn.addEventListener('click', function () {
      atcBtn.click();
    });
  }

  /* ── Size guide modal with full focus trap ── */
  var _sgLastFocus = null;
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function openModal() {
    _sgLastFocus = document.activeElement;
    sgOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var firstFocusable = sgOverlay.querySelector(FOCUSABLE);
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal() {
    if (!sgOverlay) return;
    sgOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (_sgLastFocus) { _sgLastFocus.focus(); _sgLastFocus = null; }
  }

  function trapFocus(e) {
    if (!sgOverlay.classList.contains('is-open')) return;
    var focusable = Array.from(sgOverlay.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return !el.closest('[hidden]') && el.offsetParent !== null;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === 'Escape') closeModal();
  }

  if (sgTrigger && sgOverlay) {
    sgTrigger.addEventListener('click', openModal);
  }
  if (sgClose && sgOverlay) {
    sgClose.addEventListener('click', closeModal);
  }
  if (sgOverlay) {
    sgOverlay.addEventListener('click', function (e) {
      if (e.target === sgOverlay) closeModal();
    });
    sgOverlay.addEventListener('keydown', trapFocus);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ── Reviews count scroll — click + keyboard (WCAG 2.1.1) ── */
  var reviewsCount = document.querySelector('.lb-pdp__reviews-count');
  if (reviewsCount) {
    function scrollToReviews() {
      var target = document.querySelector('.jdgm-widget, .shopify-section-product-reviews, #shopify-product-reviews, #lb-judgeme-widget');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    reviewsCount.addEventListener('click', scrollToReviews);
    reviewsCount.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToReviews(); }
    });
  }

}());
