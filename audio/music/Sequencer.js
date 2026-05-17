import { PENTATONIC_MAP, MOTIFS } from './Config.js';

export class MusicSequencer {
  constructor() {
    this.melodyPhrase = new Array(64).fill(0);
    this.arpPhrase = new Array(64).fill(0);
    this.counterPhrase = new Array(64).fill(0);
  }

  generatePhrase(sectionIndex, comboLevel = 0) {
    const motifKeys = Object.keys(MOTIFS);
    this.melodyPhrase.fill(0);
    this.arpPhrase.fill(0);
    this.counterPhrase.fill(0);

    const callMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const responseMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const transpose = Math.floor(Math.random() * 3) - 1;

    // Primary melody - always present
    this.fillPhraseWithMotif(this.melodyPhrase, 0, 32, callMotif, transpose, sectionIndex, false, 0.8);
    
    // Response phrase with variation
    this.fillPhraseWithMotif(this.melodyPhrase, 32, 32, responseMotif, transpose, sectionIndex, false, 0.7);

    // Arpeggiated counterpoint
    this.fillPhraseWithMotif(this.arpPhrase, 0, 64, callMotif, transpose + 1, sectionIndex, true, 0.6);

    // Ending phrases resolve downward
    [31, 63].forEach(step => {
      if (this.melodyPhrase[step]) this.melodyPhrase[step] = PENTATONIC_MAP[Math.max(0, this.getDegreeFromMidi(this.melodyPhrase[step]) - 2)];
    });

    // Counter-melody for high combo sections
    for (let i = 0; i < 64; i++) {
      const source = this.melodyPhrase[i] || this.arpPhrase[i];
      if (source && Math.random() > 0.5) {
        const deg = this.getDegreeFromMidi(source);
        // Add harmony above melody
        this.counterPhrase[i] = PENTATONIC_MAP[Math.min(PENTATONIC_MAP.length - 1, deg + 2)];
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
        let degree = motif[j] + transpose + (section * 2);
        degree = Math.max(0, Math.min(PENTATONIC_MAP.length - 1, degree));
        target[step] = PENTATONIC_MAP[degree];
      }
    }
  }

  getDegreeFromMidi(midi) {
    const idx = PENTATONIC_MAP.indexOf(midi);
    return idx === -1 ? 0 : idx;
  }
}