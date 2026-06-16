export class InputManager {
  constructor(controller) {
    this.controller = controller;
    this.keyboardKeys = {};
    this.gamepadKeys = {};
    this.prevGamepadButtons = new Array(16).fill(false);
  }

  handleKeyDown(code, key) {
    const p = this.controller.player;
    if (!p) return;
    
    const wasPressed = this.keyboardKeys[code] || this.keyboardKeys[key];
    this.keyboardKeys[code] = true;
    this.keyboardKeys[key] = true;

    if (!wasPressed) {
      // Attack button (J/1) - Start charging
      if (['Digit1', '1', 'KeyJ'].includes(code)) {
        if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block') {
          p.attackCharging = true;
          p.attackChargeTime = 0;
        }
      }
      // Block button (K/2)
      if (['Digit2', '2', 'KeyK'].includes(code)) {
        if (p.state !== 'attack' && p.state !== 'dead') {
          p.isBlocking = true;
          p.blockStartTime = performance.now() / 1000;
          p.blockBuffer = { time: 0.2 };
          if (p.combo >= 5) {
            p.finisherTransitionWindow = 0.4;
          }
        }
      }
    }
  }

  handleKeyUp(code, key) {
    const p = this.controller.player;
    if (!p) return;
    
    this.keyboardKeys[code] = false;
    this.keyboardKeys[key] = false;
    
    // Release attack - trigger attack with charge
    if (['Digit1', '1', 'KeyJ'].includes(code)) {
      if (p.attackCharging) {
        p.attackBuffer = { 
          btn: 1, 
          time: 0.2,
          chargeTime: p.attackChargeTime,
          movementVector: { ...p.movementVector }
        };
        p.attackCharging = false;
        p.attackChargeTime = 0;
      }
    }
    
    // Release block
    if (['Digit2', '2', 'KeyK'].includes(code)) {
      p.isBlocking = false;
      p.blockStartTime = 0;
      p.blockBuffer = null;
      p.finisherTransitionWindow = 0;
      if (p.state === 'block' && p.state !== 'attack' && p.state !== 'dead') {
        p.state = 'idle';
        p.stateTime = 0;
      }
    }
  }

  pollGamepad() {
    const p = this.controller.player;
    if (!p) return {};
    
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
      p.movementVector = { x: axisX, y: axisY };

      // D-Pad or Left Stick
      if (b[12]?.pressed || axes[1] < -0.5) this.gamepadKeys['KeyW'] = true;
      if (b[13]?.pressed || axes[1] > 0.5)  this.gamepadKeys['KeyS'] = true;
      if (b[14]?.pressed || axes[0] < -0.5) this.gamepadKeys['KeyA'] = true;
      if (b[15]?.pressed || axes[0] > 0.5)  this.gamepadKeys['KeyD'] = true;

      // Attack Button
      const atkPressed = b[0]?.pressed || b[3]?.pressed;
      const atkWasPressed = this.prevGamepadButtons[0] || this.prevGamepadButtons[3];
      if (atkPressed && !atkWasPressed) {
        if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block') {
          p.attackCharging = true;
          p.attackChargeTime = 0;
        }
      }
      if (!atkPressed && atkWasPressed) {
        if (p.attackCharging) {
          p.attackBuffer = { 
            btn: 1, 
            time: 0.2,
            chargeTime: p.attackChargeTime,
            movementVector: { ...p.movementVector }
          };
          p.attackCharging = false;
          p.attackChargeTime = 0;
        }
      }
      if (atkPressed) this.gamepadKeys['KeyJ'] = true;

      // Block Button
      const blockPressed = b[1]?.pressed || b[2]?.pressed;
      const blockWasPressed = this.prevGamepadButtons[1] || this.prevGamepadButtons[2];
      if (blockPressed && !blockWasPressed) {
        if (p.state !== 'attack' && p.state !== 'dead') {
          p.isBlocking = true;
          p.blockStartTime = performance.now() / 1000;
          p.blockBuffer = { time: 0.2 };
          if (p.combo >= 5) p.finisherTransitionWindow = 0.4;
        }
      }
      if (!blockPressed && blockWasPressed) {
        p.isBlocking = false;
        p.blockStartTime = 0;
        p.blockBuffer = null;
        p.finisherTransitionWindow = 0;
        if (p.state === 'block' && p.state !== 'attack' && p.state !== 'dead') {
          p.state = 'idle';
          p.stateTime = 0;
        }
      }
      if (blockPressed) this.gamepadKeys['KeyK'] = true;

      for (let i = 0; i < 16; i++) {
        this.prevGamepadButtons[i] = b[i]?.pressed || false;
      }
    } else {
      // Keyboard
      let vx = 0, vy = 0;
      if (this.keyboardKeys['KeyA'] || this.keyboardKeys['ArrowLeft']) vx -= 1;
      if (this.keyboardKeys['KeyD'] || this.keyboardKeys['ArrowRight']) vx += 1;
      if (this.keyboardKeys['KeyW'] || this.keyboardKeys['ArrowUp'] || this.keyboardKeys['Space']) vy -= 1;
      if (this.keyboardKeys['KeyS'] || this.keyboardKeys['ArrowDown']) vy += 1;
      p.movementVector = { x: vx, y: vy };
    }

    const relevantKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 
      'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 
      'Space', 'KeyJ', 'KeyK', 'Digit1', 'Digit2'
    ];

    const masterKeys = {};
    for (const k of relevantKeys) {
      masterKeys[k] = !!(this.keyboardKeys[k] || this.gamepadKeys[k]);
    }
    return masterKeys;
  }
}