export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt) {
  const dir = facing === 'right' ? 1 : -1;
  const t = char.target;

  // Default / Idle state relative to character pos (0,0)
  t.bodyBotX = 0; t.bodyBotY = 0;
  t.bodyTopX = 0; t.bodyTopY = -70;
  t.bodyThickness = 24;
  t.headX = 0; t.headY = -110; t.headR = 26;
  t.bulgeAX = 0; t.bulgeAY = -40; t.bulgeAR = 0;
  t.bulgeBX = 0; t.bulgeBY = -40; t.bulgeBR = 0;

  // Apply state modifiers
  if (state === 'dead') {
    t.bodyBotY = -10; t.bodyTopX = dir * 40; t.bodyTopY = -20;
    t.headX = dir * 70; t.headY = -20;
    t.bodyThickness = 16;
  } else if (state === 'hit') {
    t.bodyTopX = -dir * 30; t.bodyTopY = -60;
    t.headX = -dir * 50; t.headY = -80;
  } else if (state === 'attack') {
    if (attackType === 'uppercut') {
      const rise = Math.sin(attackProgress * Math.PI);
      t.bodyBotY = -rise * 40;
      t.bodyTopX = dir * 20; t.bodyTopY = -100 - rise * 50;
      t.headX = dir * 30; t.headY = -140 - rise * 50;
      t.bulgeAX = dir * 40; t.bulgeAY = -80 - rise * 60; t.bulgeAR = 28 + rise * 16;
    } else if (attackType === 'slide') {
      const sweep = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = -dir * 40; t.bodyTopY = -30;
      t.headX = -dir * 70; t.headY = -40;
      t.bulgeAX = dir * 80; t.bulgeAY = -20; t.bulgeAR = 20;
      t.bodyBotX = dir * 30; t.bodyBotY = -10;
    } else if (attackType === 'aerial') {
      const thrust = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = dir * 30; t.bodyTopY = -60;
      t.headX = dir * 50; t.headY = -80;
      t.bulgeAX = dir * 80 * thrust; t.bulgeAY = -40; t.bulgeAR = 32 * thrust;
    } else if (attackType === 'slam') {
      if (attackProgress < 0.7) {
        const reach = attackProgress / 0.7;
        t.bodyTopY = -100 - reach * 30;
        t.headY = -140 - reach * 40;
        t.bulgeAX = 0; t.bulgeAY = -160; t.bulgeAR = 36 * reach;
      } else {
        const slam = (attackProgress - 0.7) / 0.3;
        t.bodyTopX = dir * 50 * slam; t.bodyTopY = -40;
        t.headX = dir * 60 * slam; t.headY = -50;
        t.bulgeAX = dir * 80 * slam; t.bulgeAY = -10; t.bulgeAR = 40;
      }
    } else if (attackType === 'roundhouse') {
      const spin = attackProgress * Math.PI * 2.0;
      t.bodyThickness = 28;
      t.bulgeAX = Math.cos(spin - Math.PI/2) * 90 * dir; 
      t.bulgeAY = -60 + Math.sin(spin - Math.PI/2) * 40; 
      t.bulgeAR = 32;
    }
  } else if (!isGrounded) {
    const tilt = Math.min(Math.max(vy * 0.05, -0.5), 0.5);
    t.bodyTopX = dir * tilt * 30;
    t.headX = dir * tilt * 50;
    t.bodyBotY = -20;
  } else if (isCrouching) {
    t.bodyTopX = -dir * 20;
    t.bodyTopY = -40;
    t.headX = dir * 30; t.headY = -50;
    t.bodyBotX = -dir * 10;
  } else if (state === 'run') {
    const cycle = stateTime * 14;
    const bob = Math.abs(Math.cos(cycle)) * 8;
    const lean = 20;
    t.bodyBotY = -bob;
    t.bodyTopX = dir * lean; t.bodyTopY = -70 - bob;
    t.headX = dir * (lean + 10); t.headY = -110 - bob;
    
    const stride = Math.sin(cycle);
    t.bulgeAX = dir * stride * 24; t.bulgeAY = -20; t.bulgeAR = 20;
    t.bulgeBX = -dir * stride * 24; t.bulgeBY = -20; t.bulgeBR = 20;
  } else {
    // Idle
    const bob = Math.sin(stateTime * 3) * 4;
    t.headY = -110 + bob;
    t.bodyTopY = -70 + bob * 1.0;
    t.headX = Math.sin(stateTime * 2) * 3;
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
  char.width = 60;
}