import { applyReactionPose } from './animation/states/reactions.js';
import { applyLocomotionPose } from './animation/states/locomotion.js';
import { applyBasicAttackPose } from './animation/attacks/basic.js';
import { applyFinisherPose } from './animation/attacks/dance.js';

export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt, isSliding = false, scale = 1.0, frameData = null, extraState = null) {
  const dir = facing === 'right' ? 1 : -1;
  const t = char.target;

  // Default / Idle state - iaijutsu ready pose baseline
  t.bodyBotX = 0; t.bodyBotY = 0;
  t.bodyTopX = -dir * 3; t.bodyTopY = -35;
  t.bodyThickness = 12;
  t.headX = -dir * 5; t.headY = -55; t.headR = 13;
  t.bulgeAX = 0; t.bulgeAY = -20; t.bulgeAR = 0;
  t.bulgeBX = 0; t.bulgeBY = -20; t.bulgeBR = 0;
  
  // Idle: sword resting diagonally behind back (iaijutsu ready) — origin locked to body center (no horizontal offset)
  t.swordAX = 0; t.swordAY = -25;
  t.swordBX = -dir * 35; t.swordBY = -50;
  t.swordThickness = 3;
  t.rotation = 0;

  // Apply state-specific poses
  if (!applyReactionPose(t, dir, state)) {
    if (state === 'attack') {
      // Try finisher first (for combo finishers), fall back to unified attack
      if (!applyFinisherPose(t, dir, attackType, attackProgress, frameData)) {
        applyBasicAttackPose(t, dir, attackType, attackProgress, frameData);
      }
    } else {
      applyLocomotionPose(t, dir, state, stateTime, isGrounded, vy, isCrouching, isSliding);
    }
  }

  // Ensure sword origin stays inside the body (prevent horizontal movement) before scaling
  t.swordAX = 0;
  
  // Calculate target rotation for air attacks
  let rotLerpRate = 20;
  if (!isGrounded && extraState) {
    const isAttacking = state === 'attack' && attackType === 'unified';
    const shouldRotate = (isAttacking && extraState.attackIsDirectional) || (extraState.isCharging && extraState.isMoving);
    
    if (shouldRotate) {
      const targetRot = extraState.aimAngle + Math.PI / 2;
      
      let rotDiff = targetRot;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

      if (extraState.isCharging && !isAttacking) {
        const p = extraState.chargeProgress || 0;
        const easedP = Math.pow(p, 1.25);
        t.rotation = rotDiff * easedP;
        rotLerpRate = 10;
      } else {
        const p = extraState.attackChargePower !== undefined ? extraState.attackChargePower : 1.0;
        const easedP = Math.pow(p, 1.25);
        t.rotation = rotDiff * easedP;
        rotLerpRate = 25;
      }
      
      // Sleek body pose when rotating/diving, but sword stays relative
      if (extraState.isCharging && state !== 'attack') {
        t.bodyBotX = 0; t.bodyBotY = 0;
        t.bodyTopX = 0; t.bodyTopY = -40;
        t.headX = 0; t.headY = -60;
      }
    } else {
      t.rotation = 0;
      rotLerpRate = 8; // Faster recovery if not directional to avoid sticking to angles
    }

    // Apply "pull back" to sword during charge without snapping to center
    if (extraState.isCharging && state !== 'attack') {
        const p = extraState.chargeProgress || 0;
        const currentSwordBX = t.swordBX;
        const currentSwordBY = t.swordBY;
        // Shift sword further back based on charge progress
        t.swordBX = currentSwordBX - dir * p * 25;
        t.swordBY = currentSwordBY - p * 15;
        t.swordThickness = 3 + p * 2;
    }
  } else if (isGrounded) {
    rotLerpRate = 15;
  }

  // Apply scale to all calculated target positions
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

  const rotLerpFactor = 1.0 - Math.exp(-rotLerpRate * dtSafe);
  let rotDiff = t.rotation - (c.rotation || 0);
  while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
  while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
  c.rotation = (c.rotation || 0) + rotDiff * rotLerpFactor;
  while (c.rotation > Math.PI) c.rotation -= Math.PI * 2;
  while (c.rotation < -Math.PI) c.rotation += Math.PI * 2;

  // Apply rotation to world points
  const cosR = Math.cos(c.rotation);
  const sinR = Math.sin(c.rotation);
  const applyRot = (px, py) => ({
    x: px * cosR - py * sinR,
    y: px * sinR + py * cosR
  });

  const wBot = applyRot(c.bodyBotX, c.bodyBotY);
  const wTop = applyRot(c.bodyTopX, c.bodyTopY);
  const wHead = applyRot(c.headX, c.headY);
  const wBulgeA = applyRot(c.bulgeAX, c.bulgeAY);
  const wBulgeB = applyRot(c.bulgeBX, c.bulgeBY);
  const wSwordA = applyRot(c.swordAX, c.swordAY);
  const wSwordB = applyRot(c.swordBX, c.swordBY);

  // Store absolute world positions for rendering and collision
  char.world = {
    bodyBot: { x: x + wBot.x, y: y + wBot.y },
    bodyTop: { x: x + wTop.x, y: y + wTop.y },
    bodyThickness: c.bodyThickness,
    head: { x: x + wHead.x, y: y + wHead.y, r: c.headR },
    bulgeA: { x: x + wBulgeA.x, y: y + wBulgeA.y, r: c.bulgeAR },
    bulgeB: { x: x + wBulgeB.x, y: y + wBulgeB.y, r: c.bulgeBR },
    sword: { 
      ax: x + wSwordA.x, ay: y + wSwordA.y, 
      bx: x + wSwordB.x, by: y + wSwordB.y, 
      thickness: c.swordThickness 
    }
  };
  
  char.height = Math.abs(c.headY) + c.headR;
  char.width = 30 * scale;
}