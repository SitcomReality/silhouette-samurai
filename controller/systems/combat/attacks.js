import { resolveAttackHits } from '../../../combat/attacks/resolve.js';
import { triggerUnifiedAttack } from '../../../combat/attacks/trigger.js';
import { CHARGE_CONFIG } from '../../../combat/frame-data.js';

export function updatePlayerAttacks(controller, dt) {
  const p = controller.player;
  
  // Update charge time if charging
  if (p.attackCharging && !controller.freezePlayer) {
    p.attackChargeTime += dt;
    p.attackChargeTime = Math.min(p.attackChargeTime, CHARGE_CONFIG.maxChargeTime);
  }
  
  if (p.state === 'attack') {
    p.attackFrameTime += dt;
    const currentFrame = Math.floor(p.attackFrameTime * 60);
    const frameData = p.attackFrameData;
    
    if (!frameData) {
      p.state = 'idle';
      p.attackType = 'none';
      return;
    }
    
    if (currentFrame >= frameData.totalFrames) {
      p.state = 'idle';
      p.attackType = 'none';
      p.attackFrameTime = 0;
      p.attackFrameData = null;
      p.attackHitEntities.clear();
      return;
    }
    
    resolveAttackHits(controller);
  }

  // Auto-loop selected attack for tuning
  if (controller.loopSelectedAttack && p.state !== 'attack' && p.state !== 'dead') {
    p.vx = 0;
    p.vy = 0;
    // Simulate a full charge unified attack
    p.attackBuffer = {
      btn: 1,
      time: 0.2,
      chargeTime: CHARGE_CONFIG.maxChargeTime,
      movementVector: { x: 1, y: 0 }
    };
  }

  // Handle block buffer
  if (p.blockBuffer && p.blockBuffer.time > 0) {
    p.blockBuffer.time -= dt;
  }

  // Handle attack buffer (now includes charge data)
  if (p.attackBuffer && p.attackBuffer.time > 0) {
    p.attackBuffer.time -= dt;

    let canAttack = false;
    
    if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block' && p.state !== 'stagger') {
      canAttack = true;
    } else if (p.state === 'attack' && p.attackFrameData) {
      const currentFrame = Math.floor(p.attackFrameTime * 60);
      
      if (p.attackFrameData.canCancel(currentFrame)) {
        canAttack = true;
      }
      
      if (p.canCounter && p.counterWindow > 0) {
        canAttack = true;
      }
    }
    
    if (canAttack) {
      triggerUnifiedAttack(controller, p.attackBuffer.chargeTime || 0, p.attackBuffer.movementVector || { x: 0, y: 0 });
      p.attackBuffer = null;
    }
  }

  const decayTime = 1.4;
  if (p.state !== 'attack' && p.stateTime > decayTime && p.combo > 0) {
    p.combo = 0;
  }
}