import { AttackFrameData } from '../../AttackFrameData.js';

export const AIR_ATTACKS = {
  air_neutral: new AttackFrameData('air_neutral', {
    startup: 3, active: 5, recovery: 8, damage: 10, knockback: { x: 5, y: -3 }, hitstun: 0.25, groundOnly: false,
    movement: { vx: 0, vy: -20 },
    range: { width: 60, height: 70, offsetX: 45, offsetY: -66 },
    anim: { swordLen: 74, swordStartLen: 36, swordOriginY: -40, startAngle: -1, endAngle: 0.1, bodyTopX: 2, bodyTopY: -35, headX: 5, headY: -55, bodyBotX: 0, bodyBotY: 0, swordThickness: 3 }
  }),
  air_forward: new AttackFrameData('air_forward', {
    startup: 4, active: 6, recovery: 12, damage: 15, knockback: { x: 10, y: -3 }, hitstun: 0.35, groundOnly: false,
    movement: { vx: 25, vy: -15 },
    range: { width: 70, height: 60, offsetX: 50, offsetY: -55 },
    anim: { swordLen: 54, swordStartLen: 16, swordOriginY: -35, startAngle: 0.6, endAngle: -0.1, bodyTopX: 0, bodyTopY: -35, headX: 15, headY: -55, bodyBotX: -20, bodyBotY: -20, swordThickness: 4 }
  }),
  air_up: new AttackFrameData('air_up', {
    startup: 6, active: 6, recovery: 12, damage: 14, knockback: { x: 1, y: -10 }, hitstun: 0.45, groundOnly: false,
    range: { width: 100, height: 60, offsetX: 0, offsetY: -120 },
    anim: { swordLen: 70, swordStartLen: 67, swordOriginY: -45, startAngle: 0, endAngle: -1, bodyTopX: 0, bodyTopY: -50, headX: -5, headY: -68, bodyBotX: 0, bodyBotY: -4, swordThickness: 2.5 }
  }),
  air_down: new AttackFrameData('air_down', {
    startup: 4, active: 30, recovery: 8, damage: 20, knockback: { x: 0, y: 15 }, hitstun: 0.5, spike: true, groundOnly: false, movement: { vx: 0, vy: 8 },
    range: { width: 80, height: 100, offsetX: 0, offsetY: 25 },
    anim: { swordLen: 78, swordStartLen: 10, swordOriginY: -36, startAngle: 0.55, endAngle: 0.65, bodyTopX: 0, bodyTopY: -21, headX: 4, headY: -37, bodyBotX: 1, bodyBotY: 10, swordThickness: 3 }
  })
};