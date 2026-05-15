import { ATTACK_CONFIG } from './config.js';

export function triggerAttack(controller, attackType) {
  const p = controller.player;
  if (p.state === 'dead') return;
  
  const config = ATTACK_CONFIG[attackType];
  if (!config) return;

  if (p.state === 'attack') {
    const currentConfig = ATTACK_CONFIG[p.attackType];
    const isJabCancel = p.attackType === 'jab' && p.attackTimer < currentConfig.duration * 0.6 && attackType === 'jab';
    const isEndlagCancel = p.attackTimer <= 0 && p.endlagTimer > 0;
    
    if (!isJabCancel && !isEndlagCancel) {
      return; 
    }
  }
  
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
    p.vx = horizontalHeld ? dir * config.vx : 0;
    p.vy = config.vy;
    p.exponentialLaunch = true;
    p.isGrounded = false;
  } else if (attackType === 'slide') {
    // Sliding attack adds to momentum based on power, never slows down
    const powerFactor = p.slidePower / 100;
    const boost = dir * config.vx * powerFactor;
    // If boost is in same direction as current vx, add it. 
    // Otherwise, ensure we at least maintain current vx if it's already fast.
    if ((boost > 0 && p.vx >= 0) || (boost < 0 && p.vx <= 0)) {
      p.vx += boost;
    } else {
      // Trying to slide opposite to current momentum? 
      // We flip direction but scale initial boost by power.
      p.vx = boost;
    }
    p.slidePower = 0; // Consume power
  } else {
    if (attackType === 'air_thrust') {
      p.vx = horizontalHeld ? dir * config.vx : 0;
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