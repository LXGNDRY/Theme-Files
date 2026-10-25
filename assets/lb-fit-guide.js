/*
 * lb-fit-guide.js — Legendary Branding oversized-fit size recommender
 * Usual size + fit preference -> suggested starting size.
 * A starting point, not a body-measurement tool. No dependencies.
 */
(function () {
  var ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  function initFit(root) {
    var sizeButtons = root.querySelectorAll('[data-fit-size]');
    var result = root.querySelector('[data-fit-result]');
    var explain = root.querySelector('[data-fit-explain]');
    if (sizeButtons.length === 0 || !result) {
      return;
    }

    function currentUsual() {
      for (var i = 0; i < sizeButtons.length; i++) {
        if (sizeButtons[i].classList.contains('is-active')) {
          return sizeButtons[i].getAttribute('data-fit-size');
        }
      }
      return 'M';
    }

    function currentFit() {
      var checked = root.querySelector('input[name="lb-fit-pref"]:checked');
      return checked ? checked.value : 'structured';
    }

    function update() {
      var usual = currentUsual();
      var baggy = currentFit() === 'baggy';
      var idx = ORDER.indexOf(usual);
      if (idx < 0) {
        idx = ORDER.indexOf('M');
      }
      var targetIdx = Math.min(idx + (baggy ? 1 : 0), ORDER.length - 1);
      result.textContent = ORDER[targetIdx];
      if (explain) {
        explain.textContent = baggy
          ? 'One size up for extra room and volume. Check availability and the garment measurements for your piece.'
          : 'Your usual size for the intended, structured oversized fit.';
      }
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fit-size]');
      if (!btn) {
        return;
      }
      for (var i = 0; i < sizeButtons.length; i++) {
        var on = sizeButtons[i] === btn;
        sizeButtons[i].classList.toggle('is-active', on);
        sizeButtons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      update();
    });

    root.addEventListener('change', function (e) {
      if (e.target.name === 'lb-fit-pref') {
        update();
      }
    });

    update();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-lb-fit]');
    for (var i = 0; i < roots.length; i++) {
      initFit(roots[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
