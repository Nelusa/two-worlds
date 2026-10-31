/* Dva světy · B2 · spouštění choreografie odhalení
   Bez závislostí. Vložení: <script src="reveal/reveal.js" defer></script>
   Použití:
     DvaSvetyReveal.init(document.querySelector('[data-reveal-root]'), { focus: '#odhaleni-nadpis' });
     DvaSvetyReveal.replay(root);       // tlačítko „Přehrát odhalení znovu“
     DvaSvetyReveal.setStill(root, true) // náhled bez pohybu (jen pro kontrolu)

   Chování:
   - Při prefers-reduced-motion: reduce nic nearmuje, obsah je hned v koncovém stavu.
   - První oddíl se spustí hned, další až při vstupu do viditelné části (25 %).
   - Každý oddíl se přehraje jednou; replay() přehraje všechny viditelné znovu.
   - Fokus se po načtení přesune na nadpis odhalení (ten má tabindex="-1").
*/
(function (global) {
  'use strict';

  var REDUCED = '(prefers-reduced-motion: reduce)';

  function prefersReduced() {
    return !!(global.matchMedia && global.matchMedia(REDUCED).matches);
  }

  function applyDelays(root) {
    var els = root.querySelectorAll('[data-reveal]');
    for (var i = 0; i < els.length; i++) {
      var d = parseInt(els[i].getAttribute('data-reveal-delay') || '0', 10);
      els[i].style.setProperty('--ds-delay', (isNaN(d) ? 0 : d) + 'ms');
    }
  }

  function play(section) {
    section.classList.remove('is-playing');
    // vynutí přepočet, aby se animace spustila znovu
    void section.offsetWidth;
    section.classList.add('is-playing');
  }

  function init(root, opts) {
    root = root || document.documentElement;
    opts = opts || {};
    var sections = Array.prototype.slice.call(root.querySelectorAll('[data-reveal-section]'));

    if (opts.focus) {
      var target = typeof opts.focus === 'string' ? root.querySelector(opts.focus) : opts.focus;
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }

    if (prefersReduced() || !sections.length) return { sections: sections, animated: false };

    applyDelays(root);
    root.classList.add('ds-reveal-armed');

    var first = sections[0];
    play(first);

    if ('IntersectionObserver' in global) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            play(e.target);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      sections.slice(1).forEach(function (s) { io.observe(s); });
      root._dsObserver = io;
    } else {
      sections.forEach(play);
    }

    // Kdyby se uživatel přepnul na omezení pohybu během prohlížení
    if (global.matchMedia) {
      var mq = global.matchMedia(REDUCED);
      var onChange = function () { if (mq.matches) setStill(root, true); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
    return { sections: sections, animated: true };
  }

  function replay(root) {
    root = root || document.documentElement;
    if (prefersReduced()) return;
    setStill(root, false);
    var sections = root.querySelectorAll('[data-reveal-section]');
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < (global.innerHeight || document.documentElement.clientHeight);
      if (visible || i === 0) play(sections[i]);
    }
  }

  function setStill(root, still) {
    root = root || document.documentElement;
    root.classList.toggle('ds-reveal-still', !!still);
    if (still) root.classList.remove('ds-reveal-armed');
    else if (!prefersReduced()) root.classList.add('ds-reveal-armed');
  }

  global.DvaSvetyReveal = { init: init, replay: replay, setStill: setStill };
})(window);
