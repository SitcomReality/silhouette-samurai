export function updateFX(controller, dt) {
  for (let i = controller.particles.length - 1; i >= 0; i--) {
    const pt = controller.particles[i];
    pt.life += dt;
    if (pt.life >= pt.maxLife) {
      controller.particles.splice(i, 1);
      continue;
    }

    pt.vy += 0.4;
    pt.x += pt.vx;
    pt.y += pt.vy;

    if (pt.vAngle) {
      pt.angle = (pt.angle || 0) + pt.vAngle * dt;
    }

    if (pt.id.startsWith('debris_') || pt.shape === 'capsule') {
      continue;
    }

    if (pt.y >= controller.baseGroundY) {
      pt.y = controller.baseGroundY;
      pt.vy = 0;
      pt.vx *= 0.7;
      pt.isGrounded = true;
      
      if (controller.audioEngine && pt.radius > 8) {
        controller.audioEngine.sfx.playFusionHum(pt.radius / 20);
      }
    }
  }

  for (let i = controller.shockwaves.length - 1; i >= 0; i--) {
    const sw = controller.shockwaves[i];
    sw.life += dt;
    if (sw.life >= sw.maxLife) {
      controller.shockwaves.splice(i, 1);
      continue;
    }
    sw.radius += sw.speed;
  }

  for (let i = controller.visualFx.length - 1; i >= 0; i--) {
    const fx = controller.visualFx[i];
    fx.life += dt;
    if (fx.entity) {
      fx.x = fx.entity.x + fx.offsetX;
      fx.y = fx.entity.y + fx.offsetY;
    }
    if (fx.life >= fx.maxLife) {
      controller.visualFx.splice(i, 1);
    }
  }

  for (let i = controller.floatingTexts.length - 1; i >= 0; i--) {
    const ft = controller.floatingTexts[i];
    ft.life += dt;
    ft.y -= dt * 40;
    if (ft.life >= 1.0) {
      controller.floatingTexts.splice(i, 1);
    }
  }
}