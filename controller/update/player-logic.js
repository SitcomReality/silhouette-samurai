import { determineAttack, getDirectionInput } from '../../input/controls.js';
import { triggerAttack } from '../../combat/attacks/trigger.js';
import { resolveAttackHits } from '../../combat/attacks/resolve.js';
import { ATTACK_CONFIG } from '../../combat/attacks/config.js';

export function updatePlayer(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const prevJumpPressed = controller.prevKeys['KeyW'] || controller.prevKeys['ArrowUp'] || controller.prevKeys['Space'];
  const jumpJustPressed = jumpPressed && !prevJumpPressed;

  // 1. Timers & State Prep
  p.stateTime += dt;
  if (p.hitstunTimer > 0) p.hitstunTimer -= dt;
  if (p.staggerTimer > 0) p.staggerTimer -= dt;
  if (p.tripTimer > 0) p.tripTimer -= dt;
  if (p.counterWindow > 0) p.counterWindow -= dt;
  if (p.bladeDanceCooldown > 0) p.bladeDanceCooldown -= dt;
  if (p.dodgeTimer > 0) p.dodgeTimer -= dt;
  if (p.jumpBuffer > 0) p.jumpBuffer -= dt;
  if (jumpJustPressed) p.jumpBuffer = 0.15;

  if (p.bladeDanceState) {
    controller.bladeDance.updateInputWindow(p, dt);
  }

  // 2. Sliding & Crouching
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');
  p.isCrouching = down && p.isGrounded && !isSliding && p.state !== 'attack';

  // 3. Power Regeneration
  const baseRegenRate = 35;
  if (!p.isGrounded) {
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 0.2 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 2.5 * dt);
    p.airTime += dt; p.slideTime = 0; p.groundStandTime = 0;
  } else if (isSliding || p.isCrouching) {
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 3.5 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 0.3 * dt);
    p.slideTime += dt; p.airTime = 0; p.groundStandTime = 0;
  } else {
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * dt);
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * dt);
    p.groundStandTime += dt; p.airTime = 0; p.slideTime = 0;
  }

  // 4. Input Buffering & Attack Triggers
  handlePlayerAttackBuffer(controller, dt);

  // 5. Physics & Movement (if not in special states)
  if (p.state === 'stagger' || p.state === 'trip' || p.state === 'dead') {
     p.vx *= (p.state === 'trip' ? 0.95 : 0.85);
     return isSliding;
  }

  if (p.state === 'dodge') {
    if (p.dodgeTimer <= 0) p.state = 'idle';
    p.vx *= 0.92;
    return isSliding;
  }

  if (p.isBlocking && p.state !== 'attack') {
    p.state = 'block';
    p.vx *= 0.85;
  }

  if (p.state === 'attack') {
    updatePlayerAttackState(controller, dt);
  } else {
    updatePlayerMovement(controller, dt, isSliding);
  }

  return isSliding;
}

function handlePlayerAttackBuffer(controller, dt) {
  const p = controller.player;
  if (!p.attackBuffer || p.attackBuffer.time <= 0) return;
  
  p.attackBuffer.time -= dt;
  const oldJ = controller.keys['KeyJ'];
  controller.keys['KeyJ'] = true;
  const bufferedType = determineAttack(controller);
  controller.keys['KeyJ'] = oldJ;

  let canAttack = false;
  if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block' && p.state !== 'stagger') {
    canAttack = true;
  } else if (p.state === 'attack' && p.attackFrameData) {
    const currentFrame = Math.floor(p.attackFrameTime * 60);
    if (p.attackFrameData.canCancel(currentFrame)) canAttack = true;
    if (p.bladeDanceState && controller.bladeDance.canAdvanceChain(p)) {
      const dir = getDirectionInput(controller);
      const next = controller.bladeDance.advanceChain(p, dir);
      if (next) { triggerAttack(controller, next); p.attackBuffer = null; return; }
    }
    if (p.canCounter && p.counterWindow > 0) canAttack = true;
  }
  
  if (canAttack && bufferedType) {
    triggerAttack(controller, bufferedType);
    p.attackBuffer = null;
  }
}

