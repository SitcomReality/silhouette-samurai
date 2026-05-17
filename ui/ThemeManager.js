export class ThemeManager {
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
    this.headerIcon = document.getElementById('header-icon');
    this.headerHighlight = document.getElementById('header-highlight');
  }

  init() {
    const container = document.getElementById('theme-buttons');
    if (!container) return;
    
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
        if (this.headerIcon) this.headerIcon.style.color = t.color;
        if (this.headerHighlight) this.headerHighlight.style.color = t.color;
        this.onThemeChange(t.color);
      };
      container.appendChild(btn);
    });

    document.documentElement.style.setProperty('--theme-color', this.themeColor);
    if (this.headerIcon) this.headerIcon.style.color = this.themeColor;
    if (this.headerHighlight) this.headerHighlight.style.color = this.themeColor;

    const devCheckbox = document.getElementById('dev-mode-checkbox');
    if (devCheckbox) {
      devCheckbox.checked = this.controller.devMode;
      devCheckbox.addEventListener('change', (e) => {
        this.controller.devMode = e.target.checked;
      });
    }
  }
}