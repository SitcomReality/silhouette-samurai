import { TUNER_HTML, setupTabs } from './TunerUI.js';
import { AttackPanel } from './panels/AttackPanel.js';
import { PhysicsPanel } from './panels/PhysicsPanel.js';

export class CombatTuner {
  constructor(controller) {
    this.controller = controller;
    this.tunerEl = document.getElementById('combat-tuner');
    this.attackData = null;
    this.physicsData = null;
    this.swooshData = null;
    this._tunerBaseline = null;
    this.attackPanel = null;
    this.physicsPanel = null;
  }

  init() {
    const btnToggle = document.getElementById('btn-toggle-tuner');
    if (!this.tunerEl || !btnToggle) return;

    this.tunerEl.innerHTML = TUNER_HTML;
    setupTabs(this.tunerEl);

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
      this.swooshData = module.SWOOSH_CONFIG;
      
      this.attackPanel = new AttackPanel(this.controller, this.attackData, this.swooshData);
      this.physicsPanel = new PhysicsPanel(this.physicsData);

      this._tunerBaseline = {
        physics: this.physicsData ? JSON.parse(JSON.stringify(this.physicsData)) : {},
        attacks: {},
        swooshes: this.swooshData ? JSON.parse(JSON.stringify(this.swooshData)) : {}
      };
      if (this.attackData) {
        for (const [k, v] of Object.entries(this.attackData)) {
          this._tunerBaseline.attacks[k] = JSON.parse(JSON.stringify(v));
        }
      }

      // Add unified attack first
      const unifiedOpt = document.createElement('option');
      unifiedOpt.value = 'unified';
      unifiedOpt.textContent = '⚡ UNIFIED ATTACK (NEW)';
      tunerSelect.appendChild(unifiedOpt);
      
      Object.keys(this.attackData).filter(k => k !== 'unified').forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.replace(/_/g, ' ').toUpperCase();
        tunerSelect.appendChild(opt);
      });
      
      tunerSelect.value = 'unified';
      
      tunerSelect.onchange = () => {
        this.controller.tunerSelectedAttack = tunerSelect.value;
        this.refreshAttacksTuner();
      };
      
      document.getElementById('btn-export-tuner').onclick = () => this.exportToClipboard();

      this.refreshAttacksTuner();
      this.refreshPhysicsTuner();
    });
  }

  refreshAttacksTuner() {
    const tunerSelect = document.getElementById('tuner-attack-select');
    if (!this.attackPanel || !tunerSelect.value) return;
    const container = document.getElementById('tuner-controls-attacks');
    this.attackPanel.render(container, tunerSelect.value);
  }

  refreshPhysicsTuner() {
    if (!this.physicsPanel) return;
    const container = document.getElementById('tuner-controls-physics');
    this.physicsPanel.render(container);
  }

  exportToClipboard() {
    const baseline = this._tunerBaseline;
    const exportData = { PHYSICS_DATA: {}, SWOOSH_CONFIG: {}, ATTACK_FRAME_DATA: {} };

    for (const [k, v] of Object.entries(this.physicsData)) {
      if (baseline.physics[k] !== v) exportData.PHYSICS_DATA[k] = v;
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
    if (Object.keys(exportData.SWOOSH_CONFIG).length === 0) delete exportData.SWOOSH_CONFIG;
    if (Object.keys(exportData.ATTACK_FRAME_DATA).length === 0) delete exportData.ATTACK_FRAME_DATA;

    const payload = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(payload)
      .then(() => alert("Changed parameters copied to clipboard!"))
      .catch(err => alert("Failed to copy: " + err));
  }
}