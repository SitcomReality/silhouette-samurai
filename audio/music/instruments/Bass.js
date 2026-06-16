export function playAcidBass(ctx, targetNode, midiNote, time, vol, duration, accent = false) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Dual-oscillator bass for thickness
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'square';
    osc.frequency.value = freq * (i === 0 ? 1 : 0.996); // Slight detune
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(accent ? freq * 12 : freq * 4, when);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, when + duration * 0.6);
    filter.Q.value = accent ? 18 : 8;
    
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let j = 0; j < 256; j++) {
      const x = (j * 2 / 256) - 1;
      curve[j] = Math.tanh(x * 3);
    }
    distortion.curve = curve;
    
    const gain = ctx.createGain();
    const oscVol = vol * (i === 0 ? 0.7 : 0.3);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(oscVol * (accent ? 1.3 : 1.0), when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(filter);
    filter.connect(distortion);
    distortion.connect(gain);
    gain.connect(targetNode);
    
    osc.start(when);
    osc.stop(when + duration);
  }
}