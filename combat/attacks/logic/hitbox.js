export function getHitbox(entity, frameData) {
  const dir = entity.facing === 'right' ? 1 : -1;
  const range = frameData.range;
  
  // For unified attacks, adjust hitbox position based on attack angle
  let offsetX = range.offsetX;
  let offsetY = range.offsetY;
  
  if (entity.attackAngle !== undefined) {
    const angle = entity.attackAngle;
    const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    // Map angle into screen space. Standard atan2(mvy, mvx) now provides Y-down angles.
    offsetX = Math.cos(angle) * dist;
    offsetY = Math.sin(angle) * dist;
  }
  
  return {
    x: entity.x + dir * offsetX,
    y: entity.y + offsetY,
    width: range.width,
    height: range.height
  };
}

export function checkHitboxCollision(hitbox, target) {
  const dx = Math.abs(hitbox.x - target.x);
  const dy = Math.abs(hitbox.y - (target.y - 40));
  
  const hw = hitbox.width / 2;
  const hh = hitbox.height / 2;
  const tw = target.character ? target.character.width / 2 : (target.width || 50) / 2;
  const th = target.character ? target.character.height / 2 : (target.height || 50) / 2;
  
  return dx < (hw + tw) && dy < (hh + th);
}