export function createDefaultSkeleton(x, y) {
  return {
    head: { x, y: y - 110 },
    headRadius: 14,
    torsoTop: { x, y: y - 90 },
    torsoBottom: { x, y: y - 50 },
    torsoRadius: 10,
    leftShoulder: { x: x - 5, y: y - 90 },
    leftElbow: { x: x - 10, y: y - 70 },
    leftHand: { x: x - 10, y: y - 50 },
    armRadius: 7,
    rightShoulder: { x: x + 5, y: y - 90 },
    rightElbow: { x: x + 10, y: y - 70 },
    rightHand: { x: x + 10, y: y - 50 },
    leftHip: { x: x - 6, y: y - 50 },
    leftKnee: { x: x - 10, y: y - 25 },
    leftFoot: { x: x - 12, y },
    legRadius: 8,
    rightHip: { x: x + 6, y: y - 50 },
    rightKnee: { x: x + 10, y: y - 25 },
    rightFoot: { x: x + 12, y },
  };
}

export function updateSkeleton(skel, x, y, facing, state, stateTime, attackType, attackProgress, isGrounded = true, vy = 0) {
  const dir = facing === 'right' ? 1 : -1;
  
  if (state === 'dead') {
    skel.head = { x: x + dir * 30, y: y - 12 };
    skel.torsoTop = { x: x + dir * 15, y: y - 10 };
    skel.torsoBottom = { x: x - dir * 10, y: y - 8 };
    skel.leftShoulder = skel.torsoTop;
    skel.leftElbow = { x: x + dir * 10, y: y - 6 };
    skel.leftHand = { x: x + dir * 5, y: y - 4 };
    skel.rightShoulder = skel.torsoTop;
    skel.rightElbow = { x: x + dir * 25, y: y - 6 };
    skel.rightHand = { x: x + dir * 40, y: y - 4 };
    skel.leftHip = skel.torsoBottom;
    skel.leftKnee = { x: x - dir * 20, y: y - 6 };
    skel.leftFoot = { x: x - dir * 30, y: y - 4 };
    skel.rightHip = skel.torsoBottom;
    skel.rightKnee = { x: x - dir * 15, y: y - 6 };
    skel.rightFoot = { x: x - dir * 5, y: y - 4 };
    return;
  }

  if (state === 'hit') {
    const reel = Math.sin(stateTime * 15) * 10;
    skel.torsoBottom = { x, y: y - 45 };
    skel.torsoTop = { x: x - dir * 20, y: y - 85 };
    skel.head = { x: x - dir * 30, y: y - 105 + reel };
    
    skel.leftShoulder = skel.torsoTop;
    skel.leftElbow = { x: x - dir * 35, y: y - 75 };
    skel.leftHand = { x: x - dir * 45, y: y - 90 };
    
    skel.rightShoulder = skel.torsoTop;
    skel.rightElbow = { x: x - dir * 25, y: y - 65 };
    skel.rightHand = { x: x - dir * 30, y: y - 50 };
    
    skel.leftHip = skel.torsoBottom;
    skel.leftKnee = { x: x - dir * 15, y: y - 25 };
    skel.leftFoot = { x: x - dir * 25, y };
    
    skel.rightHip = skel.torsoBottom;
    skel.rightKnee = { x: x + dir * 10, y: y - 30 };
    skel.rightFoot = { x: x + dir * 5, y: y - 10 };
    return;
  }

  if (state === 'attack') {
    if (attackType === 'kick_low') {
      const ext = Math.sin(attackProgress * Math.PI);
      const reach = 60 * ext;
      
      skel.torsoBottom = { x: x - dir * 10, y: y - 45 + ext * 10 };
      skel.torsoTop = { x: x + dir * 10, y: y - 80 + ext * 15 };
      skel.head = { x: x + dir * 20, y: y - 100 + ext * 15 };
      
      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 15, y: y - 70 };
      skel.leftHand = { x: x - dir * 30, y: y - 60 };
      
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 30, y: y - 70 };
      skel.rightHand = { x: x + dir * 50, y: y - 65 };
      
      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 15, y: y - 22 };
      skel.leftFoot = { x: x - dir * 20, y };
      
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * (20 + reach * 0.5), y: y - 30 };
      skel.rightFoot = { x: x + dir * (30 + reach), y: y - 25 };
      return;
    }

    if (attackType === 'roundhouse') {
      const angle = attackProgress * Math.PI * 2;
      const radius = 55;
      const kx = Math.cos(angle - Math.PI/2) * radius * dir;
      const ky = Math.sin(angle - Math.PI/2) * radius;

      skel.torsoBottom = { x, y: y - 50 };
      skel.torsoTop = { x: x - dir * 5, y: y - 90 };
      skel.head = { x: x - dir * 10, y: y - 110 };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 5, y: y - 25 };
      skel.leftFoot = { x, y };

      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + kx * 0.5, y: y - 50 + ky * 0.5 };
      skel.rightFoot = { x: x + kx, y: y - 50 + ky };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 25, y: y - 80 };
      skel.leftHand = { x: x - dir * 40, y: y - 95 };
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 20, y: y - 75 };
      skel.rightHand = { x: x + dir * 35, y: y - 60 };
      return;
    }

    if (attackType === 'slam') {
      const hY = attackProgress < 0.4 ? -130 : -70;
      const armY = attackProgress < 0.4 ? -150 : -20;
      const reachX = attackProgress < 0.4 ? -10 : 45;

      skel.torsoBottom = { x, y: y - 45 };
      skel.torsoTop = { x: x + dir * reachX * 0.4, y: y + hY + 30 };
      skel.head = { x: x + dir * reachX * 0.6, y: y + hY };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x + dir * reachX * 0.7, y: y + armY * 0.7 };
      skel.leftHand = { x: x + dir * reachX, y: y + armY };

      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * reachX * 0.8, y: y + armY * 0.7 };
      skel.rightHand = { x: x + dir * reachX * 1.1, y: y + armY };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 10, y: y - 25 };
      skel.leftFoot = { x: x - dir * 15, y };
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * 10, y: y - 25 };
      skel.rightFoot = { x: x + dir * 15, y };
      return;
    }
  }

  if (!isGrounded) {
    if (vy < -8) {
      skel.torsoBottom = { x, y: y - 40 };
      skel.torsoTop = { x: x + dir * 5, y: y - 75 };
      skel.head = { x: x + dir * 10, y: y - 95 };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 10, y: y - 60 };
      skel.leftHand = { x: x - dir * 5, y: y - 45 };
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 15, y: y - 60 };
      skel.rightHand = { x: x + dir * 25, y: y - 45 };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 5, y: y - 20 };
      skel.leftFoot = { x: x - dir * 8, y: y - 5 };
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * 5, y: y - 20 };
      skel.rightFoot = { x: x + dir * 8, y: y - 5 };
      return;
    } else if (vy < -2) {
      skel.torsoBottom = { x, y: y - 55 };
      skel.torsoTop = { x: x + dir * 8, y: y - 100 };
      skel.head = { x: x + dir * 12, y: y - 120 };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 5, y: y - 75 };
      skel.leftHand = { x: x - dir * 10, y: y - 50 };
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 15, y: y - 75 };
      skel.rightHand = { x: x + dir * 20, y: y - 50 };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 2, y: y - 25 };
      skel.leftFoot = { x: x - dir * 5, y: y + 5 };
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * 5, y: y - 25 };
      skel.rightFoot = { x: x + dir * 8, y: y + 5 };
      return;
    } else if (Math.abs(vy) <= 3) {
      skel.torsoBottom = { x, y: y - 50 };
      skel.torsoTop = { x: x + dir * 5, y: y - 80 };
      skel.head = { x: x + dir * 8, y: y - 98 };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 15, y: y - 70 };
      skel.leftHand = { x: x - dir * 10, y: y - 60 };
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 20, y: y - 70 };
      skel.rightHand = { x: x + dir * 15, y: y - 60 };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 10, y: y - 40 };
      skel.leftFoot = { x: x - dir * 5, y: y - 25 };
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * 12, y: y - 40 };
      skel.rightFoot = { x: x + dir * 8, y: y - 25 };
      return;
    } else {
      skel.torsoBottom = { x, y: y - 48 };
      skel.torsoTop = { x: x + dir * 10, y: y - 88 };
      skel.head = { x: x + dir * 15, y: y - 108 };

      skel.leftShoulder = skel.torsoTop;
      skel.leftElbow = { x: x - dir * 12, y: y - 75 };
      skel.leftHand = { x: x - dir * 20, y: y - 65 };
      skel.rightShoulder = skel.torsoTop;
      skel.rightElbow = { x: x + dir * 25, y: y - 75 };
      skel.rightHand = { x: x + dir * 35, y: y - 65 };

      skel.leftHip = skel.torsoBottom;
      skel.leftKnee = { x: x - dir * 5, y: y - 25 };
      skel.leftFoot = { x: x - dir * 8, y: y + 10 };
      skel.rightHip = skel.torsoBottom;
      skel.rightKnee = { x: x + dir * 8, y: y - 25 };
      skel.rightFoot = { x: x + dir * 12, y: y + 10 };
      return;
    }
  }

  if (state === 'run') {
    const cycle = stateTime * 14;
    const stride = Math.sin(cycle) * 22;
    const strideCos = Math.cos(cycle) * 12;
    
    skel.torsoBottom = { x, y: y - 48 + Math.abs(strideCos) * 0.3 };
    skel.torsoTop = { x: x + dir * 12, y: y - 88 + Math.abs(strideCos) * 0.4 };
    skel.head = { x: x + dir * 18, y: y - 108 + Math.abs(strideCos) * 0.4 };

    skel.leftHip = skel.torsoBottom;
    skel.leftKnee = { x: x + stride * 0.5, y: y - 25 - strideCos };
    skel.leftFoot = { x: x + stride, y: y - Math.max(0, strideCos) };

    skel.rightHip = skel.torsoBottom;
    skel.rightKnee = { x: x - stride * 0.5, y: y - 25 + strideCos };
    skel.rightFoot = { x: x - stride, y: y - Math.max(0, -strideCos) };

    skel.leftShoulder = skel.torsoTop;
    skel.leftElbow = { x: skel.torsoTop.x - stride * 0.6, y: y - 70 };
    skel.leftHand = { x: skel.torsoTop.x - stride * 1.1, y: y - 55 };

    skel.rightShoulder = skel.torsoTop;
    skel.rightElbow = { x: skel.torsoTop.x + stride * 0.6, y: y - 70 };
    skel.rightHand = { x: skel.torsoTop.x + stride * 1.1, y: y - 55 };
    return;
  }

  const bob = Math.sin(stateTime * 4) * 4;
  skel.torsoBottom = { x, y: y - 50 + bob };
  skel.torsoTop = { x, y: y - 90 + bob };
  skel.head = { x: x + dir * 2, y: y - 110 + bob };

  skel.leftShoulder = skel.torsoTop;
  skel.leftElbow = { x: x - 12, y: y - 70 + bob };
  skel.leftHand = { x: x - 8, y: y - 45 + bob };

  skel.rightShoulder = skel.torsoTop;
  skel.rightElbow = { x: x + 12, y: y - 70 + bob };
  skel.rightHand = { x: x + 8, y: y - 45 + bob };

  skel.leftHip = skel.torsoBottom;
  skel.leftKnee = { x: x - 8, y: y - 25 + bob * 0.5 };
  skel.leftFoot = { x: x - 12, y };

  skel.rightHip = skel.torsoBottom;
  skel.rightKnee = { x: x + 8, y: y - 25 + bob * 0.5 };
  skel.rightFoot = { x: x + 12, y };
}