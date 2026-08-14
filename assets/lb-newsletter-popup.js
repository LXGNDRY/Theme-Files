(function () {
  var COOKIE = 'lb_nl_dismissed';
  var el = document.getElementById('lb-nl-popup');
  if (!el) return;

  var delay = parseInt(el.dataset.delay || '4000', 10);
  var cookieDays = parseInt(el.dataset.cookieDays || '30', 10);
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  var _lastFocus = null;

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m[2] : null;
  }

  function setCookie(name, days) {
    var exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=1; expires=' + exp + '; path=/; SameSite=Lax';
  }

  function close() {
    el.setAttribute('aria-hidden', 'true');
    setCookie(COOKIE, cookieDays);
    if (_lastFocus) { _lastFocus.focus(); _lastFocus = null; }
  }

  function open() {
    _lastFocus = document.activeElement;
    el.setAttribute('aria-hidden', 'false');
    var first = el.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function trapFocus(e) {
    if (el.getAttribute('aria-hidden') === 'true') return;
    var focusable = Array.from(el.querySelectorAll(FOCUSABLE)).filter(function (node) {
      return node.offsetParent !== null;
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
    if (e.key === 'Escape') close();
  }

  if (getCookie(COOKIE)) return;

  var timer = setTimeout(open, delay);

  el.querySelector('.lb-nl-popup__close').addEventListener('click', close);
  el.querySelector('.lb-nl-popup__overlay').addEventListener('click', close);
  el.addEventListener('keydown', trapFocus);

  var form = el.querySelector('.lb-nl-popup__form');
  if (form) {
    form.addEventListener('submit', function () {
      clearTimeout(timer);
      setTimeout(close, 1200);
    });
  }

  document.addEventListener('mouseleave', function onLeave(e) {
    if (e.clientY <= 0 && getCookie(COOKIE) === null) {
      clearTimeout(timer);
      open();
      document.removeEventListener('mouseleave', onLeave);
    }
  });
})();
