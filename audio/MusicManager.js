import { MUSIC_STEMS } from './audio-assets.js';

export class MusicManager {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.stems = {
      ambient: null,
      action: null,
      ballet: null
    };
    this.gainNodes = {
      ambient: null,
      action: null,
      ballet: null
    };
    this.filterNode = null;
    this.masterGain = null;
    this.loaded = false;
    this.playing = false;
  }

  async load() {
    try {
      // Create master output chain
      this.masterGain = this.ctx.createGain();
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 20000;
      this.filterNode.Q.value = 1;
      
      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4;

      // Load stems (placeholder - in production these would be actual audio files)
      for (const stem in this.stems) {
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(this.filterNode);
        this.gainNodes[stem] = gainNode;
      }

      this.loaded = true;
    } catch (err) {
      console.warn('Music loading failed:', err);
    }
  }

  start() {
    if (!this.loaded || this.playing) return;
    
    // Create oscillator-based placeholder music
    // Ambient layer - low pad
    const ambientOsc = this.ctx.createOscillator();
    ambientOsc.type = 'sawtooth';
    ambientOsc.frequency.value = 55; // Low A
    ambientOsc.connect(this.gainNodes.ambient);
    ambientOsc.start();
    this.stems.ambient = ambientOsc;

    // Action layer - rhythmic pulse
    const actionOsc = this.ctx.createOscillator();
    actionOsc.type = 'square';
    actionOsc.frequency.value = 110;
    const actionLFO = this.ctx.createOscillator();
    actionLFO.frequency.value = 2; // 120 BPM = 2 Hz
    const actionLFOGain = this.ctx.createGain();
    actionLFOGain.gain.value = 0.3;
    actionLFO.connect(actionLFOGain);
    actionLFOGain.connect(this.gainNodes.action.gain);
    actionOsc.connect(this.gainNodes.action);
    actionOsc.start();
    actionLFO.start();
    this.stems.action = actionOsc;

    // Ballet layer - high melodic
    const balletOsc = this.ctx.createOscillator();
    balletOsc.type = 'sine';
    balletOsc.frequency.value = 880; // High A
    balletOsc.connect(this.gainNodes.ballet);
    balletOsc.start();
    this.stems.ballet = balletOsc;

    // Fade in ambient layer
    this.gainNodes.ambient.gain.setTargetAtTime(0.15, this.ctx.currentTime, 0.5);
    
    this.playing = true;
  }

  update(combo, enemyCount, enemyProximity) {
    if (!this.loaded || !this.playing) return;

    // Action layer intensity based on combo
    const actionTarget = Math.min(combo / 15, 1) * 0.2;
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.3);

    // Ballet layer for high combos
    const balletTarget = combo > 10 ? Math.min((combo - 10) / 20, 1) * 0.15 : 0;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.5);

    // Filter based on enemy proximity
    let targetFreq = 20000;
    if (enemyCount === 0) {
      targetFreq = 500; // Muffled when no enemies
    } else if (enemyProximity > 300) {
      targetFreq = 2000; // Slightly muffled when distant
    }
    
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }

  stop() {
    if (!this.playing) return;
    
    for (const stem in this.stems) {
      if (this.stems[stem]) {
        this.stems[stem].stop();
        this.stems[stem] = null;
      }
    }
    
    this.playing = false;
  }
}