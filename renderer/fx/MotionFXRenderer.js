export function renderMotionFX(ctx, fx, controller, viewWidth, camYOffset) {
  const scX = (fx.x - controller.cameraX) + viewWidth / 2;
  const scY = fx.y + camYOffset;
  const p = fx.life / fx.maxLife;

  if (fx.type === 'streak') {
    const alpha = Math.max(0, 1 - Math.pow(p, 1.5));
    ctx.save();
    ctx.translate(scX, scY);
    ctx.rotate(fx.angle);
    const head = fx.length * Math.pow(p, 0.3);
    const tail = fx.length * Math.pow(p, 2.0);
    const lines = [
      { y: 0, w: fx.width, l: 1.0 },
      { y: -fx.width * 0.4, w: fx.width * 0.3, l: 0.8 },
      { y: fx.width * 0.4, w: fx.width * 0.3, l: 0.7 },
      { y: -fx.width * 0.7, w: fx.width * 0.15, l: 0.5 },
      { y: fx.width * 0.7, w: fx.width * 0.15, l: 0.6 },
    ];
    ctx.lineCap = 'round';
    for (const line of lines) {
      const h = head * line.l;
      const t = tail * line.l - (fx.length * 0.1);
      if (h <= t) continue;
      const grad = ctx.createLinearGradient(h, 0, t, 0);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'transparent');
      
      const width = line.w * (1 - p * 0.5);
      
      // Layered strokes for glow substitute
      ctx.beginPath();
      ctx.moveTo(h, line.y);
      ctx.lineTo(t, line.y);
      
      ctx.lineWidth = width + 6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
      ctx.stroke();

      ctx.lineWidth = width;
      ctx.strokeStyle = grad;
      ctx.stroke();
    }
    ctx.restore();
  } else if (fx.type === 'arc_swoosh') {
    ctx.save();
    ctx.translate(scX, scY);
    ctx.scale(fx.facing === 'right' ? 1 : -1, fx.squashY || 1);
    const leadIn = Math.pow(p, 0.4);
    const trailIn = Math.pow(p, 2.5);
    const totalAngle = fx.endAngle - fx.startAngle;
    const currentStart = fx.startAngle + trailIn * totalAngle;
    const currentEnd = fx.startAngle + leadIn * totalAngle;
    const segs = 12;
    ctx.lineCap = 'round';
    const isCCW = totalAngle < 0;
    for (let i = 0; i < segs; i++) {
      const t1 = i / segs;
      const t2 = (i + 1) / segs;
      const a1 = currentStart + t1 * (currentEnd - currentStart);
      const a2 = currentStart + t2 * (currentEnd - currentStart);
      const thick = fx.thickness * Math.sin(((t1 + t2) / 2) * Math.PI);
      const globalAlpha = 1 - Math.pow(p, 2);
      const tailFade = Math.pow((t1 + t2) / 2, 1.5);
      const alpha = Math.max(0, globalAlpha * tailFade);
      if (alpha > 0.01 && thick > 0.5) {
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, a1, a2, isCCW);
        
        // Layered strokes for glow
        ctx.lineWidth = thick + 10;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
        ctx.stroke();
        
        ctx.lineWidth = thick;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}