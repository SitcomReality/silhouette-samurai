export function playAttackSwoosh(ctx, targetNode, attackType) {
  const isHeavy = ['down_thrust', 'rising_slash', 'heavy_slash'].includes(attackType);
  
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isHeavy ? 400 : 1200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(isHeavy ? 100 : 300, ctx.currentTime + 0.2);
  filter.Q.value = 1.5;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(isHeavy ? 0.3 : 0.15, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  
  noise.start();
}

export function playWhoosh(ctx, targetNode, x, cameraX, screenWidth) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  const panner = ctx.createStereoPanner();
  const relativeX = (x - cameraX) / (screenWidth / 2);
  panner.pan.value = Math.max(-1, Math.min(1, relativeX));
  
  osc.connect(gain);
  gain.connect(panner);
  panner.connect(targetNode);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playSlide(ctx, targetNode) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 80;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 5;
  
  const gain = ctx.createGain();
  gain.gain.value = 0.12;
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playJump(ctx, targetNode) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(targetNode);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}