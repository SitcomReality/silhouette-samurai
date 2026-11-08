import { createPlayer } from './PlayerFactory.js';
import { spawnCratesSquareWave, spawnEnemy, spawnDummy } from '../spawner.js';

export function resetGameState(controller) {
  // Clear entities and effects
  controller.entities = [];
  controller.particles = [];
  controller.shockwaves = [];
  controller.floatingTexts = [];
  controller.visualFx = [];
  
  // Reset counters
  controller.fxId = 0;
  controller.particleId = 0;
  controller.waveId = 0;
  controller.textId = 0;
  controller.enemiesSpawnedSinceBoss = 0;
  
  // Reset world state
  controller.stats = { score: 0, maxCombo: 0, enemiesDefeated: 0, bossesDefeated: 0 };
  controller.nextSpawnX = 3000;
  controller.cameraX = 0;
  controller.hitstop = 0;
  controller.screenShake = 0;
  
  // Recreate player
  controller.player = createPlayer(controller.groundYAt(0));
  
  // Initial population: static dummy on the first plateau for attack testing
  spawnDummy(controller, 1200);
  spawnCratesSquareWave(controller, 2500, 4);
  spawnEnemy(controller, 2800);
}