import { playHit, playSlam, playLand, playImpact } from './sfx/ImpactSFX.js';
import { playAttackSwoosh, playWhoosh, playSlide, playJump } from './sfx/MovementSFX.js';
import { playParry, playClash } from './sfx/CombatSFX.js';
import { playFusionHum } from './sfx/AmbientSFX.js';

export class SFXManager {
  constructor(audioContext, beatClock) {
    this.ctx = audioContext;
    this.beatClock = beatClock;
    this.compressor = null;
    this.masterGain = null;
    this.loaded = false;
  }

  async load() {
    // Create audio processing chain
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6;
    
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
    
    this.loaded = true;
  }

  playHit(damage, combo, rhythmSync = true) {
    if (!this.loaded) return;
    playHit(this.ctx, this.masterGain, this.beatClock, damage, combo, rhythmSync);
  }

  playSlam(rhythmSync = true) {
    if (!this.loaded) return;
    playSlam(this.ctx, this.masterGain, this.beatClock, rhythmSync);
  }

  playAttackSwoosh(attackType) {
    if (!this.loaded) return;
    playAttackSwoosh(this.ctx, this.masterGain, attackType);
  }

  playWhoosh(x, cameraX, screenWidth) {
    if (!this.loaded) return;
    playWhoosh(this.ctx, this.masterGain, x, cameraX, screenWidth);
  }

  playSlide() {
    if (!this.loaded) return;
    playSlide(this.ctx, this.masterGain);
  }

  playJump() {
    if (!this.loaded) return;
    playJump(this.ctx, this.masterGain);
  }

  playLand() {
    if (!this.loaded) return;
    playLand(this.ctx, this.masterGain);
  }

  playFusionHum(intensity) {
    if (!this.loaded) return;
    playFusionHum(this.ctx, this.masterGain, intensity);
  }

  playParry() {
    if (!this.loaded) return;
    playParry(this.ctx, this.masterGain);
  }

  playClash() {
    if (!this.loaded) return;
    playClash(this.ctx, this.masterGain);
  }

  // Helper to create impact sounds
  playImpact(frequency, duration, when, volume = 0.5) {
    if (!this.loaded) return;
    playImpact(this.ctx, this.masterGain, frequency, duration, when, volume);
  }
}