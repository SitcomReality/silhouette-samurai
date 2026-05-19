export class MusicSynthesizer {
  constructor(audioContext, gainNodes) {
    this.ctx = audioContext;
    this.gainNodes = gainNodes;
  }

  playKick(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    
    // Deep sub kick
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, when);
    osc.frequency.exponentialRampToValueAtTime(30, when + 0.15);
    
    // Saturation for punch
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2 / 256) - 1;
      curve[i] = Math.tanh(x * (1 + intensity * 2));
    }
    distortion.curve = curve;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7 * intensity, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.4);
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.gainNodes[layer]);
    
    osc.start(when);
    osc.stop(when + 0.4);
  }

  playSnare(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    
    // Tight noise burst
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 3;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * intensity, when);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNodes[layer]);
    
    // Punchy low transient
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, when);
    osc.frequency.exponentialRampToValueAtTime(90, when + 0.08);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3 * intensity, when);
    oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.gainNodes[layer]);
    
    noise.start(when);
    osc.start(when);
    osc.stop(when + 0.15);
  }

  playHat(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    filter.Q.value = 1;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * intensity, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    noise.start(when);
  }

  playAcidBass(midiNote, time, layer, vol, duration, accent = false) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Dual-oscillator bass for thickness
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.value = freq * (i === 0 ? 1 : 0.996); // Slight detune
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(accent ? freq * 12 : freq * 4, when);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.2, when + duration * 0.6);
      filter.Q.value = accent ? 18 : 8;
      
      const distortion = this.ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let j = 0; j < 256; j++) {
        const x = (j * 2 / 256) - 1;
        curve[j] = Math.tanh(x * 3);
      }
      distortion.curve = curve;
      
      const gain = this.ctx.createGain();
      const oscVol = vol * (i === 0 ? 0.7 : 0.3);
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(oscVol * (accent ? 1.3 : 1.0), when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
      
      osc.connect(filter);
      filter.connect(distortion);
      distortion.connect(gain);
      gain.connect(this.gainNodes[layer]);
      
      osc.start(when);
      osc.stop(when + duration);
    }
  }

  // Piano-like sound with gentle attack
  playPiano(midiNote, time, layer, vol, duration) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Multiple harmonics for richer piano-like tone
    const harmonics = [1, 2, 3, 4.2, 5.4];
    const gains = [1.0, 0.3, 0.15, 0.08, 0.05];
    
    for (let i = 0; i < harmonics.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * harmonics[i];
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(vol * gains[i], when + 0.01);
      gain.gain.exponentialRampToValueAtTime(vol * gains[i] * 0.3, when + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
      
      osc.connect(gain);
      gain.connect(this.gainNodes[layer]);
      osc.start(when);
      osc.stop(when + duration);
    }
  }

  // Plucked string sound
  playPluck(midiNote, time, layer, vol, duration) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, when);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, when + duration);
    filter.Q.value = 2;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    osc.start(when);
    osc.stop(when + duration);
  }

  // Glockenspiel-like bell sound
  playBell(midiNote, time, layer, vol, duration) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Inharmonic partials for bell-like tone
    const partials = [1, 2.76, 5.4, 8.93];
    const amps = [1.0, 0.4, 0.2, 0.1];
    
    for (let i = 0; i < partials.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * partials[i];
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * amps[i], when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
      
      osc.connect(gain);
      gain.connect(this.gainNodes[layer]);
      osc.start(when);
      osc.stop(when + duration);
    }
  }

  // String ensemble sound
  playString(midiNote, time, layer, vol, duration, vibrato = false) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    
    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 5;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(when);
      lfo.stop(when + duration);
    }
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq * 3;
    filter.Q.value = 1;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + 0.15);
    gain.gain.linearRampToValueAtTime(vol * 0.7, when + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0.001, when + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    osc.start(when);
    osc.stop(when + duration);
  }

  playSynthLead(midiNote, time, layer, vol, duration) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Warm detuned saw lead
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq * (1 + (i - 0.5) * 0.008);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 6, when);
      filter.frequency.exponentialRampToValueAtTime(freq * 2, when + duration);
      filter.Q.value = 2;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(vol * 0.5, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNodes[layer]);
      
      osc.start(when);
      osc.stop(when + duration);
    }
  }

  playSawLead(midiNote, time, layer, vol, duration) {
    const when = Math.max(this.ctx.currentTime, time);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Aggressive supersaw
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq * (1 + (i - 1) * 0.012);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 10, when);
      filter.frequency.exponentialRampToValueAtTime(freq * 3, when + duration);
      filter.Q.value = 4;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(vol * 0.4, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNodes[layer]);
      
      osc.start(when);
      osc.stop(when + duration);
    }
  }
}