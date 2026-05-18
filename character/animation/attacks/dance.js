import { ATTACK_FRAME_DATA } from '../../../combat/frame-data.js';
import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applyFinisherPose(t, dir, attackType, attackProgress) {
  const frameData = ATTACK_FRAME_DATA[attackType];
  const anim = frameData?.anim || {};
  const sLen = anim.swordStartLen ?? (anim.swordLen ?? 62);
  const eLen = anim.swordLen ?? 62;
  const currentLen = sLen + (eLen - sLen) * attackProgress;
  const originY = anim.swordOriginY ?? -40;
  
  if (attackType === 'dance_finisher_neutral') {
    const startA = anim.startAngle ?? 0.9;
    const endA = anim.endAngle ?? -0.7;
    
    if (attackProgress < 0.3) {
      const windup = easeInCubic(attackProgress / 0.3);
      const arcAngle = Math.PI * startA;
      t.swordAX = -dir * (10 + windup * 5); t.swordAY = originY;
      t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
      t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
      t.bodyTopX = -dir * (10 + windup * 5);
      t.headX = -dir * (15 + windup * 8);
    } else if (attackProgress < 0.4) {
      const snap = (attackProgress - 0.3) / 0.1;
      const arcAngle = Math.PI * startA - (snap * Math.PI * (startA - endA));
      t.swordAX = dir * (snap * 25); t.swordAY = originY;
      t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
      t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
      t.bodyTopX = dir * ((anim.bodyTopX ?? 25) * snap);
      t.headX = dir * ((anim.headX ?? 30) * snap);
      t.swordThickness = (anim.swordThickness ?? 9) - 2 + snap * 2;
    } else {
      const follow = easeOutCubic((attackProgress - 0.4) / 0.6);
      const arcAngle = Math.PI * endA;
      t.swordAX = dir * (25 - follow * 5); t.swordAY = originY + 10;
      t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
      t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
      t.bodyTopX = dir * ((anim.bodyTopX ?? 25) - follow * 5); 
      t.bodyTopY = (anim.bodyTopY ?? -30) + follow * 5;
      t.headX = dir * ((anim.headX ?? 30) - follow * 5); 
      t.headY = (anim.headY ?? -40) + follow * 5;
      t.swordThickness = (anim.swordThickness ?? 9) - follow * 2;
    }
    t.bodyBotX = anim.bodyBotX ?? 0;
    t.bodyBotY = anim.bodyBotY ?? 0;
    return true;
  }
  
  if (attackType === 'dance_finisher_up') {
    const easedProgress = attackProgress < 0.3 ? easeInCubic(attackProgress / 0.3) * 0.3 :
                          0.3 + easeOutCubic((attackProgress - 0.3) / 0.7) * 0.7;
    const startA = anim.startAngle ?? -0.6;
    const endA = anim.endAngle ?? 0.9;
    const arcAngle = Math.PI * startA + (easedProgress * Math.PI * (endA - startA));
    
    t.swordAX = dir * (easedProgress * 15); t.swordAY = originY;
    t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
    t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
    t.bodyTopX = dir * ((anim.bodyTopX ?? 20) * easedProgress); 
    t.bodyTopY = (anim.bodyTopY ?? -40) * easedProgress - 30 * (1-easedProgress);
    t.headX = dir * ((anim.headX ?? 25) * easedProgress); 
    t.headY = (anim.headY ?? -55) * easedProgress - 45 * (1-easedProgress);
    t.bodyBotY = (anim.bodyBotY ?? -18) * easedProgress;
    t.bodyBotX = dir * ((anim.bodyBotX ?? -8) * easedProgress);
    t.swordThickness = anim.swordThickness ?? 5;
    return true;
  }
  
  if (attackType === 'dance_finisher_down') {
    if (attackProgress < 0.25) {
      const tuck = easeInCubic(attackProgress / 0.25);
      t.bodyTopX = 0; t.bodyTopY = -40 - tuck * 5;
      t.headX = 0; t.headY = -55 - tuck * 5;
      t.bodyBotY = -15 - tuck * 10;
      t.swordAX = 0; t.swordAY = originY + 15 - tuck * 15;
      t.swordBX = 0; t.swordBY = originY + 35 + tuck * 5;
      t.swordThickness = (anim.swordThickness ?? 9) - 4;
    } else {
      const plunge = easeInCubic((attackProgress - 0.25) / 0.75);
      t.bodyTopX = anim.bodyTopX ?? 0; 
      t.bodyTopY = (anim.bodyTopY ?? -45) + plunge * 10 - 45*(1-plunge);
      t.headX = anim.headX ?? 0; 
      t.headY = (anim.headY ?? -60) + plunge * 10 - 60*(1-plunge);
      t.bodyBotX = anim.bodyBotX ?? 0;
      t.bodyBotY = (anim.bodyBotY ?? -25) + plunge * 15 - 25*(1-plunge);
      t.swordAX = 0; t.swordAY = originY;
      t.swordBX = 0; t.swordBY = originY + 40 + plunge * currentLen;
      t.swordThickness = (anim.swordThickness ?? 9) - 3 + plunge * 3;
    }
    return true;
  }
  return false;
}