import { UNIFIED_ATTACK } from '../../../combat/frame-data.js';

export function updateEnemyAI(controller, dt) {
  const p = controller.player;
  const now = performance.now() / 1000;
  
  for (const ent of controller.entities) {
    if (ent.type !== 'enemy' || ent.state === 'dead') continue;
    
    // Skip AI during hitstun or other locked states
    if (ent.hitstunTimer > 0 || ent.staggerTimer > 0 || ent.tripTimer > 0) continue;

    // Training dummy: no AI, never moves or attacks
    if (ent.subtype === 'dummy') continue;

    // Route to subtype-specific AI
    if (ent.subtype === 'floater') {
      updateFloaterAI(controller, ent, p, dt, now);
      continue;
    }
    if (ent.subtype === 'archer') {
      updateArcherAI(controller, ent, p, dt, now);
      continue;
    }
    
    // If already attacking, let the attack finish
    if (ent.state === 'attack') {
      updateEnemyAttack(ent, dt);
      ent.attackCooldownStart = null;
      ent.chargeProgress = 0;
      continue;
    }
    
    // Calculate distance to player
    const dx = p.x - ent.x;
    const dist = Math.sqrt(dx * dx + (p.y - ent.y) ** 2);
    
    const attackRange = 80;
    const attackCooldown = 1.2;
    
    if (dist < attackRange && ent.isGrounded && p.state !== 'dead') {
      if (!ent.attackCooldownStart) ent.attackCooldownStart = now;
      const elapsed = now - ent.attackCooldownStart;
      ent.chargeProgress = Math.min(elapsed / attackCooldown, 1.0);

      if (elapsed >= attackCooldown) {
        triggerEnemyAttack(controller, ent);
        ent.attackCooldownStart = null;
        ent.chargeProgress = 0;
      } else {
        ent.state = 'idle';
        ent.vx *= 0.85;
      }
    } else {
      ent.attackCooldownStart = null;
      ent.chargeProgress = 0;
      moveTowardsPlayer(ent, p, dt);
    }
  }
}

// --- Floater AI: hovers above ground, attacks with downward slam ---
function updateFloaterAI(controller, ent, p, dt, now) {
  // Bob up and down
  ent.floatPhase = (ent.floatPhase || 0) + dt * 1.8;
  const targetY = ent.floatBaseY + Math.sin(ent.floatPhase) * 20;
  ent.y += (targetY - ent.y) * 0.08;

  if (ent.state === 'attack') {
    updateEnemyAttack(ent, dt);
    ent.attackCooldownStart = null;
    ent.chargeProgress = 0;
    return;
  }

  const dx = p.x - ent.x;
  const dist = Math.abs(dx);
  ent.facing = dx > 0 ? 'right' : 'left';

  const attackRange = 100;
  const attackCooldown = 1.5;

  if (dist < attackRange && p.state !== 'dead') {
    if (!ent.attackCooldownStart) ent.attackCooldownStart = now;
    const elapsed = now - ent.attackCooldownStart;
    ent.chargeProgress = Math.min(elapsed / attackCooldown, 1.0);

    if (elapsed >= attackCooldown) {
      triggerFloaterAttack(controller, ent);
      ent.attackCooldownStart = null;
      ent.chargeProgress = 0;
    } else {
      // Hover in place while charging
      ent.vx *= 0.9;
    }
  } else {
    ent.attackCooldownStart = null;
    ent.chargeProgress = 0;
    // Float towards player horizontally
    const dir = dx > 0 ? 1 : -1;
    ent.vx += dir * 2.0 * dt * 60;
    ent.vx = Math.max(-3, Math.min(3, ent.vx));
  }
  ent.x += ent.vx;
  ent.vx *= 0.88;
  // Update character world pos to match y
  if (ent.character) ent.character.world.bodyBot.y = ent.y;
}

