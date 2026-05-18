import { ATTACK_FRAME_DATA } from '../../../combat/frame-data.js';
import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applyBasicAttackPose(t, dir, attackType, attackProgress) {
  const frameData = ATTACK_FRAME_DATA[attackType];
  const anim = frameData?.anim || {};

  const sLen = anim.swordStartLen ?? (anim.swordLen ?? 64);
  const eLen = anim.swordLen ?? 64;
  const currentLen = sLen + (eLen - sLen) * attackProgress;
  const originY = anim.swordOriginY ?? -40;

  if (attackType === 'forward') {
    const easedProgress = Math.pow(attackProgress, 0.4);
    const startA = anim.startAngle ?? 0.7;
    const endA = anim.endAngle ?? 0;
    const currentAngle = Math.PI * startA + easedProgress * Math.PI * (endA - startA);
    
    t.swordAX = dir * 8; t.swordAY = originY;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * currentLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * currentLen;
    t.swordThickness = anim.swordThickness ?? 4;
    
    t.bodyTopX = dir * (anim.bodyTopX ?? 2) * easedProgress;
    t.bodyTopY = anim.bodyTopY ?? -35;
    t.headX = dir * (anim.headX ?? 0) * easedProgress;
    t.headY = anim.headY ?? -55;
    t.bodyBotX = dir * (anim.bodyBotX ?? -9) * easedProgress;
    t.bodyBotY = anim.bodyBotY ?? -6;
    return true;
  }
  
  if (attackType === 'neutral' || attackType === 'air_neutral' || attackType === 'slash') {
    const snap = Math.pow(attackProgress, 0.4);
    const startA = anim.startAngle ?? 0.4;
    const endA = anim.endAngle ?? -0.4;
    const arcAngle = (Math.PI * startA) - (snap * Math.PI * (startA - endA));
    
    t.swordAX = dir * -5; t.swordAY = originY;
    t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
    t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
    t.swordThickness = (anim.swordThickness ?? 3) + (1 - snap) * 2;
    
    t.bodyTopX = dir * (anim.bodyTopX ?? 8) * snap;
    t.bodyTopY = anim.bodyTopY ?? -35;
    t.headX = dir * (anim.headX ?? 12) * snap;
    t.headY = anim.headY ?? -55;
    t.bodyBotX = dir * (anim.bodyBotX ?? -5) * snap;
    t.bodyBotY = anim.bodyBotY ?? 0;
    return true;
  }
  
  if (attackType === 'air_forward' || attackType === 'thrust') {
    const snap = Math.pow(attackProgress, 0.3);
    
    if (attackProgress < 0.2) {
      const wind = attackProgress / 0.2;
      t.bodyTopX = -dir * 10 * wind;
      t.swordAX = -dir * 15; t.swordAY = originY;
      t.swordBX = -dir * 30; t.swordBY = originY;
    } else {
      const strike = (attackProgress - 0.2) / 0.8;
      const easedStrike = easeOutCubic(strike);
      
      t.bodyTopX = dir * (anim.bodyTopX ?? 15) * easedStrike;
      t.bodyTopY = anim.bodyTopY ?? -35;
      t.headX = dir * (anim.headX ?? 20) * easedStrike;
      t.headY = anim.headY ?? -55;
      t.bodyBotX = dir * (anim.bodyBotX ?? -10) * easedStrike;
      t.bodyBotY = anim.bodyBotY ?? 0;
      
      t.swordAX = dir * 10; t.swordAY = originY;
      t.swordBX = t.swordAX + dir * currentLen * Math.min(1.1, easedStrike * 1.2); 
      t.swordBY = originY;
      t.swordThickness = anim.swordThickness ?? 4;
    }
    return true;
  }
  
  if (attackType === 'up' || attackType === 'air_up' || attackType === 'up_slash') {
    const easedProgress = attackProgress < 0.25 ? easeInCubic(attackProgress / 0.25) * 0.25 :
                          0.25 + easeOutCubic((attackProgress - 0.25) / 0.75) * 0.75;
    const startA = anim.startAngle ?? -0.25;
    const endA = anim.endAngle ?? -1.35;
    const arcAngle = (Math.PI * startA) - (easedProgress * Math.PI * (startA - endA));
    
    t.swordAX = dir * 5; t.swordAY = originY - 15;
    t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
    t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
    t.swordThickness = (anim.swordThickness ?? 2.5) + (1 - easedProgress) * 1.5;
    
    t.bodyTopX = dir * ((anim.bodyTopX ?? 20) * easedProgress);
    t.bodyTopY = (anim.bodyTopY ?? -48) * easedProgress - 40 * (1-easedProgress);
    t.bodyBotY = (anim.bodyBotY ?? -14) * easedProgress;
    t.headX = dir * ((anim.headX ?? 26) * easedProgress);
    t.headY = (anim.headY ?? -60) * easedProgress - 50 * (1-easedProgress);
    return true;
  }
  
  if (attackType === 'down' || attackType === 'air_down' || attackType === 'sweep') {
    const easedProgress = easeInOutCubic(attackProgress);
    const startA = anim.startAngle ?? 0.15;
    const endA = anim.endAngle ?? -0.35;
    const arcAngle = (Math.PI * startA) - (easedProgress * Math.PI * (startA - endA));
    
    t.swordAX = dir * (15 + easedProgress * 15); t.swordAY = originY + 25;
    t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
    t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
    t.bodyBotX = dir * (anim.bodyBotX ?? -10);
    t.bodyBotY = anim.bodyBotY ?? 0;
    t.bodyTopX = dir * ((anim.bodyTopX ?? 22) * easedProgress); 
    t.bodyTopY = anim.bodyTopY ?? -15;
    t.headX = dir * ((anim.headX ?? 26) * easedProgress); 
    t.headY = anim.headY ?? -25;
    t.swordThickness = anim.swordThickness ?? 3;
    return true;
  }
  
  return false;
}