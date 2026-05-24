export function renderFX(ctx, controller, viewWidth, camYOffset) {
  // Simple character glows (faster than gradients)
  const enemies = controller.entities.filter(e => e.state !== 'dead' && e.type === 'enemy');
  const player = controller.player;
  
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  // Enemy glows
  for (const ent of enemies) {
    const scX = (ent.x - controller.cameraX) + viewWidth / 2;
    const scY = ent.y - (ent.character ? (ent.character.height || 70) * 0.4 : 40) + camYOffset;
    const glowRadius = (ent.scale || 1.0) * 60;
    
    if (ent.flashTimer > 0) {
      const flashP = Math.min(ent.flashTimer / 0.15, 1.0);
      ctx.globalAlpha = 0.5 * flashP;
      ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    } else {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = 'rgba(255, 110, 30, 1.0)';
    }
    
    ctx.beginPath();
    ctx.arc(scX, scY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Player glow (increases with charge)
  if (player.state !== 'dead') {
    const scX = (player.x - controller.cameraX) + viewWidth / 2;
    const scY = player.y - (player.character ? (player.character.height || 70) * 0.4 : 40) + camYOffset;
    const glowRadius = (player.scale || 1.5) * 60;
    
    // Base glow with charge intensity
    const chargeIntensity = player.attackCharging ? Math.min(player.attackChargeTime / 1.2, 1.0) : 0;
    ctx.globalAlpha = 0.12 + chargeIntensity * 0.35;
    ctx.fillStyle = 'rgba(6, 182, 212, 1.0)'; // Theme cyan
    
    ctx.beginPath();
    ctx.arc(scX, scY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // Early viewport culling for effects
  const viewLeft = controller.cameraX - 100;
  const viewRight = controller.cameraX + viewWidth + 100;
  
  for (const fx of controller.visualFx) {
    if (fx.x < viewLeft || fx.x > viewRight) continue;
    
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
      ctx.translate(scX, scY);
      ctx.rotate(fx.rotation);
      
      const length = (45 + p * 80) * 3;
      const width = 3.5 * alpha;
      
      const grad = ctx.createLinearGradient(-length, 0, length, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20 * alpha;
      
      // Draw symmetrical lens flare (two elongated triangles meeting at center)
      ctx.beginPath();
      ctx.moveTo(-length, 0);
      ctx.lineTo(0, -width);
      ctx.lineTo(length, 0);
      ctx.lineTo(0, width);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }
}