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
    this.stats = { score: 0, maxCombo: 0, enemiesDefeated: 0, bossesDefeated: 0 };
    this.enemiesSpawnedSinceBoss = 0;
    
    this.baseGroundY = 400;
    this.cameraX = 0;
    this.devMode = false;
    this.audioEngine = null;
    
    this.keys = {};
    this.keyboardKeys = {};
    this.gamepadKeys = {};
    this.prevGamepadButtons = new Array(16).fill(false);
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
      // Increase player visual scale ~50% so characters appear larger relative to crates/text
      scale: 1.5,
      slidePower: 100,
      aerialPower: 100,
      slideTime: 0,
      airTime: 0,
      groundStandTime: 0,
      doubleJumped: false,
      isSliding: false,
      jumpBuffer: 0,
      attackBuffer: null,
    };

    spawnCratesSquareWave(this, 2500, 4);
    spawnEnemy(this, 2800);
  }

  setAudioEngine(audioEngine) {
    this.audioEngine = audioEngine;
  }

  handleKeyDown(code, key) {
    const wasPressed = this.keyboardKeys[code] || this.keyboardKeys[key];
    this.keyboardKeys[code] = true;
    this.keyboardKeys[key] = true;

    if (!wasPressed) {
      let btn = 0;
      if (['Digit1', '1', 'KeyJ'].includes(code)) btn = 1;
      if (['Digit2', '2', 'KeyK'].includes(code)) btn = 2;
      
      if (btn > 0) {
        this.player.attackBuffer = { btn, time: 0.2 };
      }
    }
  }

  handleKeyUp(code, key) {
    this.keyboardKeys[code] = false;
    this.keyboardKeys[key] = false;
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0]; 
    this.gamepadKeys = {};

    if (gp) {
      const b = gp.buttons;
      const axes = gp.axes;

      // D-Pad or Left Stick
      if (b[12]?.pressed || axes[1] < -0.5) this.gamepadKeys['KeyW'] = true;
      if (b[13]?.pressed || axes[1] > 0.5)  this.gamepadKeys['KeyS'] = true;
      if (b[14]?.pressed || axes[0] < -0.5) this.gamepadKeys['KeyA'] = true;
      if (b[15]?.pressed || axes[0] > 0.5)  this.gamepadKeys['KeyD'] = true;

      // Attack Buttons: A (0) or Y (3) -> Attack 1 (KeyJ)
      const atk1Pressed = b[0]?.pressed || b[3]?.pressed;
      const atk1WasPressed = this.prevGamepadButtons[0] || this.prevGamepadButtons[3];
      if (atk1Pressed && !atk1WasPressed) {
        this.player.attackBuffer = { btn: 1, time: 0.2 };
      }
      if (atk1Pressed) this.gamepadKeys['KeyJ'] = true;

      // Attack Buttons: B (1) or X (2) -> Attack 2 (KeyK)
      const atk2Pressed = b[1]?.pressed || b[2]?.pressed;
      const atk2WasPressed = this.prevGamepadButtons[1] || this.prevGamepadButtons[2];
      if (atk2Pressed && !atk2WasPressed) {
        this.player.attackBuffer = { btn: 2, time: 0.2 };
      }
      if (atk2Pressed) this.gamepadKeys['KeyK'] = true;

      // Store current button states for next frame transition checks
      for (let i = 0; i < 16; i++) {
        this.prevGamepadButtons[i] = b[i]?.pressed || false;
      }
    }

    // Combine keyboard and gamepad into master keys state
    // We only need to iterate keys used by the game
    const relevantKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 
      'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 
      'Space', 'KeyJ', 'KeyK', 'Digit1', 'Digit2'
    ];

    for (const k of relevantKeys) {
      this.keys[k] = !!(this.keyboardKeys[k] || this.gamepadKeys[k]);
    }
  }

  update(dt) {
    this.pollGamepad();
    updateEngine(this, dt);
    this.prevKeys = { ...this.keys };
  }
}