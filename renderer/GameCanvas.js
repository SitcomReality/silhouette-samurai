import { renderSDF } from './sdf-pass.js';
import { renderDebug } from './debug-pass.js';
import { renderUI } from './ui-pass.js';
import { renderFX } from './fx-pass.js';

export class GameCanvas {
  constructor(containerElement, controller, themeColor) {
    this.container = containerElement;
    this.controller = controller;
    this.themeColor = themeColor;
    
    this.bgCanvas = document.getElementById('bg-canvas');
    this.sdfCanvas = document.getElementById('sdf-canvas');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.uiCanvas = document.getElementById('ui-canvas');
    
    this.bgCtx = this.bgCanvas.getContext('2d', { alpha: false });
    this.sdfCtx = this.sdfCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.uiCtx = this.uiCanvas.getContext('2d');
    
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
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    [this.bgCanvas, this.sdfCanvas, this.fxCanvas, this.uiCanvas].forEach(c => {
      c.width = width;
      c.height = height;
    });
    
    this.bgCtx.fillStyle = '#090d16';
    this.bgCtx.fillRect(0, 0, width, height);
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

    const viewWidth = this.sdfCanvas.width;
    const viewHeight = this.sdfCanvas.height;
    
    this.sdfCtx.clearRect(0, 0, viewWidth, viewHeight);
    this.fxCtx.clearRect(0, 0, viewWidth, viewHeight);
    this.uiCtx.clearRect(0, 0, viewWidth, viewHeight);

    let shakeX = 0;
    let shakeY = 0;
    if (this.controller.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.controller.screenShake;
      shakeY = (Math.random() - 0.5) * this.controller.screenShake;
      
      this.sdfCtx.save();
      this.fxCtx.save();
      this.uiCtx.save();
      
      this.sdfCtx.translate(shakeX, shakeY);
      this.fxCtx.translate(shakeX, shakeY);
      this.uiCtx.translate(shakeX, shakeY);
    }

    const camYOffset = viewHeight * 0.65 - this.controller.baseGroundY;

    renderSDF(this.sdfCtx, this.sdfCanvas, this.controller, this.themeColor, viewWidth, viewHeight, camYOffset);

    renderFX(this.fxCtx, this.controller, viewWidth, camYOffset);

    if (this.controller.devMode) {
      renderDebug(this.uiCtx, this.controller, viewWidth, camYOffset);
    }

    renderUI(this.uiCtx, this.controller, viewWidth, camYOffset);

    if (shakeX !== 0 || shakeY !== 0) {
      this.sdfCtx.restore();
      this.fxCtx.restore();
      this.uiCtx.restore();
    }

    this.animationId = requestAnimationFrame(this.render);
  }
}