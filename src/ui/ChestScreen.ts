import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { getItemById } from '../inventory/ItemRegistry';
import { createItemIcon } from './IconGenerator';
import { ChestManager, type ChestSlot } from '../inventory/ChestManager';

export class ChestScreen {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private chestSlots: ChestSlot[] = [];

  private dragItem: { itemId: string; count: number; durability?: number } | null = null;
  private dragEl: HTMLDivElement | null = null;
  private tooltipEl: HTMLDivElement | null = null;

  constructor(inventory: Inventory, hotbar: Hotbar) {
    this.inventory = inventory;
    this.hotbar = hotbar;
  }

  openChest(x: number, y: number, z: number): void {
    this.chestSlots = ChestManager.getInstance().getChestSlots(x, y, z);
    this.visible = true;
    if (this.container) {
      this.container.style.display = 'flex';
    }
    this.refresh();
  }

  closeChest(): void {
    this.visible = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
    if (this.dragEl) this.dragEl.style.display = 'none';

    // Return any held drag item back to inventory / hotbar on close
    if (this.dragItem && this.dragItem.count > 0) {
      const rem = this.inventory.addItem(this.dragItem.itemId, this.dragItem.count, this.dragItem.durability);
      if (rem > 0) this.hotbar.addItem(this.dragItem.itemId, rem, this.dragItem.durability);
      this.dragItem = null;
    }
  }

