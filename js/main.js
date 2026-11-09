/* Recortados · navegación por páginas, banner, carrito y factura */
(function () {
  'use strict';

  /* ======================= Datos ======================= */

  // Salario mínimo mensual de referencia (COP). Cambiar aquí si se ajusta.
  var SMMLV = 2000000;
  var TOTAL = 12152715; // suma de promedios anuales, 25 respuestas válidas
  var MEDIANA = 10270000;
  var N = 25;

  var ICONS = {
    bus: '<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16"/><path d="M8 18v3M16 18v3"/><circle cx="8" cy="14.5" r="1"/><circle cx="16" cy="14.5" r="1"/>',
    club: '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-6h4v6"/>',
    food: '<path d="M12 7c-3-2-7 0-7 5s3 9 5 9c1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-9s-4-7-7-5z"/><path d="M12 7c0-2 1-4 3-4"/>',
    health: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M6 12h3l1.5-3 3 6 1.5-3h3"/>',
    coach: '<circle cx="12" cy="6" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M16 11l3 2"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    leotard: '<path d="M8 3c0 2 1.8 3 4 3s4-1 4-3"/><path d="M8 3 5 5l1 6 2 1v4l4 5 4-5v-4l2-1 1-6-3-2"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h3"/>'
  };

  var RUBROS = [
    { id: 'transporte', name: 'Transporte', short: 'TRANSPORTE', amount: 2929440, pct: 24.1, color: 'var(--red)', icon: 'bus' },
    { id: 'mensualidad', name: 'Mensualidad al club o liga', short: 'MENSUALIDAD', amount: 2476800, pct: 20.4, color: 'var(--orange)', icon: 'club' },
    { id: 'alimentacion', name: 'Alimentación y suplementos', short: 'ALIMENTACIÓN', amount: 1579200, pct: 13.0, color: 'var(--lime)', icon: 'food' },
    { id: 'salud', name: 'Salud y exámenes médicos', short: 'SALUD', amount: 1404004, pct: 11.6, color: 'var(--teal)', icon: 'health' },
    { id: 'entrenador', name: 'Entrenador y otros gastos', short: 'ENTRENADOR Y OTROS', amount: 1401619, pct: 11.5, color: 'var(--blue)', icon: 'coach' },
    { id: 'viajes', name: 'Viajes y hospedaje', short: 'VIAJES Y HOSPEDAJE', amount: 1142000, pct: 9.4, color: '#E8738A', icon: 'plane' },
    { id: 'uniformes', name: 'Uniformes e implementos', short: 'UNIFORMES', amount: 668800, pct: 5.5, color: 'var(--orange)', icon: 'leotard', belief: true },
    { id: 'inscripciones', name: 'Inscripciones y carné', short: 'INSCRIPCIONES', amount: 550852, pct: 4.5, color: 'var(--teal)', icon: 'card' }
  ];

  // Encuesta: una respuesta por caso válido (horas por semana, gasto anual, afiliada a liga). Sin datos de ubicación.
  var CASOS = [[3,1150000,0],[3,2800000,0],[3,4760000,1],[3,5000000,1],[3,5970000,0],[3,6830000,0],[4,5000000,0],[4,11670000,0],[5,5190000,0],[6,2840001,0],[6,3190000,0],[6,4900000,0],[8,6750000,1],[8,11350000,1],[8,13020000,0],[8,18090400,1],[10,10270000,1],[10,15230000,1],[12,10536480,1],[18,22700000,1],[20,25730000,1],[20,25920000,1],[22,33800999,1],[30,11720000,1],[30,39400000,1]];

  // Medianas por grupo (encuesta, n = 25: 14 afiliadas a liga, 11 no afiliadas)
  var GRUPOS = [
    { label: 'Gasto anual', a: 13475000, n: 5000000, fmt: 'm' },
    { label: 'Gasto mensual recurrente', a: 745000, n: 350000, fmt: 'm' },
    { label: 'Mensualidad', a: 390000, n: 0, fmt: 'm' },
    { label: 'Viajes al año', a: 1500000, n: 0, fmt: 'm' },
    { label: 'Horas por semana', a: 11, n: 4, fmt: 'h' }
  ];
  // Desglose: cada pregunta de la encuesta que compone el rubro (promedio anual; mensuales × 12)
  var PARTES = {
    transporte: [['A entrenamientos y competencias', 'mensual', 2929440]],
    mensualidad: [['Al club o la liga', 'mensual', 2476800]],
    alimentacion: [['Especializada o suplementos', 'mensual', 1579200]],
    salud: [['Médicos, fisioterapia o seguro', 'mensual', 1224000], ['Exámenes y valoraciones', 'anual', 180004]],
    entrenador: [['Entrenador o clases particulares', 'mensual', 259200], ['Otros gastos del deporte', 'mensual', 1142419]],
    viajes: [['Viajes y hospedaje por competencias', 'anual', 1142000]],
    uniformes: [['Uniformes y ropa deportiva', 'anual', 373200], ['Implementos y equipamiento', 'anual', 295600]],
    inscripciones: [['Inscripciones a torneos', 'anual', 442812], ['Afiliación anual a liga o club', 'anual', 102040], ['Carné o licencia deportiva', 'anual', 6000]]
  };
  // Apoyos que declaran recibir las familias, promediados entre todas (incluye las que reciben $0)
  var APOYO = 146400;

  var byId = {};
  RUBROS.forEach(function (r) { byId[r.id] = r; });

  var SCREENS = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'gasto', label: 'El gasto' },
    { id: 'deportistas', label: 'La deportista' },
    { id: 'tiempo', label: 'Costo vs. tiempo' },
    { id: 'ayuda', label: '¿Quién ayuda?' },
    { id: 'factura', label: 'La factura' },
    { id: 'metodologia', label: 'Cómo lo calculamos' }
  ];

  /* ======================= Utilidades ======================= */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function money(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }
  function dec(n, d) { return n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function svg(name, size) {
    return '<svg width="' + (size || 26) + '" height="' + (size || 26) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  function storeGet(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function storeSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }

  /* ======================= Navegación por páginas ======================= */

  var screens = {};
  $$('[data-screen]').forEach(function (el) { screens[el.dataset.screen] = el; });

  // Botonera inferior en cada página (menos el inicio)
  SCREENS.forEach(function (s, i) {
    if (i === 0) return;
    var prev = SCREENS[i - 1];
    var next = SCREENS[i + 1];
    var steps = SCREENS.slice(1).map(function (st, j) {
      var cls = j + 1 < i ? ' class="is-done"' : '';
      var cur = j + 1 === i ? ' aria-current="step"' : '';
      return '<li><a href="#' + st.id + '"' + cls + cur + ' aria-label="' + st.label + '"></a></li>';
    }).join('');
    var nav = document.createElement('nav');
    nav.className = 'pager';
    nav.setAttribute('aria-label', 'Recorrido');
    nav.innerHTML =
      '<div class="pager__inner">' +
        '<a class="pager__btn pager__btn--prev" href="#' + prev.id + '">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>' +
          '<span><small>Anterior</small><span class="pager__label">' + prev.label + '</span></span></a>' +
        '<ol class="pager__steps">' + steps + '</ol>' +
        (next
          ? '<a class="pager__btn pager__btn--next" href="#' + next.id + '"><span><small>Siguiente</small><span class="pager__label">' + next.label + '</span></span>' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></a>'
          : '<a class="pager__btn pager__btn--next" href="#inicio"><span><small>Volver</small><span class="pager__label">Al inicio</span></span></a>') +
      '</div>';
    screens[s.id].appendChild(nav);
  });

  var current = null;
  function indexOf(id) { for (var i = 0; i < SCREENS.length; i++) if (SCREENS[i].id === id) return i; return -1; }

  function show(id) {
    if (!screens[id]) id = 'inicio';
    if (id === current) return;
    var back = current && indexOf(id) < indexOf(current);
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== id; });
    var el = screens[id];
    el.classList.remove('is-entering', 'from-left');
    void el.offsetWidth;
    el.classList.add('is-entering');
    if (back) el.classList.add('from-left');
    document.body.dataset.current = id;
    var first = current === null;
    current = id;
    window.scrollTo(0, 0);
    var h = $('h1, h2', el);
    if (h && !first) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    var label = SCREENS[indexOf(id)].label;
    document.title = id === 'inicio'
      ? 'Recortados · ¿Cuánto cuesta ser gimnasta en Medellín?'
      : label + ' · Recortados';
    banner.setActive(id === 'inicio');
    if (id === 'factura') renderFactura(true);
    if (id === 'tiempo') renderScatter();
    hideTip();
  }

  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });

  /* ======================= Banner deslizante ======================= */

  var banner = (function () {
    var root = $('.banner');
    var track = $('.banner__track', root);
    var slides = $$('.banner__slide', root);
    var dotsWrap = $('.banner__dots', root);
    var toggleBtn = $('[data-banner="toggle"]', root);
    var DUR = 5500;
    var i = 0, timer = null, userPaused = reduceMotion, hover = false, active = false;
    root.style.setProperty('--dur', DUR + 'ms');

    var dots = slides.map(function (_, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Lámina ' + (n + 1));
      b.addEventListener('click', function () { go(n); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      slides.forEach(function (s, n) { s.setAttribute('aria-hidden', String(n !== i)); });
      dots.forEach(function (d, n) {
        d.removeAttribute('aria-current');
        if (n === i) { void d.offsetWidth; d.setAttribute('aria-current', 'true'); }
      });
    }
    function schedule() {
      clearTimeout(timer);
      var paused = userPaused || hover || !active;
      root.classList.toggle('is-paused', paused);
      if (!paused) timer = setTimeout(function () { go(i + 1); }, DUR);
    }
    function go(n) {
      i = (n + slides.length) % slides.length;
      render();
      schedule();
    }

    $('[data-banner="prev"]', root).addEventListener('click', function () { go(i - 1); });
    $('[data-banner="next"]', root).addEventListener('click', function () { go(i + 1); });
    toggleBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      toggleBtn.textContent = userPaused ? 'Reproducir' : 'Pausar';
      toggleBtn.setAttribute('aria-pressed', String(userPaused));
      go(i);
    });
    toggleBtn.textContent = userPaused ? 'Reproducir' : 'Pausar';
    toggleBtn.setAttribute('aria-pressed', String(userPaused));

    var vp = $('.banner__viewport', root);
    vp.addEventListener('mouseenter', function () { hover = true; schedule(); });
    vp.addEventListener('mouseleave', function () { hover = false; go(i); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    });

    // Deslizar con el dedo
    var startX = null;
    vp.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    vp.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    });

    render();
    return {
      setActive: function (on) { active = on; schedule(); }
    };
  })();

  /* ======================= Carrito ======================= */

  var cart = (storeGet('recortados-carrito') || []).filter(function (id) { return byId[id]; });

  function cartTotal() { return cart.reduce(function (s, id) { return s + byId[id].amount; }, 0); }
  function inCart(id) { return cart.indexOf(id) !== -1; }

  function add(id) {
    if (inCart(id)) return;
    cart.push(id);
    cart.sort(function (a, b) { return byId[b].amount - byId[a].amount; });
    commit(id);
  }
  function remove(id) {
    cart = cart.filter(function (x) { return x !== id; });
    commit();
  }
  function commit(addedId) {
    storeSet('recortados-carrito', cart);
    renderCart(addedId);
    renderFactura(false);
    var chip = $('.bill-chip');
    chip.classList.remove('is-bump');
    void chip.offsetWidth;
    chip.classList.add('is-bump');
  }

  // Estantería
  var productsEl = $('[data-products]');
  productsEl.innerHTML = RUBROS.map(function (r) {
    return '<li class="product" draggable="true" data-id="' + r.id + '">' +
      (r.belief ? '<span class="product__belief">El que creen que más pesa</span>' : '') +
      '<span class="product__icon" style="--c: ' + r.color + '">' + svg(r.icon) + '</span>' +
      '<span class="product__name">' + r.name + '</span>' +
      '<span class="product__price">' + money(r.amount) + '<small>al año · ' + dec(r.pct, 1) + ' % del gasto</small></span>' +
      '<button class="btn btn--navy btn--sm product__btn" type="button" data-toggle="' + r.id + '"></button>' +
    '</li>';
  }).join('');

  productsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-toggle]');
    if (!b) return;
    var id = b.dataset.toggle;
    if (inCart(id)) remove(id); else add(id);
  });

  // Arrastrar y soltar
  var dropzone = $('[data-dropzone]');
  productsEl.addEventListener('dragstart', function (e) {
    var p = e.target.closest('.product');
    if (!p) return;
    e.dataTransfer.setData('text/plain', p.dataset.id);
    e.dataTransfer.effectAllowed = 'copy';
    p.classList.add('is-dragging');
  });
  productsEl.addEventListener('dragend', function (e) {
    var p = e.target.closest('.product');
    if (p) p.classList.remove('is-dragging');
    dropzone.classList.remove('is-over');
  });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; dropzone.classList.add('is-over'); });
  dropzone.addEventListener('dragleave', function (e) { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('is-over'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('is-over');
    var id = e.dataTransfer.getData('text/plain');
    if (byId[id]) add(id);
  });

  $('[data-cart="all"]').addEventListener('click', function () {
    cart = RUBROS.map(function (r) { return r.id; });
    commit();
  });
  $('[data-cart="clear"]').addEventListener('click', function () { cart = []; commit(); });
  $('[data-cart-items]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]');
    if (b) remove(b.dataset.remove);
  });

  function renderCart(addedId) {
    var total = cartTotal();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = cart.length; });
    $$('[data-cart-total]').forEach(function (el) { el.textContent = money(total); });
    $('[data-cart-share]').textContent = dec(total / TOTAL * 100, 1) + ' %';
    $('[data-cart-smmlv]').textContent = dec(total / SMMLV, 2) + ' salarios mínimos';
    $('[data-cart-empty]').hidden = cart.length > 0;

    $('[data-cart-items]').innerHTML = cart.map(function (id) {
      var r = byId[id];
      return '<li class="cart-item" style="--c: ' + r.color + (id === addedId ? '' : '; animation: none') + '">' +
        '<span class="cart-item__dot"></span>' +
        '<span class="cart-item__name">' + r.name + '<span class="cart-item__pct">' + dec(r.pct, 1) + ' % del gasto · ' + dec(r.amount / SMMLV, 2) + ' sal. mín.</span></span>' +
        '<span class="cart-item__value">' + money(r.amount) + '</span>' +
        '<button class="cart-item__remove" type="button" data-remove="' + id + '" aria-label="Quitar ' + r.name + '">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</li>';
    }).join('');

    $('[data-cart-stack]').innerHTML = cart.map(function (id) {
      return '<span style="--c: ' + byId[id].color + '; width: ' + (byId[id].amount / TOTAL * 100) + '%"></span>';
    }).join('');

    $$('.product').forEach(function (p) {
      var on = inCart(p.dataset.id);
      p.classList.toggle('is-in', on);
      var b = $('.product__btn', p);
      var r = byId[p.dataset.id];
      b.textContent = on ? '− Quitar' : '+ Agregar';
      b.setAttribute('aria-label', (on ? 'Quitar del carrito: ' : 'Agregar al carrito: ') + r.name);
    });
  }

  /* ======================= Factura ======================= */

  var MAX_SMMLV = 1.7; // escala de las barras frente al salario mínimo
  $('[data-smmlv-total]').textContent = dec(TOTAL / SMMLV, 1);
  $('[data-smmlv-value]').textContent = money(SMMLV);
  $$('[data-mediana]').forEach(function (el) { el.textContent = money(MEDIANA); });
  $$('[data-total]').forEach(function (el) { el.textContent = money(TOTAL); });

  function renderFactura(animate) {
    var partial = cart.length > 0 && cart.length < RUBROS.length;
    var shown = cart.length ? cartTotal() : TOTAL;

    var row = function (cls, label, amount, pctBase) {
      return '<tr class="' + cls + '"><th scope="row">' + label + '</th>' +
        '<td>' + (amount < 0 ? '−' + money(-amount) : money(amount)) + '</td>' +
        '<td>' + dec(Math.abs(amount) / pctBase * 100, 1) + '</td>' +
        '<td>' + dec(Math.abs(amount) / SMMLV, 2) + '</td></tr>';
    };
    $('[data-receipt-lines]').innerHTML = RUBROS.map(function (r) {
      var out = partial && !inCart(r.id);
      var head = row('bill__rubro' + (out ? ' is-out' : ''),
        '<a href="#gasto">' + r.name.toUpperCase() + '</a>' + (out ? '<span class="bill__out">FUERA DEL CARRITO</span>' : ''), r.amount, TOTAL);
      var parts = PARTES[r.id].map(function (p) {
        return '<tr class="bill__part' + (out ? ' is-out' : '') + '"><th scope="row">' + p[0] +
          '<span class="bill__freq">' + (p[1] === 'mensual' ? 'MENSUAL × 12' : 'ANUAL') + '</span></th>' +
          '<td>' + money(p[2]) + '</td><td></td><td></td></tr>';
      }).join('');
      return head + parts;
    }).join('');

    var totals;
    if (partial) {
      totals = row('bill__grand', 'TOTAL DE TU CARRITO', cartTotal(), TOTAL);
    } else {
      totals = row('bill__sub', 'SUBTOTAL GASTOS', TOTAL, TOTAL) +
        row('bill__minus', '(−) APOYOS RECIBIDOS <a href="#ayuda" class="bill__note">PROMEDIO POR FAMILIA</a>', -APOYO, TOTAL) +
        row('bill__grand', 'TOTAL A CARGO DE LA FAMILIA', TOTAL - APOYO, TOTAL);
    }
    $('[data-receipt-totals]').innerHTML = totals;

    var status = $('[data-cart-status]');
    if (!cart.length) {
      status.innerHTML = '<span>Aún no armas tu carrito. Esta es la factura promedio completa.</span><a href="#gasto">Ir a El gasto →</a>';
    } else if (partial) {
      status.innerHTML = '<span>Tu carrito lleva <strong>' + cart.length + ' de 8</strong> rubros: <strong>' + money(cartTotal()) + '</strong>, ' + dec(cartTotal() / SMMLV, 1) + ' salarios mínimos.</span><a href="#gasto">Completar el carrito →</a>';
    } else {
      status.innerHTML = '<span>Tu carrito está completo: <strong>' + money(TOTAL) + '</strong> al año.</span>';
    }

    var wrap = $('[data-wage-bars]');
    wrap.innerHTML = RUBROS.map(function (r) {
      var x = r.amount / SMMLV;
      var out = partial && !inCart(r.id);
      return '<li class="wage-bar' + (out ? ' is-out' : '') + '"><a href="#gasto">' +
        '<span class="wage-bar__top"><span>' + r.name + '</span><span>' + dec(x, 2) + ' × SMMLV</span></span>' +
        '<span class="wage-bar__track" style="--one: ' + (100 / MAX_SMMLV) + '%"><span class="wage-bar__fill" style="--c: ' + r.color + '" data-w="' + (x / MAX_SMMLV * 100) + '%"></span></span>' +
      '</a></li>';
    }).join('') + '<li class="wage-legend">- - -  1 salario mínimo (' + money(SMMLV) + ')</li>';

    var fills = $$('.wage-bar__fill', wrap);
    var apply = function () { fills.forEach(function (f) { f.style.width = f.dataset.w; }); };
    if (animate && !reduceMotion) requestAnimationFrame(function () { requestAnimationFrame(apply); });
    else apply();
  }

  /* ======================= Costo vs. tiempo: gráficas ======================= */

  function millones(n) { return '$' + dec(n / 1e6, 1) + ' M'; }

  // Tooltip compartido
  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  document.body.appendChild(tip);
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8);
    var top = y - h - 14;
    if (top < 8) top = y + 18;
    tip.style.transform = 'translate(' + left + 'px,' + top + 'px)';
  }
  function hideTip() { tip.hidden = true; }

  function renderScatter() {
    var host = $('[data-chart="scatter"]');
    if (!host || !host.clientWidth) return;
    var W = Math.round(host.clientWidth), H = W < 480 ? 300 : 360, m = { t: 16, r: 14, b: 44, l: 48 };
    if (host.dataset.w === String(W)) return;
    host.dataset.w = W;
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var XMAX = 32, YMAX = 42e6;
    var sx = function (v) { return m.l + v / XMAX * iw; };
    var sy = function (v) { return m.t + ih - v / YMAX * ih; };
    var g = '';
    [0, 10e6, 20e6, 30e6, 40e6].forEach(function (v) {
      g += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + sy(v) + '" y2="' + sy(v) + '"/>' +
        '<text class="tick" x="' + (m.l - 8) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + (v / 1e6) + ' M</text>';
    });
    [0, 5, 10, 15, 20, 25, 30].forEach(function (v) {
      g += '<text class="tick" x="' + sx(v) + '" y="' + (H - m.b + 20) + '" text-anchor="middle">' + v + '</text>';
    });
    g += '<line class="axis" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>';
    g += '<text class="axis-title" x="' + (m.l + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Horas de entrenamiento por semana</text>';
    // Referencia: un año de salario mínimo
    var yr = SMMLV * 12;
    g += '<line class="ref" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + sy(yr) + '" y2="' + sy(yr) + '"/>' +
      '<text class="ref-label" x="' + (m.l + 4) + '" y="' + (sy(yr) - 7) + '">' + (W < 480 ? '1 año de sal. mín.' : 'Un año de salario mínimo: ' + millones(yr)) + '</text>';
    // Puntos: las no afiliadas primero, para que las afiliadas (relleno) queden encima
    var order = CASOS.map(function (c, i) { return i; }).sort(function (a, b) { return CASOS[a][2] - CASOS[b][2]; });
    order.forEach(function (i) {
      var c = CASOS[i];
      var cx = sx(c[0]), cy = sy(c[1]);
      var label = c[0] + ' horas por semana, ' + money(c[1]) + ' al año, ' + (c[2] ? 'afiliada a liga' : 'no afiliada');
      g += '<g class="pt ' + (c[2] ? 'pt--a' : 'pt--n') + '" tabindex="0" role="img" aria-label="' + label + '" data-i="' + i + '">' +
        '<circle class="pt__hit" cx="' + cx + '" cy="' + cy + '" r="13"/>' +
        '<circle class="pt__dot" cx="' + cx + '" cy="' + cy + '" r="6.5"/></g>';
    });
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Dispersión: horas de entrenamiento por semana frente a gasto anual, 26 casos">' + g + '</svg>';

    var over = function (e) {
      var p = e.target.closest('.pt');
      if (!p) return;
      var c = CASOS[+p.dataset.i];
      var r = p.querySelector('.pt__dot').getBoundingClientRect();
      showTip('<strong>' + money(c[1]) + '</strong> al año<br>' + c[0] + ' h por semana · ' + (c[2] ? 'afiliada a liga' : 'no afiliada'), r.left + r.width / 2, r.top);
    };
    if (!host.dataset.bound) {
      host.dataset.bound = '1';
      host.addEventListener('mouseover', over);
      host.addEventListener('focusin', over);
      host.addEventListener('mouseleave', hideTip);
      host.addEventListener('focusout', hideTip);
    }
  }
  var resizeT;
  window.addEventListener('resize', function () {
    hideTip();
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { if (current === 'tiempo') renderScatter(); }, 120);
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  function renderGroups() {
    var host = $('[data-chart="groups"]');
    if (!host) return;
    host.innerHTML = GRUPOS.map(function (r) {
      var max = Math.max(r.a, r.n) || 1;
      var f = function (v) { return r.fmt === 'h' ? v + ' h' : (v >= 1e6 ? millones(v) : money(v)); };
      var bar = function (cls, v, who) {
        return '<div class="pair__bar ' + cls + '"><span class="pair__track"><span class="pair__fill" style="width:' + (v / max * 100) + '%"></span></span>' +
          '<span class="pair__val">' + (v === 0 ? '$0' : f(v)) + '<span class="sr-only"> · ' + who + '</span></span></div>';
      };
      return '<div class="pair"><span class="pair__label">' + r.label + '</span>' +
        bar('pair__bar--a', r.a, 'afiliadas a liga') + bar('pair__bar--n', r.n, 'no afiliadas') + '</div>';
    }).join('');
  }

  // Horas por semana de cada deportista, por grupo (encuesta, n = 26)
  var ETAPAS = [
    { label: 'Formativa, fuera de liga', n: 11, h: [3, 3, 3, 3, 4, 4, 5, 6, 6, 6, 8], c: 'var(--blue)' },
    { label: 'Formativa, en la Liga', n: 10, h: [3, 8, 8, 10, 18, 20, 20, 22, 30, 30], c: 'var(--red-ink)' },
    { label: 'Juvenil y mayores', n: 4, h: [3, 8, 10, 12], c: 'var(--navy)' }
  ];
  function renderStrip() {
    var host = $('[data-chart="strip"]');
    if (!host) return;
    var MAX = 32;
    var ticks = [0, 5, 10, 15, 20, 25, 30].map(function (t) {
      return '<span class="strip__tick" style="left:' + (t / MAX * 100) + '%">' + t + '</span>';
    }).join('');
    host.innerHTML = ETAPAS.map(function (e) {
      var med = e.h.length % 2 ? e.h[(e.h.length - 1) / 2] : (e.h[e.h.length / 2 - 1] + e.h[e.h.length / 2]) / 2;
      var seen = {};
      var dots = e.h.map(function (v) {
        var k = seen[v] = (seen[v] || 0) + 1; // apila repetidos hacia arriba
        return '<span class="strip__dot" style="left:' + (v / MAX * 100) + '%; --k:' + (k - 1) + '; --c:' + e.c + '" title="' + v + ' h por semana"></span>';
      }).join('');
      return '<div class="strip__row">' +
        '<span class="strip__label">' + e.label + '<small>' + e.n + ' respuestas</small></span>' +
        '<div class="strip__track" role="img" aria-label="' + e.label + ': mediana de ' + dec(med, 0) + ' horas por semana, de ' + e.h[0] + ' a ' + e.h[e.h.length - 1] + '">' +
          '<span class="strip__range" style="left:' + (e.h[0] / MAX * 100) + '%; width:' + ((e.h[e.h.length - 1] - e.h[0]) / MAX * 100) + '%"></span>' +
          dots +
          '<span class="strip__median" style="left:' + (med / MAX * 100) + '%"><b>' + dec(med, 0) + ' h</b></span>' +
        '</div></div>';
    }).join('') +
    '<div class="strip__row strip__row--axis" aria-hidden="true"><span></span><div class="strip__axis">' + ticks + '</div></div>' +
    '<div class="strip__row strip__row--axis" aria-hidden="true"><span></span><span class="strip__axis-title">Horas de entrenamiento por semana</span></div>';
  }

  renderStrip();
  renderScatter();
  renderGroups();

  /* ======================= Reel de YouTube ======================= */

  // Para activar el video: poner el enlace o el ID en data-youtube del <figure class="reel">.
  $$('.reel[data-youtube]').forEach(function (fig) {
    var v = (fig.dataset.youtube || '').trim();
    if (!v) return;
    var m = v.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    var id = m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : null);
    if (!id) return;
    $('[data-reel-frame]', fig).innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0&playsinline=1" title="Entrevista con Salomé Ricaurte" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  });

  /* ======================= Descargas ======================= */

  function downloadData() {
    var rows = [['rubro', 'concepto', 'frecuencia_declarada', 'promedio_anual_cop', 'porcentaje_del_gasto', 'salarios_minimos']];
    var line = function (a, b, f, v) { rows.push([a, b, f, v, (v / TOTAL * 100).toFixed(1), (v / SMMLV).toFixed(2)]); };
    RUBROS.forEach(function (r) {
      line(r.name, 'Total del rubro', '', r.amount);
      PARTES[r.id].forEach(function (p) { line(r.name, p[0], p[1], p[2]); });
    });
    line('Subtotal gastos', '', '', TOTAL);
    line('Apoyos recibidos (promedio por familia)', '', 'anual', -APOYO);
    line('Total a cargo de la familia', '', '', TOTAL - APOYO);
    rows.push(['Mediana del gasto anual', '', '', MEDIANA, '', '']);
    rows.push(['Salario mínimo mensual de referencia', '', '', SMMLV, '', '1.00']);
    var csv = rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    var url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'recortados-gasto-por-rubro.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function printReceipt() {
    // El navegador usa el título del documento como nombre predeterminado del PDF
    var prevTitle = document.title;
    document.title = 'PDF';

    // Ajuste a una sola página: mide el recibo al ancho de impresión y calcula la escala.
    // Presupuesto conservador: 700 × 780 px deja holgura en carta y A4 aunque el navegador
    // agregue sus propios márgenes, encabezado o pie de página. Incluye hasta la nota final.
    var PRINT_W = 700, PRINT_H = 780;
    var rec = $('#recibo');
    var actions = $('.receipt__actions', rec);
    rec.style.width = PRINT_W + 'px';
    var gap = parseFloat(getComputedStyle(rec).rowGap) || 0;
    var h = rec.scrollHeight - (actions ? actions.offsetHeight + gap : 0);
    rec.style.width = '';
    var root = document.documentElement;
    root.style.setProperty('--print-w', PRINT_W + 'px');
    root.style.setProperty('--print-scale', String(Math.min(1, PRINT_H / h)));

    document.body.classList.add('print-receipt');
    var done = function () {
      document.body.classList.remove('print-receipt');
      document.title = prevTitle;
      root.style.removeProperty('--print-scale');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b) return;
    if (b.dataset.action === 'download-data') downloadData();
    if (b.dataset.action === 'print-receipt') printReceipt();
  });

  /* ======================= Arranque ======================= */

  renderCart();
  renderFactura(false);
  show(location.hash.slice(1) || 'inicio');
})();
