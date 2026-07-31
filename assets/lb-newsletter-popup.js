(function () {
  var COOKIE = 'lb_nl_dismissed';
  var el = document.getElementById('lb-nl-popup');
  if (!el) return;

  var delay = parseInt(el.dataset.delay || '4000', 10);
  var cookieDays = parseInt(el.dataset.cookieDays || '30', 10);

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
  }

  function open() {
    el.setAttribute('aria-hidden', 'false');
    el.querySelector('.lb-nl-popup__panel').focus();
  }

  if (getCookie(COOKIE)) return;

  var timer = setTimeout(open, delay);

  el.querySelector('.lb-nl-popup__close').addEventListener('click', close);
  el.querySelector('.lb-nl-popup__overlay').addEventListener('click', close);

  el.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

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
