export function renderFX(ctx, controller, viewWidth, camYOffset) {
  for (const fx of controller.visualFx) {
    if (fx.life < 0) continue;

    if (fx.type === 'thrust') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const progress = fx.life / fx.maxLife;
      const alpha = 1 - progress;

      ctx.save();
      ctx.translate(scX, scY);
      ctx.rotate(fx.angle);
      
      const length = fx.length * (1 - progress * 0.5);
      const width = fx.width * (1 - progress);

      const grad = ctx.createLinearGradient(0, 0, -length, 0);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, -width / 2);
      ctx.lineTo(-length, width / 2);
      ctx.closePath();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    } else if (fx.type === 'swoosh') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      
      const rawProgress = fx.life / fx.maxLife;
      const progress = 1 - Math.pow(1 - rawProgress, 3);
      const alpha = Math.max(0, 1 - Math.pow(rawProgress, 2));
      
      ctx.save();
      ctx.translate(scX, scY);
      
      if (fx.angle) {
        ctx.rotate(fx.angle);
      }
      
      ctx.scale(fx.facing === 'right' ? 1 : -1, 1);
      
      const grad = ctx.createRadialGradient(0, 0, fx.radius * 0.4, 0, 0, fx.radius * 1.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, fx.color || '#38bdf8');
      grad.addColorStop(1, '#a855f7');
      
      ctx.beginPath();
      const sweepBase = Math.PI * 1.2;
      const currentAngle = -Math.PI * 0.6 + sweepBase * progress;
      const tailAngle = -Math.PI * 0.6 + sweepBase * Math.max(0, progress - 0.4);
      
      const currentRadius = fx.radius * (0.8 + progress * 0.4);
      
      ctx.arc(0, 0, currentRadius, tailAngle, currentAngle);
      
      const maxThickness = fx.thickness * (1 - rawProgress);
      const innerRadiusLead = currentRadius - maxThickness;
      
      ctx.lineTo(Math.cos(currentAngle) * innerRadiusLead, Math.sin(currentAngle) * innerRadiusLead);
      ctx.arc(0, 0, currentRadius, currentAngle, tailAngle, true);
      
      ctx.fillStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = fx.color || '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(Math.cos(currentAngle) * currentRadius, Math.sin(currentAngle) * currentRadius);
      ctx.lineTo(Math.cos(currentAngle) * innerRadiusLead, Math.sin(currentAngle) * innerRadiusLead);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * alpha;
      ctx.stroke();
      
      ctx.restore();
    } else if (fx.type === 'tipper_flash') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const progress = fx.life / fx.maxLife;
      
      ctx.save();
      ctx.translate(scX, scY);
      ctx.rotate(progress * Math.PI);
      
      const alpha = 1 - Math.pow(progress, 2);
      ctx.globalAlpha = alpha;
      
      ctx.beginPath();
      const r = fx.radius * (0.5 + progress * 0.5);
      
      for(let i=0; i<8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = (i % 2 === 0) ? r : r * 0.3;
        if (i === 0) ctx.moveTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
        else ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
      }
      ctx.closePath();
      
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * alpha;
      ctx.stroke();
      
      ctx.restore();
    }
  }
}