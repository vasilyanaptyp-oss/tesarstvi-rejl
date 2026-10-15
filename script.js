(function () {
  'use strict';

  /* mobile menu */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  }
  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      burger.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* in-page links: the same short scroll on every page length (native smooth scroll takes 1-2 s on a long phone page) */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var id = a.getAttribute('href').slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var root = document.documentElement;
    var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    var from = window.scrollY;
    var to = Math.max(0, Math.min(target.getBoundingClientRect().top + from - pad, root.scrollHeight - window.innerHeight));
    var done = function () {
      root.style.scrollBehavior = '';
      if (history.pushState) history.pushState(null, '', '#' + id);
      if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    root.style.scrollBehavior = 'auto';
    if (reduce || Math.abs(to - from) < 2) { window.scrollTo(0, to); done(); return; }
    var t0 = null, dur = 450;
    (function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, from + (to - from) * ease);
      if (k < 1) requestAnimationFrame(step); else done();
    })(performance.now());
  });

  /* call button on phones appears after the hero */
  var fab = document.querySelector('.call-fab');
  var hero = document.querySelector('.hero');
  function fabState() {
    fab.classList.toggle('show', window.scrollY > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', fabState, { passive: true });
  fabState();

  /* lightbox */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery button'));
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var b = items[current];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = b.querySelector('img').alt;
    lbCap.textContent = b.getAttribute('data-cap') + '  ·  ' + (current + 1) + ' / ' + items.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (b, i) {
    b.addEventListener('click', function () { open(i); });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    tx = null;
  }, { passive: true });

  /* inquiry form -> prefilled mailto */
  var form = document.getElementById('inquiry');
  var err = document.getElementById('formErr');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
  function mark(field, bad) {
    field.classList.toggle('bad', bad);
    if (bad) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
  ['name', 'phone', 'email'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      if (this.getAttribute('aria-invalid') === 'true') mark(this, false);
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    var email = f.email.value.trim();
    var emailBad = email !== '' && (!f.email.validity.valid || !emailRe.test(email));
    mark(f.name, !name);
    mark(f.phone, !phone);
    mark(f.email, emailBad);
    if (!name || !phone || emailBad) {
      var msg = [];
      if (!name || !phone) msg.push('Vyplňte prosím jméno a telefon.');
      if (emailBad) msg.push('Zadejte platnou e-mailovou adresu.');
      err.textContent = msg.join(' ');
      err.hidden = false;
      (!name ? f.name : !phone ? f.phone : f.email).focus();
      return;
    }
    err.hidden = true;
    var lines = [
      'Dobrý den,',
      '',
      'mám zájem o: ' + f.type.value,
      f.place.value.trim() ? 'Místo stavby: ' + f.place.value.trim() : '',
      '',
      f.msg.value.trim(),
      '',
      'Jméno: ' + name,
      'Telefon: ' + phone,
      email ? 'E-mail: ' + email : '',
      '',
      'Děkuji a jsem s pozdravem'
    ].filter(function (l, i, a) { return !(l === '' && a[i - 1] === ''); });
    var subject = 'Poptávka: ' + f.type.value;
    window.location.href = 'mailto:blondak32@seznam.cz?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
  });
})();
