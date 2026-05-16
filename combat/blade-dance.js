export class BladeDanceSystem {
  constructor() {
    // Increased windows to make the "beat" more deliberate and reactable
    this.inputWindow = 0.45; // ~27 frames at 60fps
    this.repeatWindow = 0.35;
    this.cooldown = 0.4;
  }

  canInitiate(player) {
    if (!player.isGrounded) return false;
    if (player.state === 'attack' || player.state === 'block') return false;
    if (player.bladeDanceCooldown > 0) return false;
    return true;
  }

  initiate(player) {
    player.bladeDanceState = 'starter';
    player.bladeDanceHitCount = 0;
    player.bladeDanceLinkerCount = 0;
    player.bladeDanceInputWindow = 0;
    player.bladeDanceCanRepeatLinker = false;
  }

  updateInputWindow(player, dt) {
    if (player.bladeDanceInputWindow > 0) {
      player.bladeDanceInputWindow -= dt;
    }
  }

  canAdvanceChain(player) {
    if (!player.bladeDanceState) return false;
    if (player.bladeDanceInputWindow <= 0) return false;
    return true;
  }

  advanceChain(player, direction) {
    if (player.bladeDanceState === 'starter') {
      // Advance to linker
      player.bladeDanceState = 'linker';
      player.bladeDanceHitCount = 1;
      player.bladeDanceLinkerCount = 0;
      player.bladeDanceCanRepeatLinker = true;
      return this.getLinkerAttack(direction);
    } else if (player.bladeDanceState === 'linker') {
      if (player.bladeDanceCanRepeatLinker && player.bladeDanceLinkerCount < 1) {
        // Repeat linker once
        player.bladeDanceLinkerCount++;
        player.bladeDanceHitCount++;
        player.bladeDanceCanRepeatLinker = false;
        return this.getLinkerAttack(direction);
      } else {
        // Advance to finisher
        player.bladeDanceState = 'finisher';
        player.bladeDanceHitCount++;
        return this.getFinisherAttack(direction);
      }
    }
    return null;
  }

  getLinkerAttack(direction) {
    if (direction === 'up') return 'dance_linker_up';
    if (direction === 'down') return 'dance_linker_down';
    return 'dance_linker_neutral';
  }

  getFinisherAttack(direction) {
    if (direction === 'up') return 'dance_finisher_up';
    if (direction === 'down') return 'dance_finisher_down';
    return 'dance_finisher_neutral';
  }

  endChain(player) {
    player.bladeDanceState = null;
    player.bladeDanceInputWindow = 0;
    player.bladeDanceHitCount = 0;
    player.bladeDanceLinkerCount = 0;
    player.bladeDanceCanRepeatLinker = false;
    player.bladeDanceCooldown = this.cooldown;
  }

  canDodgeCancel(player) {
    return player.bladeDanceState === 'linker' && !player.bladeDanceCanRepeatLinker;
  }

  dodgeCancel(player) {
    this.endChain(player);
    player.state = 'dodge';
    player.dodgeTimer = 0.3;
    const dir = player.facing === 'right' ? -1 : 1;
    player.vx = dir * 15;
    player.vy = -2;
  }
}