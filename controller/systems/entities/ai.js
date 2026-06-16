import { UNIFIED_ATTACK } from '../../../combat/frame-data.js';

export function updateEnemyAI(controller, dt) {
  const p = controller.player;
  
  for (const ent of controller.entities) {
    if (ent.type !== 'enemy' || ent.state === 'dead') continue;
    
    // Skip AI during hitstun or other locked states
    if (ent.hitstunTimer > 0 || ent.staggerTimer > 0 || ent.tripTimer > 0) continue;
    
    // If already attacking, let the attack finish
    if (ent.state === 'attack') {
      updateEnemyAttack(controller, ent, dt);
      continue;
    }
    
    // Calculate distance to player
    const dx = p.x - ent.x;
    const dy = p.y - ent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Attack range check
    const attackRange = 80;
    const attackCooldown = 1.2; // cooldown before each swing and also the charge duration
    
    if (dist < attackRange && ent.isGrounded && p.state !== 'dead') {
      const now = performance.now() / 1000;
      const elapsed = now - (ent.lastAttackTime || 0);
      
      // If still in cooldown, show a charging telegraph
      if (elapsed < attackCooldown) {
        // Ensure idle while charging
        ent.state = 'idle';
        ent.vx *= 0.85;
        
        // Create or update an enemy_charge visualFx entry tied to this entity
        const fxId = `enemy_charge_${ent.id}`;
        let fx = controller.visualFx.find(f => f.id === fxId);
        const progress = Math.min(Math.max(elapsed / attackCooldown, 0), 1);
        
        if (!fx) {
          fx = {
            id: fxId,
            type: 'enemy_charge',
            entity: ent,
            life: elapsed,
            maxLife: attackCooldown,
            progress: progress,
            // visual parameters
            baseRadius: (ent.scale || 1.0) * 30,
            maxExtra: (ent.scale || 1.0) * 50
          };
          controller.visualFx.push(fx);
        } else {
          fx.life = elapsed;
          fx.maxLife = attackCooldown;
          fx.progress = progress;
          fx.baseRadius = (ent.scale || 1.0) * 30;
          fx.maxExtra = (ent.scale || 1.0) * 50;
        }
      } else {
        // Time to attack
        triggerEnemyAttack(controller, ent);
        // Remove any lingering charge fx for this enemy
        const fxIndex = controller.visualFx.findIndex(f => f.id === `enemy_charge_${ent.id}`);
        if (fxIndex !== -1) controller.visualFx.splice(fxIndex, 1);
      }
    } else {
      // Move towards player and ensure no lingering charge FX
      moveTowardsPlayer(ent, p, dt);
      const fxIndex = controller.visualFx.findIndex(f => f.id === `enemy_charge_${ent.id}`);
      if (fxIndex !== -1) controller.visualFx.splice(fxIndex, 1);
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
  
  // Remove charge fx if present
  const fxIndex = controller.visualFx.findIndex(f => f.id === `enemy_charge_${ent.id}`);
  if (fxIndex !== -1) controller.visualFx.splice(fxIndex, 1);
  
  if (controller.audioEngine) {
    controller.audioEngine.onAttackSwoosh('unified');
  }
}

function updateEnemyAttack(controller, ent, dt) {
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