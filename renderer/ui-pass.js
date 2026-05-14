export function renderUI(ctx, controller, viewWidth, camYOffset) {
  for (const ent of controller.entities) {
    if (ent.state === 'dead') continue;
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    if (scX > 0 && scX < viewWidth) {
      const healthBarY = ent.type === 'crate' 
        ? (ent.height || 50) 
        : (ent.character ? ent.character.height + 20 : 120);
      const scY = ent.y - healthBarY + camYOffset;
      const barW = 36;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(scX - barW/2, scY - 8, barW, 3);
      
      const healthRatio = Math.max(0, ent.health / ent.maxHealth);
      ctx.fillStyle = ent.type === 'crate' ? '#eab308' : '#f43f5e';
      ctx.fillRect(scX - barW/2, scY - 8, barW * healthRatio, 3);
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
}