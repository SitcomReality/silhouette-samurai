export function playHit(ctx, targetNode, beatClock, damage, combo, rhythmSync = true) {
  const when = rhythmSync ? beatClock.snapToNext16th(ctx, 50) : ctx.currentTime;
  const isHeavy = damage > 20;
  
  // Check if hit is near a beat for bass boost
  const timeToBeat = when - ctx.currentTime;
  const onBeat = Math.abs(timeToBeat) < 0.05;
  const beatBoost = onBeat ? 1.4 : 1.0;

  // Enhanced bass/kick component when on-beat
  const bassOsc = ctx.createOscillator();
  bassOsc.type = 'sine';
  bassOsc.frequency.setValueAtTime(isHeavy ? 80 : 100, when);
  bassOsc.frequency.exponentialRampToValueAtTime(30, when + 0.15);

  const bassGain = ctx.createGain();
  bassGain.gain.setValueAtTime((isHeavy ? 0.5 : 0.35) * beatBoost, when);
  bassGain.gain.exponentialRampToValueAtTime(0.01, when + 0.18);

  bassOsc.connect(bassGain);
  bassGain.connect(targetNode);

  // Percussive noise body
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
  }
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = isHeavy ? 'bandpass' : 'highpass';
  noiseFilter.frequency.value = isHeavy ? 800 : 2200;
  noiseFilter.Q.value = 1.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime((isHeavy ? 0.4 : 0.25) * beatBoost, when);
  noiseGain.gain.linearRampToValueAtTime(0, when + 0.12);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(targetNode);

  // Subtle tonal component
  const pentatonic = [65, 68, 70, 72, 75, 77, 80, 82, 84, 87]; 
  const noteMidi = pentatonic[combo % pentatonic.length];
  const freq = 440 * Math.pow(2, (noteMidi - 69) / 12);

  const toneOsc = ctx.createOscillator();
  toneOsc.type = 'triangle';
  toneOsc.frequency.setValueAtTime(freq, when);
  toneOsc.frequency.exponentialRampToValueAtTime(freq * 1.02, when + 0.08);

  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.06, when);
  toneGain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);

  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = 'lowpass';
  toneFilter.frequency.value = freq * 3;
  toneFilter.Q.value = 2;

  toneOsc.connect(toneFilter);
  toneFilter.connect(toneGain);
  toneGain.connect(targetNode);

  bassOsc.start(when);
  bassOsc.stop(when + 0.2);
  noise.start(when);
  noise.stop(when + 0.12);
  toneOsc.start(when);
  toneOsc.stop(when + 0.3);
}

export function playSlam(ctx, targetNode, beatClock, rhythmSync = true) {
  const when = rhythmSync ? beatClock.snapToNext16th(ctx, 50) : ctx.currentTime;
  
  playImpact(ctx, targetNode, 60, 0.4, when, 1.2);
  
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  noise.buffer = buffer;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.3;
  noise.connect(noiseGain);
  noiseGain.connect(targetNode);
  noise.start(when);
}

export function playLand(ctx, targetNode) {
  playImpact(ctx, targetNode, 80, 0.1, ctx.currentTime, 0.2);
}

export function playImpact(ctx, targetNode, frequency, duration, when, volume = 0.5) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, when);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, when + duration);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.4, when);
  gain.gain.exponentialRampToValueAtTime(0.01, when + duration);
  
  osc.connect(gain);
  gain.connect(targetNode);
  
  osc.start(when);
  osc.stop(when + duration);
}