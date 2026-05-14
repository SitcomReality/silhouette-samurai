import React from 'react';
import { createRoot } from 'react-dom/client';

const Root = () => {
  React.useEffect(() => {
    const openBtn = document.getElementById('open-sandbox');
    const startBtn = document.getElementById('start-sim');
    const sandbox = document.getElementById('sandbox');
    const canvas = document.getElementById('demo-canvas');

    openBtn?.addEventListener('click', () => {
      if (!sandbox) return;
      sandbox.style.display = sandbox.style.display === 'block' ? 'none' : 'block';
    });

    let raf = 0;
    let t0 = performance.now();
    let ctx = canvas?.getContext?.('2d') || null;

    startBtn?.addEventListener('click', () => {
      if (!ctx || !canvas) return;
      if (raf) { cancelAnimationFrame(raf); raf = 0; startBtn.textContent = 'Start Demo Animation'; return; }
      startBtn.textContent = 'Stop Demo Animation';
      const render = (t) => {
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;
        ctx.clearRect(0,0,w,h);

        // simple animated contour-like demo: moving sine ground + neon stroke
        const theme = '#06b6d4';
        ctx.fillStyle = '#071022';
        ctx.fillRect(0,0,w,h);

        ctx.beginPath();
        const base = h * 0.65;
        for (let x=0;x<=w;x+=2) {
          const u = x / w;
          const y = base + Math.sin((x + t*0.15) * 0.02) * 14 + Math.cos((x * 0.01) + t*0.002) * 8;
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.lineTo(w,h);
        ctx.lineTo(0,h);
        ctx.closePath();

        const g = ctx.createLinearGradient(0,0,0,h);
        g.addColorStop(0, theme + '20');
        g.addColorStop(1, theme + '02');
        ctx.fillStyle = g;
        ctx.fill();

        // stroke neon monoline
        ctx.lineWidth = 6;
        ctx.strokeStyle = theme;
        ctx.shadowColor = theme;
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.shadowBlur = 2;
        ctx.stroke();

        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return React.createElement('div');
};

createRoot(document.getElementById('root')).render(React.createElement(Root));