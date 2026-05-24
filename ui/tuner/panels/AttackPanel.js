import { createSectionHeader, createSlider } from '../TunerHelpers.js';

export class AttackPanel {
  constructor(controller, attackData) {
    this.controller = controller;
    this.attackData = attackData;
  }

  render(container, attackKey) {
    container.innerHTML = '';
    
    import('../../../combat/frame-data.js').then(module => {
      const chargeConfig = module.CHARGE_CONFIG;
      const data = this.attackData[attackKey];
      
      if (!data) return;

      // Show charge config for unified attack
      if (attackKey === 'unified') {
        createSectionHeader(container, 'Charge System');
        createSlider(container, 'Max Charge Time', chargeConfig, 'maxChargeTime', 0.2, 3.0, 0.1);
        createSlider(container, 'Min Damage Scale', chargeConfig, 'minDamageScale', 0.5, 2.0, 0.1);
        createSlider(container, 'Max Damage Scale', chargeConfig, 'maxDamageScale', 1.0, 5.0, 0.1);
        createSlider(container, 'Min Knockback Scale', chargeConfig, 'minKnockbackScale', 0.5, 2.0, 0.1);
        createSlider(container, 'Max Knockback Scale', chargeConfig, 'maxKnockbackScale', 1.0, 4.0, 0.1);
        createSlider(container, 'Base Movement Speed', chargeConfig, 'baseMovementSpeed', 5, 60, 1);
      }

      createSectionHeader(container, 'Frame Data');
      createSlider(container, 'Startup', data, 'startup', 0, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
      createSlider(container, 'Active', data, 'active', 1, 60, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
      createSlider(container, 'Recovery', data, 'recovery', 0, 120, 1, () => data.totalFrames = data.startup + data.active + data.recovery);
      
      createSectionHeader(container, 'Combat (Base Values)');
      createSlider(container, 'Base Damage', data, 'damage', 0, 100, 1);
      createSlider(container, 'Hitstun (sec)', data, 'hitstun', 0, 2, 0.05);
      if (!data.knockback) data.knockback = { x: 0, y: 0 };
      createSlider(container, 'Base Knockback X', data.knockback, 'x', -20, 40, 1);
      createSlider(container, 'Base Knockback Y', data.knockback, 'y', -40, 40, 1);
      
      createSectionHeader(container, 'Hitbox Area');
      if (!data.range) data.range = { width: 50, height: 40, offsetX: 25, offsetY: -40 };
      createSlider(container, 'Width', data.range, 'width', 10, 200, 1);
      createSlider(container, 'Height', data.range, 'height', 10, 200, 1);
      createSlider(container, 'Offset Distance', data.range, 'offsetX', 10, 150, 1);
      createSlider(container, 'Offset Y', data.range, 'offsetY', -150, 50, 1);
      
      createSectionHeader(container, 'Animation');
      if (!data.anim) data.anim = {};
      createSlider(container, 'Sword Start Length', data.anim, 'swordStartLen', 0, 150, 1);
      createSlider(container, 'Sword End Length', data.anim, 'swordLen', 20, 150, 1);
      createSlider(container, 'Sword Origin Y', data.anim, 'swordOriginY', -100, 20, 1);
      createSlider(container, 'Sword Thickness', data.anim, 'swordThickness', 1, 15, 0.5);
      
      const note = document.createElement('div');
      note.style.cssText = 'margin-top: 1rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; font-size: 0.65rem; color: #94a3b8;';
      note.textContent = 'Note: Attack angles and body poses are now procedurally generated based on movement direction. Base values shown here are modified at runtime.';
      container.appendChild(note);
    });
  }
}