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
  let mvx = movementVector.x;
  let mvy = movementVector.y;
  
  // Determine a dir value from current facing for fallback calculations
  const currentDir = p.facing === 'right' ? 1 : -1;
  
  // If no direction is held, default the attack angle to match facing (so left-facing players attack left)
  // Otherwise use the movement vector angle.
  let moveAngle;
  if (Math.abs(mvx) <= 0.0001 && Math.abs(mvy) <= 0.0001) {
    moveAngle = currentDir === 1 ? 0 : Math.PI;
  } else {
    moveAngle = Math.atan2(mvy, mvx); // Standard screen Y-down angles
  }
  
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
      p.vy += (mvy / moveMag) * baseSpeed * 0.8;
      if (Math.abs(p.vy) > 2) p.isGrounded = false;
    }
  }
  
  // Adjust animation angles based on attack direction
  if (frameData.anim) {
    // Map attack angle to sword angles (relative to facing direction)
    const relativeAngle = Math.atan2(Math.sin(moveAngle), Math.cos(moveAngle) * dir);
    
    // Set start and end angles for the swing (normalized to PI in the animator)
    // Make the sweep conclude exactly at the attack direction so a forward attack ends horizontal (0)
    const sweepRange = 0.45;
    frameData.anim.startAngle = (relativeAngle / Math.PI) + sweepRange;
    // End angle now matches the relative direction (no extra downward/upward offset)
    frameData.anim.endAngle = (relativeAngle / Math.PI);
    
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
  
  // Relative angle for the sweep (0 is forward relative to facing, -PI/2 is up)
  const relA = Math.atan2(Math.sin(attackAngle), Math.cos(attackAngle) * dir);
  
  // Sweep Width: much wider arcs for more "epic" feel, scaled by charge
  // Base 1.3 PI, up to 1.9 PI at full charge
  const sweepWidth = (1.3 + chargePower * 0.6) * Math.PI; 
  
  // Baseline values inspired by old "delightful" configs (radius 100, thickness 20)
  const radius = 90 + chargePower * 35;
  const thickness = 22 + chargePower * 25;
  const duration = 0.25 + chargePower * 0.15;
  
  // Verticality-based squash logic:
  // Purely horizontal (relA=0) -> high squash (low squashY)
  // Purely vertical (relA=+/-PI/2) -> less squash (high squashY)
  const verticality = Math.abs(Math.sin(relA));
  const squashY = 0.2 + (verticality * 0.65);
  
  const fx = {
    id: `fx_${controller.fxId++}`,
    type: 'arc_swoosh',
    entity: p,
    // Pivot the swoosh slightly forward from center
    offsetX: Math.cos(relA) * 15 * dir,
    offsetY: -45 + Math.sin(relA) * 15,
    x: p.x, // Handled by updateFX using entity + offset
    y: p.y,
    facing: p.facing,
    // Swings counter-clockwise for a classic follow-through look (startAngle > endAngle)
    startAngle: relA + (sweepWidth * 0.5),
    endAngle: relA - (sweepWidth * 0.5),
    radius: radius,
    thickness: thickness,
    squashY: squashY,
    life: 0,
    maxLife: duration
  };
  
  controller.visualFx.push(fx);
}