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
    const isHeavy = damage > 20;
    
    const osc = this.ctx.createOscillator();
    osc.type = isHeavy ? 'square' : 'sine';
    osc.frequency.setValueAtTime(isHeavy ? 120 : 180, when);
    osc.frequency.exponentialRampToValueAtTime(30, when + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isHeavy ? 0.6 : 0.4, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = isHeavy ? 'bandpass' : 'highpass';
    noiseFilter.frequency.value = isHeavy ? 800 : 2500;
    noiseFilter.Q.value = 1;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.5 : 0.3, when);
    noiseGain.gain.linearRampToValueAtTime(0, when + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    // Melody: cycle through scale and rotate octaves instead of clamping to top note
    const scale = [60, 63, 65, 67, 70, 72, 75, 77, 79, 82, 84];
    const idx = combo % scale.length; // cycle through scale
    const octaveGroup = Math.floor(combo / scale.length); // increases as combo grows
    // rotate octaves in a small repeating pattern to keep melody breathable
    const octaveShift = (octaveGroup % 3) * 12; // 0, +12, +24 semitone rotations
    const note = scale[idx] + octaveShift;
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    
    const ring = this.ctx.createOscillator();
    ring.type = 'triangle';
    // small glide to smooth transitions for rapid combos
    ring.frequency.setValueAtTime(freq * 0.98, when);
    ring.frequency.exponentialRampToValueAtTime(freq, when + 0.03);
    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.15, when);
    ringGain.gain.exponentialRampToValueAtTime(0.01, when + 0.3);
    
    ring.connect(ringGain);
    ringGain.connect(this.masterGain);
    
    osc.start(when);
    osc.stop(when + 0.15);
    noise.start(when);
    ring.start(when);
    ring.stop(when + 0.3);
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

  playAttackSwoosh(attackType) {
    if (!this.loaded) return;
    const isHeavy = ['slam', 'uppercut', 'roundhouse'].includes(attackType);
    
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1);
    }
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 400 : 1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(isHeavy ? 100 : 300, this.ctx.currentTime + 0.2);
    filter.Q.value = 1.5;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(isHeavy ? 0.3 : 0.15, this.ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
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