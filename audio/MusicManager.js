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
    
    // Sequence state
    this.sectionIndex = 0; 
    this.barsInCurrentSection = 0;
    this.songProgression = [0, 0, 1, 1, 2, 2, 1, 0]; // Index of patterns to cycle through
    this.currentProgressionIdx = 0;

    // F-Minor Pentatonic (F1, Ab1, Bb1, C1, Eb2...)
    // MIDI: 29, 32, 34, 36, 39, 41, 44, 46, 48, 51, 53, 56, 58, 60, 63, 65, 68, 70, 72, 75, 77, 80, 82, 84, 87...
    
    // Patterns (16 steps for 1 bar)
    this.patterns = {
      // 0: Ambient/Indie Verse, 1: Melodic Chorus, 2: Climax/Bridge
      kick: [
        [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
        [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1],
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1]
      ],
      snare: [
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        [0,0,1,0, 1,0,0,0, 0,0,1,0, 1,1,1,1]
      ],
      hat: [
        [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        [1,0,1,0, 1,1,1,0, 1,0,1,0, 1,1,1,1],
        [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
      ],
      bass: [
        // Subtle, deep pulsing bass
        [29, 0, 29, 0, 32, 0, 32, 0, 34, 0, 34, 0, 36, 0, 36, 0],
        [29, 0, 0, 32, 0, 34, 0, 36, 29, 0, 0, 32, 0, 34, 36, 0],
        [29, 29, 29, 29, 32, 32, 32, 32, 34, 34, 34, 34, 36, 36, 36, 36]
      ],
      melody: [
        // Peaceful, ambient melody
        [0, 65, 0, 68, 70, 0, 72, 0, 0, 75, 0, 72, 70, 0, 68, 0],
        [77, 0, 75, 0, 72, 0, 70, 0, 75, 0, 77, 0, 80, 0, 82, 0],
        [65, 68, 70, 72, 75, 77, 80, 82, 84, 82, 80, 77, 75, 72, 70, 68]
      ],
      strings: [
        // Gentle accompaniment
        [53, 0, 0, 0, 56, 0, 0, 0, 58, 0, 0, 0, 60, 0, 0, 0],
        [53, 0, 0, 0, 60, 0, 0, 0, 58, 0, 0, 0, 56, 0, 0, 0],
        [53, 53, 53, 53, 56, 56, 56, 56, 58, 58, 58, 58, 60, 60, 60, 60]
      ],
      arp: [
        [77,0,80,0, 82,0,84,0, 77,0,80,0, 82,0,84,0],
        [77,80,82,84, 87,84,82,80, 77,80,82,84, 87,84,82,80],
        [89,92,94,96, 94,92,89,87, 89,92,94,96, 94,92,89,87]
      ]
    };
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
      
      // advance step counter (16 steps per bar)
      this.currentStep = (this.currentStep + 1) % 16;

      // Every full bar (16 steps), increment bars count
      if (this.currentStep === 0) {
        this.barsInCurrentSection++;
        
        // Every 4 bars, switch section
        if (this.barsInCurrentSection >= 4) {
          this.barsInCurrentSection = 0;
          this.currentProgressionIdx = (this.currentProgressionIdx + 1) % this.songProgression.length;
          this.sectionIndex = this.songProgression[this.currentProgressionIdx];
        }
      }
    }
    this.timerID = setTimeout(() => this.schedule(), 25);
  }

  playStep(step, time) {
    const s = this.sectionIndex;
    const isTransitionBar = this.barsInCurrentSection === 3; // The 4th bar

    // Dynamic pattern selection
    const kick = this.patterns.kick[s][step];
    const snare = this.patterns.snare[s][step];
    const hat = this.patterns.hat[s][step];
    const bass = this.patterns.bass[s][step];
    const arp = this.patterns.arp[s][step];
    const melody = this.patterns.melody[s][step];
    const strings = this.patterns.strings[s][step];

    // Transition Bar Logic: 
    // In the 4th bar, we might strip drums or change melody to lead into next part
    const playDrums = !isTransitionBar || (s === 2); // Only keep drums in 4th bar if climax
    const playMelody = !isTransitionBar || Math.random() > 0.3;

    // Drums are in the 'action' layer (combo driven)
    if (kick && playDrums) this.playKick(time, 'action');
    if (snare && playDrums) this.playSnare(time, 'action');
    if (hat && playDrums) this.playHat(time, 'action');

    // Bass: Subtler, filtered sawtooth/sine hybrid
    if (bass) {
      const vol = s === 0 ? 0.08 : 0.12;
      this.playSynth(bass, time, 'base', 'sine', vol, 0.4, false, true);
    }

    // Gentle Indie/Ambient Strings (Base layer)
    if (strings) {
      // Long attack, long release for "bowed" feel
      this.playSynth(strings, time, 'base', 'triangle', 0.1, 0.8, false, false, 0.15);
    }

    // Peacefull Melody (Base layer)
    if (melody && playMelody) {
      const type = s === 0 ? 'sine' : 'triangle';
      this.playSynth(melody, time, 'base', type, 0.15, 0.5, false, true);
    }

    // Arp (Action layer)
    if (arp && !isTransitionBar) {
      this.playSynth(arp, time, 'action', 'square', 0.025, 0.1, true);
    }
    
    // Ballet (High combo) specific layer
    if (this.gainNodes.ballet.gain.value > 0.1 && step % 4 === 0) {
      this.playSynth(84 + (step % 8), time, 'ballet', 'sine', 0.06, 0.15);
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

  playSynth(midiNote, time, layer, type, vol, duration, glitch = false, glide = false, attack = 0.02) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    const osc = this.ctx.createOscillator();
    osc.type = type;
    
    if (glide) {
      osc.frequency.setValueAtTime(freq * 0.95, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.1);
    } else {
      osc.frequency.setValueAtTime(freq, time);
    }

    if (glitch && Math.random() > 0.8) {
      osc.frequency.setValueAtTime(freq * 1.5, time + 0.02);
    }
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(glitch ? 6000 : 3000, time);
    filter.frequency.exponentialRampToValueAtTime(glitch ? 1500 : 400, time + duration);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
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