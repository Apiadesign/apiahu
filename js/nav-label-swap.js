/*--------------------------------------------------------------
  Sidebar nav label: periodically swaps "Get PRO" for "Service"
  and back, with a quick crossfade. Purely cosmetic — the link
  itself doesn't change.
----------------------------------------------------------------*/
(function () {
  "use strict";

  var PRIMARY_TEXT = 'Get PRO';
  var ALT_TEXT = 'Service';
  var PRIMARY_DURATION = 4000; // how long "Get PRO" stays up
  var ALT_DURATION = 2000;     // how long "Service" stays up
  var FADE_MS = 250;

  function init() {
    var label = document.getElementById('navProLabel');
    if (!label) return;

    var showingAlt = false;

    function swap() {
      label.style.opacity = '0';
      window.setTimeout(function () {
        showingAlt = !showingAlt;
        label.textContent = showingAlt ? ALT_TEXT : PRIMARY_TEXT;
        label.style.opacity = '1';
        window.setTimeout(swap, showingAlt ? ALT_DURATION : PRIMARY_DURATION);
      }, FADE_MS);
    }

    window.setTimeout(swap, PRIMARY_DURATION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
