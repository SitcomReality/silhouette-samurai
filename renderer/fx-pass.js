export function renderFX(ctx, controller, viewWidth, camYOffset) {
  for (const fx of controller.visualFx) {
    const scX = (fx.x - controller.cameraX) + viewWidth / 2;
    const scY = fx.y + camYOffset;
    const progress = fx.life / fx.maxLife;
    const alpha = Math.max(0, 1 - Math.pow(progress, 2));

    ctx.save();
    ctx.translate(scX, scY);
    if (fx.angle !== undefined) ctx.rotate(fx.angle);
    ctx.globalAlpha = alpha;

    if (fx.type === 'thrust') {
      // "Speed Line" style thrust
      const lines = fx.lineCount || 3;
      const length = fx.length * (1 - progress * 0.4);
      
      for (let i = 0; i < lines; i++) {
        const offset = (i - (lines - 1) / 2) * (fx.width / lines);
        const lScale = 1 - Math.abs(i - (lines-1)/2) * 0.3;
        
        const grad = ctx.createLinearGradient(0, 0, -length * lScale, 0);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, fx.color || '#ffffff');
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = (fx.width / lines) * 0.8 * (1 - progress);
        ctx.lineCap = 'round';
        ctx.moveTo(0, offset);
        ctx.lineTo(-length * lScale, offset);
        ctx.stroke();
      }
    } else if (fx.type === 'swoosh') {
      // Arcing Streak - Drawn as a tapered ribbon
      ctx.scale(fx.facing === 'right' ? 1 : -1, 1);
      
      const startAngle = fx.startAngle || -Math.PI * 0.5;
      const endAngle = fx.endAngle || Math.PI * 0.5;
      const span = endAngle - startAngle;
      const radius = fx.radius;
      const thickness = fx.thickness * (1 - progress * 0.5);
      
      // Draw outer arc
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      
      // Draw inner arc (reversed) with a shift to create tapering
      const taperShift = thickness * 0.6;
      ctx.arc(taperShift, 0, Math.max(0, radius - thickness), endAngle, startAngle, true);
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, radius - thickness, 0, 0, radius);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.6, fx.color || '#ffffff');
      grad.addColorStop(1, '#ffffff');

      ctx.fillStyle = grad;
      ctx.shadowColor = fx.color || '#ffffff';
      ctx.shadowBlur = 15 * (1 - progress);
      ctx.fill();

      // Sharp highlight line
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();

    } else if (fx.type === 'impact') {
      // Sharp radial burst
      const count = fx.spikes || 8;
      const radius = fx.radius * (0.5 + progress * 0.5);
      
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + (fx.rotation || 0);
        const len = radius * (0.8 + Math.random() * 0.4);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * (1 - progress);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}