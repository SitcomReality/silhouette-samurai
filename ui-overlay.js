export class UIOverlay {
  constructor(controller, onThemeChange) {
    this.controller = controller;
    this.onThemeChange = onThemeChange;
    
    this.themes = [
      { name: 'Neon Cyan', color: '#06b6d4' },
      { name: 'Acid Green', color: '#22c55e' },
      { name: 'Hot Crimson', color: '#f43f5e' },
      { name: 'Hyper Violet', color: '#a855f7' },
      { name: 'Molten Gold', color: '#eab308' },
    ];
    this.themeColor = this.themes[0].color;
    
    this.scoreEl = document.getElementById('score-val');
    this.maxComboEl = document.getElementById('max-combo-val');
    this.enemiesEl = document.getElementById('enemies-val');
    this.bossesEl = document.getElementById('bosses-val');
    this.comboContainer = document.getElementById('combo-container');
    this.comboVal = document.getElementById('combo-val');
    this.headerIcon = document.getElementById('header-icon');
    this.headerHighlight = document.getElementById('header-highlight');
    
    this.initThemes();
    this.initControls();
    
    this.lastScore = -1;
    this.lastCombo = -1;
    this.lastMaxCombo = -1;
    this.lastEnemies = -1;
    this.lastBosses = -1;
  }
  
  initThemes() {
    const container = document.getElementById('theme-buttons');
    this.themes.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `theme-btn ${this.themeColor === t.color ? 'active' : ''}`;
      btn.style.backgroundColor = t.color;
      btn.title = t.name;
      btn.onclick = () => {
        this.themeColor = t.color;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.documentElement.style.setProperty('--theme-color', t.color);
        this.headerIcon.style.color = t.color;
        this.headerHighlight.style.color = t.color;
        this.onThemeChange(t.color);
      };
      container.appendChild(btn);
    });
    
    document.documentElement.style.setProperty('--theme-color', this.themeColor);
    this.headerIcon.style.color = this.themeColor;
    this.headerHighlight.style.color = this.themeColor;
    
    const devCheckbox = document.getElementById('dev-mode-checkbox');
    devCheckbox.checked = this.controller.devMode;
    devCheckbox.addEventListener('change', (e) => {
      this.controller.devMode = e.target.checked;
    });
  }
  
  initControls() {
    const handleSimulatedKeyPress = (code) => {
      this.controller.handleKeyDown(code, code);
      setTimeout(() => this.controller.handleKeyUp(code, code), 150);
    };
    
    document.getElementById('btn-atk-1').addEventListener('click', () => handleSimulatedKeyPress('KeyJ'));
    
    const btnAtk2 = document.getElementById('btn-atk-2');
    if (btnAtk2) {
      // Block button - hold/release simulation
      let blockHeld = false;
      btnAtk2.addEventListener('mousedown', () => {
        if (!blockHeld) {
          this.controller.handleKeyDown('KeyK', 'K');
          blockHeld = true;
        }
      });
      btnAtk2.addEventListener('mouseup', () => {
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
      btnAtk2.addEventListener('mouseleave', () => {
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
      
      // Touch events
      btnAtk2.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!blockHeld) {
          this.controller.handleKeyDown('KeyK', 'K');
          blockHeld = true;
        }
      });
      btnAtk2.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      });
    }
  }
  
  update() {
    const stats = this.controller.stats;
    const currentCombo = this.controller.player.combo;
    
    if (this.lastScore !== stats.score) {
      this.scoreEl.textContent = Math.floor(stats.score).toLocaleString();
      this.lastScore = stats.score;
    }
    
    if (this.lastMaxCombo !== stats.maxCombo) {
      this.maxComboEl.textContent = `${stats.maxCombo}x`;
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
        this.comboContainer.classList.remove('hidden');
        this.comboVal.innerHTML = `${currentCombo}<span style="font-size: 2.25rem; color: white;">x</span>`;
      } else {
        this.comboContainer.classList.add('hidden');
      }
      this.lastCombo = currentCombo;
    }
  }
}