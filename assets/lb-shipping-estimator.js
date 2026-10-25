/*
 * lb-shipping-estimator.js — Legendary Branding destination transit estimator
 * Select a destination -> show its estimated transit text.
 * Values are merchant-configured in the section. No dependencies.
 */
(function () {
  function initEstimator(root) {
    var select = root.querySelector('[data-ship-select]');
    var out = root.querySelector('[data-ship-out]');
    if (!select || !out) {
      return;
    }

    function update() {
      var opt = select.options[select.selectedIndex];
      var transit = opt ? opt.getAttribute('data-transit') : '';
      out.textContent = transit || '';
    }

    select.addEventListener('change', update);
    update();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-lb-ship]');
    for (var i = 0; i < roots.length; i++) {
      initEstimator(roots[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
