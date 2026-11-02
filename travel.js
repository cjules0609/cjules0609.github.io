// Interactive travel map: pan/zoom (buttons, drag, Ctrl/⌘+wheel, trackpad and touch pinch),
// constant-size pins, and keyboard navigation with a single tab stop.
window.initTravelMap = function () {
  const svg = document.querySelector('.travel-map');
  if (!svg) return;

  const W = 900, H = 450;          // viewBox size; the world map image fills it exactly
  const MIN_SCALE = 1, MAX_SCALE = 8, MARGIN = 30;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const world = svg.querySelector('.travel-map-world');
  const pointsLayer = svg.querySelector('.travel-map-points');
  const caption = document.querySelector('#travel-selection');

  let scale = 1, tx = 0, ty = 0;
  let pins = [];                   // { place, node, x, y }
  let activePin = null;            // the pin that holds the roving tabindex

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // ---- View transform ------------------------------------------------------

  function draw() {
    scale = clamp(scale, MIN_SCALE, MAX_SCALE);
    // Keep the map covering the viewport: no panning past its edges.
    tx = clamp(tx, W * (1 - scale), 0);
    ty = clamp(ty, H * (1 - scale), 0);
    world.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
    // Counter-scale each pin so it keeps the same on-screen size at every zoom level.
    const inverse = (1 / scale).toFixed(4);
    for (const pin of pins) pin.node.setAttribute('transform', `translate(${pin.x} ${pin.y}) scale(${inverse})`);
    // Let touch drags pan the map only once zoomed; at 1× the page can still scroll over it.
    svg.classList.toggle('is-zoomed', scale > 1);
  }

  // Client (screen) coordinates -> viewBox coordinates, accounting for letterboxing.
  function toView(clientX, clientY) {
    const matrix = svg.getScreenCTM();
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : { x: W / 2, y: H / 2 };
  }

  // Zoom to `next`, keeping the viewBox point (fx, fy) fixed on screen.
  function zoomAt(next, fx, fy) {
    const previous = scale;
    scale = clamp(next, MIN_SCALE, MAX_SCALE);
    tx = fx - (fx - tx) * scale / previous;
    ty = fy - (fy - ty) * scale / previous;
    draw();
  }

  document.querySelectorAll('[data-map-zoom]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.mapZoom;
    if (mode === 'reset') { scale = 1; tx = ty = 0; draw(); }
    else zoomAt(scale * (mode === 'in' ? 1.5 : 1 / 1.5), W / 2, H / 2);
  }));

  // ---- Wheel and trackpad pinch -------------------------------------------
  // Plain scrolling still scrolls the page; Ctrl/⌘ + wheel zooms. Browsers report a
  // trackpad pinch as a wheel event with ctrlKey set.
  svg.addEventListener('wheel', event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const lines = event.deltaMode === 1 ? 16 : 1;
    const delta = clamp(event.deltaY * lines, -40, 40);
    const focus = toView(event.clientX, event.clientY);
    zoomAt(scale * Math.exp(-delta * 0.01), focus.x, focus.y);
  }, { passive: false });

  // Safari reports trackpad pinch as gesture events instead.
  let gestureStartScale = 1;
  svg.addEventListener('gesturestart', event => { event.preventDefault(); gestureStartScale = scale; });
  svg.addEventListener('gesturechange', event => {
    event.preventDefault();
    const focus = toView(event.clientX, event.clientY);
    zoomAt(gestureStartScale * event.scale, focus.x, focus.y);
  });

  // ---- Drag (one pointer) and pinch (two pointers) -------------------------

  const pointers = new Map();
  let gesture = null;

  function midpoint() {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  }

  // (Re)base the gesture on whichever pointers are currently down.
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
    // A press on a pin is a selection, not the start of a drag (unless a second finger joins).
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
      // Keep the map point that was under the starting midpoint under the current one.
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

  // ---- Pins: selection and keyboard navigation -----------------------------

  function locationLabel(place) {
    return [...new Set([place.name, place.country === 'United States' ? place.region : null, place.country].filter(Boolean))].join(', ');
  }

  function choose(pin) {
    for (const other of pins) {
      const selected = other === pin;
      other.node.classList.toggle('is-selected', selected);
      other.node.setAttribute('aria-pressed', String(selected));
    }
    caption.textContent = locationLabel(pin.place);
  }

  // Roving tabindex: exactly one pin is in the tab order, so Tab passes over the other 75.
  function setActive(pin) {
    activePin = pin;
    for (const other of pins) other.node.tabIndex = other === pin ? 0 : -1;
  }

  // Pan just enough to bring a keyboard-focused pin into view.
  function reveal(pin) {
    const sx = tx + pin.x * scale, sy = ty + pin.y * scale;
    if (sx < MARGIN) tx += MARGIN - sx; else if (sx > W - MARGIN) tx -= sx - (W - MARGIN);
    if (sy < MARGIN) ty += MARGIN - sy; else if (sy > H - MARGIN) ty -= sy - (H - MARGIN);
    draw();
  }

  function focusPin(pin) {
    setActive(pin);
    pin.node.focus({ preventScroll: true });
    reveal(pin);
  }

  // Nearest pin in an arrow-key direction, favouring pins that lie close to that axis.
  function neighbor(from, key) {
    const [dx, dy] = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
    let best = null, bestScore = Infinity;
    for (const pin of pins) {
      if (pin === from) continue;
      const vx = pin.x - from.x, vy = pin.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 0) continue;
      const score = along + 2 * Math.abs(vx * dy - vy * dx);
      if (score < bestScore) { best = pin; bestScore = score; }
    }
    return best;
  }

  pointsLayer.addEventListener('keydown', event => {
    const node = event.target.closest('.travel-point');
    const index = pins.findIndex(pin => pin.node === node);
    if (index < 0) return;
    const pin = pins[index];
    let next = null;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(pin); return; }
    if (event.key.startsWith('Arrow')) next = neighbor(pin, event.key) || pin;
    else if (event.key === 'PageDown') next = pins[(index + 1) % pins.length];
    else if (event.key === 'PageUp') next = pins[(index - 1 + pins.length) % pins.length];
    else if (event.key === 'Home') next = pins[0];
    else if (event.key === 'End') next = pins[pins.length - 1];
    else return;
    event.preventDefault();
    focusPin(next);
  });

  // Keep the roving tabindex in step with focus and clicks.
  pointsLayer.addEventListener('focusin', event => {
    const pin = pins.find(item => item.node === event.target.closest('.travel-point'));
    if (pin && pin !== activePin) setActive(pin);
  });

  function createPin(place) {
    const node = document.createElementNS(SVG_NS, 'g');
    node.setAttribute('class', 'travel-point');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '-1');
    node.setAttribute('aria-label', locationLabel(place));
    node.setAttribute('aria-pressed', 'false');
    for (const [radius, className] of [[7, 'point-hit'], [3.2, 'point-halo'], [1.3, 'point-light']]) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('r', radius);
      circle.setAttribute('class', className);
      node.append(circle);
    }
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = locationLabel(place);
    node.append(title);
    const pin = { place, node, x: (place.lon + 180) * 2.5, y: (90 - place.lat) * 2.5 };
    node.addEventListener('click', () => { setActive(pin); choose(pin); });
    return pin;
  }

  // ---- Data ----------------------------------------------------------------

  fetch('assets/travel-places.json')
    .then(response => { if (!response.ok) throw Error('Map data unavailable'); return response.json(); })
    .then(places => {
      if (!svg.isConnected) return;   // the visitor navigated away while loading
      document.querySelector('.travel-map-toolbar>span').textContent = `${places.length} places & counting`;
      pins = places.map(createPin);
      pointsLayer.setAttribute('role', 'group');
      pointsLayer.setAttribute('aria-label', 'Places visited. Use the arrow keys to move between places, and Enter to select one.');
      pointsLayer.append(...pins.map(pin => pin.node));
      if (pins.length) setActive(pins[0]);
      draw();
    })
    .catch(() => { caption.textContent = 'The travel map couldn’t load. Please refresh to try again.'; });
};
