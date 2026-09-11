/*--------------------------------------------------------------
  Single-project page behaviours: shared by single-project.html
  and every per-project copy made from it.

  - Redirects a plain vertical mouse-wheel/trackball scroll into
    horizontal movement over the photo strip and the "More Project"
    track (a normal wheel only ever sends vertical delta, so without
    this a mouse can't scroll either strip at all).
  - Opens a photo from the hero strip large in a lightbox on click.
  - Reveals the fixed bottom info bar only once the visitor has
    scrolled to the bottom of the page, instead of leaving it
    covering content the whole time.

  NOTE: none of the horizontal-scrolling elements here use CSS
  scroll-snap. scroll-snap fights this wheel redirect — the browser
  re-snaps to the nearest panel the instant scrollLeft is set
  programmatically, which cancels out every wheel tick and makes the
  strip look frozen. Leave scroll-snap off unless this script is
  removed too.
----------------------------------------------------------------*/
(function () {
  "use strict";

  function enableWheelScroll(el) {
    if (!el) return;
    el.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxInner = document.getElementById('lightboxInner');
    var photoStrip = document.querySelector('.project-photos');
    if (!lightbox || !lightboxInner || !photoStrip) return;

    function open(photoEl) {
      var img = photoEl.querySelector('img');
      if (!img) return;
      lightboxInner.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '">';
      lightbox.classList.add('open');
    }

    function close() {
      lightbox.classList.remove('open');
    }

    photoStrip.addEventListener('click', function (e) {
      var photo = e.target.closest('.photo');
      if (photo) open(photo);
    });

    var closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) closeBtn.addEventListener('click', close);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close(); // click on the dark backdrop, not the image
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function initInfoBarReveal() {
    var bar = document.querySelector('.project-info-bar');
    if (!bar) return;

    function update() {
      var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 40;
      bar.classList.toggle('visible', atBottom);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update(); // in case the page is short enough to already be "at the bottom" on load
  }

  function init() {
    enableWheelScroll(document.querySelector('.project-photos'));
    enableWheelScroll(document.querySelector('.more-track'));
    initLightbox();
    initInfoBarReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