// --- Archer AI: keeps distance, shoots projectiles ---
function updateArcherAI(controller, ent, p, dt, now) {
  if (ent.state === 'attack') {
    updateEnemyAttack(ent, dt);
    ent.attackCooldownStart = null;
    ent.chargeProgress = 0;
    return;
  }

  const dx = p.x - ent.x;
  const dist = Math.abs(dx);
  ent.facing = dx > 0 ? 'right' : 'left';

  const preferredRange = 300;
  const shootRange = 450;
  const shootCooldown = 2.0;

  // Maintain preferred distance
  if (dist < preferredRange - 60) {
    // Back away
    ent.vx += (ent.x < p.x ? -1 : 1) * 2.5 * dt * 60;
  } else if (dist > preferredRange + 60 && dist < shootRange + 200) {
    // Approach slightly
    ent.vx += (dx > 0 ? 1 : -1) * 1.5 * dt * 60;
  }
  ent.vx = Math.max(-3, Math.min(3, ent.vx));
  ent.vx *= 0.85;
  ent.x += ent.vx;

  if (dist < shootRange && dist > 80 && p.state !== 'dead') {
    if (!ent.attackCooldownStart) ent.attackCooldownStart = now;
    const elapsed = now - ent.attackCooldownStart;
    ent.chargeProgress = Math.min(elapsed / shootCooldown, 1.0);
    ent.state = 'idle'; // hold still while charging shot

    if (elapsed >= shootCooldown) {
      fireProjectile(controller, ent, p);
      ent.attackCooldownStart = null;
      ent.chargeProgress = 0;
    }
  } else {
    ent.attackCooldownStart = null;
    ent.chargeProgress = 0;
    ent.state = ent.vx !== 0 ? 'run' : 'idle';
  }
}

function fireProjectile(controller, ent, target) {
  const dir = ent.facing === 'right' ? 1 : -1;
  // Aim at player's center height
  const targetY = target.y - 40;
  const dy = targetY - (ent.y - 40);
  const dx = target.x - ent.x;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const speed = 7;

  controller.entities.push({
    id: `proj_${controller.particleId++}`,
    type: 'projectile',
    owner: 'enemy',
    x: ent.x + dir * 20,
    y: ent.y - 40,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    health: 1,
    maxHealth: 1,
    state: 'idle',
    stateTime: 0,
    facing: ent.facing,
    isGrounded: false,
    scale: 1.0,
  });

  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh('unified');
  }
}

function triggerFloaterAttack(controller, ent) {
  const frameData = JSON.parse(JSON.stringify(UNIFIED_ATTACK));
  // Downward slam - wide horizontal zone at mid height
  frameData.range = { width: 90, height: 60, offsetX: 35, offsetY: -20 };
  frameData.damage = 10;
  frameData.knockback = { x: 3, y: -4 };
  frameData.anim.startAngle = 0.6;
  frameData.anim.endAngle = -0.2;

  ent.state = 'attack';
  ent.stateTime = 0;
  ent.attackType = 'unified';
  ent.attackFrameData = new UNIFIED_ATTACK.constructor('unified', frameData);
  ent.attackFrameTime = 0;
  ent.attackHitEntities = new Set();
  ent.attackAngle = ent.facing === 'right' ? 0 : Math.PI;
  ent.attackChargePower = 0.6;
  ent.attackIsDirectional = false;
  ent.isFloaterAttack = true;

  if (controller.audioEngine) controller.audioEngine.onAttackSwoosh('unified');
}

function moveTowardsPlayer(ent, player, dt) {
  if (player.state === 'dead') {
    ent.state = 'idle';
    ent.vx *= 0.85;
    return;
  }
  
  const dx = player.x - ent.x;
  const moveSpeed = ent.isBoss ? 3 : 2.5;
  
  // Face the player
  ent.facing = dx > 0 ? 'right' : 'left';
  
  // Move towards player
  const dir = dx > 0 ? 1 : -1;
  ent.vx += dir * moveSpeed * dt * 60;
  ent.vx = Math.max(-4, Math.min(4, ent.vx));
  ent.state = 'run';
}

function triggerEnemyAttack(controller, ent) {
  const frameData = JSON.parse(JSON.stringify(UNIFIED_ATTACK));
  
  // Enemies use a simple forward attack
  const dir = ent.facing === 'right' ? 1 : -1;
  
  ent.state = 'attack';
  ent.stateTime = 0;
  ent.attackType = 'unified';
  ent.attackFrameData = new UNIFIED_ATTACK.constructor('unified', frameData);
  ent.attackFrameTime = 0;
  ent.attackHitEntities = new Set();
  ent.attackAngle = dir === 1 ? 0 : Math.PI;
  ent.attackChargePower = 0.5; // Enemies use moderate charge
  ent.attackIsDirectional = false;
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh('unified');
  }
}

function updateEnemyAttack(ent, dt) {
  ent.attackFrameTime += dt;
  
  if (!ent.attackFrameData) {
    ent.state = 'idle';
    ent.attackType = 'none';
    return;
  }
  
  const currentFrame = Math.floor(ent.attackFrameTime * 60);
  if (currentFrame >= ent.attackFrameData.totalFrames) {
    ent.state = 'idle';
    ent.attackType = 'none';
    ent.attackFrameTime = 0;
    ent.attackFrameData = null;
    ent.attackHitEntities.clear();
  }
}