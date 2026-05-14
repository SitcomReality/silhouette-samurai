import { smin, sdBox, sdCapsule, sdCircle } from './primitives.js';
import { evalSkeletonSDF } from './skeleton-eval.js';
import { getGroundY } from './ground.js';

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