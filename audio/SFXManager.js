import { SFX } from './audio-assets.js';

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
    
    const when = rhythmSync ? this.beatClock.snapToNext16th(this.ctx, 50) : this.ctx.currentTime;
    
    // Pitch shift based on combo
    const basePitch = damage > 30 ? 150 : 300;
    const pitchShift = Math.pow(2, combo / 12); // Semitone per combo
    const frequency = basePitch * pitchShift;
    
    this.playImpact(frequency, 0.15, when, damage / 50);
  }

  playSlam(rhythmSync = true) {
    if (!this.loaded) return;
    
    const when = rhythmSync ? this.beatClock.snapToNext16th(this.ctx, 50) : this.ctx.currentTime;
    
    // Deep bass impact
    this.playImpact(60, 0.4, when, 1.2);
    
    // High transient
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.3;
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(when);
  }

  playWhoosh(x, cameraX, screenWidth) {
    if (!this.loaded) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    // Panning based on position
    const panner = this.ctx.createStereoPanner();
    const relativeX = (x - cameraX) / (screenWidth / 2);
    panner.pan.value = Math.max(-1, Math.min(1, relativeX));
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playSlide() {
    if (!this.loaded) return;
    
    // Sliding friction sound
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0.12;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playJump() {
    if (!this.loaded) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playLand() {
    if (!this.loaded) return;
    
    this.playImpact(80, 0.1, this.ctx.currentTime, 0.2);
  }

  playFusionHum(intensity) {
    if (!this.loaded) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 40;
    
    const gain = this.ctx.createGain();
    gain.gain.value = Math.min(intensity * 0.05, 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // Helper to create impact sounds
  playImpact(frequency, duration, when, volume = 0.5) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, when);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, when + duration);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(when);
    osc.stop(when + duration);
  }
}