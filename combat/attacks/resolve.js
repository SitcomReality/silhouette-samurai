import { getHitbox, checkHitboxCollision } from './logic/hitbox.js';
import { spawnHitParticles, spawnFloatingText } from './fx/impact.js';
import { spawnDebris } from './fx/slicing.js';

export function resolveAttackHits(controller) {
  const p = controller.player;
  if (p.state !== 'attack') return;
  
  const frameData = p.attackFrameData;
  if (!frameData) return;
  
  const currentFrame = Math.floor(p.attackFrameTime * 60);
  if (!frameData.isActive(currentFrame)) return;
  
  const hitbox = getHitbox(p, frameData);
  if (!hitbox) return;
  
  const dir = p.facing === 'right' ? 1 : -1;
  const maxReach = 200;
  
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    if (p.attackHitEntities.has(ent.id)) continue;
    if (Math.abs(ent.x - p.x) > maxReach) continue;
    
    // Check for parry
    if (ent.isBlocking && controller.parry) {
      if (controller.parry.checkParry(ent, p.attackFrameTime)) {
        controller.parry.applyParry(ent, p, controller);
        p.attackHitEntities.add(ent.id);
        return;
      }
    }
    
    if (checkHitboxCollision(hitbox, ent)) {
      p.attackHitEntities.add(ent.id);
      
      let damage = frameData.damage;
      let knockback = { ...frameData.knockback };
      
      // Sweetspot detection
      if (frameData.sweetspot) {
        const sweetX = hitbox.x + (p.facing === 'right' ? 1 : -1) * frameData.sweetspot.offsetX;
        const sweetY = hitbox.y + frameData.sweetspot.offsetY;
        const distToSweet = Math.sqrt(Math.pow(ent.x - sweetX, 2) + Math.pow(ent.y - 40 - sweetY, 2));
        
        if (distToSweet < frameData.sweetspot.radius) {
          damage += frameData.sweetspot.damageBonus;
          knockback.x *= frameData.sweetspot.knockbackMult;
          knockback.y *= frameData.sweetspot.knockbackMult;
          controller.screenShake += 5;
          controller.hitstop = Math.min(controller.hitstop + 2, 8);
        }
      }
      
      if (p.canCounter && p.counterBonusDamage) {
        damage *= p.counterBonusDamage;
        p.canCounter = false;
        p.counterBonusDamage = 1.0;
      }
      
      if (p.ultraParryBonus > 1.0) {
        damage *= p.ultraParryBonus;
        controller.screenShake += 8;
        controller.hitstop += 3;
        p.ultraParryBonus = 1.0;
      }
      
      ent.health -= damage;
      ent.flashTimer = 0.15;
      
      // Reset enemy attack charge when they are hit
      ent.attackCooldownStart = null;
      ent.chargeProgress = 0;
      
      if (frameData.spike && !ent.isGrounded) {
        ent.vx = 0; ent.vy = knockback.y;
      } else if (frameData.trip && ent.isGrounded) {
        ent.vx = dir * knockback.x * 0.6; ent.vy = -2;
        ent.isGrounded = false; ent.state = 'trip'; ent.tripTimer = 0.3;
      } else {
        ent.vx = dir * knockback.x; ent.vy = knockback.y;
      }
      
      ent.isGrounded = false;
      ent.hitstunTimer = frameData.hitstun;
      
      if (ent.health <= 0) {
        ent.health = 0; ent.state = 'dead'; ent.stateTime = 0;
        if (ent.isBoss) {
          controller.stats.bossesDefeated++;
          controller.stats.score += 500 * (1 + p.combo * 0.1);
        } else {
          controller.stats.enemiesDefeated++;
          controller.stats.score += 100 * (1 + p.combo * 0.1);
        }
        spawnDebris(controller, ent, dir, damage, frameData);
      } else {
        ent.state = 'hit'; ent.stateTime = 0;
      }
      
      if (controller.audioEngine) controller.audioEngine.onHit(damage, p.combo);
      controller.hitstop = Math.max(controller.hitstop, frameData.launch ? 5 : 3);
      controller.screenShake = Math.max(controller.screenShake, damage > 20 ? 12 : 6);
      
      controller.visualFx.push({
        id: `fx_spark_${controller.fxId++}`,
        type: 'damage_spark',
        x: hitbox.x, y: hitbox.y,
        rotation: Math.random() * Math.PI * 2,
        life: 0, maxLife: 0.15
      });
      
      spawnHitParticles(controller, ent, dir, damage);
      spawnFloatingText(controller, ent, p, damage);
      
      p.combo++;
      if (p.combo > controller.stats.maxCombo) controller.stats.maxCombo = p.combo;
      controller.stats.score += 10 * p.combo;
      
      if (frameData.launch || !ent.isGrounded) {
        const magnetStrength = 0.3;
        const dx = p.x - ent.x;
        const dy = (p.y - 40) - (ent.y - 40);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 50 && dist < 150) {
          ent.vx += (dx / dist) * magnetStrength;
          ent.vy += (dy / dist) * magnetStrength;
        }
      }
    }
  }
}