/*--------------------------------------------------------------
  Custom cursor: a dark-gray dot that grows into a circle labelled
  "Open" while hovering a link. Real buttons skip the circle — they
  get their own red hover style instead (see style.css) — since a
  button already sits under the pointer and doesn't need "opening".
  Skips itself entirely on touch/coarse-pointer devices, which have
  no real hover state.
----------------------------------------------------------------*/
(function () {
  "use strict";

  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  var OPEN_CIRCLE_SELECTOR = 'a, label[for], .menu-btn';
  var BUTTON_SELECTOR = 'button, [role="button"], input[type="submit"], input[type="button"]';
  var CLICKABLE_SELECTOR = OPEN_CIRCLE_SELECTOR + ', ' + BUTTON_SELECTOR;

  function closest(el, selector) {
    return el && el.closest ? el.closest(selector) : null;
  }

  function closestClickable(el) {
    return closest(el, CLICKABLE_SELECTOR);
  }

  function init() {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';

    var label = document.createElement('span');
    label.className = 'cursor-label';
    label.textContent = 'Open';
    dot.appendChild(label);

    document.body.appendChild(dot);
    document.documentElement.classList.add('custom-cursor-enabled');

    var raf = null;
    var pendingX = 0;
    var pendingY = 0;

    function flush() {
      dot.style.left = pendingX + 'px';
      dot.style.top = pendingY + 'px';
      raf = null;
    }

    document.addEventListener('mousemove', function (e) {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    });

    document.addEventListener('mouseover', function (e) {
      if (closest(e.target, BUTTON_SELECTOR)) return; // stays a plain dot
      if (closest(e.target, OPEN_CIRCLE_SELECTOR)) dot.classList.add('is-hover');
    });

    document.addEventListener('mouseout', function (e) {
      var stillInside = closestClickable(e.relatedTarget);
      if (closestClickable(e.target) && !stillInside) dot.classList.remove('is-hover');
    });

    // Hide the dot when the pointer leaves the page (e.g. to the
    // browser chrome) so it doesn't sit frozen in the last spot.
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