function updatePlayerAttackState(controller, dt) {
  const p = controller.player;
  const currentFrame = Math.floor(p.attackFrameTime * 60);
  const frameData = p.attackFrameData;
  if (!frameData) { p.state = 'idle'; p.attackType = 'none'; return; }

  p.attackFrameTime += dt;

  if (currentFrame >= frameData.totalFrames) {
    p.state = 'idle'; p.attackType = 'none'; p.attackFrameTime = 0;
    p.attackFrameData = null; p.attackHitEntities.clear();
    if (p.bladeDanceState && !controller.bladeDance.canAdvanceChain(p)) {
      controller.bladeDance.endChain(p);
    }
    return;
  }

  if (p.bladeDanceState && frameData.isInRecovery(currentFrame)) {
    const recP = (currentFrame - (frameData.startup + frameData.active)) / frameData.recovery;
    if (recP < 0.7 && p.bladeDanceInputWindow === 0) {
      p.bladeDanceInputWindow = (p.bladeDanceState === 'linker' && p.bladeDanceCanRepeatLinker) 
        ? controller.bladeDance.repeatWindow : controller.bladeDance.inputWindow;
    }
  }

  p.vx *= (p.isGrounded ? 0.93 : 0.97);
  resolveAttackHits(controller);
}

function updatePlayerMovement(controller, dt, isSliding) {
  const p = controller.player;
  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  
  let isMovingInput = false;
  const accel = (p.isGrounded ? 45 : 12) * dt;
  let friction = p.isGrounded ? (isSliding ? 0.992 : (p.isCrouching ? 0.82 : 0.90)) : 0.985;

  if (controller.keys['KeyA'] || controller.keys['ArrowLeft']) {
    if (!p.isCrouching && !isSliding) p.vx -= accel;
    else if (p.isCrouching && !isSliding) p.vx -= accel * 0.4;
    if (!isSliding) p.facing = 'left';
    isMovingInput = true;
  } else if (controller.keys['KeyD'] || controller.keys['ArrowRight']) {
    if (!p.isCrouching && !isSliding) p.vx += accel;
    else if (p.isCrouching && !isSliding) p.vx += accel * 0.4;
    if (!isSliding) p.facing = 'right';
    isMovingInput = true;
  }
  p.vx *= friction;

  // Jump Logic
  if (p.jumpBuffer > 0 && !down) {
    if (p.isGrounded) {
      p.vy = -20; p.isGrounded = false; p.doubleJumped = false; p.state = 'run'; p.jumpBuffer = 0;
      controller.visualFx.push({
        id: `fx_jump_${controller.fxId++}`, type: 'streak', x: p.x, y: p.y - 20,
        angle: Math.atan2(p.vy, p.vx), length: 120, width: 25, life: 0, maxLife: 0.3
      });
      if (controller.audioEngine) controller.audioEngine.onJump();
    } else if (!p.doubleJumped && p.aerialPower >= 20) {
      const pwr = 0.6 + (p.aerialPower / 100) * 0.4;
      p.vy = -16 * pwr; p.aerialPower -= 20; p.doubleJumped = true; p.jumpBuffer = 0;
      controller.visualFx.push({
        id: `fx_djump_${controller.fxId++}`, type: 'streak', x: p.x, y: p.y - 40,
        angle: Math.atan2(p.vy, p.vx || (p.facing === 'right' ? 0.1 : -0.1)),
        length: 100, width: 20, life: 0, maxLife: 0.25
      });
      if (controller.audioEngine) controller.audioEngine.onJump();
    }
  }

  if (p.isGrounded) p.state = isMovingInput && Math.abs(p.vx) > 1 ? 'run' : 'idle';
}