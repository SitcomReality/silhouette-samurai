export class MusicSynthesizer {
  constructor(audioContext, gainNodes) {
    this.ctx = audioContext;
    this.gainNodes = gainNodes;
  }

  playKick(time, layer = 'base') {
    const when = Math.max(this.ctx.currentTime, time);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.gainNodes[layer]);
    osc.frequency.setValueAtTime(150, when);
    osc.frequency.exponentialRampToValueAtTime(40, when + 0.1);
    gain.gain.setValueAtTime(0.7, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.3);
    osc.start(when);
    osc.stop(when + 0.3);
  }

  playSnare(time, layer = 'base') {
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
    gain.gain.setValueAtTime(0.4, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, when);
    osc.frequency.exponentialRampToValueAtTime(100, when + 0.1);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, when);
    oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.gainNodes[layer]);
    noise.start(when);
    osc.start(when);
    osc.stop(when + 0.2);
  }

  playHat(time, layer = 'base') {
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
    gain.gain.setValueAtTime(0.2, when);
    gain.gain.exponentialRampToValueAtTime(0.01, when + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes[layer]);
    noise.start(when);
  }

  playSynth(midiNote, time, layer, type, vol, duration, glitch = false, glide = false, attack = 0.02, filterCutoff = 20000) {
    if (filterCutoff < 1000 && midiNote > 65) return;
    const combo = 0; // Simplified for synthesizer context, caller could pass it
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