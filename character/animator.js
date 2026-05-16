// Easing functions for attack animations
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { return t * t * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt, isSliding = false, scale = 1.0) {
  const dir = facing === 'right' ? 1 : -1;
  const t = char.target;

  // Default / Idle state - iaijutsu ready pose
  t.bodyBotX = 0; t.bodyBotY = 0;
  t.bodyTopX = -dir * 3; t.bodyTopY = -35;
  t.bodyThickness = 12;
  t.headX = -dir * 5; t.headY = -55; t.headR = 13;
  t.bulgeAX = 0; t.bulgeAY = -20; t.bulgeAR = 0;
  t.bulgeBX = 0; t.bulgeBY = -20; t.bulgeBR = 0;
  
  // Idle: sword resting diagonally behind back (iaijutsu ready)
  t.swordAX = -dir * 8; t.swordAY = -25;
  t.swordBX = -dir * 35; t.swordBY = -50;
  t.swordThickness = 3;

  // Apply state modifiers
  if (state === 'dead') {
    t.bodyBotY = -5; t.bodyTopX = dir * 20; t.bodyTopY = -10;
    t.headX = dir * 35; t.headY = -10;
    t.bodyThickness = 8;
  } else if (state === 'hit') {
    t.bodyTopX = -dir * 15; t.bodyTopY = -30;
    t.headX = -dir * 25; t.headY = -40;
  } else if (state === 'attack') {
    // SWORD-LED ANIMATION: Calculate sword tip position first, then pull body along
    
    if (attackType === 'rising_slash') {
      // Rising crescent with anticipation
      const easedProgress = attackProgress < 0.2 ? easeInCubic(attackProgress / 0.2) * 0.2 : 
                            0.2 + easeOutCubic((attackProgress - 0.2) / 0.8) * 0.8;
      
      // Sword tip traces a rising arc from low-back to high-forward
      const arcAngle = -Math.PI * 0.6 + (easedProgress * Math.PI * 1.2);
      const swordLen = 55;
      t.swordBX = dir * (Math.cos(arcAngle) * swordLen * 0.7 + easedProgress * 25);
      t.swordBY = -30 + Math.sin(arcAngle) * swordLen - easedProgress * 30;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir * 0.7;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      
      // Body follows sword tip
      t.bodyTopX = t.swordBX * 0.5; t.bodyTopY = t.swordBY + 10;
      t.headX = t.swordBX * 0.6; t.headY = t.swordBY - 5;
      t.bodyBotY = -easedProgress * 15;
      t.bodyBotX = -dir * easedProgress * 8;
      
    } else if (attackType === 'slash') {
      // Mostly horizontal quick slice that emerges and retracts
      const extend = Math.sin(attackProgress * Math.PI); // Pulse out and back
      const swordLen = 65;
      t.swordAX = dir * 5; t.swordAY = -35;
      t.swordBX = t.swordAX + dir * extend * swordLen;
      t.swordBY = -35 + extend * 8; // slight downward trajectory
      
      // Thinner blade silhouette for the neutral light attack
      t.swordThickness = 2 + extend * 1.5;
      
      // Slight body pull
      t.bodyTopX = dir * extend * 10;
      t.headX = dir * extend * 12;
      
    } else if (attackType === 'thrust') {
      // Forward light "Uppercut" arc (starts low-forward, swings up to horizontal)
      const easedProgress = easeOutCubic(attackProgress);
      const startAngle = Math.PI * 0.35; // Low diagonal
      const currentAngle = startAngle - (easedProgress * startAngle); // Swings to 0 (horizontal)
      const swordLen = 70;
      
      t.swordAX = dir * 5; t.swordAY = -20;
      t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
      t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen;
      t.swordThickness = 3 + (1 - easedProgress) * 2;

      // Body lunges with the swing
      t.bodyTopX = dir * 15 * easedProgress;
      t.headX = dir * 20 * easedProgress;
      t.bodyBotX = -dir * 5 * easedProgress;
    } else if (attackType === 'up_slash') {
      // Overhead arc with sharp snap
      const easedProgress = attackProgress < 0.3 ? easeInCubic(attackProgress / 0.3) * 0.3 :
                            0.3 + easeOutCubic((attackProgress - 0.3) / 0.7) * 0.7;
      
      // Sword tip traces overhead arc
      const arcAngle = -Math.PI * 0.15 - (easedProgress * Math.PI * 0.95);
      const swordLen = 52;
      t.swordBX = dir * 15 + Math.cos(arcAngle) * swordLen * dir * 0.6;
      t.swordBY = -50 + Math.sin(arcAngle) * swordLen;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      
      // Body reaches up with sword
      t.bodyTopX = dir * (8 + easedProgress * 8); t.bodyTopY = -35 - easedProgress * 5;
      t.headX = dir * (12 + easedProgress * 10); t.headY = -45 - easedProgress * 8;
      
    } else if (attackType === 'sweep') {
      // Low sweeping arc
      const easedProgress = easeInOutCubic(attackProgress);
      
      // Sword sweeps low in wide horizontal arc
      const arcAngle = Math.PI * 0.15 - (easedProgress * Math.PI * 0.5);
      const swordLen = 58;
      t.swordBX = dir * (15 + easedProgress * 25) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -10 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      
      // Body low and following sweep
      t.bodyBotX = -dir * 10;
      t.bodyTopX = dir * (12 + easedProgress * 10); t.bodyTopY = -15;
      t.headX = dir * (18 + easedProgress * 8); t.headY = -25;
      
    } else if (attackType === 'down_thrust') {
      // Anticipation freeze (0-0.25) then violent plunge
      if (attackProgress < 0.25) {
        // Tucked anticipation pose
        const tuck = easeInCubic(attackProgress / 0.25);
        t.bodyTopX = 0; t.bodyTopY = -40 - tuck * 5;
        t.headX = 0; t.headY = -55 - tuck * 5;
        t.bodyBotY = -15 - tuck * 10; // Legs tucking up
        t.swordAX = 0; t.swordAY = -30 - tuck * 15;
        t.swordBX = 0; t.swordBY = -10 + tuck * 5; // Blade pulling up slightly
        t.swordThickness = 4;
      } else {
        // Explosive downward extension
        const plunge = easeInCubic((attackProgress - 0.25) / 0.75);
        t.bodyTopX = 0; t.bodyTopY = -45 + plunge * 10;
        t.headX = 0; t.headY = -60 + plunge * 10;
        t.bodyBotY = -25 + plunge * 15; // Legs extending
        t.swordAX = 0; t.swordAY = -45 + plunge * 30;
        t.swordBX = 0; t.swordBY = -5 + plunge * 60; // Blade shoots down
        t.swordThickness = 5 + plunge * 2;
      }
      
    } else if (attackType === 'heavy_slash') {
      // Three phases: Windup (0-0.3), Snap (0.3-0.4), Follow-through (0.4-1.0)
      if (attackProgress < 0.3) {
        // Windup: pull back
        const windup = easeInCubic(attackProgress / 0.3);
        const arcAngle = Math.PI * 0.9;
        const swordLen = 60;
        t.swordBX = -dir * (10 + windup * 15) + Math.cos(arcAngle) * swordLen * dir * 0.5;
        t.swordBY = -40 + Math.sin(arcAngle) * swordLen * 0.5;
        t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
        t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
        
        t.bodyTopX = -dir * (10 + windup * 5);
        t.headX = -dir * (15 + windup * 8);
      } else if (attackProgress < 0.4) {
        // Snap: explosive horizontal flash
        const snap = (attackProgress - 0.3) / 0.1;
        const arcAngle = Math.PI * 0.9 - (snap * Math.PI * 1.6);
        const swordLen = 62;
        t.swordBX = dir * (snap * 50) + Math.cos(arcAngle) * swordLen * dir * 0.5;
        t.swordBY = -35 + Math.sin(arcAngle) * swordLen * 0.5;
        t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
        t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
        
        t.bodyTopX = dir * (snap * 25);
        t.headX = dir * (snap * 30);
        t.swordThickness = 6 + snap * 2;
      } else {
        // Follow-through: low lean
        const follow = easeOutCubic((attackProgress - 0.4) / 0.6);
        const arcAngle = -Math.PI * 0.7;
        const swordLen = 60;
        t.swordBX = dir * (40 + follow * 5) + Math.cos(arcAngle) * swordLen * dir * 0.5;
        t.swordBY = -25 + Math.sin(arcAngle) * swordLen * 0.5;
        t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
        t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
        
        t.bodyTopX = dir * (25 - follow * 5); t.bodyTopY = -30 + follow * 5;
        t.headX = dir * (30 - follow * 5); t.headY = -40 + follow * 5;
        t.swordThickness = 8 - follow * 2;
      }
    }
  } else if (!isGrounded) {
    // Dynamic jump/fall poses - Sword kept behind back as per request
    const restSwordAX = -dir * 8;
    const restSwordAY = -25;
    const restSwordBX = -dir * 35;
    const restSwordBY = -50;

    if (vy < 0) {
      // Graceful anime leap
      const surge = Math.min(Math.abs(vy) * 0.05, 1.0);
      t.bodyTopY = -40;
      t.bodyTopX = dir * 5 * surge;
      t.headY = -60;
      t.headX = dir * 10 * surge;
      t.bodyBotY = -5;
      t.bodyBotX = -dir * 15 * surge;
      t.bodyThickness = 10;
      
      t.swordAX = restSwordAX; t.swordAY = restSwordAY;
      t.swordBX = restSwordBX; t.swordBY = restSwordBY;
    } else {
      // Falling/Hang-time
      const tilt = Math.min(vy * 0.05, 0.5);
      t.bodyTopX = dir * tilt * 5;
      t.headX = dir * tilt * 8;
      t.bodyBotY = -15;
      t.bodyBotX = 0;
      t.bodyThickness = 12;
      
      t.swordAX = restSwordAX; t.swordAY = restSwordAY;
      t.swordBX = restSwordBX; t.swordBY = restSwordBY;
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
    
    // Ninja run: Sword trails closer to body and is longer
    t.swordAX = -dir * 5; t.swordAY = -25 - bob;
    t.swordBX = -dir * 48; t.swordBY = -18 - bob;
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