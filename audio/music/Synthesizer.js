export class MusicSynthesizer {
  constructor(audioContext, gainNodes) {
    this.ctx = audioContext;
    this.gainNodes = gainNodes;
  }

  playKick(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.gainNodes[layer]);
    osc.frequency.setValueAtTime(150, when);
    osc.frequency.exponentialRampToValueAtTime(40, when + 0.1);
    gain.gain.setValueAtTime(0.5 * intensity, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.3);
    osc.start(when);
    osc.stop(when + 0.3);
  }

  playSnare(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * intensity, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, when);
    osc.frequency.exponentialRampToValueAtTime(100, when + 0.1);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.25 * intensity, when);
    oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.gainNodes[layer]);
    noise.start(when);
    osc.start(when);
    osc.stop(when + 0.2);
  }

  playHat(time, layer = 'base', intensity = 1.0) {
    const when = Math.max(this.ctx.currentTime, time);
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 * intensity, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    noise.start(when);
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

  playSynth(midiNote, time, layer, type, vol, duration, glitch = false, glide = false, attack = 0.02, filterCutoff = 20000) {
    if (filterCutoff < 1000 && midiNote > 65) return;
    let jitter = (Math.random() - 0.5) * 0.003;
    let velocityMult = 0.95 + Math.random() * 0.1;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = this.ctx.createOscillator();
    osc.type = type;
    const startTime = Math.max(this.ctx.currentTime, time + jitter);
    if (glide) {
      osc.frequency.setValueAtTime(freq * 0.95, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(freq, startTime);
    }
    if (glitch && Math.random() > 0.8) {
      osc.frequency.setValueAtTime(freq * 1.5, startTime + 0.02);
    }
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(glitch ? 6000 : 3000, startTime);
    filter.frequency.exponentialRampToValueAtTime(glitch ? 1500 : 400, startTime + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * velocityMult, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}