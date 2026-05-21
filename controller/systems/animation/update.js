import { animateCharacter } from '../../../character/animator.js';
import { easeInCubic } from '../../../character/animation/easing.js';

export function updateAnimations(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');

  // Compute a punchy, ease-in attack progress that snaps to 1.0 at the end of the ACTIVE window
  let progress = 0;
  if (p.state === 'attack' && p.attackFrameData) {
    const frameData = p.attackFrameData;
    const totalFrames = frameData.totalFrames;
    const activeEndFrame = frameData.startup + frameData.active;
    const currentFrame = Math.floor(p.attackFrameTime * 60);

    // Normalize progress across the startup->active span (so strikes accelerate into the last active frame)
    const normalized = Math.max(0, Math.min(currentFrame / Math.max(1, activeEndFrame), 1));
    // Ease-in so movement accelerates into the strike
    let eased = easeInCubic(normalized);

    // If we've reached or passed the last active frame, snap and HOLD the final pose (linger into recovery)
    if (currentFrame >= activeEndFrame) {
      eased = 1.0;
    }

    progress = eased;
  }

  animateCharacter(p.character, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy, p.isCrouching, dt, isSliding, p.scale || 1.0, p.attackFrameData);

  // Viewport culling for entity animations (skip far off-screen entities)
  const viewLeft = controller.cameraX - 200;
  const viewRight = controller.cameraX + 1200;
  
  for (const ent of controller.entities) {
    if (ent.type !== 'crate' && ent.character && ent.x > viewLeft && ent.x < viewRight) {
      if (ent.state === 'dead' && ent.isSliced) {
        const dx = ent.x - ent.lastX;
        const dy = ent.y - ent.lastY;
        const w = ent.character.world;
        
        if (dx !== 0 || dy !== 0) {
          w.bodyBot.x += dx; w.bodyBot.y += dy;
          w.bodyTop.x += dx; w.bodyTop.y += dy;
          w.head.x += dx; w.head.y += dy;
          w.bulgeA.x += dx; w.bulgeA.y += dy;
          w.bulgeB.x += dx; w.bulgeB.y += dy;
          if (w.sword) {
            w.sword.ax += dx; w.sword.ay += dy;
            w.sword.bx += dx; w.sword.by += dy;
          }
          if (w.slice) {
            w.slice.x += dx; w.slice.y += dy;
          }
        }
        
        const angleDelta = ent.vAngle ? ent.vAngle * dt * 60 : 0;
        if (Math.abs(angleDelta) > 0.001) {
          const cx = w.slice ? w.slice.x : ent.x;
          const cy = w.slice ? w.slice.y : ent.y - 40;
          const cos = Math.cos(angleDelta);
          const sin = Math.sin(angleDelta);
          
          const rot = (pt) => {
            const rx = pt.x - cx;
            const ry = pt.y - cy;
            pt.x = cx + rx * cos - ry * sin;
            pt.y = cy + rx * sin + ry * cos;
          };
          
          rot(w.bodyBot);
          rot(w.bodyTop);
          rot(w.head);
          rot(w.bulgeA);
          rot(w.bulgeB);
          if (w.sword) {
            const pA = { x: w.sword.ax, y: w.sword.ay };
            const pB = { x: w.sword.bx, y: w.sword.by };
            rot(pA); rot(pB);
            w.sword.ax = pA.x; w.sword.ay = pA.y;
            w.sword.bx = pB.x; w.sword.by = pB.y;
          }
          if (w.slice) {
            const nx = w.slice.nx * cos - w.slice.ny * sin;
            const ny = w.slice.nx * sin + w.slice.ny * cos;
            w.slice.nx = nx;
            w.slice.ny = ny;
          }
        }
        
        ent.lastX = ent.x;
        ent.lastY = ent.y;
      } else if (ent.state !== 'dead') {
        if (ent.hitstunTimer > 0) {
          ent.hitstunTimer -= dt;
          if (ent.hitstunTimer <= 0 && ent.state === 'hit') {
            ent.state = 'idle';
          }
        }
        
        const scale = ent.scale || 1.0;
        animateCharacter(ent.character, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, ent.attackType || 'none', 0, ent.isGrounded, ent.vy, false, dt, false, scale, ent.attackFrameData);
      }
    }
  }
}