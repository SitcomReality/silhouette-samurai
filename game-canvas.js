import { computeContourY, extractSDFSegments } from './sdf-math.js';

export class GameCanvas {
  constructor(canvasElement, controller, themeColor) {
    this.canvas = canvasElement;
    this.controller = controller;
    this.themeColor = themeColor;
    this.ctx = this.canvas.getContext('2d');
    
    this.animationId = null;
    this.lastTime = performance.now();
    
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
    
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  
  setThemeColor(color) {
    this.themeColor = color;
  }

  handleResize() {
    if (!this.canvas.parentElement) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  start() {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.render);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  render(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.controller.update(dt);

    const ctx = this.ctx;
    const canvas = this.canvas;

    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.controller.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.controller.screenShake;
      const shakeY = (Math.random() - 0.5) * this.controller.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    const viewWidth = canvas.width;
    const viewHeight = canvas.height;
    const camYOffset = viewHeight * 0.65 - this.controller.baseGroundY;

    const groundedEntities = this.controller.entities.concat(this.controller.player).filter(e => e.isGrounded);
    const groundedParticles = this.controller.particles.filter(p => p.isGrounded);

    const columns = Math.ceil(viewWidth / 2.0);
    const stepPixels = viewWidth / columns;
    
    ctx.beginPath();
    let firstY = 0;
    for (let i = 0; i <= columns; i++) {
      const cx = i * stepPixels;
      const worldX = this.controller.cameraX + (cx - viewWidth / 2);
      const worldY = computeContourY(worldX, this.controller.baseGroundY, groundedEntities, groundedParticles, this.controller.shockwaves, 20);
      const cy = worldY + camYOffset;
      if (i === 0) {
        firstY = cy;
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.lineTo(viewWidth, viewHeight);
    ctx.lineTo(0, viewHeight);
    ctx.lineTo(0, firstY);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, viewHeight * 0.4, 0, viewHeight);
    gradient.addColorStop(0, `${this.themeColor}20`);
    gradient.addColorStop(1, `${this.themeColor}02`);
    ctx.fillStyle = gradient;
    ctx.fill();

    const allEntities = this.controller.entities.concat(this.controller.player);
    const segments = extractSDFSegments(
      viewWidth, viewHeight, this.controller.cameraX, camYOffset, this.controller.baseGroundY,
      allEntities, this.controller.particles, this.controller.shockwaves, 4.0, 20
    );

    ctx.beginPath();
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = 4;
    ctx.strokeStyle = this.themeColor;
    ctx.shadowColor = this.themeColor;
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowBlur = 3;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    if (this.controller.devMode) {
      const drawSkeletonDebug = (skel, color) => {
        const mapP = (p) => ({
          x: (p.x - this.controller.cameraX) + viewWidth / 2,
          y: p.y + camYOffset
        });

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        const h = mapP(skel.head);
        ctx.beginPath(); ctx.arc(h.x, h.y, skel.headRadius, 0, Math.PI * 2); ctx.stroke();

        const tt = mapP(skel.torsoTop);
        const tb = mapP(skel.torsoBottom);
        ctx.beginPath(); ctx.moveTo(tt.x, tt.y); ctx.lineTo(tb.x, tb.y); ctx.stroke();

        const ls = mapP(skel.leftShoulder), le = mapP(skel.leftElbow), lh = mapP(skel.leftHand);
        ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(le.x, le.y); ctx.lineTo(lh.x, lh.y); ctx.stroke();

        const rs = mapP(skel.rightShoulder), re = mapP(skel.rightElbow), rh = mapP(skel.rightHand);
        ctx.beginPath(); ctx.moveTo(rs.x, rs.y); ctx.lineTo(re.x, re.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();

        const lhip = mapP(skel.leftHip), lk = mapP(skel.leftKnee), lf = mapP(skel.leftFoot);
        ctx.beginPath(); ctx.moveTo(lhip.x, lhip.y); ctx.lineTo(lk.x, lk.y); ctx.lineTo(lf.x, lf.y); ctx.stroke();

        const rhip = mapP(skel.rightHip), rk = mapP(skel.rightKnee), rf = mapP(skel.rightFoot);
        ctx.beginPath(); ctx.moveTo(rhip.x, rhip.y); ctx.lineTo(rk.x, rk.y); ctx.lineTo(rf.x, rf.y); ctx.stroke();

        [tt, tb, le, re, lk, rk].forEach(pt => {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI*2); ctx.fill();
        });
      };

      drawSkeletonDebug(this.controller.player.skeleton, '#38bdf8');
      this.controller.entities.forEach(ent => {
        if (ent.type !== 'crate') {
          drawSkeletonDebug(ent.skeleton, ent.state === 'dead' ? '#64748b' : '#f43f5e');
        } else {
          const scX = (ent.x - this.controller.cameraX) + viewWidth / 2;
          const scY = ent.y - (ent.height || 50) / 2 + camYOffset;
          ctx.strokeStyle = '#eab308';
          ctx.strokeRect(scX - (ent.width || 50)/2, scY - (ent.height || 50)/2, ent.width || 50, ent.height || 50);
        }
      });
    }

    for (const ent of this.controller.entities) {
      if (ent.state === 'dead') continue;
      const scX = (ent.x - this.controller.cameraX) + viewWidth / 2;
      if (scX > 0 && scX < viewWidth) {
        const scY = ent.y - (ent.type === 'crate' ? (ent.height || 50) : 135) + camYOffset;
        const barW = 36;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(scX - barW/2, scY - 8, barW, 3);
        
        const healthRatio = Math.max(0, ent.health / ent.maxHealth);
        ctx.fillStyle = ent.type === 'crate' ? '#eab308' : '#f43f5e';
        ctx.fillRect(scX - barW/2, scY - 8, barW * healthRatio, 3);
      }
    }

    for (const ft of this.controller.floatingTexts) {
      const scX = (ft.x - this.controller.cameraX) + viewWidth / 2;
      const scY = ft.y + camYOffset;
      
      ctx.save();
      ctx.font = `900 ${Math.floor(18 * ft.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 6;
      
      const alpha = ft.life > 0.6 ? (1 - ft.life) / 0.4 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillText(ft.text, scX, scY);
      ctx.restore();
    }

    ctx.restore();
    this.animationId = requestAnimationFrame(this.render);
  }
}