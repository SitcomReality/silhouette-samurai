import { createSectionHeader, createSlider } from '../TunerHelpers.js';

export class AttackPanel {
  constructor(controller, attackData, swooshData) {
    this.controller = controller;
    this.attackData = attackData;
    this.swooshData = swooshData;
  }

  render(container, attackKey) {
    container.innerHTML = '';
    const data = this.attackData[attackKey];
    if (!data) return;

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
    createSlider(container, 'Sword Start Length', data.anim, 'swordStartLen', 0, 150, 1);
    createSlider(container, 'Sword End Length', data.anim, 'swordLen', 20, 150, 1);
    createSlider(container, 'Sword Origin Y', data.anim, 'swordOriginY', -100, 20, 1);
    createSlider(container, 'Start Angle (x PI)', data.anim, 'startAngle', -2, 2, 0.05);
    createSlider(container, 'End Angle (x PI)', data.anim, 'endAngle', -2, 2, 0.05);
    createSlider(container, 'Sword Thickness', data.anim, 'swordThickness', 1, 15, 0.5);
    createSlider(container, 'Body Lean X', data.anim, 'bodyTopX', -60, 60, 1);
    createSlider(container, 'Head Lean X', data.anim, 'headX', -60, 60, 1);
    createSlider(container, 'Body Top Y', data.anim, 'bodyTopY', -80, 20, 1);
    createSlider(container, 'Head Y', data.anim, 'headY', -100, 20, 1);
    createSlider(container, 'Body Bot X', data.anim, 'bodyBotX', -40, 40, 1);
    createSlider(container, 'Body Bot Y', data.anim, 'bodyBotY', -40, 40, 1);

    if (this.swooshData && this.swooshData[attackKey]) {
      const s = this.swooshData[attackKey];
      createSectionHeader(container, `Swoosh: ${s.type.replace('_', ' ')}`);
      createSlider(container, 'Swoosh Offset X', s, 'offsetX', -100, 100, 1);
      createSlider(container, 'Swoosh Offset Y', s, 'offsetY', -100, 100, 1);
      createSlider(container, 'Swoosh Duration', s, 'maxLife', 0.05, 1.0, 0.01);
      
      if (s.type === 'arc_swoosh') {
        createSlider(container, 'Start Angle (x PI)', s, 'startAngle', -2, 2, 0.05);
        createSlider(container, 'End Angle (x PI)', s, 'endAngle', -2, 2, 0.05);
        createSlider(container, 'Squash Y', s, 'squashY', 0.1, 2.0, 0.05);
      } else if (s.type === 'streak') {
        createSlider(container, 'Angle (Rad)', s, 'angle', -Math.PI, Math.PI, 0.05);
        createSlider(container, 'Length', s, 'length', 10, 400, 1);
        createSlider(container, 'Width', s, 'width', 1, 100, 1);
      }
    }
  }
}