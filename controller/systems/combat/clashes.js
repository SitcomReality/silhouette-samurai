export function updateClashes(controller) {
  const p = controller.player;
  const attackers = [];
  
  if (p.state === 'attack' && p.attackFrameData) attackers.push(p);
  for (const ent of controller.entities) {
    if (ent.state === 'attack' && ent.attackFrameData) attackers.push(ent);
  }
  
  for (let i = 0; i < attackers.length; i++) {
    for (let j = i + 1; j < attackers.length; j++) {
      if (controller.parry.checkClash(attackers[i], attackers[j], controller)) {
        controller.parry.applyClash(attackers[i], attackers[j], controller);
      }
    }
  }
}