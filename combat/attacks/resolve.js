import { ATTACK_FRAME_DATA } from '../frame-data.js';

export function resolveAttackHits(controller) {
  const p = controller.player;
  if (p.state !== 'attack') return;
  
  const frameData = p.attackFrameData;
  if (!frameData) return;
  
  const currentFrame = Math.floor(p.attackFrameTime * 60);
  
  // Only check hits during active frames
  if (!frameData.isActive(currentFrame)) return;
  
  const hitbox = getHitbox(p, frameData);
  if (!hitbox) return;
  
  const dir = p.facing === 'right' ? 1 : -1;
  
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    if (p.attackHitEntities.has(ent.id)) continue; // Don't hit same entity twice
    
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
      
      // Check for sweetspot
      let damage = frameData.damage;
      let knockback = { ...frameData.knockback };
      
      if (frameData.sweetspot) {
        const sweetX = hitbox.x + (p.facing === 'right' ? 1 : -1) * frameData.sweetspot.offsetX;
        const sweetY = hitbox.y + frameData.sweetspot.offsetY;
        const distToSweet = Math.sqrt(
          Math.pow(ent.x - sweetX, 2) + 
          Math.pow(ent.y - 40 - sweetY, 2)
        );
        
        if (distToSweet < frameData.sweetspot.radius) {
          damage += frameData.sweetspot.damageBonus;
          knockback.x *= frameData.sweetspot.knockbackMult;
          knockback.y *= frameData.sweetspot.knockbackMult;
          
          // Sweetspot effect
          controller.screenShake += 5;
          controller.hitstop = Math.min(controller.hitstop + 2, 8);
        }
      }
      
      // Apply counter bonus if available
      if (p.canCounter && p.counterBonusDamage) {
        damage *= p.counterBonusDamage;
        p.canCounter = false;
        p.counterBonusDamage = 1.0;
      }
      
      // Apply ultra parry bonus (block->finisher combo)
      if (p.ultraParryBonus > 1.0) {
        damage *= p.ultraParryBonus;
        controller.screenShake += 8;
        controller.hitstop += 3;
        p.ultraParryBonus = 1.0;
      }
      
      ent.health -= damage;
      ent.flashTimer = 0.15;
      
      // Apply knockback and hitstun
      if (frameData.spike && !ent.isGrounded) {
        // Spike downward
        ent.vx = 0;
        ent.vy = knockback.y;
      } else if (frameData.trip && ent.isGrounded) {
        // Trip
        ent.vx = dir * knockback.x * 0.6;
        ent.vy = -2;
        ent.isGrounded = false;
        ent.state = 'trip';
        ent.tripTimer = 0.3;
      } else {
        ent.vx = dir * knockback.x;
        ent.vy = knockback.y;
      }
      
      ent.isGrounded = false;
      ent.hitstun = frameData.hitstun;
      ent.hitstunTimer = frameData.hitstun;
      
      if (ent.health <= 0) {
        ent.health = 0;
        ent.state = 'dead';
        ent.stateTime = 0;
        
        if (ent.isBoss) {
          controller.stats.bossesDefeated++;
          controller.stats.score += 500 * (1 + p.combo * 0.1);
        } else {
          controller.stats.enemiesDefeated++;
          controller.stats.score += 100 * (1 + p.combo * 0.1);
        }
        
        spawnDebris(controller, ent, dir, damage);
      } else {
        ent.state = 'hit';
        ent.stateTime = 0;
      }
      
      // Audio/visual feedback
      if (controller.audioEngine) {
        controller.audioEngine.onHit(damage, p.combo);
      }
      
      controller.hitstop = Math.max(controller.hitstop, frameData.launch ? 5 : 3);
      controller.screenShake = Math.max(controller.screenShake, damage > 20 ? 12 : 6);
      
      // Damage spark at hit point
      controller.visualFx.push({
        id: `fx_spark_${controller.fxId++}`,
        type: 'damage_spark',
        x: hitbox.x,
        y: hitbox.y,
        rotation: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 0.15
      });
      
      spawnHitParticles(controller, ent, dir, damage);
      spawnFloatingText(controller, ent, p, damage);
      
      // Combo tracking
      p.combo++;
      if (p.combo > controller.stats.maxCombo) {
        controller.stats.maxCombo = p.combo;
      }
      controller.stats.score += 10 * p.combo;
      
      // Air combo magnet effect
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

function getHitbox(entity, frameData) {
  const dir = entity.facing === 'right' ? 1 : -1;
  const range = frameData.range;
  
  return {
    x: entity.x + dir * range.offsetX,
    y: entity.y + range.offsetY,
    width: range.width,
    height: range.height
  };
}

function checkHitboxCollision(hitbox, target) {
  const dx = Math.abs(hitbox.x - target.x);
  const dy = Math.abs(hitbox.y - (target.y - 40));
  
  const hw = hitbox.width / 2;
  const hh = hitbox.height / 2;
  const tw = target.character ? target.character.width / 2 : (target.width || 50) / 2;
  const th = target.character ? target.character.height / 2 : (target.height || 50) / 2;
  
  return dx < (hw + tw) && dy < (hh + th);
}

function spawnDebris(controller, ent, dir, damage) {
  if (ent.type === 'crate') return;
  
  const scale = ent.scale || 1.0;
  const sliceY = ent.y - 40 * scale; // Slice horizontally through torso
  
  // Top half (head + upper body) - gets knocked back
  const topHalf = {
    id: `debris_top_${controller.particleId++}`,
    x: ent.x,
    y: sliceY - 20 * scale,
    vx: dir * damage * 0.4,
    vy: -Math.abs(damage) * 0.35 - 4,
    radius: 18 * scale,
    life: 0,
    maxLife: 2.0,
    isGrounded: false,
    shape: 'circle',
    vAngle: dir * 0.1
  };
  
  // Bottom half (legs) - falls straight down
  const bottomHalf = {
    id: `debris_bottom_${controller.particleId++}`,
    x: ent.x,
    y: sliceY + 15 * scale,
    vx: dir * damage * 0.1,
    vy: -2,
    radius: 15 * scale,
    life: 0,
    maxLife: 2.0,
    isGrounded: false,
    shape: 'circle'
  };
  
  controller.particles.push(topHalf, bottomHalf);
  
  // Add a few small blood particles for effect
  for (let i = 0; i < 3; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 4 + Math.random() * 6;
    controller.particles.push({
      id: `debris_particle_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10 * scale,
      y: sliceY,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 2,
      radius: (3 + Math.random() * 4) * scale,
      life: 0,
      maxLife: 1.0,
      isGrounded: false,
      shape: 'circle'
    });
  }
  
  ent.health = -999;
}

function spawnHitParticles(controller, ent, dir, damage) {
  const scale = ent.scale || 1.0;
  const pCount = (damage > 20 ? 5 : 3) * (ent.isBoss ? 2 : 1);
  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 8 + Math.random() * 10;
    controller.particles.push({
      id: `p_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10 * scale,
      y: ent.y - 50 * scale + (Math.random() - 0.5) * 20 * scale,
      vx: Math.cos(angle) * speed + dir * damage * 0.2,
      vy: Math.sin(angle) * speed - Math.abs(damage) * 0.2,
      radius: (5 + Math.random() * 6) * (ent.isBoss ? 1.5 : 1.0),
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3,
      isGrounded: false,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    });
  }
}

function spawnFloatingText(controller, ent, player, damage) {
  if (controller.floatingTexts.length >= 3) return;
  
  controller.floatingTexts.push({
    id: `t_${controller.textId++}`,
    text: damage > 20 ? 'CRITICAL!' : `${Math.floor(damage)}`,
    x: ent.x + (Math.random() - 0.5) * 20,
    y: ent.y - 110,
    color: damage > 20 ? '#ec4899' : '#38bdf8',
    life: 0,
    scale: 1 + Math.min(player.combo * 0.02, 0.4)
  });
}