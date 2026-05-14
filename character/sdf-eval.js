import { smin, sdCircle, sdCapsule, sdBox } from '../sdf/primitives.js';

export function evalCharacterSDF(char, px, py, blendK = 14) {
  const coreD = sdBox(px, py, char.core.x, char.core.y, char.width, char.height);
  let d = coreD;
  
  d = smin(d, sdCircle(px, py, char.head.x, char.head.y, char.head.radius), blendK);
  
  if (char.arm.length > 0) {
    const ax = char.arm.origin.x;
    const ay = char.arm.origin.y;
    const bx = ax + Math.cos(char.arm.angle) * char.arm.length;
    const by = ay + Math.sin(char.arm.angle) * char.arm.length;
    d = smin(d, sdCapsule(px, py, ax, ay, bx, by, 7), blendK);
  }
  
  const legX = char.core.x;
  const legY = char.core.y + char.height / 2;
  
  const leftEndX = legX + Math.sin(char.legs.leftAngle) * char.legs.length;
  const leftEndY = legY + Math.cos(char.legs.leftAngle) * char.legs.length;
  d = smin(d, sdCapsule(px, py, legX - 5, legY, leftEndX, leftEndY, 8), blendK);
  
  const rightEndX = legX + Math.sin(char.legs.rightAngle) * char.legs.length;
  const rightEndY = legY + Math.cos(char.legs.rightAngle) * char.legs.length;
  d = smin(d, sdCapsule(px, py, legX + 5, legY, rightEndX, rightEndY, 8), blendK);
  
  return d;
}