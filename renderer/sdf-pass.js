import { computeContourY } from '../sdf/contour.js';
import { extractSDFSegments } from '../sdf/extraction.js';

export function renderSDF(ctx, canvas, controller, themeColor, viewWidth, viewHeight, camYOffset) {
  const allEntities = controller.entities.concat(controller.player);
  
  // Extract both segments for outline and the raw grid for a more accurate multi-span fill
  const sdfData = extractSDFSegments(
    viewWidth, viewHeight, controller.cameraX, camYOffset, controller.baseGroundY,
    allEntities, controller.particles, controller.shockwaves, 4.0, 20, controller
  );

  const { segments, grid, cols, rows, step, rowStride } = sdfData;

  // 1. Render the Fills (using scanline-like vertical spans to correctly handle overhangs and gaps)
  ctx.beginPath();
  for (let c = 0; c <= cols; c++) {
    const cOffset = c * rowStride;
    const x = c * step;
    let inSpan = false;
    let spanStartY = 0;

    for (let r = 0; r <= rows; r++) {
      const v = grid[cOffset + r];
      const isInside = v <= 0;

      if (!inSpan && isInside) {
        // Start of a span. Interpolate Y for a smooth transition.
        if (r > 0) {
          const vPrev = grid[cOffset + r - 1];
          const t = vPrev / (vPrev - v);
          spanStartY = (r - 1 + t) * step;
        } else {
          spanStartY = r * step;
        }
        inSpan = true;
      } else if (inSpan && !isInside) {
        // End of a span. Interpolate Y.
        let spanEndY;
        const vPrev = grid[cOffset + r - 1];
        const t = vPrev / (vPrev - v);
        spanEndY = (r - 1 + t) * step;
        
        ctx.rect(x, spanStartY, step + 0.1, spanEndY - spanStartY);
        inSpan = false;
      }
    }
    // Handle spans that reach the bottom of the grid (like the ground)
    if (inSpan) {
      ctx.rect(x, spanStartY, step + 0.1, (rows * step) - spanStartY);
    }
  }

  const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
  gradient.addColorStop(0, `${themeColor}20`);
  gradient.addColorStop(1, `${themeColor}02`);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 2. Render the Outlines (Marching Squares segments)
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
}