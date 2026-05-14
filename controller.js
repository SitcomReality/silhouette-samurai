import { createDefaultSkeleton, updateSkeleton } from './skeleton.js';

export class GameController {
  constructor() {
    this.entities = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.stats = { score: 0, maxCombo: 0, enemiesDefeated: 0 };
    
    this.baseGroundY = 400;
    this.cameraX = 0;
    this.devMode = false;
    
    this.keys = {};
    this.hitstop = 0;
    this.screenShake = 0;
    
    this.nextSpawnX = 400;
    this.particleId = 0;
    this.waveId = 0;
    this.textId = 0;

    this.player = {
      id: 'player',
      type: 'player',
      x: 0,
      y: this.baseGroundY,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: true,
      health: 100,
      maxHealth: 100,
      state: 'idle',
      stateTime: 0,
      attackType: 'none',
      attackTimer: 0,
      combo: 0,
      skeleton: createDefaultSkeleton(0, this.baseGroundY),
    };

    this.spawnCratesSquareWave(250, 4);
    this.spawnEnemy(550);
  }

  handleKeyDown(code, key) {
    this.keys[code] = true;
    this.keys[key] = true;

    if (['Digit1', 'Numpad1', '1'].includes(code) || ['Digit1', 'Numpad1', '1'].includes(key)) {
      this.triggerAttack('kick_low');
    } else if (['Digit2', 'Numpad2', '2'].includes(code) || ['Digit2', 'Numpad2', '2'].includes(key)) {
      this.triggerAttack('roundhouse');
    } else if (['Digit3', 'Numpad3', '3'].includes(code) || ['Digit3', 'Numpad3', '3'].includes(key)) {
      this.triggerAttack('slam');
    }
  }

  handleKeyUp(code, key) {
    this.keys[code] = false;
    this.keys[key] = false;
  }

  triggerAttack(type) {
    if (this.player.state === 'dead') return;

    this.player.state = 'attack';
    this.player.stateTime = 0;
    this.player.attackType = type;
    this.player.attackTimer = type === 'slam' ? 0.45 : 0.35;

    const dir = this.player.facing === 'right' ? 1 : -1;
    if (type === 'kick_low') {
      this.player.vx = dir * 12;
    } else if (type === 'roundhouse') {
      this.player.vx = dir * 8;
      this.player.vy = -4; 
      this.player.isGrounded = false;
    } else if (type === 'slam') {
      this.player.vy = -11;
      this.player.vx = dir * 6;
      this.player.isGrounded = false;
    }

    this.checkMeleeImpacts(type);
  }

