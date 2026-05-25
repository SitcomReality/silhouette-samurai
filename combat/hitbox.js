import { getHitbox, checkHitboxCollision as logicCheck } from './attacks/logic/hitbox.js';

// Centralized hitbox accessor for debug visuals
export function getActiveHitbox(entity, attackType, attackProgress, frameData = null) {
  if (entity.state !== 'attack' || !attackType || !frameData) return null;
  return getHitbox(entity, frameData);
}

export function checkHitboxCollision(hitbox, target) {
  return logicCheck(hitbox, target);
}