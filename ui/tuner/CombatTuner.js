import { createSectionHeader, createSlider } from './TunerHelpers.js';

export class CombatTuner {
  constructor(controller) {
    this.controller = controller;
    this.tunerEl = document.getElementById('combat-tuner');
    this.attackData = null;
    this.physicsData = null;
    this.bladeDanceData = null;
    this.swooshData = null;
    this._tunerBaseline = null;
  }

  init() {
    const btnToggle = document.getElementById('btn-toggle-tuner');
    if (!this.tunerEl || !btnToggle) return;

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
          <div class="tuner-section" style="padding: 10px; border-bottom: 1px solid #334155; background: rgba(0,0,0,0.2);">
            <div style="display: flex; flex-direction: column; gap: 8px;">
               <label class="dev-mode-toggle" style="border: none; padding: 0; margin: 0;">
                 <input type="checkbox" id="tuner-freeze-player" />
                 <span>Freeze Player Movement</span>
               </label>
               <label class="dev-mode-toggle" style="border: none; padding: 0; margin: 0;">
                 <input type="checkbox" id="tuner-loop-attack" />
                 <span>Auto-Loop Selected Attack</span>
               </label>
            </div>
          </div>
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
    const tunerSelect = document.getElementById('tuner-attack-select');
    const freezeToggle = document.getElementById('tuner-freeze-player');
    const loopToggle = document.getElementById('tuner-loop-attack');

    freezeToggle.onchange = (e) => { this.controller.freezePlayer = e.target.checked; };
    loopToggle.onchange = (e) => { this.controller.loopSelectedAttack = e.target.checked; };
    
    btnToggle.onclick = () => {
      this.tunerEl.classList.toggle('hidden');
      this.controller.tunerActive = !this.tunerEl.classList.contains('hidden');
      if (this.controller.tunerActive) this.refreshAttacksTuner();
    };
    btnClose.onclick = () => {
      this.tunerEl.classList.add('hidden');
      this.controller.tunerActive = false;
    };

    import('../../combat/frame-data.js').then(module => {
      this.attackData = module.ATTACK_FRAME_DATA;
      this.physicsData = module.PHYSICS_DATA;
      this.bladeDanceData = module.BLADE_DANCE_DATA;
      this.swooshData = module.SWOOSH_CONFIG;
      
      this._tunerBaseline = {
        physics: this.physicsData ? JSON.parse(JSON.stringify(this.physicsData)) : {},
        bladeDance: this.bladeDanceData ? JSON.parse(JSON.stringify(this.bladeDanceData)) : {},
        attacks: {},
        swooshes: this.swooshData ? JSON.parse(JSON.stringify(this.swooshData)) : {}
      };
      if (this.attackData) {
        for (const [k, v] of Object.entries(this.attackData)) {
          this._tunerBaseline.attacks[k] = JSON.parse(JSON.stringify(v));
        }
      }

      Object.keys(this.attackData).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.replace(/_/g, ' ').toUpperCase();
        tunerSelect.appendChild(opt);
      });
      
      tunerSelect.onchange = () => {
        this.controller.tunerSelectedAttack = tunerSelect.value;
        this.refreshAttacksTuner();
      };
      
      document.querySelectorAll('.tuner-tab').forEach(tab => {
        tab.onclick = (e) => {
          document.querySelectorAll('.tuner-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tuner-panel').forEach(p => p.classList.add('hidden'));
          e.target.classList.add('active');
          const targetId = `tuner-${e.target.dataset.tab}`;
          document.getElementById(targetId).classList.remove('hidden');
        };
      });
      
      document.getElementById('btn-export-tuner').onclick = () => this.exportToClipboard();

      this.refreshAttacksTuner();
      this.refreshPhysicsTuner();
      this.refreshBladeDanceTuner();
    });
  }

  refreshAttacksTuner() {
    const tunerSelect = document.getElementById('tuner-attack-select');
    if (!this.attackData || !tunerSelect.value) return;
    const key = tunerSelect.value;
    const data = this.attackData[key];
    const container = document.getElementById('tuner-controls-attacks');
    container.innerHTML = '';
    
    createSectionHeader(container, 'Frame Data');
    createSlider(container, 'Startup', data, 'startup', 0, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    createSlider(container, 'Active', data, 'active', 1, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    createSlider(container, 'Recovery', data, 'recovery', 0, 120, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
    
    createSectionHeader(container, 'Combat');
    createSlider(container, 'Damage', data, 'damage', 0, 100, 1);
    createSlider(container, 'Hitstun (sec)', data, 'hitstun', 0, 2, 0.05);
    if (!data.knockback) data.knockback = { x: 0, y: 0 };
    createSlider(container, 'Knockback X', data.knockback, 'x', -20, 40, 1);
    createSlider(container, 'Knockback Y', data.knockback, 'y', -40, 40, 1);
    
    createSectionHeader(container, 'Hitbox Area');
    if (!data.range) data.range = { width: 50, height: 40, offsetX: 25, offsetY: -40 };
    createSlider(container, 'Width', data.range, 'width', 10, 200, 1);
    createSlider(container, 'Height', data.range, 'height', 10, 200, 1);
    createSlider(container, 'Offset X', data.range, 'offsetX', -100, 100, 1);
    createSlider(container, 'Offset Y', data.range, 'offsetY', -150, 50, 1);
    
    createSectionHeader(container, 'Movement');
    if (!data.movement) data.movement = { vx: 0, vy: 0 };
    createSlider(container, 'Velocity X', data.movement, 'vx', -30, 80, 1);
    createSlider(container, 'Velocity Y', data.movement, 'vy', -40, 40, 1);
    
    createSectionHeader(container, 'Animation Setup');
    if (!data.anim) data.anim = {};
    createSlider(container, 'Sword Length', data.anim, 'swordLen', 20, 150, 1);
    createSlider(container, 'Start Angle (x PI)', data.anim, 'startAngle', -2, 2, 0.05);
    createSlider(container, 'End Angle (x PI)', data.anim, 'endAngle', -2, 2, 0.05);
    createSlider(container, 'Sword Thickness', data.anim, 'swordThickness', 1, 15, 0.5);
    createSlider(container, 'Body Lean X', data.anim, 'bodyTopX', -60, 60, 1);
    createSlider(container, 'Head Lean X', data.anim, 'headX', -60, 60, 1);
    createSlider(container, 'Body Top Y', data.anim, 'bodyTopY', -80, 20, 1);
    createSlider(container, 'Head Y', data.anim, 'headY', -100, 20, 1);
    createSlider(container, 'Body Bot X', data.anim, 'bodyBotX', -40, 40, 1);
    createSlider(container, 'Body Bot Y', data.anim, 'bodyBotY', -40, 40, 1);

    if (this.swooshData && this.swooshData[key]) {
      const s = this.swooshData[key];
      createSectionHeader(container, `Swoosh: ${s.type.replace('_', ' ')}`);
      createSlider(container, 'Swoosh Offset X', s, 'offsetX', -100, 100, 1);
      createSlider(container, 'Swoosh Offset Y', s, 'offsetY', -100, 100, 1);
      createSlider(container, 'Swoosh Duration', s, 'maxLife', 0.05, 1.0, 0.01);
      
      if (s.type === 'arc_swoosh') {
        createSlider(container, 'Start Angle (x PI)', s, 'startAngle', -2, 2, 0.05);
        createSlider(container, 'End Angle (x PI)', s, 'endAngle', -2, 2, 0.05);
        // Radius and Thickness are fixed globally (radius=100, thickness=20) and no longer editable here.
        createSlider(container, 'Squash Y', s, 'squashY', 0.1, 2.0, 0.05);
      } else if (s.type === 'streak') {
        createSlider(container, 'Angle (Rad)', s, 'angle', -Math.PI, Math.PI, 0.05);
        createSlider(container, 'Length', s, 'length', 10, 400, 1);
        createSlider(container, 'Width', s, 'width', 1, 100, 1);
      }
    }
  }

  refreshPhysicsTuner() {
    const container = document.getElementById('tuner-controls-physics');
    if (!container) return;
    container.innerHTML = '';
    const d = this.physicsData;
    
    createSectionHeader(container, 'Gravity');
    createSlider(container, 'Upward Gravity', d, 'gravity_up', 0.1, 3.0, 0.05);
    createSlider(container, 'Downward Gravity', d, 'gravity_down', 0.5, 5.0, 0.1);
    createSlider(container, 'Apex Gravity (Float)', d, 'gravity_apex', 0.05, 1.5, 0.01);
    
    createSectionHeader(container, 'Jumping');
    createSlider(container, 'Ground Jump Power', d, 'jump_ground_power', 5, 40, 1);
    createSlider(container, 'Air Jump Base', d, 'jump_air_base', 5, 30, 1);
    createSlider(container, 'Air Jump Mult Min', d, 'jump_air_mult_min', 0.1, 2.0, 0.1);
    createSlider(container, 'Air Jump Mult Max', d, 'jump_air_mult_max', 0.1, 2.0, 0.1);
    
    createSectionHeader(container, 'Locomotion');
    createSlider(container, 'Ground Accel', d, 'accel_ground', 10, 100, 1);
    createSlider(container, 'Air Accel', d, 'accel_air', 1, 50, 1);
    createSlider(container, 'Ground Friction', d, 'friction_ground', 0.8, 0.999, 0.001);
    createSlider(container, 'Air Friction', d, 'friction_air', 0.9, 1.0, 0.001);
    createSlider(container, 'Slide Friction', d, 'friction_slide', 0.9, 1.0, 0.001);
    createSlider(container, 'Crouch Friction', d, 'friction_crouch', 0.5, 0.99, 0.01);
  }

  refreshBladeDanceTuner() {
    const container = document.getElementById('tuner-controls-bladedance');
    if (!container) return;
    container.innerHTML = '';
    const d = this.bladeDanceData;
    
    createSectionHeader(container, 'Dance Timing');
    createSlider(container, 'Input Window (Sec)', d, 'inputWindow', 0.1, 1.5, 0.05);
    createSlider(container, 'Repeat Window (Sec)', d, 'repeatWindow', 0.1, 1.5, 0.05);
    createSlider(container, 'Cooldown (Sec)', d, 'cooldown', 0.1, 3.0, 0.05);
  }

  exportToClipboard() {
    const baseline = this._tunerBaseline;
    const exportData = { PHYSICS_DATA: {}, BLADE_DANCE_DATA: {}, SWOOSH_CONFIG: {}, ATTACK_FRAME_DATA: {} };

    for (const [k, v] of Object.entries(this.physicsData)) {
      if (baseline.physics[k] !== v) exportData.PHYSICS_DATA[k] = v;
    }
    for (const [k, v] of Object.entries(this.bladeDanceData)) {
      if (baseline.bladeDance[k] !== v) exportData.BLADE_DANCE_DATA[k] = v;
    }
    for (const [k, v] of Object.entries(this.swooshData)) {
      if (JSON.stringify(baseline.swooshes[k]) !== JSON.stringify(v)) exportData.SWOOSH_CONFIG[k] = v;
    }
    for (const [key, data] of Object.entries(this.attackData)) {
      const base = baseline.attacks[key] || {};
      const out = {};
      ['startup','active','recovery','damage','hitstun','launch','groundOnly','trip','spike'].forEach(f => {
        if ((base[f] === undefined && data[f] !== undefined) || base[f] !== data[f]) out[f] = data[f];
      });
      if (JSON.stringify(base.knockback || {}) !== JSON.stringify(data.knockback || {})) out.knockback = data.knockback;
      if (JSON.stringify(base.range || {}) !== JSON.stringify(data.range || {})) out.range = data.range;
      if (JSON.stringify(base.movement || {}) !== JSON.stringify(data.movement || {})) out.movement = data.movement;
      if (JSON.stringify(base.anim || {}) !== JSON.stringify(data.anim || {})) out.anim = data.anim;

      if (Object.keys(out).length > 0) {
        exportData.ATTACK_FRAME_DATA[key] = out;
      }
    }

    if (Object.keys(exportData.PHYSICS_DATA).length === 0) delete exportData.PHYSICS_DATA;
    if (Object.keys(exportData.BLADE_DANCE_DATA).length === 0) delete exportData.BLADE_DANCE_DATA;
    if (Object.keys(exportData.SWOOSH_CONFIG).length === 0) delete exportData.SWOOSH_CONFIG;
    if (Object.keys(exportData.ATTACK_FRAME_DATA).length === 0) delete exportData.ATTACK_FRAME_DATA;

    const payload = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(payload)
      .then(() => alert("Changed parameters copied to clipboard!"))
      .catch(err => alert("Failed to copy: " + err));
  }
}