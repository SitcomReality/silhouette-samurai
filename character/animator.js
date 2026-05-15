export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt) {
  const dir = facing === 'right' ? 1 : -1;
  const t = char.target;

  // Default / Idle state relative to character pos (0,0)
  t.bodyBotX = 0; t.bodyBotY = 0;
  t.bodyTopX = 0; t.bodyTopY = -35;
  t.bodyThickness = 12;
  t.headX = 0; t.headY = -55; t.headR = 13;
  t.bulgeAX = 0; t.bulgeAY = -20; t.bulgeAR = 0;
  t.bulgeBX = 0; t.bulgeBY = -20; t.bulgeBR = 0;

  // Apply state modifiers
  if (state === 'dead') {
    t.bodyBotY = -5; t.bodyTopX = dir * 20; t.bodyTopY = -10;
    t.headX = dir * 35; t.headY = -10;
    t.bodyThickness = 8;
  } else if (state === 'hit') {
    t.bodyTopX = -dir * 15; t.bodyTopY = -30;
    t.headX = -dir * 25; t.headY = -40;
  } else if (state === 'attack') {
    if (attackType === 'uppercut') {
      const rise = Math.sin(attackProgress * Math.PI);
      t.bodyBotY = -rise * 20;
      t.bodyTopX = dir * 10; t.bodyTopY = -50 - rise * 25;
      t.headX = dir * 15; t.headY = -70 - rise * 25;
      t.bulgeAX = dir * 20; t.bulgeAY = -40 - rise * 30; t.bulgeAR = 14 + rise * 8;
    } else if (attackType === 'slide') {
      const sweep = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = -dir * 20; t.bodyTopY = -15;
      t.headX = -dir * 35; t.headY = -20;
      t.bulgeAX = dir * 40; t.bulgeAY = -10; t.bulgeAR = 10;
      t.bodyBotX = dir * 15; t.bodyBotY = -5;
    } else if (attackType === 'aerial') {
      const thrust = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = dir * 15; t.bodyTopY = -30;
      t.headX = dir * 25; t.headY = -40;
      t.bulgeAX = dir * 40 * thrust; t.bulgeAY = -20; t.bulgeAR = 16 * thrust;
    } else if (attackType === 'slam') {
      if (attackProgress < 0.7) {
        const reach = attackProgress / 0.7;
        t.bodyTopY = -50 - reach * 15;
        t.headY = -70 - reach * 20;
        t.bulgeAX = 0; t.bulgeAY = -80; t.bulgeAR = 18 * reach;
      } else {
        const slam = (attackProgress - 0.7) / 0.3;
        t.bodyTopX = dir * 25 * slam; t.bodyTopY = -20;
        t.headX = dir * 30 * slam; t.headY = -25;
        t.bulgeAX = dir * 40 * slam; t.bulgeAY = -5; t.bulgeAR = 20;
      }
    } else if (attackType === 'roundhouse') {
      const spin = attackProgress * Math.PI * 2.0;
      t.bodyThickness = 14;
      t.bulgeAX = Math.cos(spin - Math.PI/2) * 45 * dir; 
      t.bulgeAY = -30 + Math.sin(spin - Math.PI/2) * 20; 
      t.bulgeAR = 16;
    }
  } else if (!isGrounded) {
    const tilt = Math.min(Math.max(vy * 0.05, -0.5), 0.5);
    t.bodyTopX = dir * tilt * 15;
    t.headX = dir * tilt * 25;
    t.bodyBotY = -10;
  } else if (isCrouching) {
    t.bodyTopX = -dir * 10;
    t.bodyTopY = -20;
    t.headX = dir * 15; t.headY = -25;
    t.bodyBotX = -dir * 5;
  } else if (state === 'run') {
    const cycle = stateTime * 14;
    const bob = Math.abs(Math.cos(cycle)) * 4;
    const lean = 10;
    t.bodyBotY = -bob;
    t.bodyTopX = dir * lean; t.bodyTopY = -35 - bob;
    t.headX = dir * (lean + 5); t.headY = -55 - bob;
    
    const stride = Math.sin(cycle);
    t.bulgeAX = dir * stride * 12; t.bulgeAY = -10; t.bulgeAR = 10;
    t.bulgeBX = -dir * stride * 12; t.bulgeBY = -10; t.bulgeBR = 10;
  } else {
    // Idle
    const bob = Math.sin(stateTime * 3) * 2;
    t.headY = -55 + bob;
    t.bodyTopY = -35 + bob * 0.5;
    t.headX = Math.sin(stateTime * 2) * 1.5;
  }

  // Smoothly interpolate current to target
  // A standard framerate-independent lerp:
  const lerpRate = 20;
  const dtSafe = Math.min(dt || 0.016, 0.1);
  const lerpFactor = 1.0 - Math.exp(-lerpRate * dtSafe);
  
  const c = char.current;
  c.bodyBotX += (t.bodyBotX - c.bodyBotX) * lerpFactor;
  c.bodyBotY += (t.bodyBotY - c.bodyBotY) * lerpFactor;
  c.bodyTopX += (t.bodyTopX - c.bodyTopX) * lerpFactor;
  c.bodyTopY += (t.bodyTopY - c.bodyTopY) * lerpFactor;
  c.bodyThickness += (t.bodyThickness - c.bodyThickness) * lerpFactor;
  
  c.headX += (t.headX - c.headX) * lerpFactor;
  c.headY += (t.headY - c.headY) * lerpFactor;
  c.headR += (t.headR - c.headR) * lerpFactor;
  
  c.bulgeAX += (t.bulgeAX - c.bulgeAX) * lerpFactor;
  c.bulgeAY += (t.bulgeAY - c.bulgeAY) * lerpFactor;
  c.bulgeAR += (t.bulgeAR - c.bulgeAR) * lerpFactor;
  
  c.bulgeBX += (t.bulgeBX - c.bulgeBX) * lerpFactor;
  c.bulgeBY += (t.bulgeBY - c.bulgeBY) * lerpFactor;
  c.bulgeBR += (t.bulgeBR - c.bulgeBR) * lerpFactor;

  // Store absolute world positions
  char.world = {
    bodyBot: { x: x + c.bodyBotX, y: y + c.bodyBotY },
    bodyTop: { x: x + c.bodyTopX, y: y + c.bodyTopY },
    bodyThickness: c.bodyThickness,
    head: { x: x + c.headX, y: y + c.headY, r: c.headR },
    bulgeA: { x: x + c.bulgeAX, y: y + c.bulgeAY, r: c.bulgeAR },
    bulgeB: { x: x + c.bulgeBX, y: y + c.bulgeBY, r: c.bulgeBR }
  };
  
  char.height = Math.abs(c.headY) + c.headR;
  char.width = 30;
}