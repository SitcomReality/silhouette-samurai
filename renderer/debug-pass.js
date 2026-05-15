import { getActiveHitbox } from '../combat/hitbox.js';
import { ATTACK_CONFIG } from '../combat/attacks/config.js';

export function renderDebug(ctx, controller, viewWidth, camYOffset) {
  const drawCharacterDebug = (char, x, y, color) => {
    if (!char.world) return;
    const w = char.world;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    // Core capsule
    const bx1 = (w.bodyBot.x - controller.cameraX) + viewWidth / 2;
    const by1 = w.bodyBot.y + camYOffset;
    const bx2 = (w.bodyTop.x - controller.cameraX) + viewWidth / 2;
    const by2 = w.bodyTop.y + camYOffset;
    
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.lineTo(bx2, by2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(bx1, by1, w.bodyThickness, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(bx2, by2, w.bodyThickness, 0, Math.PI * 2);
    ctx.stroke();
    
    // Head circle
    const hx = (w.head.x - controller.cameraX) + viewWidth / 2;
    const hy = w.head.y + camYOffset;
    ctx.beginPath();
    ctx.arc(hx, hy, w.head.r, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bulges
    if (w.bulgeA.r > 0.1) {
      const ax = (w.bulgeA.x - controller.cameraX) + viewWidth / 2;
      const ay = w.bulgeA.y + camYOffset;
      ctx.beginPath();
      ctx.arc(ax, ay, w.bulgeA.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx2, by2);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
    
    if (w.bulgeB.r > 0.1) {
      const bx = (w.bulgeB.x - controller.cameraX) + viewWidth / 2;
      const by = w.bulgeB.y + camYOffset;
      ctx.beginPath();
      ctx.arc(bx, by, w.bulgeB.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx2, by2);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  };

  // Draw player debug capsule and active hitbox if attacking
  if (controller.player.character) {
    drawCharacterDebug(controller.player.character, controller.player.x, controller.player.y, '#38bdf8');
    
    if (controller.player.state === 'attack') {
      const progress = 1 - controller.player.attackTimer / ATTACK_CONFIG[controller.player.attackType].duration;
      const hitbox = getActiveHitbox(controller.player, controller.player.attackType, progress);
      if (hitbox) {
        const hx = (hitbox.x - controller.cameraX) + viewWidth / 2;
        const hy = hitbox.y + camYOffset;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(hx - hitbox.width/2, hy - hitbox.height/2, hitbox.width, hitbox.height);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(hx - hitbox.width/2, hy - hitbox.height/2, hitbox.width, hitbox.height);
      }
    }
  }
  
  // Draw other entities
  controller.entities.forEach(ent => {
    if (ent.type !== 'crate' && ent.character) {
      drawCharacterDebug(ent.character, ent.x, ent.y, ent.state === 'dead' ? '#64748b' : '#f43f5e');
    } else if (ent.type === 'crate') {
      const scX = (ent.x - controller.cameraX) + viewWidth / 2;
      const scY = ent.y - (ent.height || 50) / 2 + camYOffset;
      ctx.strokeStyle = '#eab308';
      ctx.strokeRect(scX - (ent.width || 50)/2, scY - (ent.height || 50)/2, ent.width || 50, ent.height || 50);
    }
  });

  // Draw intro text layout when active and devMode is on so you can see placement
  if (controller.devMode && controller.intro && controller.intro.active && controller.intro.currentLayout) {
    const layout = controller.intro.currentLayout;
    // Bounding box in neon color
    const leftWorld = layout.x;
    const rightWorld = layout.x + layout.width;
    const topWorld = layout.y - layout.height;
    const bottomWorld = layout.y;
    const left = (leftWorld - controller.cameraX) + viewWidth / 2;
    const right = (rightWorld - controller.cameraX) + viewWidth / 2;
    const top = topWorld + camYOffset;
    const bottom = bottomWorld + camYOffset;

    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,2]);
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.setLineDash([]);

    // Draw each glyph alpha as a low-res bitmap for inspection
    for (const g of layout.glyphs) {
      if (!g.data) continue;
      const glyphXWorld = layout.x + g.offsetX;
      const glyphYWorld = layout.y + g.offsetY;
      const screenX = Math.round((glyphXWorld - controller.cameraX) + viewWidth / 2);
      const screenY = Math.round(glyphYWorld + camYOffset);

      // Create an ImageData and populate RGBA using glyph alpha as A
      try {
        const w = g.width, h = g.height;
        if (w <= 0 || h <= 0) continue;
        const img = ctx.createImageData(w, h);
        for (let i = 0; i < w * h; i++) {
          const a = g.data[i]; // 0-255
          img.data[i * 4 + 0] = 255;
          img.data[i * 4 + 1] = 255;
          img.data[i * 4 + 2] = 255;
          img.data[i * 4 + 3] = a;
        }
        // Draw the glyph image with slight tint
        ctx.globalAlpha = 0.9;
        ctx.putImageData(img, screenX, screenY - h);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.strokeRect(screenX + 0.5, screenY - h + 0.5, w, h);
      } catch (e) {
        // If putImageData fails (some contexts), fallback to a simple marker
        ctx.fillStyle = 'rgba(0,255,255,0.6)';
        ctx.fillRect(screenX, screenY, 2, 2);
      }
    }

    // Draw baseline marker
    const baselineX = (layout.x - controller.cameraX) + viewWidth / 2;
    const baselineY = layout.y + camYOffset;
    ctx.strokeStyle = 'rgba(0,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(baselineX - 20, baselineY);
    ctx.lineTo(baselineX + layout.width + 20, baselineY);
    ctx.stroke();

    ctx.restore();
  }
}