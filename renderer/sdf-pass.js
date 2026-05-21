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
        if (r > 0) {
          const vPrev = grid[cOffset + r - 1];
          const t = vPrev / (vPrev - v);
          spanStartY = (r - 1 + t) * step;
        } else {
          spanStartY = r * step;
        }
        inSpan = true;
      } else if (inSpan && !isInside) {
        const vPrev = grid[cOffset + r - 1];
        const t = vPrev / (vPrev - v);
        const spanEndY = (r - 1 + t) * step;
        
        const height = spanEndY - spanStartY;
        if (height > 0.5) { // Skip tiny slivers
          ctx.rect(x, spanStartY, step + 0.1, height);
        }
        inSpan = false;
      }
    }
    if (inSpan) {
      const height = (rows * step) - spanStartY;
      if (height > 0.5) {
        ctx.rect(x, spanStartY, step + 0.1, height);
      }
    }
  }

  const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
  gradient.addColorStop(0, `${themeColor}20`);
  gradient.addColorStop(1, `${themeColor}02`);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 2. Chain segments into continuous polylines for better performance
  const polylines = chainSegments(segments);
  
  // 3. Render outlines with layered strokes (no shadowBlur for Firefox performance)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (const polyline of polylines) {
    ctx.beginPath();
    ctx.moveTo(polyline[0].x, polyline[0].y);
    for (let i = 1; i < polyline.length; i++) {
      ctx.lineTo(polyline[i].x, polyline[i].y);
    }
    
    // Outer glow layer
    ctx.lineWidth = 8;
    ctx.strokeStyle = themeColor;
    ctx.globalAlpha = 0.12;
    ctx.stroke();
    
    // Medium glow layer
    ctx.lineWidth = 5;
    ctx.strokeStyle = themeColor;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    
    // Core colored line
    ctx.lineWidth = 3;
    ctx.strokeStyle = themeColor;
    ctx.globalAlpha = 1.0;
    ctx.stroke();
    
    // Inner white highlight
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 1.0;
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1.0;
}

// Chain connected segments into continuous polylines
function chainSegments(segments) {
  if (segments.length === 0) return [];
  
  const epsilon = 0.01;
  const used = new Set();
  const polylines = [];
  
  const pointsEqual = (p1, p2) => 
    Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
  
  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;
    
    const chain = [
      { x: segments[i].x1, y: segments[i].y1 },
      { x: segments[i].x2, y: segments[i].y2 }
    ];
    used.add(i);
    
    // Extend chain forward
    let extended = true;
    while (extended) {
      extended = false;
      const lastPoint = chain[chain.length - 1];
      
      for (let j = 0; j < segments.length; j++) {
        if (used.has(j)) continue;
        
        const seg = segments[j];
        if (pointsEqual(lastPoint, { x: seg.x1, y: seg.y1 })) {
          chain.push({ x: seg.x2, y: seg.y2 });
          used.add(j);
          extended = true;
          break;
        } else if (pointsEqual(lastPoint, { x: seg.x2, y: seg.y2 })) {
          chain.push({ x: seg.x1, y: seg.y1 });
          used.add(j);
          extended = true;
          break;
        }
      }
    }
    
    // Extend chain backward
    extended = true;
    while (extended) {
      extended = false;
      const firstPoint = chain[0];
      
      for (let j = 0; j < segments.length; j++) {
        if (used.has(j)) continue;
        
        const seg = segments[j];
        if (pointsEqual(firstPoint, { x: seg.x2, y: seg.y2 })) {
          chain.unshift({ x: seg.x1, y: seg.y1 });
          used.add(j);
          extended = true;
          break;
        } else if (pointsEqual(firstPoint, { x: seg.x1, y: seg.y1 })) {
          chain.unshift({ x: seg.x2, y: seg.y2 });
          used.add(j);
          extended = true;
          break;
        }
      }
    }
    
    polylines.push(chain);
  }
  
  return polylines;
}