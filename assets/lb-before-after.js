(function () {
  document.querySelectorAll('.lb-ba').forEach(function (el) {
    var handle = el.querySelector('.lb-ba__handle');
    var after = el.querySelector('.lb-ba__after');
    var dragging = false;

    function setPos(x) {
      var rect = el.getBoundingClientRect();
      var pct = Math.min(Math.max((x - rect.left) / rect.width, 0.02), 0.98);
      var val = (pct * 100).toFixed(2) + '%';
      after.style.clipPath = 'inset(0 0 0 ' + val + ')';
      handle.style.left = val;
    }

    handle.addEventListener('mousedown', function (e) { dragging = true; e.preventDefault(); });
    document.addEventListener('mouseup', function () { dragging = false; });
    document.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX); });

    handle.addEventListener('touchstart', function (e) { dragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchend', function () { dragging = false; });
    document.addEventListener('touchmove', function (e) {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });

    handle.addEventListener('keydown', function (e) {
      var rect = el.getBoundingClientRect();
      var current = parseFloat(after.style.clipPath.match(/[\d.]+(?=%)/) || 50);
      if (e.key === 'ArrowLeft') setPos(rect.left + (current - 5) / 100 * rect.width);
      if (e.key === 'ArrowRight') setPos(rect.left + (current + 5) / 100 * rect.width);
    });

    setPos(el.getBoundingClientRect().left + el.getBoundingClientRect().width * 0.5);
  });
})();
