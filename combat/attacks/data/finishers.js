import { AttackFrameData } from '../../AttackFrameData.js';

export const FINISHER_ATTACKS = {
  dance_finisher_neutral: new AttackFrameData('dance_finisher_neutral', {
    startup: 16, active: 6, recovery: 40, damage: 30, knockback: { x: 18, y: -4 }, hitstun: 0.7, movement: { vx: 10, vy: 0 },
    range: { width: 85, height: 50, offsetX: 45, offsetY: -40 },
    anim: { swordLen: 62, swordStartLen: 62, swordOriginY: -40, startAngle: 0.9, endAngle: -0.7, bodyTopX: 25, bodyTopY: -30, headX: 30, headY: -40, bodyBotX: 0, bodyBotY: 0, swordThickness: 9 }
  }),
  dance_finisher_up: new AttackFrameData('dance_finisher_up', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 1, y: -22 }, hitstun: 0.7, launch: true, movement: { vx: 4, vy: -10 },
    range: { width: 65, height: 85, offsetX: 20, offsetY: -75 },
    anim: { swordLen: 60, swordStartLen: 60, swordOriginY: -45, startAngle: -0.6, endAngle: 0.9, bodyTopX: 20, bodyTopY: -40, headX: 25, headY: -55, bodyBotX: -8, bodyBotY: -18, swordThickness: 5 }
  }),
  dance_finisher_down: new AttackFrameData('dance_finisher_down', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 0, y: 25 }, hitstun: 0.75, spike: true, movement: { vx: 0, vy: 8 },
    range: { width: 55, height: 70, offsetX: 0, offsetY: 10 },
    // Use a sweeping down-sweep animation (more like standard "down" attack) so blade arcs across rather than pointing straight down
    anim: { swordLen: 70, swordStartLen: 70, swordOriginY: -60, startAngle: 0.15, endAngle: -0.35, bodyTopX: 0, bodyTopY: -45, headX: 0, headY: -60, bodyBotX: 0, bodyBotY: -25, swordThickness: 6 }
  })
};