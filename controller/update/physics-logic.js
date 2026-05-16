export function updatePhysics(controller, dt) {
  const p = controller.player;
  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];

  // 1. Character to Character Collision
  const chars = [p];
  for (const ent of controller.entities) {
    if (ent.state !== 'dead' && ent.character) chars.push(ent);
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
      const dx = b.x - a.x;
      const dy = (b.y - bHeight / 2) - (a.y - aHeight / 2);
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

  // 2. Global Gravity & Grounding for Player
  if (!p.isGrounded) {
    let gravity = 0.65;
    const atApex = Math.abs(p.vy) < 3.5;
    if (atApex && jumpPressed && !p.exponentialLaunch) {
      gravity = 0.18; p.vx *= 0.99;
    } else if (p.vy < 0 && !jumpPressed && !p.exponentialLaunch) {
      gravity = 2.2;
    }
    p.vy += gravity;
    if (p.y >= controller.baseGroundY) {
      p.y = controller.baseGroundY; p.vy = 0; p.isGrounded = true; p.doubleJumped = false;
      if (jumpPressed && p.state !== 'attack') p.jumpBuffer = 0.15;
      if (down && Math.abs(p.vx) > 5) p.isSliding = true;
    }
  } else {
    p.y = controller.baseGroundY;
  }

  p.x += p.vx;
  p.y += p.vy;

  // 3. Clashes
  const attackers = [];
  if (p.state === 'attack' && p.attackFrameData) attackers.push(p);
  for (const ent of controller.entities) {
    if (ent.state === 'attack' && ent.attackFrameData) attackers.push(ent);
  }
  for (let i = 0; i < attackers.length; i++) {
    for (let j = i + 1; j < attackers.length; j++) {
      if (controller.parry.checkClash(attackers[i], attackers[j], controller)) {
        controller.parry.applyClash(attackers[i], attackers[j], controller);
      }
    }
  }
}