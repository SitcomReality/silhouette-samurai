import { animateCharacter } from '../character/animator.js';
import { updatePlayer } from './update/player-logic.js';
import { updateEntities } from './update/entity-logic.js';
import { updatePhysics } from './update/physics-logic.js';
import { updateWorld } from './update/world-logic.js';
import { updateEffects } from './update/effects-logic.js';

export function updateEngine(controller, dt) {
  // 1. Early return for Hitstop
  if (controller.hitstop > 0) {
    controller.hitstop--;
    return;
  }

  // 2. Run World Logic (Camera, Spawning, Intro)
  updateWorld(controller, dt);

  // 3. Update Player (Timers, Inputs, States)
  const isSliding = updatePlayer(controller, dt);

  // 4. Update Entities (Enemies, Physics, States)
  updateEntities(controller, dt);

  // 5. Global Physics & Collisions (Shared physics, Clashes)
  updatePhysics(controller, dt);

  // 6. Character Animation Loop
  const p = controller.player;
  const progress = p.state === 'attack' && p.attackFrameData
    ? p.attackFrameTime / p.attackFrameData.getDuration()
    : 0;
  
  animateCharacter(p.character, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy, p.isCrouching, dt, isSliding, p.scale || 1.0);

  for (const ent of controller.entities) {
    if (ent.state !== 'dead' && ent.type !== 'crate' && ent.character) {
      const scale = ent.scale || 1.0;
      animateCharacter(ent.character, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, 'none', 0, ent.isGrounded, ent.vy, false, dt, false, scale);
    }
  }

  // 7. Update Visual/Audio Effects (Particles, FX, Combo reset)
  updateEffects(controller, dt);
}