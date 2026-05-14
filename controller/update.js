import { animateCharacter } from '../character/animator.js';
import { resolveAttackHits } from '../combat/attacks/resolve.js';
import { ATTACK_CONFIG } from '../combat/attacks/config.js';
import { spawnCratesSquareWave, spawnEnemy } from './spawner.js';

export function updateEngine(controller, dt) {
  if (controller.hitstop > 0) {
    controller.hitstop--;
    return;
  }

  if (controller.screenShake > 0) {
    controller.screenShake = Math.max(0, controller.screenShake - dt * 30);
  }

  const p = controller.player;
  p.stateTime += dt;

  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  p.isCrouching = down && p.isGrounded && p.state !== 'attack';

  if (p.state !== 'attack' && p.state !== 'dead') {
    let isMoving = false;
    const moveSpeed = 7;
    const friction = p.isCrouching ? 0.92 : 0.7;

    if (controller.keys['KeyA'] || controller.keys['ArrowLeft']) {
      if (!p.isCrouching) p.vx = -moveSpeed;
      p.facing = 'left';
      isMoving = true;
    } else if (controller.keys['KeyD'] || controller.keys['ArrowRight']) {
      if (!p.isCrouching) p.vx = moveSpeed;
      p.facing = 'right';
      isMoving = true;
    } else {
      p.vx *= friction;
    }

    if (p.isCrouching && Math.abs(p.vx) > 3) {
      isMoving = true;
    } else {
      p.vx *= friction;
    }

    if ((controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space']) && p.isGrounded && !down) {
      p.vy = -14;
      p.isGrounded = false;
      p.state = 'run';
    }

    if (p.isGrounded) {
      p.state = isMoving ? 'run' : 'idle';
    }
  } else if (p.state === 'attack') {
    p.attackTimer -= dt;
    
    resolveAttackHits(controller);
    
    if (p.attackTimer <= 0) {
      if (p.endlagTimer > 0) {
        p.endlagTimer -= dt;
        p.vx *= 0.85;
      } else {
        const config = ATTACK_CONFIG[p.attackType];
        if (!p.attackHitConfirmed && config.resetComboOnMiss) {
          p.combo = Math.max(0, p.combo - 1);
        }
        p.state = 'idle';
        p.attackType = 'none';
      }
    }
  }

  p.x += p.vx;
  p.y += p.vy;

  if (!p.isGrounded) {
    p.vy += 0.6;
    if (p.y >= controller.baseGroundY) {
      p.y = controller.baseGroundY;
      p.vy = 0;
      p.isGrounded = true;
    }
  } else {
    p.y = controller.baseGroundY;
  }

  const progress = p.state === 'attack' && p.attackTimer > 0 
    ? 1 - p.attackTimer / ATTACK_CONFIG[p.attackType].duration 
    : 0;
  animateCharacter(p.character, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy, p.isCrouching);

  const targetCamX = p.x + (p.facing === 'right' ? 100 : -100);
  controller.cameraX += (targetCamX - controller.cameraX) * 0.08;

  if (p.x > controller.nextSpawnX - 600) {
    if (Math.random() < 0.4) {
      spawnCratesSquareWave(controller, controller.nextSpawnX, 3 + Math.floor(Math.random() * 3));
      controller.nextSpawnX += 450;
    } else {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        spawnEnemy(controller, controller.nextSpawnX + i * 80);
      }
      controller.nextSpawnX += 400;
    }
  }

  for (let i = controller.entities.length - 1; i >= 0; i--) {
    const ent = controller.entities[i];

    if (ent.health === -999) {
      controller.entities.splice(i, 1);
      continue;
    }

    ent.stateTime += dt;

    if (ent.state === 'dead') {
      ent.isGrounded = false;
      ent.vy += 0.6;
      ent.x += ent.vx;
      ent.y += ent.vy;

      if (ent.y > controller.baseGroundY + 800 || ent.stateTime > 4) {
        controller.entities.splice(i, 1);
      }
      continue;
    }

    if (!ent.isGrounded) {
      ent.vy += 0.6;
      ent.x += ent.vx;
      ent.y += ent.vy;

      if (ent.y >= controller.baseGroundY) {
        ent.y = controller.baseGroundY;
        ent.vy = 0;
        ent.vx *= 0.5;
        ent.isGrounded = true;
      }
    } else {
      ent.vx *= 0.8;
      ent.x += ent.vx;
      ent.y = controller.baseGroundY;
    }

    if (ent.state === 'hit' && ent.stateTime > 0.4) {
      ent.state = 'idle';
    }

    if (ent.type !== 'crate' && ent.character) {
      animateCharacter(ent.character, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, 'none', 0, ent.isGrounded, ent.vy, false);
    }
  }

  for (let i = controller.particles.length - 1; i >= 0; i--) {
    const pt = controller.particles[i];
    pt.life += dt;
    if (pt.life >= pt.maxLife) {
      controller.particles.splice(i, 1);
      continue;
    }

    pt.vy += 0.4;
    pt.x += pt.vx;
    pt.y += pt.vy;

    if (pt.vAngle) {
      pt.angle = (pt.angle || 0) + pt.vAngle * dt;
    }

    if (pt.id.startsWith('debris_') || pt.shape === 'capsule') {
      continue;
    }

    if (pt.y >= controller.baseGroundY) {
      pt.y = controller.baseGroundY;
      pt.vy = 0;
      pt.vx *= 0.7;
      pt.isGrounded = true;
    }
  }

  for (let i = controller.shockwaves.length - 1; i >= 0; i--) {
    const sw = controller.shockwaves[i];
    sw.life += dt;
    if (sw.life >= sw.maxLife) {
      controller.shockwaves.splice(i, 1);
      continue;
    }
    sw.radius += sw.speed;
  }

  for (let i = controller.floatingTexts.length - 1; i >= 0; i--) {
    const ft = controller.floatingTexts[i];
    ft.life += dt;
    ft.y -= dt * 40;
    if (ft.life >= 1.0) {
      controller.floatingTexts.splice(i, 1);
    }
  }

  if (p.state !== 'attack' && p.stateTime > 2.5 && p.combo > 0) {
    p.combo = 0;
  }
}