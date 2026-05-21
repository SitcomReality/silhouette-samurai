export function getHitbox(entity, frameData) {
  const dir = entity.facing === 'right' ? 1 : -1;
  const range = frameData.range;
  
  // For unified attacks, adjust hitbox position based on world attack angle
  if (entity.attackAngle !== undefined) {
    const angle = entity.attackAngle;
    const dist = Math.sqrt(range.offsetX * range.offsetX + range.offsetY * range.offsetY);
    
    // Calculate world position directly from moveAngle to ensure it matches the visuals
    return {
      x: entity.x + Math.cos(angle) * dist,
      y: entity.y + Math.sin(angle) * dist,
      width: range.width,
      height: range.height
    };
  }
  
  // Fallback for standard attacks
  return {
    x: entity.x + dir * range.offsetX,
    y: entity.y + range.offsetY,
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