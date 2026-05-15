import { animateCharacter } from '../character/animator.js';
import { resolveAttackHits } from '../combat/attacks/resolve.js';
import { textSDFManager } from '../sdf/text-sdf.js';
import { ATTACK_CONFIG } from '../combat/attacks/config.js';
import { spawnCratesSquareWave, spawnEnemy } from './spawner.js';

export function updateEngine(controller, dt) {
  if (controller.hitstop > 0) {
    controller.hitstop--;
    return;
  }

  // Update Intro Sequence
  if (controller.intro.active) {
    controller.intro.time += dt;
    let found = false;
    for (const step of controller.intro.sequence) {
      if (controller.intro.time >= step.start && controller.intro.time <= step.end) {
        const stepTime = controller.intro.time - step.start;
        const stepDuration = step.end - step.start;
        const progress = stepTime / stepDuration;
        
        // Easing for height: 2s rise, 2s hold, 2s sink
        let heightFactor = 0;
        if (progress < 1/3) {
          const t = progress * 3;
          heightFactor = t * t * (3 - 2 * t); // smoothstep rise
        } else if (progress < 2/3) {
          heightFactor = 1; // hold
        } else {
          const t = 1 - (progress - 2/3) * 3;
          heightFactor = t * t * (3 - 2 * t); // smoothstep sink
        }
        
        const totalRise = 200;
        const yOffset = -totalRise * heightFactor;
        
        controller.intro.currentLayout = textSDFManager.getTextLayout(
          step.text, 
          0, // Centered around 0 world X
          controller.baseGroundY + 180 + yOffset, // Start deep in ground so top is hidden
          1.2
        );
        found = true;
        break;
      }
    }
    if (!found) {
      controller.intro.currentLayout = null;
      if (controller.intro.time > 18) {
        controller.intro.active = false;
      }
    }
  }

  if (controller.screenShake > 0) {
    controller.screenShake = Math.max(0, controller.screenShake - dt * 30);
  }

  const p = controller.player;
  p.stateTime += dt;

  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const isSliding = down && p.isGrounded && Math.abs(p.vx) > 2;
  p.isCrouching = down && p.isGrounded && p.state !== 'attack';

  // Track time in different states for power regeneration
  if (!p.isGrounded) {
    p.airTime += dt;
    p.slideTime = 0;
    p.groundStandTime = 0;
  } else if (isSliding || p.isCrouching) {
    p.slideTime += dt;
    p.airTime = 0;
    p.groundStandTime = 0;
  } else if (p.isGrounded) {
    p.groundStandTime += dt;
    p.airTime = 0;
    p.slideTime = 0;
  }

  // Regenerate powers
  const baseRegenRate = 30; // per second
  if (!p.isGrounded) {
    // In air: aerial power regen slow, slide power regen fast
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 0.5 * dt);
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 2.0 * dt);
  } else if (isSliding || p.isCrouching) {
    // Sliding: slide power regen slow, aerial power regen fast
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * 0.5 * dt);
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * 2.0 * dt);
  } else {
    // Standing: both regen at normal rate
    p.slidePower = Math.min(100, p.slidePower + baseRegenRate * dt);
    p.aerialPower = Math.min(100, p.aerialPower + baseRegenRate * dt);
  }

  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const prevJumpPressed = controller.prevKeys['KeyW'] || controller.prevKeys['ArrowUp'] || controller.prevKeys['Space'];
  const jumpJustPressed = jumpPressed && !prevJumpPressed;

  if (p.state !== 'attack' && p.state !== 'dead') {
    let isMoving = false;
    // Reduced horizontal control in air
    const accel = (p.isGrounded ? 45 : 12) * dt;
    
    // Variable friction based on state
    let friction = 0.92;
    if (!p.isGrounded) {
      friction = 0.985; // Air friction (slight reduction for floatiness)
    } else if (isSliding) {
      friction = 0.975; // Sliding friction (must eventually stop)
    } else if (p.isCrouching) {
      friction = 0.85; // Crouching friction
    }

    if (controller.keys['KeyA'] || controller.keys['ArrowLeft']) {
      if (!p.isCrouching && !isSliding) {
        p.vx -= accel;
      } else if (p.isCrouching && !isSliding) {
        p.vx -= accel * 0.4; // Slower crouch walk
      }
      // Note: No keyboard acceleration while sliding; slide is pure momentum
      if (!isSliding) p.facing = 'left';
      isMoving = true;
    } else if (controller.keys['KeyD'] || controller.keys['ArrowRight']) {
      if (!p.isCrouching && !isSliding) {
        p.vx += accel;
      } else if (p.isCrouching && !isSliding) {
        p.vx += accel * 0.4; // Slower crouch walk
      }
      if (!isSliding) p.facing = 'right';
      isMoving = true;
    }
    
    p.vx *= friction;

    if (jumpJustPressed && !down) {
      if (p.isGrounded) {
        p.vy = -14;
        p.isGrounded = false;
        p.doubleJumped = false;
        p.state = 'run';
      } else if (!p.doubleJumped && p.aerialPower >= 20) {
        const jumpPower = 0.5 + (p.aerialPower / 100) * 0.5;
        p.vy = -12 * jumpPower;
        p.aerialPower -= 20;
        p.doubleJumped = true;
      }
    }

    if (p.isGrounded) {
      p.state = isMoving && Math.abs(p.vx) > 1 ? 'run' : 'idle';
    }
  } else if (p.state === 'attack') {
    p.attackTimer -= dt;
    
    if (p.attackType === 'jab' || p.attackType === 'slide') {
      let friction = 0.92;
      if (!p.isGrounded) friction = 0.98;
      else if (isSliding || p.attackType === 'slide') friction = 0.985; // Low drag for slide attack
      p.vx *= friction;
      
      // Allow slight steering during jab
      const accel = 15 * dt;
      if (controller.keys['KeyA'] || controller.keys['ArrowLeft']) p.vx -= accel;
      if (controller.keys['KeyD'] || controller.keys['ArrowRight']) p.vx += accel;
      
      if (jumpJustPressed && !down && p.isGrounded) {
        p.vy = -14;
        p.isGrounded = false;
      } else if (jumpJustPressed && !down && !p.isGrounded && !p.doubleJumped && p.aerialPower >= 20) {
        const jumpPower = 0.5 + (p.aerialPower / 100) * 0.5;
        p.vy = -12 * jumpPower;
        p.aerialPower -= 20;
        p.doubleJumped = true;
      }
    } else {
      if (p.isGrounded) p.vx *= 0.96;
      else p.vx *= 0.98;
    }
    
    // Handle exponential launch trajectory for uppercut
    if (p.exponentialLaunch && p.attackTimer > 0) {
      const config = ATTACK_CONFIG[p.attackType];
      const progress = 1 - p.attackTimer / config.duration;
      const verticalBoost = Math.pow(progress, 3) * -50;
      p.vy += verticalBoost * dt;
    }
    
    resolveAttackHits(controller);
    
    if (p.attackTimer <= 0) {
      p.exponentialLaunch = false;
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
      p.doubleJumped = false;
      
      // Landing from air into slide if holding down and has horizontal speed
      if (down && Math.abs(p.vx) > 3) {
        p.isCrouching = true;
      }
    }
  } else {
    p.y = controller.baseGroundY;
  }

  const progress = p.state === 'attack' && p.attackTimer > 0 
    ? 1 - p.attackTimer / ATTACK_CONFIG[p.attackType].duration 
    : 0;
  animateCharacter(p.character, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy, p.isCrouching, dt);

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
      animateCharacter(ent.character, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, 'none', 0, ent.isGrounded, ent.vy, false, dt);
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

  for (let i = controller.visualFx.length - 1; i >= 0; i--) {
    const fx = controller.visualFx[i];
    fx.life += dt;
    if (fx.life >= fx.maxLife) {
      controller.visualFx.splice(i, 1);
    }
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