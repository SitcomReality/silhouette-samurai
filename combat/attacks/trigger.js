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
}