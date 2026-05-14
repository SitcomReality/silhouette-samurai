import { GameController } from '../controller/GameController.js';
import { GameCanvas } from '../renderer/GameCanvas.js';
import { UIOverlay } from '../ui-overlay.js';

export class GameEngine {
  constructor() {
    this.controller = new GameController();
    const canvasElement = document.getElementById('game-canvas');
    this.gameCanvas = new GameCanvas(canvasElement, this.controller, '#06b6d4');
    
    this.uiOverlay = new UIOverlay(this.controller, (newColor) => {
      this.gameCanvas.setThemeColor(newColor);
    });
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    setInterval(() => {
      this.uiOverlay.update();
    }, 60);

    this.gameCanvas.start();
  }

  handleKeyDown(e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this.controller.handleKeyDown(e.code, e.key);
  }

  handleKeyUp(e) {
    this.controller.handleKeyUp(e.code, e.key);
  }
}