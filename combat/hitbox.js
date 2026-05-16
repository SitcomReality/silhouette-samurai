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
  
  if (attackType === 'slash') {
    activeStart = 0.1;
    activeEnd = 0.5;
  } else if (attackType === 'thrust') {
    activeStart = 0.3;
    activeEnd = 0.8;
  } else if (attackType === 'rising_slash') {
    activeStart = 0.2;
    activeEnd = 0.8;
  } else if (attackType === 'up_slash') {
    activeStart = 0.2;
    activeEnd = 0.7;
  } else if (attackType === 'sweep') {
    activeStart = 0.2;
    activeEnd = 0.7;
  } else if (attackType === 'down_thrust') {
    activeStart = 0.2; // Fast fall is active immediately
    activeEnd = 1.0;
  } else if (attackType === 'heavy_slash') {
    activeStart = 0.3;
    activeEnd = 0.7;
  }
  
  if (attackProgress < activeStart || attackProgress > activeEnd) return null;
  
  // Calculate hitbox position based on attack type
  let hitboxX = x + dir * config.reach * 0.5;
  let hitboxY = y - 40;
  let hitboxW = config.reach;
  let hitboxH = 50;
  
  if (attackType === 'slash') {
    hitboxW = 55;
    hitboxH = 30;
    hitboxY = y - 35;
  } else if (attackType === 'thrust') {
    hitboxW = 75;
    hitboxH = 30;
    hitboxY = y - 25;
  } else if (attackType === 'rising_slash') {
    hitboxW = 60;
    hitboxH = 80;
    hitboxX = x + dir * 30;
    hitboxY = y - 50;
  } else if (attackType === 'up_slash') {
    hitboxW = 60;
    hitboxH = 70;
    hitboxX = x + dir * 20;
    hitboxY = y - 60;
  } else if (attackType === 'sweep') {
    hitboxW = 75;
    hitboxH = 30;
    hitboxY = y - 15;
  } else if (attackType === 'down_thrust') {
    hitboxW = 40;
    hitboxH = 70;
    hitboxX = x;
    hitboxY = y + 10;
  } else if (attackType === 'heavy_slash') {
    hitboxW = 80;
    hitboxH = 60;
    hitboxX = x + dir * 40;
    hitboxY = y - 35;
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