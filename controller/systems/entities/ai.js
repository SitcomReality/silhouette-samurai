import { UNIFIED_ATTACK } from '../../../combat/frame-data.js';

export function updateEnemyAI(controller, dt) {
  const p = controller.player;
  
  for (const ent of controller.entities) {
    if (ent.type !== 'enemy' || ent.state === 'dead') continue;
    
    // Skip AI during hitstun or other locked states
    if (ent.hitstunTimer > 0 || ent.staggerTimer > 0 || ent.tripTimer > 0) continue;
    
    // If already attacking, let the attack finish
    if (ent.state === 'attack') {
      updateEnemyAttack(ent, dt);
      continue;
    }
    
    // Calculate distance to player
    const dx = p.x - ent.x;
    const dy = p.y - ent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Attack range check
    const attackRange = 80;
    const attackCooldown = 1.2; // ~half the player's max attack speed
    
    if (dist < attackRange && ent.isGrounded && p.state !== 'dead') {
      // Check if enough time has passed since last attack
      if (!ent.lastAttackTime || (performance.now() / 1000 - ent.lastAttackTime) > attackCooldown) {
        triggerEnemyAttack(controller, ent);
      } else {
        // In range but on cooldown - stand ready
        ent.state = 'idle';
        ent.vx *= 0.85;
      }
    } else {
      // Move towards player
      moveTowardsPlayer(ent, p, dt);
    }
  }
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
  ent.lastAttackTime = performance.now() / 1000;
  
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