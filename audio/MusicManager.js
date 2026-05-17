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
    
    // --- Procedural Generation Data ---
    // F-Minor Pentatonic scale degrees: 0=F, 1=Ab, 2=Bb, 3=C, 4=Eb
    this.pentatonicMap = [53, 56, 58, 60, 63, 65, 68, 70, 72, 75, 77, 80, 82, 84, 87, 89, 92, 94, 96, 99];
    
    this.motifs = {
      'hop': [0, 3, 4, 3],
      'skip': [0, 4, 0, 1],
      'arc': [0, 1, 0, 4],
      'walk': [0, 1, 2, 3, 4, 3, 2, 1],
      'drop': [3, 2, 1, 0]
    };

    // Current phrase patterns (64 steps = 4 bars)
    this.melodyPhrase = new Array(64).fill(0);
    this.arpPhrase = new Array(64).fill(0);
    this.counterPhrase = new Array(64).fill(0);
    
    // Rhythm/Drums (Static banks)
    this.patterns = {
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
        [29, 0, 29, 0, 32, 0, 32, 0, 34, 0, 34, 0, 36, 0, 36, 0],
        [29, 0, 0, 32, 0, 34, 0, 36, 29, 0, 0, 32, 0, 34, 36, 0],
        [29, 29, 29, 29, 32, 32, 32, 32, 34, 34, 34, 34, 36, 36, 36, 36]
      ]
    };

    // State for update
    this.currentCombo = 0;
    this.enemyProximity = 1000;
  }

  generatePhrase() {
    const s = this.sectionIndex;
    const motifKeys = Object.keys(this.motifs);
    
    // Clear phrases
    this.melodyPhrase.fill(0);
    this.arpPhrase.fill(0);
    this.counterPhrase.fill(0);

    // Call (Bars 1-2) & Response (Bars 3-4)
    const callMotif = this.motifs[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const transpose = Math.floor(Math.random() * 3) - 1; // Transpose phrase -1, 0, or +1 scale deg

    // Populate Melody (Call)
    this.fillPhraseWithMotif(this.melodyPhrase, 0, 32, callMotif, transpose, s);

    // Populate Arp (Response) - transposed up +1 deg
    this.fillPhraseWithMotif(this.arpPhrase, 32, 32, callMotif, transpose + 1, s, true);

    // Silhouette Leap: drop -3 deg at the end of every 2nd and 4th bar
    [31, 63].forEach(step => {
      if (this.melodyPhrase[step]) this.melodyPhrase[step] = this.pentatonicMap[Math.max(0, this.getDegreeFromMidi(this.melodyPhrase[step]) - 3)];
      if (this.arpPhrase[step]) this.arpPhrase[step] = this.pentatonicMap[Math.max(0, this.getDegreeFromMidi(this.arpPhrase[step]) - 3)];
    });

    // Generate Counter-melody phrase (offset by a third: +/- 2 scale deg)
    for (let i = 0; i < 64; i++) {
      const source = this.melodyPhrase[i] || this.arpPhrase[i];
      if (source && Math.random() > 0.4) {
        const deg = this.getDegreeFromMidi(source);
        this.counterPhrase[i] = this.pentatonicMap[Math.min(this.pentatonicMap.length - 1, deg + 2)];
      }
    }
  }

  fillPhraseWithMotif(target, startStep, length, motif, transpose, section, isArp = false) {
    const density = section === 0 ? 0.3 : (section === 1 ? 0.6 : 0.9);
    const stepsPerMotif = motif.length * 2; // Spread motifs out
    
    for (let i = 0; i < length; i += stepsPerMotif) {
      if (Math.random() > density) continue;
      
      for (let j = 0; j < motif.length; j++) {
        const step = startStep + i + j * (isArp ? 1 : 2);
        if (step >= startStep + length) break;
        
        // Stepwise logic: ensure degrees stay in range
        let degree = motif[j] + transpose + (section * 3);
        degree = Math.max(0, Math.min(this.pentatonicMap.length - 1, degree));
        
        target[step] = this.pentatonicMap[degree];
      }
    }
  }

  getDegreeFromMidi(midi) {
    const idx = this.pentatonicMap.indexOf(midi);
    return idx === -1 ? 0 : idx;
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

    this.generatePhrase();
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
        
        // Every 4 bars (one full progression block), switch section and regenerate melody
        if (this.barsInCurrentSection >= 4) {
          this.barsInCurrentSection = 0;
          this.currentProgressionIdx = (this.currentProgressionIdx + 1) % this.songProgression.length;
          this.sectionIndex = this.songProgression[this.currentProgressionIdx];
          this.generatePhrase();
        }
      }
    }
    this.timerID = setTimeout(() => this.schedule(), 25);
  }

  playStep(step, time) {
    const s = this.sectionIndex;
    const phraseStep = (this.barsInCurrentSection * 16) + step;
    const isTransitionBar = this.barsInCurrentSection === 3; 

    const combo = this.currentCombo;
    const kick = this.patterns.kick[s][step];
    const snare = this.patterns.snare[s][step];
    const hat = this.patterns.hat[s][step];
    const bass = this.patterns.bass[s][step];
    
    // Procedural Melody & Arp from Phrase
    const melody = this.melodyPhrase[phraseStep];
    const arp = this.arpPhrase[phraseStep];
    const counter = this.counterPhrase[phraseStep];

    const playDrums = !isTransitionBar || (s === 2);

    // Drums are in the 'action' layer (combo driven)
    if (kick && playDrums) this.playKick(time, 'action');
    if (snare && playDrums) this.playSnare(time, 'action');
    if (hat && playDrums) this.playHat(time, 'action');

    // Bass: Subtler, filtered sawtooth/sine hybrid
    if (bass) {
      const vol = s === 0 ? 0.08 : 0.12;
      this.playSynth(bass, time, 'base', 'sine', vol, 0.4, false, true);
    }

    // Main Melody (Combo 1-3 uses verse sparsity, logic handled by phrase generation density)
    if (melody) {
      const type = s === 0 ? 'sine' : 'triangle';
      const vol = s === 0 ? 0.12 : 0.18;
      this.playSynth(melody, time, 'base', type, vol, 0.5, false, true);
    }

    // Arp / Response Voice (Action layer)
    if (arp && combo >= 4) {
      this.playSynth(arp, time, 'action', 'square', 0.03, 0.15, true);
    }
    
    // Counter-melody (Combo 8+)
    if (counter && combo >= 8) {
      this.playSynth(counter, time, 'ballet', 'sine', 0.08, 0.3, false, false, 0.05);
    }

    // Ballet Sparkle (Doubled +12 semitones)
    if (combo >= 10 && melody && step % 2 === 0) {
      this.playSynth(melody + 12, time, 'ballet', 'sine', 0.05, 0.2, true);
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
    // Proximity Filter: Limit range of notes when muffled
    // Muffled frequency at ~600Hz (no enemies) should ideally filter high MIDI notes
    const filterFreq = this.filterNode.frequency.value;
    if (filterFreq < 1000 && midiNote > 65) return; // Cut notes higher than F4

    // Humanization: random jitter and velocity variation at low combos
    const combo = this.currentCombo;
    let jitter = 0;
    let velocityMult = 1.0;
    if (combo <= 3) {
      jitter = (Math.random() - 0.5) * 0.003; // +/- 3ms jitter
      velocityMult = 0.95 + Math.random() * 0.1; // +/- 5% velocity
    }

    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = this.ctx.createOscillator();
    osc.type = type;
    
    const startTime = time + jitter;

    if (glide) {
      osc.frequency.setValueAtTime(freq * 0.95, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(freq, startTime);
    }

    if (glitch && Math.random() > 0.8) {
      osc.frequency.setValueAtTime(freq * 1.5, startTime + 0.02);
    }
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(glitch ? 6000 : 3000, startTime);
    filter.frequency.exponentialRampToValueAtTime(glitch ? 1500 : 400, startTime + duration);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * velocityMult, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  update(combo, enemyCount, enemyProximity) {
    this.currentCombo = combo;
    this.enemyProximity = enemyProximity;
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