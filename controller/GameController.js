import { createCharacter } from '../character/representation.js';
import { triggerAttack } from '../combat/attacks/trigger.js';
import { spawnCratesSquareWave, spawnEnemy } from './spawner.js';
import { updateEngine } from './update.js';
import { determineAttack } from '../input/controls.js';

export class GameController {
  constructor() {
    this.entities = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.visualFx = [];
    this.fxId = 0;
    this.stats = { score: 0, maxCombo: 0, enemiesDefeated: 0 };
    
    this.baseGroundY = 400;
    this.cameraX = 0;
    this.devMode = false;
    
    this.keys = {};
    this.prevKeys = {};
    this.hitstop = 0;
    this.screenShake = 0;
    
    this.nextSpawnX = 3000;
    this.particleId = 0;
    this.waveId = 0;
    this.textId = 0;
    
    this.introTexts = [
      { text: 'SitcomReality presents Untitled', x: 800 }
    ];
    this.introLayoutsGenerated = false;
    this.introLayouts = [];

    this.player = {
      id: 'player',
      type: 'player',
      x: 0,
      y: this.baseGroundY,
      vx: 0,
      vy: 0,
      facing: 'right',
      isGrounded: true,
      isCrouching: false,
      health: 100,
      maxHealth: 100,
      state: 'idle',
      stateTime: 0,
      attackType: 'none',
      attackTimer: 0,
      endlagTimer: 0,
      attackHitConfirmed: false,
      combo: 0,
      character: createCharacter(0, this.baseGroundY),
      slidePower: 100,
      aerialPower: 100,
      slideTime: 0,
      airTime: 0,
      groundStandTime: 0,
      doubleJumped: false,
      isSliding: false,
    };

    spawnCratesSquareWave(this, 2500, 4);
    spawnEnemy(this, 2800);
  }

  handleKeyDown(code, key) {
    const wasPressed = this.keys[code] || this.keys[key];
    this.keys[code] = true;
    this.keys[key] = true;

    if (!wasPressed) {
      const attackType = determineAttack(this);
      if (attackType) {
        triggerAttack(this, attackType);
      }
    }
  }

  handleKeyUp(code, key) {
    this.keys[code] = false;
    this.keys[key] = false;
  }

  update(dt) {
    updateEngine(this, dt);
    this.prevKeys = { ...this.keys };
  }
}