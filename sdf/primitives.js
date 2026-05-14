export function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

export function sdCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy) - r;
}

export function sdBox(px, py, cx, cy, w, h) {
  const dx = Math.abs(px - cx) - w / 2;
  const dy = Math.abs(py - cy) - h / 2;
  const length = Math.sqrt(Math.max(dx, 0) * Math.max(dx, 0) + Math.max(dy, 0) * Math.max(dy, 0));
  return length + Math.min(Math.max(dx, dy), 0);
}

export function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const dotB = bax * bax + bay * bay;
  const h = dotB > 0 ? Math.min(Math.max((pax * bax + pay * bay) / dotB, 0), 1) : 0;
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy) - r;
}