import { spawnCratesSquareWave, spawnEnemy, spawnBoss } from '../../spawner.js';

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
      if (Math.random() < 0.4) {
        // Increase crate block spacing and reduce tightly-packed counts
        spawnCratesSquareWave(controller, controller.nextSpawnX, 2 + Math.floor(Math.random() * 2));
        controller.nextSpawnX += 700;
      } else {
        const count = 1 + Math.floor(Math.random() * 2); // avoid triples/pairs; favor singles or pairs
        const gap = 120; // larger gap between neighbouring enemies
        for (let i = 0; i < count; i++) {
          // add a small jitter so enemies aren't perfectly grid-aligned
          const jitter = (Math.random() - 0.5) * 30;
          spawnEnemy(controller, controller.nextSpawnX + i * gap + jitter, diff);
          controller.enemiesSpawnedSinceBoss++;
        }
        // Advance more to avoid immediate subsequent spawns
        controller.nextSpawnX += 700 + Math.floor(Math.random() * 200);
      }
    }
  }
}