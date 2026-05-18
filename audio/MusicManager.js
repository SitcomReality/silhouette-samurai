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
    const combo = this.currentCombo;
    
    // Dynamic drum pattern level based on combo
    let level = 0;
    if (combo > 20) level = 2; // Aphex Twin style breakbeats
    else if (combo > 8) level = 1; // 4-on-the-floor
    
    const kick = DRUM_PATTERNS.kick[level][step];
    const snare = DRUM_PATTERNS.snare[level][step];
    const hat = DRUM_PATTERNS.hat[level][step];

    // Dynamic harmonic shift: Pop Major to Industrial Minor
    const scale = combo > 15 ? MINOR_PENTATONIC : MAJOR_PENTATONIC;

    const mapNote = (degree, baseOffset = 0) => {
      if (degree === -1) return null;
      return scale[degree % scale.length] + Math.floor(degree / scale.length) * 12 + baseOffset;
    };
    
    const melody = mapNote(this.sequencer.melodyPhrase[phraseStep]);
    const arp = mapNote(this.sequencer.arpPhrase[phraseStep]);
    const counter = mapNote(this.sequencer.counterPhrase[phraseStep]);
    const bass = mapNote(this.sequencer.bassPhrase[phraseStep], -24); // 2 octaves down
    
    const comboFactor = Math.min(combo / 50, 1.0);
    const rhythmIntensity = 0.3 + comboFactor * 0.7;

    // Play drums with conditional stutter for breakbeat level
    if (kick) this.synth.playKick(time, 'action', rhythmIntensity);
    if (snare) this.synth.playSnare(time, 'action', rhythmIntensity);
    if (hat) {
      const stutters = (level === 2 && step % 4 === 3 && Math.random() > 0.5) ? 3 : 1;
      this.synth.playHat(time, 'action', rhythmIntensity * 0.8, stutters);
    }
    
    // Acid Bass line integration
    if (bass !== null && combo > 4) {
      const isAccent = (level === 2 && step % 4 !== 0 && Math.random() > 0.3);
      const bassVol = 0.1 + comboFactor * 0.1;
      this.synth.playAcidBass(bass, time, 'action', bassVol, 0.25, isAccent);
    }
    
    // Primary melody layering
    if (melody !== null) {
      const melodyVol = 0.12 + comboFactor * 0.08;
      if (combo < 10) {
        this.synth.playPiano(melody, time, 'base', melodyVol, 0.5);
      } else if (combo < 25) {
        this.synth.playPluck(melody, time, 'base', melodyVol, 0.5);
      } else {
        this.synth.playString(melody, time, 'ballet', melodyVol, 0.6, true);
      }
    }
    
    // Counter-melody glockenspiel
    if (counter !== null && combo >= 8) {
      const bellVol = 0.06 + comboFactor * 0.1;
      this.synth.playBell(counter, time, 'ballet', bellVol, 0.35);
    }
    
    // Arpeggio
    if (arp !== null && combo >= 4) {
      const arpVol = 0.04 + comboFactor * 0.05;
      this.synth.playPluck(arp, time, 'action', arpVol, 0.2);
    }
  }

  update(combo, enemyCount, enemyProximity) {
    this.currentCombo = combo;
    this.enemyProximity = enemyProximity;
    if (!this.loaded || !this.playing) return;
    
    const comboFactor = Math.min(combo / 50, 1.0);
    
    // Dynamic intensity scaling across layers
    const actionTarget = 0.4 + comboFactor * 0.6;
    this.gainNodes.action.gain.setTargetAtTime(actionTarget, this.ctx.currentTime, 0.5);
    
    const balletTarget = combo > 8 ? 0.3 + Math.min((combo - 8) / 42, 1.0) * 0.7 : 0.1;
    this.gainNodes.ballet.gain.setTargetAtTime(balletTarget, this.ctx.currentTime, 0.7);
    
    const baseTarget = 0.7 + comboFactor * 0.3;
    this.gainNodes.base.gain.setTargetAtTime(baseTarget, this.ctx.currentTime, 0.6);
    
    // More intense filter changes for industrial shift
    let targetFreq = combo > 15 ? 12000 + comboFactor * 8000 : 8000 + comboFactor * 12000;
    if (enemyCount === 0) targetFreq = Math.max(3000, targetFreq * 0.5);
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
  }
}