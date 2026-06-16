export function playString(ctx, targetNode, midiNote, time, vol, duration, vibrato = false) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  
  if (vibrato) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(when);
    lfo.stop(when + duration);
  }
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = freq * 3;
  filter.Q.value = 1;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.15);
  gain.gain.linearRampToValueAtTime(vol * 0.7, when + duration * 0.5);
  gain.gain.linearRampToValueAtTime(0.001, when + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  osc.start(when);
  osc.stop(when + duration);
}

export function playSynthLead(ctx, targetNode, midiNote, time, vol, duration) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Warm detuned saw lead
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq * (1 + (i - 0.5) * 0.008);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6, when);
    filter.frequency.exponentialRampToValueAtTime(freq * 2, when + duration);
    filter.Q.value = 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol * 0.5, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetNode);
    
    osc.start(when);
    osc.stop(when + duration);
  }
}

export function playSawLead(ctx, targetNode, midiNote, time, vol, duration) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Aggressive supersaw
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq * (1 + (i - 1) * 0.012);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 10, when);
    filter.frequency.exponentialRampToValueAtTime(freq * 3, when + duration);
    filter.Q.value = 4;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol * 0.4, when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetNode);
    
    osc.start(when);
    osc.stop(when + duration);
  }
}