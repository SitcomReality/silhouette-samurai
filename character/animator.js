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
  
  // Default sword pos (iaijutsu ready pose, diagonally behind back)
  t.swordAX = -dir * 15; t.swordAY = -20;
  t.swordBX = -dir * 45; t.swordBY = -50;
  t.swordThickness = 4;

  // Easing helpers
  const easeInCubic = x => x * x * x;
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3);
  const easeInOutCubic = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOutElastic = x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  const easeOutBack = x => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  // Apply state modifiers
  if (state === 'dead') {
    t.bodyBotY = -5; t.bodyTopX = dir * 20; t.bodyTopY = -10;
    t.headX = dir * 35; t.headY = -10;
    t.bodyThickness = 8;
  } else if (state === 'hit') {
    t.bodyTopX = -dir * 15; t.bodyTopY = -30;
    t.headX = -dir * 25; t.headY = -40;
  } else if (state === 'attack') {
    if (attackType === 'down_thrust') {
      const freezeThreshold = 0.25;
      if (attackProgress < freezeThreshold) {
        const tuck = easeOutCubic(attackProgress / freezeThreshold);
        t.bodyBotY = -25 * tuck;
        t.bodyTopX = 0; t.bodyTopY = -25 - 10 * tuck;
        t.headX = 0; t.headY = -40 - 10 * tuck;
        
        t.swordAX = 0; t.swordAY = -20;
        t.swordBX = -dir * 20; t.swordBY = -50;
      } else {
        const fall = easeInCubic((attackProgress - freezeThreshold) / (1 - freezeThreshold));
        t.bodyTopX = 0; t.bodyTopY = -45;
        t.headX = 0; t.headY = -60;
        t.bodyBotY = -10;
        
        t.swordAX = 0; t.swordAY = -10;
        t.swordBX = 0; t.swordBY = 40 + fall * 10;
        t.swordThickness = 6;
      }
    } else if (attackType === 'heavy_slash') {
      if (attackProgress < 0.3) {
        const windup = easeOutCubic(attackProgress / 0.3);
        t.bodyTopX = -dir * 20 * windup;
        t.headX = -dir * 25 * windup;
        const angle = Math.PI * 0.9;
        t.swordAX = -dir * 15; t.swordAY = -20;
        t.swordBX = t.swordAX + Math.cos(angle) * 60 * dir;
        t.swordBY = t.swordAY + Math.sin(angle) * 60;
        t.swordThickness = 7;
      } else if (attackProgress < 0.4) {
        const snap = (attackProgress - 0.3) / 0.1;
        t.bodyTopX = dir * 15 * snap;
        t.headX = dir * 20 * snap;
        const angle = Math.PI * 0.9 - (snap * Math.PI * 1.6);
        t.swordAX = dir * 10; t.swordAY = -30;
        t.swordBX = t.swordAX + Math.cos(angle) * 75 * dir;
        t.swordBY = t.swordAY + Math.sin(angle) * 75;
        t.swordThickness = 8;
      } else {
        const follow = easeOutCubic((attackProgress - 0.4) / 0.6);
        t.bodyTopX = dir * 15 + dir * 15 * follow;
        t.headX = dir * 20 + dir * 15 * follow;
        t.bodyBotX = dir * 10 * follow;
        const angle = -Math.PI * 0.7 - (follow * 0.2);
        t.swordAX = dir * 20; t.swordAY = -20;
        t.swordBX = t.swordAX + Math.cos(angle) * 75 * dir;
        t.swordBY = t.swordAY + Math.sin(angle) * 75;
        t.swordThickness = 5;
      }
    } else if (attackType === 'rising_slash') {
      const p = easeOutBack(attackProgress);
      t.bodyBotY = -p * 20;
      t.bodyTopX = dir * 10; t.bodyTopY = -45 - p * 20;
      t.headX = dir * 15; t.headY = -60 - p * 20;
      
      const angle = -Math.PI/2 + (p * Math.PI * 1.1);
      t.swordAX = dir * 10; t.swordAY = -40 - p * 20;
      t.swordBX = t.swordAX + Math.cos(angle) * 65 * dir;
      t.swordBY = t.swordAY + Math.sin(angle) * 65;
    } else if (attackType === 'slash') {
      const p = easeOutBack(attackProgress);
      t.bodyTopX = dir * 15 * p;
      t.headX = dir * 20 * p;
      const angle = Math.PI * 0.8 - (p * Math.PI * 1.5);
      t.swordAX = dir * 15; t.swordAY = -35;
      t.swordBX = t.swordAX + Math.cos(angle) * 55 * dir;
      t.swordBY = t.swordAY + Math.sin(angle) * 55;
    } else if (attackType === 'thrust') {
      const p = easeOutElastic(attackProgress);
      t.bodyBotX = -dir * 15; 
      t.bodyTopX = dir * 30 * p; t.bodyTopY = -25;
      t.headX = dir * 40 * p; t.headY = -35;
      t.swordAX = dir * 25 * p; t.swordAY = -25;
      t.swordBX = t.swordAX + dir * (50 + p * 35);
      t.swordBY = -25;
    } else if (attackType === 'up_slash') {
      const p = easeOutCubic(attackProgress);
      t.bodyTopX = dir * 10; t.bodyTopY = -35;
      t.headX = dir * 15; t.headY = -45;
      const angle = -Math.PI * 0.1 - (p * Math.PI * 1.2); 
      t.swordAX = dir * 10; t.swordAY = -45;
      t.swordBX = t.swordAX + Math.cos(angle) * 60 * dir;
      t.swordBY = t.swordAY + Math.sin(angle) * 60;
    } else if (attackType === 'sweep') {
      const p = easeOutBack(attackProgress);
      t.bodyBotX = -dir * 10; 
      t.bodyTopX = dir * 20 * p; t.bodyTopY = -15;
      t.headX = dir * 25 * p; t.headY = -25;
      const angle = Math.PI * 0.3 - (p * Math.PI * 0.6);
      t.swordAX = dir * 15; t.swordAY = -10;
      t.swordBX = t.swordAX + Math.cos(angle) * 65 * dir;
      t.swordBY = t.swordAY + Math.sin(angle) * 65;
    }
  } else if (!isGrounded) {
    // Dynamic jump/fall poses
    if (vy < 0) {
      // Graceful anime leap: sword leads upward
      const surge = Math.min(Math.abs(vy) * 0.05, 1.0);
      t.bodyTopY = -40;
      t.bodyTopX = dir * 5 * surge;
      t.headY = -60;
      t.headX = dir * 10 * surge;
      t.bodyBotY = -5;
      t.bodyBotX = -dir * 15 * surge; // Legs trail backwards gracefully
      t.bodyThickness = 10;
      
      // Sword points diagonally up/forward
      t.swordAX = dir * 10; t.swordAY = -30;
      t.swordBX = dir * 30; t.swordBY = -60;
    } else {
      // Falling/Hang-time: Floating down, cape/sword fluttering
      const tilt = Math.min(vy * 0.05, 0.5);
      t.bodyTopX = dir * tilt * 5;
      t.headX = dir * tilt * 8;
      t.bodyBotY = -15; // Tucked legs
      t.bodyBotX = 0;
      t.bodyThickness = 12;
      
      // Sword held out to the side for balance
      t.swordAX = -dir * 10; t.swordAY = -30;
      t.swordBX = -dir * 35; t.swordBY = -20;
    }
  } else if (isSliding || isCrouching) {
    if (isSliding) {
      // Active slide pose - low profile, sword trailing or pointing forward
      t.bodyBotX = dir * 15;
      t.bodyTopX = -dir * 20; t.bodyTopY = -20;
      t.headX = -dir * 30; t.headY = -30;
      t.bodyThickness = 10;
      t.swordAX = dir * 10; t.swordAY = -10;
      t.swordBX = dir * 45; t.swordBY = -10; // Sword points forward during slide
    } else {
      // Crouching
      t.bodyTopX = -dir * 10;
      t.bodyTopY = -25;
      t.headX = dir * 5; t.headY = -35;
      t.bodyBotX = 0;
      t.swordAX = dir * 15; t.swordAY = -20;
      t.swordBX = dir * 30; t.swordBY = -10;
    }
  } else if (state === 'run') {
    const cycle = stateTime * 14;
    const bob = Math.abs(Math.cos(cycle)) * 3;
    const lean = 15;
    t.bodyBotY = -bob;
    t.bodyTopX = dir * lean; t.bodyTopY = -35 - bob;
    t.headX = dir * (lean + 5); t.headY = -50 - bob;
    
    const stride = Math.sin(cycle);
    t.bulgeAX = dir * stride * 15; t.bulgeAY = -10; t.bulgeAR = 8;
    t.bulgeBX = -dir * stride * 15; t.bulgeBY = -10; t.bulgeBR = 8;
    
    // Naruto/Ninja run: Sword trails horizontally behind
    t.swordAX = -dir * 15; t.swordAY = -25 - bob;
    t.swordBX = -dir * 50; t.swordBY = -25 - bob;
  } else {
    // Idle
    const bob = Math.sin(stateTime * 3) * 2;
    t.headY = -55 + bob;
    t.bodyTopY = -35 + bob * 0.5;
    t.headX = Math.sin(stateTime * 2) * 1.5;
    
    // Slight breathing motion on the sword
    t.swordAX += Math.cos(stateTime * 3) * 1;
    t.swordBX += Math.cos(stateTime * 3) * 2;
    t.swordAY += bob * 0.5;
    t.swordBY += bob * 1.5;
  }

  // Apply scale
  t.bodyBotX *= scale; t.bodyBotY *= scale;
  t.bodyTopX *= scale; t.bodyTopY *= scale;
  t.bodyThickness *= scale;
  t.headX *= scale; t.headY *= scale; t.headR *= scale;
  t.bulgeAX *= scale; t.bulgeAY *= scale; t.bulgeAR *= scale;
  t.bulgeBX *= scale; t.bulgeBY *= scale; t.bulgeBR *= scale;
  t.swordAX *= scale; t.swordAY *= scale;
  t.swordBX *= scale; t.swordBY *= scale;
  t.swordThickness *= scale;

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
  
  c.swordAX += (t.swordAX - c.swordAX) * lerpFactor;
  c.swordAY += (t.swordAY - c.swordAY) * lerpFactor;
  c.swordBX += (t.swordBX - c.swordBX) * lerpFactor;
  c.swordBY += (t.swordBY - c.swordBY) * lerpFactor;
  c.swordThickness += (t.swordThickness - c.swordThickness) * lerpFactor;

  // Store absolute world positions
  char.world = {
    bodyBot: { x: x + c.bodyBotX, y: y + c.bodyBotY },
    bodyTop: { x: x + c.bodyTopX, y: y + c.bodyTopY },
    bodyThickness: c.bodyThickness,
    head: { x: x + c.headX, y: y + c.headY, r: c.headR },
    bulgeA: { x: x + c.bulgeAX, y: y + c.bulgeAY, r: c.bulgeAR },
    bulgeB: { x: x + c.bulgeBX, y: y + c.bulgeBY, r: c.bulgeBR },
    sword: { 
      ax: x + c.swordAX, ay: y + c.swordAY, 
      bx: x + c.swordBX, by: y + c.swordBY, 
      thickness: c.swordThickness 
    }
  };
  
  char.height = Math.abs(c.headY) + c.headR;
  char.width = 30 * scale;
}