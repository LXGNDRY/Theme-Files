/*
 * lb-gsm-selector.js — Legendary Branding GSM fabric-weight selector
 * Progressive enhancement: tabs switch which weight panel is shown.
 * Works per section instance; no dependencies.
 */
(function () {
  function initGsm(root) {
    var tabs = root.querySelectorAll('[data-gsm-tab]');
    var panels = root.querySelectorAll('[data-gsm-panel]');
    if (tabs.length === 0 || panels.length === 0) {
      return;
    }

    function activate(idx) {
      var i;
      for (i = 0; i < tabs.length; i++) {
        var tabOn = String(i) === String(idx);
        tabs[i].classList.toggle('is-active', tabOn);
        tabs[i].setAttribute('aria-selected', tabOn ? 'true' : 'false');
      }
      for (i = 0; i < panels.length; i++) {
        var show = String(i) === String(idx);
        panels[i].classList.toggle('is-active', show);
        if (show) {
          panels[i].removeAttribute('hidden');
        } else {
          panels[i].setAttribute('hidden', '');
        }
      }
    }

    root.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-gsm-tab]');
      if (tab) {
        activate(tab.getAttribute('data-gsm-tab'));
      }
    });
  }

  function boot() {
    var roots = document.querySelectorAll('[data-lb-gsm]');
    for (var i = 0; i < roots.length; i++) {
      initGsm(roots[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
