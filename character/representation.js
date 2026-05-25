export function createCharacter(x, y) {
  const shape = {
    bodyBotX: 0, bodyBotY: 0,
    bodyTopX: 0, bodyTopY: -35,
    bodyThickness: 12,
    headX: 0, headY: -55, headR: 13,
    bulgeAX: 0, bulgeAY: -20, bulgeAR: 0,
    bulgeBX: 0, bulgeBY: -20, bulgeBR: 0,
    swordAX: 0, swordAY: -35, swordBX: 0, swordBY: -35, swordThickness: 4,
    rotation: 0,
  };
  
  return {
    height: 70,
    width: 30,
    current: { ...shape },
    target: { ...shape },
    world: {
      bodyBot: { x, y },
      bodyTop: { x, y: y - 35 },
      bodyThickness: 12,
      head: { x, y: y - 55, r: 13 },
      bulgeA: { x, y: y - 20, r: 0 },
      bulgeB: { x, y: y - 20, r: 0 },
      sword: { ax: x, ay: y - 35, bx: x, by: y - 35, thickness: 4 },
    }
  };
}