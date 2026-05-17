import { easeOutCubic, easeInCubic, easeInOutCubic } from '../easing.js';

export function applyBasicAttackPose(t, dir, attackType, attackProgress) {
  if (attackType === 'neutral' || attackType === 'air_neutral' || attackType === 'slash') {
    const extend = Math.sin(attackProgress * Math.PI);
    const swordLen = 65;
    t.swordAX = dir * 5; t.swordAY = -35;
    t.swordBX = t.swordAX + dir * extend * swordLen;
    t.swordBY = -35 + extend * 8;
    t.swordThickness = 2 + extend * 1.5;
    t.bodyTopX = dir * extend * 10;
    t.headX = dir * extend * 12;
    return true;
  }
  
  if (attackType === 'forward' || attackType === 'air_forward' || attackType === 'thrust') {
    const easedProgress = easeOutCubic(attackProgress);
    const startAngle = Math.PI * 0.28;
    const currentAngle = startAngle - (easedProgress * startAngle);
    const swordLen = 78;
    t.swordAX = dir * 6; t.swordAY = -30;
    t.swordBX = t.swordAX + Math.cos(currentAngle) * swordLen * dir;
    t.swordBY = t.swordAY + Math.sin(currentAngle) * swordLen - easedProgress * 6;
    t.swordThickness = 2.5 + (1 - easedProgress) * 1.8;
    t.bodyTopX = dir * (18 * easedProgress + 6 * (easedProgress * easedProgress));
    t.headX = dir * 22 * easedProgress;
    t.bodyBotX = -dir * 6 * easedProgress;
    return true;
  }
  
  if (attackType === 'up' || attackType === 'air_up' || attackType === 'up_slash') {
    // Stronger upward sweep: longer sword and wider arc, visually launching the character upward
    const easedProgress = attackProgress < 0.25 ? easeInCubic(attackProgress / 0.25) * 0.25 :
                          0.25 + easeOutCubic((attackProgress - 0.25) / 0.75) * 0.75;
    // Wider swing angle and longer blade to emphasize reach
    const arcAngle = -Math.PI * 0.25 - (easedProgress * Math.PI * 1.1);
    const swordLen = 82; // lengthened sword
    t.swordBX = dir * 20 + Math.cos(arcAngle) * swordLen * dir * 0.75;
    t.swordBY = -60 + Math.sin(arcAngle) * swordLen;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir * 0.75;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.swordThickness = 2.5 + (1 - easedProgress) * 1.5;
    // Body and head lift to convey upward propulsion
    t.bodyTopX = dir * (10 + easedProgress * 10);
    t.bodyTopY = -40 - easedProgress * 8;
    t.bodyBotY = -8 - easedProgress * 6;
    t.headX = dir * (14 + easedProgress * 12);
    t.headY = -50 - easedProgress * 10;
    return true;
  }
  
  if (attackType === 'down' || attackType === 'air_down' || attackType === 'sweep') {
    const easedProgress = easeInOutCubic(attackProgress);
    const arcAngle = Math.PI * 0.15 - (easedProgress * Math.PI * 0.5);
    const swordLen = 58;
    t.swordBX = dir * (15 + easedProgress * 25) + Math.cos(arcAngle) * swordLen * dir * 0.5;
    t.swordBY = -10 + Math.sin(arcAngle) * swordLen * 0.5;
    t.swordAX = t.swordBX - Math.cos(arcAngle) * swordLen * dir;
    t.swordAY = t.swordBY - Math.sin(arcAngle) * swordLen;
    t.bodyBotX = -dir * 10;
    t.bodyTopX = dir * (12 + easedProgress * 10); t.bodyTopY = -15;
    t.headX = dir * (18 + easedProgress * 8); t.headY = -25;
    return true;
  }
  
  return false;
}