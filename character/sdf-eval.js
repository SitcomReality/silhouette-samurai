import { smin, sdCircle, sdCapsule, sdBox } from '../sdf/primitives.js';

export function evalCharacterSDF(char, px, py, blendK = 16) {
  const w = char.world;
  if (!w) return 999;
  
  let d = sdCapsule(px, py, w.bodyBot.x, w.bodyBot.y, w.bodyTop.x, w.bodyTop.y, w.bodyThickness);
  
  const headBlend = blendK * 0.8;
  d = smin(d, sdCircle(px, py, w.head.x, w.head.y, w.head.r), headBlend);
  
  if (w.bulgeA.r > 0.1) {
    d = smin(d, sdCircle(px, py, w.bulgeA.x, w.bulgeA.y, w.bulgeA.r), blendK);
  }
  if (w.bulgeB.r > 0.1) {
    d = smin(d, sdCircle(px, py, w.bulgeB.x, w.bulgeB.y, w.bulgeB.r), blendK);
  }
  
  if (w.sword && w.sword.thickness > 0.1) {
    // Harder blend for the sword to make it look distinct but still attached
    const swordD = sdCapsule(px, py, w.sword.ax, w.sword.ay, w.sword.bx, w.sword.by, w.sword.thickness);
    d = smin(d, swordD, blendK * 0.4);
  }
  
  return d;
}