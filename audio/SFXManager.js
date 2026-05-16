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

    // Short impact transient (keeps previous attack feel)
    const transientOsc = this.ctx.createOscillator();
    transientOsc.type = isHeavy ? 'square' : 'sine';
    transientOsc.frequency.setValueAtTime(isHeavy ? 120 : 180, when);
    transientOsc.frequency.exponentialRampToValueAtTime(30, when + 0.09);

    const transientGain = this.ctx.createGain();
    transientGain.gain.setValueAtTime(isHeavy ? 0.55 : 0.35, when);
    transientGain.gain.exponentialRampToValueAtTime(0.01, when + 0.14);

    transientOsc.connect(transientGain);
    transientGain.connect(this.masterGain);

    // Noise body for impact
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = isHeavy ? 'bandpass' : 'highpass';
    noiseFilter.frequency.value = isHeavy ? 900 : 2600;
    noiseFilter.Q.value = 1;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.45 : 0.28, when);
    noiseGain.gain.linearRampToValueAtTime(0, when + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Refined music-aware response:
    // Instead of a chord, we play a beat-synced high-pitched 'sparkle' 
    // using an F-minor pentatonic scale to ensure it harmonizes perfectly.
    const pentatonic = [65, 68, 70, 72, 75, 77, 80, 82, 84, 87]; 
    const noteMidi = pentatonic[combo % pentatonic.length];
    const freq = 440 * Math.pow(2, (noteMidi - 69) / 12);

    const sparkleOsc = this.ctx.createOscillator();
    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(freq, when);
    // Add a tiny pitch sweep for 'juice'
    sparkleOsc.frequency.exponentialRampToValueAtTime(freq * 1.05, when + 0.1);

    const sparkleGain = this.ctx.createGain();
    sparkleGain.gain.setValueAtTime(0.15, when);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, when + 0.4);

    const sparkleFilter = this.ctx.createBiquadFilter();
    sparkleFilter.type = 'highpass';
    sparkleFilter.frequency.value = 1000;

    sparkleOsc.connect(sparkleFilter);
    sparkleFilter.connect(sparkleGain);
    sparkleGain.connect(this.masterGain);

    sparkleOsc.start(when);
    sparkleOsc.stop(when + 0.45);

    // Start all sources
    transientOsc.start(when);
    transientOsc.stop(when + 0.15);
    noise.start(when);
    // stop noise shortly after
    noise.stop(when + 0.12);


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