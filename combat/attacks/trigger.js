import { UNIFIED_ATTACK, CHARGE_CONFIG } from '../frame-data.js';

export function triggerUnifiedAttack(controller, chargeTime, movementVector) {
  const p = controller.player;
  if (p.state === 'dead' || p.state === 'stagger') return;
  
  // Clone the unified attack data so we can modify it per-attack
  const frameData = JSON.parse(JSON.stringify(UNIFIED_ATTACK));
  
  // Calculate charge power (0 to 1)
  const chargePower = Math.min(chargeTime / CHARGE_CONFIG.maxChargeTime, 1.0);
  
  // Scale damage and knockback based on charge
  const damageScale = CHARGE_CONFIG.minDamageScale + (CHARGE_CONFIG.maxDamageScale - CHARGE_CONFIG.minDamageScale) * chargePower;
  const knockbackScale = CHARGE_CONFIG.minKnockbackScale + (CHARGE_CONFIG.maxKnockbackScale - CHARGE_CONFIG.minKnockbackScale) * chargePower;
  const movementScale = CHARGE_CONFIG.minMovementScale + (CHARGE_CONFIG.maxMovementScale - CHARGE_CONFIG.minMovementScale) * chargePower;
  
  frameData.damage *= damageScale;
  frameData.knockback.x *= knockbackScale;
  frameData.knockback.y *= knockbackScale;
  
  // Calculate attack angle from movement vector
  const mvx = movementVector.x;
  const mvy = movementVector.y;
  const moveAngle = Math.atan2(-mvy, mvx); // Negative Y because down is positive
  
  // Determine facing based on horizontal input (or keep current if neutral)
  if (Math.abs(mvx) > 0.1) {
    p.facing = mvx > 0 ? 'right' : 'left';
  }
  const dir = p.facing === 'right' ? 1 : -1;
  
  // Apply movement boost in the input direction
  if (!(controller.loopSelectedAttack || controller.freezePlayer)) {
    const moveMag = Math.sqrt(mvx * mvx + mvy * mvy);
    if (moveMag > 0.1) {
      const baseSpeed = CHARGE_CONFIG.baseMovementSpeed * movementScale;
      p.vx += (mvx / moveMag) * baseSpeed * 0.8; // Blend with existing velocity
      p.vy += (-mvy / moveMag) * baseSpeed * 0.8;
      if (Math.abs(p.vy) > 2) p.isGrounded = false;
    }
  }
  
  // Adjust animation angles based on attack direction
  if (frameData.anim) {
    // Map attack angle to sword angles (relative to facing direction)
    let relativeAngle = moveAngle;
    if (dir === -1) {
      relativeAngle = Math.PI - moveAngle;
    }
    
    // Set start and end angles based on direction
    frameData.anim.startAngle = (relativeAngle / Math.PI) + 0.3;
    frameData.anim.endAngle = (relativeAngle / Math.PI) - 0.3;
    
    // Adjust body lean based on direction
    const leanFactor = chargePower * 30;
    frameData.anim.bodyTopX = Math.cos(relativeAngle) * leanFactor;
    frameData.anim.bodyTopY = -35 + Math.sin(relativeAngle) * leanFactor * 0.5;
    frameData.anim.headX = Math.cos(relativeAngle) * leanFactor * 1.3;
    frameData.anim.headY = -55 + Math.sin(relativeAngle) * leanFactor * 0.5;
  }
  
  // Store attack metadata
  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = 'unified';
  p.attackFrameData = new UNIFIED_ATTACK.constructor('unified', frameData);
  p.attackFrameTime = 0;
  p.attackHitConfirmed = false;
  p.attackHitEntities = new Set();
  p.attackAngle = moveAngle;
  p.attackChargePower = chargePower;
  
  // Create procedural swoosh
  createProceduralSwoosh(controller, p, moveAngle, chargePower);
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh('unified');
  }
}

function createProceduralSwoosh(controller, p, attackAngle, chargePower) {
  const dir = p.facing === 'right' ? 1 : -1;
  
  // Calculate swoosh parameters based on attack angle
  let relativeAngle = attackAngle;
  if (dir === -1) {
    relativeAngle = Math.PI - attackAngle;
  }
  
  const swooshRadius = 80 + chargePower * 40;
  const swooshThickness = 15 + chargePower * 25;
  const swooshDuration = 0.2 + chargePower * 0.2;
  
  const fx = {
    id: `fx_${controller.fxId++}`,
    type: 'arc_swoosh',
    entity: p,
    offsetX: Math.cos(relativeAngle) * 30 * dir,
    offsetY: -50 + Math.sin(relativeAngle) * 30,
    x: p.x + Math.cos(relativeAngle) * 30 * dir,
    y: p.y - 50 + Math.sin(relativeAngle) * 30,
    facing: p.facing,
    startAngle: relativeAngle + 0.4,
    endAngle: relativeAngle - 0.4,
    radius: swooshRadius,
    thickness: swooshThickness,
    squashY: 0.3 + Math.abs(Math.sin(relativeAngle)) * 0.7,
    life: 0,
    maxLife: swooshDuration
  };
  
  controller.visualFx.push(fx);
}