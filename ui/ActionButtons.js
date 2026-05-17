export class ActionButtons {
  constructor(controller) {
    this.controller = controller;
  }

  init() {
    const handleSimulatedKeyPress = (code) => {
      this.controller.handleKeyDown(code, code);
      setTimeout(() => this.controller.handleKeyUp(code, code), 150);
    };

    const btnAtk1 = document.getElementById('btn-atk-1');
    if (btnAtk1) {
      btnAtk1.addEventListener('click', () => handleSimulatedKeyPress('KeyJ'));
    }

    const btnAtk2 = document.getElementById('btn-atk-2');
    if (btnAtk2) {
      let blockHeld = false;
      const startBlock = () => {
        if (!blockHeld) {
          this.controller.handleKeyDown('KeyK', 'K');
          blockHeld = true;
        }
      };
      const endBlock = () => {
        if (blockHeld) {
          this.controller.handleKeyUp('KeyK', 'K');
          blockHeld = false;
        }
      };

      btnAtk2.addEventListener('mousedown', startBlock);
      btnAtk2.addEventListener('mouseup', endBlock);
      btnAtk2.addEventListener('mouseleave', endBlock);
      btnAtk2.addEventListener('touchstart', (e) => { e.preventDefault(); startBlock(); });
      btnAtk2.addEventListener('touchend', (e) => { e.preventDefault(); endBlock(); });
    }
  }
}