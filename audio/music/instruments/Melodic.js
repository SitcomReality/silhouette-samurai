export function playPiano(ctx, targetNode, midiNote, time, vol, duration) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Multiple harmonics for richer piano-like tone
  const harmonics = [1, 2, 3, 4.2, 5.4];
  const gains = [1.0, 0.3, 0.15, 0.08, 0.05];
  
  for (let i = 0; i < harmonics.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * harmonics[i];
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol * gains[i], when + 0.01);
    gain.gain.exponentialRampToValueAtTime(vol * gains[i] * 0.3, when + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(gain);
    gain.connect(targetNode);
    osc.start(when);
    osc.stop(when + duration);
  }
}

export function playPluck(ctx, targetNode, midiNote, time, vol, duration) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 4, when);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.5, when + duration);
  filter.Q.value = 2;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(targetNode);
  osc.start(when);
  osc.stop(when + duration);
}

export function playBell(ctx, targetNode, midiNote, time, vol, duration) {
  const when = Math.max(ctx.currentTime, time);
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Inharmonic partials for bell-like tone
  const partials = [1, 2.76, 5.4, 8.93];
  const amps = [1.0, 0.4, 0.2, 0.1];
  
  for (let i = 0; i < partials.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * partials[i];
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * amps[i], when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    
    osc.connect(gain);
    gain.connect(targetNode);
    osc.start(when);
    osc.stop(when + duration);
  }
}