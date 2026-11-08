import { GameController } from '../controller/GameController.js';
import { GameCanvas } from '../renderer/GameCanvas.js';
import { UIOverlay } from '../ui-overlay.js';
import { AudioEngine } from '../audio/AudioEngine.js';

export class GameEngine {
  constructor() {
    this.controller = new GameController();
    const canvasContainer = document.querySelector('.game-container');
    this.gameCanvas = new GameCanvas(canvasContainer, this.controller, '#06b6d4');
    
    this.audioEngine = new AudioEngine();
    this.controller.setAudioEngine(this.audioEngine);
    
    this.uiOverlay = new UIOverlay(this.controller, (newColor) => {
      this.gameCanvas.setThemeColor(newColor);
    });
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.audioStarted = false;
  }

  start() {
    const engine = this;
    window.__webgame = {
      get ready() {
        return Boolean(window.__APP_READY__);
      },
      get frame() {
        return engine.gameCanvas.frameCount;
      },
      get player() {
        return engine.controller.player;
      },
      get controller() {
        return engine.controller;
      },
      get audio() {
        return {
          started: engine.audioStarted,
          initialized: engine.audioEngine.initialized,
          state: engine.audioEngine.ctx?.state ?? null,
        };
      },
      snapshot() {
        const player = engine.controller.player;
        return {
          ready: Boolean(window.__APP_READY__),
          frame: engine.gameCanvas.frameCount,
          player: {
            x: player?.x ?? null,
            y: player?.y ?? null,
            vx: player?.vx ?? null,
            vy: player?.vy ?? null,
            state: player?.state ?? null,
            combo: player?.combo ?? null,
          },
          entities: engine.controller.entities.length,
          tunerActive: engine.controller.tunerActive,
          theme: getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim(),
          audio: {
            started: engine.audioStarted,
            initialized: engine.audioEngine.initialized,
            state: engine.audioEngine.ctx?.state ?? null,
          },
        };
      },
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('click', this.handleClick);
    
    setInterval(() => {
      this.uiOverlay.update();
      this.audioEngine.update(this.controller);
    }, 60);

    this.gameCanvas.start();
  }

  async handleClick() {
    if (!this.audioStarted) {
      await this.audioEngine.start();
      this.audioStarted = true;
    }
  }

  async handleKeyDown(e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    
    if (!this.audioStarted) {
      await this.audioEngine.start();
      this.audioStarted = true;
    }
    
    this.controller.handleKeyDown(e.code, e.key);
  }

  handleKeyUp(e) {
    this.controller.handleKeyUp(e.code, e.key);
  }
}