import { spawnCratesSquareWave, spawnEnemy, spawnBoss } from '../../spawner.js';

export function updateSpawner(controller) {
  const p = controller.player;
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
}