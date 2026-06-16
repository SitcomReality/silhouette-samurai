export function playParry(ctx, targetNode) {
  // Sharp metallic clang
  const osc1 = ctx.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(1200, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
  
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(800, ctx.currentTime);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(targetNode);
  
  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.15);
}

export function playClash(ctx, targetNode) {
  // Sharp impact with noise decay
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 3;
  
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  
  noise.start();
}