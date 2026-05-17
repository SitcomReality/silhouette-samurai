// Frame-based attack state machine
export class AttackFrameData {
  constructor(name, data) {
    this.name = name;
    this.startup = data.startup || 0; // frames before hitbox is active
    this.active = data.active || 3; // frames hitbox is active
    this.recovery = data.recovery || 10; // frames after hitbox before can act
    this.damage = data.damage || 10;
    this.knockback = data.knockback || { x: 4, y: -2 };
    this.hitstun = data.hitstun || 0.3; // seconds opponent is stunned
    this.range = data.range || { width: 50, height: 40, offsetX: 25, offsetY: -40 };
    this.movement = data.movement || { vx: 0, vy: 0 }; // applied on startup
    this.launch = data.launch || false; // launches opponent for air combos
    this.sweetspot = data.sweetspot || null; // { range, damageBonus, knockbackMult }
    this.groundOnly = data.groundOnly !== undefined ? data.groundOnly : true;
    this.trip = data.trip || false; // trips grounded opponents
    this.spike = data.spike || false; // spikes airborne opponents downward
    this.totalFrames = this.startup + this.active + this.recovery;
  }

  getDuration() {
    return this.totalFrames / 60; // convert frames to seconds at 60fps
  }

  isActive(currentFrame) {
    return currentFrame >= this.startup && currentFrame < this.startup + this.active;
  }

  isInRecovery(currentFrame) {
    return currentFrame >= this.startup + this.active && currentFrame < this.totalFrames;
  }

  canCancel(currentFrame) {
    return currentFrame >= this.totalFrames;
  }
}

// Attack database with frame data
export const ATTACK_FRAME_DATA = {
  // Grounded attacks
  neutral: new AttackFrameData('neutral', {
    startup: 2,
    active: 4,
    recovery: 6,
    damage: 8,
    knockback: { x: 3, y: -1 },
    hitstun: 0.2,
    range: { width: 60, height: 35, offsetX: 30, offsetY: -40 }
  }),

  forward: new AttackFrameData('forward', {
    startup: 5,
    active: 5,
    recovery: 10,
    damage: 14,
    knockback: { x: 7, y: -2 },
    hitstun: 0.3,
    movement: { vx: 20, vy: 0 },
    range: { width: 75, height: 40, offsetX: 45, offsetY: -38 }
  }),

  up: new AttackFrameData('up', {
    startup: 6,
    active: 6,
    recovery: 12,
    damage: 16,
    knockback: { x: 2, y: -14 },
    hitstun: 0.45,
    launch: true,
    // Additive movement to boost upward momentum without zeroing existing vy
    movement: { vx: 8, vy: -8 },
    range: { width: 110, height: 80, offsetX: 30, offsetY: -80 },
    sweetspot: { 
      offsetX: 40, offsetY: -95, radius: 20,
      damageBonus: 8, knockbackMult: 1.45 
    }
  }),

  down: new AttackFrameData('down', {
    startup: 4,
    active: 5,
    recovery: 10,
    damage: 12,
    knockback: { x: 5, y: -7 },
    hitstun: 0.35,
    trip: true,
    range: { width: 70, height: 30, offsetX: 35, offsetY: -15 }
  }),

  // Aerial attacks
  air_neutral: new AttackFrameData('air_neutral', {
    startup: 3,
    active: 5,
    recovery: 8,
    damage: 10,
    knockback: { x: 5, y: -3 },
    hitstun: 0.25,
    groundOnly: false,
    range: { width: 60, height: 45, offsetX: 30, offsetY: -40 }
  }),

  air_forward: new AttackFrameData('air_forward', {
    startup: 4,
    active: 6,
    recovery: 12,
    damage: 15,
    knockback: { x: 10, y: -3 },
    hitstun: 0.35,
    groundOnly: false,
    movement: { vx: 28, vy: 0 }, // Significant forward lunge
    range: { width: 70, height: 45, offsetX: 40, offsetY: -35 }
  }),

  air_up: new AttackFrameData('air_up', {
    startup: 6,
    active: 6,
    recovery: 12,
    damage: 14,
    knockback: { x: 1, y: -10 },
    hitstun: 0.45,
    groundOnly: false,
    range: { width: 45, height: 65, offsetX: 15, offsetY: -65 }
  }),

  air_down: new AttackFrameData('air_down', {
    startup: 9,
    active: 4,
    recovery: 18,
    damage: 20,
    knockback: { x: 0, y: 15 },
    hitstun: 0.5,
    spike: true,
    groundOnly: false,
    movement: { vx: 0, vy: 8 },
    range: { width: 40, height: 50, offsetX: 0, offsetY: 10 }
  }),

  // Blade Dance chain attacks - Snappier starts, rhythmic recoveries
  dance_starter: new AttackFrameData('dance_starter', {
    startup: 5,
    active: 6,
    recovery: 20,
    damage: 15,
    knockback: { x: 6, y: -1 },
    hitstun: 0.4,
    movement: { vx: 25, vy: 0 },
    range: { width: 80, height: 40, offsetX: 45, offsetY: -38 }
  }),

  dance_linker_neutral: new AttackFrameData('dance_linker_neutral', {
    startup: 8,
    active: 4,
    recovery: 24,
    damage: 10,
    knockback: { x: 4, y: -1 },
    hitstun: 0.3,
    movement: { vx: 12, vy: 0 },
    range: { width: 65, height: 35, offsetX: 35, offsetY: -38 }
  }),

  dance_linker_up: new AttackFrameData('dance_linker_up', {
    startup: 8,
    active: 4,
    recovery: 24,
    damage: 10,
    knockback: { x: 2, y: -8 },
    hitstun: 0.35,
    movement: { vx: 6, vy: -4 },
    range: { width: 55, height: 60, offsetX: 20, offsetY: -50 }
  }),

  dance_linker_down: new AttackFrameData('dance_linker_down', {
    startup: 8,
    active: 4,
    recovery: 24,
    damage: 10,
    knockback: { x: 6, y: -10 },
    hitstun: 0.4,
    trip: true,
    movement: { vx: 10, vy: 0 },
    range: { width: 70, height: 25, offsetX: 35, offsetY: -15 }
  }),

  dance_finisher_neutral: new AttackFrameData('dance_finisher_neutral', {
    startup: 16,
    active: 6,
    recovery: 40,
    damage: 30,
    knockback: { x: 18, y: -4 },
    hitstun: 0.7,
    movement: { vx: 10, vy: 0 },
    range: { width: 85, height: 50, offsetX: 45, offsetY: -40 }
  }),

  dance_finisher_up: new AttackFrameData('dance_finisher_up', {
    startup: 16,
    active: 6,
    recovery: 40,
    damage: 28,
    knockback: { x: 1, y: -22 },
    hitstun: 0.7,
    launch: true,
    movement: { vx: 4, vy: -10 },
    range: { width: 65, height: 85, offsetX: 20, offsetY: -75 }
  }),

  dance_finisher_down: new AttackFrameData('dance_finisher_down', {
    startup: 16,
    active: 6,
    recovery: 40,
    damage: 28,
    knockback: { x: 0, y: 25 },
    hitstun: 0.75,
    spike: true,
    movement: { vx: 0, vy: 8 },
    range: { width: 55, height: 70, offsetX: 0, offsetY: 10 }
  })
};