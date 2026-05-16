// Audio feedback
    if (controller.audioEngine) {
      controller.audioEngine.onJump();
    }
  } else if (!p.doubleJumped && jumpJustPressed && p.aerialPower >= 20) {
    const jumpPower = 0.5 + (p.aerialPower / 100) * 0.5;
    p.vy = -12 * jumpPower;
    p.aerialPower -= 20;
    p.doubleJumped = true;
    p.jumpBuffer = 0;
    
    // Audio feedback
    if (controller.audioEngine) {
      controller.audioEngine.onJump();
    }
  }
}