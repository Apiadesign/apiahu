(function () {
  var overlay = document.getElementById('introOverlay');
  if (!overlay) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alreadySeen = document.documentElement.classList.contains('intro-seen');

  function markSeen() {
    try { sessionStorage.setItem('introPlayed', '1'); } catch (e) { /* private mode etc. */ }
  }

  if (reduce || alreadySeen) {
    overlay.style.display = 'none';
    markSeen();
    return;
  }

  function finishIntro() {
    overlay.style.display = 'none';
    markSeen();
  }

  // Overlay slides itself fully off-screen via CSS (animation-fill-mode: forwards),
  // so it never blocks clicks even if this script fails to run. This listener just
  // removes it from the render tree afterward and remembers it played.
  overlay.addEventListener('animationend', function (e) {
    if (e.target === overlay && e.animationName === 'introWipe') {
      finishIntro();
    }
  });

  var skipBtn = document.getElementById('introSkip');
  if (skipBtn) {
    skipBtn.addEventListener('click', function () {
      overlay.style.transition = 'opacity .3s ease';
      overlay.style.opacity = '0';
      setTimeout(finishIntro, 300);
    });
  }

  // Safety net in case the animationend event is missed for any reason.
  setTimeout(finishIntro, 9500);
})();
