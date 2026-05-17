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
    const kick = DRUM_PATTERNS.kick[s][step];
    const snare = DRUM_PATTERNS.snare[s][step];
    const hat = DRUM_PATTERNS.hat[s][step];
    const bass = DRUM_PATTERNS.bass[s][step];
    const melody = this.sequencer.melodyPhrase[phraseStep];
    const arp = this.sequencer.arpPhrase[phraseStep];
    const counter = this.sequencer.counterPhrase[phraseStep];
    const playDrums = !isTransitionBar || (s === 2);
    const filterCutoff = this.filterNode.frequency.value;

    if (kick && playDrums) this.synth.playKick(time, 'action');
    if (snare && playDrums) this.synth.playSnare(time, 'action');
    if (hat && playDrums) this.synth.playHat(time, 'action');
    if (bass) this.synth.playSynth(bass, time, 'base', 'sine', s === 0 ? 0.08 : 0.12, 0.4, false, true, 0.02, filterCutoff);
    if (melody) this.synth.playSynth(melody, time, 'base', s === 0 ? 'sine' : 'triangle', s === 0 ? 0.12 : 0.18, 0.5, false, true, 0.02, filterCutoff);
    if (arp && combo >= 4) this.synth.playSynth(arp, time, 'action', 'square', 0.03, 0.15, true, false, 0.02, filterCutoff);
    if (counter && combo >= 8) this.synth.playSynth(counter, time, 'ballet', 'sine', 0.08, 0.3, false, false, 0.05, filterCutoff);
    if (combo >= 10 && melody && step % 2 === 0) this.synth.playSynth(melody + 12, time, 'ballet', 'sine', 0.05, 0.2, true, false, 0.02, filterCutoff);
  }

  update(combo, enemyCount, enemyProximity) {
    this.currentCombo = combo;
    this.enemyProximity = enemyProximity;
    if (!this.loaded || !this.playing) return;
    const actionTarget = Math.min(combo / 15, 1) * 0.8;
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.3);
    const balletTarget = combo > 8 ? Math.min((combo - 8) / 12, 1) * 0.8 : 0;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.5);
    let targetFreq = 20000;
    if (enemyCount === 0) targetFreq = 600;
    else if (enemyProximity > 400) targetFreq = 3000;
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }
}