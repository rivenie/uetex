(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- page transition (curtain) ---------- */
  var curtain = document.createElement('div');
  curtain.className = 'curtain';
  document.body.appendChild(curtain);
  var cameFromNav = false;
  try { cameFromNav = sessionStorage.getItem('uetex-nav') === '1'; sessionStorage.removeItem('uetex-nav'); } catch (e) {}
  if (cameFromNav && !reduce) {
    curtain.style.transform = 'scaleY(1)';
    requestAnimationFrame(function () { curtain.style.transform = ''; curtain.classList.add('out'); });
    setTimeout(function () { curtain.className = 'curtain'; }, 700);
  }
  window.addEventListener('pageshow', function () { curtain.className = 'curtain'; curtain.style.transform = ''; });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce) return;
    var href = a.getAttribute('href');
    if (!/^[a-z0-9-]+\.html(#[\w-]+)?$/i.test(href) || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var cur = location.pathname.split('/').pop() || 'index.html';
    if (href.split('#')[0] === cur) return;
    e.preventDefault();
    try { sessionStorage.setItem('uetex-nav', '1'); } catch (err) {}
    curtain.classList.add('in');
    setTimeout(function () { location.href = href; }, 430);
    setTimeout(function () { curtain.className = 'curtain'; }, 2500);
  });

  /* ---------- header, progress, menu ---------- */
  var header = $('.site-header');
  var progress = document.createElement('div');
  progress.className = 'progress';
  document.body.appendChild(progress);
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', y > 40);
      if (!document.body.classList.contains('menu-open')) header.classList.toggle('hide', y > 500 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('hide');
    }
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    lastY = y;
    parallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = $('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- parallax ---------- */
  var pEls = $$('[data-parallax]');
  function parallax() {
    if (reduce) return;
    var vh = window.innerHeight;
    pEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var off = (r.top + r.height / 2 - vh / 2) * -k;
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }

  /* ---------- reveal on scroll (only what starts below the fold) ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) { el.classList.add('pre'); io.observe(el); }
    });
    // service media wipe
    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('seen'); mio.unobserve(en.target); } });
    }, { threshold: 0.25 });
    $$('.svc-media').forEach(function (m) { mio.observe(m); });
  } else {
    $$('.svc-media').forEach(function (m) { m.classList.add('seen'); });
  }

  /* ---------- counters ---------- */
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        var pad = el.textContent.trim().length > 1 && end < 10;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = pad && v < 10 ? '0' + v : v;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- hero slideshow ---------- */
  var slides = $$('.hero-slides img');
  if (slides.length) {
    var dots = $$('.slide-dots button'), label = $('#slide-label'), idx = 0, timer;
    function show(i) {
      slides[idx].classList.remove('on');
      if (dots[idx]) dots[idx].classList.remove('on');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('on');
      if (dots[idx]) { dots[idx].classList.remove('on'); void dots[idx].offsetWidth; dots[idx].classList.add('on'); }
      if (label) label.textContent = slides[idx].getAttribute('data-label');
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(function () { show(idx + 1); }, 6000);
    }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    show(0);
  }

  /* ---------- hero canvas: current pulses running along a wiring grid ---------- */
  var cv = $('#grid-canvas');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W, H, dpr, G = 64, pulses = [], raf;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn() {
      var horiz = Math.random() < 0.6;
      var cols = Math.ceil(W / G), rows = Math.ceil(H / G);
      return {
        x: horiz ? 0 : Math.floor(Math.random() * cols) * G,
        y: horiz ? Math.floor(Math.random() * rows) * G : H,
        dx: horiz ? 1 : 0, dy: horiz ? 0 : -1,
        v: 1.4 + Math.random() * 2.2, trail: [], life: 0,
        c: Math.random() < 0.18 ? '246,185,11' : '59,147,255'
      };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,170,230,0.07)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = 0.5; x < W; x += G) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (var y = 0.5; y < H; y += G) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      while (pulses.length < Math.max(6, Math.round(W / 140))) pulses.push(spawn());
      pulses.forEach(function (p, i) {
        p.x += p.dx * p.v; p.y += p.dy * p.v; p.life++;
        p.trail.push([p.x, p.y]); if (p.trail.length > 46) p.trail.shift();
        if (p.x % G < p.v && p.y % G < p.v + 1 && Math.random() < 0.06) {
          var t = p.dx; p.dx = p.dy ? (Math.random() < 0.5 ? 1 : -1) : 0; p.dy = t ? -1 : 0;
          p.x = Math.round(p.x / G) * G; p.y = Math.round(p.y / G) * G;
        }
        for (var k = 1; k < p.trail.length; k++) {
          var a = k / p.trail.length;
          ctx.strokeStyle = 'rgba(' + p.c + ',' + (a * 0.85).toFixed(3) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p.trail[k - 1][0], p.trail[k - 1][1]); ctx.lineTo(p.trail[k][0], p.trail[k][1]); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + p.c + ',1)';
        ctx.shadowColor = 'rgba(' + p.c + ',1)'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
        if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60 || p.life > 900) pulses[i] = spawn();
      });
      raf = requestAnimationFrame(frame);
    }
    size();
    window.addEventListener('resize', size);
    if (!reduce) frame();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) frame();
    });
  }

  /* ---------- services scroll-spy ---------- */
  var idxLinks = $$('.svc-index a');
  if (idxLinks.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        idxLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.svc-item').forEach(function (s) { sio.observe(s); });
  }

  /* ---------- catalog filters ---------- */
  var fBtns = $$('.catalog-controls button');
  fBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('.product-card').forEach(function (c, i) {
        var show = f === 'all' || c.getAttribute('data-category') === f;
        c.style.display = show ? 'flex' : 'none';
      });
    });
  });

  /* ---------- copy buttons ---------- */
  $$('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy');
      function done() { var o = b.textContent; b.textContent = 'Copiado'; b.classList.add('ok'); setTimeout(function () { b.textContent = o; b.classList.remove('ok'); }, 1600); }
      function fallback() {
        var v = b.parentElement.querySelector('.v');
        if (v && window.getSelection) { var r = document.createRange(); r.selectNodeContents(v); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      }
      try {
        navigator.clipboard.writeText(txt).then(done, fallback);
      } catch (e) { fallback(); }
    });
  });

  /* ---------- contact form → WhatsApp ---------- */
  var form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['c-nombre', 'c-empresa', 'c-mensaje'].forEach(function (id) {
        var f = document.getElementById(id), err = f.parentElement.querySelector('.err');
        var bad = !f.value.trim();
        err.textContent = bad ? 'Completa este campo.' : '';
        if (bad) ok = false;
      });
      if (!ok) return;
      var g = function (id) { return document.getElementById(id).value.trim(); };
      var msg = 'Hola UETEX, soy ' + g('c-nombre') + ' de ' + g('c-empresa') + '.' +
        (g('c-servicio') ? ' Me interesa: ' + g('c-servicio') + '.' : '') +
        (g('c-telefono') ? ' Mi teléfono: ' + g('c-telefono') + '.' : '') +
        '\n\n' + g('c-mensaje');
      var url = 'https://wa.me/51987654321?text=' + encodeURIComponent(msg);
      var box = $('#form-result');
      box.hidden = false;
      box.innerHTML = '';
      var p = document.createElement('p');
      p.textContent = 'Tu mensaje está listo. Ábrelo en WhatsApp para enviarlo a nuestro equipo.';
      var a = document.createElement('a');
      a.className = 'btn btn-primary'; a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = 'Abrir en WhatsApp <span class="arr">→</span>';
      a.style.marginTop = '14px';
      box.appendChild(p); box.appendChild(a);
    });
  }

  onScroll();
})();