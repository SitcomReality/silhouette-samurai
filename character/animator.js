export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching) {
  const dir = facing === 'right' ? 1 : -1;
  const baseY = isCrouching ? y - 40 : y - 50;
  
  char.core = { x, y: baseY };
  char.height = isCrouching ? 60 : 100;
  char.width = 20;
  
  // Dead state - collapsed on ground
  if (state === 'dead') {
    char.core.y = y - 15;
    char.height = 30;
    char.head = { x: x + dir * 40, y: y - 20, radius: 13 };
    char.arm = { length: 50, angle: dir * 0.3, origin: { x: x + dir * 10, y: y - 15 } };
    char.legs = { leftAngle: -0.2, rightAngle: 0.1, length: 40 };
    return;
  }

  // Hit state - recoil
  if (state === 'hit') {
    const reel = Math.sin(stateTime * 15) * 5;
    char.core.y = baseY;
    char.head = { x: x, y: baseY - char.height - 5, radius: 13 };
    char.arm = { length: 45, angle: -dir * 1.4, origin: { x: x - dir * 8, y: baseY - 35 } };
    char.legs = { leftAngle: -dir * 0.3, rightAngle: dir * 0.2, length: 45 };
    return;
  }

  // Attack animations - ballet ninja style
  if (state === 'attack') {
    if (attackType === 'slide') {
      // Low sweeping kick - body leans into it
      const sweep = Math.sin(attackProgress * Math.PI);
      char.core.y = y - 30;
      char.core.x = x + dir * 5 * sweep;
      char.height = 50 + sweep * 20;
      char.head = { x: x + dir * 10 * sweep, y: y - 55 - sweep * 10, radius: 13 };
      char.arm = { length: 60 + sweep * 30, angle: dir * (0.3 + sweep * 0.8), origin: { x, y: y - 30 } };
      char.legs = { leftAngle: dir * (0.5 + sweep * 0.3), rightAngle: dir * (0.2 + sweep * 0.5), length: 40 + sweep * 15 };
      return;
    }

    if (attackType === 'uppercut') {
      // Rising uppercut - whole body extends upward
      const rise = Math.sin(attackProgress * Math.PI);
      const extend = attackProgress > 0.4 && attackProgress < 0.8 ? rise : 0;
      char.core.y = baseY - extend * 15;
      char.core.x = x + dir * 5 * extend;
      char.height = 90 + extend * 20;
      char.head = { x: x + dir * 8, y: baseY - char.height - extend * 25, radius: 13 };
      char.arm = { length: 65 + extend * 30, angle: -Math.PI / 2 + dir * 0.2, origin: { x, y: baseY - 45 } };
      char.legs = { leftAngle: -0.1, rightAngle: 0.1, length: 45 };
      return;
    }

    if (attackType === 'roundhouse') {
      // Spinning kick - whole body rotates
      const spin = attackProgress * Math.PI * 1.5;
      const lean = Math.sin(spin) * 15;
      char.core.y = baseY;
      char.core.x = x + dir * lean * 0.5;
      char.height = 95;
      char.head = { x: x + dir * lean * 0.7, y: baseY - char.height, radius: 13 };
      char.arm = { length: 50, angle: -spin * dir * 0.8, origin: { x, y: baseY - 55 } };
      char.legs = { leftAngle: dir * 0.1, rightAngle: dir * (spin - 0.3), length: 60 };
      return;
    }

    if (attackType === 'slam') {
      // Overhead slam - dramatic arc
      const phase = attackProgress;
      if (phase < 0.5) {
        // Wind up - reach high
        const reach = phase * 2;
        char.core.y = baseY - reach * 10;
        char.height = 95 + reach * 15;
        char.head = { x: x, y: baseY - char.height - reach * 20, radius: 13 };
        char.arm = { length: 75 + reach * 25, angle: -Math.PI / 2 + dir * 0.15, origin: { x, y: baseY - 60 } };
        char.legs = { leftAngle: -0.15, rightAngle: 0.15, length: 45 };
      } else {
        // Slam down - compress
        const slam = (phase - 0.5) * 2;
        char.core.y = baseY + slam * 5;
        char.height = 95 - slam * 15;
        char.head = { x: x + dir * 10 * slam, y: baseY - char.height, radius: 13 };
        char.arm = { length: 85, angle: Math.PI / 2 + dir * 0.2, origin: { x, y: baseY - 40 } };
        char.legs = { leftAngle: -0.2 - slam * 0.2, rightAngle: 0.2 + slam * 0.2, length: 45 };
      }
      return;
    }

    if (attackType === 'aerial') {
      // Aerial strike - graceful arc
      const arc = Math.sin(attackProgress * Math.PI);
      char.core.x = x + dir * 10 * arc;
      char.head = { x: x + dir * 15 * arc, y: baseY - char.height, radius: 13 };
      char.arm = { length: 60 + arc * 25, angle: dir * (0.5 + arc * 0.7), origin: { x, y: baseY - 55 } };
      char.legs = { leftAngle: -dir * 0.5, rightAngle: dir * (0.4 + arc * 0.3), length: 50 };
      return;
    }
  }

  // Airborne - graceful jump pose
  if (!isGrounded) {
    const tilt = Math.min(Math.max(vy * 0.03, -0.3), 0.3);
    char.core.x = x + dir * tilt * 8;
    char.head = { x: x + dir * tilt * 10, y: baseY - char.height, radius: 13 };
    char.arm = { length: 0, angle: 0, origin: { x, y: baseY - 50 } }; // Arms at sides
    char.legs = { leftAngle: tilt - 0.15, rightAngle: tilt + 0.15, length: 48 };
    return;
  }

  // Running - dynamic stride
  if (state === 'run') {
    const cycle = stateTime * 14;
    const stride = Math.sin(cycle) * 0.5;
    const bob = Math.abs(Math.cos(cycle)) * 4;
    
    char.core.y = baseY - bob;
    char.core.x = x + dir * stride * 3;
    char.head = { x: x + dir * (5 + stride * 5), y: baseY - char.height - bob, radius: 13 };
    char.arm = { length: 0, angle: 0, origin: { x, y: baseY - 50 } }; // Minimal arm swing
    char.legs = { leftAngle: stride, rightAngle: -stride, length: 48 };
    return;
  }

  // Idle - standing straight, arms invisible at sides
  const bob = Math.sin(stateTime * 3) * 2;
  char.head = { x, y: baseY - char.height + bob, radius: 13 };
  char.arm = { length: 0, angle: 0, origin: { x, y: baseY - 40 } }; // No visible arm
  char.legs = { leftAngle: 0, rightAngle: 0, length: 48 };
}