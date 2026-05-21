export function spawnHitParticles(controller, ent, dir, damage) {
  const scale = ent.scale || 1.0;
  const pCount = (damage > 20 ? 5 : 3) * (ent.isBoss ? 2 : 1);
  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 8 + Math.random() * 10;
    controller.particles.push({
      id: `p_${controller.particleId++}`,
      x: ent.x + (Math.random() - 0.5) * 10 * scale,
      y: ent.y - 50 * scale + (Math.random() - 0.5) * 20 * scale,
      vx: Math.cos(angle) * speed + dir * damage * 0.2,
      vy: Math.sin(angle) * speed - Math.abs(damage) * 0.2,
      radius: (5 + Math.random() * 6) * (ent.isBoss ? 1.5 : 1.0),
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3,
      isGrounded: false,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    });
  }
}

export function spawnFloatingText(controller, ent, player, damage) {
  if (controller.floatingTexts.length >= 3) return;
  
  controller.floatingTexts.push({
    id: `t_${controller.textId++}`,
    text: damage > 20 ? 'CRITICAL!' : `${Math.floor(damage)}`,
    x: ent.x + (Math.random() - 0.5) * 20,
    y: ent.y - 110,
    color: damage > 20 ? '#ec4899' : '#38bdf8',
    life: 0,
    scale: 1 + Math.min(player.combo * 0.02, 0.4)
  });
}