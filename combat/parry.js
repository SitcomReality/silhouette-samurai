export class ParrySystem {
  constructor() {
    this.parryWindow = 0.1; // 6 frames at 60fps
    this.staggerDuration = 0.6;
    this.counterBonusDamage = 1.5;
  }

  checkParry(defender, attackFrame) {
    if (!defender.isBlocking || !defender.blockStartTime) return false;
    
    const blockDuration = attackFrame - (defender.blockStartTime || 0);
    const blockFrames = blockDuration * 60;
    
    // Perfect parry window: first 6 frames of block
    if (blockFrames <= 6) {
      return true;
    }
    
    return false;
  }

  applyParry(defender, attacker, controller) {
    // Stagger the attacker
    attacker.state = 'stagger';
    attacker.stateTime = 0;
    attacker.staggerTimer = this.staggerDuration;
    attacker.vx = (attacker.facing === 'right' ? -1 : 1) * 8;
    attacker.vy = -2;
    
    // Grant defender immediate cancel and counter bonus
    defender.state = 'idle';
    defender.isBlocking = false;
    defender.canCounter = true;
    defender.counterWindow = 0.5;
    defender.counterBonusDamage = this.counterBonusDamage;
    
    // Visual/audio feedback
    controller.hitstop = 4;
    controller.screenShake = 10;
    
    if (controller.audioEngine) {
      controller.audioEngine.sfx.playParry();
    }
    
    // Spawn parry flash effect
    controller.visualFx.push({
      id: `fx_parry_${controller.fxId++}`,
      type: 'parry_flash',
      x: defender.x + (defender.facing === 'right' ? 1 : -1) * 30,
      y: defender.y - 40,
      life: 0,
      maxLife: 0.15
    });
  }

  checkClash(attacker1, attacker2, controller) {
    // Both must be in active attack frames
    if (attacker1.state !== 'attack' || attacker2.state !== 'attack') return false;
    if (!attacker1.attackFrameData || !attacker2.attackFrameData) return false;
    
    const frame1 = Math.floor(attacker1.attackFrameTime * 60);
    const frame2 = Math.floor(attacker2.attackFrameTime * 60);
    
    if (!attacker1.attackFrameData.isActive(frame1)) return false;
    if (!attacker2.attackFrameData.isActive(frame2)) return false;
    
    // Check hitbox overlap
    const dist = Math.abs(attacker1.x - attacker2.x);
    if (dist > 80) return false;
    
    return true;
  }

  applyClash(attacker1, attacker2, controller) {
    // Push both back
    const dir1 = attacker1.facing === 'right' ? -1 : 1;
    const dir2 = attacker2.facing === 'right' ? -1 : 1;
    
    attacker1.vx = dir1 * 10;
    attacker1.vy = -3;
    attacker1.state = 'idle';
    attacker1.attackType = 'none';
    attacker1.attackFrameTime = 0;
    
    attacker2.vx = dir2 * 10;
    attacker2.vy = -3;
    attacker2.state = 'idle';
    attacker2.attackType = 'none';
    attacker2.attackFrameTime = 0;
    
    // Effects
    controller.hitstop = 3;
    controller.screenShake = 6;
    
    if (controller.audioEngine) {
      controller.audioEngine.sfx.playClash();
    }
    
    // Spawn clash spark
    const midX = (attacker1.x + attacker2.x) / 2;
    const midY = Math.min(attacker1.y - 40, attacker2.y - 40);
    controller.visualFx.push({
      id: `fx_clash_${controller.fxId++}`,
      type: 'clash_spark',
      x: midX,
      y: midY,
      life: 0,
      maxLife: 0.2
    });
  }
}