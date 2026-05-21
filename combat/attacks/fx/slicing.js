export function spawnDebris(controller, ent, dir, damage, frameData) {
  if (ent.type === 'crate') return;
  
  const scale = ent.scale || 1.0;
  const sliceY = (ent.y - 35 * scale) + (Math.random() - 0.5) * 20 * scale;
  const sliceX = ent.x + (Math.random() - 0.5) * 10 * scale;
  
  let cutAngle = 0;
  if (frameData && frameData.anim && frameData.anim.endAngle !== undefined) {
    cutAngle = (frameData.anim.endAngle + (Math.random() - 0.5) * 0.25) * Math.PI;
    if (dir === -1) {
      cutAngle = Math.PI - cutAngle;
    }
  } else {
    cutAngle = (Math.random() - 0.5) * 1.5; 
  }
  
  const vx = Math.cos(cutAngle);
  const vy = Math.sin(cutAngle);
  
  let nx1 = -vy;
  let ny1 = vx;
  let nx2 = vy;
  let ny2 = -vx;
  
  if (ny1 < 0) {
      nx1 = -nx1; ny1 = -ny1;
      nx2 = -nx2; ny2 = -ny2;
  }
  
  const cloneChar = (original) => {
      return {
          width: original.width,
          height: original.height,
          world: JSON.parse(JSON.stringify(original.world))
      };
  };

  const topChar = cloneChar(ent.character);
  topChar.world.slice = { x: sliceX, y: sliceY, nx: nx1, ny: ny1 };
  
  const botChar = cloneChar(ent.character);
  botChar.world.slice = { x: sliceX, y: sliceY, nx: nx2, ny: ny2 };

  const topImpulse = damage * (0.3 + Math.random() * 0.2);
  const topHalf = {
    id: `debris_top_${controller.particleId++}`,
    type: 'enemy',
    state: 'dead',
    isSliced: true,
    x: ent.x,
    y: ent.y,
    lastX: ent.x,
    lastY: ent.y,
    vx: dir * topImpulse + (Math.random() - 0.5) * 4,
    vy: -Math.abs(damage) * (0.3 + Math.random() * 0.2) - 5,
    vAngle: dir * (0.04 + Math.random() * 0.1),
    health: 0,
    stateTime: 0,
    scale: scale,
    character: topChar
  };
  
  const botImpulse = damage * (0.1 + Math.random() * 0.1);
  const bottomHalf = {
    id: `debris_bot_${controller.particleId++}`,
    type: 'enemy',
    state: 'dead',
    isSliced: true,
    x: ent.x,
    y: ent.y,
    lastX: ent.x,
    lastY: ent.y,
    vx: dir * botImpulse + (Math.random() - 0.5) * 2,
    vy: -(1 + Math.random() * 3),
    vAngle: -dir * (0.01 + Math.random() * 0.03),
    health: 0,
    stateTime: 0,
    scale: scale,
    character: botChar
  };
  
  controller.entities.push(topHalf, bottomHalf);
  
  for (let i = 0; i < 3; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 4 + Math.random() * 6;
    controller.particles.push({
      id: `debris_particle_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10 * scale,
      y: sliceY,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 2,
      radius: (3 + Math.random() * 4) * scale,
      life: 0,
      maxLife: 1.0,
      isGrounded: false,
      shape: 'circle'
    });
  }
  
  ent.health = -999;
}