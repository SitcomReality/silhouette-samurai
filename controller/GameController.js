import { updateEngine } from './update.js';
import { ParrySystem } from '../combat/parry.js';
import { InputManager } from './input/InputManager.js';
import { resetGameState } from './state/ResetHandler.js';
import { getFinisherAttackName } from '../input/controls.js';

export class GameController {
  constructor() {
    this.initializeGameState();
  }

  initializeGameState() {
    // Configuration & Core Hub Properties
    this.baseGroundY = 400;
    this.introTexts = [
      { text: 'SILHOUETTE SAMURAI', x: 800 }
    ];
    this.introLayoutsGenerated = false;
    this.introLayouts = [];
    
    // Modular Sub-systems
    this.parry = new ParrySystem();
    this.inputManager = new InputManager(this);
    
    // UI & Development State
    this.devMode = false;
    this.freezePlayer = false;
    this.loopSelectedAttack = false;
    this.tunerSelectedAttack = 'neutral';
    this.audioEngine = null;
    
    // Global Input Tracking
    this.keys = {};
    this.prevKeys = {};

    // Trigger initial world and player setup
    resetGameState(this);
  }

  restartGame() {
    resetGameState(this);
  }

  setAudioEngine(audioEngine) {
    this.audioEngine = audioEngine;
  }

  handleKeyDown(code, key) {
    this.inputManager.handleKeyDown(code, key);
  }

  handleKeyUp(code, key) {
    this.inputManager.handleKeyUp(code, key);
  }

  update(dt) {
    this.keys = this.inputManager.pollGamepad();
    updateEngine(this, dt);
    this.prevKeys = { ...this.keys };
  }

  getFinisherAttack(direction) {
    return getFinisherAttackName(direction);
  }
}