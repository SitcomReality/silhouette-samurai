import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applySpecialAttackPose(t, dir, attackType, attackProgress) {
  if (attackType === 'rising_slash') {
    const easedProgress = attackProgress < 0.2 ? easeInCubic(attackProgress / 0.2) * 0.2 : 
                          0.2 + easeOutCubic((attackProgress - 0.2) / 0.8) * 0.8;
    const arcAngle = -Math.PI * 0.6 + (easedProgress * Math.PI * 1.2);
    const swordLen = 55;
    t.swordBX = dir * (Math.cos(arcAngle) * swordLen * 0.7 + easedProgress * 25);
    t.swordBY = -30 + Math.sin(arcAngle) * swordLen - easedProgress * 30;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir * 0.7;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyTopX = t.swordBX * 0.5; t.bodyTopY = t.swordBY + 10;
    t.headX = t.swordBX * 0.6; t.headY = t.swordBY - 5;
    t.bodyBotY = -easedProgress * 15;
    t.bodyBotX = -dir * easedProgress * 8;
    return true;
  }
  
  if (attackType === 'down_thrust') {
    if (attackProgress < 0.25) {
      const tuck = easeInCubic(attackProgress / 0.25);
      t.bodyTopX = 0; t.bodyTopY = -40 - tuck * 5;
      t.headX = 0; t.headY = -55 - tuck * 5;
      t.bodyBotY = -15 - tuck * 10;
      t.swordAX = 0; t.swordAY = -30 - tuck * 15;
      t.swordBX = 0; t.swordBY = -10 + tuck * 5;
      t.swordThickness = 4;
    } else {
      const plunge = easeInCubic((attackProgress - 0.25) / 0.75);
      t.bodyTopX = 0; t.bodyTopY = -45 + plunge * 10;
      t.headX = 0; t.headY = -60 + plunge * 10;
      t.bodyBotY = -25 + plunge * 15;
      t.swordAX = 0; t.swordAY = -45 + plunge * 30;
      t.swordBX = 0; t.swordBY = -5 + plunge * 60;
      t.swordThickness = 5 + plunge * 2;
    }
    return true;
  }
  
  if (attackType === 'heavy_slash') {
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
      t.swordThickness = 6 + snap * 2;
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
      t.swordThickness = 8 - follow * 2;
    }
    return true;
  }
  
  return false;
}