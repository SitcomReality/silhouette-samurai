import { smin, sdCircle, sdCapsule, sdBox } from '../sdf/primitives.js';

export function evalCharacterSDF(char, px, py, blendK = 14) {
  // Core torso - vertical rectangle
  const coreD = sdBox(px, py, char.core.x, char.core.y, char.width, char.height);
  let d = coreD;
  
  // Head - blended smoothly into torso top
  const headBlend = blendK * 0.8; // Tighter blend for seamless connection
  d = smin(d, sdCircle(px, py, char.head.x, char.head.y, char.head.radius), headBlend);
  
  // Arm - only visible if length > 0
  if (char.arm.length > 5) {
    const ax = char.arm.origin.x;
    const ay = char.arm.origin.y;
    const bx = ax + Math.cos(char.arm.angle) * char.arm.length;
    const by = ay + Math.sin(char.arm.angle) * char.arm.length;
    d = smin(d, sdCapsule(px, py, ax, ay, bx, by, 8), blendK);
  }
  
  // Legs - two capsules from bottom of torso
  const legX = char.core.x;
  const legY = char.core.y + char.height / 2;
  
  const leftEndX = legX - 6 + Math.sin(char.legs.leftAngle) * char.legs.length;
  const leftEndY = legY + Math.cos(char.legs.leftAngle) * char.legs.length;
  d = smin(d, sdCapsule(px, py, legX - 6, legY, leftEndX, leftEndY, 9), blendK);
  
  const rightEndX = legX + 6 + Math.sin(char.legs.rightAngle) * char.legs.length;
  const rightEndY = legY + Math.cos(char.legs.rightAngle) * char.legs.length;
  d = smin(d, sdCapsule(px, py, legX + 6, legY, rightEndX, rightEndY, 9), blendK);
  
  return d;
}