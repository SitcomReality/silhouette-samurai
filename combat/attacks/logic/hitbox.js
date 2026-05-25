export function getHitbox(entity, frameData) {
  const dir = entity.facing === 'right' ? 1 : -1;
  const range = frameData.range;
  
  // For unified attacks, adjust hitbox position based on world attack angle
  if (entity.attackAngle !== undefined) {
    const angle = entity.attackAngle;
    // We want the hitbox to rotate around the entity's center (usually y - 40 is roughly center for these calculations)
    // The base offsets assume facing right (angle 0). We should rotate the local offset by the attack angle.
    const cx = 0;
    const cy = -40; // pivot around body center
    
    // Local offsets relative to pivot
    const localX = (dir * range.offsetX) - cx;
    const localY = range.offsetY - cy;
    
    // To properly support the new full-body rotation, the attack hitbox must precisely follow the rotation.
    // If not grounded, the entire body rotates. If grounded, the body leans but doesn't fully rotate,
    // though the attack logic still directs the hitbox.
    const rotAngle = entity.isGrounded ? angle * 0.5 : angle; // Grounded leans half as much visually
    
    const cosA = Math.cos(rotAngle);
    const sinA = Math.sin(rotAngle);
    
    // In air, the base pose is 'up' (-PI/2), and it's rotated by aimAngle + PI/2.
    // Wait, if it's rotated by aimAngle + PI/2, the offset should be calculated from the upright pose, then rotated!
    // If the base pose is "up", the offset needs to match that. But unified attack uses standard offsets.
    // Actually, a simpler robust way is just pushing the center out in the attack angle direction:
    const pushDist = Math.max(Math.abs(range.offsetX), Math.abs(range.offsetY));
    
    return {
      x: entity.x + Math.cos(angle) * pushDist,
      y: entity.y - 40 + Math.sin(angle) * pushDist,
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