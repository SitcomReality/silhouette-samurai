import { renderGlows } from './fx/GlowRenderer.js';
import { renderCombatFX } from './fx/CombatFXRenderer.js';
import { renderMotionFX } from './fx/MotionFXRenderer.js';

export function renderFX(ctx, controller, viewWidth, camYOffset) {
  renderGlows(ctx, controller, viewWidth, camYOffset);

  const viewLeft = controller.cameraX - viewWidth / 2 - 200;
  const viewRight = controller.cameraX + viewWidth / 2 + 200;
  
  for (const fx of controller.visualFx) {
    if (fx.x < viewLeft || fx.x > viewRight) continue;
    
    if (['parry_flash', 'clash_spark', 'damage_spark'].includes(fx.type)) {
      renderCombatFX(ctx, fx, controller, viewWidth, camYOffset);
    } else if (['streak', 'arc_swoosh'].includes(fx.type)) {
      renderMotionFX(ctx, fx, controller, viewWidth, camYOffset);
    }
  }
}