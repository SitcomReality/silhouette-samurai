import { renderSDF } from './sdf-pass.js';
import { renderDebug } from './debug-pass.js';
import { renderUI } from './ui-pass.js';

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

    renderSDF(ctx, canvas, this.controller, this.themeColor, viewWidth, viewHeight, camYOffset);

    if (this.controller.devMode) {
      renderDebug(ctx, this.controller, viewWidth, camYOffset);
    }

    renderUI(ctx, this.controller, viewWidth, camYOffset);

    ctx.restore();
    this.animationId = requestAnimationFrame(this.render);
  }
}