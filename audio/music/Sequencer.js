import { PENTATONIC_MAP, MOTIFS } from './Config.js';

export class MusicSequencer {
  constructor() {
    this.melodyPhrase = new Array(64).fill(0);
    this.arpPhrase = new Array(64).fill(0);
    this.counterPhrase = new Array(64).fill(0);
  }

  generatePhrase(sectionIndex) {
    const motifKeys = Object.keys(MOTIFS);
    this.melodyPhrase.fill(0);
    this.arpPhrase.fill(0);
    this.counterPhrase.fill(0);

    const callMotif = MOTIFS[motifKeys[Math.floor(Math.random() * motifKeys.length)]];
    const transpose = Math.floor(Math.random() * 3) - 1;

    this.fillPhraseWithMotif(this.melodyPhrase, 0, 32, callMotif, transpose, sectionIndex);
    this.fillPhraseWithMotif(this.arpPhrase, 32, 32, callMotif, transpose + 1, sectionIndex, true);

    [31, 63].forEach(step => {
      if (this.melodyPhrase[step]) this.melodyPhrase[step] = PENTATONIC_MAP[Math.max(0, this.getDegreeFromMidi(this.melodyPhrase[step]) - 3)];
      if (this.arpPhrase[step]) this.arpPhrase[step] = PENTATONIC_MAP[Math.max(0, this.getDegreeFromMidi(this.arpPhrase[step]) - 3)];
    });

    for (let i = 0; i < 64; i++) {
      const source = this.melodyPhrase[i] || this.arpPhrase[i];
      if (source && Math.random() > 0.4) {
        const deg = this.getDegreeFromMidi(source);
        this.counterPhrase[i] = PENTATONIC_MAP[Math.min(PENTATONIC_MAP.length - 1, deg + 2)];
      }
    }
  }

  fillPhraseWithMotif(target, startStep, length, motif, transpose, section, isArp = false) {
    const density = section === 0 ? 0.3 : (section === 1 ? 0.6 : 0.9);
    const stepsPerMotif = motif.length * 2;
    for (let i = 0; i < length; i += stepsPerMotif) {
      if (Math.random() > density) continue;
      for (let j = 0; j < motif.length; j++) {
        const step = startStep + i + j * (isArp ? 1 : 2);
        if (step >= startStep + length) break;
        let degree = motif[j] + transpose + (section * 3);
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