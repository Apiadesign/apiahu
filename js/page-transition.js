/*--------------------------------------------------------------
  Project-link page transition: clicking a project thumbnail plays a
  concentric red (#d50d0b) ripple out from the click point that
  covers the screen, then the destination page reveals back through
  the same rings shrinking away. See the html.pt-incoming rule and
  .page-transition rules in style.css, and the tiny inline script in
  each page's <head> that adds the "pt-incoming" class before first
  paint (so there is no flash of the raw page on arrival).
----------------------------------------------------------------*/
(function () {
  "use strict";

  var STORAGE_KEY = 'ptOrigin';
  var SELECTOR = 'a.project-link[href]';
  var COVER_MS = 550;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildOverlay(x, y) {
    var overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.setProperty('--tx', x + 'px');
    overlay.style.setProperty('--ty', y + 'px');
    for (var i = 0; i < 3; i++) {
      overlay.appendChild(document.createElement('span')).className = 'ring';
    }
    document.body.appendChild(overlay);
    return overlay;
  }

  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest ? e.target.closest(SELECTOR) : null;
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || link.target === '_blank') return;

      e.preventDefault();

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ x: e.clientX, y: e.clientY }));
      } catch (err) { /* private mode: arrival just won't have a stored origin */ }

      var overlay = buildOverlay(e.clientX, e.clientY);
      overlay.getBoundingClientRect(); // flush styles so the class change below actually transitions
      overlay.classList.add('is-covering');

      window.setTimeout(function () {
        window.location.href = href;
      }, COVER_MS);
    });
  }

  if (document.documentElement.classList.contains('pt-incoming')) {
    var origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) origin = JSON.parse(stored);
    } catch (err) { /* fall back to center */ }
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }

    var reveal = function () {
      document.documentElement.classList.remove('pt-incoming');

      if (reduceMotion) return; // the plain instant red cover is already gone; nothing left to animate

      var overlay = buildOverlay(origin.x, origin.y);
      overlay.classList.add('is-covered'); // instantly fully red, same as the ::before it replaces

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.classList.remove('is-covered');
          overlay.classList.add('is-revealing');
          window.setTimeout(function () {
            overlay.remove();
          }, 700);
        });
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', reveal);
    } else {
      reveal();
    }
  }

  // If the visitor lands here via the browser's Back button, Chrome/Safari
  // can restore the exact DOM state the page was in right before it
  // navigated away (bfcache) — including a leftover covering overlay.
  // Clean it up so Back always shows a normal, fully visible page.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.documentElement.classList.remove('pt-incoming');
      var leftovers = document.querySelectorAll('.page-transition');
      for (var i = 0; i < leftovers.length; i++) {
        leftovers[i].remove();
      }
    }
  });
})();
