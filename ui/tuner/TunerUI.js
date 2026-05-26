export const TUNER_HTML = `
  <div class="tuner-header">
    <span>Combat & Audio Tuner</span>
    <button id="btn-close-tuner">✕</button>
  </div>
  <div class="tuner-nav">
    <button class="tuner-tab active" data-tab="attacks">Attacks</button>
    <button class="tuner-tab" data-tab="physics">Physics</button>
    <button class="tuner-tab" data-tab="audio">Audio</button>
  </div>
  <div class="tuner-content">
    <div id="tuner-attacks" class="tuner-panel">
      <div class="tuner-section" style="padding: 10px; border-bottom: 1px solid #334155; background: rgba(0,0,0,0.2);">
        <div style="display: flex; flex-direction: column; gap: 8px;">
           <label class="dev-mode-toggle" style="border: none; padding: 0; margin: 0;">
             <input type="checkbox" id="tuner-freeze-player" />
             <span>Freeze Player Movement</span>
           </label>
           <label class="dev-mode-toggle" style="border: none; padding: 0; margin: 0;">
             <input type="checkbox" id="tuner-loop-attack" />
             <span>Auto-Loop Selected Attack</span>
           </label>
        </div>
      </div>
      <div class="tuner-section">
        <label style="color:#94a3b8;font-weight:600;display:block;margin-bottom:4px;">Select Attack:</label>
        <select id="tuner-attack-select" style="width:100%;background:#0f172a;color:white;border:1px solid #334155;padding:4px;border-radius:4px;"></select>
      </div>
      <div id="tuner-controls-attacks" class="tuner-controls"></div>
    </div>
    <div id="tuner-physics" class="tuner-panel hidden">
      <div id="tuner-controls-physics" class="tuner-controls"></div>
    </div>
    <div id="tuner-audio" class="tuner-panel hidden">
      <div id="tuner-controls-audio" class="tuner-controls"></div>
    </div>
  </div>
  <div class="tuner-footer">
    <button id="btn-export-tuner" class="btn-action" style="width: 100%; height: 2.5rem; font-size: 0.75rem; background: #0f172a;">📤 Export to Clipboard</button>
  </div>
`;

export function setupTabs(container, onTabChange = null) {
  const tabs = container.querySelectorAll('.tuner-tab');
  const panels = container.querySelectorAll('.tuner-panel');

  tabs.forEach(tab => {
    tab.onclick = (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      
      const tabName = e.target.dataset.tab;
      e.target.classList.add('active');
      const targetId = `tuner-${tabName}`;
      container.querySelector(`#${targetId}`).classList.remove('hidden');
      
      if (onTabChange) onTabChange(tabName);
    };
  });
}