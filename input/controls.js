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
      return 'slam';
    } else {
      if (down) return 'slide';
      if (up) return 'uppercut';
      return 'roundhouse';
    }
  }
  
  if (btn1) {
    if (!p.isGrounded) {
      return 'air_thrust';
    } else {
      if (forwardKey && !down) return 'lunge';
      return 'jab';
    }
  }
  
  return null;
}