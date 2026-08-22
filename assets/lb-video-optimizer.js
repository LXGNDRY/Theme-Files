/**
 * lb-video-optimizer.js — section-video lifecycle controller
 *
 * Hero video fetch timing is owned by chaos_unleashed_hero_video_defer.liquid.
 * This module deliberately does not override hero preload/fetch priority,
 * request 1080p playback, rewrite YouTube/Vimeo quality, or add global GPU
 * compositing hints. Those behaviors increase bandwidth/memory and duplicate
 * work already performed by the hero pipeline.
 *
 * Responsibility here is narrow: keep non-hero HTML5 videos from consuming
 * resources while off-screen, restore lazy sources near the viewport, and
 * pause autoplay media after it leaves the viewport.
 */

(() => {
  'use strict';

  const HERO_SELECTOR = [
    '.hero video',
    '.hero__media video',
    '.banner__media video',
    '.lb-hero video'
  ].join(',');

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = Boolean(connection && (
    connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'
  ));

  const rootMargin = constrained ? '50px 0px' : '200px 0px';
  const observed = new WeakSet();

  function isHero(video) {
    return Boolean(video.closest(HERO_SELECTOR));
  }

  function restoreDeferredSources(video) {
    let changed = false;

    video.querySelectorAll('source[data-src]').forEach(source => {
      if (!source.getAttribute('src')) {
        source.setAttribute('src', source.dataset.src);
        changed = true;
      }
    });

    if (video.dataset.src && !video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      changed = true;
    }

    if (changed) video.load();
  }

  function shouldAutoplay(video) {
    return video.hasAttribute('autoplay') || video.dataset.lbAutoplay === 'true';
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target;

          if (entry.isIntersecting) {
            restoreDeferredSources(video);
            video.setAttribute('preload', constrained ? 'metadata' : 'auto');

            if (shouldAutoplay(video)) {
              video.muted = true;
              video.playsInline = true;
              const play = video.play();
              play?.catch?.(() => {});
            }
          } else if (!video.paused && shouldAutoplay(video)) {
            video.pause();
          }
        });
      }, { rootMargin, threshold: 0 })
    : null;

  function register(video) {
    if (!(video instanceof HTMLVideoElement) || isHero(video) || observed.has(video)) return;
    observed.add(video);

    if (!video.hasAttribute('preload') || video.preload === 'auto') {
      video.preload = 'none';
    }

    if (observer) {
      observer.observe(video);
    } else {
      restoreDeferredSources(video);
    }
  }

  function registerWithin(root) {
    if (root instanceof HTMLVideoElement) register(root);
    root.querySelectorAll?.('video').forEach(register);
  }

  function init() {
    registerWithin(document);
  }

  // Theme-editor support without repeatedly creating observers or re-registering
  // every video in the document.
  document.addEventListener('shopify:section:load', event => registerWithin(event.target));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
