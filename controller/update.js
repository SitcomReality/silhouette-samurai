<<<<<<< SEARCH
    if (jumpJustPressed) {
    p.jumpBuffer = 0.15;
  }
  if (p.jumpBuffer > 0) {
    p.jumpBuffer -= dt;
  }

<<<<<<< SEARCH
    if (!p.isGrounded) {
    let gravity = 0.6;
    if (p.vy < 0 && !jumpPressed && !p.exponentialLaunch) {
      gravity = 1.6; // Apply extra gravity if jump is released early
    }
    p.vy += gravity;
    if (p.y >= controller.baseGroundY) {
      p.y = controller.baseGroundY;
      p.vy = 0;
      p.isGrounded = true;
      p.doubleJumped = false;
      
      // Auto-jump if holding jump upon landing (bunny hop)
      if (jumpPressed && p.state !== 'attack') {
        p.jumpBuffer = 0.15;
      }

      // Landing from air into slide if holding down and has horizontal speed
      if (down && Math.abs(p.vx) > 5) {
        p.isSliding = true;
      }
    }
  } else {
    p.y = controller.baseGroundY;
  }