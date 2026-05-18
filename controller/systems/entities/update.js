export function updateEntities(controller, dt) {
  for (let i = controller.entities.length - 1; i >= 0; i--) {
    const ent = controller.entities[i];

    if (ent.health === -999) {
      controller.entities.splice(i, 1);
      continue;
    }

    ent.stateTime += dt;
    if (ent.flashTimer > 0) ent.flashTimer -= dt;

    if (ent.state === 'dead') {
      if (!ent.isGrounded) {
        ent.vy += 0.6;
        ent.x += ent.vx;
        ent.y += ent.vy;
        
        // Sliced debris halves now fall through the ground instead of colliding.
        if (!ent.isSliced && ent.y >= controller.baseGroundY) {
          ent.y = controller.baseGroundY;
          ent.vy *= -0.3; // slight bounce
          ent.vx *= 0.6;
          if (Math.abs(ent.vy) < 2) {
            ent.vy = 0;
            ent.isGrounded = true;
          }
        }
      } else {
        ent.vx *= 0.8;
        ent.x += ent.vx;
        ent.vAngle = 0; // stop tumbling when grounded
      }

      if (ent.stateTime > 4) {
        controller.entities.splice(i, 1);
      }
      continue;
    }

    if (!ent.isGrounded) {
      ent.vy += 0.6;
      ent.x += ent.vx;
      ent.y += ent.vy;

      if (ent.y >= controller.baseGroundY) {
        ent.y = controller.baseGroundY;
        ent.vy = 0;
        ent.vx *= 0.5;
        ent.isGrounded = true;
        
        if (controller.audioEngine && Math.abs(ent.vy) > 5) {
          controller.audioEngine.onLand();
        }
      }
    } else {
      ent.vx *= 0.8;
      ent.x += ent.vx;
      ent.y = controller.baseGroundY;
    }

    if (ent.state === 'hit' && ent.stateTime > 0.4) {
      ent.state = 'idle';
    }
  }
}