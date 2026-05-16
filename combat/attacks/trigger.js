import { ATTACK_CONFIG } from './config.js';

export function triggerAttack(controller, attackType) {
  const p = controller.player;
  if (p.state === 'dead') return;
  
  const config = ATTACK_CONFIG[attackType];
  if (!config) return;


  
  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = attackType;
  p.attackTimer = config.duration;
  p.endlagTimer = config.endlag;
  p.attackHitConfirmed = false;
  
  const dir = p.facing === 'right' ? 1 : -1;
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const horizontalHeld = left || right;
  
  if (attackType === 'slash') {
    // slash doesn't override current inertia heavily
  } else if (attackType === 'rising_slash') {
    const powerCost = p.isGrounded ? 10 : 25;
    if (!p.isGrounded && p.aerialPower < powerCost) return;
    
    if (!p.isGrounded) p.aerialPower -= powerCost;
    
    const powerScale = p.isGrounded ? 1.0 : 0.5 + (p.aerialPower / 100) * 0.5;
    p.vx = horizontalHeld ? dir * config.vx * powerScale : 0;
    p.vy = config.vy * powerScale;
    p.exponentialLaunch = true;
    p.isGrounded = false;
  } else if (attackType === 'sweep') {
    const minSlideSpeed = 8;
    const currentSpeed = Math.abs(p.vx);
    
    if (currentSpeed < minSlideSpeed) {
      const powerBoost = (p.slidePower / 100) * config.vx;
      p.vx = dir * Math.max(minSlideSpeed, powerBoost);
      p.slidePower = Math.max(0, p.slidePower - 30);
    } else {
      const sign = Math.sign(p.vx);
      p.vx = sign * Math.max(currentSpeed, minSlideSpeed);
    }
    p.isSliding = true;
    
    if (controller.audioEngine) {
      controller.audioEngine.onSlide();
    }
  } else if (attackType === 'down_thrust') {
    // Freeze for anticipation, then spike down
    p.vx = 0;
    p.vy = 0; // Freeze initially
    p.isGrounded = false;
    p.downThrustAnticipation = 0.15; // Will apply downward velocity after this delay
  } else {
    if (attackType === 'up_slash') {
      const powerCost = 20;
      if (p.aerialPower < powerCost) return;
      
      p.aerialPower -= powerCost;
      const powerScale = 0.6 + (p.aerialPower / 100) * 0.4;
      p.vx = horizontalHeld ? dir * config.vx * powerScale : 0;
    } else {
      p.vx = dir * config.vx;
    }
    p.vy = config.vy;
    if (config.vy !== 0) {
      p.isGrounded = false;
    }
  }
  
  // Create attack-specific visual effects
  if (attackType === 'rising_slash') {
    // Wide arcing swoosh
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 10,
      y: p.y - 50,
      facing: p.facing,
      angle: -Math.PI / 2.5 * dir,
      radius: 70,
      thickness: 35,
      color: '#ffffff',
      life: 0,
      maxLife: 0.3
    });
  } else if (attackType === 'down_thrust') {
    // Narrow vertical trail
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x,
      y: p.y - 20,
      facing: p.facing,
      angle: Math.PI / 2,
      radius: 50,
      thickness: 18,
      color: '#ffffff',
      life: 0,
      maxLife: 0.25
    });
  } else if (attackType === 'up_slash') {
    // Overhead arc
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 15,
      y: p.y - 55,
      facing: p.facing,
      angle: -Math.PI / 3 * dir,
      radius: 65,
      thickness: 30,
      color: '#ffffff',
      life: 0,
      maxLife: 0.28
    });
  } else if (attackType === 'heavy_slash') {
    // Massive horizontal flash
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 25,
      y: p.y - 30,
      facing: p.facing,
      angle: 0,
      radius: 85,
      thickness: 45,
      color: '#ffffff',
      life: 0,
      maxLife: 0.35
    });
  } else if (attackType === 'sweep') {
    // Wide low horizontal arc
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 20,
      y: p.y - 15,
      facing: p.facing,
      angle: Math.PI * 0.1,
      radius: 75,
      thickness: 28,
      color: '#ffffff',
      life: 0,
      maxLife: 0.32
    });
  } else if (attackType === 'slash') {
    // Quick descending arc (Marth fair style)
    controller.visualFx.push({
      id: `fx_${controller.fxId++}`,
      type: 'swoosh',
      x: p.x + dir * 18,
      y: p.y - 35,
      facing: p.facing,
      angle: Math.PI * 0.15,
      radius: 55,
      thickness: 22,
      color: '#ffffff',
      life: 0,
      maxLife: 0.2
    });
  } else if (attackType === 'thrust') {
    // No swoosh for thrust - it's a straight stab
  }
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh(attackType);
  }
}