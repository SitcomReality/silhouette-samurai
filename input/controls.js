// Finisher direction determination
export function getFinisherDirection(controller) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const up = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];
  const left = controller.keys['KeyA'] || controller.keys['ArrowLeft'];
  const right = controller.keys['KeyD'] || controller.keys['ArrowRight'];
  const forward = (p.facing === 'right' && right) || (p.facing === 'left' && left);
  
  if (up) return 'up';
  if (down) return 'down';
  if (forward) return 'forward';
  return null;
}

export function getFinisherAttackName(direction) {
  if (direction === 'up') return 'dance_finisher_up';
  if (direction === 'down') return 'dance_finisher_down';
  if (direction === 'forward') return 'dance_finisher_neutral';
  return null;
}