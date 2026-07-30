import { Hotbar } from '../inventory/Hotbar';
import { createItemIcon } from './IconGenerator';

export class HUD {
  private hotbar: Hotbar;
  private container: HTMLDivElement;
  private slots: HTMLDivElement[] = [];
  private crosshair: HTMLDivElement;
  private timeDisplay: HTMLDivElement;
  private timeIcon: HTMLDivElement;
  private healthContainer: HTMLDivElement;
  private heartEls: HTMLSpanElement[] = [];

  constructor(hotbar: Hotbar) {
    this.hotbar = hotbar;

    this.crosshair = document.createElement('div');
    this.crosshair.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 4px; height: 4px; background: #fff; z-index: 100; pointer-events: none;
      border: 1px solid #000; border-radius: 2px;
    `;
    document.body.appendChild(this.crosshair);

    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 2px; z-index: 100; pointer-events: none;
    `;
    document.body.appendChild(this.container);

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: 44px; height: 44px; background: rgba(0,0,0,0.5);
        border: 2px solid #555; display: flex; align-items: center;
        justify-content: center; position: relative;
        font-family: monospace; font-size: 11px; color: #fff;
      `;
      this.container.appendChild(slot);
      this.slots.push(slot);
    }

    // Health bar visual (10 heart icons = 20 HP)
    this.healthContainer = document.createElement('div');
    this.healthContainer.style.cssText = `
      position: fixed; bottom: 58px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 3px; z-index: 100; pointer-events: none;
    `;
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('span');
      heart.style.cssText = 'font-size: 16px; text-shadow: 1px 1px 2px #000; filter: drop-shadow(0 0 2px rgba(0,0,0,0.8));';
      heart.textContent = '❤';
      heart.style.color = '#ff3333';
      this.healthContainer.appendChild(heart);
      this.heartEls.push(heart);
    }
    document.body.appendChild(this.healthContainer);

    this.timeIcon = document.createElement('div');
    this.timeIcon.style.cssText = `
      position: fixed; top: 8px; left: 50%; transform: translateX(-50%); z-index: 100;
      font-family: monospace; font-size: 18px; color: #fff; pointer-events: none;
      text-shadow: 1px 1px 2px #000;
    `;
    document.body.appendChild(this.timeIcon);

    this.timeDisplay = document.createElement('div');
    this.timeDisplay.style.cssText = `
      position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 100;
      font-family: monospace; font-size: 12px; color: #fff; pointer-events: none;
      text-shadow: 1px 1px 2px #000;
    `;
    document.body.appendChild(this.timeDisplay);
  }

  setTime(timeOfDay: number): void {
    this.timeIcon.textContent = timeOfDay > 0.25 && timeOfDay < 0.75 ? '\u2600' : '\u263D';

    const hour = Math.floor(timeOfDay * 24);
    const min = Math.floor((timeOfDay * 24 - hour) * 60);
    this.timeDisplay.textContent = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  setCrosshairState(state: 'none' | 'block' | 'mob'): void {
    if (state === 'mob') {
      this.crosshair.style.width = '8px';
      this.crosshair.style.height = '8px';
      this.crosshair.style.background = '#ff3333';
      this.crosshair.style.borderColor = '#ffffff';
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.2)';
    } else if (state === 'block') {
      this.crosshair.style.width = '6px';
      this.crosshair.style.height = '6px';
      this.crosshair.style.background = '#ffcc00';
      this.crosshair.style.borderColor = '#000000';
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.1)';
    } else {
      this.crosshair.style.width = '4px';
      this.crosshair.style.height = '4px';
      this.crosshair.style.background = '#ffffff';
      this.crosshair.style.borderColor = '#000000';
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.0)';
    }
  }

  updateHealth(health: number): void {
    const clampedHp = Math.max(0, Math.min(20, health));
    for (let i = 0; i < 10; i++) {
      const el = this.heartEls[i];
      const fullThreshold = (i + 1) * 2;
      const halfThreshold = fullThreshold - 1;

      if (clampedHp >= fullThreshold) {
        el.textContent = '❤';
        el.style.color = '#ff3333';
        el.style.opacity = '1.0';
      } else if (clampedHp === halfThreshold) {
        el.textContent = '💔';
        el.style.color = '#ff8833';
        el.style.opacity = '1.0';
      } else {
        el.textContent = '❤';
        el.style.color = '#444444';
        el.style.opacity = '0.4';
      }
    }
  }

  update(playerHealth?: number): void {
    if (playerHealth !== undefined) {
      this.updateHealth(playerHealth);
    }
    for (let i = 0; i < 9; i++) {
      const slot = this.slots[i];
      const item = this.hotbar.slots[i];
      const isActive = i === this.hotbar.activeSlotIndex;
      slot.style.borderColor = isActive ? '#fff' : '#555';
      slot.style.boxShadow = isActive ? '0 0 6px rgba(255,255,255,0.6)' : 'none';

      if (item.itemId) {
        slot.textContent = '';
        const icon = createItemIcon(item.itemId, 28);
        slot.appendChild(icon);

        if (item.count > 1) {
          const countEl = document.createElement('span');
          countEl.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
          countEl.textContent = String(item.count);
          slot.appendChild(countEl);
        }
      } else {
        slot.textContent = '';
      }
    }
  }
}
