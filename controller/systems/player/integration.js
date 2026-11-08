import { getGroundY, groundSlopeAt } from '../../../sdf/ground.js';

// Slope tuning for the Layer A terrain testbed (docs/design.md §10).
// Gravity's along-slope component: downhill you accelerate, uphill you
// bleed speed. Strong enough to feel, weak enough not to run away —
// grounded horizontal speed is hard-capped below.
const SLOPE_GRAVITY = 0.5;
const MAX_GROUND_SPEED = 35;
// If the ground falls away by more than this in one frame, we've walked
// off an edge / crested a ramp: become airborne instead of snapping down.
const EDGE_DROP = 6;

export function integratePlayerPhysics(controller, dt) {
  const p = controller.player;
  const down = controller.keys['KeyS'] || controller.keys['ArrowDown'];
  const jumpPressed = controller.keys['KeyW'] || controller.keys['ArrowUp'] || controller.keys['Space'];

  const prevSlope = p.groundSlope ?? 0;
  const prevY = p.y;

  p.x += p.vx;
  p.y += p.vy;

  const ground = getGroundY(p.x, controller.baseGroundY, controller.shockwaves);
  const slope = groundSlopeAt(p.x, controller.baseGroundY);
  p.groundSlope = slope;

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
    if (p.y >= ground) {
      p.y = ground;
      p.vy = 0;
      p.isGrounded = true;
      p.doubleJumped = false;
      p.exponentialLaunch = false;
      p.steepUphillX = null;

      if (jumpPressed && p.state !== 'attack') {
        p.jumpBuffer = 0.25;
      }

      if (down && Math.abs(p.vx) > 5) {
        p.isSliding = true;
      }
    }
  } else {
    // Grounded: ride the heightfield.
    // Crest launch: grounded snapping erases vertical velocity every
    // frame, so momentum-based launch can never trigger. Instead,
    // remember steep uphill and launch when it flattens out at speed —
    // the steep slope becomes the launch velocity. Gentle slopes
    // (steeper than -0.35 only) don't qualify.
    if (prevSlope < -0.35) {
      p.steepUphillX = p.x;
      p.steepSlope = prevSlope;
    }
    const cresting = slope > -0.05 && p.steepUphillX != null &&
      p.x - p.steepUphillX < 250 && Math.abs(p.vx) > 5;
    if ((prevY < ground - EDGE_DROP && p.vy >= 0) || cresting) {
      // Ground fell away (cliff edge, ramp crest, steep downhill):
      // leave the ground, inheriting the slope as launch velocity.
      // Uphill slope is negative, so vy goes negative = airborne arc.
      p.isGrounded = false;
      p.vy = cresting ? (p.steepSlope ?? prevSlope) * p.vx * 1.4 : prevSlope * p.vx;
      // Launched moves (ramp crests) use constant gravity, not the
      // jump-release gravity cut, so the arc actually flies.
      p.exponentialLaunch = true;
      p.steepUphillX = null;
    } else {
      // Slope gravity: accelerates downhill, decelerates uphill.
      // Applies in every grounded state (incl. slide) so downhill
      // slides sustain and uphill slides bleed, as designed.
      p.vx += slope * SLOPE_GRAVITY;
      p.vx = Math.max(-MAX_GROUND_SPEED, Math.min(MAX_GROUND_SPEED, p.vx));
      p.y = ground;
      p.vy = 0;
    }
  }
}
