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

  const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
  gradient.addColorStop(0, `${themeColor}20`);
  gradient.addColorStop(1, `${themeColor}02`);
  ctx.fillStyle = gradient;

  // 1. Render the Fills (using scanline-like vertical spans to correctly handle overhangs and gaps)
  // Replaced batched path rects with individual fillRects to bypass heavy tessellation in some browsers
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
          ctx.fillRect(x, spanStartY, step + 0.1, height);
        }
        inSpan = false;
      }
    }
    if (inSpan) {
      const height = (rows * step) - spanStartY;
      if (height > 0.5) {
        ctx.fillRect(x, spanStartY, step + 0.1, height);
      }
    }
  }

  // 2. Chain segments into continuous polylines for better performance
  const polylines = chainSegments(segments);
  
  // 3. Render outlines with layered strokes (no shadowBlur for Firefox performance)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Batch all polylines into a single path for massive stroke performance improvement
  ctx.beginPath();
  for (const polyline of polylines) {
    ctx.moveTo(polyline[0].x, polyline[0].y);
    for (let i = 1; i < polyline.length; i++) {
      ctx.lineTo(polyline[i].x, polyline[i].y);
    }
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
  
  ctx.globalAlpha = 1.0;
}

// Chain connected segments into continuous polylines (Optimized O(N) approach)
function chainSegments(segments) {
  if (segments.length === 0) return [];
  
  const ptMap = new Map();
  const getKey = (x, y) => `${Math.round(x * 100)},${Math.round(y * 100)}`;
  
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const k1 = getKey(s.x1, s.y1);
    const k2 = getKey(s.x2, s.y2);
    
    if (!ptMap.has(k1)) ptMap.set(k1, []);
    ptMap.get(k1).push({ idx: i, other: s.x2, otherY: s.y2, otherK: k2 });
    
    if (!ptMap.has(k2)) ptMap.set(k2, []);
    ptMap.get(k2).push({ idx: i, other: s.x1, otherY: s.y1, otherK: k1 });
  }
  
  const used = new Uint8Array(segments.length);
  const polylines = [];
  
  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    
    const polyline = [{ x: segments[i].x1, y: segments[i].y1 }];
    let currentK = getKey(segments[i].x2, segments[i].y2);
    polyline.push({ x: segments[i].x2, y: segments[i].y2 });
    used[i] = 1;
    
    while (true) {
      const connections = ptMap.get(currentK);
      if (!connections) break;
      
      let found = false;
      for (let j = 0; j < connections.length; j++) {
        const conn = connections[j];
        if (!used[conn.idx]) {
          used[conn.idx] = 1;
          polyline.push({ x: conn.other, y: conn.otherY });
          currentK = conn.otherK;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    
    // Extend chain backward
    currentK = getKey(segments[i].x1, segments[i].y1);
    while (true) {
      const connections = ptMap.get(currentK);
      if (!connections) break;
      
      let found = false;
      for (let j = 0; j < connections.length; j++) {
        const conn = connections[j];
        if (!used[conn.idx]) {
          used[conn.idx] = 1;
          polyline.unshift({ x: conn.other, y: conn.otherY });
          currentK = conn.otherK;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    
    polylines.push(polyline);
  }
  
  return polylines;
}