import { AttackFrameData } from '../../AttackFrameData.js';

// Unified attack that scales with charge and adapts to movement direction
export const UNIFIED_ATTACK = new AttackFrameData('unified', {
  startup: 2,
  active: 6,
  recovery: 8,
  damage: 12,        // Base damage, scaled by charge
  knockback: { x: 6, y: -2 },  // Base knockback, scaled by charge
  hitstun: 0.3,
  range: { width: 70, height: 50, offsetX: 45, offsetY: -50 },
  movement: { vx: 0, vy: 0 }, // Will be set procedurally based on input
  anim: {
    swordLen: 60,
    swordStartLen: 20,
    swordOriginY: -40,
    startAngle: 0.5,  // Will be adjusted based on attack angle
    endAngle: -0.3,
    swordThickness: 4,
    bodyTopX: 10,
    bodyTopY: -35,
    headX: 15,
    headY: -55,
    bodyBotX: 0,
    bodyBotY: 0
  }
});

export const CHARGE_CONFIG = {
  minChargeTime: 0.0,      // Instant release is valid
  maxChargeTime: 1.2,      // Maximum charge time for full power
  minDamageScale: 1.0,     // Minimum damage multiplier
  maxDamageScale: 2.5,     // Maximum damage multiplier at full charge
  minKnockbackScale: 1.0,
  maxKnockbackScale: 2.0,
  minMovementScale: 0.8,   // Allow some movement even at min charge
  maxMovementScale: 1.5,   // Boost movement at full charge
  baseMovementSpeed: 25    // Base speed applied in movement direction
};