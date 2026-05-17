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
    
    // Check if hit is near a beat for bass boost
    const timeToBeat = when - this.ctx.currentTime;
    const onBeat = Math.abs(timeToBeat) < 0.05;
    const beatBoost = onBeat ? 1.4 : 1.0;

    // Enhanced bass/kick component when on-beat
    const bassOsc = this.ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(isHeavy ? 80 : 100, when);
    bassOsc.frequency.exponentialRampToValueAtTime(30, when + 0.15);

    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime((isHeavy ? 0.5 : 0.35) * beatBoost, when);
    bassGain.gain.exponentialRampToValueAtTime(0.01, when + 0.18);

    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);

    // Percussive noise body
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = isHeavy ? 'bandpass' : 'highpass';
    noiseFilter.frequency.value = isHeavy ? 800 : 2200;
    noiseFilter.Q.value = 1.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime((isHeavy ? 0.4 : 0.25) * beatBoost, when);
    noiseGain.gain.linearRampToValueAtTime(0, when + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Subtle tonal component - much quieter and more integrated
    const pentatonic = [65, 68, 70, 72, 75, 77, 80, 82, 84, 87]; 
    const noteMidi = pentatonic[combo % pentatonic.length];
    const freq = 440 * Math.pow(2, (noteMidi - 69) / 12);

    const toneOsc = this.ctx.createOscillator();
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(freq, when);
    toneOsc.frequency.exponentialRampToValueAtTime(freq * 1.02, when + 0.08);

    const toneGain = this.ctx.createGain();
    toneGain.gain.setValueAtTime(0.06, when); // Much more subtle
    toneGain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);

    const toneFilter = this.ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = freq * 3;
    toneFilter.Q.value = 2;

    toneOsc.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(this.masterGain);

    // Start all sources
    bassOsc.start(when);
    bassOsc.stop(when + 0.2);
    noise.start(when);
    noise.stop(when + 0.12);
    toneOsc.start(when);
    toneOsc.stop(when + 0.3);
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
    const isHeavy = ['down_thrust', 'rising_slash', 'heavy_slash'].includes(attackType);
    
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

  playParry() {
    if (!this.loaded) return;
    
    // Sharp metallic clang
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.15);
    osc2.stop(this.ctx.currentTime + 0.15);
  }

  playClash() {
    if (!this.loaded) return;
    
    // Sharp impact with reverb
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 3;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0.35;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
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