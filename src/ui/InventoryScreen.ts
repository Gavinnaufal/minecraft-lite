import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { getItemById } from '../inventory/ItemRegistry';
import { inputManager } from '../core/InputManager';
import { checkRecipe } from '../crafting/CraftingSystem';

export class InventoryScreen {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private dragItem: { itemId: string; count: number } | null = null;
  private dragEl: HTMLDivElement | null = null;

  // Crafting
  private craftGrid: (string | null)[][] = [[null, null, null], [null, null, null], [null, null, null]];
  private craftSlots: HTMLDivElement[] = [];
  private craftOutput: HTMLDivElement | null = null;

  constructor(inventory: Inventory, hotbar: Hotbar) {
    this.inventory = inventory;
    this.hotbar = hotbar;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); z-index: 200;
      justify-content: center; align-items: center; flex-direction: column;
    `;
    document.body.appendChild(this.container);

    // Main panel
    const panel = document.createElement('div');
    panel.style.cssText = 'background: #555; padding: 16px; border: 3px solid #333; display: flex; gap: 16px;';
    this.container.appendChild(panel);

    // Left side: crafting grid
    const craftArea = document.createElement('div');
    craftArea.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    const craftGridDiv = document.createElement('div');
    craftGridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(3, 44px); gap: 2px;';
    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 44px; height: 44px; background: #444; border: 2px solid #555;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 11px; color: #fff; cursor: pointer;
        position: relative;
      `;
      const r = Math.floor(i / 3), c = i % 3;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.removeCraftItem(r, c);
      });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      craftGridDiv.appendChild(el);
      this.craftSlots.push(el);
    }
    craftArea.appendChild(craftGridDiv);

    const arrow = document.createElement('div');
    arrow.textContent = '\u2192'; arrow.style.cssText = 'color: #fff; font-size: 24px;';
    craftArea.appendChild(arrow);

    this.craftOutput = document.createElement('div');
    this.craftOutput.style.cssText = `
      width: 44px; height: 44px; background: #444; border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; color: #fff; cursor: pointer; position: relative;
    `;
    this.craftOutput.addEventListener('click', () => this.takeOutput());
    craftArea.appendChild(this.craftOutput);
    panel.appendChild(craftArea);

    // Right side: inventory grid + hotbar
    const rightSide = document.createElement('div');
    const invGrid = document.createElement('div');
    invGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 2px;';
    for (let i = 0; i < 27; i++) {
      invGrid.appendChild(this.makeSlot(i, false));
    }
    rightSide.appendChild(invGrid);

    const hotbarRow = document.createElement('div');
    hotbarRow.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 2px; margin-top: 8px;';
    for (let i = 0; i < 9; i++) {
      hotbarRow.appendChild(this.makeSlot(i, true));
    }
    rightSide.appendChild(hotbarRow);
    panel.appendChild(rightSide);

    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 300; display: none;
      width: 44px; height: 44px; background: rgba(255,255,255,0.3);
      border: 2px solid #fff; font-family: monospace; font-size: 11px; color: #fff;
      align-items: center; justify-content: center;
    `;
    document.body.appendChild(this.dragEl);

    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  private makeSlot(slotIdx: number, isHotbar: boolean): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 44px; height: 44px; background: #444; border: 2px solid #666;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; color: #fff; cursor: pointer;
      position: relative;
    `;
    el.addEventListener('mousedown', (e) => this.onSlotDown(e, slotIdx, isHotbar));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  private removeCraftItem(r: number, c: number): void {
    const item = this.craftGrid[r][c];
    if (item) {
      this.inventory.addItem(item, 1);
      this.craftGrid[r][c] = null;
      this.refresh();
    }
  }

  private takeOutput(): void {
    const recipe = checkRecipe(this.craftGrid);
    if (!recipe) return;

    // Try to add result to inventory first
    const slot = this.inventory.slots.find((s) => s.itemId === recipe.result.itemId && s.count + recipe.result.count <= 64);
    if (!slot && this.inventory.slots.find((s) => !s.itemId)) {
      // Can place
    } else if (!slot) {
      return; // no space
    }

    // Consume grid items from inventory
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        this.craftGrid[r][c] = null;

    this.inventory.addItem(recipe.result.itemId, recipe.result.count);
    this.refresh();
  }

  private onSlotDown(e: MouseEvent, slotIdx: number, isHotbar: boolean): void {
    e.preventDefault();
    const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];

    if (this.dragItem) {
      if (slot.itemId === null) {
        slot.itemId = this.dragItem.itemId;
        slot.count = this.dragItem.count;
        this.dragItem = null;
      } else if (slot.itemId === this.dragItem.itemId) {
        const max = getItemById(slot.itemId)?.maxStack ?? 64;
        const total = slot.count + this.dragItem.count;
        slot.count = Math.min(total, max);
        if (total > max) this.dragItem.count = total - max;
        else this.dragItem = null;
      } else {
        const tmp = { itemId: slot.itemId, count: slot.count };
        slot.itemId = this.dragItem.itemId;
        slot.count = this.dragItem.count;
        this.dragItem = tmp;
      }
      this.refresh();
      return;
    }

    if (!slot.itemId) return;

    if (e.button === 0 && e.shiftKey) {
      // Shift-click: try to add to crafting grid
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (!this.craftGrid[r][c]) {
            this.craftGrid[r][c] = slot.itemId;
            slot.count--;
            if (slot.count <= 0) { slot.itemId = null; slot.count = 0; }
            this.refresh();
            return;
          }
        }
      }
      return;
    }

    this.dragItem = { itemId: slot.itemId, count: slot.count };
    slot.itemId = null;
    slot.count = 0;
    this.refresh();
  }

  private onDragMove = (e: MouseEvent): void => {
    if (!this.dragEl) return;
    if (!this.dragItem) { this.dragEl.style.display = 'none'; return; }
    this.dragEl.style.display = 'flex';
    this.dragEl.style.left = `${e.clientX - 22}px`;
    this.dragEl.style.top = `${e.clientY - 22}px`;
    const item = getItemById(this.dragItem.itemId);
    this.dragEl.textContent = item ? `${item.name[0]}${this.dragItem.count > 1 ? ' ' + this.dragItem.count : ''}` : '';
  };

  private onDragEnd = (): void => {
    if (this.dragItem && this.dragItem.count > 0) {
      const rem = this.inventory.addItem(this.dragItem.itemId, this.dragItem.count);
      if (rem > 0) this.hotbar.addItem(this.dragItem.itemId, rem);
      this.refresh();
    }
    this.dragItem = null;
  };

  refresh(): void {
    if (!this.container) return;
    const divs = this.container.querySelectorAll<HTMLDivElement>('div[style*="width: 44px"]');
    const allSlots = Array.from(divs);

    // Craft grid (first 9)
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      this.renderSlot(allSlots[i], { itemId: this.craftGrid[r][c], count: 1 });
    }
    // Output (index 9)
    const recipe = checkRecipe(this.craftGrid);
    this.renderSlot(allSlots[9], recipe ? { itemId: recipe.result.itemId, count: 1 } : { itemId: null, count: 0 });
    if (recipe && recipe.result.count > 1) {
      const c = document.createElement('span');
      c.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;';
      c.textContent = String(recipe.result.count);
      allSlots[9].appendChild(c);
    }

    // Inventory (indices 10-36)
    for (let i = 0; i < 27; i++) {
      this.renderSlot(allSlots[10 + i], this.inventory.slots[i]);
    }
    // Hotbar (indices 37-45)
    for (let i = 0; i < 9; i++) {
      this.renderSlot(allSlots[37 + i], this.hotbar.slots[i]);
      allSlots[37 + i].style.borderColor = i === this.hotbar.activeSlotIndex ? '#fff' : '#666';
    }
  }

  private renderSlot(el: HTMLDivElement, slot: { itemId: string | null; count: number }): void {
    el.textContent = '';
    if (slot.itemId) {
      const item = getItemById(slot.itemId);
      el.textContent = item ? item.name[0] : '?';
      if (slot.count > 1) {
        const c = document.createElement('span');
        c.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;';
        c.textContent = String(slot.count);
        el.appendChild(c);
      }
    }
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'flex' : 'none';
    }
    if (this.visible) {
      this.refresh();
      if (inputManager.isPointerLocked) document.exitPointerLock();
    }
  }

  get isOpen(): boolean { return this.visible; }
}
