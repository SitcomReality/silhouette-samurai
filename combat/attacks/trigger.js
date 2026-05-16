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
  
  if (attackType === 'slash') {
    // slash doesn't override current inertia heavily
  } else if (attackType === 'rising_slash') {
    const powerCost = p.isGrounded ? 10 : 25;
    if (!p.isGrounded && p.aerialPower < powerCost) return;
    
    if (!p.isGrounded) p.aerialPower -= powerCost;
    
    const powerScale = p.isGrounded ? 1.0 : 0.5 + (p.aerialPower / 100) * 0.5;
    p.vx = horizontalHeld ? dir * config.vx * powerScale : 0;
    p.vy = config.vy * powerScale;
    p.exponentialLaunch = true;
    p.isGrounded = false;
  } else if (attackType === 'sweep') {
    const minSlideSpeed = 8;
    const currentSpeed = Math.abs(p.vx);
    
    if (currentSpeed < minSlideSpeed) {
      const powerBoost = (p.slidePower / 100) * config.vx;
      p.vx = dir * Math.max(minSlideSpeed, powerBoost);
      p.slidePower = Math.max(0, p.slidePower - 30);
    } else {
      const sign = Math.sign(p.vx);
      p.vx = sign * Math.max(currentSpeed, minSlideSpeed);
    }
    p.isSliding = true;
    
    if (controller.audioEngine) {
      controller.audioEngine.onSlide();
    }
  } else if (attackType === 'down_thrust') {
    // Hang-time freeze is handled in update.js
    p.vx = 0;
    p.vy = 0;
    p.isGrounded = false;
  } else {
    if (attackType === 'up_slash') {
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
  let fxY = p.y - 35;

  if (attackType === 'rising_slash') {
    angle = -Math.PI / 2 * dir;
    fxX = p.x + dir * 10;
    fxY = p.y - 60;
  } else if (attackType === 'down_thrust') {
    angle = Math.PI / 2; // Straight down!
    fxX = p.x;
    fxY = p.y;
  } else if (attackType === 'up_slash') {
    angle = -Math.PI / 4 * dir;
    fxX = p.x + dir * 15;
    fxY = p.y - 50;
  } else if (attackType === 'heavy_slash') {
    angle = 0;
    fxX = p.x + dir * 30;
  }
  
  // Sword trails for most attacks, except maybe thrust
  if (attackType !== 'thrust') {
    let delay = 0;
    if (attackType === 'heavy_slash') delay = config.duration * 0.3;
    
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: fxX,
      y: fxY,
      facing: p.facing,
      angle: angle,
      radius: config.reach || 60,
      thickness: attackType === 'heavy_slash' ? 45 : 30,
      color: attackType === 'heavy_slash' ? '#f43f5e' : '#06b6d4',
      life: -delay,
      maxLife: attackType === 'heavy_slash' ? 0.3 : 0.25
    });
  }
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh(attackType);
  }
}