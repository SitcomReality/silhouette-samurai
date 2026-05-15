import { ATTACK_CONFIG } from './config.js';

export function triggerAttack(controller, attackType) {
  const p = controller.player;
  if (p.state === 'dead') return;
  
  const config = ATTACK_CONFIG[attackType];
  if (!config) return;


  
  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = attackType;
  p.attackTimer = config.duration;
  p.endlagTimer = config.endlag;
  p.attackHitConfirmed = false;
  
  const dir = p.facing === 'right' ? 1 : -1;
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const horizontalHeld = left || right;
  
  if (attackType === 'jab') {
    // jab doesn't override current inertia
  } else if (attackType === 'uppercut') {
    // Uppercut costs air power when airborne, less when grounded
    const powerCost = p.isGrounded ? 10 : 25;
    if (!p.isGrounded && p.aerialPower < powerCost) return; // Not enough power
    
    if (!p.isGrounded) p.aerialPower -= powerCost;
    
    const powerScale = p.isGrounded ? 1.0 : 0.5 + (p.aerialPower / 100) * 0.5;
    p.vx = horizontalHeld ? dir * config.vx * powerScale : 0;
    p.vy = config.vy * powerScale;
    p.exponentialLaunch = true;
    p.isGrounded = false;
  } else if (attackType === 'slide') {
    // Slide uses momentum or creates it
    const minSlideSpeed = 8;
    const currentSpeed = Math.abs(p.vx);
    
    if (currentSpeed < minSlideSpeed) {
      // Not moving fast enough - use slide power to boost
      const powerBoost = (p.slidePower / 100) * config.vx;
      p.vx = dir * Math.max(minSlideSpeed, powerBoost);
      p.slidePower = Math.max(0, p.slidePower - 30);
    } else {
      // Already moving - maintain/enhance momentum
      const sign = Math.sign(p.vx);
      p.vx = sign * Math.max(currentSpeed, minSlideSpeed);
    }
    p.isSliding = true;
    
    // Audio feedback
    if (controller.audioEngine) {
      controller.audioEngine.onSlide();
    }
  } else {
    if (attackType === 'air_thrust') {
      // Air thrust costs power
      const powerCost = 20;
      if (p.aerialPower < powerCost) return;
      
      p.aerialPower -= powerCost;
      const powerScale = 0.6 + (p.aerialPower / 100) * 0.4;
      p.vx = horizontalHeld ? dir * config.vx * powerScale : 0;
    } else {
      p.vx = dir * config.vx;
    }
    p.vy = config.vy;
    if (config.vy !== 0) {
      p.isGrounded = false;
    }
  }
  
  let angle = 0;
  let fxX = p.x + dir * 20;
  let fxY = p.y - 45;

  if (attackType === 'uppercut' || attackType === 'slam') {
    if (attackType === 'uppercut' && !horizontalHeld) {
      angle = -Math.PI / 2;
      fxX = p.x;
      fxY = p.y - 70;
    } else {
      angle = -Math.PI / 4 * dir;
    }
  } else if (attackType === 'air_thrust') {
    if (!horizontalHeld) {
      angle = -Math.PI / 2;
      fxX = p.x;
      fxY = p.y - 70;
    } else {
      angle = -Math.PI / 6 * dir;
    }
  }
  
  if (attackType !== 'jab') {
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: fxX,
      y: fxY,
      facing: p.facing,
      angle: angle,
      radius: config.reach || 60,
      thickness: 25,
      color: '#ffffff',
      life: 0,
      maxLife: 0.25
    });
  }
}