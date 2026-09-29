// Homepage marquee: the section pins at full viewport height inside a
// taller scroll-space wrapper. While the visitor scrolls through that
// extra height, each column's track cycles through several full loops
// (outer columns downward, middle column upward) — driven purely by
// scroll position, never auto-playing.
(function () {
    var mobileQuery = window.matchMedia('(max-width: 768px)');
    if (mobileQuery.matches) return; // mobile: single stacked strip, normal scroll, no JS

    var wrapper = document.querySelector('.marquee-scroll-space');
    var section = document.querySelector('.marquee-showcase');
    if (!wrapper || !section) return;

    var columns = [
        { el: document.querySelector('.marquee-col--down'), loops: 2, dir: 1 },
        { el: document.querySelector('.marquee-col--up'), loops: 2, dir: -1 },
        { el: document.querySelector('.marquee-col--down-fast'), loops: 3, dir: 1 }
    ].filter(function (c) { return c.el; });

    if (!columns.length) return;

    columns.forEach(function (c) {
        c.track = c.el.querySelector('.marquee-track-v');
    });

    function measure() {
        columns.forEach(function (c) {
            c.half = c.track.scrollHeight / 2;
        });
    }

    function update() {
        var rect = wrapper.getBoundingClientRect();
        var scrollable = wrapper.offsetHeight - window.innerHeight;
        var progress = scrollable > 0 ? (-rect.top) / scrollable : 0;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        columns.forEach(function (c) {
            if (!c.half) return;
            var offset = (progress * c.loops * c.half) % c.half;
            if (offset < 0) offset += c.half;
            var translate = c.dir === 1 ? (offset - c.half) : -offset;
            c.track.style.transform = 'translateY(' + translate + 'px)';
        });
        ticking = false;
    }

    var ticking = false;
    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    window.addEventListener('load', function () {
        measure();
        update();
    });
    window.addEventListener('resize', function () {
        measure();
        update();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
})();
