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

  animateCharacter(p.character, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy, p.isCrouching, dt, isSliding, p.scale || 1.0);

  for (const ent of controller.entities) {
    if (ent.state !== 'dead' && ent.type !== 'crate' && ent.character) {
      if (ent.hitstunTimer > 0) {
        ent.hitstunTimer -= dt;
        if (ent.hitstunTimer <= 0 && ent.state === 'hit') {
          ent.state = 'idle';
        }
      }
      
      const scale = ent.scale || 1.0;
      animateCharacter(ent.character, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, 'none', 0, ent.isGrounded, ent.vy, false, dt, false, scale);
    }
  }
}