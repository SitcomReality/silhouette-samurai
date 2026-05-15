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
  
  if (attackType === 'jab') {
    // jab doesn't override current inertia
  } else if (attackType === 'uppercut') {
    p.vx = dir * config.vx;
    p.vy = config.vy;
    p.exponentialLaunch = true;
    p.isGrounded = false;
  } else {
    p.vx = dir * config.vx;
    p.vy = config.vy;
    if (config.vy !== 0) {
      p.isGrounded = false;
    }
  }
  
  let angle = 0;
  if (attackType === 'uppercut' || attackType === 'slam') {
    angle = -Math.PI / 4 * dir;
  } else if (attackType === 'air_thrust') {
    angle = -Math.PI / 6 * dir;
  }
  
  if (attackType !== 'jab') {
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 20,
      y: p.y - 45,
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