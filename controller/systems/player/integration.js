import { PHYSICS_DATA } from '../../../combat/frame-data.js';

export function integratePlayerPhysics(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];

  p.x += p.vx;
  p.y += p.vy;

  if (!p.isGrounded) {
    let gravity = 0.65;
    
    const atApex = Math.abs(p.vy) < 3.5;
    if (atApex && jumpPressed && !p.exponentialLaunch) {
      gravity = 0.18; 
      p.vx *= 0.99;
    } else if (p.vy < 0 && !jumpPressed && !p.exponentialLaunch) {
      gravity = 2.2;
    }
    
    p.vy += gravity;
    if (p.y >= controller.baseGroundY) {
      p.y = controller.baseGroundY;
      p.vy = 0;
      p.isGrounded = true;
      p.doubleJumped = false;
      
      if (jumpPressed && p.state !== 'attack') {
        p.jumpBuffer = 0.25;
      }

      if (down && Math.abs(p.vx) > 5) {
        p.isSliding = true;
      }
    }
  } else {
    p.y = controller.baseGroundY;
  }
}