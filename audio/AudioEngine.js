import { BeatClock } from './BeatClock.js';
import { MusicManager } from './MusicManager.js';
import { SFXManager } from './SFXManager.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.beatClock = null;
    this.music = null;
    this.sfx = null;
    this.initialized = false;
    this.lastHitTime = 0;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      this.beatClock = new BeatClock(120);
      this.music = new MusicManager(this.ctx);
      this.sfx = new SFXManager(this.ctx, this.beatClock);
      
      await this.music.load();
      await this.sfx.load();
      
      this.beatClock.start(this.ctx);
      
      this.initialized = true;
    } catch (err) {
      console.warn('AudioEngine initialization failed:', err);
    }
  }

  async start() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Resume audio context (required by browsers after user interaction)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    this.music.start(this.beatClock);
  }

  update(controller) {
    if (!this.initialized || !this.music.playing) return;

    // Calculate enemy proximity
    let closestEnemy = Infinity;
    let enemyCount = 0;
    for (const ent of controller.entities) {
      if (ent.state !== 'dead' && ent.type === 'enemy') {
        enemyCount++;
        const dist = Math.abs(ent.x - controller.player.x);
        if (dist < closestEnemy) closestEnemy = dist;
      }
    }

    this.music.update(controller.player.combo, enemyCount, closestEnemy);
  }

  onHit(damage, combo) {
    if (!this.initialized) return;
    
    // Prevent hit sound spam
    const now = this.ctx.currentTime;
    if (now - this.lastHitTime < 0.05) return;
    this.lastHitTime = now;
    
    this.sfx.playHit(damage, combo, true);
  }

  onSlam() {
    if (!this.initialized) return;
    this.sfx.playSlam(true);
  }

  onSlide() {
    if (!this.initialized) return;
    this.sfx.playSlide();
  }

  onJump() {
    if (!this.initialized) return;
    this.sfx.playJump();
  }

  onLand() {
    if (!this.initialized) return;
    this.sfx.playLand();
  }

  onShockwave(x, cameraX, screenWidth) {
    if (!this.initialized) return;
    this.sfx.playWhoosh(x, cameraX, screenWidth);
  }

  onAttackSwoosh(attackType) {
    if (!this.initialized) return;
    this.sfx.playAttackSwoosh(attackType);
  }
}