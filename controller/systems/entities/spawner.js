import { spawnCratesSquareWave, spawnEnemy, spawnBoss, spawnArcher, spawnFloater } from '../../spawner.js';

export function updateSpawner(controller) {
  const p = controller.player;
  if (p.x > controller.nextSpawnX - 600) {
    const diff = 1 + controller.stats.bossesDefeated * 0.2;
    
    // Increase boss spacing so bosses appear less frequently close to one another
    if (controller.enemiesSpawnedSinceBoss >= 15) {
      spawnBoss(controller, controller.nextSpawnX, diff);
      controller.enemiesSpawnedSinceBoss = 0;
      // Advance spawn cursor further after a boss to create a larger gap
      controller.nextSpawnX += 900;
    } else {
      // Widen gaps between regular spawns: crates and enemies are spaced further apart
      if (Math.random() < 0.45) {
        // Increase crate block spacing and reduce tightly-packed counts
        spawnCratesSquareWave(controller, controller.nextSpawnX, 2 + Math.floor(Math.random() * 2));
        controller.nextSpawnX += 900;
      } else {
        // Choose enemy type based on weighted random
        const roll = Math.random();
        if (roll < 0.25) {
          // Floater - airborne enemy
          spawnFloater(controller, controller.nextSpawnX, diff);
          controller.enemiesSpawnedSinceBoss++;
          controller.nextSpawnX += 900 + Math.floor(Math.random() * 250);
        } else if (roll < 0.50) {
          // Archer - ranged projectile shooter
          spawnArcher(controller, controller.nextSpawnX, diff);
          controller.enemiesSpawnedSinceBoss++;
          controller.nextSpawnX += 850 + Math.floor(Math.random() * 250);
        } else {
          // Favor single spawns, occasionally a spaced-out pair
          const count = Math.random() < 0.65 ? 1 : 2;
          const gap = 320;
          for (let i = 0; i < count; i++) {
            const jitter = (Math.random() - 0.5) * 120;
            spawnEnemy(controller, controller.nextSpawnX + i * gap + jitter, diff);
            controller.enemiesSpawnedSinceBoss++;
          }
          controller.nextSpawnX += 950 + Math.floor(Math.random() * 350);
        }
      }
    }
  }
}