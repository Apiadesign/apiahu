/*--------------------------------------------------------------
  Project click-through "zoom" transition.

  Clicking a project thumbnail (any <a class="project-link">)
  clones the clicked <img>, animates it to fill the viewport while
  the rest of the page fades away, then navigates to the linked
  single project page. Falls back to a plain navigation for
  middle/ctrl/cmd-clicks, keyboard "open in new tab", and when the
  visitor prefers reduced motion.
----------------------------------------------------------------*/
(function () {
  "use strict";

  var ZOOM_MS = 620;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function onProjectLinkClick(e) {
    var link = e.currentTarget;
    var target = link.getAttribute('href');

    if (!target || target === '#' || target.charAt(0) === '#') return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser handle new-tab / new-window clicks
    if (prefersReducedMotion()) return; // plain navigation, no animation

    var img = link.querySelector('img');
    if (!img) return; // nothing to animate, let the normal link work

    e.preventDefault();

    // Remember which project was opened so the destination page could
    // (optionally) read it via sessionStorage if it's ever made dynamic.
    try {
      var projectId = link.getAttribute('data-project');
      if (projectId) sessionStorage.setItem('lastProject', projectId);
    } catch (err) { /* storage blocked: ignore */ }

    var rect = img.getBoundingClientRect();
    var clone = img.cloneNode(true);
    clone.classList.add('zoom-clone');
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';
    clone.style.borderRadius = window.getComputedStyle(img).borderRadius || '0';
    clone.style.transition = 'top ' + ZOOM_MS + 'ms cubic-bezier(.65,0,.35,1), ' +
      'left ' + ZOOM_MS + 'ms cubic-bezier(.65,0,.35,1), ' +
      'width ' + ZOOM_MS + 'ms cubic-bezier(.65,0,.35,1), ' +
      'height ' + ZOOM_MS + 'ms cubic-bezier(.65,0,.35,1), ' +
      'border-radius ' + ZOOM_MS + 'ms ease';

    document.body.appendChild(clone);
    document.body.classList.add('is-zooming');

    // Two rAFs so the browser commits the clone's starting position
    // before we animate it — otherwise the transition never plays.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        clone.style.top = '0px';
        clone.style.left = '0px';
        clone.style.width = '100vw';
        clone.style.height = '100vh';
        clone.style.borderRadius = '0';
      });
    });

    window.setTimeout(function () {
      window.location.href = target;
    }, ZOOM_MS);
  }

  function init() {
    var links = document.querySelectorAll('a.project-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', onProjectLinkClick);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
