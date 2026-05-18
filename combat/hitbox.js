// Legacy hitbox helper for debug visualization
// Returns approximate hitbox based on frame data when available
export function getActiveHitbox(entity, attackType, attackProgress, frameData = null) {
  if (entity.state !== 'attack' || !attackType) return null;
  
  // Use frame data if provided (preferred method)
  if (frameData && frameData.range) {
    const dir = entity.facing === 'right' ? 1 : -1;
    return {
      x: entity.x + dir * frameData.range.offsetX,
      y: entity.y + frameData.range.offsetY,
      width: frameData.range.width,
      height: frameData.range.height
    };
  }
  
  return null;
}

export function checkHitboxCollision(hitbox, target) {
  if (!hitbox) return false;
  
  const dx = Math.abs(hitbox.x - target.x);
  const dy = Math.abs(hitbox.y - (target.y - 40));
  
  const hw = hitbox.width / 2;
  const hh = hitbox.height / 2;
  const tw = target.character ? target.character.width / 2 : (target.width || 50) / 2;
  const th = target.character ? target.character.height / 2 : (target.height || 50) / 2;
  
  return dx < (hw + tw) && dy < (hh + th);
}