import { getActiveHitbox } from '../combat/hitbox.js';
import { ATTACK_CONFIG } from '../combat/attacks/config.js';

export function renderDebug(ctx, controller, viewWidth, camYOffset) {
  const drawCharacterDebug = (char, x, y, color) => {
    const scX = (char.core.x - controller.cameraX) + viewWidth / 2;
    const scY = char.core.y + camYOffset;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    // Core torso box
    ctx.strokeRect(scX - char.width/2, scY - char.height/2, char.width, char.height);
    
    // Head circle
    const hx = (char.head.x - controller.cameraX) + viewWidth / 2;
    const hy = char.head.y + camYOffset;
    ctx.beginPath();
    ctx.arc(hx, hy, char.head.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Arm - only if visible
    if (char.arm.length > 5) {
      const ax = (char.arm.origin.x - controller.cameraX) + viewWidth / 2;
      const ay = char.arm.origin.y + camYOffset;
      const bx = ax + Math.cos(char.arm.angle) * char.arm.length;
      const by = ay + Math.sin(char.arm.angle) * char.arm.length;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    
    // Legs
    const legX = scX;
    const legY = scY + char.height / 2;
    
    const leftEndX = legX - 6 + Math.sin(char.legs.leftAngle) * char.legs.length;
    const leftEndY = legY + Math.cos(char.legs.leftAngle) * char.legs.length;
    ctx.beginPath();
    ctx.moveTo(legX - 6, legY);
    ctx.lineTo(leftEndX, leftEndY);
    ctx.stroke();
    
    const rightEndX = legX + 6 + Math.sin(char.legs.rightAngle) * char.legs.length;
    const rightEndY = legY + Math.cos(char.legs.rightAngle) * char.legs.length;
    ctx.beginPath();
    ctx.moveTo(legX + 6, legY);
    ctx.lineTo(rightEndX, rightEndY);
    ctx.stroke();
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