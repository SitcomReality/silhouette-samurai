export function createCharacter(x, y) {
  return {
    core: { x, y: y - 50 },
    coreRadius: 11,
    height: 100,
    width: 20,
    head: { x, y: y - 100, radius: 13 },
    arm: { 
      length: 0,
      angle: 0,
      origin: { x, y: y - 70 }
    },
    legs: {
      leftAngle: 0,
      rightAngle: 0,
      length: 45
    }
  };
}