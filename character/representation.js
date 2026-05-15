export function createCharacter(x, y) {
  return {
    core: { x, y: y - 65 },
    coreRadius: 11,
    height: 50,
    width: 20,
    head: { x, y: y - 100, radius: 13 },
    arm: { 
      length: 0,
      angle: 0,
      origin: { x, y: y - 65 }
    },
    legs: {
      leftAngle: 0,
      rightAngle: 0,
      length: 40
    }
  };
}