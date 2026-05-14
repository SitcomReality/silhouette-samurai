import { GameEngine } from './engine/GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();
});