  checkMeleeImpacts(attackType) {
    const p = this.player;
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

    for (const ent of this.entities) {
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
          this.stats.enemiesDefeated++;
          this.stats.score += 100 * (1 + p.combo * 0.1);

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
              this.particles.push({
                id: `debris_${this.particleId++}`,
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
          this.particles.push({
            id: `p_${this.particleId++}`,
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

        if (this.floatingTexts.length < 3) {
          this.floatingTexts.push({
            id: `t_${this.textId++}`,
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
      if (p.combo > this.stats.maxCombo) {
        this.stats.maxCombo = p.combo;
      }
      this.stats.score += 10 * p.combo;

      this.hitstop = attackType === 'slam' ? 5 : 2;
      this.screenShake = attackType === 'slam' ? 15 : 6;

      this.shockwaves.push({
        id: `sw_${this.waveId++}`,
        x: p.x + dir * (reach * 0.4),
        radius: 10,
        speed: attackType === 'slam' ? 24 : 16,
        amplitude: attackType === 'slam' ? 45 : 20,
        life: 0,
        maxLife: attackType === 'slam' ? 0.8 : 0.5,
      });

      if ((p.combo % 3 === 0 || p.combo >= 10) && this.floatingTexts.length < 4) {
        const titles = ['JUICY!', 'BRUTAL BALLET!', 'UNSTOPPABLE!', 'SDF MASTER!', 'GODLIKE FLOW!'];
        const title = titles[Math.min(Math.floor(p.combo / 3) - 1, titles.length - 1)];
        this.floatingTexts.push({
          id: `t_combo_${this.textId++}`,
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
        this.screenShake = 10;
        this.shockwaves.push({
          id: `sw_${this.waveId++}`,
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

  update(dt) {
    if (this.hitstop > 0) {
      this.hitstop--;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 30);
    }

    const p = this.player;
    p.stateTime += dt;

    if (p.state !== 'attack' && p.state !== 'dead') {
      let isMoving = false;
      const moveSpeed = 7;

      if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
        p.vx = -moveSpeed;
        p.facing = 'left';
        isMoving = true;
      } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
        p.vx = moveSpeed;
        p.facing = 'right';
        isMoving = true;
      } else {
        p.vx *= 0.7;
      }

      if ((this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space']) && p.isGrounded) {
        p.vy = -14;
        p.isGrounded = false;
        p.state = 'run';
      }

      if (p.isGrounded) {
        p.state = isMoving ? 'run' : 'idle';
      }
    } else if (p.state === 'attack') {
      p.attackTimer -= dt;
      if (Math.random() < 0.3) {
        this.checkMeleeImpacts(p.attackType);
      }
      if (p.attackTimer <= 0) {
        p.state = 'idle';
        p.attackType = 'none';
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    if (!p.isGrounded) {
      p.vy += 0.6;
      if (p.y >= this.baseGroundY) {
        p.y = this.baseGroundY;
        p.vy = 0;
        p.isGrounded = true;
      }
    } else {
      p.y = this.baseGroundY;
    }

    const progress = p.state === 'attack' ? 1 - p.attackTimer / (p.attackType === 'slam' ? 0.45 : 0.35) : 0;
    updateSkeleton(p.skeleton, p.x, p.y, p.facing, p.state, p.stateTime, p.attackType, progress, p.isGrounded, p.vy);

    const targetCamX = p.x + (p.facing === 'right' ? 100 : -100);
    this.cameraX += (targetCamX - this.cameraX) * 0.08;

    if (p.x > this.nextSpawnX - 600) {
      if (Math.random() < 0.4) {
        this.spawnCratesSquareWave(this.nextSpawnX, 3 + Math.floor(Math.random() * 3));
        this.nextSpawnX += 450;
      } else {
        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          this.spawnEnemy(this.nextSpawnX + i * 80);
        }
        this.nextSpawnX += 400;
      }
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const ent = this.entities[i];

      if (ent.health === -999) {
        this.entities.splice(i, 1);
        continue;
      }

      ent.stateTime += dt;

      if (ent.state === 'dead') {
        ent.isGrounded = false;
        ent.vy += 0.6;
        ent.x += ent.vx;
        ent.y += ent.vy;

        if (ent.y > this.baseGroundY + 800 || ent.stateTime > 4) {
          this.entities.splice(i, 1);
        }
        continue;
      }

      if (!ent.isGrounded) {
        ent.vy += 0.6;
        ent.x += ent.vx;
        ent.y += ent.vy;

        if (ent.y >= this.baseGroundY) {
          ent.y = this.baseGroundY;
          ent.vy = 0;
          ent.vx *= 0.5;
          ent.isGrounded = true;
        }
      } else {
        ent.vx *= 0.8;
        ent.x += ent.vx;
        ent.y = this.baseGroundY;
      }

      if (ent.state === 'hit' && ent.stateTime > 0.4) {
        ent.state = 'idle';
      }

      if (ent.type !== 'crate') {
        updateSkeleton(ent.skeleton, ent.x, ent.y, ent.facing, ent.state, ent.stateTime, 'none', 0, ent.isGrounded, ent.vy);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      pt.vy += 0.4;
      pt.x += pt.vx;
      pt.y += pt.vy;

      if (pt.vAngle) {
        pt.angle = (pt.angle || 0) + pt.vAngle * dt;
      }

      if (pt.id.startsWith('debris_') || pt.shape === 'capsule') {
        continue;
      }

      if (pt.y >= this.baseGroundY) {
        pt.y = this.baseGroundY;
        pt.vy = 0;
        pt.vx *= 0.7;
        pt.isGrounded = true;
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      if (sw.life >= sw.maxLife) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      sw.radius += sw.speed;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      ft.y -= dt * 40;
      if (ft.life >= 1.0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (p.state !== 'attack' && p.stateTime > 2.5 && p.combo > 0) {
      p.combo = 0;
    }
  }

  spawnEnemy(x) {
    this.entities.push({
      id: `enemy_${Math.random()}`,
      type: 'enemy',
      x,
      y: this.baseGroundY,
      vx: 0,
      vy: 0,
      facing: 'left',
      isGrounded: true,
      health: 60,
      maxHealth: 60,
      state: 'idle',
      stateTime: Math.random() * 2,
      attackType: 'none',
      attackTimer: 0,
      combo: 0,
      skeleton: createDefaultSkeleton(x, this.baseGroundY),
    });
  }

  spawnCratesSquareWave(startX, count) {
    const crateWidth = 50;
    const gap = 50;
    for (let i = 0; i < count; i++) {
      const cx = startX + i * (crateWidth + gap);
      this.entities.push({
        id: `crate_${Math.random()}`,
        type: 'crate',
        x: cx,
        y: this.baseGroundY,
        vx: 0,
        vy: 0,
        facing: 'left',
        isGrounded: true,
        health: 40,
        maxHealth: 40,
        state: 'idle',
        stateTime: 0,
        attackType: 'none',
        attackTimer: 0,
        combo: 0,
        skeleton: createDefaultSkeleton(cx, this.baseGroundY),
        width: crateWidth,
        height: 50,
      });
    }
  }
}