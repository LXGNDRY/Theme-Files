/*
 * Legendary Branding — localization country-list hydration
 *
 * Large Shopify Markets stores can expose 200+ countries. Rendering every
 * country into each closed localization surface makes those nodes participate
 * in the initial DOM/style tree even though customers have not opened the
 * selector yet.
 *
 * The Liquid snippet keeps the exhaustive list inside an inert <template>.
 * This helper materializes that template on the first interaction/focus inside
 * the localization component, then asks the theme Component base to refresh
 * its declarative refs synchronously before filtering/keyboard handlers run.
 */

(() => {
  'use strict';

  if (window.__lbLocalizationHydratorInstalled) return;
  window.__lbLocalizationHydratorInstalled = true;

  const COMPONENT_SELECTOR = 'localization-form-component';
  const TEMPLATE_SELECTOR = 'template[data-lb-country-list-template]';

  /**
   * @param {Element | null} component
   */
  function hydrate(component) {
    if (!(component instanceof HTMLElement)) return false;
    if (component.dataset.lbCountriesHydrated === 'true') return false;

    const template = component.querySelector(TEMPLATE_SELECTOR);
    if (!(template instanceof HTMLTemplateElement)) {
      component.dataset.lbCountriesHydrated = 'true';
      return false;
    }

    const fragment = template.content.cloneNode(true);
    template.replaceWith(fragment);
    component.dataset.lbCountriesHydrated = 'true';

    if (typeof component.updatedCallback === 'function') {
      component.updatedCallback();
    }

    return true;
  }

  /**
   * @param {Event} event
   */
  function hydrateFromEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    hydrate(target.closest(COMPONENT_SELECTOR));
  }

  document.addEventListener('focusin', hydrateFromEvent, true);
  document.addEventListener('pointerdown', hydrateFromEvent, { capture: true, passive: true });
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        hydrateFromEvent(event);
      }
    },
    true
  );
})();
