import { ATTACK_FRAME_DATA } from '../frame-data.js';

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
  const swooshes = {
    neutral: { type: 'arc_swoosh', offsetX: 12, offsetY: -45, startAngle: Math.PI * 0.9, endAngle: -Math.PI * 0.1, radius: 62, thickness: 30, squashY: 0.28, maxLife: 0.22 },
    forward: { type: 'arc_swoosh', offsetX: 48, offsetY: -40, startAngle: Math.PI * 0.4, endAngle: -Math.PI * 0.15, radius: 75, thickness: 25, maxLife: 0.25 },
    up: { type: 'arc_swoosh', offsetX: 0, offsetY: -30, startAngle: -Math.PI * 0.1, endAngle: -Math.PI * 0.9, radius: 65, thickness: 35, maxLife: 0.28 },
    down: { type: 'arc_swoosh', offsetX: 0, offsetY: -15, startAngle: Math.PI * 0.8, endAngle: -Math.PI * 0.1, radius: 80, thickness: 30, squashY: 0.4, maxLife: 0.35 },
    air_neutral: { type: 'arc_swoosh', offsetX: 0, offsetY: -35, startAngle: Math.PI * 0.9, endAngle: -Math.PI * 0.1, radius: 58, thickness: 28, squashY: 0.28, maxLife: 0.22 },
    air_forward: { type: 'arc_swoosh', offsetX: 40, offsetY: -35, startAngle: Math.PI * 0.5, endAngle: -Math.PI * 0.2, radius: 70, thickness: 30, maxLife: 0.3 },
    air_up: { type: 'arc_swoosh', offsetX: 0, offsetY: -40, startAngle: -Math.PI * 0.2, endAngle: -Math.PI * 0.95, radius: 60, thickness: 32, maxLife: 0.3 },
    air_down: { type: 'streak', offsetX: 0, offsetY: -20, angle: Math.PI / 2, length: 150, width: 35, maxLife: 0.25 },
    dance_starter: { type: 'arc_swoosh', offsetX: 48, offsetY: -38, startAngle: Math.PI * 0.4, endAngle: -Math.PI * 0.15, radius: 75, thickness: 28, maxLife: 0.25 },
    dance_linker_neutral: { type: 'arc_swoosh', offsetX: 35, offsetY: -38, startAngle: Math.PI * 0.5, endAngle: -Math.PI * 0.1, radius: 65, thickness: 25, maxLife: 0.22 },
    dance_linker_up: { type: 'arc_swoosh', offsetX: 20, offsetY: -45, startAngle: -Math.PI * 0.15, endAngle: -Math.PI * 0.85, radius: 60, thickness: 28, maxLife: 0.24 },
    dance_linker_down: { type: 'arc_swoosh', offsetX: 35, offsetY: -15, startAngle: Math.PI * 0.75, endAngle: -Math.PI * 0.15, radius: 70, thickness: 26, squashY: 0.4, maxLife: 0.26 },
    dance_finisher_neutral: { type: 'arc_swoosh', offsetX: 42, offsetY: -40, startAngle: Math.PI * 0.9, endAngle: -Math.PI * 0.1, radius: 90, thickness: 60, squashY: 0.3, maxLife: 0.4 },
    dance_finisher_up: { type: 'arc_swoosh', offsetX: 20, offsetY: -60, startAngle: -Math.PI * 0.1, endAngle: -Math.PI * 1.0, radius: 85, thickness: 50, maxLife: 0.38 },
    dance_finisher_down: { type: 'streak', offsetX: 0, offsetY: -30, angle: Math.PI / 2, length: 180, width: 45, maxLife: 0.35 }
  };
  
  const config = swooshes[attackType];
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
    fx.startAngle = config.startAngle;
    fx.endAngle = config.endAngle;
    fx.radius = config.radius;
    fx.thickness = config.thickness;
    fx.squashY = config.squashY || 1.0;
  } else if (config.type === 'streak') {
    fx.angle = config.angle;
    fx.length = config.length;
    fx.width = config.width;
  }
  
  controller.visualFx.push(fx);
}