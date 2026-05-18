export function updatePlayerTimersAndRegen(controller, dt) {
  const p = controller.player;
  p.stateTime += dt;
  
  if (p.hitstunTimer > 0) p.hitstunTimer -= dt;
  if (p.staggerTimer > 0) p.staggerTimer -= dt;
  if (p.tripTimer > 0) p.tripTimer -= dt;
  if (p.counterWindow > 0) p.counterWindow -= dt;
  if (p.bladeDanceCooldown > 0) p.bladeDanceCooldown -= dt;
  if (p.dodgeTimer > 0) p.dodgeTimer -= dt;
  


  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');
  
  p.isCrouching = down && p.isGrounded && !isSliding && p.state !== 'attack';

  if (!p.isGrounded) {
    p.airTime += dt;
    p.slideTime = 0;
    p.groundStandTime = 0;
  } else if (isSliding || p.isCrouching) {
    p.slideTime += dt;
    p.airTime = 0;
    p.groundStandTime = 0;
  } else if (p.isGrounded) {
    p.groundStandTime += dt;
    p.airTime = 0;
    p.slideTime = 0;
  }

  const baseRegenRate = 35;
  if (!p.isGrounded) {
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 0.2 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 2.5 * dt);
  } else if (isSliding) {
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 3.5 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 0.3 * dt);
  } else if (p.isCrouching) {
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 1.5 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 0.8 * dt);
  } else {
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * dt);
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * dt);
  }

  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const prevJumpPressed = controller.prevKeys['KeyW'] || controller.prevKeys['ArrowUp'] || controller.prevKeys['Space'];
  const jumpJustPressed = jumpPressed && !prevJumpPressed;

  if (jumpJustPressed) {
    p.jumpBuffer = 0.15;
  }
  if (p.jumpBuffer > 0) {
    p.jumpBuffer -= dt;
  }

  if (p.state === 'attack' && p.jumpBuffer > 0 && !down && p.attackFrameData) {
    const currentFrame = Math.floor(p.attackFrameTime * 60);
    const isRecoveryCancel = p.attackFrameData.isInRecovery(currentFrame);
    const isHitCancel = p.attackHitConfirmed && p.attackFrameTime < p.attackFrameData.getDuration() * 0.6;
    if (isRecoveryCancel || isHitCancel) {
      p.state = 'idle';
      p.attackType = 'none';
      p.isSliding = false;
      p.attackFrameTime = 0;
    }
  }

  if (p.isBlocking && p.state !== 'attack' && p.state !== 'dead') {
    p.state = 'block';
    p.vx *= 0.85;
  }
}