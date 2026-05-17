import { ATTACK_FRAME_DATA, SWOOSH_CONFIG } from '../frame-data.js';

export function triggerAttack(controller, attackType) {
  const p = controller.player;
  if (p.state === 'dead' || p.state === 'stagger') return;
  
  const frameData = ATTACK_FRAME_DATA[attackType];
  if (!frameData) return;
  
  // Check ground requirement
  if (frameData.groundOnly && !p.isGrounded) return;
  
  // Initialize attack state
  p.state = 'attack';
  p.stateTime = 0;
  p.attackType = attackType;
  p.attackFrameData = frameData;
  p.attackFrameTime = 0;
  p.attackHitConfirmed = false;
  p.attackHitEntities = new Set(); // Track which entities we've hit
  
  // Apply movement on startup (vx set, vy is additive so attacks don't steal existing inertia)
  const dir = p.facing === 'right' ? 1 : -1;
  if (frameData.movement) {
    p.vx = dir * (frameData.movement.vx || 0);
    // Add vertical component instead of replacing to preserve and augment current momentum
    if (frameData.movement.vy !== undefined && frameData.movement.vy !== 0) {
      p.vy += frameData.movement.vy;
      p.isGrounded = false;
    }
  }
  
  // Blade Dance specific logic
  if (attackType === 'dance_starter') {
    controller.bladeDance.initiate(p);
  }
  
  // Create attack-specific visual effects (simplified for now)
  createAttackSwoosh(controller, p, attackType);
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh(attackType);
  }
}

function createAttackSwoosh(controller, p, attackType) {
  const config = SWOOSH_CONFIG[attackType];
  if (!config) return;
  
  const dir = p.facing === 'right' ? 1 : -1;
  const fx = {
    id: `fx_${controller.fxId++}`,
    type: config.type,
    entity: p,
    offsetX: dir * config.offsetX,
    offsetY: config.offsetY,
    x: p.x + dir * config.offsetX,
    y: p.y + config.offsetY,
    facing: p.facing,
    life: 0,
    maxLife: config.maxLife
  };
  
  if (config.type === 'arc_swoosh') {
    fx.startAngle = config.startAngle * Math.PI;
    fx.endAngle = config.endAngle * Math.PI;
    // Use global convention: radius 100 and thickness 20
    fx.radius = 100;
    fx.thickness = 20;
    fx.squashY = config.squashY || 1.0;
  } else if (config.type === 'streak') {
    fx.angle = config.angle;
    fx.length = config.length;
    fx.width = config.width;
  }
  
  controller.visualFx.push(fx);
}