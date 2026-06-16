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
      ctx.globalAlpha = 0.5 * flashP;
      ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
      ctx.beginPath();
      ctx.arc(scX, scY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Enemy charging/cooldown telegraph
      const cp = ent.chargeProgress || 0;
      const chargeGlowScale = 1.0 + cp * 1.5; // Grow by 150%
      const alpha = 0.15 + cp * 0.25;
      
      // Outer glow (Atmospheric)
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = 'rgba(244, 63, 94, 1.0)'; // Rose/Red tint for danger
      ctx.beginPath();
      ctx.arc(scX, scY, glowRadius * chargeGlowScale * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Core glow (Theme color equivalent for enemies)
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(255, 110, 30, 1.0)';
      ctx.beginPath();
      ctx.arc(scX, scY, glowRadius * chargeGlowScale, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight pulse when fully charged and about to strike
      if (cp >= 1.0) {
        const pulse = 0.4 + Math.sin(Date.now() * 0.02) * 0.2;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(scX, scY, glowRadius * chargeGlowScale * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Player glow (expands when charging)
  if (player.state !== 'dead') {
    const scX = (player.x - controller.cameraX) + viewWidth / 2;
    const scY = player.y - (player.character ? (player.character.height || 70) * 0.4 : 40) + camYOffset;
    
    const chargeIntensity = player.attackCharging ? Math.min(player.attackChargeTime / 1.2, 1.0) : 0;
    const baseRadius = (player.scale || 1.5) * 40;
    const chargeRadius = baseRadius * (1 + chargeIntensity * 1.2); // Grows by 120% at full charge
    
    ctx.globalAlpha = 0.08 + chargeIntensity * 0.15;
    ctx.fillStyle = 'rgba(6, 182, 212, 1.0)';
    ctx.beginPath();
    ctx.arc(scX, scY, chargeRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 0.15 + chargeIntensity * 0.25;
    ctx.beginPath();
    ctx.arc(scX, scY, chargeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    const pulse = chargeIntensity >= 0.95 ? 0.5 + Math.sin(Date.now() * 0.01) * 0.15 : 1.0;
    ctx.globalAlpha = (0.2 + chargeIntensity * 0.4) * pulse;
    ctx.beginPath();
    ctx.arc(scX, scY, chargeRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;
  ctx.restore();
}