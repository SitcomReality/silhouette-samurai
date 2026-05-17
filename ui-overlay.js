import { ThemeManager } from './ui/ThemeManager.js';
import { ActionButtons } from './ui/ActionButtons.js';
import { StatsManager } from './ui/StatsManager.js';
import { CombatTuner } from './ui/tuner/CombatTuner.js';

export class UIOverlay {
  constructor(controller, onThemeChange) {
    this.controller = controller;
    
    this.themeManager = new ThemeManager(controller, onThemeChange);
    this.actionButtons = new ActionButtons(controller);
    this.statsManager = new StatsManager(controller);
    this.combatTuner = new CombatTuner(controller);
    
    this.init();
  }
  
  init() {
    this.themeManager.init();
    this.actionButtons.init();
    this.combatTuner.init();
  }

  update() {
    this.statsManager.update();
  }
}