export function getGroundY(x, baseGroundY, shockwaves) {
  let y = baseGroundY;
  
  y += Math.sin(x * 0.015) * 4;
  y += Math.cos(x * 0.007) * 6;
  
  for (const sw of shockwaves) {
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