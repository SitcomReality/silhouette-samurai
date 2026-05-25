// Visual parameters for aerial attacks
export const AERIAL_ATTACK_VISUALS = {
  // Body rotation for aerial directional attacks
  rotationEnabled: true,
  rotationSpeed: 0.8, // How quickly body aligns to attack angle
  minRotationThreshold: 0.1, // Min angle difference to apply rotation
  
  // Motion streaks
  streakEnabled: true,
  streakCount: 3, // Number of streak lines
  streakLength: 140, // Base length of streaks
  streakWidth: 18, // Base width of streaks
  streakDuration: 0.35, // How long streaks last
  streakSpacing: 12, // Vertical spacing between parallel streaks
  streakOffsetFromBody: -30, // Where streaks spawn relative to player
  
  // Body pose adjustments
  diveExtension: 1.3, // How much to extend body during dive
  headForwardPush: 25, // How far head leads during dive
  bodySquash: 0.85, // Vertical squash during horizontal dives
};