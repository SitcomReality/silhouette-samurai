export function renderGlows(ctx, controller, viewWidth, camYOffset) {
  const enemies = controller.entities.filter(e => e.state !== 'dead' && e.type === 'enemy');
  const player = controller.player;
  
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  // Enemy glows
  for (const ent of enemies) {
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    const scY = ent.y - (ent.character ? (ent.character.height || 70) * 0.4 : 40) + camYOffset;
    const glowRadius = (ent.scale || 1.0) * 60;
    
    if (ent.flashTimer > 0) {
      const flashP = Math.min(ent.flashTimer / 0.15, 1.0);
      ctx.globalAlpha = 0.8 * flashP;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * (ent.scale || 1.0);
      ctx.beginPath();
      ctx.arc(scX, scY, glowRadius * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Enemy charging/cooldown telegraph
      const cp = ent.chargeProgress || 0;
      
      // Ring aesthetic parameters
      const pulseSpeed = 0.01 + cp * 0.04;
      const pulseMag = 0.02 + cp * 0.08;
      const pulse = 1.0 + Math.sin(Date.now() * pulseSpeed) * pulseMag;
      
      // Growth is more subtle (max 25%)
      const chargeRadius = glowRadius * (0.7 + cp * 0.25) * pulse;
      const alpha = 0.2 + cp * 0.6;
      
      // Outer danger ring
      ctx.lineWidth = (cp >= 1.0 ? 5 : 3) * (ent.scale || 1.0);
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = '#f43f5e'; // Rose
      ctx.beginPath();
      ctx.arc(scX, scY, chargeRadius * 1.15, 0, Math.PI * 2);
      ctx.stroke();

      // Inner tracking ring
      ctx.lineWidth = (cp >= 1.0 ? 3 : 1.5) * (ent.scale || 1.0);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = cp >= 1.0 ? '#ffffff' : '#fb923c'; // Orange-to-white shift
      ctx.beginPath();
      ctx.arc(scX, scY, chargeRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // Player glow (expands when charging)
  if (player.state !== 'dead') {
    const scX = (player.x - controller.cameraX) + viewWidth / 2;
    const scY = player.y - (player.character ? (player.character.height || 70) * 0.4 : 40) + camYOffset;
    
    const chargeIntensity = player.attackCharging ? Math.min(player.attackChargeTime / 1.2, 1.0) : 0;
    const baseRadius = (player.scale || 1.5) * 35;
    
    // Pulsate only when fully charged
    let pulse = 1.0;
    if (chargeIntensity >= 1.0) {
      pulse = 1.0 + Math.sin(Date.now() * 0.02) * 0.08;
    }
    
    // Growth is minimal (max 20%)
    const chargeRadius = baseRadius * (1.0 + chargeIntensity * 0.2) * pulse;
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#06b6d4';
    
    // Primary outer ring
    ctx.lineWidth = (chargeIntensity >= 1.0 ? 4 : 2);
    ctx.globalAlpha = 0.2 + chargeIntensity * 0.4;
    ctx.strokeStyle = themeColor;
    ctx.beginPath();
    ctx.arc(scX, scY, chargeRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Sharp inner highlight
    if (chargeIntensity > 0.1) {
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = chargeIntensity * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scX, scY, chargeRadius * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  ctx.globalAlpha = 1.0;
  ctx.restore();
}