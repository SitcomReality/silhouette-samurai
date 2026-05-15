export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching) {
  const dir = facing === 'right' ? 1 : -1;
  const baseY = isCrouching ? y - 35 : y - 65;
  
  char.core = { x, y: baseY };
  char.height = isCrouching ? 30 : 50;
  char.width = 20;
  
  // Dead state - collapsed on ground
  if (state === 'dead') {
    char.core.y = y - 10;
    char.height = 20;
    char.head = { x: x + dir * 40, y: y - 15, radius: 13 };
    char.arm = { length: 50, angle: dir * 0.3, origin: { x: x + dir * 10, y: y - 10 } };
    char.legs = { leftAngle: 1.5, rightAngle: 1.4, length: 40 };
    return;
  }

  // Hit state - recoil
  if (state === 'hit') {
    char.head = { x: x - dir * 5, y: char.core.y - char.height / 2 - 8, radius: 13 };
    char.arm = { length: 45, angle: -dir * 1.4, origin: { x: x - dir * 8, y: char.core.y - 15 } };
    char.legs = { leftAngle: -dir * 0.3, rightAngle: dir * 0.2, length: 40 };
    return;
  }

  // Attack animations - ballet ninja style
  if (state === 'attack') {
    if (attackType === 'jab') {
      const punch = Math.sin(attackProgress * Math.PI);
      char.head = { x: x + dir * 3, y: char.core.y - char.height / 2 - 8, radius: 13 };
      char.arm = { length: 35 + punch * 15, angle: dir * 0.1, origin: { x, y: char.core.y - 10 } };
      char.legs = { leftAngle: 0.1, rightAngle: -0.1, length: 40 };
      return;
    }

    if (attackType === 'lunge') {
      const thrust = Math.sin(attackProgress * Math.PI);
      char.head = { x: x + dir * 10 * thrust, y: char.core.y - char.height / 2 - 8, radius: 13 };
      char.arm = { length: 55 + thrust * 20, angle: dir * 0.2, origin: { x, y: char.core.y - 10 } };
      char.legs = { leftAngle: dir * 0.5, rightAngle: -dir * 0.3, length: 42 };
      return;
    }

    if (attackType === 'uppercut_ground' || attackType === 'uppercut_air') {
      const rise = Math.sin(attackProgress * Math.PI);
      char.core.y = baseY - rise * 20;
      char.height = 60;
      char.head = { x: x + dir * 8, y: char.core.y - char.height / 2 - 10, radius: 13 };
      char.arm = { length: 70, angle: -Math.PI / 2 + dir * 0.2, origin: { x, y: char.core.y - 20 } };
      char.legs = { leftAngle: -0.1, rightAngle: 0.1, length: 40 + rise * 10 };
      return;
    }

    if (attackType === 'slide_tackle') {
      const sweep = Math.sin(attackProgress * Math.PI);
      char.core.y = y - 20;
      char.height = 25;
      char.head = { x: x + dir * 20 * sweep, y: char.core.y - 20, radius: 13 };
      char.arm = { length: 55, angle: dir * (0.4 + sweep * 0.7), origin: { x, y: char.core.y } };
      char.legs = { leftAngle: dir * (1.3 + sweep * 0.2), rightAngle: dir * (0.6 + sweep * 0.4), length: 30 };
      return;
    }

    if (attackType === 'dive_slide') {
      const dive = Math.sin(attackProgress * Math.PI);
      char.core.y = y - 30 + dive * 10;
      char.height = 35;
      char.head = { x: x + dir * 15 * dive, y: char.core.y - 25, radius: 13 };
      char.arm = { length: 60, angle: dir * (0.5 + dive * 0.6), origin: { x, y: char.core.y - 5 } };
      char.legs = { leftAngle: dir * (0.9 + dive * 0.4), rightAngle: dir * (0.4 + dive * 0.5), length: 38 };
      return;
    }

    if (attackType === 'air_slam') {
      const phase = attackProgress;
      if (phase < 0.7) {
        const reach = phase / 0.7;
        char.core.y = baseY - reach * 15;
        char.height = 60;
        char.head = { x: x, y: char.core.y - 40, radius: 13 };
        char.arm = { length: 80, angle: -Math.PI / 2, origin: { x, y: char.core.y - 20 } };
        char.legs = { leftAngle: -0.2, rightAngle: 0.2, length: 50 };
      } else {
        const slam = (phase - 0.7) / 0.3;
        char.core.y = y - 30;
        char.height = 40;
        char.head = { x: x + dir * 15 * slam, y: char.core.y - 25, radius: 13 };
        char.arm = { length: 80, angle: Math.PI / 2, origin: { x, y: char.core.y - 10 } };
        char.legs = { leftAngle: -0.8, rightAngle: 0.8, length: 30 };
      }
      return;
    }

    if (attackType === 'roundhouse') {
      const spin = attackProgress * Math.PI * 2.0;
      char.core.y = baseY;
      char.height = 50;
      char.head = { x, y: char.core.y - char.height/2 - 8, radius: 13 };
      char.arm = { length: 0, angle: 0, origin: { x, y: char.core.y } };
      char.legs = { leftAngle: dir * 0.2, rightAngle: dir * (spin + 1.5), length: 55 };
      return;
    }

    if (attackType === 'brake_stop') {
      const skid = Math.sin(attackProgress * Math.PI);
      char.core.y = baseY + skid * 3;
      char.head = { x: x - dir * 8 * skid, y: char.core.y - char.height / 2 - 8, radius: 13 };
      char.arm = { length: 40, angle: -dir * 0.8, origin: { x, y: char.core.y } };
      char.legs = { leftAngle: dir * 0.6, rightAngle: -dir * 0.4, length: 40 };
      return;
    }
  }

  // Airborne
  if (!isGrounded) {
    const tilt = Math.min(Math.max(vy * 0.03, -0.3), 0.3);
    char.head = { x: x + dir * tilt * 10, y: char.core.y - char.height / 2 - 8, radius: 13 };
    char.arm = { length: 0, angle: 0, origin: { x, y: char.core.y } };
    char.legs = { leftAngle: tilt - 0.2, rightAngle: tilt + 0.2, length: 45 };
    return;
  }

  // Running
  if (state === 'run') {
    const cycle = stateTime * 14;
    const stride = Math.sin(cycle) * 0.6;
    const bob = Math.abs(Math.cos(cycle)) * 5;
    char.core.y = baseY + bob;
    char.head = { x: x + dir * 5, y: char.core.y - char.height / 2 - 8, radius: 13 };
    char.arm = { length: 0, angle: 0, origin: { x, y: char.core.y } };
    char.legs = { leftAngle: stride, rightAngle: -stride, length: 45 };
    return;
  }

  // Idle
  const bob = Math.sin(stateTime * 3) * 2;
  char.head = { x, y: char.core.y - char.height / 2 - 8 + bob, radius: 13 };
  char.arm = { length: 0, angle: 0, origin: { x, y: char.core.y } };
  char.legs = { leftAngle: 0.1, rightAngle: -0.1, length: 40 };
}