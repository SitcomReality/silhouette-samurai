import { MUSIC_STEMS } from './audio-assets.js';

export class MusicManager {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.gainNodes = {
      base: null,
      action: null,
      ballet: null
    };
    this.filterNode = null;
    this.masterGain = null;
    this.loaded = false;
    this.playing = false;
    
    this.bpm = 128;
    this.currentStep = 0;
    this.nextNoteTime = 0;
    
    // Patterns (32 steps for 2 bars)
    this.kickPattern = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
    this.snarePattern = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
    this.hatPattern =   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
    
    // Electrodeo nectar bassline (bouncy minor pentatonic, F minor)
    this.bassPattern = [
      41, 0, 0, 41,  0, 44, 41, 0,
      48, 0, 46, 0,  44, 0, 46, 44,
      41, 0, 0, 41,  0, 44, 41, 0,
      51, 0, 48, 0,  46, 0, 48, 0
    ];
    
    // Marshmallow melody
    this.melodyPattern = [
      0, 77, 0, 75,  72, 0, 0, 68,
      70, 0, 72, 0,  75, 0, 0, 0,
      0, 77, 0, 75,  72, 0, 75, 77,
      80, 0, 77, 0,  75, 0, 72, 0
    ];

    // Glitch factory arp
    this.arpPattern = [
      65,68,70,72, 75,72,70,68,
      77,75,72,70, 75,72,70,68,
      65,68,70,72, 75,72,70,68,
      80,77,75,72, 75,72,70,68
    ];
  }

  async load() {
    this.masterGain = this.ctx.createGain();
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 20000;
    this.filterNode.Q.value = 1;
    
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;

    for (const layer in this.gainNodes) {
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = layer === 'base' ? 1 : 0;
      gainNode.connect(this.filterNode);
      this.gainNodes[layer] = gainNode;
    }

    this.loaded = true;
  }

  start(beatClock) {
    if (!this.loaded || this.playing) return;
    this.playing = true;
    this.nextNoteTime = beatClock ? beatClock.startTime : this.ctx.currentTime;
    this.schedule();
  }

  stop() {
    this.playing = false;
    clearTimeout(this.timerID);
  }

  schedule() {
    if (!this.playing) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += 15 / this.bpm;
      this.currentStep = (this.currentStep + 1) % 32;
    }
    this.timerID = setTimeout(() => this.schedule(), 25);
  }

  playStep(step, time) {
    // Percussion and grinding rhythm are routed to the 'action' layer,
    // which is controlled by combo intensity (starts muted).
    if (this.kickPattern[step]) this.playKick(time, 'action');
    if (this.snarePattern[step]) this.playSnare(time, 'action');
    if (this.hatPattern[step]) this.playHat(time, 'action');

    // Bass stays on base to support the melody.
    if (this.bassPattern[step]) {
      this.playSynth(this.bassPattern[step], time, 'base', 'sawtooth', 0.12, 0.2);
    }
    // Arpeggio / glitch textures follow the action layer (enter with combo).
    if (this.arpPattern[step]) {
      this.playSynth(this.arpPattern[step], time, 'action', 'square', 0.04, 0.1, true);
    }
    // Move the melodic line to the base layer so it's the default background music.
    if (this.melodyPattern[step]) {
      this.playSynth(this.melodyPattern[step], time, 'base', 'sine', 0.2, 0.4, false, true);
    }
  }

  playKick(time, layer = 'base') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  playSnare(time, layer = 'base') {
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.connect(oscGain);
    oscGain.connect(this.gainNodes[layer]);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  playHat(time, layer = 'base') {
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    noise.start(time);
  }

  playSynth(midiNote, time, layer, type, vol, duration, glitch = false, glide = false) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    const osc = this.ctx.createOscillator();
    osc.type = type;
    
    if (glide) {
      osc.frequency.setValueAtTime(freq * 0.9, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);
    } else {
      osc.frequency.setValueAtTime(freq, time);
    }

    if (glitch && Math.random() > 0.7) {
      osc.frequency.setValueAtTime(freq * 1.5, time + 0.05);
    }
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(glitch ? 5000 : 2000, time);
    filter.frequency.exponentialRampToValueAtTime(glitch ? 1000 : 200, time + duration);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  update(combo, enemyCount, enemyProximity) {
    if (!this.loaded || !this.playing) return;

    // Action layer intensity based on combo
    const actionTarget = Math.min(combo / 15, 1) * 0.8;
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.3);

    // Ballet layer for high combos
    const balletTarget = combo > 8 ? Math.min((combo - 8) / 12, 1) * 0.8 : 0;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.5);

    // Filter based on enemy proximity
    let targetFreq = 20000;
    if (enemyCount === 0) {
      targetFreq = 600; // Muffled when no enemies
    } else if (enemyProximity > 400) {
      targetFreq = 3000; // Slightly muffled when distant
    }
    
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }
}