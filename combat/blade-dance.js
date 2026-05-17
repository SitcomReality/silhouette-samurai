import { BLADE_DANCE_DATA } from './frame-data.js';

export class BladeDanceSystem {
  constructor() {}

  get inputWindow() { return BLADE_DANCE_DATA.inputWindow; }
  get cooldown() { return BLADE_DANCE_DATA.cooldown; }
  get finisherGraceWindow() { return 0.4; } // Grace period for transitioning neutral block to directional finisher

  canInitiate(player) {
    if (player.state === 'attack' || player.state === 'block') return false;
    if (player.bladeDanceCooldown > 0) return false;
    return true;
  }

  initiate(player) {
    player.bladeDanceState = 'active';
    player.bladeDanceHitCount = 0;
    player.bladeDanceInputWindow = 0;
    player.bladeDanceFinisherReady = false;
  }

  updateInputWindow(player, dt) {
    if (player.bladeDanceInputWindow > 0) {
      player.bladeDanceInputWindow -= dt;
      if (player.bladeDanceInputWindow <= 0) {
        this.endChain(player);
      }
    }
    if (player.finisherTransitionWindow > 0) {
      player.finisherTransitionWindow -= dt;
    }
  }

  continueChain(player, fromBlock = false) {
    if (!player.bladeDanceState) return;
    
    player.bladeDanceHitCount++;
    player.bladeDanceInputWindow = this.inputWindow;
    
    // After 2 hits, finishers become available
    if (player.bladeDanceHitCount >= 2) {
      player.bladeDanceFinisherReady = true;
    }
    
    // Ultra parry bonus for block->finisher combo
    if (fromBlock && player.blockToFinisher) {
      player.ultraParryBonus = 2.5;
      player.blockToFinisher = false;
    }
  }

  getStandardAttack(direction, isAir) {
    if (isAir) {
      if (direction === 'up') return 'air_up';
      if (direction === 'down') return 'air_down';
      if (direction === 'forward') return 'air_forward';
      return 'air_neutral';
    } else {
      if (direction === 'up') return 'up';
      if (direction === 'down') return 'down';
      // Neutral as double-time linker
      return 'neutral';
    }
  }

  getFinisherAttack(direction) {
    if (direction === 'up') return 'dance_finisher_up';
    if (direction === 'down') return 'dance_finisher_down';
    if (direction === 'forward') return 'dance_finisher_neutral';
    return null; // No neutral finisher without direction
  }

  canPerformFinisher(player) {
    return player.bladeDanceState === 'active' && player.bladeDanceFinisherReady;
  }

  endChain(player) {
    player.bladeDanceState = null;
    player.bladeDanceInputWindow = 0;
    player.bladeDanceHitCount = 0;
    player.bladeDanceFinisherReady = false;
    player.bladeDanceCooldown = this.cooldown;
    player.finisherTransitionWindow = 0;
    player.blockToFinisher = false;
    player.ultraParryBonus = 1.0;
  }
}