export function renderUI(ctx, controller, viewWidth, camYOffset) {
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    if (scX > 0 && scX < viewWidth) {
      const healthBarY = ent.type === 'crate' 
        ? (ent.height || 25) 
        : (ent.character ? ent.character.height + 20 : 120);
      const scY = ent.y - healthBarY + camYOffset;
      const barW = ent.isBoss ? 80 : 36;
      const barH = ent.isBoss ? 6 : 3;
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(scX - barW/2, scY - 8, barW, barH);
      
      const healthRatio = Math.max(0, ent.health / ent.maxHealth);
      if (ent.type === 'crate') {
        ctx.fillStyle = '#eab308';
      } else if (ent.isBoss) {
        ctx.fillStyle = '#a855f7';
      } else {
        ctx.fillStyle = '#f43f5e';
      }
      ctx.fillRect(scX - barW/2, scY - 8, barW * healthRatio, barH);
    }
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
    ctx.fillRect(10, 10, 200, 120);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 200, 120);
    
    ctx.font = '10px monospace';
    ctx.fillStyle = 'white';
    let y = 25;
    ctx.fillText(`STATE: ${p.state}`, 20, y); y += 15;
    ctx.fillText(`ATTACK: ${p.attackType}`, 20, y); y += 15;
    ctx.fillText(`FRAME: ${Math.floor(p.attackFrameTime * 60)}`, 20, y); y += 15;
    ctx.fillText(`DANCE: ${p.bladeDanceState || 'none'}`, 20, y); y += 15;
    ctx.fillText(`WINDOW: ${p.bladeDanceInputWindow.toFixed(2)}`, 20, y); y += 15;
    ctx.fillText(`COMBO: ${p.combo}`, 20, y); y += 15;
    
    // Blade Dance Timing Indicator
    if (p.bladeDanceState && p.bladeDanceInputWindow > 0) {
      const barW = 100;
      const progress = p.bladeDanceInputWindow / 0.5; // normalized against max window approx
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(20, y, barW, 4);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(20, y, barW * progress, 4);
      ctx.fillText(`PRESS NOW!`, 130, y + 5);
    }
    
    ctx.restore();
  }
}