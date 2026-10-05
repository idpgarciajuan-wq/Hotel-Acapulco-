/* Hotel Acapulco · comportamiento del sitio */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var cfg = window.HOTEL_CONFIG || {};

  /* ---------- Movimiento reducido ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var saved = store.get('ha-motion');
  var reduced = saved ? saved === 'reduced' : mq.matches;
  function applyMotion() {
    if (reduced) root.setAttribute('data-motion', 'reduced'); else root.removeAttribute('data-motion');
    $$('[data-motion-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', reduced ? 'true' : 'false');
      var l = $('[data-motion-label]', b);
      if (l) l.textContent = reduced ? 'Movimiento reducido: activado' : 'Reducir movimiento';
    });
    onScroll();
  }
  $$('[data-motion-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { reduced = !reduced; store.set('ha-motion', reduced ? 'reduced' : 'full'); applyMotion(); });
  });
  if (mq.addEventListener) mq.addEventListener('change', function (e) { if (!store.get('ha-motion')) { reduced = e.matches; applyMotion(); } });

  /* ---------- Datos de contacto ---------- */
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  var defaultMsg = 'Hola, me gustaría consultar disponibilidad en Hotel Acapulco (León, Gto.).';
  function waUrl(text) {
    var n = digits(cfg.whatsapp);
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text || defaultMsg);
  }
  $$('[data-wa]').forEach(function (a) { a.href = waUrl(defaultMsg); });

  function fill(name, build) {
    var v = (cfg[name] || '').trim();
    if (!v) return;
    $$('[data-fill="' + name + '"]').forEach(function (el) { el.innerHTML = ''; el.appendChild(build(v)); });
  }
  fill('address', function (v) { return document.createTextNode(v); });
  fill('phone', function (v) { var a = document.createElement('a'); a.href = 'tel:+' + (digits(v).length === 10 ? '52' : '') + digits(v); a.textContent = v; return a; });
  fill('email', function (v) { var a = document.createElement('a'); a.href = 'mailto:' + v; a.textContent = v; return a; });

  var socials = [['Facebook', cfg.facebook], ['Instagram', cfg.instagram]].filter(function (s) { return s[1] && s[1].trim(); });
  if (socials.length) {
    var box = $('#socials'); box.innerHTML = '';
    socials.forEach(function (s) {
      var a = document.createElement('a'); a.href = s[1]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = s[0]; box.appendChild(a);
    });
  }
  var ph = digits(cfg.phone);
  if (ph) $$('[data-call]').forEach(function (a) { a.href = 'tel:+' + (ph.length === 10 ? '52' : '') + ph; a.textContent = 'Llamar al hotel · ' + cfg.phone; a.hidden = false; });
  var bk = (cfg.booking || '').trim();
  if (bk) {
    $$('[data-booking]').forEach(function (a) { a.href = bk; a.hidden = false; });
    fill('booking', function (v) { var a = document.createElement('a'); a.href = v; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ver en Booking.com'; return a; });
  }
  if (cfg.mapsUrl) $$('[data-link="maps"]').forEach(function (a) { a.href = cfg.mapsUrl; });
  if (cfg.mapEmbedUrl) {
    var f = document.createElement('iframe');
    f.src = cfg.mapEmbedUrl; f.loading = 'lazy'; f.title = 'Mapa de ubicación de Hotel Acapulco'; f.referrerPolicy = 'no-referrer-when-downgrade';
    $('#map').appendChild(f); $('#map-placeholder').remove();
  }
  if (!cfg.mapEmbedUrl && cfg.mapsUrl) {
    var ph2 = $('#map-placeholder');
    if (ph2) { $('strong', ph2).textContent = 'Encuéntranos en León, Guanajuato'; $('span', ph2).textContent = 'Abre la ubicación exacta en Google Maps y traza tu ruta.'; $('a', ph2).textContent = 'Ver en Google Maps'; }
  }
  if (cfg.nearby && cfg.nearby.length) {
    var ul = $('#nearby'); ul.innerHTML = '';
    cfg.nearby.forEach(function (p) {
      var li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('em');
      a.textContent = p.name; b.textContent = p.detail || ''; li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
  }
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Menú móvil y cabecera ---------- */
  var nav = $('#nav'), burger = $('#burger'), header = $('.site-header');
  function closeNav() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- Aparición al desplazar ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('is-in'); });
  // Respaldo por si algo no se activa
  setTimeout(function () { $$('[data-reveal]:not(.is-in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('is-in'); }); }, 2500);

  /* ---------- Parallax ligero (solo transform, solo lo visible) ---------- */
  var par = $$('[data-parallax],[data-parallax-img]').map(function (el) {
    return { el: el, k: parseFloat(el.getAttribute('data-parallax') || el.getAttribute('data-parallax-img')), img: el.hasAttribute('data-parallax-img'), vis: false };
  });
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { par.forEach(function (p) { if (p.el === e.target) p.vis = e.isIntersecting; }); });
    }, { rootMargin: '120px' });
    par.forEach(function (p) { pio.observe(p.el); });
  } else par.forEach(function (p) { p.vis = true; });

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      header.classList.toggle('is-stuck', scrollY > 8);
      par.forEach(function (p) {
        if (reduced) { p.el.style.transform = ''; return; }
        if (!p.vis) return;
        var r = p.el.getBoundingClientRect();
        var d = (r.top + r.height / 2) - innerHeight / 2;
        var y = (-d * p.k).toFixed(1);
        p.el.style.transform = p.img ? 'translate3d(0,' + y + 'px,0) scale(1.12)' : 'translate3d(0,' + y + 'px,0)';
      });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- Visor de galería ---------- */
  var items = $$('#gallery .g-item');
  var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
  var cur = 0, lastFocus = null;
  function show(i, dir) {
    var n = items.length; i = (i + n) % n; var it = items[i];
    var go = function () {
      lbImg.src = it.getAttribute('data-full');
      lbImg.alt = $('img', it).alt;
      lbCap.textContent = it.getAttribute('data-cap') || '';
      lbCount.textContent = (i + 1) + ' / ' + n;
      lbImg.classList.remove('out-l', 'out-r');
    };
    if (dir && !reduced && lb.classList.contains('is-open')) {
      lbImg.classList.add(dir > 0 ? 'out-l' : 'out-r'); setTimeout(go, 180);
    } else go();
    cur = i;
    [i + 1, i - 1].forEach(function (k) { var m = new Image(); m.src = items[(k + n) % n].getAttribute('data-full'); });
  }
  function open(i) {
    lastFocus = document.activeElement; lb.hidden = false; document.body.classList.add('lb-open');
    show(i); requestAnimationFrame(function () { lb.classList.add('is-open'); $('.lb__close').focus(); });
  }
  function close() {
    lb.classList.remove('is-open'); document.body.classList.remove('lb-open');
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, reduced ? 0 : 400);
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it, i) { it.addEventListener('click', function () { open(i); }); });
  $$('[data-lb-close]').forEach(function (b) { b.addEventListener('click', close); });
  $('[data-lb-prev]').addEventListener('click', function () { show(cur - 1, -1); });
  $('[data-lb-next]').addEventListener('click', function () { show(cur + 1, 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1, -1);
    else if (e.key === 'ArrowRight') show(cur + 1, 1);
    else if (e.key === 'Tab') { // atrapar foco dentro del visor
      var f = $$('.lb__btn', lb); var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lb.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  /* ---------- Formulario ---------- */
  var form = $('#reservar'), status = $('#form-status');
  var inD = $('#f-in'), outD = $('#f-out'), gu = $('#f-guests');
  function iso(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  var today = new Date(); inD.min = iso(today); outD.min = iso(new Date(today.getTime() + 864e5));
  inD.addEventListener('change', function () {
    if (!inD.value) return;
    var next = new Date(inD.value + 'T12:00:00'); next.setDate(next.getDate() + 1);
    outD.min = iso(next); if (outD.value && outD.value < outD.min) outD.value = '';
  });
  $$('[data-step]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var v = (parseInt(gu.value, 10) || 1) + parseInt(b.getAttribute('data-step'), 10);
      gu.value = Math.min(20, Math.max(1, v));
    });
  });
  $$('[data-ask]').forEach(function (a) {
    a.addEventListener('click', function () {
      var m = $('#f-msg'); if (!m.value.trim()) m.value = 'Me interesa: ' + a.getAttribute('data-ask') + '.';
    });
  });
  function setErr(input, msg) {
    var e = input.closest('.field').querySelector('.err'); e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function fmt(v) { var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = $('#f-name'), ok = true, first = null;
    function bad(i, m) { setErr(i, m); ok = false; if (!first) first = i; }
    setErr(name, ''); setErr(inD, ''); setErr(outD, ''); setErr(gu, '');
    if (!name.value.trim()) bad(name, 'Escribe tu nombre.');
    if (!inD.value) bad(inD, 'Elige la fecha de llegada.');
    if (!outD.value) bad(outD, 'Elige la fecha de salida.');
    else if (inD.value && outD.value <= inD.value) bad(outD, 'La salida debe ser después de la llegada.');
    var g = parseInt(gu.value, 10);
    if (!g || g < 1 || g > 20) bad(gu, 'Indica entre 1 y 20 huéspedes.');
    if (!ok) { status.textContent = 'Revisa los campos marcados.'; first.focus(); return; }

    var msg = $('#f-msg').value.trim();
    var text = 'Hola, soy ' + name.value.trim() + '. Me gustaría consultar disponibilidad en Hotel Acapulco (León, Gto.).\n' +
      'Llegada: ' + fmt(inD.value) + '\nSalida: ' + fmt(outD.value) + '\nHuéspedes: ' + g + (msg ? '\nMensaje: ' + msg : '');

    if (digits(cfg.whatsapp)) {
      status.textContent = 'Abriendo WhatsApp con tu consulta lista…';
      window.open(waUrl(text), '_blank', 'noopener');
    } else if (cfg.email && cfg.email.trim()) {
      status.textContent = 'Abriendo tu correo con la consulta lista…';
      location.href = 'mailto:' + cfg.email.trim() + '?subject=' + encodeURIComponent('Consulta de disponibilidad') + '&body=' + encodeURIComponent(text);
    } else {
      status.textContent = 'Abriendo WhatsApp: elige el contacto del hotel para enviar tu consulta.';
      window.open(waUrl(text), '_blank', 'noopener');
    }
  });

  applyMotion();
  onScroll();
})();
