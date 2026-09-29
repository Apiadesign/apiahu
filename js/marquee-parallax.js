// Homepage marquee: column position is driven by actual page scroll
// position only — no auto-playing animation. Outer columns move down
// as the page scrolls down, the middle column moves up.
(function () {
    var columns = [
        { el: document.querySelector('.marquee-col--down'), speed: 0.25, dir: 1 },
        { el: document.querySelector('.marquee-col--up'), speed: 0.25, dir: -1 },
        { el: document.querySelector('.marquee-col--down-fast'), speed: 0.4, dir: 1 }
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
        var y = window.scrollY || window.pageYOffset;
        columns.forEach(function (c) {
            if (!c.half) return;
            var offset = (y * c.speed) % c.half;
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
