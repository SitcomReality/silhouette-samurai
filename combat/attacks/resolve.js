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
  
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    
    if (checkHitboxCollision(hitbox, ent)) {
      hitOccurred = true;
      p.attackHitConfirmed = true;
      
      ent.health -= hitbox.damage;
      ent.vx = dir * hitbox.pushback;
      ent.vy = hitbox.launchVy;
      ent.isGrounded = false;
      
      if (ent.health <= 0) {
        ent.health = 0;
        ent.state = 'dead';
        ent.stateTime = 0;
        controller.stats.enemiesDefeated++;
        controller.stats.score += 100 * (1 + p.combo * 0.1);
        
        spawnDebris(controller, ent, dir, hitbox);
      } else {
        ent.state = 'hit';
        ent.stateTime = 0;
      }
      
      spawnHitParticles(controller, ent, dir, hitbox);
      spawnFloatingText(controller, ent, p, hitbox);
    }
  }
  
  if (hitOccurred) {
    p.combo++;
    if (p.combo > controller.stats.maxCombo) {
      controller.stats.maxCombo = p.combo;
    }
    controller.stats.score += 10 * p.combo;
    
    controller.hitstop = p.attackType === 'slam' ? 6 : 3;
    controller.screenShake = p.attackType === 'slam' ? 18 : 8;
    
    if (p.attackType === 'slam') {
      controller.shockwaves.push({
        id: `sw_${controller.waveId++}`,
        x: p.x + dir * 40,
        radius: 10,
        speed: 28,
        amplitude: 55,
        life: 0,
        maxLife: 1.0
      });
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
  
  const hx = ent.character.world ? ent.character.world.head.x : ent.x;
  const hy = ent.character.world ? ent.character.world.head.y : ent.y - 70;
  const parts = [
    { r: 13, x: hx, y: hy },
    { r: 10, x: ent.x, y: ent.y - 70 },
    { r: 8, x: ent.x - 10, y: ent.y - 60 },
    { r: 8, x: ent.x + 10, y: ent.y - 60 }
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

function spawnHitParticles(controller, ent, dir, hitbox) {
  const pCount = hitbox.damage > 40 ? 5 : 3;
  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 8 + Math.random() * 10;
    controller.particles.push({
      id: `p_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10,
      y: ent.y - 50 + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed + dir * hitbox.pushback * 0.3,
      vy: Math.sin(angle) * speed + hitbox.launchVy * 0.5,
      radius: 5 + Math.random() * 6,
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3,
      isGrounded: false,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    });
  }
}

function spawnFloatingText(controller, ent, player, hitbox) {
  if (controller.floatingTexts.length >= 3) return;
  
  controller.floatingTexts.push({
    id: `t_${controller.textId++}`,
    text: hitbox.damage > 40 ? 'CRITICAL!' : `${hitbox.damage}`,
    x: ent.x + (Math.random() - 0.5) * 20,
    y: ent.y - 110,
    color: hitbox.damage > 40 ? '#ec4899' : '#38bdf8',
    life: 0,
    scale: 1 + Math.min(player.combo * 0.02, 0.4)
  });
}