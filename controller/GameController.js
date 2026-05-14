import { createDefaultSkeleton } from '../skeleton/factory.js';
import { triggerAttack } from './combat.js';
import { spawnCratesSquareWave, spawnEnemy } from './spawner.js';
import { updateEngine } from './update.js';

export class GameController {
  constructor() {
    this.entities = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.stats = { score: 0, maxCombo: 0, enemiesDefeated: 0 };
    
    this.baseGroundY = 400;
    this.cameraX = 0;
    this.devMode = false;
    
    this.keys = {};
    this.hitstop = 0;
    this.screenShake = 0;
    
    this.nextSpawnX = 400;
    this.particleId = 0;
    this.waveId = 0;
    this.textId = 0;

    this.player = {
      id: 'player',
      type: 'player',
      x: 0,
      y: this.baseGroundY,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: true,
      health: 100,
      maxHealth: 100,
      state: 'idle',
      stateTime: 0,
      attackType: 'none',
      attackTimer: 0,
      combo: 0,
      skeleton: createDefaultSkeleton(0, this.baseGroundY),
    };

    spawnCratesSquareWave(this, 250, 4);
    spawnEnemy(this, 550);
  }

  handleKeyDown(code, key) {
    this.keys[code] = true;
    this.keys[key] = true;

    if (['Digit1', 'Numpad1', '1'].includes(code) || ['Digit1', 'Numpad1', '1'].includes(key)) {
      triggerAttack(this, 'kick_low');
    } else if (['Digit2', 'Numpad2', '2'].includes(code) || ['Digit2', 'Numpad2', '2'].includes(key)) {
      triggerAttack(this, 'roundhouse');
    } else if (['Digit3', 'Numpad3', '3'].includes(code) || ['Digit3', 'Numpad3', '3'].includes(key)) {
      triggerAttack(this, 'slam');
    }
  }

  handleKeyUp(code, key) {
    this.keys[code] = false;
    this.keys[key] = false;
  }

  update(dt) {
    updateEngine(this, dt);
  }
}