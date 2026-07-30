import { Hotbar } from '../inventory/Hotbar';
import { getItemById } from '../inventory/ItemRegistry';

export class HUD {
  private hotbar: Hotbar;
  private container: HTMLDivElement;
  private slots: HTMLDivElement[] = [];
  private crosshair: HTMLDivElement;
  private timeDisplay: HTMLDivElement;
  private timeIcon: HTMLDivElement;

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

  update(): void {
    for (let i = 0; i < 9; i++) {
      const slot = this.slots[i];
      const item = this.hotbar.slots[i];
      const isActive = i === this.hotbar.activeSlotIndex;
      slot.style.borderColor = isActive ? '#fff' : '#555';

      if (item.itemId) {
        const itemDef = getItemById(item.itemId);
        slot.textContent = itemDef ? itemDef.name[0] : '?';
        if (item.count > 1) {
          const countEl = document.createElement('span');
          countEl.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;';
          countEl.textContent = String(item.count);
          slot.textContent = '';
          slot.appendChild(document.createTextNode(itemDef ? itemDef.name[0] : '?'));
          slot.appendChild(countEl);
        }
      } else {
        slot.textContent = '';
      }
    }
  }
}
