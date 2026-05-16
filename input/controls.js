export function determineAttack(controller) {
  const p = controller.player;
  
  const btn1 = controller.keys['Digit1'] || controller.keys['1'] || controller.keys['KeyJ']; // Light
  const btn2 = controller.keys['Digit2'] || controller.keys['2'] || controller.keys['KeyK']; // Heavy
  
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forwardKey = left || right;

  if (btn2) {
    if (!p.isGrounded) {
      if (down) return 'down_thrust';
      return 'heavy_slash';
    } else {
      if (down) return 'sweep';
      if (up) return 'rising_slash';
      return 'heavy_slash';
    }
  }
  
  if (btn1) {
    if (!p.isGrounded) {
      if (up) return 'up_slash';
      return 'slash';
    } else {
      if (up) return 'up_slash';
      if (forwardKey && !down) return 'thrust';
      return 'slash';
    }
  }
  
  return null;
}