import { smin, sdBox, sdCapsule, sdCircle } from './primitives.js';
import { evalCharacterSDF } from '../character/sdf-eval.js';
import { getGroundY } from './ground.js';
import { textSDFManager } from './text-sdf.js';

let cachedGrid = null;
let cachedColEntities = null;
let cachedColParticles = null;
let cachedColWorldX = null;
let cachedColGroundY = null;

export function extractSDFSegments(
  viewWidth, viewHeight, cameraX, camYOffset, baseGroundY, entities, particles, shockwaves, step = 5, globalBlendK = 20, controller = null
) {
  const cols = Math.ceil(viewWidth / step);
  const rows = Math.ceil(viewHeight / step);

  const gridSize = (cols + 1) * (rows + 1);
  if (!cachedGrid || cachedGrid.length < gridSize) {
    cachedGrid = new Float32Array(gridSize * 1.2); // +20% buffer for resizes
    cachedColEntities = new Array(cols + 50);
    cachedColParticles = new Array(cols + 50);
    cachedColWorldX = new Float32Array(cols + 50);
    cachedColGroundY = new Float32Array(cols + 50);
  }

  const grid = cachedGrid;
  const colEntities = cachedColEntities;
  const colParticles = cachedColParticles;
  const colWorldX = cachedColWorldX;
  const colGroundY = cachedColGroundY;

  for (let c = 0; c <= cols; c++) {
    const wx = cameraX + (c * step - viewWidth / 2);
    colWorldX[c] = wx;
    colGroundY[c] = getGroundY(wx, baseGroundY, shockwaves);

    const activeEnts = [];
    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      if (ent.state === 'dead' && !ent.isSliced) continue;
      const span = ent.type === 'crate' ? (ent.width || 25) / 2 + 40 : 80;
      if (Math.abs(ent.x - wx) < span + globalBlendK) activeEnts.push(ent);
    }
    colEntities[c] = activeEnts;

    const activeParts = [];
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (Math.abs(p.x - wx) < p.radius + globalBlendK + 10) activeParts.push(p);
    }
    colParticles[c] = activeParts;
  }

  const gridBuf = new Float32Array((cols + 1) * (rows + 1));
  const rowStride = rows + 1;

  for (let c = 0; c <= cols; c++) {
    const wx = colWorldX[c];
    const gY = colGroundY[c];
    const activeEnts = colEntities[c];
    const activeParts = colParticles[c];
    const cOffset = c * rowStride;

    let highestTop = gY;
    for (let i = 0; i < activeEnts.length; i++) {
      const ent = activeEnts[i];
      const top = ent.type === 'crate' ? ent.y - (ent.height || 50) : ent.y - (ent.character ? ent.character.height + 30 : 120);
      if (top < highestTop) highestTop = top;
    }
    for (let i = 0; i < activeParts.length; i++) {
      const top = activeParts[i].y - (activeParts[i].length || activeParts[i].radius);
      if (top < highestTop) highestTop = top;
    }

    // Ensure intro text is considered when present so its SDF is sampled even with no nearby entities/particles.
    if (controller && controller.introLayouts) {
      for (const layout of controller.introLayouts) {
        const textCenter = layout.x + (layout.width || 0) * 0.5;
        const halfW = (layout.width || 0) * 0.5 + globalBlendK * 2.0;
        if (Math.abs(colWorldX[c] - textCenter) <= halfW) {
          const textTop = layout.y - (layout.height || 0);
          if (textTop < highestTop) highestTop = textTop;
        }
      }
    }

    const minRow = Math.max(0, Math.floor((highestTop - globalBlendK * 2.5 + camYOffset) / step));
    const maxRow = Math.min(rows, Math.ceil((gY + globalBlendK * 2.5 + camYOffset) / step));

    for (let r = 0; r < minRow; r++) gridBuf[cOffset + r] = 100.0;
    for (let r = maxRow + 1; r <= rows; r++) gridBuf[cOffset + r] = -100.0;

    // Pre-calculate particle properties to avoid repeated math in the inner loop
    const optParts = activeParts.map(p => {
      if (p.shape === 'capsule') {
        const len = p.length || 30;
        const ang = p.angle || 0;
        const cos = Math.cos(ang) * len * 0.5;
        const sin = Math.sin(ang) * len * 0.5;
        return { type: 1, ax: p.x - cos, ay: p.y - sin, bx: p.x + cos, by: p.y + sin, r: p.radius };
      } else if (p.shape === 'square') {
        return { type: 2, x: p.x, y: p.y, r: p.radius * 1.3 };
      }
      return { type: 3, x: p.x, y: p.y, r: p.radius };
    });

    for (let r = minRow; r <= maxRow; r++) {
      const sy = r * step;
      const wy = sy - camYOffset;
      let d = gY - wy;

      for (let i = 0; i < activeEnts.length; i++) {
        const ent = activeEnts[i];
        if (ent.type === 'crate') {
          const boxD = sdBox(wx, wy, ent.x, ent.y - (ent.height || 25) / 2, ent.width || 25, ent.height || 25);
          d = smin(d, boxD, globalBlendK);
        } else if (ent.character) {
          const charD = evalCharacterSDF(ent.character, wx, wy, globalBlendK);
          d = smin(d, charD, globalBlendK);
        }
      }

      for (let i = 0; i < optParts.length; i++) {
        const p = optParts[i];
        let pD;
        if (p.type === 1) {
          pD = sdCapsule(wx, wy, p.ax, p.ay, p.bx, p.by, p.r);
        } else if (p.type === 2) {
          pD = sdBox(wx, wy, p.x, p.y, p.r, p.r);
        } else {
          pD = sdCircle(wx, wy, p.x, p.y, p.r);
        }
        d = smin(d, pD, globalBlendK);
      }
      // Include Intro Text SDF if active and nearby
      if (controller.introLayouts) {
        for (const layout of controller.introLayouts) {
          const textD = textSDFManager.getDistance(layout, wx, wy);
          if (textD < 100) {
            d = smin(d, textD, globalBlendK * 0.5); // Sharp-ish blend for text
          }
        }
      }

      gridBuf[cOffset + r] = d;
    }
  }

  const segments = [];
  const getT = (vA, vB) => vA / (vA - vB);

  for (let c = 0; c < cols; c++) {
    const c0 = c * rowStride;
    const c1 = (c + 1) * rowStride;

    for (let r = 0; r < rows; r++) {
      const v0 = gridBuf[c0 + r];
      const v1 = gridBuf[c1 + r];
      const v2 = gridBuf[c1 + r + 1];
      const v3 = gridBuf[c0 + r + 1];

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

  return {
    segments,
    grid: gridBuf,
    cols,
    rows,
    step,
    rowStride
  };
}