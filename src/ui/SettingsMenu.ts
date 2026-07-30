import { gameSettings } from '../core/GameSettings';

export class SettingsMenu {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private onChange: (() => void) | null = null;

  create(onChange?: () => void): void {
    this.onChange = onChange ?? null;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none;
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 110;
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-family: monospace;
      font-size: 13px;
      padding: 12px 16px;
      border-radius: 6px;
      min-width: 200px;
    `;

    const label = document.createElement('div');
    label.style.marginBottom = '6px';
    label.textContent = `Render Distance: ${gameSettings.renderDistance}`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '2';
    slider.max = '10';
    slider.step = '1';
    slider.value = String(gameSettings.renderDistance);
    slider.style.width = '100%';

    const updateLabel = () => {
      label.textContent = `Render Distance: ${gameSettings.renderDistance}`;
    };

    slider.addEventListener('input', () => {
      gameSettings.renderDistance = parseInt(slider.value);
      updateLabel();
      this.onChange?.();
    });

    this.container.appendChild(label);
    this.container.appendChild(slider);
    document.body.appendChild(this.container);
  }

  toggle(): void {
    if (!this.container) return;
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }

  remove(): void {
    this.container?.remove();
    this.container = null;
  }
}
