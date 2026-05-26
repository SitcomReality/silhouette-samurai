import { DRUM_PATTERNS, SONG_PROGRESSION, MAJOR_PENTATONIC, MINOR_PENTATONIC } from './music/Config.js';
import { MusicSequencer } from './music/Sequencer.js';
import { MusicSynthesizer } from './music/Synthesizer.js';

export class MusicManager {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.gainNodes = { base: null, action: null, ballet: null };
    this.filterNode = null;
    this.masterGain = null;
    this.loaded = false;
    this.playing = false;
    this.bpm = 120;
    this.currentStep = 0;
    this.nextNoteTime = 0;
    this.sectionIndex = 0;
    this.barsInCurrentSection = 0;
    this.currentProgressionIdx = 0;
    this.currentCombo = 0;
    this.enemyProximity = 1000;
    this.sequencer = new MusicSequencer();
    this.synth = null;
    this.forceMaxCombo = false;
    this.instruments = {
      melody: 'synthLead',
      bass: 'acidBass',
      counter: 'pluck'
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

    this.synth = new MusicSynthesizer(this.ctx, this.gainNodes);
    this.sequencer.generatePhrase(this.sectionIndex, this.currentCombo);
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
      this.currentStep = (this.currentStep + 1) % 16;
      if (this.currentStep === 0) {
        this.barsInCurrentSection++;
        if (this.barsInCurrentSection >= 4) {
          this.barsInCurrentSection = 0;
          this.currentProgressionIdx = (this.currentProgressionIdx + 1) % SONG_PROGRESSION.length;
          this.sectionIndex = SONG_PROGRESSION[this.currentProgressionIdx];
          this.sequencer.generatePhrase(this.sectionIndex, this.currentCombo);
        }
      }
    }
    this.timerID = setTimeout(() => this.schedule(), 25);
  }

  playStep(step, time) {
    const phraseStep = (this.barsInCurrentSection * 16) + step;
    const combo = this.forceMaxCombo ? 50 : this.currentCombo;
    
    // Consistent kick pattern for steady pulse
    const kick = DRUM_PATTERNS.kick[step];
    const snare = DRUM_PATTERNS.snare[step];
    
    // Progressive hi-hat complexity
    let hatLevel = 0;
    if (combo > 20) hatLevel = 2;
    else if (combo > 8) hatLevel = 1;
    const hat = DRUM_PATTERNS.hat[hatLevel][step];

    const scale = combo > 15 ? MINOR_PENTATONIC : MAJOR_PENTATONIC;
    const mapNote = (degree, baseOffset = 0) => {
      if (degree === -1) return null;
      return scale[degree % scale.length] + Math.floor(degree / scale.length) * 12 + baseOffset;
    };
    
    const melody = mapNote(this.sequencer.melodyPhrase[phraseStep]);
    const bass = mapNote(this.sequencer.bassPhrase[phraseStep], -24);
    const counter = mapNote(this.sequencer.counterPhrase[phraseStep]);
    
    const comboFactor = Math.min(combo / 50, 1.0);
    const drumIntensity = 0.5 + comboFactor * 0.5;

    // Powerful consistent drums
    if (kick) this.synth.playKick(time, 'action', drumIntensity);
    if (snare) this.synth.playSnare(time, 'action', drumIntensity);
    if (hat) this.synth.playHat(time, 'action', drumIntensity * 0.7);
    
    // Driving bass line (always present when combo > 4)
    if (bass !== null && combo > 4) {
      const isAccent = step % 4 === 0;
      const bassVol = 0.15 + comboFactor * 0.15;
      this.playInstrument(this.instruments.bass, bass, time, 'action', bassVol, 0.3, isAccent);
    }
    
    // Single clean melody
    if (melody !== null) {
      const melodyVol = 0.1 + comboFactor * 0.05;
      this.playInstrument(this.instruments.melody, melody, time, 'ballet', melodyVol, 0.4);
    }
    
    // Counter-melody layer
    if (counter !== null && combo > 10) {
      const counterVol = 0.08 + comboFactor * 0.04;
      this.playInstrument(this.instruments.counter, counter, time, 'ballet', counterVol, 0.35);
    }
  }
  
  playInstrument(instrumentType, note, time, layer, vol, duration, accent = false) {
    switch(instrumentType) {
      case 'acidBass':
        this.synth.playAcidBass(note, time, layer, vol, duration, accent);
        break;
      case 'piano':
        this.synth.playPiano(note, time, layer, vol, duration);
        break;
      case 'pluck':
        this.synth.playPluck(note, time, layer, vol, duration);
        break;
      case 'bell':
        this.synth.playBell(note, time, layer, vol, duration);
        break;
      case 'string':
        this.synth.playString(note, time, layer, vol, duration, false);
        break;
      case 'synthLead':
        this.synth.playSynthLead(note, time, layer, vol, duration);
        break;
      case 'sawLead':
        this.synth.playSawLead(note, time, layer, vol, duration);
        break;
      default:
        this.synth.playSynthLead(note, time, layer, vol, duration);
    }
  }

  update(combo, enemyCount, enemyProximity) {
    this.currentCombo = combo;
    this.enemyProximity = enemyProximity;
    if (!this.loaded || !this.playing) return;
    
    const effectiveCombo = this.forceMaxCombo ? 50 : combo;
    const comboFactor = Math.min(effectiveCombo / 50, 1.0);
    
    // Dynamic intensity scaling across layers
    const actionTarget = 0.4 + comboFactor * 0.6;
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.5);
    
    const balletTarget = effectiveCombo > 8 ? 0.3 + Math.min((effectiveCombo - 8) / 42, 1.0) * 0.7 : 0.1;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.7);
    
    const baseTarget = 0.7 + comboFactor * 0.3;
    this.gainNodes.base.gain.setTargetAtTime(baseTarget, this.ctx.currentTime, 0.6);
    
    // More intense filter changes for industrial shift
    let targetFreq = effectiveCombo > 15 ? 12000 + comboFactor * 8000 : 8000 + comboFactor * 12000;
    if (enemyCount === 0) targetFreq = Math.max(3000, targetFreq * 0.5);
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
  }
}