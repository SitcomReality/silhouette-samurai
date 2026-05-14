export function renderDebug(ctx, controller, viewWidth, camYOffset) {
  const drawSkeletonDebug = (skel, color) => {
    const mapP = (p) => ({
      x: (p.x - controller.cameraX) + viewWidth / 2,
      y: p.y + camYOffset
    });

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    const h = mapP(skel.head);
    ctx.beginPath(); ctx.arc(h.x, h.y, skel.headRadius, 0, Math.PI * 2); ctx.stroke();

    const tt = mapP(skel.torsoTop);
    const tb = mapP(skel.torsoBottom);
    ctx.beginPath(); ctx.moveTo(tt.x, tt.y); ctx.lineTo(tb.x, tb.y); ctx.stroke();

    const ls = mapP(skel.leftShoulder), le = mapP(skel.leftElbow), lh = mapP(skel.leftHand);
    ctx.beginPath(); ctx.moveTo(ls.x, ls.y); ctx.lineTo(le.x, le.y); ctx.lineTo(lh.x, lh.y); ctx.stroke();

    const rs = mapP(skel.rightShoulder), re = mapP(skel.rightElbow), rh = mapP(skel.rightHand);
    ctx.beginPath(); ctx.moveTo(rs.x, rs.y); ctx.lineTo(re.x, re.y); ctx.lineTo(rh.x, rh.y); ctx.stroke();

    const lhip = mapP(skel.leftHip), lk = mapP(skel.leftKnee), lf = mapP(skel.leftFoot);
    ctx.beginPath(); ctx.moveTo(lhip.x, lhip.y); ctx.lineTo(lk.x, lk.y); ctx.lineTo(lf.x, lf.y); ctx.stroke();

    const rhip = mapP(skel.rightHip), rk = mapP(skel.rightKnee), rf = mapP(skel.rightFoot);
    ctx.beginPath(); ctx.moveTo(rhip.x, rhip.y); ctx.lineTo(rk.x, rk.y); ctx.lineTo(rf.x, rf.y); ctx.stroke();

    [tt, tb, le, re, lk, rk].forEach(pt => {
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI*2); ctx.fill();
    });
  };

  drawSkeletonDebug(controller.player.skeleton, '#38bdf8');
  controller.entities.forEach(ent => {
    if (ent.type !== 'crate') {
      drawSkeletonDebug(ent.skeleton, ent.state === 'dead' ? '#64748b' : '#f43f5e');
    } else {
      const scX = (ent.x - controller.cameraX) + viewWidth / 2;
      const scY = ent.y - (ent.height || 50) / 2 + camYOffset;
      ctx.strokeStyle = '#eab308';
      ctx.strokeRect(scX - (ent.width || 50)/2, scY - (ent.height || 50)/2, ent.width || 50, ent.height || 50);
    }
  });
}