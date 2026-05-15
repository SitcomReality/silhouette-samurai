import { smin, sdBox, sdCapsule, sdCircle } from './primitives.js';
import { evalCharacterSDF } from '../character/sdf-eval.js';
import { getGroundY } from './ground.js';
import { textSDFManager } from './text-sdf.js';

export function computeContourY(x, baseGroundY, groundedEntities, groundedParticles, shockwaves, globalBlendK = 22, controller = null) {
  const gY = getGroundY(x, baseGroundY, shockwaves);
  
  const nearbyEntities = [];
  let highestObjTop = gY;
  
  for (const ent of groundedEntities) {
    const span = ent.type === 'crate' ? (ent.width || 25) / 2 + 40 : 80;
    if (Math.abs(ent.x - x) < span) {
      nearbyEntities.push(ent);
      const top = ent.type === 'crate' ? ent.y - (ent.height || 25) : ent.y - (ent.character ? ent.character.height + 30 : 120);
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
        const boxD = sdBox(x, y, ent.x, ent.y - (ent.height || 25) / 2, ent.width || 25, ent.height || 25);
        d = smin(d, boxD, globalBlendK);
      } else if (ent.character) {
        const charD = evalCharacterSDF(ent.character, x, y);
        d = smin(d, charD, globalBlendK);
      }
    }

    if (controller && controller.intro.active && controller.intro.currentLayout) {
      const textD = textSDFManager.getDistance(controller.intro.currentLayout, x, y);
      d = smin(d, textD, globalBlendK * 0.5);
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