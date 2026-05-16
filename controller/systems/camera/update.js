export function updateCamera(controller) {
  const p = controller.player;
  const targetCamX = p.x + (p.facing === 'right' ? 100 : -100);
  controller.cameraX += (targetCamX - controller.cameraX) * 0.08;
}