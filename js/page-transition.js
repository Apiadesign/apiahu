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
  var RETURN_KEY = 'ptReturn';   // { url, y } of the page a project was opened from
  var RESTORE_KEY = 'ptRestore'; // set by the back link so that page restores its scroll
  var SELECTOR = 'a.project-link[href], a.float[href], a#gameLink[href], a.match-card[href], a.project-back[href]';
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
        if (link.classList.contains('project-back')) {
          sessionStorage.setItem(RESTORE_KEY, '1'); // the page we return to scrolls back to where they left
        } else {
          sessionStorage.setItem(RETURN_KEY, JSON.stringify({ url: location.pathname + location.search, y: window.pageYOffset }));
        }
      } catch (err) { /* storage blocked: back link just opens its default page */ }

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

  // Homepage "Contact" jump: instead of letting the whole page fly past,
  // cover the screen with the red ripple, jump to the closing section
  // while hidden, then reveal it.
  var jumping = false;
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest ? e.target.closest('a[href="#outro"]') : null;
      var target = link && document.getElementById('outro');
      if (!target) return;
      e.preventDefault();
      if (jumping) return;
      jumping = true;

      var overlay = buildOverlay(e.clientX, e.clientY);
      overlay.getBoundingClientRect();
      overlay.classList.add('is-covering');

      window.setTimeout(function () {
        var root = document.documentElement;
        var prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto'; // jump instantly, nothing visible while hidden
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset);
        root.style.scrollBehavior = prev;
        try { history.replaceState(null, '', '#outro'); } catch (err) { /* ignore */ }

        overlay.classList.remove('is-covering');
        overlay.classList.add('is-covered');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            overlay.classList.remove('is-covered');
            overlay.classList.add('is-revealing');
            window.setTimeout(function () {
              overlay.remove();
              jumping = false;
            }, 700);
          });
        });
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

  /*------------------------------------------------------------
    Back link on project pages: names the page it returns to
    ("Back to Home", "Back to Projects"…) and goes there, instead of
    always "main page". The page it returns to scrolls back to where
    the visitor left it (see the restore block below).
  ------------------------------------------------------------*/
  var LABELS = {
    'index.html': 'Home', '': 'Home',
    'portfolio-masonry.html': 'Projects',
    'about.html': 'About',
    'single-project-desliz-faucet.html': 'Desliz Faucet',
    'single-project-mr-shower-tray.html': 'MR Shower Tray',
    'single-project-logitech-pc-mouse.html': 'Logitech PC Mouse'
  };
  function fileOf(url) { return (url.split('?')[0].split('#')[0].split('/').pop() || '').toLowerCase(); }

  var backLink = document.querySelector('.project-back');
  if (backLink) {
    var ret = null;
    try { ret = JSON.parse(sessionStorage.getItem(RETURN_KEY)); } catch (err) { /* none */ }
    var label = 'Home';
    if (ret && ret.url && fileOf(ret.url) !== fileOf(location.pathname)) {
      backLink.setAttribute('href', ret.url);
      label = LABELS[fileOf(ret.url)] || 'previous page';
    }
    var nodes = backLink.childNodes;
    for (var n = nodes.length - 1; n >= 0; n--) {
      if (nodes[n].nodeType === 3 && nodes[n].nodeValue.trim()) {
        nodes[n].nodeValue = ' Back to ' + label + ' ';
        break;
      }
    }
  }

  // Arriving via a back link: put the page back exactly where it was left.
  var restoreY = null;
  try {
    if (sessionStorage.getItem(RESTORE_KEY) === '1') {
      sessionStorage.removeItem(RESTORE_KEY);
      var saved = JSON.parse(sessionStorage.getItem(RETURN_KEY));
      if (saved && saved.url && fileOf(saved.url) === fileOf(location.pathname)) restoreY = saved.y;
    }
  } catch (err) { /* ignore */ }
  if (restoreY !== null) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var jump = function () {
      var root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto'; // no smooth glide back
      window.scrollTo(0, restoreY);
      root.style.scrollBehavior = prev;
    };
    jump();
    document.addEventListener('DOMContentLoaded', jump);
    window.addEventListener('load', jump);
  }
})();
