import { playKick, playSnare, playHat } from './instruments/Drums.js';
import { playAcidBass } from './instruments/Bass.js';
import { playPiano, playPluck, playBell } from './instruments/Melodic.js';
import { playString, playSynthLead, playSawLead } from './instruments/Leads.js';

export class MusicSynthesizer {
  constructor(audioContext, gainNodes) {
    this.ctx = audioContext;
    this.gainNodes = gainNodes;
  }

  playKick(time, layer = 'base', intensity = 1.0) {
    playKick(this.ctx, this.gainNodes[layer], time, intensity);
  }

  playSnare(time, layer = 'base', intensity = 1.0) {
    playSnare(this.ctx, this.gainNodes[layer], time, intensity);
  }

  playHat(time, layer = 'base', intensity = 1.0) {
    playHat(this.ctx, this.gainNodes[layer], time, intensity);
  }

  playAcidBass(midiNote, time, layer, vol, duration, accent = false) {
    playAcidBass(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration, accent);
  }

  playPiano(midiNote, time, layer, vol, duration) {
    playPiano(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration);
  }

  playPluck(midiNote, time, layer, vol, duration) {
    playPluck(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration);
  }

  playBell(midiNote, time, layer, vol, duration) {
    playBell(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration);
  }

  playString(midiNote, time, layer, vol, duration, vibrato = false) {
    playString(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration, vibrato);
  }

  playSynthLead(midiNote, time, layer, vol, duration) {
    playSynthLead(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration);
  }

  playSawLead(midiNote, time, layer, vol, duration) {
    playSawLead(this.ctx, this.gainNodes[layer], midiNote, time, vol, duration);
  }
}