import { BeatClock } from './BeatClock.js';
import { MusicManager } from './MusicManager.js';
import { SFXManager } from './SFXManager.js';

// Music is DISABLED for now (docs/design.md §8/§9, 2026-11-08): the
// procedural music system was built too early and too integrally, and
// is on the backburner until core movement/combat feel-lock passes.
// SFX (swooshes, jumps, impacts) remain. Flip to true to re-enable
// the MusicManager — it is fully implemented, just disconnected.
export const MUSIC_ENABLED = false;

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
      if (MUSIC_ENABLED) {
        this.music = new MusicManager(this.ctx);
        await this.music.load();
      }
      this.sfx = new SFXManager(this.ctx, this.beatClock);
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

    // Audio initialization can fail (for example, if WebAudio is unavailable).
    if (!this.ctx) return;

    // Resume audio context (required by browsers after user interaction)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (MUSIC_ENABLED && this.music) {
      this.music.start(this.beatClock);
    }
  }

  update(controller) {
    if (!MUSIC_ENABLED) return;
    if (!this.initialized || !this.music || !this.music.playing) return;

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
    if (!this.initialized || !this.sfx || !this.ctx) return;

    // Prevent hit sound spam
    const now = this.ctx.currentTime;
    if (now - this.lastHitTime < 0.05) return;
    this.lastHitTime = now;

    this.sfx.playHit(damage, combo, true);
  }

  onSlam() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playSlam(true);
  }

  onSlide() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playSlide();
  }

  onJump() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playJump();
  }

  onLand() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playLand();
  }

  onShockwave(x, cameraX, screenWidth) {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playWhoosh(x, cameraX, screenWidth);
  }

  onAttackSwoosh(attackType) {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playAttackSwoosh(attackType);
  }

  onFusionHum(intensity) {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playFusionHum(intensity);
  }

  onParry() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playParry();
  }

  onClash() {
    if (!this.initialized || !this.sfx) return;
    this.sfx.playClash();
  }
}
