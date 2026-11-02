// Interactive travel map: pan/zoom (buttons, drag, Ctrl/⌘+wheel, trackpad and touch pinch),
// endless horizontal scroll, constant-size pins, keyboard navigation.
window.initTravelMap = function () {
  const svg = document.querySelector('.travel-map');
  if (!svg) return;

  const W = 900, H = 450;          // viewBox size; world map fills it exactly
  const MIN_SCALE = 1, MAX_SCALE = 16, MARGIN = 30;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const world = svg.querySelector('.travel-map-world');
  const pointsLayer = svg.querySelector('.travel-map-points');
  const caption = document.querySelector('#travel-selection');

  // Tile the world image three times so horizontal scrolling feels endless.
  // The centre copy sits at x=0, left copy at x=-W, right copy at x=+W.
  const baseImg = world.querySelector('image');
  if (baseImg) {
    const leftImg  = baseImg.cloneNode(); leftImg.setAttribute('x', -W);
    const rightImg = baseImg.cloneNode(); rightImg.setAttribute('x',  W);
    world.prepend(leftImg);
    // All repeated land images must remain behind the marker layer.
    world.insertBefore(rightImg, pointsLayer);
  }

  let scale = 1, tx = 0, ty = 0;
  let pins = [];       // { place, node, ghost, x, y }
  let activePin = null;

  // Detect touch-only devices for larger pins.
  const isTouchPrimary = () => window.matchMedia('(pointer: coarse)').matches;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Wrap tx so it stays in (-W*scale, 0]: one world width of range.
  // The three tiled copies always cover the viewport within this range.
  function normTx(raw) {
    const period = W * scale;
    const wrapped = ((raw % period) + period) % period;
    return wrapped === 0 ? 0 : wrapped - period;
  }

  // ---- View transform -------------------------------------------------------

  let drawFrame = 0, lastPinScale = null, lastPinR = null;
  function draw() {
    if (drawFrame) return;
    drawFrame = requestAnimationFrame(() => { drawFrame = 0; drawNow(); });
  }

  function drawNow() {
    scale = clamp(scale, MIN_SCALE, MAX_SCALE);
    ty = clamp(ty, H * (1 - scale), 0);
    tx = normTx(tx);
    world.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);

    // Counter-scale pins for constant screen size; render canonical + ghost copy.
    const inverse = (1 / scale).toFixed(4);
    const pinR = isTouchPrimary() ? 1.6 : 1;   // scale up hit/halo/light radii on touch
    // Panning changes only the world transform. Recompute pin sizes only on zoom
    // or pointer-mode changes, rather than touching hundreds of nodes every move.
    if (scale !== lastPinScale || pinR !== lastPinR) {
    for (const pin of pins) {
      pin.node.setAttribute('transform',  `translate(${pin.x}     ${pin.y}) scale(${inverse})`);
      pin.ghost.setAttribute('transform', `translate(${pin.x + W} ${pin.y}) scale(${inverse})`);
      if (pinR !== pin._lastPinR) {
        pin._lastPinR = pinR;
        for (const [el, base] of [[pin.node, [7, 3.2, 1.3]], [pin.ghost, [7, 3.2, 1.3]]]) {
          el.querySelectorAll('circle').forEach((c, i) => c.setAttribute('r', base[i] * pinR));
        }
      }
    }
    lastPinScale = scale; lastPinR = pinR;
    }
    svg.classList.toggle('is-zoomed', scale > 1);
  }

  // ---- Coordinate helpers ---------------------------------------------------

  function toView(clientX, clientY) {
    const m = svg.getScreenCTM();
    return m ? new DOMPoint(clientX, clientY).matrixTransform(m.inverse()) : { x: W / 2, y: H / 2 };
  }

  function zoomAt(next, fx, fy) {
    const prev = scale;
    scale = clamp(next, MIN_SCALE, MAX_SCALE);
    tx = fx - (fx - tx) * scale / prev;
    ty = fy - (fy - ty) * scale / prev;
    draw();
  }

  // ---- Toolbar buttons ------------------------------------------------------

  document.querySelectorAll('[data-map-zoom]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.mapZoom;
    if (mode === 'reset') { scale = 1; tx = ty = 0; draw(); }
    else zoomAt(scale * (mode === 'in' ? 1.5 : 1 / 1.5), W / 2, H / 2);
  }));

  // ---- Wheel and trackpad pinch ---------------------------------------------

  svg.addEventListener('wheel', event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const lines = event.deltaMode === 1 ? 16 : 1;
    const delta = clamp(event.deltaY * lines, -40, 40);
    zoomAt(scale * Math.exp(-delta * 0.01), toView(event.clientX, event.clientY).x, toView(event.clientX, event.clientY).y);
  }, { passive: false });

  let gestureStartScale = 1;
  svg.addEventListener('gesturestart', event => { event.preventDefault(); gestureStartScale = scale; });
  svg.addEventListener('gesturechange', event => {
    event.preventDefault();
    const focus = toView(event.clientX, event.clientY);
    zoomAt(gestureStartScale * event.scale, focus.x, focus.y);
  });

  // ---- Drag and pinch -------------------------------------------------------

  const pointers = new Map();
  let gesture = null;

  function midpoint() {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  }

  function startGesture() {
    if (pointers.size === 1) {
      const [p] = pointers.values();
      gesture = { type: 'drag', x: p.x, y: p.y, tx, ty };
    } else if (pointers.size >= 2) {
      const mid = midpoint();
      gesture = { type: 'pinch', dist: mid.dist, focus: toView(mid.x, mid.y), scale, tx, ty };
    } else {
      gesture = null;
    }
  }

  svg.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('.travel-point') && pointers.size === 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    svg.setPointerCapture(event.pointerId);
    startGesture();
  });

  svg.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!gesture) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    if (gesture.type === 'drag') {
      tx = gesture.tx + (event.clientX - gesture.x) / matrix.a;
      ty = gesture.ty + (event.clientY - gesture.y) / matrix.d;
      draw();
    } else {
      const mid = midpoint();
      const now = toView(mid.x, mid.y);
      scale = clamp(gesture.scale * mid.dist / gesture.dist, MIN_SCALE, MAX_SCALE);
      tx = now.x - (gesture.focus.x - gesture.tx) / gesture.scale * scale;
      ty = now.y - (gesture.focus.y - gesture.ty) / gesture.scale * scale;
      draw();
    }
  });

  function endPointer(event) {
    if (!pointers.delete(event.pointerId)) return;
    startGesture();
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  // ---- Pins -----------------------------------------------------------------

  function locationLabel(place) {
    return [...new Set([place.name, place.country === 'United States' ? place.region : null, place.country].filter(Boolean))].join(', ');
  }

  function makeCircles(group) {
    for (const [r, cls] of [[7, 'point-hit'], [3.2, 'point-halo'], [1.3, 'point-light']]) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', r); c.setAttribute('class', cls); group.append(c);
    }
  }

  function choose(pin) {
    for (const other of pins) {
      const sel = other === pin;
      other.node.classList.toggle('is-selected', sel);
      other.node.setAttribute('aria-pressed', String(sel));
      other.ghost.classList.toggle('is-selected', sel);
    }
    caption.textContent = locationLabel(pin.place);
  }

  function setActive(pin) {
    activePin = pin;
    for (const other of pins) other.node.tabIndex = other === pin ? 0 : -1;
  }

  // Reveal the copy of pin that's closest to the viewport centre.
  function reveal(pin) {
    const sx  = tx + pin.x       * scale;
    const sxG = tx + (pin.x + W) * scale;
    const sy  = ty + pin.y       * scale;
    const targetX = Math.abs(sxG - W / 2) < Math.abs(sx - W / 2) ? sxG : sx;
    if (targetX < MARGIN)      tx += MARGIN - targetX;
    else if (targetX > W - MARGIN) tx -= targetX - (W - MARGIN);
    if (sy < MARGIN)           ty += MARGIN - sy;
    else if (sy > H - MARGIN)  ty -= sy - (H - MARGIN);
    draw();
  }

  function focusPin(pin) { setActive(pin); pin.node.focus({ preventScroll: true }); reveal(pin); }

  // Nearest pin in an arrow direction, considering wrapped positions too.
  function neighbor(from, key) {
    const [dx, dy] = { ArrowRight: [1,0], ArrowLeft: [-1,0], ArrowDown: [0,1], ArrowUp: [0,-1] }[key];
    let best = null, bestScore = Infinity;
    for (const pin of pins) {
      if (pin === from) continue;
      for (const ox of [0, W, -W]) {
        const vx = (pin.x + ox) - from.x, vy = pin.y - from.y;
        const along = vx * dx + vy * dy;
        if (along <= 0) continue;
        const score = along + 2 * Math.abs(vx * dy - vy * dx);
        if (score < bestScore) { best = pin; bestScore = score; }
      }
    }
    return best;
  }

  pointsLayer.addEventListener('keydown', event => {
    const node = event.target.closest('.travel-point');
    const index = pins.findIndex(p => p.node === node);
    if (index < 0) return;
    const pin = pins[index];
    let next = null;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(pin); return; }
    if (event.key.startsWith('Arrow')) next = neighbor(pin, event.key) || pin;
    else if (event.key === 'PageDown') next = pins[(index + 1) % pins.length];
    else if (event.key === 'PageUp')   next = pins[(index - 1 + pins.length) % pins.length];
    else if (event.key === 'Home')     next = pins[0];
    else if (event.key === 'End')      next = pins[pins.length - 1];
    else return;
    event.preventDefault();
    focusPin(next);
  });

  pointsLayer.addEventListener('focusin', event => {
    const pin = pins.find(p => p.node === event.target.closest('.travel-point'));
    if (pin && pin !== activePin) setActive(pin);
  });

  function createPin(place) {
    // Canonical interactive pin
    const node = document.createElementNS(SVG_NS, 'g');
    node.setAttribute('class', 'travel-point');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '-1');
    node.setAttribute('aria-label', locationLabel(place));
    node.setAttribute('aria-pressed', 'false');
    makeCircles(node);
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = locationLabel(place);
    node.append(title);

    // Ghost copy for the tiled world to the right (aria-hidden, same visual)
    const ghost = document.createElementNS(SVG_NS, 'g');
    ghost.setAttribute('class', 'travel-point');
    ghost.setAttribute('aria-hidden', 'true');
    makeCircles(ghost);

    const pin = { place, node, ghost, x: (place.lon + 180) * 2.5, y: (90 - place.lat) * 2.5, _lastPinR: null };
    node.addEventListener('click',  () => { setActive(pin); choose(pin); });
    ghost.addEventListener('click', () => { setActive(pin); choose(pin); });
    return pin;
  }

  // ---- Data -----------------------------------------------------------------

  fetch('assets/travel-places.json')
    .then(r => { if (!r.ok) throw Error(); return r.json(); })
    .then(places => {
      if (!svg.isConnected) return;
      document.querySelector('.travel-map-toolbar>span').textContent = `${places.length} places & counting`;
      pins = places.map(createPin);
      lastPinScale = null;
      pointsLayer.setAttribute('role', 'group');
      pointsLayer.setAttribute('aria-label', 'Places visited. Use arrow keys to move between places, Enter to select.');
      pointsLayer.append(...pins.map(p => p.node), ...pins.map(p => p.ghost));
      if (pins.length) setActive(pins[0]);
      draw();
    })
    .catch(() => { caption.textContent = "The travel map couldn't load. Please refresh to try again."; });
};
