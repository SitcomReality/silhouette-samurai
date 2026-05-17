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
      
      if (p.bladeDanceState && !controller.bladeDance.canAdvanceChain(p)) {
        controller.bladeDance.endChain(p);
      }
      return;
    }
    
    if (p.bladeDanceState && frameData.isInRecovery(currentFrame)) {
      const recoveryProgress = (currentFrame - (frameData.startup + frameData.active)) / frameData.recovery;
      
      // Delay the window opening until later in the recovery (e.g., after 35% progress)
      // This forces the "beat" to be distinct from the hit impact.
      if (recoveryProgress > 0.35 && recoveryProgress < 0.85 && p.bladeDanceInputWindow === 0) {
        if (p.bladeDanceState === 'linker' && p.bladeDanceCanRepeatLinker) {
          p.bladeDanceInputWindow = controller.bladeDance.repeatWindow;
        } else {
          p.bladeDanceInputWindow = controller.bladeDance.inputWindow;
        }
      }
    }
    
    resolveAttackHits(controller);
  }

  // Auto-loop selected attack for tuning
  if (controller.loopSelectedAttack && p.state !== 'attack' && p.state !== 'dead') {
    // Prevent the player from drifting while auto-looping; ensure consistent test conditions
    p.vx = 0;
    // For tuner auto-loop we zero vertical velocity so ground/air-specific movement won't reposition the player
    p.vy = 0;
    // Trigger the selected attack; triggerAttack will suppress movement when loopSelectedAttack is true
    triggerAttack(controller, controller.tunerSelectedAttack || 'neutral');
  }

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
      
      if (p.bladeDanceState && controller.bladeDance.canAdvanceChain(p)) {
        const direction = getDirectionInput(controller);
        const nextAttack = controller.bladeDance.advanceChain(p, direction);
        if (nextAttack) {
          triggerAttack(controller, nextAttack);
          p.attackBuffer = null;
          return;
        }
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

  if (p.state !== 'attack' && p.stateTime > 2.5 && p.combo > 0) {
    p.combo = 0;
  }
}