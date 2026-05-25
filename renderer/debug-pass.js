import { getActiveHitbox } from '../combat/hitbox.js';

export function renderDebug(ctx, controller, viewWidth, camYOffset) {
  const drawCharacterDebug = (char, entity, color) => {
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

    // Hurtbox rectangle (centered roughly around the character body)
    const hw = (char.width || 30);
    const hh = (char.height || 70);
    const centerX = (entity.x - controller.cameraX) + viewWidth / 2;
    const centerY = (entity.y - 40) + camYOffset; // match collision checks which offset by ~40
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#10b981'; // green tint for hurtbox
    ctx.fillRect(centerX - hw/2, centerY - hh/2, hw, hh);
    ctx.restore();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - hw/2, centerY - hh/2, hw, hh);
  };

  // Helper to draw frame-data based hitbox (used by active attack frames)
  const drawFrameHitbox = (entity, frameData, frameTime, colorFill = 'rgba(255,0,0,0.25)', colorStroke = '#ff4444') => {
    if (!frameData) return;
    const currentFrame = Math.floor(frameTime * 60);
    if (!frameData.isActive(currentFrame)) return;
    
    // Import the actual getHitbox function to ensure debug visuals match game logic perfectly
    const hitbox = getActiveHitbox(entity, entity.attackType, frameTime / frameData.getDuration(), frameData);
    if (!hitbox) return;

    const hx = (hitbox.x - controller.cameraX) + viewWidth / 2;
    const hy = hitbox.y + camYOffset;
    ctx.fillStyle = colorFill;
    ctx.fillRect(hx - hitbox.width/2, hy - hitbox.height/2, hitbox.width, hitbox.height);
    ctx.strokeStyle = colorStroke;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(hx - hitbox.width/2, hy - hitbox.height/2, hitbox.width, hitbox.height);
  };

  // Player debug (character + hurtbox + active hitbox if attacking)
  if (controller.player.character) {
    drawCharacterDebug(controller.player.character, controller.player, '#38bdf8');
    
    if (controller.player.state === 'attack' && controller.player.attackFrameData) {
      drawFrameHitbox(controller.player, controller.player.attackFrameData, controller.player.attackFrameTime, 'rgba(255,0,0,0.35)', '#ff0000');
    }
  }
  
  // Entities: draw character debug, hurtboxes and their active hitboxes when attacking
  controller.entities.forEach(ent => {
    if (ent.type !== 'crate' && ent.character) {
      const color = ent.state === 'dead' ? '#64748b' : '#f43f5e';
      drawCharacterDebug(ent.character, ent, color);

      if (ent.state === 'attack' && ent.attackFrameData) {
        drawFrameHitbox(ent, ent.attackFrameData, ent.attackFrameTime, 'rgba(255,0,0,0.25)', '#ff4444');
      }
    } else if (ent.type === 'crate') {
      const scX = (ent.x - controller.cameraX) + viewWidth / 2;
      const scY = ent.y - (ent.height || 50) / 2 + camYOffset;
      ctx.strokeStyle = '#eab308';
      ctx.strokeRect(scX - (ent.width || 50)/2, scY - (ent.height || 50)/2, ent.width || 50, ent.height || 50);
    }
  });
}