export function determineAttack(controller, isFinisher = false) {
  const p = controller.player;
  
  const btn1 = controller.keys['Digit1'] || controller.keys['1'] || controller.keys['KeyJ'];
  const btnBlock = controller.keys['Digit2'] || controller.keys['2'] || controller.keys['KeyK'];
  
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forward = (p.facing === 'right' && right) || (p.facing === 'left' && left);
  
  if (!btn1 && !isFinisher) return null;
  
  // Determine direction
  let direction = 'neutral';
  if (up) direction = 'up';
  else if (down) direction = 'down';
  else if (forward) direction = 'forward';
  
  // Finishers via block button
  if (isFinisher) {
    if (direction === 'neutral') return null; // No neutral finisher
    return controller.bladeDance.getFinisherAttack(direction);
  }
  
  // Priority: Sliding Attacks
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');
  if (isSliding && p.isGrounded && !p.bladeDanceState) {
    return 'down';
  }

  // Start blade dance if not already active
  if (!p.bladeDanceState && controller.bladeDance.canInitiate(p)) {
    return 'dance_starter';
  }
  
  // Continue blade dance with standard attacks
  if (p.bladeDanceState) {
    return controller.bladeDance.getStandardAttack(direction, !p.isGrounded);
  }
  
  // Fallback to standard attacks
  if (!p.isGrounded) {
    if (direction === 'up') return 'air_up';
    if (direction === 'down') return 'air_down';
    if (direction === 'forward') return 'air_forward';
    return 'air_neutral';
  }
  
  if (direction === 'up') return 'up';
  if (direction === 'down') return 'down';
  return 'neutral';
}

export function getDirectionInput(controller, allowNeutral = true) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forward = (p.facing === 'right' && right) || (p.facing === 'left' && left);
  
  if (up) return 'up';
  if (down) return 'down';
  if (forward) return 'forward';
  return allowNeutral ? 'neutral' : null;
}