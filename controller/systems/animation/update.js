import { animateCharacter } from '../../../character/animator.js';

export function updateAnimations(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');

  const progress = p.state === 'attack' && p.attackFrameData
    ? p.attackFrameTime / p.attackFrameData.getDuration()
    : 0;
    
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