// Unified ground heightfield — Layer A terrain testbed (docs/design.md §10).
//
// Single source of truth for "how high is the ground at world x?".
// The SDF pass, player/entity physics, spawner, FX and telegraphs ALL
// read from here, so what you see is what you run on. Previously the
// visual ground wobbled (sin/cos +-10px) while physics pinned everyone
// to a flat baseGroundY — slopes were visible but never walkable.
//
// The test course is a control-point heightfield (smoothstep-interpolated
// so slopes flatten at both ends, which gives clean ramp launches).
// Beyond the last point the ground continues flat ("endless" tail).
// Append ?flat to the URL to disable the course and test on a flat line.

export const TerrainState = { courseEnabled: true };

export const TEST_COURSE_POINTS = [
  [-1000, 400], // flat start (spawn / intro)
  [600, 400],   // flat
  [1100, 320],  // gentle slope up
  [1400, 320],  // flat plateau
  [1700, 240],  // ramp up (launch check)
  [2100, 240],  // flat high plateau (landing zone)
  [2600, 400],  // downhill (slide-speed check)
  [3200, 400],  // flat
  [3300, 480],  // steep drop edge (fall check, finite — no walls/pits yet)
  [3800, 480],  // low flat tail; beyond this the ground stays at 480
];

function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function terrainY(x, baseGroundY = 400) {
  if (!TerrainState.courseEnabled) return baseGroundY;
  const pts = TEST_COURSE_POINTS;
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x <= x1) {
      const t = smootherstep((x - x0) / (x1 - x0));
      return y0 + (y1 - y0) * t;
    }
  }
  return pts[pts.length - 1][1];
}

// dy/dx of the terrain at x (positive = ground descends to the right,
// since y grows downward). Used for slope gravity and ramp launches.
export function groundSlopeAt(x, baseGroundY = 400) {
  const e = 2;
  return (terrainY(x + e, baseGroundY) - terrainY(x - e, baseGroundY)) / (e * 2);
}

export function getGroundY(x, baseGroundY, shockwaves) {
  let y = terrainY(x, baseGroundY);

  for (const sw of shockwaves || []) {
    const dist = Math.abs(x - sw.x);
    const thickness = 60;
    if (Math.abs(dist - sw.radius) < thickness) {
      const factor = 1 - Math.abs(dist - sw.radius) / thickness;
      const wave = Math.sin(factor * Math.PI * 1.5) * sw.amplitude * (sw.life / sw.maxLife);
      y -= wave;
    }
  }
  return y;
}
