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
    // Make the forward strike feel punchy: compact windup, fast snap, extended tip reach at impact.
    // Use a two-phase easing: quick windup (strong body coil) then a sharp follow-through that extends the blade tip.
    const windupT = Math.min(attackProgress / 0.35, 1.0);
    const followT = attackProgress < 0.35 ? 0 : (attackProgress - 0.35) / 0.65;
    const windupEase = easeInCubic(windupT);
    const snapEase = easeOutCubic(followT);

    // Shorter, tighter body lean during windup, avoid overleaning during follow-through.
    t.bodyTopX = dir * (8 * windupEase + 20 * snapEase * 0.6);
    t.bodyTopY = -35 - 4 * windupEase;
    t.headX = dir * (6 * windupEase + 18 * snapEase * 0.6);
    t.headY = -50 - 3 * windupEase;
    t.bodyBotX = -dir * (4 * windupEase);

    // Sword: longer tip extension on snap, thicker at impact, visually stretching the blade reach
    const baseSwordAX = dir * 6;
    const baseSwordAY = -30;
    const swordLen = 100; // increase tip reach so the final frame looks long
    // Angle: small arc leaning forward; during snap, tip thrusts further out and slightly upward for impact silhouette
    const startAngle = Math.PI * 0.22;
    const angleDuring = startAngle - snapEase * (startAngle + 0.05);
    const tipExtend = 1.0 + snapEase * 0.55; // extra reach factor on snap

    t.swordAX = baseSwordAX;
    t.swordAY = baseSwordAY - windupEase * 2;
    t.swordBX = t.swordAX + Math.cos(angleDuring) * swordLen * dir * tipExtend;
    t.swordBY = t.swordAY + Math.sin(angleDuring) * swordLen - snapEase * 8;

    // Emphasize thickness at moment of impact (snapEase high), thinner during windup
    t.swordThickness = 2.0 + Math.max(0.5, snapEase) * 4.5;

    // Subtle chest/torso compression on snap to transmit force
    t.bodyTopY -= snapEase * 4;
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