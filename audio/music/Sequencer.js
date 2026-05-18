import { MOTIFS } from './Config.js';

export class MusicSequencer {
  constructor() {
    this.melodyPhrase = new Array(64).fill(-1);
    this.arpPhrase = new Array(64).fill(-1);
    this.counterPhrase = new Array(64).fill(-1);
    this.bassPhrase = new Array(64).fill(-1);
  }

  generatePhrase(sectionIndex, comboLevel = 0) {
    const motifKeys = Object.keys(MOTIFS);
    this.melodyPhrase.fill(-1);
    this.arpPhrase.fill(-1);
    this.counterPhrase.fill(-1);
    this.bassPhrase.fill(-1);

    const callMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const responseMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const transpose = Math.floor(Math.random() * 3);

    // Primary melody
    this.fillPhraseWithMotif(this.melodyPhrase, 0, 32, callMotif, transpose, sectionIndex, false, 0.8);
    this.fillPhraseWithMotif(this.melodyPhrase, 32, 32, responseMotif, transpose, sectionIndex, false, 0.7);

    // Arpeggiated counterpoint
    this.fillPhraseWithMotif(this.arpPhrase, 0, 64, callMotif, transpose + 1, sectionIndex, true, 0.6);

    // Endings resolve downward
    [31, 63].forEach(step => {
      if (this.melodyPhrase[step] !== -1) {
        this.melodyPhrase[step] = Math.max(0, this.melodyPhrase[step] - 2);
      }
    });

    // Counter-melody interaction
    for (let i = 0; i < 64; i++) {
      const source = this.melodyPhrase[i] !== -1 ? this.melodyPhrase[i] : this.arpPhrase[i];
      if (source !== -1 && Math.random() > 0.5) {
        // Harmony above melody
        this.counterPhrase[i] = source + 2; 
      }
    }
    
    // Bass phrase generation tailored to comboLevel
    const bassMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    for (let i = 0; i < 64; i += 8) {
      if (Math.random() > 0.2) {
        this.bassPhrase[i] = 0; // Root on downbeat
        this.bassPhrase[i+4] = bassMotif[0] || 0;
        if (comboLevel > 10) {
           this.bassPhrase[i+3] = bassMotif[1] || 1;
           this.bassPhrase[i+6] = bassMotif[2] || 2;
        }
      }
    }
  }

  fillPhraseWithMotif(target, startStep, length, motif, transpose, section, isArp = false, density = 0.6) {
    const stepsPerMotif = motif.length * 2;
    for (let i = 0; i < length; i += stepsPerMotif) {
      if (Math.random() > density) continue;
      for (let j = 0; j < motif.length; j++) {
        const step = startStep + i + j * (isArp ? 1 : 2);
        if (step >= startStep + length) break;
        let degree = motif[j] + transpose + (section % 3);
        target[step] = Math.max(0, degree);
      }
    }
  }
}