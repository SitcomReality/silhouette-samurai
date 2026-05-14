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

export function evalSkeletonSDF(skel, px, py, blendK = 14) {
  let d = sdCircle(px, py, skel.head.x, skel.head.y, skel.headRadius);
  d = smin(d, sdCapsule(px, py, skel.torsoTop.x, skel.torsoTop.y, skel.torsoBottom.x, skel.torsoBottom.y, skel.torsoRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.leftShoulder.x, skel.leftShoulder.y, skel.leftElbow.x, skel.leftElbow.y, skel.armRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.leftElbow.x, skel.leftElbow.y, skel.leftHand.x, skel.leftHand.y, skel.armRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.rightShoulder.x, skel.rightShoulder.y, skel.rightElbow.x, skel.rightElbow.y, skel.armRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.rightElbow.x, skel.rightElbow.y, skel.rightHand.x, skel.rightHand.y, skel.armRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.leftHip.x, skel.leftHip.y, skel.leftKnee.x, skel.leftKnee.y, skel.legRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.leftKnee.x, skel.leftKnee.y, skel.leftFoot.x, skel.leftFoot.y, skel.legRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.rightHip.x, skel.rightHip.y, skel.rightKnee.x, skel.rightKnee.y, skel.legRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.rightKnee.x, skel.rightKnee.y, skel.rightFoot.x, skel.rightFoot.y, skel.legRadius), blendK);
  
  return d;
}

export function getGroundY(x, baseGroundY, shockwaves) {
  let y = baseGroundY;
  
  y += Math.sin(x * 0.015) * 4;
  y += Math.cos(x * 0.007) * 6;
  
  for (const sw of shockwaves) {
    const dist = Math.abs(x - sw.x);
    const thickness = 60;
    if (Math.abs(dist - sw.radius) < thickness) {
      const factor = 1 - Math.abs(dist - sw.radius) / thickness;
      const wave = Math.sin(factor * Math.PI * 1.5) * sw.amplitude * (sw.life / sw.maxLife);
      y -= wave;
    }
  }
  return y;
}

export function computeContourY(x, baseGroundY, groundedEntities, groundedParticles, shockwaves, globalBlendK = 22) {
  const gY = getGroundY(x, baseGroundY, shockwaves);
  
  const nearbyEntities = [];
  let highestObjTop = gY;
  
  for (const ent of groundedEntities) {
    const span = ent.type === 'crate' ? (ent.width || 50) / 2 + 40 : 120;
    if (Math.abs(ent.x - x) < span) {
      nearbyEntities.push(ent);
      const top = ent.type === 'crate' ? ent.y - (ent.height || 50) : ent.y - 140;
      if (top < highestObjTop) highestObjTop = top;
    }
  }

  const nearbyParticles = [];
  for (const p of groundedParticles) {
    if (Math.abs(p.x - x) < p.radius + globalBlendK) {
      nearbyParticles.push(p);
      if (p.y - p.radius < highestObjTop) highestObjTop = p.y - p.radius;
    }
  }

  if (nearbyEntities.length === 0 && nearbyParticles.length === 0) return gY;

  const evalTotalSDF = (y) => {
    let d = gY - y;
    
    for (const ent of nearbyEntities) {
      if (ent.type === 'crate') {
        const boxD = sdBox(x, y, ent.x, ent.y - (ent.height || 50) / 2, ent.width || 50, ent.height || 50);
        d = smin(d, boxD, globalBlendK);
      } else {
        const skelD = evalSkeletonSDF(ent.skeleton, x, y);
        d = smin(d, skelD, globalBlendK);
      }
    }

    for (const p of nearbyParticles) {
      let pD;
      if (p.shape === 'capsule') {
        const len = p.length || 30;
        const ang = p.angle || 0;
        const ax = p.x - Math.cos(ang) * len * 0.5;
        const ay = p.y - Math.sin(ang) * len * 0.5;
        const bx = p.x + Math.cos(ang) * len * 0.5;
        const by = p.y + Math.sin(ang) * len * 0.5;
        pD = sdCapsule(x, y, ax, ay, bx, by, p.radius);
      } else if (p.shape === 'square') {
        pD = sdBox(x, y, p.x, p.y, p.radius * 1.5, p.radius * 1.5);
      } else {
        pD = sdCircle(x, y, p.x, p.y, p.radius);
      }
      d = smin(d, pD, globalBlendK);
    }
    return d;
  };

  const startY = highestObjTop - globalBlendK * 1.5;
  const endY = gY;

  let low = startY;
  let high = endY;
  let ans = gY;

  for (let iter = 0; iter < 10; iter++) {
    const mid = (low + high) / 2;
    if (evalTotalSDF(mid) <= 0) {
      ans = mid;
      high = mid;
    } else {
      low = mid;
    }
  }
  return ans;
}

