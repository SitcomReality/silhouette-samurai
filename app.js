import { GameController } from './controller.js';
import { GameCanvas } from './game-canvas.js';
import { UIOverlay } from './ui-overlay.js';

document.addEventListener('DOMContentLoaded', () => {
  const controller = new GameController();
  
  const canvasElement = document.getElementById('game-canvas');
  const gameCanvas = new GameCanvas(canvasElement, controller, '#06b6d4');
  
  const uiOverlay = new UIOverlay(controller, (newColor) => {
    gameCanvas.setThemeColor(newColor);
  });
  
  const handleKeyDown = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    controller.handleKeyDown(e.code, e.key);
  };

  const handleKeyUp = (e) => {
    controller.handleKeyUp(e.code, e.key);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  setInterval(() => {
    uiOverlay.update();
  }, 60);

  gameCanvas.start();
});