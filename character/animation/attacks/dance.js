import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applyBladeDancePose(t, dir, attackType, attackProgress) {
  if (attackType === 'dance_starter') {
    const easedProgress = Math.pow(attackProgress, 0.4);
    const startAngle = Math.PI * 0.6; // High windup
    const endAngle = -Math.PI * 0.2;
    const currentAngle = startAngle + easedProgress * (endAngle - startAngle);
    const swordLen = 90;
    
    t.swordAX = dir * -5; t.swordAY = -40;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen;
    t.swordThickness = 4;
    
    t.bodyTopX = dir * 15 * easedProgress;
    t.headX = dir * 20 * easedProgress;
    t.bodyBotX = -dir * 8 * easedProgress;
    return true;
  }
  
  if (attackType === 'dance_linker_neutral') {
    // Swift circular flurry instead of a poke
    const snap = Math.pow(attackProgress, 0.35);
    const startAngle = Math.PI * 0.5;
    const currentAngle = startAngle - (snap * Math.PI * 0.9);
    const swordLen = 85; 

    t.swordAX = dir * 5; t.swordAY = -35;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen;
    
    t.bodyTopX = dir * 12 * snap;
    t.headX = dir * 18 * snap;
    t.bodyBotX = -dir * 8 * snap;
    t.swordThickness = 3.5;
    return true;
  }
  
  if (attackType === 'dance_linker_up') {
    const easedProgress = easeOutCubic(attackProgress);
    const arcAngle = -Math.PI * 0.15 - (easedProgress * Math.PI * 0.75);
    const swordLen = 52;
    t.swordBX = dir * 15 + Math.cos(arcAngle) * swordLen * dir * 0.6;
    t.swordBY = -45 + Math.sin(arcAngle) * swordLen;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyTopX = dir * (8 + easedProgress * 6); t.bodyTopY = -35 - easedProgress * 3;
    t.headX = dir * (12 + easedProgress * 8); t.headY = -48 - easedProgress * 5;
    return true;
  }
  
  if (attackType === 'dance_linker_down') {
    const easedProgress = easeInOutCubic(attackProgress);
    const arcAngle = Math.PI * 0.15 - (easedProgress * Math.PI * 0.45);
    const swordLen = 58;
    t.swordBX = dir * (15 + easedProgress * 20) + Math.cos(arcAngle) * swordLen * dir * 0.5;
    t.swordBY = -10 + Math.sin(arcAngle) * swordLen * 0.5;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyBotX = -dir * 10;
    t.bodyTopX = dir * (12 + easedProgress * 8); t.bodyTopY = -18;
    t.headX = dir * (18 + easedProgress * 6); t.headY = -28;
    return true;
  }
  
  if (attackType === 'dance_finisher_neutral') {
    if (attackProgress < 0.3) {
      const windup = easeInCubic(attackProgress / 0.3);
      const arcAngle = Math.PI * 0.9;
      const swordLen = 60;
      t.swordBX = -dir * (10 + windup * 15) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -40 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      t.bodyTopX = -dir * (10 + windup * 5);
      t.headX = -dir * (15 + windup * 8);
    } else if (attackProgress < 0.4) {
      const snap = (attackProgress - 0.3) / 0.1;
      const arcAngle = Math.PI * 0.9 - (snap * Math.PI * 1.6);
      const swordLen = 62;
      t.swordBX = dir * (snap * 50) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -35 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      t.bodyTopX = dir * (snap * 25);
      t.headX = dir * (snap * 30);
      t.swordThickness = 7 + snap * 2;
    } else {
      const follow = easeOutCubic((attackProgress - 0.4) / 0.6);
      const arcAngle = -Math.PI * 0.7;
      const swordLen = 60;
      t.swordBX = dir * (40 + follow * 5) + Math.cos(arcAngle) * swordLen * dir * 0.5;
      t.swordBY = -25 + Math.sin(arcAngle) * swordLen * 0.5;
      t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
      t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
      t.bodyTopX = dir * (25 - follow * 5); t.bodyTopY = -30 + follow * 5;
      t.headX = dir * (30 - follow * 5); t.headY = -40 + follow * 5;
      t.swordThickness = 9 - follow * 2;
    }
    return true;
  }
  
  if (attackType === 'dance_finisher_up') {
    const easedProgress = attackProgress < 0.3 ? easeInCubic(attackProgress / 0.3) * 0.3 :
                          0.3 + easeOutCubic((attackProgress - 0.3) / 0.7) * 0.7;
    const arcAngle = -Math.PI * 0.6 + (easedProgress * Math.PI * 1.5);
    const swordLen = 60;
    t.swordBX = dir * (Math.cos(arcAngle) * swordLen * 0.7 + easedProgress * 20);
    t.swordBY = -30 + Math.sin(arcAngle) * swordLen - easedProgress * 35;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir * 0.7;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyTopX = t.swordBX * 0.5; t.bodyTopY = t.swordBY + 10;
    t.headX = t.swordBX * 0.6; t.headY = t.swordBY - 5;
    t.bodyBotY = -easedProgress * 18;
    t.bodyBotX = -dir * easedProgress * 8;
    return true;
  }
  
  if (attackType === 'dance_finisher_down') {
    if (attackProgress < 0.25) {
      const tuck = easeInCubic(attackProgress / 0.25);
      t.bodyTopX = 0; t.bodyTopY = -40 - tuck * 5;
      t.headX = 0; t.headY = -55 - tuck * 5;
      t.bodyBotY = -15 - tuck * 10;
      t.swordAX = 0; t.swordAY = -30 - tuck * 15;
      t.swordBX = 0; t.swordBY = -10 + tuck * 5;
      t.swordThickness = 5;
    } else {
      const plunge = easeInCubic((attackProgress - 0.25) / 0.75);
      t.bodyTopX = 0; t.bodyTopY = -45 + plunge * 10;
      t.headX = 0; t.headY = -60 + plunge * 10;
      t.bodyBotY = -25 + plunge * 15;
      t.swordAX = 0; t.swordAY = -45 + plunge * 30;
      t.swordBX = 0; t.swordBY = -5 + plunge * 70;
      t.swordThickness = 6 + plunge * 3;
    }
    return true;
  }
  return false;
}