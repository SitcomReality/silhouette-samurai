export const ATTACK_CONFIG = {
  jab: {
    duration: 0.25,
    endlag: 0.05,
    vx: 0,
    vy: 0,
    reach: 45,
    damage: 10,
    pushback: 3,
    launchVy: -1,
    resetComboOnMiss: false
  },
  lunge: {
    duration: 0.45,
    endlag: 0.2,
    vx: 15,
    vy: 0,
    reach: 70,
    damage: 20,
    pushback: 8,
    launchVy: -3,
    resetComboOnMiss: false
  },
  uppercut: {
    duration: 0.4,
    endlag: 0.2,
    vx: 12,
    vy: -2,
    reach: 60,
    damage: 25,
    pushback: 4,
    launchVy: -12,
    resetComboOnMiss: true
  },
  air_thrust: {
    duration: 0.35,
    endlag: 0.15,
    vx: 14,
    vy: -10,
    reach: 65,
    damage: 25,
    pushback: 8,
    launchVy: -6,
    resetComboOnMiss: false
  },
  slide: {
    duration: 0.4,
    endlag: 0.15,
    vx: 14,
    vy: 0,
    reach: 80,
    damage: 15,
    pushback: 6,
    launchVy: -8,
    resetComboOnMiss: false
  },
  roundhouse: {
    duration: 0.4,
    endlag: 0.25,
    vx: 8,
    vy: -4,
    reach: 70,
    damage: 30,
    pushback: 10,
    launchVy: -6,
    resetComboOnMiss: true
  },
  slam: {
    duration: 0.65,
    endlag: 0.3,
    vx: 6,
    vy: -13,
    reach: 90,
    damage: 45,
    pushback: 12,
    launchVy: -8,
    resetComboOnMiss: true
  }
};