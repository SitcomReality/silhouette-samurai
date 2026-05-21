import { applyReactionPose } from './animation/states/reactions.js';
import { applyLocomotionPose } from './animation/states/locomotion.js';
import { applyBasicAttackPose } from './animation/attacks/basic.js';
import { applyFinisherPose } from './animation/attacks/dance.js';

export function animateCharacter(char, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded, vy, isCrouching, dt, isSliding = false, scale = 1.0, frameData = null) {
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

  // Apply state modifiers via modular helpers
  if (!applyReactionPose(t, dir, state)) {
    if (state === 'attack') {
      applyBasicAttackPose(t, dir, attackType, attackProgress, frameData) ||
      applyFinisherPose(t, dir, attackType, attackProgress, frameData);
    } else {
      applyLocomotionPose(t, dir, state, stateTime, isGrounded, vy, isCrouching, isSliding);
    }
  }

  // Ensure sword origin stays inside the body (prevent horizontal movement) before scaling
  t.swordAX = 0;
  
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

  // Store absolute world positions for rendering and collision
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