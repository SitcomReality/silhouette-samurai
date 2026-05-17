import { computeContourY } from '../sdf/contour.js';
import { extractSDFSegments } from '../sdf/extraction.js';

export function renderSDF(ctx, canvas, controller, themeColor, viewWidth, viewHeight, camYOffset) {
  const groundedEntities = controller.entities.concat(controller.player).filter(e => e.isGrounded);
  const groundedParticles = controller.particles.filter(p => p.isGrounded);

  const columns = Math.ceil(viewWidth / 2.0);
  const stepPixels = viewWidth / columns;
  
  ctx.beginPath();
  let firstY = 0;
  for (let i = 0; i <= columns; i++) {
    const cx = i * stepPixels;
    const worldX = controller.cameraX + (cx - viewWidth / 2);
    const worldY = computeContourY(worldX, controller.baseGroundY, groundedEntities, groundedParticles, controller.shockwaves, 20, controller);
    const cy = worldY + camYOffset;
    if (i === 0) {
      firstY = cy;
      ctx.moveTo(cx, cy);
    } else {
      ctx.lineTo(cx, cy);
    }
  }
  ctx.lineTo(viewWidth, viewHeight);
  ctx.lineTo(0, viewHeight);
  ctx.lineTo(0, firstY);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
  gradient.addColorStop(0, `${themeColor}20`);
  gradient.addColorStop(1, `${themeColor}02`);
  ctx.fillStyle = gradient;
  ctx.fill();

  const allEntities = controller.entities.concat(controller.player);
  const segments = extractSDFSegments(
    viewWidth, viewHeight, controller.cameraX, camYOffset, controller.baseGroundY,
    allEntities, controller.particles, controller.shockwaves, 4.0, 20, controller
  );

  ctx.beginPath();
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.lineWidth = 4;
  ctx.strokeStyle = themeColor;
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 12;
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.shadowBlur = 3;
  ctx.stroke();
  
  ctx.shadowBlur = 0;

  // Draw orange glow for enemies
  const enemies = controller.entities.filter(e => e.state !== 'dead' && e.type === 'enemy');
  if (enemies.length > 0) {
    const enemySegments = extractSDFSegments(
      viewWidth, viewHeight, controller.cameraX, camYOffset, controller.baseGroundY,
      enemies, [], controller.shockwaves, 4.0, 20, controller
    );

    ctx.beginPath();
    for (let i = 0; i < enemySegments.length; i++) {
      const seg = enemySegments[i];
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ff6600';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}