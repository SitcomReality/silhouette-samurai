export const ATTACK_CONFIG = {
  slash: {
    duration: 0.25,
    endlag: 0.05,
    vx: 0,
    vy: 0,
    reach: 65,
    damage: 10,
    pushback: 4,
    launchVy: -2,
    resetComboOnMiss: false
  },
  thrust: {
    duration: 0.35,
    endlag: 0.15,
    vx: 22,
    vy: 0,
    reach: 85,
    damage: 18,
    pushback: 8,
    launchVy: -3,
    resetComboOnMiss: false
  },
  rising_slash: {
    duration: 0.4,
    endlag: 0.2,
    vx: 10,
    vy: -4,
    reach: 70,
    damage: 22,
    pushback: 4,
    launchVy: -14,
    resetComboOnMiss: true
  },
  up_slash: {
    duration: 0.35,
    endlag: 0.15,
    vx: 8,
    vy: -8,
    reach: 70,
    damage: 20,
    pushback: 6,
    launchVy: -10,
    resetComboOnMiss: false
  },
  sweep: {
    duration: 0.4,
    endlag: 0.15,
    vx: 16,
    vy: 0,
    reach: 80,
    damage: 15,
    pushback: 5,
    launchVy: -12, // Pops them up for combos
    resetComboOnMiss: false
  },
  heavy_slash: {
    duration: 0.45,
    endlag: 0.25,
    vx: 12,
    vy: 0,
    reach: 95, // extended reach for better tippers
    damage: 30,
    pushback: 12,
    launchVy: -6,
    resetComboOnMiss: true
  },
  down_thrust: {
    duration: 0.6,
    endlag: 0.3,
    vx: 0,
    vy: 20, // Fast fall downwards!
    reach: 70,
    damage: 40,
    pushback: 10,
    launchVy: -10, // bounces them up off ground
    resetComboOnMiss: true
  }
};