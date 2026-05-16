export function renderFX(ctx, controller, viewWidth, camYOffset) {
  for (const fx of controller.visualFx) {
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
      
      const progress = fx.life / fx.maxLife;
      const alpha = Math.max(0, 1 - Math.pow(progress, 1.5));
      
      ctx.save();
      ctx.translate(scX, scY);
      
      if (fx.angle) {
        ctx.rotate(fx.angle);
      }
      
      ctx.scale(fx.facing === 'right' ? 1 : -1, 1);
      
      ctx.beginPath();
      
      ctx.arc(0, 0, fx.radius * (0.5 + progress * 0.5), -Math.PI/2, Math.PI/2);
      const innerRadius = (fx.radius - fx.thickness) * (0.5 + progress * 0.5);
      const innerOffset = fx.thickness * progress * 2;
      ctx.arc(innerOffset, 0, Math.max(0, innerRadius), Math.PI/2, -Math.PI/2, true);
      
      ctx.fillStyle = fx.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha * 0.8;
      ctx.stroke();
      
      ctx.restore();
    }
  }
}