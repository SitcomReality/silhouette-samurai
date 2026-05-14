export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching) {
  const dir = facing === 'right' ? 1 : -1;
  const baseY = isCrouching ? y - 40 : y - 50;
  
  char.core = { x, y: baseY };
  char.height = isCrouching ? 60 : 100;
  char.width = 20;
  
  if (state === 'dead') {
    char.core.y = y - 15;
    char.height = 30;
    char.head = { x: x + dir * 40, y: y - 20, radius: 13 };
    char.arm = { length: 50, angle: dir * 0.3, origin: { x: x + dir * 10, y: y - 15 } };
    char.legs = { leftAngle: -0.2, rightAngle: 0.1, length: 40 };
    return;
  }

  if (state === 'hit') {
    const reel = Math.sin(stateTime * 15) * 8;
    char.core.y = baseY - 5;
    char.head = { x: x - dir * 15, y: baseY - char.height + reel, radius: 13 };
    char.arm = { length: 45, angle: -dir * 1.2, origin: { x: x - dir * 10, y: baseY - 30 } };
    char.legs = { leftAngle: -dir * 0.3, rightAngle: dir * 0.2, length: 45 };
    return;
  }

  if (state === 'attack') {
    if (attackType === 'slide') {
      char.core.y = y - 25;
      char.height = 50;
      char.head = { x: x + dir * 5, y: y - 45, radius: 13 };
      const reach = 60 * Math.sin(attackProgress * Math.PI);
      char.arm = { length: 50 + reach, angle: dir * 0.1, origin: { x, y: y - 25 } };
      char.legs = { leftAngle: dir * 0.5, rightAngle: dir * 0.3, length: 40 };
      return;
    }

    if (attackType === 'uppercut') {
      const ext = Math.sin(attackProgress * Math.PI);
      char.head = { x: x + dir * 10, y: baseY - char.height - 10 * ext, radius: 13 };
      char.arm = { length: 70, angle: -Math.PI / 2 + dir * 0.3 + ext * 0.5, origin: { x, y: baseY - 40 } };
      char.legs = { leftAngle: 0, rightAngle: 0, length: 45 };
      return;
    }

    if (attackType === 'roundhouse') {
      const angle = attackProgress * Math.PI * 1.8;
      char.head = { x: x - dir * 5, y: baseY - char.height, radius: 13 };
      char.arm = { length: 40, angle: -angle * dir, origin: { x, y: baseY - 40 } };
      const legAngle = angle - Math.PI / 2;
      char.legs = { leftAngle: 0, rightAngle: dir * legAngle, length: 50 };
      return;
    }

    if (attackType === 'slam') {
      const phase = attackProgress < 0.5 ? attackProgress * 2 : 1;
      const armY = phase < 1 ? -120 : -30;
      const armAngle = phase < 1 ? -Math.PI / 2 : Math.PI / 2;
      
      char.head = { x: x + dir * 15, y: baseY - char.height + (phase < 1 ? -20 : 0), radius: 13 };
      char.arm = { length: 80, angle: armAngle, origin: { x, y: baseY + armY } };
      char.legs = { leftAngle: -0.1, rightAngle: 0.1, length: 45 };
      return;
    }

    if (attackType === 'aerial') {
      const ext = Math.sin(attackProgress * Math.PI);
      char.head = { x: x + dir * 10, y: baseY - char.height, radius: 13 };
      char.arm = { length: 55 + ext * 20, angle: dir * (0.8 + ext * 0.5), origin: { x, y: baseY - 50 } };
      char.legs = { leftAngle: -dir * 0.4, rightAngle: dir * 0.6, length: 45 };
      return;
    }
  }

  if (!isGrounded) {
    const tilt = Math.sign(vy) * 0.2;
    char.head = { x: x + dir * 8, y: baseY - char.height, radius: 13 };
    char.arm = { length: 30, angle: dir * (tilt - 0.3), origin: { x, y: baseY - 50 } };
    char.legs = { leftAngle: tilt - 0.2, rightAngle: tilt + 0.2, length: 45 };
    return;
  }

  if (state === 'run') {
    const cycle = stateTime * 14;
    const stride = Math.sin(cycle) * 0.6;
    const bob = Math.abs(Math.cos(cycle)) * 3;
    
    char.core.y = baseY - bob;
    char.head = { x: x + dir * 10, y: baseY - char.height - bob, radius: 13 };
    char.arm = { length: 35, angle: dir * stride, origin: { x, y: baseY - 50 - bob } };
    char.legs = { leftAngle: stride, rightAngle: -stride, length: 45 };
    return;
  }

  const bob = Math.sin(stateTime * 4) * 3;
  char.head = { x: x + dir * 2, y: baseY - char.height + bob, radius: 13 };
  char.arm = { length: 25, angle: dir * 0.1, origin: { x, y: baseY - 40 + bob } };
  char.legs = { leftAngle: 0, rightAngle: 0, length: 45 };
}