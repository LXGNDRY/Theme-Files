(() => {
  const sticky = document.getElementById('lb-cart-sticky-cta');

  if (!sticky) return;

  const total = sticky.querySelector('[data-cart-sticky-total]');
  let observer;

  const getSummary = () => document.querySelector('.cart-page__summary');
  const getMainTotal = () => document.querySelector('.cart-page__summary [data-cart-subtotal]');

  const syncTotal = () => {
    const mainTotal = getMainTotal();

    if (total && mainTotal) {
      total.textContent = mainTotal.textContent.trim();
    }
  };

  const setVisibility = () => {
    observer?.disconnect();

    const summary = getSummary();

    if (!summary) {
      sticky.classList.remove('lb-cart-sticky-cta--visible');
      sticky.setAttribute('aria-hidden', 'true');
      return;
    }

    observer = new IntersectionObserver((entries) => {
      const summaryVisible = entries[0].isIntersecting;
      sticky.classList.toggle('lb-cart-sticky-cta--visible', !summaryVisible);
      sticky.setAttribute('aria-hidden', summaryVisible ? 'true' : 'false');
    }, { threshold: 0 });

    observer.observe(summary);
  };

  const refresh = () => {
    requestAnimationFrame(() => {
      syncTotal();
      setVisibility();
    });
  };

  document.addEventListener('cart:update', refresh);
  refresh();
})();