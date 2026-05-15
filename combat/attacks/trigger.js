import { ATTACK_CONFIG } from './config.js';

export function triggerAttack(controller, attackType) {
  const p = controller.player;
  if (p.state === 'dead' || p.state === 'attack') return;
  
  const config = ATTACK_CONFIG[attackType];
  if (!config) return;
  
  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = attackType;
  p.attackTimer = config.duration;
  p.endlagTimer = config.endlag;
  p.attackHitConfirmed = false;
  
  const dir = p.facing === 'right' ? 1 : -1;
  p.vx = dir * config.vx;
  p.vy = config.vy;
  
  if (config.vy !== 0) {
    p.isGrounded = false;
  }
  
  let angle = 0;
  if (attackType === 'uppercut' || attackType === 'slam') {
    angle = -Math.PI / 4 * dir;
  }
  
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