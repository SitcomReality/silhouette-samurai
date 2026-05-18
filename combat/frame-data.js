export const PHYSICS_DATA = {
  gravity_up: 0.65,
  gravity_down: 2.2,
  gravity_apex: 0.18,
  jump_ground_power: 20,
  jump_air_base: 16,
  jump_air_mult_min: 0.6,
  jump_air_mult_max: 0.4,
  accel_ground: 45,
  accel_air: 12,
  friction_ground: 0.90,
  friction_air: 0.985,
  friction_slide: 0.992,
  friction_crouch: 0.82
};

export const COMBO_CONFIG = {
  decayTime: 1.4,
  finisherThreshold: 5
};

export const SWOOSH_CONFIG = {
  neutral: { type: 'arc_swoosh', offsetX: -10, offsetY: -55, startAngle: 0.65, endAngle: -0.25, radius: 100, thickness: 20, squashY: 0.15, maxLife: 0.22 },
  up: { type: 'arc_swoosh', offsetX: 30, offsetY: -65, startAngle: -0.1, endAngle: -0.9, radius: 65, thickness: 35, squashY: 0.9, maxLife: 0.26 },
  down: { type: 'arc_swoosh', offsetX: 10, offsetY: -52, startAngle: 1.2, endAngle: -0.4, radius: 80, thickness: 30, squashY: 0.3, maxLife: 0.35 },
  forward: { type: 'arc_swoosh', offsetX: -13, offsetY: -67, startAngle: -0.8, endAngle: 0.35, radius: 100, thickness: 20, squashY: 0.15, maxLife: 0.24 },
  air_neutral: { type: 'arc_swoosh', offsetX: 0, offsetY: -15, startAngle: -0.9, endAngle: -0.1, radius: 58, thickness: 28, squashY: 0.85, maxLife: 0.22 },
  air_forward: { type: 'arc_swoosh', offsetX: -10, offsetY: -69, startAngle: 1, endAngle: -0.1, radius: 70, thickness: 30, squashY: 0.3, maxLife: 0.3 },
  air_up: { type: 'arc_swoosh', offsetX: 10, offsetY: -70, startAngle: 0.05, endAngle: -0.95, radius: 60, thickness: 32, squashY: 1, maxLife: 0.3 },
  air_down: { type: 'streak', offsetX: 0, offsetY: -20, angle: 1.57, length: 150, width: 35, maxLife: 0.25 },
  dance_finisher_neutral: { type: 'arc_swoosh', offsetX: 42, offsetY: -40, startAngle: 0.9, endAngle: -0.1, radius: 90, thickness: 60, squashY: 0.3, maxLife: 0.4 },
  dance_finisher_up: { type: 'arc_swoosh', offsetX: 20, offsetY: -60, startAngle: -0.1, endAngle: -1.0, radius: 85, thickness: 50, squashY: 1.0, maxLife: 0.38 },
  dance_finisher_down: { type: 'streak', offsetX: 0, offsetY: -30, angle: 1.57, length: 180, width: 45, maxLife: 0.35 }
};

export class AttackFrameData {
  constructor(name, data) {
    this.name = name;
    this.startup = data.startup || 0;
    this.active = data.active || 3;
    this.recovery = data.recovery || 10;
    this.damage = data.damage || 10;
    this.knockback = data.knockback || { x: 4, y: -2 };
    this.hitstun = data.hitstun || 0.3;
    this.range = data.range || { width: 50, height: 40, offsetX: 25, offsetY: -40 };
    this.movement = data.movement || { vx: 0, vy: 0 };
    this.launch = data.launch || false;
    this.sweetspot = data.sweetspot || null;
    this.groundOnly = data.groundOnly !== undefined ? data.groundOnly : true;
    this.trip = data.trip || false;
    this.spike = data.spike || false;
    this.anim = data.anim || {};
    this.totalFrames = this.startup + this.active + this.recovery;
  }
  getDuration() { return this.totalFrames / 60; }
  isActive(currentFrame) { return currentFrame >= this.startup && currentFrame < this.startup + this.active; }
  isInRecovery(currentFrame) { return currentFrame >= this.startup + this.active && currentFrame < this.totalFrames; }
  canCancel(currentFrame) { return currentFrame >= this.totalFrames; }
}

