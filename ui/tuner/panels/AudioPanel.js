import { createSectionHeader, createSlider } from '../TunerHelpers.js';

export class AudioPanel {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
  }

  render(container) {
    container.innerHTML = '';
    if (!this.audioEngine || !this.audioEngine.music || !this.audioEngine.initialized) {
      const msg = document.createElement('div');
      msg.style.padding = '1rem';
      msg.innerHTML = `
        <p style="color: #94a3b8; margin-bottom: 1rem; font-size: 0.7rem; line-height: 1.4;">
          Audio engine not initialized. WebAudio requires a user interaction (like a click or key press) to start.
        </p>
        <button id="btn-init-audio-tuner" class="btn-tuner-toggle" style="width: 100%; height: 2.5rem; color: white; border-color: var(--theme-color); font-size: 0.75rem;">
          🔊 Initialize Audio Now
        </button>
      `;
      container.appendChild(msg);
      
      const btn = container.querySelector('#btn-init-audio-tuner');
      btn.onclick = async () => {
        await this.audioEngine.start();
        this.render(container);
      };
      return;
    }

    const music = this.audioEngine.music;
    
    createSectionHeader(container, 'Tempo & Master');
    
    // Force max combo toggle
    const forceMaxDiv = document.createElement('div');
    forceMaxDiv.className = 'tuner-control';
    forceMaxDiv.innerHTML = `
      <label class="dev-mode-toggle" style="border: none; padding: 0; margin: 0 0 0.5rem 0;">
        <input type="checkbox" id="force-max-combo" ${music.forceMaxCombo ? 'checked' : ''} />
        <span>Force Max Intensity (Combo 50+)</span>
      </label>
    `;
    container.appendChild(forceMaxDiv);
    const forceMaxCheckbox = forceMaxDiv.querySelector('#force-max-combo');
    forceMaxCheckbox.onchange = (e) => {
      music.forceMaxCombo = e.target.checked;
    };
    
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
    
    createSectionHeader(container, 'Instruments');
    
    const instruments = [
      { value: 'synthLead', label: 'Synth Lead (Warm)' },
      { value: 'sawLead', label: 'Saw Lead (Aggressive)' },
      { value: 'acidBass', label: 'Acid Bass' },
      { value: 'piano', label: 'Piano' },
      { value: 'pluck', label: 'Pluck' },
      { value: 'bell', label: 'Bell' },
      { value: 'string', label: 'String' }
    ];
    
    const createInstrumentSelect = (label, key) => {
      const div = document.createElement('div');
      div.className = 'tuner-control';
      div.innerHTML = `
        <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">${label}</label>
        <select class="instrument-select" data-key="${key}" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:4px;border-radius:4px;">
          ${instruments.map(inst => `<option value="${inst.value}" ${music.instruments[key] === inst.value ? 'selected' : ''}>${inst.label}</option>`).join('')}
        </select>
      `;
      container.appendChild(div);
      const select = div.querySelector('select');
      select.onchange = (e) => {
        music.instruments[key] = e.target.value;
      };
    };
    
    createInstrumentSelect('Melody Instrument', 'melody');
    createInstrumentSelect('Bass Instrument', 'bass');
    createInstrumentSelect('Counter Melody Instrument', 'counter');
    
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
      note.textContent = 'Note: Changes take effect immediately. Experiment with different instrument combinations!';
      container.appendChild(note);
    }
  }
}