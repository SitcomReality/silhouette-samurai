export function determineAttack(controller) {
  const p = controller.player;
  
  const btn1 = controller.keys['Digit1'] || controller.keys['1'] || controller.keys['KeyJ'];
  
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forward = (p.facing === 'right' && right) || (p.facing === 'left' && left);
  
  if (!btn1) return null;
  
  // Determine direction
  let direction = 'neutral';
  if (up) direction = 'up';
  else if (down) direction = 'down';
  else if (forward) direction = 'forward';
  
  // Priority: Sliding Attacks
  const isSliding = (p.isSliding && p.state === 'attack' && p.attackType === 'sweep') || 
                    (down && p.isGrounded && Math.abs(p.vx) > 5 && p.state !== 'attack');
  if (isSliding && p.isGrounded && !p.bladeDanceState) {
    return 'down'; // Sweep
  }

  // Check for Blade Dance initiation (forward attack while grounded)
  if (direction === 'forward' && p.isGrounded && !p.bladeDanceState) {
    if (controller.bladeDance && controller.bladeDance.canInitiate(p)) {
      return 'dance_starter';
    }
  }
  
  // Aerial attacks
  if (!p.isGrounded) {
    if (direction === 'up') return 'air_up';
    if (direction === 'down') return 'air_down';
    if (direction === 'forward') return 'air_forward';
    return 'air_neutral';
  }
  
  // Grounded attacks
  if (direction === 'up') return 'up';
  if (direction === 'down') return 'down';
  if (direction === 'forward') return 'forward';
  return 'neutral';
}

export function getDirectionInput(controller) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forward = (p.facing === 'right' && right) || (p.facing === 'left' && left);
  
  if (up) return 'up';
  if (down) return 'down';
  if (forward) return 'forward';
  return 'neutral';
}