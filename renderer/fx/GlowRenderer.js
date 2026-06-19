export function renderGlows(ctx, controller, viewWidth, camYOffset) {
  const enemies = controller.entities.filter(e => e.state !== 'dead' && (e.type === 'enemy' || e.type === 'projectile'));
  const player = controller.player;

  // Draw projectiles (outside composite mode)
  ctx.save();
  for (const ent of controller.entities) {
    if (ent.type !== 'projectile') continue;
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    const scY = ent.y + camYOffset;
    // Draw as a glowing diamond/bolt
    ctx.save();
    ctx.translate(scX, scY);
    const angle = Math.atan2(ent.vy, ent.vx);
    ctx.rotate(angle);
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(-14, 0);
    ctx.lineTo(0, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Trailing glow
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-30, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f97316';
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  // Enemy glows + attack zone telegraphs
  for (const ent of enemies) {
    if (ent.type === 'projectile') continue;
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
      const cp = ent.chargeProgress || 0;
      
      // Ring pulsation (faster as charge approaches 1)
      const pulseSpeed = 0.01 + cp * 0.04;
      const pulseMag = 0.02 + cp * 0.08;
      const pulse = 1.0 + Math.sin(Date.now() * pulseSpeed) * pulseMag;
      const chargeRadius = glowRadius * (0.7 + cp * 0.25) * pulse;
      const alpha = 0.2 + cp * 0.6;
      
      ctx.lineWidth = (cp >= 1.0 ? 5 : 3) * (ent.scale || 1.0);
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(scX, scY, chargeRadius * 1.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = (cp >= 1.0 ? 3 : 1.5) * (ent.scale || 1.0);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = cp >= 1.0 ? '#ffffff' : '#fb923c';
      ctx.beginPath();
      ctx.arc(scX, scY, chargeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Attack zone telegraph when charging (show WHERE the attack will land)
      if (cp > 0.3) {
        ctx.restore();
        ctx.save();
        renderAttackTelegraph(ctx, ent, controller, viewWidth, camYOffset, cp);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
      }
    }
  }
  
function renderAttackTelegraph(ctx, ent, controller, viewWidth, camYOffset, cp) {
  const scX = (ent.x - controller.cameraX) + viewWidth / 2;
  const groundY = controller.baseGroundY + camYOffset;
  const dir = ent.facing === 'right' ? 1 : -1;
  const alpha = (cp - 0.3) / 0.7 * 0.7;

  if (ent.subtype === 'archer') {
    // Archer: horizontal line showing projectile path
    const startX = scX + dir * 25;
    const lineY = ent.y - 40 + camYOffset;
    const endX = scX + dir * 450;
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    // Dashed warning line
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrow tip
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(endX, lineY);
    ctx.lineTo(endX - dir * 14, lineY - 7);
    ctx.lineTo(endX - dir * 14, lineY + 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (ent.subtype === 'floater') {
    // Floater: vertical danger column showing downward strike zone
    const colX = ent.x + dir * 35;
    const colScX = (colX - controller.cameraX) + viewWidth / 2;
    const topY = ent.y + camYOffset;
    const colW = 70;
    ctx.save();
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(colScX - colW / 2, topY, colW, groundY - topY);
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(colScX - colW / 2, topY);
    ctx.lineTo(colScX - colW / 2, groundY);
    ctx.moveTo(colScX + colW / 2, topY);
    ctx.lineTo(colScX + colW / 2, groundY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }

  // Default ground melee enemy: horizontal danger zone bar at ground level
  const zoneW = 90;
  const zoneX = scX + dir * 20;
  const barH = 28;
  const barY = groundY - barH;
  ctx.save();
  ctx.globalAlpha = alpha * 0.22;
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(zoneX, barY, dir * zoneW, barH);
  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(zoneX, barY);
  ctx.lineTo(zoneX + dir * zoneW, barY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
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