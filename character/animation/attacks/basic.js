export function applyBasicAttackPose(t, dir, attackType, attackProgress, frameData = null) {
  // Unified attack system - all attacks use procedural animation
  if (attackType !== 'unified') return false;
  
  const anim = frameData?.anim || {};
  const sLen = anim.swordStartLen ?? (anim.swordLen ?? 64);
  const eLen = anim.swordLen ?? 64;
  const currentLen = sLen + (eLen - sLen) * attackProgress;
  const originY = anim.swordOriginY ?? -40;

  const easedProgress = Math.pow(attackProgress, 0.6);
  const startA = anim.startAngle ?? 0.5;
  const endA = anim.endAngle ?? -0.3;
  const arcAngle = Math.PI * startA + easedProgress * Math.PI * (endA - startA);
  
  t.swordAX = 0;
  t.swordAY = originY;
  t.swordBX = t.swordAX + Math.cos(arcAngle) * currentLen * dir;
  t.swordBY = t.swordAY + Math.sin(arcAngle) * currentLen;
  t.swordThickness = (anim.swordThickness ?? 4) + (1 - easedProgress) * 2;
  
  t.bodyTopX = dir * (anim.bodyTopX ?? 10) * easedProgress;
  t.bodyTopY = (anim.bodyTopY ?? -35);
  t.headX = dir * (anim.headX ?? 15) * easedProgress;
  t.headY = (anim.headY ?? -55);
  t.bodyBotX = dir * (anim.bodyBotX ?? 0);
  t.bodyBotY = (anim.bodyBotY ?? 0);
  return true;
}