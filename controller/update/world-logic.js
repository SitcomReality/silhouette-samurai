import { textSDFManager } from '../../sdf/text-sdf.js';
import { spawnCratesSquareWave, spawnEnemy, spawnBoss } from '../spawner.js';

export function updateWorld(controller, dt) {
  const p = controller.player;

  // 1. Screen Shake Decay
  if (controller.screenShake > 0) {
    controller.screenShake = Math.max(0, controller.screenShake - dt * 30);
  }

  // 2. Intro Layout Generation
  if (!controller.introLayoutsGenerated) {
    controller.introLayouts = controller.introTexts.map(it => textSDFManager.getTextLayout(
      it.text, it.x, controller.baseGroundY - 20, 1.0
    ));
    controller.introLayoutsGenerated = true;
  }

  // 3. Spawning Logic
  if (p.x > controller.nextSpawnX - 600) {
    const diff = 1 + controller.stats.bossesDefeated * 0.2;
    if (controller.enemiesSpawnedSinceBoss >= 15) {
      spawnBoss(controller, controller.nextSpawnX, diff);
      controller.enemiesSpawnedSinceBoss = 0;
      controller.nextSpawnX += 600;
    } else {
      if (Math.random() < 0.4) {
        spawnCratesSquareWave(controller, controller.nextSpawnX, 3 + Math.floor(Math.random() * 3));
        controller.nextSpawnX += 450;
      } else {
        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          spawnEnemy(controller, controller.nextSpawnX + i * 80, diff);
          controller.enemiesSpawnedSinceBoss++;
        }
        controller.nextSpawnX += 400;
      }
    }
  }

  // 4. Camera Follow
  const targetCamX = p.x + (p.facing === 'right' ? 100 : -100);
  controller.cameraX += (targetCamX - controller.cameraX) * 0.08;
}