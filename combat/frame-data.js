import { PHYSICS_DATA } from './config/physics.js';
import { COMBO_CONFIG } from './config/combo.js';
import { SWOOSH_CONFIG } from './config/swoosh.js';
import { AttackFrameData } from './AttackFrameData.js';
import { GROUND_ATTACKS } from './attacks/data/ground.js';
import { AIR_ATTACKS } from './attacks/data/air.js';
import { FINISHER_ATTACKS } from './attacks/data/finishers.js';

export { PHYSICS_DATA, COMBO_CONFIG, SWOOSH_CONFIG, AttackFrameData };

export const ATTACK_FRAME_DATA = {
  ...GROUND_ATTACKS,
  ...AIR_ATTACKS,
  ...FINISHER_ATTACKS
};