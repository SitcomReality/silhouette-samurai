export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt, isSliding = false, scale = 1.0) {
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
      const rise = attackProgress;
      t.bodyBotY = -rise * 20;
      t.bodyTopX = dir * 10; t.bodyTopY = -50 - rise * 35;
      t.headX = dir * 15; t.headY = -70 - rise * 35;
      t.bulgeAX = dir * 25; t.bulgeAY = -40 - rise * 45; t.bulgeAR = 14 + rise * 10;
    } else if (attackType === 'jab') {
      const punch = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = dir * 5;
      t.headX = dir * 8;
      t.bulgeAX = dir * 35 * punch; t.bulgeAY = -35; t.bulgeAR = 12 * punch;
    } else if (attackType === 'lunge') {
      const thrust = Math.sin(attackProgress * Math.PI);
      t.bodyBotX = -dir * 10;
      t.bodyTopX = dir * 25; t.bodyTopY = -25;
      t.headX = dir * 35; t.headY = -35;
      t.bulgeAX = dir * 50 * thrust; t.bulgeAY = -25; t.bulgeAR = 14 * thrust;
    } else if (attackType === 'air_thrust') {
      const thrust = Math.sin(attackProgress * Math.PI);
      t.bodyTopX = dir * 20; t.bodyTopY = -35;
      t.headX = dir * 30; t.headY = -45;
      t.bulgeAX = dir * 45 * thrust; t.bulgeAY = -45 - 20 * thrust; t.bulgeAR = 16 * thrust;
    } else if (attackType === 'slide') {
      // Slide: lean back, legs forward (opposite of lunge)
      t.bodyBotX = dir * 10; t.bodyBotY = 0;
      t.bodyTopX = -dir * 35; t.bodyTopY = -20;
      t.headX = -dir * 50; t.headY = -28;
      t.bulgeAX = dir * 45; t.bulgeAY = -8; t.bulgeAR = 14;
      t.bodyThickness = 15;
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
    // More dramatic lunge while rising, softer hang pose near apex
    if (vy < -6) {
      // Rising surge pose
      t.bodyBotY = -18;
      t.bodyTopX = dir * 18;
      t.bodyTopY = -55;
      t.headX = dir * 30; t.headY = -80;
      t.bulgeAX = dir * 36; t.bulgeAY = -38; t.bulgeAR = 18;
      t.bodyThickness = 14;
    } else {
      // Hang-time gentle float pose
      t.bodyBotY = -8;
      t.bodyTopX = dir * 8; t.bodyTopY = -42;
      t.headX = dir * 12; t.headY = -62;
      t.bulgeAX = dir * 12; t.bulgeAY = -22; t.bulgeAR = 10;
    }
  } else if (isSliding || isCrouching) {
    if (isSliding) {
      // Active slide pose - leaning back
      t.bodyBotX = dir * 8;
      t.bodyTopX = -dir * 30; t.bodyTopY = -18;
      t.headX = -dir * 42; t.headY = -25;
      t.bulgeAX = dir * 40; t.bulgeAY = -8; t.bulgeAR = 13;
      t.bodyThickness = 14;
    } else {
      // Crouching
      const cycle = stateTime * 8;
      const walkBob = (state === 'run') ? Math.abs(Math.sin(cycle)) * 3 : 0;
      const walkShift = (state === 'run') ? Math.cos(cycle) * 5 : 0;
      
      t.bodyTopX = -dir * 12 + walkShift;
      t.bodyTopY = -20 + walkBob;
      t.headX = dir * 10 + walkShift; t.headY = -28 + walkBob;
      t.bodyBotX = -dir * 5 + walkShift;
      
      if (state === 'run') {
        t.bulgeAX = dir * 15; t.bulgeAY = -5; t.bulgeAR = 10;
      }
    }
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

  // Apply scale
  t.bodyBotX *= scale; t.bodyBotY *= scale;
  t.bodyTopX *= scale; t.bodyTopY *= scale;
  t.bodyThickness *= scale;
  t.headX *= scale; t.headY *= scale; t.headR *= scale;
  t.bulgeAX *= scale; t.bulgeAY *= scale; t.bulgeAR *= scale;
  t.bulgeBX *= scale; t.bulgeBY *= scale; t.bulgeBR *= scale;

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
  char.width = 30 * scale;
}