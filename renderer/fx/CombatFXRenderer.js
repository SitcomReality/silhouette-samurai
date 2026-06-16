export function renderCombatFX(ctx, fx, controller, viewWidth, camYOffset) {
  const scX = (fx.x - controller.cameraX) + viewWidth / 2;
  const scY = fx.y + camYOffset;
  const p = fx.life / fx.maxLife;
  const alpha = 1 - p;

  if (fx.type === 'parry_flash') {
    const size = 40 + p * 20;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(scX, scY, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (fx.type === 'clash_spark') {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const len = 30 + p * 20;
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(scX + Math.cos(angle) * len, scY + Math.sin(angle) * len);
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
    ctx.fillStyle = grad;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 20 * alpha;
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