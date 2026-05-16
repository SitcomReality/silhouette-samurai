export function updateCollisions(controller) {
  const p = controller.player;
  const chars = [p];
  for (const ent of controller.entities) {
    if (ent.state !== 'dead' && ent.character) {
      chars.push(ent);
    }
  }

  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const a = chars[i];
      const b = chars[j];
      
      const aIsLow = (a === p && (p.isSliding || p.isCrouching));
      const bIsLow = (b === p && (p.isSliding || p.isCrouching));
      
      const aScale = a.scale || 1.0;
      const bScale = b.scale || 1.0;
      const aHeight = (aIsLow ? 35 : 70) * aScale;
      const bHeight = (bIsLow ? 35 : 70) * bScale;
      
      const aCenterY = a.y - aHeight / 2;
      const bCenterY = b.y - bHeight / 2;
      
      const dx = b.x - a.x;
      const dy = bCenterY - aCenterY; 
      
      const minDistX = 17.5 * aScale + 17.5 * bScale;
      const minDistY = (aHeight + bHeight) / 2;

      if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
        let safeDx = dx === 0 ? (Math.random() - 0.5) : dx;
        const pushX = (minDistX - Math.abs(safeDx)) * Math.sign(safeDx);

        a.x -= pushX * 0.5;
        b.x += pushX * 0.5;

        a.vx *= 0.85;
        b.vx *= 0.85;
      }
    }
  }
}