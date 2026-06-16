export function playFusionHum(ctx, targetNode, intensity) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 40;
  
  const gain = ctx.createGain();
  gain.gain.value = Math.min(intensity * 0.05, 0.15);
  
  osc.connect(gain);
  gain.connect(targetNode);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}