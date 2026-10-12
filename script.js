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
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    f.name.classList.toggle('bad', !name);
    f.phone.classList.toggle('bad', !phone);
    if (!name || !phone) {
      err.hidden = false;
      (name ? f.phone : f.name).focus();
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
      f.email.value.trim() ? 'E-mail: ' + f.email.value.trim() : '',
      '',
      'Děkuji a jsem s pozdravem'
    ].filter(function (l, i, a) { return !(l === '' && a[i - 1] === ''); });
    var subject = 'Poptávka: ' + f.type.value;
    window.location.href = 'mailto:blondak32@seznam.cz?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
  });
})();
