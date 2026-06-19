import { getHitbox, checkHitboxCollision } from '../../../combat/attacks/logic/hitbox.js';

export function resolveEnemyAttacks(controller) {
  const p = controller.player;
  if (p.state === 'dead') return;

  // --- Projectile vs player collision ---
  for (let i = controller.entities.length - 1; i >= 0; i--) {
    const proj = controller.entities[i];
    if (proj.type !== 'projectile' || proj.owner !== 'enemy') continue;

    const dx = Math.abs(proj.x - p.x);
    const dy = Math.abs(proj.y - (p.y - 40));
    if (dx < 20 && dy < 28) {
      // Player is hit by projectile
      p.state = 'dead'; p.stateTime = 0; p.health = 0;
      p.vx = proj.vx * 1.5; p.vy = -6; p.isGrounded = false;
      controller.screenShake = 12; controller.hitstop = 5;
      if (controller.audioEngine) controller.audioEngine.onHit(20, 0);
      controller.visualFx.push({
        id: `fx_proj_hit_${controller.fxId++}`,
        type: 'damage_spark', x: proj.x, y: proj.y,
        rotation: Math.random() * Math.PI * 2, life: 0, maxLife: 0.15
      });
      controller.entities.splice(i, 1);
      setTimeout(() => controller.restartGame(), 2000);
      return;
    }
  }

  // --- Projectile vs player attack (destroy projectiles) ---
  if (p.state === 'attack' && p.attackFrameData) {
    const currentFrame = Math.floor(p.attackFrameTime * 60);
    if (p.attackFrameData.isActive(currentFrame)) {
      const hitbox = getHitbox(p, p.attackFrameData);
      if (hitbox) {
        for (let i = controller.entities.length - 1; i >= 0; i--) {
          const proj = controller.entities[i];
          if (proj.type !== 'projectile' || proj.owner !== 'enemy') continue;
          const dx = Math.abs(proj.x - hitbox.x);
          const dy = Math.abs(proj.y - hitbox.y);
          if (dx < hitbox.width / 2 + 12 && dy < hitbox.height / 2 + 12) {
            // Destroy projectile, give small score/combo
            controller.entities.splice(i, 1);
            p.combo++;
            controller.stats.score += 25 * p.combo;
            controller.visualFx.push({
              id: `fx_proj_destroy_${controller.fxId++}`,
              type: 'clash_spark', x: proj.x, y: proj.y, life: 0, maxLife: 0.18
            });
            if (controller.audioEngine) controller.audioEngine.onHit(5, p.combo);
          }
        }
      }
    }
  }

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