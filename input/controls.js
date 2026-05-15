export function determineAttack(controller) {
  const p = controller.player;
  
  const btn1 = controller.keys['Digit1'] || controller.keys['1'] || controller.keys['KeyJ'];
  const btn2 = controller.keys['Digit2'] || controller.keys['2'] || controller.keys['KeyK'];
  
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  
  if (btn1) {
    const forwardKey = left || right;
    
    // Down attacks (slide)
    if (down && p.isGrounded) {
      return 'slide';
    }
    // Up attacks
    else if (up && !down) {
      if (p.isGrounded) return 'uppercut';
      else return 'air_thrust';
    }
    // Forward attacks
    else if (forwardKey && !down && !up) {
      return 'lunge';
    }
    // Neutral attack
    else if (!down && !up && !forwardKey) {
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