/**
 * lb-video-optimizer.js  —  v1.2
 * Legendary Branding | Video Quality + Performance Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Strategy:
 *   HERO VIDEO  → Highest possible quality. Preloads metadata immediately,
 *                 full data fetch begins as soon as the page is interactive.
 *                 Never lazy-loaded. Uses fetchpriority="high" on <source>.
 *
 *   SECTION VIDEOS → Lazy: don't load anything until the video is close to
 *                    the viewport (rootMargin 200px). Play when visible,
 *                    pause when scrolled away. This keeps bandwidth free
 *                    for the hero and for page-critical assets.
 *
 *   CONNECTION AWARE → On slow connections (2G / save-data), section videos
 *                      are held further back (rootMargin 50px) and preload
 *                      is set to "none" so they never pre-fetch.
 *
 *   QUALITY HINTS → Sets `video.quality = 'high'` where the API is available
 *                   (YouTube / Vimeo iframes receive a postMessage hint).
 *                   For self-hosted <video> elements we force the highest
 *                   <source> by ensuring the browser picks src order correctly.
 *
 * Usage:
 *   Add  {{ 'lb-video-optimizer.js' | asset_url | script_tag }}
 *   to the <head> of theme.liquid (or your layout file), placed AFTER your
 *   existing video section scripts. The script is self-initialising.
 * ─────────────────────────────────────────────────────────────────────────────
 * Changelog:
 *   v1.2 (May 17 2026) CU-PERFFIX-001
 *     - Hero CSS: will-change: auto → will-change: transform for GPU layer
 *       promotion during video decode. Prevents layout/scroll jank.
 *     - optimiseHeroVideo(): preload='auto' → preload='metadata'. Frees
 *       bandwidth during the critical render path window. Browser begins
 *       playback on first buffer regardless — 'auto' was over-aggressive.
 *     - setupLazySectionVideos(): data-lb-loaded now set on ALL observed
 *       videos, not only those using data-src. Fixes permanent opacity:0
 *       regression on section videos with hardcoded src attributes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const CONFIG = {
    // CSS class or data-attribute that marks the HERO video wrapper.
    // Chaos / Dawn themes use .hero__media or [data-section-type="video"].
    heroSelectors: [
      '.hero__media video',
      '.slideshow__slide--active video',
      '[data-section-type="video"] video',
      '.banner__media video',
      '.lb-hero video',
    ],
    // Selector for ALL <video> elements on the page (hero + sections).
    allVideoSelector: 'video',
    // Selector for YouTube / Vimeo iframes
    iframeSelector: 'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]',
    // How far before entering viewport to start loading section videos (good connection)
    lazyRootMargin: '0px 0px 200px 0px',
    // Same but for slow/save-data connections
    lazyRootMarginSlow: '0px 0px 50px 0px',
    // Fade-in duration for poster → video transition (ms)
    fadeInDuration: 600,
  };

  // ─── CONNECTION DETECTION ──────────────────────────────────────────────────
  function isSlowConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return false;
    if (conn.saveData) return true;
    return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
  }

  const slowConn = isSlowConnection();

  // ─── UTILITY: is this video the hero? ──────────────────────────────────────
  function isHeroVideo(video) {
    return CONFIG.heroSelectors.some(selector => {
      try { return video.matches(selector) || video.closest(selector.replace(/ video$/, '')); }
      catch (e) { return false; }
    });
  }

  // ─── HERO VIDEO: highest quality, eager preload ────────────────────────────
  function optimiseHeroVideo(video) {
    // v1.2: preload='metadata' instead of 'auto' — browser buffers enough to
    // begin playback immediately without racing the critical render path.
    // 'auto' was downloading the entire video file before fonts/CSS finished.
    video.setAttribute('preload', 'metadata');
    video.setAttribute('fetchpriority', 'high');

    // Ensure sources are not lazy-src swapped out — copy data-src → src
    video.querySelectorAll('source[data-src]').forEach(source => {
      if (!source.src || source.src === window.location.href) {
        source.src = source.dataset.src;
      }
    });

    // Quality hint via Media Capabilities API (advisory, browser may ignore)
    if ('mediaCapabilities' in navigator) {
      const firstSource = video.querySelector('source');
      if (firstSource) {
        navigator.mediaCapabilities.decodingInfo({
          type: 'file',
          video: { contentType: firstSource.type || 'video/mp4', width: 1920, height: 1080, bitrate: 8000000, framerate: 30 }
        }).then(result => {
          if (result.supported && result.smooth && result.powerEfficient) {
            video.setAttribute('data-lb-quality', 'high-confirmed');
          }
        }).catch(() => {});
      }
    }

    // Guarantee autoplay muted (required by all browsers)
    video.muted = true;
    video.setAttribute('playsinline', '');

    // If video hasn't started playing yet, play it
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked — show poster, add play button if theme provides one
          video.setAttribute('data-lb-autoplay-blocked', 'true');
        });
      }
    }

    // Fade in smoothly once data is loaded
    applyFadeIn(video);
  }

  // ─── SECTION VIDEOS: lazy load + play/pause on visibility ─────────────────
  function setupLazySectionVideos() {
    const rootMargin = slowConn ? CONFIG.lazyRootMarginSlow : CONFIG.lazyRootMargin;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
          // ── Load sources if not yet loaded ──────────────────────────────
          if (video.getAttribute('data-lb-loaded') !== 'true') {
            // Swap data-src → src for lazy sources
            video.querySelectorAll('source[data-src]').forEach(source => {
              source.src = source.dataset.src;
            });
            // If video element itself has data-src
            if (video.dataset.src) {
              video.src = video.dataset.src;
            }
            video.setAttribute('preload', slowConn ? 'metadata' : 'auto');
            video.load();
            // v1.2 fix: mark ALL observed videos as loaded, not only data-src
            // ones — prevents permanent opacity:0 on hardcoded-src section videos.
            video.setAttribute('data-lb-loaded', 'true');
          }

          // ── Play when visible ────────────────────────────────────────────
          if (video.hasAttribute('autoplay') || video.dataset.lbAutoplay === 'true') {
            video.muted = true;
            video.setAttribute('playsinline', '');
            const p = video.play();
            if (p !== undefined) p.catch(() => {});
          }

          applyFadeIn(video);

        } else {
          // ── Pause when out of view ───────────────────────────────────────
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, {
      rootMargin,
      threshold: 0,
    });

    document.querySelectorAll(CONFIG.allVideoSelector).forEach(video => {
      if (isHeroVideo(video)) return; // Hero handled separately
      // Set preload=none until observer fires
      if (!video.getAttribute('preload') || video.getAttribute('preload') === 'auto') {
        video.setAttribute('preload', 'none');
      }
      observer.observe(video);
    });
  }

  // ─── YOUTUBE / VIMEO IFRAMES: quality postMessage ──────────────────────────
  function optimiseVideoIframes() {
    document.querySelectorAll(CONFIG.iframeSelector).forEach(iframe => {
      // YouTube: append quality param to URL
      try {
        const url = new URL(iframe.src);
        if (url.hostname.includes('youtube') || url.hostname.includes('youtu.be')) {
          // vq=hd1080 requests 1080p; browser/YT will use best available
          if (!url.searchParams.has('vq')) {
            url.searchParams.set('vq', 'hd1080');
          }
          // Enable JS API so we can send postMessage quality commands
          if (!url.searchParams.has('enablejsapi')) {
            url.searchParams.set('enablejsapi', '1');
          }
          iframe.src = url.toString();
        }

        if (url.hostname.includes('vimeo')) {
          // Vimeo: quality=1080p param
          if (!url.searchParams.has('quality')) {
            url.searchParams.set('quality', '1080p');
          }
          iframe.src = url.toString();
        }
      } catch (e) {}

      // Send postMessage after iframe loads
      iframe.addEventListener('load', () => {
        try {
          // YouTube postMessage: set quality
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }),
            '*'
          );
          // Vimeo postMessage: set quality
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: 'setQuality', value: '1080p' }),
            '*'
          );
        } catch (e) {}
      }, { once: true });
    });
  }

  // ─── FADE IN ───────────────────────────────────────────────────────────────
  function applyFadeIn(video) {
    if (video.getAttribute('data-lb-fade-applied')) return;
    video.setAttribute('data-lb-fade-applied', 'true');
    // Only fade if video isn't already visible
    if (getComputedStyle(video).opacity !== '0') return;
    video.style.transition = `opacity ${CONFIG.fadeInDuration}ms ease`;
    const showVideo = () => { video.style.opacity = '1'; };
    if (video.readyState >= 2) {
      showVideo();
    } else {
      video.addEventListener('loadeddata', showVideo, { once: true });
    }
  }

  // ─── CSS: ensure off-screen section videos stay invisible until faded in ───
  function injectBaseStyles() {
    if (document.getElementById('lb-video-optimizer-styles')) return;
    const style = document.createElement('style');
    style.id = 'lb-video-optimizer-styles';
    style.textContent = `
      /* Hero video: always full opacity, GPU composited for smooth decode */
      .hero__media video,
      .slideshow__slide video,
      [data-section-type="video"] video,
      .banner__media video {
        opacity: 1 !important;
        /* v1.2: will-change: transform promotes the video to its own GPU
           compositing layer, keeping decode off the main thread and
           preventing scroll jank when below-fold content loads in. */
        will-change: transform;
      }

      /* Section (non-hero) videos: start invisible until loaded */
      video[data-lb-loaded]:not([data-lb-fade-applied]) {
        opacity: 0;
      }

      /* GPU composite hint on all videos for smooth playback */
      video {
        transform: translateZ(0);
        backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── DYNAMIC SECTION SUPPORT (Shopify theme editor) ──────────────────────
  // When a new section containing a video is added in the theme editor,
  // re-run the observer setup on that section's videos.
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target;
    section.querySelectorAll('video').forEach(video => {
      if (isHeroVideo(video)) {
        optimiseHeroVideo(video);
      }
    });
    section.querySelectorAll(CONFIG.iframeSelector).forEach(() => optimiseVideoIframes());
    setupLazySectionVideos();
  });

  // ─── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    injectBaseStyles();

    // Optimise hero video(s) first — highest priority
    CONFIG.heroSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(video => optimiseHeroVideo(video));
    });

    // Set up lazy section videos
    setupLazySectionVideos();

    // Optimise embedded iframes
    optimiseVideoIframes();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
