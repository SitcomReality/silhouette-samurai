export function playKick(ctx, targetNode, time, intensity = 1.0) {
  const when = Math.max(ctx.currentTime, time);
  
  // Deep sub kick
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, when);
  osc.frequency.exponentialRampToValueAtTime(30, when + 0.15);
  
  // Saturation for punch
  const distortion = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2 / 256) - 1;
    curve[i] = Math.tanh(x * (1 + intensity * 2));
  }
  distortion.curve = curve;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7 * intensity, when);
  gain.gain.exponentialRampToValueAtTime(0.01, when + 0.4);
  
  osc.connect(distortion);
  distortion.connect(gain);
  gain.connect(targetNode);
  
  osc.start(when);
  osc.stop(when + 0.4);
}

export function playSnare(ctx, targetNode, time, intensity = 1.0) {
  const when = Math.max(ctx.currentTime, time);
  
  // Tight noise burst
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
  }
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 3;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4 * intensity, when);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, when + 0.15);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(targetNode);
  
  // Punchy low transient
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, when);
  osc.frequency.exponentialRampToValueAtTime(90, when + 0.08);
  
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3 * intensity, when);
  oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.1);
  
  osc.connect(oscGain);
  oscGain.connect(targetNode);
  
  noise.start(when);
  osc.start(when);
  osc.stop(when + 0.15);
}

export function playHat(ctx, targetNode, time, intensity = 1.0) {
  const when = Math.max(ctx.currentTime, time);
  
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  filter.Q.value = 1;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2 * intensity, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  noise.start(when);
}