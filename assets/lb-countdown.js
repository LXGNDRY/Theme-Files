(function () {
  var els = document.querySelectorAll('[data-lb-countdown]');
  if (!els.length) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick(el) {
    var target = new Date(el.dataset.lbCountdown).getTime();
    var now = Date.now();
    var diff = target - now;

    if (diff <= 0) {
      var msg = el.dataset.lbCountdownEnd;
      if (msg) el.closest('.lb-countdown').innerHTML = '<p class="lb-countdown__ended">' + msg + '</p>';
      else el.style.display = 'none';
      return;
    }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    var dEl = el.querySelector('[data-cd-d]');
    var hEl = el.querySelector('[data-cd-h]');
    var mEl = el.querySelector('[data-cd-m]');
    var sEl = el.querySelector('[data-cd-s]');

    if (dEl) dEl.textContent = pad(d);
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);

    setTimeout(function () { tick(el); }, 1000);
  }

  els.forEach(tick);
})();
