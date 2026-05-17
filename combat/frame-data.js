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

export const BLADE_DANCE_DATA = {
  inputWindow: 0.45,
  repeatWindow: 0.35,
  cooldown: 0.4
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
    anim: { swordLen: 75, startAngle: 0.4, endAngle: -0.2, bodyTopX: 0, bodyTopY: -35, headX: -11, headY: -55, bodyBotX: -5, bodyBotY: 0, swordThickness: 3 }
  }),
  forward: new AttackFrameData('forward', {
    startup: 6, active: 4, recovery: 12, damage: 16, knockback: { x: 9, y: -2 }, hitstun: 0.35, movement: { vx: 26, vy: 0 },
    range: { width: 95, height: 40, offsetX: 55, offsetY: -35 },
    anim: { swordLen: 95, startAngle: 0, endAngle: 0, bodyTopX: 15, bodyTopY: -35, headX: 20, headY: -55, bodyBotX: -10, bodyBotY: 0, swordThickness: 4 }
  }),
  up: new AttackFrameData('up', {
    startup: 6, active: 6, recovery: 12, damage: 16, knockback: { x: 2, y: -14 }, hitstun: 0.45, launch: true, movement: { vx: 8, vy: -8 },
    range: { width: 110, height: 80, offsetX: 30, offsetY: -80 },
    sweetspot: { offsetX: 40, offsetY: -95, radius: 20, damageBonus: 8, knockbackMult: 1.45 },
    anim: { swordLen: 82, startAngle: -0.25, endAngle: -1.35, bodyTopX: 20, bodyTopY: -48, headX: 26, headY: -60, bodyBotX: 0, bodyBotY: -14, swordThickness: 2.5 }
  }),
  down: new AttackFrameData('down', {
    startup: 4, active: 5, recovery: 10, damage: 12, knockback: { x: 5, y: -7 }, hitstun: 0.35, trip: true,
    range: { width: 70, height: 30, offsetX: 35, offsetY: -15 },
    anim: { swordLen: 58, startAngle: 0.15, endAngle: -0.35, bodyTopX: 22, bodyTopY: -15, headX: 26, headY: -25, bodyBotX: -10, bodyBotY: 0, swordThickness: 3 }
  }),
  air_neutral: new AttackFrameData('air_neutral', {
    startup: 3, active: 5, recovery: 8, damage: 10, knockback: { x: 5, y: -3 }, hitstun: 0.25, groundOnly: false,
    range: { width: 60, height: 45, offsetX: 30, offsetY: -40 },
    anim: { swordLen: 75, startAngle: 0.4, endAngle: -0.4, bodyTopX: 8, bodyTopY: -35, headX: 12, headY: -55, bodyBotX: -5, bodyBotY: 0, swordThickness: 3 }
  }),
  air_forward: new AttackFrameData('air_forward', {
    startup: 4, active: 6, recovery: 12, damage: 15, knockback: { x: 10, y: -3 }, hitstun: 0.35, groundOnly: false, movement: { vx: 28, vy: 0 },
    range: { width: 70, height: 45, offsetX: 40, offsetY: -35 },
    anim: { swordLen: 95, startAngle: 0, endAngle: 0, bodyTopX: 15, bodyTopY: -35, headX: 20, headY: -55, bodyBotX: -10, bodyBotY: 0, swordThickness: 4 }
  }),
  air_up: new AttackFrameData('air_up', {
    startup: 6, active: 6, recovery: 12, damage: 14, knockback: { x: 1, y: -10 }, hitstun: 0.45, groundOnly: false,
    range: { width: 45, height: 65, offsetX: 15, offsetY: -65 },
    anim: { swordLen: 82, startAngle: -0.25, endAngle: -1.35, bodyTopX: 20, bodyTopY: -48, headX: 26, headY: -60, bodyBotX: 0, bodyBotY: -14, swordThickness: 2.5 }
  }),
  air_down: new AttackFrameData('air_down', {
    startup: 9, active: 4, recovery: 18, damage: 20, knockback: { x: 0, y: 15 }, hitstun: 0.5, spike: true, groundOnly: false, movement: { vx: 0, vy: 8 },
    range: { width: 40, height: 50, offsetX: 0, offsetY: 10 },
    anim: { swordLen: 58, startAngle: 0.15, endAngle: -0.35, bodyTopX: 22, bodyTopY: -15, headX: 26, headY: -25, bodyBotX: -10, bodyBotY: 0, swordThickness: 3 }
  }),
  dance_starter: new AttackFrameData('dance_starter', {
    startup: 4, active: 8, recovery: 20, damage: 18, knockback: { x: 8, y: -1 }, hitstun: 0.45, movement: { vx: 30, vy: 0 },
    range: { width: 80, height: 60, offsetX: 50, offsetY: -38 },
    anim: { swordLen: 90, startAngle: 0.6, endAngle: 0, bodyTopX: 5, bodyTopY: -35, headX: 0, headY: -55, bodyBotX: -8, bodyBotY: 0, swordThickness: 4 }
  }),
  dance_linker_neutral: new AttackFrameData('dance_linker_neutral', {
    startup: 6, active: 4, recovery: 24, damage: 12, knockback: { x: 6, y: -2 }, hitstun: 0.35, movement: { vx: 18, vy: 0 },
    range: { width: 85, height: 40, offsetX: 40, offsetY: -38 },
    anim: { swordLen: 85, startAngle: -1, endAngle: 0, bodyTopX: 7, bodyTopY: -35, headX: 11, headY: -55, bodyBotX: -8, bodyBotY: 0, swordThickness: 3.5 }
  }),
  dance_linker_up: new AttackFrameData('dance_linker_up', {
    startup: 8, active: 4, recovery: 24, damage: 10, knockback: { x: 2, y: -8 }, hitstun: 0.35, movement: { vx: 6, vy: -4 },
    range: { width: 55, height: 60, offsetX: 20, offsetY: -50 },
    anim: { swordLen: 52, startAngle: -0.15, endAngle: -0.9, bodyTopX: 14, bodyTopY: -38, headX: 20, headY: -53, bodyBotX: 0, bodyBotY: 0, swordThickness: 3.5 }
  }),
  dance_linker_down: new AttackFrameData('dance_linker_down', {
    startup: 8, active: 4, recovery: 24, damage: 10, knockback: { x: 6, y: -10 }, hitstun: 0.4, trip: true, movement: { vx: 10, vy: 0 },
    range: { width: 70, height: 25, offsetX: 35, offsetY: -15 },
    anim: { swordLen: 58, startAngle: 0.15, endAngle: -0.3, bodyTopX: 20, bodyTopY: -18, headX: 24, headY: -28, bodyBotX: -10, bodyBotY: 0, swordThickness: 3.5 }
  }),
  dance_finisher_neutral: new AttackFrameData('dance_finisher_neutral', {
    startup: 16, active: 6, recovery: 40, damage: 30, knockback: { x: 18, y: -4 }, hitstun: 0.7, movement: { vx: 10, vy: 0 },
    range: { width: 85, height: 50, offsetX: 45, offsetY: -40 },
    anim: { swordLen: 62, startAngle: 0.9, endAngle: -0.7, bodyTopX: 25, bodyTopY: -30, headX: 30, headY: -40, bodyBotX: 0, bodyBotY: 0, swordThickness: 9 }
  }),
  dance_finisher_up: new AttackFrameData('dance_finisher_up', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 1, y: -22 }, hitstun: 0.7, launch: true, movement: { vx: 4, vy: -10 },
    range: { width: 65, height: 85, offsetX: 20, offsetY: -75 },
    anim: { swordLen: 60, startAngle: -0.6, endAngle: 0.9, bodyTopX: 20, bodyTopY: -40, headX: 25, headY: -55, bodyBotX: -8, bodyBotY: -18, swordThickness: 5 }
  }),
  dance_finisher_down: new AttackFrameData('dance_finisher_down', {
    startup: 16, active: 6, recovery: 40, damage: 28, knockback: { x: 0, y: 25 }, hitstun: 0.75, spike: true, movement: { vx: 0, vy: 8 },
    range: { width: 55, height: 70, offsetX: 0, offsetY: 10 },
    anim: { swordLen: 70, startAngle: 0, endAngle: 0, bodyTopX: 0, bodyTopY: -45, headX: 0, headY: -60, bodyBotX: 0, bodyBotY: -25, swordThickness: 9 }
  })
};