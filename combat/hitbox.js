export function getActiveHitbox(entity, attackType, attackProgress) {
  if (entity.state !== 'attack' || !attackType) return null;
  
  const dir = entity.facing === 'right' ? 1 : -1;
  const x = entity.x;
  const y = entity.y;
  
  if (attackType === 'slide') {
    const active = attackProgress > 0.2 && attackProgress < 0.8;
    if (!active) return null;
    return {
      x: x + dir * 40,
      y: y - 25,
      width: 80,
      height: 40,
      damage: 25,
      pushback: 10,
      launchVy: -6
    };
  }
  
  if (attackType === 'uppercut') {
    const active = attackProgress > 0.3 && attackProgress < 0.7;
    if (!active) return null;
    return {
      x: x + dir * 20,
      y: y - 80,
      width: 40,
      height: 60,
      damage: 30,
      pushback: 8,
      launchVy: -16
    };
  }
  
  if (attackType === 'roundhouse') {
    const active = attackProgress > 0.4 && attackProgress < 0.8;
    if (!active) return null;
    const angle = attackProgress * Math.PI * 1.8;
    const reach = 60;
    return {
      x: x + Math.cos(angle - Math.PI / 2) * reach * dir,
      y: y - 60 + Math.sin(angle - Math.PI / 2) * reach,
      width: 50,
      height: 50,
      damage: 35,
      pushback: 14,
      launchVy: -14
    };
  }
  
  if (attackType === 'slam') {
    const active = attackProgress > 0.85;
    if (!active) return null;
    return {
      x: x + dir * 40,
      y: y - 40,
      width: 80,
      height: 60,
      damage: 55,
      pushback: 20,
      launchVy: -10
    };
  }
  
  if (attackType === 'aerial') {
    const active = attackProgress > 0.3 && attackProgress < 0.8;
    if (!active) return null;
    return {
      x: x + dir * 50,
      y: y - 50,
      width: 60,
      height: 50,
      damage: 28,
      pushback: 12,
      launchVy: -8
    };
  }
  
  return null;
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