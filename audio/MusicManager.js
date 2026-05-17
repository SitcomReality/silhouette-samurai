import { DRUM_PATTERNS, SONG_PROGRESSION } from './music/Config.js';
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
    this.sequencer.generatePhrase(this.sectionIndex);
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
          this.sequencer.generatePhrase(this.sectionIndex);
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
    
    // Progressive intensity based on combo (0-50 scale)
    const comboIntensity = Math.min(combo / 50, 1.0);
    const rhythmIntensity = 0.3 + comboIntensity * 0.7; // 0.3 to 1.0
    
    const kick = DRUM_PATTERNS.kick[s][step];
    const snare = DRUM_PATTERNS.snare[s][step];
    const hat = DRUM_PATTERNS.hat[s][step];
    const bass = DRUM_PATTERNS.bass[s][step];
    const melody = this.sequencer.melodyPhrase[phraseStep];
    const arp = this.sequencer.arpPhrase[phraseStep];
    const counter = this.sequencer.counterPhrase[phraseStep];
    const playDrums = !isTransitionBar || (s === 2);
    const filterCutoff = this.filterNode.frequency.value;

    // Drums with progressive intensity
    if (kick && playDrums) this.synth.playKick(time, 'action', rhythmIntensity);
    if (snare && playDrums) this.synth.playSnare(time, 'action', rhythmIntensity);
    if (hat && playDrums) this.synth.playHat(time, 'action', rhythmIntensity * 0.8);
    
    // Bass foundation - always present but gets fuller
    if (bass) {
      const bassVol = 0.1 + comboIntensity * 0.08;
      this.synth.playString(bass, time, 'base', bassVol, 0.4, false);
    }
    
    // Primary melody - piano at low combo, shifts to pluck/string at higher combos
    if (melody) {
      const melodyVol = 0.12 + comboIntensity * 0.08;
      if (combo < 10) {
        this.synth.playPiano(melody, time, 'base', melodyVol, 0.5);
      } else if (combo < 25) {
        this.synth.playPluck(melody, time, 'base', melodyVol, 0.5);
      } else {
        this.synth.playString(melody, time, 'base', melodyVol, 0.6, true);
      }
    }
    
    // Glockenspiel counter-melody appears at mid combo
    if (counter && combo >= 8) {
      const bellVol = 0.06 + (comboIntensity - 0.16) * 0.1;
      this.synth.playBell(counter, time, 'ballet', bellVol, 0.35);
    }
    
    // Arpeggio layer with plucks
    if (arp && combo >= 4) {
      const arpVol = 0.04 + comboIntensity * 0.05;
      this.synth.playPluck(arp, time, 'action', arpVol, 0.2);
    }
    
    // High octave melody doubling at high combo
    if (combo >= 20 && melody && step % 2 === 0) {
      const highVol = 0.05 + (comboIntensity - 0.4) * 0.08;
      this.synth.playBell(melody + 12, time, 'ballet', highVol, 0.3);
    }
    
    // Rich string pad at very high combo
    if (combo >= 30 && melody && step % 4 === 0) {
      const padVol = 0.08 + (comboIntensity - 0.6) * 0.1;
      this.synth.playString(melody - 12, time, 'ballet', padVol, 1.2, true);
    }
  }

  update(combo, enemyCount, enemyProximity) {
    this.currentCombo = combo;
    this.enemyProximity = enemyProximity;
    if (!this.loaded || !this.playing) return;
    
    // Smoother, more gradual transitions based on combo
    const comboFactor = Math.min(combo / 50, 1.0);
    const actionTarget = 0.4 + comboFactor * 0.5; // Always audible, scales to full
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.5);
    
    const balletTarget = combo > 8 ? 0.3 + Math.min((combo - 8) / 42, 1.0) * 0.6 : 0.15;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.7);
    
    // Base layer always present for serene ambience
    const baseTarget = 0.7 + comboFactor * 0.3;
    this.gainNodes.base.gain.setTargetAtTime(baseTarget, this.ctx.currentTime, 0.6);
    
    // Gentler filter changes
    let targetFreq = 8000 + comboFactor * 12000;
    if (enemyCount === 0) targetFreq = Math.max(3000, targetFreq * 0.5);
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
  }
}