import { AERIAL_ATTACK_VISUALS } from '../../combat/config/aerial.js';

export function applyBasicAttackPose(t, dir, attackType, attackProgress, frameData = null, isAerialAttack = false, aerialDiveAngle = 0) {
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
  
  // Apply aerial dive rotation if attacking in air
  if (isAerialAttack && AERIAL_ATTACK_VISUALS.rotationEnabled) {
    const cfg = AERIAL_ATTACK_VISUALS;
    
    // Determine if this is a directional attack (not pure upward)
    const angleY = Math.sin(aerialDiveAngle);
    const angleX = Math.cos(aerialDiveAngle);
    const isNotPureUp = !(Math.abs(angleX) < 0.2 && angleY < -0.8);
    
    if (isNotPureUp) {
      // Rotate entire body to dive head-first towards attack angle
      const diveIntensity = Math.min(attackProgress * 2, 1.0); // Ramp up rotation
      
      // Calculate rotated body positions
      const bodyLength = 35 * cfg.diveExtension;
      const headDist = 20 * cfg.diveExtension;
      
      t.bodyTopX = Math.cos(aerialDiveAngle) * bodyLength * diveIntensity;
      t.bodyTopY = -bodyLength + Math.sin(aerialDiveAngle) * bodyLength * diveIntensity;
      
      t.headX = Math.cos(aerialDiveAngle) * (bodyLength + headDist) * diveIntensity;
      t.headY = -(bodyLength + headDist) + Math.sin(aerialDiveAngle) * (bodyLength + headDist) * diveIntensity;
      
      t.bodyBotX = -Math.cos(aerialDiveAngle) * 5 * diveIntensity;
      t.bodyBotY = Math.sin(aerialDiveAngle) * 5 * diveIntensity;
      
      // Sword extends from dive direction
      t.swordAX = 0;
      t.swordAY = originY;
      t.swordBX = Math.cos(aerialDiveAngle) * currentLen * diveIntensity;
      t.swordBY = originY + Math.sin(aerialDiveAngle) * currentLen * diveIntensity;
      t.swordThickness = (anim.swordThickness ?? 4) + (1 - easedProgress) * 2;
      
      return true;
    }
  }
  
  // Standard attack pose (grounded or upward aerial)
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