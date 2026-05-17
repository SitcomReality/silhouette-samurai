export class UIOverlay {
  constructor(controller, onThemeChange) {
    this.controller = controller;
    this.onThemeChange = onThemeChange;
    
    this.themes = [
      { name: 'Neon Cyan', color: '#06b6d4' },
      { name: 'Acid Green', color: '#22c55e' },
      { name: 'Hot Crimson', color: '#f43f5e' },
      { name: 'Hyper Violet', color: '#a855f7' },
      { name: 'Molten Gold', color: '#eab308' },
    ];
    this.themeColor = this.themes[0].color;
    
    this.scoreEl = document.getElementById('score-val');
    this.maxComboEl = document.getElementById('max-combo-val');
    this.enemiesEl = document.getElementById('enemies-val');
    this.bossesEl = document.getElementById('bosses-val');
    this.comboContainer = document.getElementById('combo-container');
    this.comboVal = document.getElementById('combo-val');
    this.headerIcon = document.getElementById('header-icon');
    this.headerHighlight = document.getElementById('header-highlight');
    
    this.tunerEl = document.getElementById('combat-tuner');
    this.tunerSelect = document.getElementById('tuner-attack-select');
    this.tunerControls = document.getElementById('tuner-controls');
    
    this.initThemes();
    this.initControls();
    this.initTuner();
    
    this.lastScore = -1;
    this.lastCombo = -1;
    this.lastMaxCombo = -1;
    this.lastEnemies = -1;
    this.lastBosses = -1;
  }
  
  initThemes() {
    const container = document.getElementById('theme-buttons');
    this.themes.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `theme-btn ${this.themeColor === t.color ? 'active' : ''}`;
      btn.style.backgroundColor = t.color;
      btn.title = t.name;
      btn.onclick = () => {
        this.themeColor = t.color;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.documentElement.style.setProperty('--theme-color', t.color);
        this.headerIcon.style.color = t.color;
        this.headerHighlight.style.color = t.color;
        this.onThemeChange(t.color);
      };
      container.appendChild(btn);
    });
    
    document.documentElement.style.setProperty('--theme-color', this.themeColor);
    this.headerIcon.style.color = this.themeColor;
    this.headerHighlight.style.color = this.themeColor;
    
    const devCheckbox = document.getElementById('dev-mode-checkbox');
    devCheckbox.checked = this.controller.devMode;
    devCheckbox.addEventListener('change', (e) => {
      this.controller.devMode = e.target.checked;
    });
  }
  
  initControls() {
    const handleSimulatedKeyPress = (code) => {
      this.controller.handleKeyDown(code, code);
      setTimeout(() => this.controller.handleKeyUp(code, code), 150);
    };
    
    document.getElementById('btn-atk-1').addEventListener('click', () => handleSimulatedKeyPress('KeyJ'));
    
    const btnAtk2 = document.getElementById('btn-atk-2');
    if (btnAtk2) {
      // Block button - hold/release simulation
      let blockHeld = false;
      btnAtk2.addEventListener('mousedown', () => {
        if (!blockHeld) {
          this.controller.handleKeyDown('KeyK', 'K');
          blockHeld = true;
        }
      });
      btnAtk2.addEventListener('mouseup', () => {
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
      btnAtk2.addEventListener('mouseleave', () => {
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
      
      // Touch events
      btnAtk2.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!blockHeld) {
          this.controller.handleKeyDown('KeyK', 'K');
          blockHeld = true;
        }
      });
      btnAtk2.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
    }
  }
  
  initTuner() {
    const btnToggle = document.getElementById('btn-toggle-tuner');
    
    this.tunerEl.innerHTML = `
      <div class="tuner-header">
        <span>Combat & Ability Tuner</span>
        <button id="btn-close-tuner">✕</button>
      </div>
      <div class="tuner-nav">
        <button class="tuner-tab active" data-tab="attacks">Attacks</button>
        <button class="tuner-tab" data-tab="physics">Physics</button>
        <button class="tuner-tab" data-tab="bladedance">Dance</button>
      </div>
      <div class="tuner-content">
        <div id="tuner-attacks" class="tuner-panel">
          <div class="tuner-section">
            <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Select Attack:</label>
            <select id="tuner-attack-select" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:4px;border-radius:4px;"></select>
          </div>
          <div id="tuner-controls-attacks" class="tuner-controls"></div>
        </div>
        <div id="tuner-physics" class="tuner-panel hidden">
          <div id="tuner-controls-physics" class="tuner-controls"></div>
        </div>
        <div id="tuner-bladedance" class="tuner-panel hidden">
          <div id="tuner-controls-bladedance" class="tuner-controls"></div>
        </div>
      </div>
      <div class="tuner-footer">
        <button id="btn-export-tuner" class="btn-action" style="width: 100%; height: 2.5rem; font-size: 0.75rem; background: #0f172a;">📤 Export to Clipboard</button>
      </div>
    `;

    const btnClose = document.getElementById('btn-close-tuner');
    this.tunerSelect = document.getElementById('tuner-attack-select');
    
    btnToggle.onclick = () => {
      this.tunerEl.classList.toggle('hidden');
      this.controller.tunerActive = !this.tunerEl.classList.contains('hidden');
      if (this.controller.tunerActive) this.refreshAttacksTuner();
    };
    btnClose.onclick = () => {
      this.tunerEl.classList.add('hidden');
      this.controller.tunerActive = false;
    };

    import('./combat/frame-data.js').then(module => {
      this.attackData = module.ATTACK_FRAME_DATA;
      this.physicsData = module.PHYSICS_DATA;
      this.bladeDanceData = module.BLADE_DANCE_DATA;
      this.swooshData = module.SWOOSH_CONFIG;
      
      // Create deep baseline copies so we can export only changed values later
      this._tunerBaseline = {
        physics: JSON.parse(JSON.stringify(this.physicsData)),
        bladeDance: JSON.parse(JSON.stringify(this.bladeDanceData)),
        attacks: {},
        swooshes: JSON.parse(JSON.stringify(this.swooshData))
      };
      for (const [k, v] of Object.entries(this.attackData)) {
        // serialize instance properties
        this._tunerBaseline.attacks[k] = JSON.parse(JSON.stringify(v));
      }

      Object.keys(this.attackData).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.replace(/_/g, ' ').toUpperCase();
        this.tunerSelect.appendChild(opt);
      });
      
      this.tunerSelect.onchange = () => this.refreshAttacksTuner();
      
      document.querySelectorAll('.tuner-tab').forEach(tab => {
        tab.onclick = (e) => {
          document.querySelectorAll('.tuner-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tuner-panel').forEach(p => p.classList.add('hidden'));
          
          e.target.classList.add('active');
          const targetId = `tuner-${e.target.dataset.tab}`;
          document.getElementById(targetId).classList.remove('hidden');
        };
      });
      
      document.getElementById('btn-export-tuner').onclick = () => {
        const baseline = this._tunerBaseline;
        const exportData = { PHYSICS_DATA: {}, BLADE_DANCE_DATA: {}, SWOOSH_CONFIG: {}, ATTACK_FRAME_DATA: {} };

        // Physics diffs
        for (const [k, v] of Object.entries(this.physicsData)) {
          if (baseline.physics[k] !== v) exportData.PHYSICS_DATA[k] = v;
        }

        // Blade dance diffs
        for (const [k, v] of Object.entries(this.bladeDanceData)) {
          if (baseline.bladeDance[k] !== v) exportData.BLADE_DANCE_DATA[k] = v;
        }

        // Swoosh diffs
        for (const [k, v] of Object.entries(this.swooshData)) {
          if (JSON.stringify(baseline.swooshes[k]) !== JSON.stringify(v)) exportData.SWOOSH_CONFIG[k] = v;
        }

        // Attacks diffs
        for (const [key, data] of Object.entries(this.attackData)) {
          const base = baseline.attacks[key] || {};
          const out = {};

          // Simple scalar fields
          ['startup','active','recovery','damage','hitstun','launch','groundOnly','trip','spike'].forEach(f => {
            if ((base[f] === undefined && data[f] !== undefined) || base[f] !== data[f]) out[f] = data[f];
          });

          // knockback
          if (JSON.stringify(base.knockback || {}) !== JSON.stringify(data.knockback || {})) out.knockback = data.knockback;

          // range
          if (JSON.stringify(base.range || {}) !== JSON.stringify(data.range || {})) out.range = data.range;

          // movement
          if (JSON.stringify(base.movement || {}) !== JSON.stringify(data.movement || {})) out.movement = data.movement;

          // anim
          if (JSON.stringify(base.anim || {}) !== JSON.stringify(data.anim || {})) out.anim = data.anim;

          if (Object.keys(out).length > 0) {
            exportData.ATTACK_FRAME_DATA[key] = out;
          }
        }

        // Clean up empty sections (don't include if no changes)
        if (Object.keys(exportData.PHYSICS_DATA).length === 0) delete exportData.PHYSICS_DATA;
        if (Object.keys(exportData.BLADE_DANCE_DATA).length === 0) delete exportData.BLADE_DANCE_DATA;
        if (Object.keys(exportData.SWOOSH_CONFIG).length === 0) delete exportData.SWOOSH_CONFIG;
        if (Object.keys(exportData.ATTACK_FRAME_DATA).length === 0) delete exportData.ATTACK_FRAME_DATA;

        const payload = JSON.stringify(exportData, null, 2);
        navigator.clipboard.writeText(payload)
          .then(() => alert("Changed combat parameters copied to clipboard!"))
          .catch(err => alert("Failed to copy: " + err));
      };

      this.refreshAttacksTuner();
      this.refreshPhysicsTuner();
      this.refreshBladeDanceTuner();
    });
  }

  createSectionHeader(container, title) {
    const el = document.createElement('div');
    el.className = 'tuner-section-header';
    el.textContent = title;
    container.appendChild(el);
  }

  createSlider(container, label, obj, key, min, max, step, onChange = null) {
    const div = document.createElement('div');
    div.className = 'tuner-control';
    const val = obj[key] !== undefined ? obj[key] : 0;
    div.innerHTML = `
      <label>${label} <span class="tuner-val">${val}</span></label>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${val}">
    `;
    const input = div.querySelector('input');
    const valDisplay = div.querySelector('.tuner-val');
    input.oninput = (e) => {
      const newVal = parseFloat(e.target.value);
      obj[key] = newVal;
      valDisplay.textContent = newVal;
      if (onChange) onChange(newVal);
    };
    container.appendChild(div);
  }

  refreshAttacksTuner() {
    if (!this.attackData || !this.tunerSelect.value) return;
    const key = this.tunerSelect.value;
    const data = this.attackData[key];
    const container = document.getElementById('tuner-controls-attacks');
    container.innerHTML = '';
    
    this.createSectionHeader(container, 'Frame Data');
    this.createSlider(container, 'Startup', data, 'startup', 0, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    this.createSlider(container, 'Active', data, 'active', 1, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    this.createSlider(container, 'Recovery', data, 'recovery', 0, 120, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    
    this.createSectionHeader(container, 'Combat');
    this.createSlider(container, 'Damage', data, 'damage', 0, 100, 1);
    this.createSlider(container, 'Hitstun (sec)', data, 'hitstun', 0, 2, 0.05);
    if (!data.knockback) data.knockback = { x: 0, y: 0 };
    this.createSlider(container, 'Knockback X', data.knockback, 'x', -20, 40, 1);
    this.createSlider(container, 'Knockback Y', data.knockback, 'y', -40, 40, 1);
    
    this.createSectionHeader(container, 'Hitbox Area');
    if (!data.range) data.range = { width: 50, height: 40, offsetX: 25, offsetY: -40 };
    this.createSlider(container, 'Width', data.range, 'width', 10, 200, 1);
    this.createSlider(container, 'Height', data.range, 'height', 10, 200, 1);
    this.createSlider(container, 'Offset X', data.range, 'offsetX', -100, 100, 1);
    this.createSlider(container, 'Offset Y', data.range, 'offsetY', -150, 50, 1);
    
    this.createSectionHeader(container, 'Movement');
    if (!data.movement) data.movement = { vx: 0, vy: 0 };
    this.createSlider(container, 'Velocity X', data.movement, 'vx', -30, 80, 1);
    this.createSlider(container, 'Velocity Y', data.movement, 'vy', -40, 40, 1);
    
    this.createSectionHeader(container, 'Animation Setup');
    if (!data.anim) data.anim = {};
    this.createSlider(container, 'Sword Length', data.anim, 'swordLen', 20, 150, 1);
    this.createSlider(container, 'Start Angle (x PI)', data.anim, 'startAngle', -2, 2, 0.05);
    this.createSlider(container, 'End Angle (x PI)', data.anim, 'endAngle', -2, 2, 0.05);
    this.createSlider(container, 'Sword Thickness', data.anim, 'swordThickness', 1, 15, 0.5);
    this.createSlider(container, 'Body Lean X', data.anim, 'bodyTopX', -60, 60, 1);
    this.createSlider(container, 'Head Lean X', data.anim, 'headX', -60, 60, 1);
    this.createSlider(container, 'Body Top Y', data.anim, 'bodyTopY', -80, 20, 1);
    this.createSlider(container, 'Head Y', data.anim, 'headY', -100, 20, 1);
    this.createSlider(container, 'Body Bot X', data.anim, 'bodyBotX', -40, 40, 1);
    this.createSlider(container, 'Body Bot Y', data.anim, 'bodyBotY', -40, 40, 1);

    // Swoosh customization
    if (this.swooshData && this.swooshData[key]) {
      const s = this.swooshData[key];
      this.createSectionHeader(container, `Swoosh: ${s.type.replace('_', ' ')}`);
      this.createSlider(container, 'Swoosh Offset X', s, 'offsetX', -100, 100, 1);
      this.createSlider(container, 'Swoosh Offset Y', s, 'offsetY', -100, 100, 1);
      this.createSlider(container, 'Swoosh Duration', s, 'maxLife', 0.05, 1.0, 0.01);
      
      if (s.type === 'arc_swoosh') {
        this.createSlider(container, 'Start Angle (x PI)', s, 'startAngle', -2, 2, 0.05);
        this.createSlider(container, 'End Angle (x PI)', s, 'endAngle', -2, 2, 0.05);
        this.createSlider(container, 'Radius', s, 'radius', 10, 150, 1);
        this.createSlider(container, 'Thickness', s, 'thickness', 1, 100, 1);
        this.createSlider(container, 'Squash Y', s, 'squashY', 0.1, 2.0, 0.05);
      } else if (s.type === 'streak') {
        this.createSlider(container, 'Angle (Rad)', s, 'angle', -Math.PI, Math.PI, 0.05);
        this.createSlider(container, 'Length', s, 'length', 10, 400, 1);
        this.createSlider(container, 'Width', s, 'width', 1, 100, 1);
      }
    }
  }

  refreshPhysicsTuner() {
    const container = document.getElementById('tuner-controls-physics');
    container.innerHTML = '';
    const d = this.physicsData;
    
    this.createSectionHeader(container, 'Gravity');
    this.createSlider(container, 'Upward Gravity', d, 'gravity_up', 0.1, 3.0, 0.05);
    this.createSlider(container, 'Downward Gravity', d, 'gravity_down', 0.5, 5.0, 0.1);
    this.createSlider(container, 'Apex Gravity (Float)', d, 'gravity_apex', 0.05, 1.5, 0.01);
    
    this.createSectionHeader(container, 'Jumping');
    this.createSlider(container, 'Ground Jump Power', d, 'jump_ground_power', 5, 40, 1);
    this.createSlider(container, 'Air Jump Base', d, 'jump_air_base', 5, 30, 1);
    this.createSlider(container, 'Air Jump Mult Min', d, 'jump_air_mult_min', 0.1, 2.0, 0.1);
    this.createSlider(container, 'Air Jump Mult Max', d, 'jump_air_mult_max', 0.1, 2.0, 0.1);
    
    this.createSectionHeader(container, 'Locomotion');
    this.createSlider(container, 'Ground Accel', d, 'accel_ground', 10, 100, 1);
    this.createSlider(container, 'Air Accel', d, 'accel_air', 1, 50, 1);
    this.createSlider(container, 'Ground Friction', d, 'friction_ground', 0.8, 0.999, 0.001);
    this.createSlider(container, 'Air Friction', d, 'friction_air', 0.9, 1.0, 0.001);
    this.createSlider(container, 'Slide Friction', d, 'friction_slide', 0.9, 1.0, 0.001);
    this.createSlider(container, 'Crouch Friction', d, 'friction_crouch', 0.5, 0.99, 0.01);
  }

  refreshBladeDanceTuner() {
    const container = document.getElementById('tuner-controls-bladedance');
    container.innerHTML = '';
    const d = this.bladeDanceData;
    
    this.createSectionHeader(container, 'Dance Timing');
    this.createSlider(container, 'Input Window (Sec)', d, 'inputWindow', 0.1, 1.5, 0.05);
    this.createSlider(container, 'Repeat Window (Sec)', d, 'repeatWindow', 0.1, 1.5, 0.05);
    this.createSlider(container, 'Cooldown (Sec)', d, 'cooldown', 0.1, 3.0, 0.05);
  }

  update() {
    const stats = this.controller.stats;
    const currentCombo = this.controller.player.combo;
    
    if (this.lastScore !== stats.score) {
      this.scoreEl.textContent = Math.floor(stats.score).toLocaleString();
      this.lastScore = stats.score;
    }
    
    if (this.lastMaxCombo !== stats.maxCombo) {
      this.maxComboEl.textContent = `${stats.maxCombo}x`;
      this.lastMaxCombo = stats.maxCombo;
    }
    
    if (this.lastEnemies !== stats.enemiesDefeated) {
      if (this.enemiesEl) this.enemiesEl.textContent = stats.enemiesDefeated.toLocaleString();
      this.lastEnemies = stats.enemiesDefeated;
    }
    
    if (this.lastBosses !== stats.bossesDefeated) {
      if (this.bossesEl) this.bossesEl.textContent = stats.bossesDefeated.toLocaleString();
      this.lastBosses = stats.bossesDefeated;
    }
    
    if (this.lastCombo !== currentCombo) {
      if (currentCombo > 0) {
        this.comboContainer.classList.remove('hidden');
        this.comboVal.innerHTML = `${currentCombo}<span style="font-size: 2.25rem; color: white;">x</span>`;
      } else {
        this.comboContainer.classList.add('hidden');
      }
      this.lastCombo = currentCombo;
    }
  }
}