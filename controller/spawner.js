import { createCharacter } from '../character/representation.js';

export function spawnEnemy(controller, x, difficulty = 1) {
  const hp = 20;
  // Record spawn time so AI respects cooldown before first attack
  const now = performance.now() / 1000;
  controller.entities.push({
    id: `enemy_${Math.random()}`,
    type: 'enemy',
    x,
    y: controller.baseGroundY,
    vx: 0,
    vy: 0,
    facing: 'left',
    isGrounded: true,
    isCrouching: false,
    health: hp,
    maxHealth: hp,
    flashTimer: 0,
    // Increase enemy visual scale by 50% to match the player's visual size
    scale: 1.5,
    state: 'idle',
    stateTime: Math.random() * 2,
    attackType: 'none',
    attackFrameData: null,
    attackFrameTime: 0,
    attackHitEntities: new Set(),
    attackCooldownStart: null,
    combo: 0,
    character: createCharacter(x, controller.baseGroundY),
  });
}

export function spawnBoss(controller, x, difficulty = 1) {
  const hp = 300 * difficulty;
  const scale = 1.8 + Math.min((difficulty - 1) * 0.1, 0.6);
  // Initialize lastAttackTime to spawn time so boss delays its first swing
  const now = performance.now() / 1000;
  controller.entities.push({
    id: `boss_${Math.random()}`,
    type: 'enemy',
    isBoss: true,
    x,
    y: controller.baseGroundY,
    vx: 0,
    vy: 0,
    facing: 'left',
    isGrounded: true,
    isCrouching: false,
    health: hp,
    maxHealth: hp,
    flashTimer: 0,
    state: 'idle',
    stateTime: Math.random() * 2,
    attackType: 'none',
    attackFrameData: null,
    attackFrameTime: 0,
    attackHitEntities: new Set(),
    attackCooldownStart: null,
    combo: 0,
    scale: scale,
    character: createCharacter(x, controller.baseGroundY),
  });
}

export function spawnCratesSquareWave(controller, startX, count) {
  const crateWidth = 25;
  const gap = 50;
  for (let i = 0; i < count; i++) {
    const cx = startX + i * (crateWidth + gap);
    controller.entities.push({
      id: `crate_${Math.random()}`,
      type: 'crate',
      x: cx,
      y: controller.baseGroundY,
      vx: 0,
      vy: 0,
      facing: 'left',
      isGrounded: true,
      isCrouching: false,
      health: 40,
      maxHealth: 40,
      state: 'idle',
      stateTime: 0,
      attackType: 'none',
      attackTimer: 0,
      combo: 0,
      width: crateWidth,
      height: 25,
    });
  }
}