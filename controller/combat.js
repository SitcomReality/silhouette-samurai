export function triggerAttack(controller, type) {
  const p = controller.player;
  if (p.state === 'dead') return;

  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = type;
  p.attackTimer = type === 'slam' ? 0.45 : 0.35;

  const dir = p.facing === 'right' ? 1 : -1;
  if (type === 'kick_low') {
    p.vx = dir * 12;
  } else if (type === 'roundhouse') {
    p.vx = dir * 8;
    p.vy = -4; 
    p.isGrounded = false;
  } else if (type === 'slam') {
    p.vy = -11;
    p.vx = dir * 6;
    p.isGrounded = false;
  }

  checkMeleeImpacts(controller, type);
}

export function checkMeleeImpacts(controller, attackType) {
  const p = controller.player;
  const dir = p.facing === 'right' ? 1 : -1;
  
  let reach = 110;
  let pushback = 8;
  let damage = 25;
  let launchVy = -4;

  if (attackType === 'roundhouse') {
    reach = 130;
    pushback = 12;
    damage = 35;
    launchVy = -14;
  } else if (attackType === 'slam') {
    reach = 160;
    pushback = 18;
    damage = 50;
    launchVy = -8;
  }

  let hitOccurred = false;

  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;

    const distX = (ent.x - p.x) * dir;
    const absDistX = Math.abs(ent.x - p.x);

    if ((distX > -20 && distX < reach) || absDistX < 40) {
      hitOccurred = true;
      ent.health -= damage;
      
      ent.vx = dir * pushback;
      ent.vy = launchVy;
      ent.isGrounded = false;
      
      if (ent.health <= 0) {
        ent.health = 0;
        ent.state = 'dead';
        ent.stateTime = 0;
        controller.stats.enemiesDefeated++;
        controller.stats.score += 100 * (1 + p.combo * 0.1);

        if (ent.type !== 'crate') {
          const h = ent.skeleton.head;
          const limbs = [
            { shape: 'circle', r: 13, len: 0, x: h.x, y: h.y },
            { shape: 'capsule', r: 9, len: 35, x: ent.x, y: ent.y - 70 },
            { shape: 'capsule', r: 6, len: 30, x: ent.x - 12, y: ent.y - 70 },
            { shape: 'capsule', r: 6, len: 30, x: ent.x + 12, y: ent.y - 70 },
            { shape: 'capsule', r: 7, len: 35, x: ent.x - 8, y: ent.y - 30 },
            { shape: 'capsule', r: 7, len: 35, x: ent.x + 8, y: ent.y - 30 },
          ];
          for (const limb of limbs) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 6 + Math.random() * 10;
            controller.particles.push({
              id: `debris_${controller.particleId++}`,
              x: limb.x,
              y: limb.y,
              vx: dir * pushback * 1.3 + Math.cos(ang) * spd * 0.4,
              vy: launchVy * 1.3 + Math.sin(ang) * spd * 0.4 - 2,
              radius: limb.r,
              life: 0,
              maxLife: 1.5 + Math.random() * 0.5,
              isGrounded: false,
              shape: limb.shape,
              length: limb.len,
              angle: ang,
              vAngle: (Math.random() - 0.5) * 12,
            });
          }
          ent.health = -999;
        }
      } else {
        ent.state = 'hit';
        ent.stateTime = 0;
      }

      const pCount = attackType === 'slam' ? 4 : 2;
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI - Math.PI / 2;
        const speed = 8 + Math.random() * 8;
        controller.particles.push({
          id: `p_${controller.particleId++}`,
          x: ent.x + (Math.random() - 0.5) * 10,
          y: ent.y - 35 + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * speed + dir * pushback * 0.4,
          vy: Math.sin(angle) * speed + launchVy * 0.6,
          radius: 5 + Math.random() * 5,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.3,
          isGrounded: false,
          shape: Math.random() > 0.5 ? 'circle' : 'square',
        });
      }

      if (controller.floatingTexts.length < 3) {
        controller.floatingTexts.push({
          id: `t_${controller.textId++}`,
          text: attackType === 'slam' ? 'CRITICAL!' : `${damage}`,
          x: ent.x + (Math.random() - 0.5) * 20,
          y: ent.y - 110,
          color: attackType === 'slam' ? '#ec4899' : '#38bdf8',
          life: 0,
          scale: 1 + Math.min(p.combo * 0.02, 0.4),
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

    controller.hitstop = attackType === 'slam' ? 5 : 2;
    controller.screenShake = attackType === 'slam' ? 15 : 6;

    controller.shockwaves.push({
      id: `sw_${controller.waveId++}`,
      x: p.x + dir * (reach * 0.4),
      radius: 10,
      speed: attackType === 'slam' ? 24 : 16,
      amplitude: attackType === 'slam' ? 45 : 20,
      life: 0,
      maxLife: attackType === 'slam' ? 0.8 : 0.5,
    });

    if ((p.combo % 3 === 0 || p.combo >= 10) && controller.floatingTexts.length < 4) {
      const titles = ['JUICY!', 'BRUTAL BALLET!', 'UNSTOPPABLE!', 'SDF MASTER!', 'GODLIKE FLOW!'];
      const title = titles[Math.min(Math.floor(p.combo / 3) - 1, titles.length - 1)];
      controller.floatingTexts.push({
        id: `t_combo_${controller.textId++}`,
        text: `${p.combo}x ${title}`,
        x: p.x,
        y: p.y - 150,
        color: '#facc15',
        life: 0,
        scale: 1.3,
      });
    }
  } else {
    if (attackType === 'slam') {
      controller.screenShake = 10;
      controller.shockwaves.push({
        id: `sw_${controller.waveId++}`,
        x: p.x + dir * 30,
        radius: 10,
        speed: 20,
        amplitude: 30,
        life: 0,
        maxLife: 0.6,
      });
    }
  }
}