export const ATTACK_FRAME_DATA = {
  neutral: new AttackFrameData('neutral', {
    startup: 2, active: 4, recovery: 6, damage: 8, knockback: { x: 3, y: -1 }, hitstun: 0.2,
    range: { width: 70, height: 35, offsetX: 60, offsetY: -53 },
    anim: { swordLen: 70, swordStartLen: 8, swordOriginY: -40, startAngle: 0.85, endAngle: 0, bodyTopX: -4, bodyTopY: -35, headX: -1, headY: -55, bodyBotX: 0, bodyBotY: 0, swordThickness: 3 }
  }),
  up: new AttackFrameData('up', {
    startup: 6, active: 6, recovery: 12, damage: 16, knockback: { x: 2, y: -14 }, hitstun: 0.45, launch: true, movement: { vx: 8, vy: -8 },
    range: { width: 110, height: 80, offsetX: 30, offsetY: -80 },
    sweetspot: { offsetX: 40, offsetY: -95, radius: 20, damageBonus: 8, knockbackMult: 1.45 },
    anim: { swordLen: 59, swordStartLen: 96, swordOriginY: -45, startAngle: 0, endAngle: -1, bodyTopX: 20, bodyTopY: -48, headX: 26, headY: -60, bodyBotX: 0, bodyBotY: -14, swordThickness: 2.5 }
  }),
  down: new AttackFrameData('down', {
    startup: 4, active: 10, recovery: 14, damage: 12, knockback: { x: 5, y: -7 }, hitstun: 0.35, trip: true, movement: { vx: 20, vy: 0 },
    range: { width: 60, height: 80, offsetX: 50, offsetY: -40 },
    anim: { swordLen: 33, swordStartLen: 71, swordOriginY: -60, startAngle: 1, endAngle: -0.1, bodyTopX: 13, bodyTopY: -34, headX: 12, headY: -48, bodyBotX: 31, bodyBotY: 4, swordThickness: 3 }
  }),
  air_neutral: new AttackFrameData('air_neutral', {
    startup: 3, active: 5, recovery: 8, damage: 10, knockback: { x: 5, y: -3 }, hitstun: 0.25, groundOnly: false,
    range: { width: 60, height: 70, offsetX: 45, offsetY: -66 },
    anim: { swordLen: 75, swordStartLen: 75, swordOriginY: -40, startAngle: -0.9, endAngle: 0, bodyTopX: 8, bodyTopY: -35, headX: 12, headY: -55, bodyBotX: -5, bodyBotY: 0, swordThickness: 3 }
  }),
  air_forward: new AttackFrameData('air_forward', {
    startup: 4, active: 6, recovery: 12, damage: 15, knockback: { x: 10, y: -3 }, hitstun: 0.35, groundOnly: false, movement: { vx: 33, vy: 0 },
    range: { width: 70, height: 45, offsetX: 40, offsetY: -35 },
    anim: { swordLen: 105, swordStartLen: 105, swordOriginY: -35, startAngle: -0.2, endAngle: 0.1, bodyTopX: 0, bodyTopY: -35, headX: 4, headY: -55, bodyBotX: -10, bodyBotY: 0, swordThickness: 4 }
  }),
  air_up: new AttackFrameData('air_up', {
    startup: 6, active: 6, recovery: 12, damage: 14, knockback: { x: 1, y: -10 }, hitstun: 0.45, groundOnly: false,
    range: { width: 100, height: 60, offsetX: 0, offsetY: -120 },
    anim: { swordLen: 82, swordStartLen: 82, swordOriginY: -45, startAngle: 0, endAngle: -1, bodyTopX: 20, bodyTopY: -48, headX: 26, headY: -60, bodyBotX: 0, bodyBotY: -14, swordThickness: 2.5 }
  }),
  air_down: new AttackFrameData('air_down', {
    startup: 4, active: 30, recovery: 8, damage: 20, knockback: { x: 0, y: 15 }, hitstun: 0.5, spike: true, groundOnly: false, movement: { vx: 0, vy: 8 },
    range: { width: 80, height: 100, offsetX: 0, offsetY: 25 },
    anim: { swordLen: 78, swordStartLen: 10, swordOriginY: -36, startAngle: 0.55, endAngle: 0.65, bodyTopX: 0, bodyTopY: -21, headX: 4, headY: -37, bodyBotX: 1, bodyBotY: 10, swordThickness: 3 }
  }),
  forward: new AttackFrameData('forward', {
    startup: 4, active: 8, recovery: 20, damage: 18, knockback: { x: 8, y: -1 }, hitstun: 0.45, movement: { vx: 30, vy: 0 },
    range: { width: 80, height: 50, offsetX: 50, offsetY: -60 },
    anim: { swordLen: 55, swordStartLen: 15, swordOriginY: -36, startAngle: -0.85, endAngle: 0.1, bodyTopX: 0, bodyTopY: -36, headX: 6, headY: -55, bodyBotX: 5, bodyBotY: -6, swordThickness: 4 }
  }),
  dance_finisher_neutral: new AttackFrameData('dance_finisher_neutral', {
    startup: 16, active: 6, recovery: 40, damage: 30, knockback: { x: 18, y: -4 }, hitstun: 0.7, movement: { vx: 10, vy: 0 },
    range: { width: 85, height: 50, offsetX: 45, offsetY: -40 },
    anim: { swordLen: 62, swordStartLen: 62, swordOriginY: -40, startAngle: 0.9, endAngle: -0.7, bodyTopX: 25, bodyTopY: -30, headX: 30, headY: -40, bodyBotX: 0, bodyBotY: 0, swordThickness: 9 }
  }),
  dance_finisher_up: new AttackFrameData('dance_finisher_up', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 1, y: -22 }, hitstun: 0.7, launch: true, movement: { vx: 4, vy: -10 },
    range: { width: 65, height: 85, offsetX: 20, offsetY: -75 },
    anim: { swordLen: 60, swordStartLen: 60, swordOriginY: -45, startAngle: -0.6, endAngle: 0.9, bodyTopX: 20, bodyTopY: -40, headX: 25, headY: -55, bodyBotX: -8, bodyBotY: -18, swordThickness: 5 }
  }),
  dance_finisher_down: new AttackFrameData('dance_finisher_down', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 0, y: 25 }, hitstun: 0.75, spike: true, movement: { vx: 0, vy: 8 },
    range: { width: 55, height: 70, offsetX: 0, offsetY: 10 },
    anim: { swordLen: 70, swordStartLen: 70, swordOriginY: -45, startAngle: 0, endAngle: 0, bodyTopX: 0, bodyTopY: -45, headX: 0, headY: -60, bodyBotX: 0, bodyBotY: -25, swordThickness: 9 }
  })
};