export function extractSDFSegments(
  viewWidth, viewHeight, cameraX, camYOffset, baseGroundY, entities, particles, shockwaves, step = 5, globalBlendK = 20
) {
  const cols = Math.ceil(viewWidth / step);
  const rows = Math.ceil(viewHeight / step);

  const colEntities = [];
  const colParticles = [];
  const colWorldX = [];
  const colGroundY = [];

  for (let c = 0; c <= cols; c++) {
    const wx = cameraX + (c * step - viewWidth / 2);
    colWorldX.push(wx);
    colGroundY.push(getGroundY(wx, baseGroundY, shockwaves));

    const activeEnts = [];
    for (const ent of entities) {
      if (ent.state === 'dead') continue;
      const span = ent.type === 'crate' ? (ent.width || 50) / 2 + 40 : 120;
      if (Math.abs(ent.x - wx) < span + globalBlendK) activeEnts.push(ent);
    }
    colEntities.push(activeEnts);

    const activeParts = [];
    for (const p of particles) {
      if (Math.abs(p.x - wx) < p.radius + globalBlendK + 10) activeParts.push(p);
    }
    colParticles.push(activeParts);
  }

  const grid = new Float32Array((cols + 1) * (rows + 1));
  const rowStride = rows + 1;

  for (let c = 0; c <= cols; c++) {
    const wx = colWorldX[c];
    const gY = colGroundY[c];
    const activeEnts = colEntities[c];
    const activeParts = colParticles[c];
    const cOffset = c * rowStride;

    let highestTop = gY;
    for (let i = 0; i < activeEnts.length; i++) {
      const top = activeEnts[i].type === 'crate' ? activeEnts[i].y - (activeEnts[i].height || 50) : activeEnts[i].y - 140;
      if (top < highestTop) highestTop = top;
    }
    for (let i = 0; i < activeParts.length; i++) {
      const top = activeParts[i].y - (activeParts[i].length || activeParts[i].radius);
      if (top < highestTop) highestTop = top;
    }

    const minRow = Math.max(0, Math.floor((highestTop - globalBlendK * 2.5 + camYOffset) / step));
    const maxRow = Math.min(rows, Math.ceil((gY + globalBlendK * 2.5 + camYOffset) / step));

    for (let r = 0; r < minRow; r++) grid[cOffset + r] = 100.0;
    for (let r = maxRow + 1; r <= rows; r++) grid[cOffset + r] = -100.0;

    for (let r = minRow; r <= maxRow; r++) {
      const sy = r * step;
      const wy = sy - camYOffset;
      let d = gY - wy;

      for (let i = 0; i < activeEnts.length; i++) {
        const ent = activeEnts[i];
        if (ent.type === 'crate') {
          const boxD = sdBox(wx, wy, ent.x, ent.y - (ent.height || 50) / 2, ent.width || 50, ent.height || 50);
          d = smin(d, boxD, globalBlendK);
        } else {
          const skelD = evalSkeletonSDF(ent.skeleton, wx, wy, globalBlendK);
          d = smin(d, skelD, globalBlendK);
        }
      }

      for (let i = 0; i < activeParts.length; i++) {
        const p = activeParts[i];
        let pD;
        if (p.shape === 'capsule') {
          const len = p.length || 30;
          const ang = p.angle || 0;
          const ax = p.x - Math.cos(ang) * len * 0.5;
          const ay = p.y - Math.sin(ang) * len * 0.5;
          const bx = p.x + Math.cos(ang) * len * 0.5;
          const by = p.y + Math.sin(ang) * len * 0.5;
          pD = sdCapsule(wx, wy, ax, ay, bx, by, p.radius);
        } else if (p.shape === 'square') {
          pD = sdBox(wx, wy, p.x, p.y, p.radius * 1.3, p.radius * 1.3);
        } else {
          pD = sdCircle(wx, wy, p.x, p.y, p.radius);
        }
        d = smin(d, pD, globalBlendK);
      }
      grid[cOffset + r] = d;
    }
  }

  const segments = [];
  const getT = (vA, vB) => vA / (vA - vB);

  for (let c = 0; c < cols; c++) {
    const c0 = c * rowStride;
    const c1 = (c + 1) * rowStride;

    for (let r = 0; r < rows; r++) {
      const v0 = grid[c0 + r];
      const v1 = grid[c1 + r];
      const v2 = grid[c1 + r + 1];
      const v3 = grid[c0 + r + 1];

      let state = 0;
      if (v0 <= 0) state |= 8;
      if (v1 <= 0) state |= 4;
      if (v2 <= 0) state |= 2;
      if (v3 <= 0) state |= 1;

      if (state === 0 || state === 15) continue;

      const px = c * step;
      const py = r * step;

      let topX = 0, topY = 0, rightX = 0, rightY = 0, bottomX = 0, bottomY = 0, leftX = 0, leftY = 0;

      if ((state & 8) !== ((state & 4) << 1)) { topX = px + step * getT(v0, v1); topY = py; }
      if ((state & 4) !== ((state & 2) << 1)) { rightX = px + step; rightY = py + step * getT(v1, v2); }
      if ((state & 2) !== ((state & 1) << 1)) { bottomX = px + step * getT(v3, v2); bottomY = py + step; }
      if ((state & 8) !== ((state & 1) << 3)) { leftX = px; leftY = py + step * getT(v0, v3); }

      switch (state) {
        case 1:  segments.push({ x1: leftX, y1: leftY, x2: bottomX, y2: bottomY }); break;
        case 2:  segments.push({ x1: bottomX, y1: bottomY, x2: rightX, y2: rightY }); break;
        case 3:  segments.push({ x1: leftX, y1: leftY, x2: rightX, y2: rightY }); break;
        case 4:  segments.push({ x1: topX, y1: topY, x2: rightX, y2: rightY }); break;
        case 5:
          segments.push({ x1: leftX, y1: leftY, x2: topX, y2: topY });
          segments.push({ x1: bottomX, y1: bottomY, x2: rightX, y2: rightY });
          break;
        case 6:  segments.push({ x1: topX, y1: topY, x2: bottomX, y2: bottomY }); break;
        case 7:  segments.push({ x1: leftX, y1: leftY, x2: topX, y2: topY }); break;
        case 8:  segments.push({ x1: leftX, y1: leftY, x2: topX, y2: topY }); break;
        case 9:  segments.push({ x1: topX, y1: topY, x2: bottomX, y2: bottomY }); break;
        case 10:
          segments.push({ x1: leftX, y1: leftY, x2: bottomX, y2: bottomY });
          segments.push({ x1: topX, y1: topY, x2: rightX, y2: rightY });
          break;
        case 11: segments.push({ x1: topX, y1: topY, x2: rightX, y2: rightY }); break;
        case 12: segments.push({ x1: leftX, y1: leftY, x2: rightX, y2: rightY }); break;
        case 13: segments.push({ x1: bottomX, y1: bottomY, x2: rightX, y2: rightY }); break;
        case 14: segments.push({ x1: leftX, y1: leftY, x2: bottomX, y2: bottomY }); break;
      }
    }
  }

  return segments;
}