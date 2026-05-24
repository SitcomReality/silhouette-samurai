import { PHYSICS_DATA } from './config/physics.js';
import { COMBO_CONFIG } from './config/combo.js';
import { AttackFrameData } from './AttackFrameData.js';
import { FINISHER_ATTACKS } from './attacks/data/finishers.js';
import { UNIFIED_ATTACK, CHARGE_CONFIG } from './attacks/data/unified.js';

export { PHYSICS_DATA, COMBO_CONFIG, AttackFrameData, UNIFIED_ATTACK, CHARGE_CONFIG };

export const ATTACK_FRAME_DATA = {
  ...FINISHER_ATTACKS,
  unified: UNIFIED_ATTACK
};