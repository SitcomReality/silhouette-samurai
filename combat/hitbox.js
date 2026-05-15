import { ATTACK_CONFIG } from './attacks/config.js';

export function getActiveHitbox(entity, attackType, attackProgress) {
  if (entity.state !== 'attack' || !attackType) return null;
  
  const dir = entity.facing === 'right' ? 1 : -1;
  const x = entity.x;
  const y = entity.y;
  const config = ATTACK_CONFIG[attackType];
  
  if (!config) return null;
  
  // Different active windows for different attacks
  let activeStart = 0.2;
  let activeEnd = 0.8;
  
  if (attackType === 'jab') {
    activeStart = 0.3;
    activeEnd = 0.7;
  } else if (attackType === 'lunge') {
    activeStart = 0.35;
    activeEnd = 0.75;
  } else if (attackType.startsWith('uppercut')) {
    activeStart = 0.3;
    activeEnd = 0.7;
  } else if (attackType === 'slide_tackle' || attackType === 'dive_slide') {
    activeStart = 0.2;
    activeEnd = 0.85;
  } else if (attackType === 'air_slam') {
    activeStart = 0.7;
    activeEnd = 1.0;
  } else if (attackType === 'roundhouse') {
    activeStart = 0.4;
    activeEnd = 0.8;
  }
  
  if (attackProgress < activeStart || attackProgress > activeEnd) return null;
  
  // Calculate hitbox position based on attack type
  let hitboxX = x + dir * config.reach * 0.5;
  let hitboxY = y - 50;
  let hitboxW = config.reach;
  let hitboxH = 50;
  
  if (attackType === 'jab') {
    hitboxW = 40;
    hitboxH = 30;
    hitboxX = x + dir * 30;
    hitboxY = y - 60;
  } else if (attackType === 'lunge') {
    hitboxW = 70;
    hitboxH = 40;
    hitboxX = x + dir * 45;
  } else if (attackType.includes('uppercut')) {
    hitboxW = 50;
    hitboxH = 80;
    hitboxX = x + dir * 20;
    hitboxY = y - 80;
  } else if (attackType === 'slide_tackle') {
    hitboxW = 90;
    hitboxH = 35;
    hitboxY = y - 25;
  } else if (attackType === 'dive_slide') {
    hitboxW = 80;
    hitboxH = 40;
    hitboxY = y - 30;
  } else if (attackType === 'air_slam') {
    hitboxW = 70;
    hitboxH = 60;
    hitboxY = y - 30;
  } else if (attackType === 'roundhouse') {
    const angle = attackProgress * Math.PI * 1.8;
    const reach = 60;
    hitboxX = x + Math.cos(angle - Math.PI / 2) * reach * dir;
    hitboxY = y - 60 + Math.sin(angle - Math.PI / 2) * reach;
    hitboxW = 50;
    hitboxH = 50;
  }
  
  return {
    x: hitboxX,
    y: hitboxY,
    width: hitboxW,
    height: hitboxH,
    damage: config.damage,
    pushback: config.pushback,
    launchVy: config.launchVy
  };
}

export function checkHitboxCollision(hitbox, target) {
  if (!hitbox) return false;
  
  const dx = Math.abs(hitbox.x - target.x);
  const dy = Math.abs(hitbox.y - target.y);
  
  const hw = hitbox.width / 2;
  const hh = hitbox.height / 2;
  const tw = target.character ? target.character.width : (target.width || 50) / 2;
  const th = target.character ? target.character.height / 2 : (target.height || 50) / 2;
  
  return dx < (hw + tw) && dy < (hh + th);
}