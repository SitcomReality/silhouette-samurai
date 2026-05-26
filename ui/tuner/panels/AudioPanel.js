import { createSectionHeader, createSlider } from '../TunerHelpers.js';

export class AudioPanel {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
  }

  render(container) {
    container.innerHTML = '';
    if (!this.audioEngine || !this.audioEngine.music) {
      container.innerHTML = '<p style="color: #94a3b8; padding: 1rem;">Audio engine not initialized</p>';
      return;
    }

    const music = this.audioEngine.music;
    
    createSectionHeader(container, 'Tempo & Master');
    createSlider(container, 'BPM', music, 'bpm', 60, 180, 1, (val) => {
      if (this.audioEngine.beatClock) {
        this.audioEngine.beatClock.bpm = val;
        this.audioEngine.beatClock.beatsPerSecond = val / 60;
        this.audioEngine.beatClock.secondsPerBeat = 60 / val;
        this.audioEngine.beatClock.secondsPer16th = this.audioEngine.beatClock.secondsPerBeat / 4;
      }
    });
    
    if (music.masterGain) {
      const masterVolControl = { vol: music.masterGain.gain.value };
      createSlider(container, 'Master Volume', masterVolControl, 'vol', 0, 1.5, 0.05, (val) => {
        music.masterGain.gain.setTargetAtTime(val, music.ctx.currentTime, 0.05);
      });
    }
    
    createSectionHeader(container, 'Layer Mix');
    if (music.gainNodes) {
      const baseControl = { vol: music.gainNodes.base?.gain.value || 1 };
      createSlider(container, 'Base Layer', baseControl, 'vol', 0, 1.5, 0.05, (val) => {
        music.gainNodes.base.gain.setTargetAtTime(val, music.ctx.currentTime, 0.1);
      });
      
      const actionControl = { vol: music.gainNodes.action?.gain.value || 0 };
      createSlider(container, 'Action Layer', actionControl, 'vol', 0, 1.5, 0.05, (val) => {
        music.gainNodes.action.gain.setTargetAtTime(val, music.ctx.currentTime, 0.1);
      });
      
      const balletControl = { vol: music.gainNodes.ballet?.gain.value || 0 };
      createSlider(container, 'Ballet Layer', balletControl, 'vol', 0, 1.5, 0.05, (val) => {
        music.gainNodes.ballet.gain.setTargetAtTime(val, music.ctx.currentTime, 0.1);
      });
    }
    
    createSectionHeader(container, 'Global Filter');
    if (music.filterNode) {
      const filterControl = { 
        baseFreq: 8000,
        maxFreq: 20000,
        q: music.filterNode.Q.value
      };
      createSlider(container, 'Base Cutoff (Hz)', filterControl, 'baseFreq', 1000, 20000, 100);
      createSlider(container, 'Max Cutoff (Hz)', filterControl, 'maxFreq', 5000, 20000, 100);
      createSlider(container, 'Resonance (Q)', filterControl, 'q', 0.1, 15, 0.1, (val) => {
        music.filterNode.Q.setTargetAtTime(val, music.ctx.currentTime, 0.05);
      });
    }
    
    createSectionHeader(container, 'Generative Music');
    if (music.sequencer) {
      const seqControl = {
        melodyDensity: 0.75,
        bassDensity: 0.6,
        counterDensity: 0.5
      };
      createSlider(container, 'Melody Density', seqControl, 'melodyDensity', 0, 1, 0.05);
      createSlider(container, 'Bass Density', seqControl, 'bassDensity', 0, 1, 0.05);
      createSlider(container, 'Counter Melody', seqControl, 'counterDensity', 0, 1, 0.05);
      
      const note = document.createElement('div');
      note.style.cssText = 'margin-top: 0.5rem; padding: 0.5rem; background: rgba(6, 182, 212, 0.1); border-left: 2px solid #06b6d4; font-size: 0.7rem; color: #94a3b8;';
      note.textContent = 'Note: Density changes affect newly generated phrases. Adjust then wait for next section.';
      container.appendChild(note);
    }
  }
}