import { createCharacter } from '../character/representation.js';
import { triggerAttack } from '../combat/attacks/trigger.js';
import { spawnCratesSquareWave, spawnEnemy } from './spawner.js';
import { updateEngine } from './update.js';
import { determineAttack } from '../input/controls.js';
import { ParrySystem } from '../combat/parry.js';
import { BladeDanceSystem } from '../combat/blade-dance.js';

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
    this.freezePlayer = false;
    this.loopSelectedAttack = false;
    this.tunerSelectedAttack = 'neutral';
    this.audioEngine = null;
    
    this.keys = {};
    this.keyboardKeys = {};
    this.gamepadKeys = {};
    this.prevGamepadButtons = new Array(16).fill(false);
    this.prevKeys = {};
    this.hitstop = 0;
    this.screenShake = 0;
    
    // Combat systems
    this.parry = new ParrySystem();
    this.bladeDance = new BladeDanceSystem();
    
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
      attackFrameData: null,
      attackFrameTime: 0,
      attackHitConfirmed: false,
      attackHitEntities: new Set(),
      combo: 0,
      character: createCharacter(0, this.baseGroundY),
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
      isBlocking: false,
      blockStartTime: 0,
      canCounter: false,
      counterWindow: 0,
      counterBonusDamage: 1.0,
      hitstunTimer: 0,
      staggerTimer: 0,
      tripTimer: 0,
      bladeDanceState: null,
      bladeDanceHitCount: 0,
      bladeDanceInputWindow: 0,
      bladeDanceFinisherReady: false,
      bladeDanceCooldown: 0,
      dodgeTimer: 0,
      finisherTransitionWindow: 0,
      blockToFinisher: false,
      ultraParryBonus: 1.0,
      movementVector: { x: 0, y: 0 }
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
      // Attack button (J/1)
      if (['Digit1', '1', 'KeyJ'].includes(code)) {
        this.player.attackBuffer = { btn: 1, time: 0.2 };
      }
      // Block button (K/2)
      if (['Digit2', '2', 'KeyK'].includes(code)) {
        if (this.player.state !== 'attack' && this.player.state !== 'dead') {
          this.player.isBlocking = true;
          this.player.blockStartTime = performance.now() / 1000;
          this.player.blockBuffer = { time: 0.2 };
          // Start finisher transition window if blade dance is active
          if (this.bladeDance.canPerformFinisher(this.player)) {
            this.player.finisherTransitionWindow = this.bladeDance.finisherGraceWindow;
          }
        }
      }
    }
  }

  handleKeyUp(code, key) {
    this.keyboardKeys[code] = false;
    this.keyboardKeys[key] = false;
    
    // Release block
    if (['Digit2', '2', 'KeyK'].includes(code)) {
      this.player.isBlocking = false;
      this.player.blockStartTime = 0;
      this.player.blockBuffer = null;
      this.player.finisherTransitionWindow = 0;
      // If we were in the block state, return to idle (but don't cancel attacks or death)
      if (this.player.state === 'block' && this.player.state !== 'attack' && this.player.state !== 'dead') {
        this.player.state = 'idle';
        this.player.stateTime = 0;
      }
    }
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0]; 
    this.gamepadKeys = {};

    if (gp) {
      const b = gp.buttons;
      const axes = gp.axes;

      // Analog stick for movement vector
      const deadzone = 0.2;
      const axisX = Math.abs(axes[0]) > deadzone ? axes[0] : 0;
      const axisY = Math.abs(axes[1]) > deadzone ? axes[1] : 0;
      this.player.movementVector = { x: axisX, y: axisY };

      // D-Pad or Left Stick
      if (b[12]?.pressed || axes[1] < -0.5) this.gamepadKeys['KeyW'] = true;
      if (b[13]?.pressed || axes[1] > 0.5)  this.gamepadKeys['KeyS'] = true;
      if (b[14]?.pressed || axes[0] < -0.5) this.gamepadKeys['KeyA'] = true;
      if (b[15]?.pressed || axes[0] > 0.5)  this.gamepadKeys['KeyD'] = true;

      // Attack Button: A (0) or Y (3) -> Attack (KeyJ)
      const atkPressed = b[0]?.pressed || b[3]?.pressed;
      const atkWasPressed = this.prevGamepadButtons[0] || this.prevGamepadButtons[3];
      if (atkPressed && !atkWasPressed) {
        this.player.attackBuffer = { btn: 1, time: 0.2 };
      }
      if (atkPressed) this.gamepadKeys['KeyJ'] = true;

      // Block Button: B (1) or X (2) -> Block (KeyK)
      const blockPressed = b[1]?.pressed || b[2]?.pressed;
      const blockWasPressed = this.prevGamepadButtons[1] || this.prevGamepadButtons[2];
      if (blockPressed && !blockWasPressed) {
        if (this.player.state !== 'attack' && this.player.state !== 'dead') {
          this.player.isBlocking = true;
          this.player.blockStartTime = performance.now() / 1000;
          this.player.blockBuffer = { time: 0.2 };
          if (this.bladeDance.canPerformFinisher(this.player)) {
            this.player.finisherTransitionWindow = this.bladeDance.finisherGraceWindow;
          }
        }
      }
      if (!blockPressed && blockWasPressed) {
        this.player.isBlocking = false;
        this.player.blockStartTime = 0;
        this.player.blockBuffer = null;
        this.player.finisherTransitionWindow = 0;
        if (this.player.state === 'block' && this.player.state !== 'attack' && this.player.state !== 'dead') {
          this.player.state = 'idle';
          this.player.stateTime = 0;
        }
      }
      if (blockPressed) this.gamepadKeys['KeyK'] = true;

      // Store current button states for next frame transition checks
      for (let i = 0; i < 16; i++) {
        this.prevGamepadButtons[i] = b[i]?.pressed || false;
      }
    } else {
      // Keyboard: convert WASD to movement vector
      let vx = 0, vy = 0;
      if (this.keyboardKeys['KeyA'] || this.keyboardKeys['ArrowLeft']) vx -= 1;
      if (this.keyboardKeys['KeyD'] || this.keyboardKeys['ArrowRight']) vx += 1;
      if (this.keyboardKeys['KeyW'] || this.keyboardKeys['ArrowUp'] || this.keyboardKeys['Space']) vy -= 1;
      if (this.keyboardKeys['KeyS'] || this.keyboardKeys['ArrowDown']) vy += 1;
      this.player.movementVector = { x: vx, y: vy };
    }

    // Combine keyboard and gamepad into master keys state
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