import { textSDFManager } from '../sdf/text-sdf.js';
import { updatePlayerTimersAndRegen } from './systems/player/state.js';
import { updatePlayerPhysics } from './systems/player/physics.js';
import { integratePlayerPhysics } from './systems/player/integration.js';
import { updatePlayerAttacks } from './systems/combat/attacks.js';
import { updateClashes } from './systems/combat/clashes.js';
import { updateEntities } from './systems/entities/update.js';
import { updateEnemyAI } from './systems/entities/ai.js';
import { resolveEnemyAttacks } from './systems/combat/enemy-attacks.js';
import { updateSpawner } from './systems/entities/spawner.js';
import { updateCollisions } from './systems/entities/collision.js';
import { updateFX } from './systems/fx/update.js';
import { updateCamera } from './systems/camera/update.js';
import { updateAnimations } from './systems/animation/update.js';

export function updateEngine(controller, dt) {
  if (controller.hitstop > 0) {
    controller.hitstop--;
    return;
  }

  if (!controller.introLayoutsGenerated) {
    controller.introLayouts = controller.introTexts.map(it => textSDFManager.getTextLayout(
      it.text,
      it.x,
      controller.baseGroundY - 20,
      1.0
    ));
    controller.introLayoutsGenerated = true;
  }

  if (controller.screenShake > 0) {
    controller.screenShake = Math.max(0, controller.screenShake - dt * 30);
  }

  updatePlayerTimersAndRegen(controller, dt);
  updatePlayerPhysics(controller, dt);
  updatePlayerAttacks(controller, dt);
  integratePlayerPhysics(controller, dt);
  
  updateCamera(controller);
  updateSpawner(controller);
  
  updateEnemyAI(controller, dt);
  updateEntities(controller, dt);
  updateClashes(controller);
  resolveEnemyAttacks(controller);
  updateCollisions(controller);
  
  updateAnimations(controller, dt);
  updateFX(controller, dt);
}