import { computeContourY } from '../sdf/contour.js';
import { extractSDFSegments } from '../sdf/extraction.js';

export function renderSDF(ctx, canvas, controller, themeColor, viewWidth, viewHeight, camYOffset) {
  const allEntities = controller.entities.concat(controller.player);
  const groundedEntities = allEntities.filter(e => e.isGrounded);
  const groundedParticles = controller.particles.filter(p => p.isGrounded);
  const floatingEntities = allEntities.filter(e => !e.isGrounded);
  const floatingParticles = controller.particles.filter(p => !p.isGrounded);

  // 1. Build Grounded Silhouette (Upper Envelope)
  // This ensures the fill and outline perfectly match for everything fused to the floor,
  // preventing "curtain" leaks or streaks under overhangs.
  const columns = Math.ceil(viewWidth / 2.0);
  const stepPixels = viewWidth / columns;
  
  const groundedPath = new Path2D();
  let firstY = 0;
  for (let i = 0; i <= columns; i++) {
    const cx = i * stepPixels;
    const worldX = controller.cameraX + (cx - viewWidth / 2);
    const worldY = computeContourY(worldX, controller.baseGroundY, groundedEntities, groundedParticles, controller.shockwaves, 20, controller);
    const cy = worldY + camYOffset;
    if (i === 0) {
      firstY = cy;
      groundedPath.moveTo(cx, cy);
    } else {
      groundedPath.lineTo(cx, cy);
    }
  }

  // 2. Render Grounded Fill
  const fillPath = new Path2D(groundedPath);
  fillPath.lineTo(viewWidth, viewHeight);
  fillPath.lineTo(0, viewHeight);
  fillPath.closePath();

  const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
  gradient.addColorStop(0, `${themeColor}20`);
  gradient.addColorStop(1, `${themeColor}02`);
  ctx.fillStyle = gradient;
  ctx.fill(fillPath);

  // 3. Render Grounded Outline (Contour)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = themeColor;
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 12;
  ctx.stroke(groundedPath);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.shadowBlur = 3;
  ctx.stroke(groundedPath);
  ctx.restore();

  // 4. Render Floating Objects (Full Silhouette)
  // These are handled via Marching Squares to show their complete shape since they 
  // aren't fused into the ground height-map silhouette.
  if (floatingEntities.length > 0 || floatingParticles.length > 0) {
    const segments = extractSDFSegments(
      viewWidth, viewHeight, controller.cameraX, camYOffset, controller.baseGroundY,
      floatingEntities, floatingParticles, [], 5.0, 16, controller
    );

    if (segments.length > 0) {
      ctx.save();
      ctx.beginPath();
      for (const seg of segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = themeColor;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowBlur = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}