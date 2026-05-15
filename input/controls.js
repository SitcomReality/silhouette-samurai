export function determineAttack(controller) {
  const p = controller.player;
  
  const btn1 = controller.keys['Digit1'] || controller.keys['1'] || controller.keys['KeyJ'];
  const btn2 = controller.keys['Digit2'] || controller.keys['2'] || controller.keys['KeyK'];
  
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  
  if (btn1) {
    const forwardKey = left || right;
    
    if (forwardKey && up) {
      if (p.isGrounded) return 'uppercut';
      else return 'air_thrust';
    } else if (forwardKey) {
      return 'lunge';
    } else if (up) {
      if (p.isGrounded) return 'uppercut';
      else return 'air_thrust';
    } else {
      return 'jab';
    }
  }
  
  if (btn2) {
    if (!p.isGrounded) {
      return 'slam';
    } else {
      return 'roundhouse';
    }
  }
  
  return null;
}