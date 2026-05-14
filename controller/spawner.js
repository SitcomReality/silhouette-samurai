import { createDefaultSkeleton } from '../skeleton/factory.js';

export function spawnEnemy(controller, x) {
  controller.entities.push({
    id: `enemy_${Math.random()}`,
    type: 'enemy',
    x,
    y: controller.baseGroundY,
    vx: 0,
    vy: 0,
    facing: 'left',
    isGrounded: true,
    health: 60,
    maxHealth: 60,
    state: 'idle',
    stateTime: Math.random() * 2,
    attackType: 'none',
    attackTimer: 0,
    combo: 0,
    skeleton: createDefaultSkeleton(x, controller.baseGroundY),
  });
}

export function spawnCratesSquareWave(controller, startX, count) {
  const crateWidth = 50;
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
      health: 40,
      maxHealth: 40,
      state: 'idle',
      stateTime: 0,
      attackType: 'none',
      attackTimer: 0,
      combo: 0,
      skeleton: createDefaultSkeleton(cx, controller.baseGroundY),
      width: crateWidth,
      height: 50,
    });
  }
}