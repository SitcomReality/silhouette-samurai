import { ATTACK_FRAME_DATA } from '../../../combat/frame-data.js';
import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applyBladeDancePose(t, dir, attackType, attackProgress) {
  const frameData = ATTACK_FRAME_DATA[attackType];
  const anim = frameData?.anim || {};

  if (attackType === 'dance_starter') {
    const easedProgress = Math.pow(attackProgress, 0.4);
    const startA = anim.startAngle ?? 0.6;
    const endA = anim.endAngle ?? -0.2;
    const currentAngle = Math.PI * startA + easedProgress * Math.PI * (endA - startA);
    const swordLen = anim.swordLen ?? 90;
    
    // Move sword pivot forward so the hilt won't poke out the back during the lunge
    t.swordAX = dir * 8; t.swordAY = -40;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen;
    t.swordThickness = anim.swordThickness ?? 4;
    
    t.bodyTopX = dir * (anim.bodyTopX ?? 15) * easedProgress;
    t.bodyTopY = anim.bodyTopY ?? -35;
    t.headX = dir * (anim.headX ?? 20) * easedProgress;
    t.headY = anim.headY ?? -55;
    t.bodyBotX = dir * (anim.bodyBotX ?? -8) * easedProgress;
    t.bodyBotY = anim.bodyBotY ?? 0;
    return true;
  }
  
  if (attackType === 'dance_linker_neutral') {
    const snap = Math.pow(attackProgress, 0.35);
    const startA = anim.startAngle ?? 0.5;
    const endA = anim.endAngle ?? -0.4;
    const currentAngle = Math.PI * startA - (snap * Math.PI * (startA - endA));
    const swordLen = anim.swordLen ?? 85; 

    t.swordAX = dir * 5; t.swordAY = -35;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen;
    
    t.bodyTopX = dir * (anim.bodyTopX ?? 12) * snap;
    t.bodyTopY = anim.bodyTopY ?? -35;
    t.headX = dir * (anim.headX ?? 18) * snap;
    t.headY = anim.headY ?? -55;
    t.bodyBotX = dir * (anim.bodyBotX ?? -8) * snap;
    t.bodyBotY = anim.bodyBotY ?? 0;
    t.swordThickness = anim.swordThickness ?? 3.5;
    return true;
  }
  
  if (attackType === 'dance_linker_up') {
    const easedProgress = easeOutCubic(attackProgress);
    const startA = anim.startAngle ?? -0.15;
    const endA = anim.endAngle ?? -0.9;
    const arcAngle = Math.PI * startA - (easedProgress * Math.PI * (startA - endA));
    const swordLen = anim.swordLen ?? 52;
    
    t.swordBX = dir * 15 + Math.cos(arcAngle) * swordLen * dir * 0.6;
    t.swordBY = -45 + Math.sin(arcAngle) * swordLen;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    
    t.bodyTopX = dir * ((anim.bodyTopX ?? 14) * easedProgress + 8*(1-easedProgress)); 
    t.bodyTopY = (anim.bodyTopY ?? -38) * easedProgress - 35*(1-easedProgress);
    t.headX = dir * ((anim.headX ?? 20) * easedProgress + 12*(1-easedProgress)); 
    t.headY = (anim.headY ?? -53) * easedProgress - 48*(1-easedProgress);
    t.bodyBotX = anim.bodyBotX ?? 0;
    t.bodyBotY = anim.bodyBotY ?? 0;
    t.swordThickness = anim.swordThickness ?? 3.5;
    return true;
  }
  
  if (attackType === 'dance_linker_down') {
    const easedProgress = easeInOutCubic(attackProgress);
    const startA = anim.startAngle ?? 0.15;
    const endA = anim.endAngle ?? -0.3;
    const arcAngle = Math.PI * startA - (easedProgress * Math.PI * (startA - endA));
    const swordLen = anim.swordLen ?? 58;
    
    t.swordBX = dir * (15 + easedProgress * 20) + Math.cos(arcAngle) * swordLen * dir * 0.5;
    t.swordBY = -10 + Math.sin(arcAngle) * swordLen * 0.5;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyBotX = dir * (anim.bodyBotX ?? -10);
    t.bodyBotY = anim.bodyBotY ?? 0;
    t.bodyTopX = dir * ((anim.bodyTopX ?? 20) * easedProgress + 12*(1-easedProgress)); 
    t.bodyTopY = anim.bodyTopY ?? -18;
    t.headX = dir * ((anim.headX ?? 24) * easedProgress + 18*(1-easedProgress)); 
    t.headY = anim.headY ?? -28;
    t.swordThickness = anim.swordThickness ?? 3.5;
    return true;
  }
  
  if (attackType === 'dance_finisher_neutral') {
    const startA = anim.startAngle ?? 0.9;
    const endA = anim.endAngle ?? -0.7;
    const swordLen = anim.swordLen ?? 62;
    
    if (attackProgress < 0.3) {
      const windup = easeInCubic(attackProgress / 0.3);
      const arcAngle = Math.PI * startA;
      t.swordBX = -dir * (10 + windup * 15) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -40 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      t.bodyTopX = -dir * (10 + windup * 5);
      t.headX = -dir * (15 + windup * 8);
    } else if (attackProgress < 0.4) {
      const snap = (attackProgress - 0.3) / 0.1;
      const arcAngle = Math.PI * startA - (snap * Math.PI * (startA - endA));
      t.swordBX = dir * (snap * 50) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -35 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      t.bodyTopX = dir * ((anim.bodyTopX ?? 25) * snap);
      t.headX = dir * ((anim.headX ?? 30) * snap);
      t.swordThickness = (anim.swordThickness ?? 9) - 2 + snap * 2;
    } else {
      const follow = easeOutCubic((attackProgress - 0.4) / 0.6);
      const arcAngle = Math.PI * endA;
      t.swordBX = dir * (40 + follow * 5) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -25 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
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
    const swordLen = anim.swordLen ?? 60;
    
    t.swordBX = dir * (Math.cos(arcAngle) * swordLen * 0.7 + easedProgress * 20);
    t.swordBY = -30 + Math.sin(arcAngle) * swordLen - easedProgress * 35;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir * 0.7;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
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
    const swordLen = anim.swordLen ?? 70;
    if (attackProgress < 0.25) {
      const tuck = easeInCubic(attackProgress / 0.25);
      t.bodyTopX = 0; t.bodyTopY = -40 - tuck * 5;
      t.headX = 0; t.headY = -55 - tuck * 5;
      t.bodyBotY = -15 - tuck * 10;
      t.swordAX = 0; t.swordAY = -30 - tuck * 15;
      t.swordBX = 0; t.swordBY = -10 + tuck * 5;
      t.swordThickness = (anim.swordThickness ?? 9) - 4;
    } else {
      const plunge = easeInCubic((attackProgress - 0.25) / 0.75);
      t.bodyTopX = anim.bodyTopX ?? 0; 
      t.bodyTopY = (anim.bodyTopY ?? -45) + plunge * 10 - 45*(1-plunge);
      t.headX = anim.headX ?? 0; 
      t.headY = (anim.headY ?? -60) + plunge * 10 - 60*(1-plunge);
      t.bodyBotX = anim.bodyBotX ?? 0;
      t.bodyBotY = (anim.bodyBotY ?? -25) + plunge * 15 - 25*(1-plunge);
      t.swordAX = 0; t.swordAY = -45 + plunge * 30;
      t.swordBX = 0; t.swordBY = -5 + plunge * swordLen;
      t.swordThickness = (anim.swordThickness ?? 9) - 3 + plunge * 3;
    }
    return true;
  }
  return false;
}