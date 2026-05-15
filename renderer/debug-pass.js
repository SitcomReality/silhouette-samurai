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
}