export function updatePlayerPhysics(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');

  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const prevJumpPressed = controller.prevKeys['KeyW'] || controller.prevKeys['ArrowUp'] || controller.prevKeys['Space'];
  const jumpJustPressed = jumpPressed && !prevJumpPressed;

  if (p.state === 'dodge') {
    if (p.dodgeTimer <= 0) {
      p.state = 'idle';
    } else {
      p.vx *= 0.92;
      return; 
    }
  }
  
  if (p.staggerTimer > 0) {
    p.state = 'stagger';
    p.vx *= 0.85;
    return;
  }
  
  if (p.tripTimer > 0) {
    p.state = 'trip';
    return;
  }
  
  if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block') {
    let isMoving = false;
    const accel = (p.isGrounded ? 45 : 12) * dt;
    
    let friction = 0.90;
    if (!p.isGrounded) {
      friction = 0.985;
    } else if (isSliding) {
      friction = 0.992;
    } else if (p.isCrouching) {
      friction = 0.82;
    }

    if (controller.keys['KeyA'] || controller.keys['ArrowLeft']) {
      if (!p.isCrouching && !isSliding) {
        p.vx -= accel;
      } else if (p.isCrouching && !isSliding) {
        p.vx -= accel * 0.4;
      }
      if (!isSliding) p.facing = 'left';
      isMoving = true;
    } else if (controller.keys['KeyD'] || controller.keys['ArrowRight']) {
      if (!p.isCrouching && !isSliding) {
        p.vx += accel;
      } else if (p.isCrouching && !isSliding) {
        p.vx += accel * 0.4;
      }
      if (!isSliding) p.facing = 'right';
      isMoving = true;
    }
    
    p.vx *= friction;

    if (p.jumpBuffer > 0 && !down) {
      if (p.isGrounded) {
        p.vy = -20;
        p.isGrounded = false;
        p.doubleJumped = false;
        p.state = 'run';
        p.jumpBuffer = 0;
        
        const jumpAngle = Math.atan2(p.vy, p.vx);
        controller.visualFx.push({
          id: `fx_jump_${controller.fxId++}`,
          type: 'streak',
          x: p.x,
          y: p.y - 20,
          angle: jumpAngle,
          length: 120,
          width: 25,
          life: 0,
          maxLife: 0.3
        });

        if (controller.audioEngine) {
          controller.audioEngine.onJump();
        }
      } else if (!p.doubleJumped && jumpJustPressed && p.aerialPower >= 20) {
        const jumpPower = 0.6 + (p.aerialPower / 100) * 0.4;
        p.vy = -16 * jumpPower;
        p.aerialPower -= 20;
        p.doubleJumped = true;
        p.jumpBuffer = 0;

        const jumpAngle = Math.atan2(p.vy, p.vx || (p.facing === 'right' ? 0.1 : -0.1));
        controller.visualFx.push({
          id: `fx_djump_${controller.fxId++}`,
          type: 'streak',
          x: p.x,
          y: p.y - 40,
          angle: jumpAngle,
          length: 100,
          width: 20,
          life: 0,
          maxLife: 0.25
        });

        if (controller.audioEngine) {
          controller.audioEngine.onJump();
        }
      }
    }

    if (p.isGrounded) {
      p.state = isMoving && Math.abs(p.vx) > 1 ? 'run' : 'idle';
    }
  } else if (p.state === 'attack') {
    const friction = p.isGrounded ? 0.93 : 0.97;
    p.vx *= friction;
  }
}