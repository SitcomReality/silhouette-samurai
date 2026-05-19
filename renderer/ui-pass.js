export function renderUI(ctx, controller, viewWidth, camYOffset) {
  // Batch health bar rendering for better performance
  const healthBars = [];
  
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    if (scX > -50 && scX < viewWidth + 50) {
      const healthBarY = ent.type === 'crate' 
        ? (ent.height || 25) 
        : (ent.character ? ent.character.height + 20 : 120);
      const scY = ent.y - healthBarY + camYOffset;
      const barW = ent.isBoss ? 80 : 36;
      const barH = ent.isBoss ? 6 : 3;
      const healthRatio = Math.max(0, ent.health / ent.maxHealth);
      
      let color;
      if (ent.type === 'crate') color = '#eab308';
      else if (ent.isBoss) color = '#a855f7';
      else color = '#f43f5e';
      
      healthBars.push({ scX, scY, barW, barH, healthRatio, color });
    }
  }
  
  // Draw all backgrounds in one pass
  ctx.fillStyle = '#1e293b';
  for (const bar of healthBars) {
    ctx.fillRect(bar.scX - bar.barW/2, bar.scY - 8, bar.barW, bar.barH);
  }
  
  // Draw all health fills
  for (const bar of healthBars) {
    ctx.fillStyle = bar.color;
    ctx.fillRect(bar.scX - bar.barW/2, bar.scY - 8, bar.barW * bar.healthRatio, bar.barH);
  }

  for (const ft of controller.floatingTexts) {
    const scX = (ft.x - controller.cameraX) + viewWidth / 2;
    const scY = ft.y + camYOffset;
    
    ctx.save();
    ctx.font = `900 ${Math.floor(18 * ft.scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 6;
    
    const alpha = ft.life > 0.6 ? (1 - ft.life) / 0.4 : 1;
    ctx.globalAlpha = alpha;
    ctx.fillText(ft.text, scX, scY);
    ctx.restore();
  }

  // Combat Status Overlay (only when devMode or tuner is active)
  if (controller.devMode || controller.tunerActive) {
    const p = controller.player;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, 10, 200, 150);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 200, 150);
    
    ctx.font = '10px monospace';
    ctx.fillStyle = 'white';
    let y = 25;
    ctx.fillText(`STATE: ${p.state}`, 20, y); y += 15;
    ctx.fillText(`ATTACK: ${p.attackType}`, 20, y); y += 15;
    ctx.fillText(`FRAME: ${Math.floor(p.attackFrameTime * 60)}`, 20, y); y += 15;
    ctx.fillText(`COMBO: ${p.combo}`, 20, y); y += 15;
    
    // Charge meter
    if (p.attackCharging) {
      ctx.fillText(`CHARGING...`, 20, y); y += 15;
      const chargeBarW = 100;
      const chargeProgress = Math.min(p.attackChargeTime / 1.2, 1.0);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(20, y, chargeBarW, 6);
      ctx.fillStyle = chargeProgress >= 1.0 ? '#ec4899' : '#06b6d4';
      ctx.fillRect(20, y, chargeBarW * chargeProgress, 6);
      y += 10;
    }
    
    // Combo Decay
    if (p.combo > 0) {
      const barW = 100;
      const decayTime = 1.4;
      const progress = Math.max(0, (decayTime - p.stateTime) / decayTime);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(20, y, barW, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(20, y, barW * progress, 4);
      if (p.combo >= 5) {
        ctx.fillText(`FINISHER READY!`, 130, y + 5);
      }
    }
    
    ctx.restore();
  }
}