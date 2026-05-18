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