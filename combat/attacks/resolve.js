import { getActiveHitbox, checkHitboxCollision } from '../hitbox.js';
import { ATTACK_CONFIG } from './config.js';

export function resolveAttackHits(controller) {
  const p = controller.player;
  if (p.state !== 'attack') return;
  
  const progress = 1 - p.attackTimer / ATTACK_CONFIG[p.attackType].duration;
  const hitbox = getActiveHitbox(p, p.attackType, progress);
  
  if (!hitbox || p.attackHitConfirmed) return;
  
  const dir = p.facing === 'right' ? 1 : -1;
  let hitOccurred = false;
  let tipperOccurred = false;
  
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    
    if (checkHitboxCollision(hitbox, ent)) {
      hitOccurred = true;
      p.attackHitConfirmed = true;
      
      const dx = Math.abs(p.x - ent.x);
      const isTipper = dx >= (ATTACK_CONFIG[p.attackType].reach * 0.65);
      if (isTipper) tipperOccurred = true;
      
      const actualDamage = isTipper ? Math.floor(hitbox.damage * 1.5) : Math.floor(hitbox.damage * 0.7);
      
      ent.health -= actualDamage;
      
      if (ent.isBoss) {
        ent.vx = dir * hitbox.pushback * 0.4 * (isTipper ? 1.2 : 1.0);
        ent.vy = hitbox.launchVy * 0.6 * (isTipper ? 1.2 : 1.0);
      } else {
        ent.vx = dir * hitbox.pushback * (isTipper ? 1.2 : 1.0);
        ent.vy = hitbox.launchVy * (isTipper ? 1.2 : 1.0);
      }
      ent.isGrounded = false;
      
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
        
        spawnDebris(controller, ent, dir, hitbox);
      } else {
        ent.state = 'hit';
        ent.stateTime = 0;
      }
      
      // Audio feedback
      if (controller.audioEngine) {
        controller.audioEngine.onHit(actualDamage, p.combo);
      }
      
      spawnHitParticles(controller, ent, dir, hitbox, isTipper);
      spawnFloatingText(controller, ent, p, actualDamage, isTipper);
      
      if (isTipper) {
        controller.visualFx.push({
          id: `fx_tipper_${controller.fxId++}`,
          type: 'tipper_flash',
          x: ent.x,
          y: ent.y - (ent.scale || 1.0) * 50,
          radius: 70,
          life: 0,
          maxLife: 0.25
        });
      }
    }
  }
  
  if (hitOccurred) {
    p.combo++;
    if (p.combo > controller.stats.maxCombo) {
      controller.stats.maxCombo = p.combo;
    }
    controller.stats.score += 10 * p.combo;
    
    const baseHitstop = p.attackType === 'down_thrust' ? 6 : 3;
    controller.hitstop = tipperOccurred ? Math.floor(baseHitstop * 1.5) : baseHitstop;
    
    const baseShake = p.attackType === 'down_thrust' ? 18 : 8;
    controller.screenShake = tipperOccurred ? baseShake * 1.5 : baseShake;
    
    if (p.attackType === 'down_thrust') {
      const sw = {
        id: `sw_${controller.waveId++}`,
        x: p.x + dir * 40,
        radius: 10,
        speed: 28,
        amplitude: 55,
        life: 0,
        maxLife: 1.0
      };
      controller.shockwaves.push(sw);
      
      // Audio for shockwave
      if (controller.audioEngine) {
        controller.audioEngine.onShockwave(sw.x, controller.cameraX, 1920);
        controller.audioEngine.onSlam();
      }
    }
    
    if ((p.combo % 3 === 0 || p.combo >= 10) && controller.floatingTexts.length < 4) {
      const titles = ['SMOOTH!', 'FLOWING!', 'UNSTOPPABLE!', 'PERFECT!', 'GODLIKE!'];
      const title = titles[Math.min(Math.floor(p.combo / 3) - 1, titles.length - 1)];
      controller.floatingTexts.push({
        id: `t_combo_${controller.textId++}`,
        text: `${p.combo}x ${title}`,
        x: p.x,
        y: p.y - 150,
        color: '#facc15',
        life: 0,
        scale: 1.3
      });
    }
  }
}

function spawnDebris(controller, ent, dir, hitbox) {
  if (ent.type === 'crate') return;
  
  const scale = ent.scale || 1.0;
  const hx = ent.character.world ? ent.character.world.head.x : ent.x;
  const hy = ent.character.world ? ent.character.world.head.y : ent.y - 70 * scale;
  const parts = [
    { r: 13 * scale, x: hx, y: hy },
    { r: 10 * scale, x: ent.x, y: ent.y - 70 * scale },
    { r: 8 * scale, x: ent.x - 10 * scale, y: ent.y - 60 * scale },
    { r: 8 * scale, x: ent.x + 10 * scale, y: ent.y - 60 * scale }
  ];
  
  for (const part of parts) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 6 + Math.random() * 10;
    controller.particles.push({
      id: `debris_${controller.particleId++}`,
      x: part.x,
      y: part.y,
      vx: dir * hitbox.pushback * 1.3 + Math.cos(ang) * spd * 0.4,
      vy: hitbox.launchVy * 1.3 + Math.sin(ang) * spd * 0.4 - 2,
      radius: part.r,
      life: 0,
      maxLife: 1.5 + Math.random() * 0.5,
      isGrounded: false,
      shape: 'circle'
    });
  }
  ent.health = -999;
}

function spawnHitParticles(controller, ent, dir, hitbox, isTipper) {
  const scale = ent.scale || 1.0;
  const pCount = (hitbox.damage > 40 || isTipper ? 6 : 3) * (ent.isBoss ? 2 : 1);
  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 8 + Math.random() * 10;
    const p = {
      id: `p_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10 * scale,
      y: ent.y - 50 * scale + (Math.random() - 0.5) * 20 * scale,
      vx: Math.cos(angle) * speed + dir * hitbox.pushback * 0.3,
      vy: Math.sin(angle) * speed + hitbox.launchVy * 0.5,
      radius: (5 + Math.random() * 6) * (ent.isBoss ? 1.5 : 1.0),
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3,
      isGrounded: false,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    };
    if (isTipper) {
      p.color = '#a855f7';
      p.radius *= 1.5;
      p.maxLife *= 1.2;
    }
    controller.particles.push(p);
  }
}

function spawnFloatingText(controller, ent, player, actualDamage, isTipper) {
  if (controller.floatingTexts.length >= 3) return;
  
  controller.floatingTexts.push({
    id: `t_${controller.textId++}`,
    text: isTipper ? 'TIPPER!' : `${actualDamage}`,
    x: ent.x + (Math.random() - 0.5) * 20,
    y: ent.y - 110,
    color: isTipper ? '#a855f7' : (actualDamage > 40 ? '#ec4899' : '#38bdf8'),
    life: 0,
    scale: (1 + Math.min(player.combo * 0.02, 0.4)) * (isTipper ? 1.5 : 1.0)
  });
}