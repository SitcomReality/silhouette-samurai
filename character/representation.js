export function createCharacter(x, y) {
  const shape = {
    bodyBotX: 0, bodyBotY: 0,
    bodyTopX: 0, bodyTopY: -70,
    bodyThickness: 24,
    headX: 0, headY: -110, headR: 26,
    bulgeAX: 0, bulgeAY: -40, bulgeAR: 0,
    bulgeBX: 0, bulgeBY: -40, bulgeBR: 0,
  };
  
  return {
    height: 140,
    width: 60,
    current: { ...shape },
    target: { ...shape },
    world: {
      bodyBot: { x, y },
      bodyTop: { x, y: y - 70 },
      bodyThickness: 24,
      head: { x, y: y - 110, r: 26 },
      bulgeA: { x, y: y - 40, r: 0 },
      bulgeB: { x, y: y - 40, r: 0 },
    }
  };
}