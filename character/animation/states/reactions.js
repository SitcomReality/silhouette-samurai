export function applyReactionPose(t, dir, state) {
  if (state === 'dead') {
    t.bodyBotY = -5; t.bodyTopX = dir * 20; t.bodyTopY = -10;
    t.headX = dir * 35; t.headY = -10;
    t.bodyThickness = 8;
    return true;
  } 
  
  if (state === 'hit') {
    t.bodyTopX = -dir * 15; t.bodyTopY = -30;
    t.headX = -dir * 25; t.headY = -40;
    return true;
  } 
  
  if (state === 'block') {
    t.bodyTopX = -dir * 8; t.bodyTopY = -32;
    t.headX = -dir * 10; t.headY = -52;
    t.bodyThickness = 13;
    t.swordAX = dir * 15; t.swordAY = -45;
    t.swordBX = dir * 5; t.swordBY = -25;
    t.swordThickness = 5;
    return true;
  } 
  
  if (state === 'stagger') {
    t.bodyTopX = -dir * 20; t.bodyTopY = -28;
    t.headX = -dir * 30; t.headY = -35;
    t.bodyBotX = dir * 10;
    t.swordAX = -dir * 20; t.swordAY = -35;
    t.swordBX = -dir * 40; t.swordBY = -25;
    return true;
  } 
  
  if (state === 'trip') {
    t.bodyTopX = dir * 15; t.bodyTopY = -15;
    t.headX = dir * 25; t.headY = -10;
    t.bodyBotY = -5;
    t.bodyThickness = 10;
    return true;
  }
  
  return false;
}