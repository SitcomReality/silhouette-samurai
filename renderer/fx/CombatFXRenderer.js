export function renderCombatFX(ctx, fx, controller, viewWidth, camYOffset) {
  const scX = (fx.x - controller.cameraX) + viewWidth / 2;
  const scY = fx.y + camYOffset;
  const p = fx.life / fx.maxLife;
  const alpha = 1 - p;

  if (fx.type === 'parry_flash') {
    const size = 40 + p * 20;
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Performant layered circles for glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(scX, scY, size + 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(scX, scY, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (fx.type === 'clash_spark') {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const len = 30 + p * 20;
      const tx = scX + Math.cos(angle) * len;
      const ty = scY + Math.sin(angle) * len;
      
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(tx, ty);
      
      // Layered strokes for glow
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.25)';
      ctx.stroke();
      
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffff00';
      ctx.stroke();
    }
    ctx.restore();
  } else if (fx.type === 'damage_spark') {
    ctx.save();
    ctx.translate(scX, scY);
    ctx.rotate(fx.rotation);
    const length = (45 + p * 80) * 3;
    const width = 3.5 * alpha;
    const grad = ctx.createLinearGradient(-length, 0, length, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Core shape (gradient itself provides nice depth without shadowBlur)
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(0, -width);
    ctx.lineTo(length, 0);
    ctx.lineTo(0, width);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}