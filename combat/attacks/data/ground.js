import { AttackFrameData } from '../../AttackFrameData.js';

export const GROUND_ATTACKS = {
  neutral: new AttackFrameData('neutral', {
    startup: 2, active: 4, recovery: 6, damage: 8, knockback: { x: 3, y: -1 }, hitstun: 0.2,
    range: { width: 70, height: 35, offsetX: 60, offsetY: -53 },
    anim: { swordLen: 70, swordStartLen: 8, swordOriginY: -40, startAngle: 0.85, endAngle: 0, bodyTopX: -4, bodyTopY: -35, headX: -1, headY: -55, bodyBotX: 0, bodyBotY: 0, swordThickness: 3 }
  }),
  up: new AttackFrameData('up', {
    startup: 6, active: 6, recovery: 12, damage: 16, knockback: { x: 2, y: -14 }, hitstun: 0.45, launch: true, movement: { vx: 8, vy: -8 },
    range: { width: 110, height: 80, offsetX: 30, offsetY: -80 },
    sweetspot: { offsetX: 40, offsetY: -95, radius: 20, damageBonus: 8, knockbackMult: 1.45 },
    anim: { swordLen: 59, swordStartLen: 96, swordOriginY: -45, startAngle: 0, endAngle: -1, bodyTopX: 20, bodyTopY: -48, headX: 26, headY: -60, bodyBotX: 0, bodyBotY: -14, swordThickness: 2.5 }
  }),
  down: new AttackFrameData('down', {
    startup: 4, active: 10, recovery: 14, damage: 12, knockback: { x: 5, y: -7 }, hitstun: 0.35, trip: true, movement: { vx: 20, vy: 0 },
    range: { width: 60, height: 80, offsetX: 50, offsetY: -40 },
    anim: { swordLen: 33, swordStartLen: 71, swordOriginY: -60, startAngle: 1, endAngle: -0.1, bodyTopX: 13, bodyTopY: -34, headX: 12, headY: -48, bodyBotX: 31, bodyBotY: 4, swordThickness: 3 }
  }),
  forward: new AttackFrameData('forward', {
    startup: 4, active: 8, recovery: 20, damage: 18, knockback: { x: 8, y: -1 }, hitstun: 0.45, movement: { vx: 30, vy: 0 },
    range: { width: 80, height: 50, offsetX: 50, offsetY: -60 },
    anim: { swordLen: 55, swordStartLen: 15, swordOriginY: -36, startAngle: -0.85, endAngle: 0.1, bodyTopX: 0, bodyTopY: -36, headX: 6, headY: -55, bodyBotX: 5, bodyBotY: -6, swordThickness: 4 }
  })
};