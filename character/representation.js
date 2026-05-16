export function createCharacter(x, y) {
  // Base shape values scaled up by 1.5x for larger characters
  const shape = {
    bodyBotX: 0, bodyBotY: 0,
    bodyTopX: 0, bodyTopY: -52.5,        // -35 * 1.5
    bodyThickness: 18,                  // 12 * 1.5
    headX: 0, headY: -82.5, headR: 19.5,// -55 * 1.5, 13 * 1.5
    bulgeAX: 0, bulgeAY: -30, bulgeAR: 0,// -20 * 1.5
    bulgeBX: 0, bulgeBY: -30, bulgeBR: 0,
  };
  
  return {
    height: 105,   // 70 * 1.5
    width: 45,     // 30 * 1.5
    current: { ...shape },
    target: { ...shape },
    world: {
      bodyBot: { x, y },
      bodyTop: { x, y: y - 52.5 },
      bodyThickness: 18,
      head: { x, y: y - 82.5, r: 19.5 },
      bulgeA: { x, y: y - 30, r: 0 },
      bulgeB: { x, y: y - 30, r: 0 },
    }
  };
}