  get isOpen(): boolean {
    return this.visible;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px);
      display: none; align-items: center; justify-content: center;
      z-index: 300; font-family: monospace; user-select: none;
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      background: rgba(20, 20, 32, 0.92); border: 2px solid rgba(255, 204, 0, 0.4);
      border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8); color: #fff;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    header.innerHTML = '<span style="font-size: 16px; font-weight: bold; color: #ffcc00;">📦 Peti Penyimpanan (Chest)</span>';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      color: #fff; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 14px;
    `;
    closeBtn.addEventListener('click', () => this.closeChest());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Chest Storage Section (27 slots / 3x9 grid)
    const chestLabel = document.createElement('div');
    chestLabel.style.cssText = 'font-size: 12px; color: #aaa;';
    chestLabel.textContent = 'Isi Peti (Chest Storage)';
    panel.appendChild(chestLabel);

    const chestGrid = document.createElement('div');
    chestGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 4px;';
    for (let i = 0; i < 27; i++) {
      chestGrid.appendChild(this.makeSlot(i, 'chest'));
    }
    panel.appendChild(chestGrid);

    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = 'height: 1px; background: rgba(255,255,255,0.15); margin: 4px 0;';
    panel.appendChild(divider);

    // Player Inventory Section
    const invLabel = document.createElement('div');
    invLabel.style.cssText = 'font-size: 12px; color: #aaa;';
    invLabel.textContent = 'Tas Karakter & Hotbar';
    panel.appendChild(invLabel);

    const invGrid = document.createElement('div');
    invGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 4px;';
    for (let i = 0; i < 27; i++) {
      invGrid.appendChild(this.makeSlot(i, 'inventory'));
    }
    panel.appendChild(invGrid);

    // Hotbar Section
    const hotbarGrid = document.createElement('div');
    hotbarGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 4px; margin-top: 4px;';
    for (let i = 0; i < 9; i++) {
      hotbarGrid.appendChild(this.makeSlot(i, 'hotbar'));
    }
    panel.appendChild(hotbarGrid);

    this.container.appendChild(panel);
    document.body.appendChild(this.container);

    // Drag Element
    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 400; display: none;
      width: 44px; height: 44px; background: rgba(255,255,255,0.25);
      border: 2px solid #fff; font-family: monospace; font-size: 11px; color: #fff;
      align-items: center; justify-content: center; border-radius: 6px;
    `;
    document.body.appendChild(this.dragEl);

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 410; display: none;
      background: rgba(15, 15, 25, 0.95); border: 1px solid rgba(255,204,0,0.4); border-radius: 6px;
      padding: 6px 12px; font-family: monospace; font-size: 12px; color: #ffcc00;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.8); white-space: nowrap;
    `;
    document.body.appendChild(this.tooltipEl);

    document.addEventListener('mousemove', this.onMouseMove);
  }

  private makeSlot(slotIdx: number, target: 'chest' | 'inventory' | 'hotbar'): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 44px; height: 44px; background: rgba(15, 15, 25, 0.65); border: 2px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; color: #fff; cursor: pointer;
      position: relative; border-radius: 6px; transition: border-color 0.15s;
    `;
    el.addEventListener('mousedown', (e) => this.onSlotClick(e, slotIdx, target));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  private getSlotData(slotIdx: number, target: 'chest' | 'inventory' | 'hotbar'): ChestSlot {
    if (target === 'chest') return this.chestSlots[slotIdx];
    if (target === 'hotbar') return this.hotbar.slots[slotIdx];
    return this.inventory.slots[slotIdx];
  }

  private onSlotClick(e: MouseEvent, slotIdx: number, target: 'chest' | 'inventory' | 'hotbar'): void {
    e.preventDefault();
    const slot = this.getSlotData(slotIdx, target);

    // Shift-Click: Quick Transfer between Chest & Player Inventory
    if (e.shiftKey && slot.itemId) {
      if (target === 'chest') {
        const rem = this.inventory.addItem(slot.itemId, slot.count, slot.durability);
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      } else {
        // Transfer to chest
        const itemDef = getItemById(slot.itemId);
        let rem = slot.count;
        for (let i = 0; i < 27; i++) {
          const cSlot = this.chestSlots[i];
          if (cSlot.itemId === slot.itemId && !itemDef?.toolType) {
            const space = (itemDef?.maxStack ?? 64) - cSlot.count;
            const add = Math.min(space, rem);
            cSlot.count += add;
            rem -= add;
            if (rem <= 0) break;
          }
        }
        if (rem > 0) {
          for (let i = 0; i < 27; i++) {
            const cSlot = this.chestSlots[i];
            if (cSlot.itemId === null) {
              cSlot.itemId = slot.itemId;
              cSlot.count = rem;
              cSlot.durability = slot.durability;
              rem = 0;
              break;
            }
          }
        }
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      }
      this.refresh();
      return;
    }

    const isRightClick = e.button === 2;

    if (this.dragItem) {
      if (isRightClick) {
        if (slot.itemId === null) {
          slot.itemId = this.dragItem.itemId;
          slot.count = 1;
          slot.durability = this.dragItem.durability;
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        } else if (slot.itemId === this.dragItem.itemId) {
          const max = getItemById(slot.itemId)?.maxStack ?? 64;
          if (slot.count < max) {
            slot.count++;
            this.dragItem.count--;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        }
      } else {
        if (slot.itemId === null) {
          slot.itemId = this.dragItem.itemId;
          slot.count = this.dragItem.count;
          slot.durability = this.dragItem.durability;
          this.dragItem = null;
        } else if (slot.itemId === this.dragItem.itemId) {
          const max = getItemById(slot.itemId)?.maxStack ?? 64;
          const space = max - slot.count;
          if (space > 0) {
            const add = Math.min(space, this.dragItem.count);
            slot.count += add;
            this.dragItem.count -= add;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        } else {
          const tmp = { itemId: slot.itemId, count: slot.count, durability: slot.durability };
          slot.itemId = this.dragItem.itemId;
          slot.count = this.dragItem.count;
          slot.durability = this.dragItem.durability;
          this.dragItem = tmp;
        }
      }
    } else if (slot.itemId) {
      if (isRightClick && slot.count > 1) {
        const half = Math.ceil(slot.count / 2);
        this.dragItem = { itemId: slot.itemId, count: half, durability: slot.durability };
        slot.count -= half;
      } else {
        this.dragItem = { itemId: slot.itemId, count: slot.count, durability: slot.durability };
        slot.itemId = null;
        slot.count = 0;
      }
    }
    this.refresh();
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.dragItem && this.dragEl) {
      this.dragEl.style.display = 'flex';
      this.dragEl.style.left = `${e.clientX - 22}px`;
      this.dragEl.style.top = `${e.clientY - 22}px`;
      this.dragEl.textContent = '';
      const icon = createItemIcon(this.dragItem.itemId, 28);
      this.dragEl.appendChild(icon);
      if (this.dragItem.count > 1) {
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'position:absolute;bottom:1px;right:4px;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 2px #000;';
        countSpan.textContent = String(this.dragItem.count);
        this.dragEl.appendChild(countSpan);
      }
    } else if (this.dragEl) {
      this.dragEl.style.display = 'none';
    }

    if (this.tooltipEl) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const slotEl = target?.closest<HTMLElement>('[data-item-id]');
      const itemId = slotEl?.dataset.itemId;

      if (itemId) {
        const itemDef = getItemById(itemId);
        if (itemDef) {
          this.tooltipEl.textContent = itemDef.name;
          this.tooltipEl.style.display = 'block';
          this.tooltipEl.style.left = `${e.clientX + 14}px`;
          this.tooltipEl.style.top = `${e.clientY + 14}px`;
          return;
        }
      }
      this.tooltipEl.style.display = 'none';
    }
  };

  refresh(): void {
    if (!this.container) return;

    const allSlots = this.container.querySelectorAll<HTMLDivElement>('div[style*="width: 44px"]');
    if (allSlots.length < 63) return;

    // Chest slots (0-26)
    for (let i = 0; i < 27; i++) {
      this.renderSlot(allSlots[i], this.chestSlots[i]);
    }
    // Player Inventory slots (27-53)
    for (let i = 0; i < 27; i++) {
      this.renderSlot(allSlots[27 + i], this.inventory.slots[i]);
    }
    // Player Hotbar slots (54-62)
    for (let i = 0; i < 9; i++) {
      this.renderSlot(allSlots[54 + i], this.hotbar.slots[i]);
      allSlots[54 + i].style.borderColor = i === this.hotbar.activeSlotIndex ? '#ffcc00' : 'rgba(255,255,255,0.15)';
    }
  }

  private renderSlot(el: HTMLDivElement, slot: ChestSlot): void {
    el.textContent = '';
    if (slot.itemId) {
      el.dataset.itemId = slot.itemId;
      const icon = createItemIcon(slot.itemId, 28);
      el.appendChild(icon);

      if (slot.count > 1) {
        const c = document.createElement('span');
        c.style.cssText = 'position:absolute;bottom:1px;right:4px;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 2px #000;';
        c.textContent = String(slot.count);
        el.appendChild(c);
      }

      // Durability Bar
      const itemDef = getItemById(slot.itemId);
      if (itemDef?.maxDurability && slot.durability !== undefined) {
        const ratio = Math.max(0, Math.min(1, slot.durability / itemDef.maxDurability));
        const color = ratio > 0.5 ? '#4caf50' : ratio > 0.2 ? '#ffeb3b' : '#f44336';
        const durBar = document.createElement('div');
        durBar.style.cssText = `
          position: absolute; bottom: 2px; left: 3px; width: 38px; height: 3px;
          background: rgba(0,0,0,0.6); border-radius: 1px; overflow: hidden;
        `;
        const fill = document.createElement('div');
        fill.style.cssText = `height: 100%; width: ${ratio * 100}%; background: ${color};`;
        durBar.appendChild(fill);
        el.appendChild(durBar);
      }
    } else {
      delete el.dataset.itemId;
    }
  }
}
