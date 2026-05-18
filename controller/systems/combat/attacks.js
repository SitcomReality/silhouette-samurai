import { resolveAttackHits } from '../../../combat/attacks/resolve.js';
import { triggerAttack } from '../../../combat/attacks/trigger.js';
import { determineAttack, getDirectionInput } from '../../../input/controls.js';

export function updatePlayerAttacks(controller, dt) {
  const p = controller.player;
  
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
    triggerAttack(controller, controller.tunerSelectedAttack || 'neutral');
  }

  // Handle finisher input (block + direction during grace window)
  if (p.finisherTransitionWindow > 0 && p.isBlocking) {
    const direction = getDirectionInput(controller, false); // Don't allow neutral
    if (direction && p.combo >= 5) {
      const finisher = determineAttack(controller, true);
      if (finisher) {
        p.blockToFinisher = true;
        triggerAttack(controller, finisher);
        p.combo = 0; // Finishers reset combo
        p.finisherTransitionWindow = 0;
        p.blockBuffer = null;
        return;
      }
    }
  }

  // Handle block buffer
  if (p.blockBuffer && p.blockBuffer.time > 0) {
    p.blockBuffer.time -= dt;
  }

  // Handle attack buffer
  if (p.attackBuffer && p.attackBuffer.time > 0) {
    p.attackBuffer.time -= dt;
    
    const oldJ = controller.keys['KeyJ'];
    controller.keys['KeyJ'] = true;
    const bufferedType = determineAttack(controller);
    controller.keys['KeyJ'] = oldJ;

    let canAttack = false;
    
    if (p.state !== 'attack' && p.state !== 'dead' && p.state !== 'block' && p.state !== 'stagger') {
      canAttack = true;
    } else if (p.state === 'attack' && p.attackFrameData) {
      const currentFrame = Math.floor(p.attackFrameTime * 60);
      
      if (p.attackFrameData.canCancel(currentFrame)) {
        canAttack = true;
      }
      
      // Chain into next attack during input window
      if (p.bladeDanceState && p.bladeDanceInputWindow > 0) {
        canAttack = true;
      }
      
      if (p.canCounter && p.counterWindow > 0) {
        canAttack = true;
      }
    }
    
    if (canAttack && bufferedType) {
      triggerAttack(controller, bufferedType);
      p.attackBuffer = null;
    }
  }

  const decayTime = 1.4; // Consolidated from COMBO_CONFIG.decayTime if imported
  if (p.state !== 'attack' && p.stateTime > decayTime && p.combo > 0) {
    p.combo = 0;
  }
}