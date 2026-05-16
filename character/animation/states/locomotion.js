export function applyLocomotionPose(t, dir, state, stateTime, isGrounded, vy, isCrouching, isSliding) {
  if (!isGrounded) {
    const restSwordAX = -dir * 8;
    const restSwordAY = -25;
    const restSwordBX = -dir * 35;
    const restSwordBY = -50;

    if (vy < 0) {
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
      const tilt = Math.min(vy * 0.05, 0.5);
      t.bodyTopX = dir * tilt * 5;
      t.headX = dir * tilt * 8;
      t.bodyBotY = -15;
      t.bodyBotX = 0;
      t.bodyThickness = 12;
      t.swordAX = restSwordAX; t.swordAY = restSwordAY;
      t.swordBX = restSwordBX; t.swordBY = restSwordBY;
    }
    return;
  }

  if (isSliding || isCrouching) {
    if (isSliding) {
      t.bodyBotX = dir * 15;
      t.bodyTopX = -dir * 20; t.bodyTopY = -20;
      t.headX = -dir * 30; t.headY = -30;
      t.bodyThickness = 10;
      t.swordAX = dir * 10; t.swordAY = -10;
      t.swordBX = dir * 45; t.swordBY = -10;
    } else {
      t.bodyTopX = -dir * 10;
      t.bodyTopY = -25;
      t.headX = dir * 5; t.headY = -35;
      t.bodyBotX = 0;
      t.swordAX = dir * 15; t.swordAY = -20;
      t.swordBX = dir * 30; t.swordBY = -10;
    }
    return;
  }

  if (state === 'run') {
    const cycle = stateTime * 14;
    const bob = Math.abs(Math.cos(cycle)) * 3;
    const lean = 15;
    t.bodyBotY = -bob;
    t.bodyTopX = dir * lean; t.bodyTopY = -35 - bob;
    t.headX = dir * (lean + 5); t.headY = -50 - bob;
    
    const stride = Math.sin(cycle);
    t.bulgeAX = dir * stride * 15; t.bulgeAY = -10; t.bulgeAR = 8;
    t.bulgeBX = -dir * stride * 15; t.bulgeBY = -10; t.bulgeBR = 8;
    
    t.swordAX = -dir * 5; t.swordAY = -25 - bob;
    t.swordBX = -dir * 48; t.swordBY = -18 - bob;
    return;
  }

  // Idle
  const bob = Math.sin(stateTime * 3) * 2;
  t.headY = -55 + bob;
  t.bodyTopY = -35 + bob * 0.5;
  t.headX = Math.sin(stateTime * 2) * 1.5;
}