export function renderFX(ctx, controller, viewWidth, camYOffset) {
  // Stylized enemy core glow: tighter and more performant than radial gradients
  const enemies = controller.entities.filter(e => e.state !== 'dead' && e.type === 'enemy');
  if (enemies.length > 0) {
    ctx.save();
    for (const ent of enemies) {
      const scX = (ent.x - controller.cameraX) + viewWidth / 2;
      // Center glow on the torso
      const scY = ent.y - (ent.character ? (ent.character.height || 70) * 0.5 : 40) + camYOffset;
      const scale = (ent.scale || 1.0);
      const pulse = 0.85 + Math.sin(ent.stateTime * 5) * 0.15;
      const radius = 22 * scale * pulse;
      
      // Performant flat-color circles instead of expensive radial gradients
      ctx.fillStyle = 'rgba(255, 70, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(scX, scY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 130, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(scX, scY, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  for (const fx of controller.visualFx) {
    if (fx.type === 'parry_flash') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const p = fx.life / fx.maxLife;
      const alpha = 1 - p;
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
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const p = fx.life / fx.maxLife;
      const alpha = 1 - p;
      
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
    } else if (fx.type === 'streak') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const p = fx.life / fx.maxLife;
      const alpha = Math.max(0, 1 - Math.pow(p, 1.5));
      
      ctx.save();
      ctx.translate(scX, scY);
      ctx.rotate(fx.angle);
      
      const head = fx.length * Math.pow(p, 0.3);
      const tail = fx.length * Math.pow(p, 2.0);
      
      const lines = [
          { y: 0, w: fx.width, l: 1.0 },
          { y: -fx.width*0.4, w: fx.width*0.3, l: 0.8 },
          { y: fx.width*0.4, w: fx.width*0.3, l: 0.7 },
          { y: -fx.width*0.7, w: fx.width*0.15, l: 0.5 },
          { y: fx.width*0.7, w: fx.width*0.15, l: 0.6 },
      ];
      
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12 * alpha;
      
      for (const line of lines) {
          const h = head * line.l;
          const t = tail * line.l - (fx.length * 0.1);
          
          if (h <= t) continue;
          
          const grad = ctx.createLinearGradient(h, 0, t, 0);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.moveTo(h, line.y);
          ctx.lineTo(t, line.y);
          
          ctx.lineWidth = line.w * (1 - p * 0.5);
          ctx.strokeStyle = grad;
          ctx.stroke();
      }
      
      ctx.restore();
    } else if (fx.type === 'arc_swoosh') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      
      const p = fx.life / fx.maxLife; 
      
      ctx.save();
      ctx.translate(scX, scY);
      ctx.scale(fx.facing === 'right' ? 1 : -1, fx.squashY || 1);
      
      const leadIn = Math.pow(p, 0.4);
      const trailIn = Math.pow(p, 2.5);
      
      const totalAngle = fx.endAngle - fx.startAngle;
      const currentStart = fx.startAngle + trailIn * totalAngle;
      const currentEnd = fx.startAngle + leadIn * totalAngle;
      
      const segs = 30;
      ctx.lineCap = 'round';
      
      for(let i = 0; i < segs; i++) {
          const t1 = i / segs;
          const t2 = (i + 1) / segs;
          
          const a1 = currentStart + t1 * (currentEnd - currentStart);
          const a2 = currentStart + t2 * (currentEnd - currentStart);
          
          const thick = fx.thickness * Math.sin(((t1 + t2) / 2) * Math.PI);
          
          const globalAlpha = 1 - Math.pow(p, 2);
          const tailFade = Math.pow((t1 + t2) / 2, 1.5);
          const alpha = Math.max(0, globalAlpha * tailFade);
          
          if (alpha > 0.01 && thick > 0.5) {
              ctx.beginPath();
              const isCCW = totalAngle < 0;
              ctx.arc(0, 0, fx.radius, a1, a2, isCCW);
              ctx.lineWidth = thick;
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 15 * alpha;
              ctx.stroke();
          }
      }
      
      ctx.restore();
    } else if (fx.type === 'damage_spark') {
      const scX = (fx.x - controller.cameraX) + viewWidth / 2;
      const scY = fx.y + camYOffset;
      const p = fx.life / fx.maxLife;
      const alpha = 1 - p;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 25;
      
      // Draw 6 spikes radiating from center
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + (fx.rotation || 0);
        const len = (20 + p * 15) * (1 + Math.sin(p * Math.PI) * 0.3);
        ctx.beginPath();
        ctx.moveTo(scX, scY);
        ctx.lineTo(scX + Math.cos(angle) * len, scY + Math.sin(angle) * len);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
}