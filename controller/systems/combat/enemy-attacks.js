import { getHitbox, checkHitboxCollision } from '../../../combat/attacks/logic/hitbox.js';

export function resolveEnemyAttacks(controller) {
  const p = controller.player;
  if (p.state === 'dead') return;
  
  for (const ent of controller.entities) {
    if (ent.type !== 'enemy' || ent.state !== 'attack') continue;
    
    const frameData = ent.attackFrameData;
    if (!frameData) continue;
    
    const currentFrame = Math.floor(ent.attackFrameTime * 60);
    if (!frameData.isActive(currentFrame)) continue;
    
    const hitbox = getHitbox(ent, frameData);
    if (!hitbox) continue;
    
    // Check if already hit the player this attack
    if (ent.attackHitEntities.has('player')) continue;
    
    // Check if player is blocking
    if (p.isBlocking && controller.parry) {
      if (controller.parry.checkParry(p, ent.attackFrameTime)) {
        controller.parry.applyParry(p, ent, controller);
        ent.attackHitEntities.add('player');
        return;
      }
    }
    
    // Check collision with player
    if (checkHitboxCollision(hitbox, p)) {
      ent.attackHitEntities.add('player');
      
      // Player dies instantly for now
      p.state = 'dead';
      p.stateTime = 0;
      p.health = 0;
      
      const dir = ent.facing === 'right' ? 1 : -1;
      p.vx = dir * 8;
      p.vy = -6;
      p.isGrounded = false;
      
      controller.screenShake = 15;
      controller.hitstop = 6;
      
      if (controller.audioEngine) {
        controller.audioEngine.onHit(100, 0);
      }
      
      // Visual feedback
      controller.visualFx.push({
        id: `fx_player_death_${controller.fxId++}`,
        type: 'damage_spark',
        x: hitbox.x,
        y: hitbox.y,
        rotation: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 0.2
      });
      
      // Schedule restart after a delay
      setTimeout(() => {
        controller.restartGame();
      }, 2000);
    }
  }
}