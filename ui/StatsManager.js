export class StatsManager {
  constructor(controller) {
    this.controller = controller;
    this.scoreEl = document.getElementById('score-val');
    this.maxComboEl = document.getElementById('max-combo-val');
    this.enemiesEl = document.getElementById('enemies-val');
    this.bossesEl = document.getElementById('bosses-val');
    this.comboContainer = document.getElementById('combo-container');
    this.comboVal = document.getElementById('combo-val');

    this.lastScore = -1;
    this.lastCombo = -1;
    this.lastMaxCombo = -1;
    this.lastEnemies = -1;
    this.lastBosses = -1;
  }

  update() {
    const stats = this.controller.stats;
    const currentCombo = this.controller.player.combo;

    if (this.lastScore !== stats.score) {
      if (this.scoreEl) this.scoreEl.textContent = Math.floor(stats.score).toLocaleString();
      this.lastScore = stats.score;
    }

    if (this.lastMaxCombo !== stats.maxCombo) {
      if (this.maxComboEl) this.maxComboEl.textContent = `${stats.maxCombo}x`;
      this.lastMaxCombo = stats.maxCombo;
    }

    if (this.lastEnemies !== stats.enemiesDefeated) {
      if (this.enemiesEl) this.enemiesEl.textContent = stats.enemiesDefeated.toLocaleString();
      this.lastEnemies = stats.enemiesDefeated;
    }

    if (this.lastBosses !== stats.bossesDefeated) {
      if (this.bossesEl) this.bossesEl.textContent = stats.bossesDefeated.toLocaleString();
      this.lastBosses = stats.bossesDefeated;
    }

    if (this.lastCombo !== currentCombo) {
      if (currentCombo > 0) {
        if (this.comboContainer) this.comboContainer.classList.remove('hidden');
        if (this.comboVal) this.comboVal.innerHTML = `${currentCombo}<span style="font-size: 2.25rem; color: white;">x</span>`;
      } else {
        if (this.comboContainer) this.comboContainer.classList.add('hidden');
      }
      this.lastCombo = currentCombo;
    }
  }
}