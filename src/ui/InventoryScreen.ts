import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { getItemById } from '../inventory/ItemRegistry';
import { inputManager } from '../core/InputManager';
import { checkRecipe } from '../crafting/CraftingSystem';
import { createItemIcon } from './IconGenerator';

export class InventoryScreen {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private dragItem: { itemId: string; count: number; durability?: number } | null = null;
  private dragEl: HTMLDivElement | null = null;
  private tooltipEl: HTMLDivElement | null = null;

  // Crafting 3x3 Grid
  private craftGrid: (string | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
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
    panel.style.cssText = 'background: #555; padding: 16px; border: 3px solid #333; display: flex; gap: 16px; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.6);';
    this.container.appendChild(panel);

    // Left side: crafting grid
    const craftArea = document.createElement('div');
    craftArea.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #444; padding: 12px; border-radius: 4px;';
    
    const craftLabel = document.createElement('div');
    craftLabel.style.cssText = 'position: absolute; top: -20px; left: 0; font-family: monospace; font-size: 12px; color: #fff; font-weight: bold;';
    craftLabel.textContent = 'Crafting';

    const craftGridDiv = document.createElement('div');
    craftGridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(3, 44px); gap: 2px; position: relative;';
    craftGridDiv.appendChild(craftLabel);

    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 44px; height: 44px; background: #333; border: 2px solid #555;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 11px; color: #fff; cursor: pointer;
        position: relative; border-radius: 2px;
      `;
      const r = Math.floor(i / 3), c = i % 3;
      el.addEventListener('mousedown', (e) => this.onCraftSlotClick(e, r, c));
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      craftGridDiv.appendChild(el);
      this.craftSlots.push(el);
    }
    craftArea.appendChild(craftGridDiv);

    const arrow = document.createElement('div');
    arrow.textContent = '\u2192';
    arrow.style.cssText = 'color: #fff; font-size: 24px; font-weight: bold; margin: 0 4px;';
    craftArea.appendChild(arrow);

    this.craftOutput = document.createElement('div');
    this.craftOutput.style.cssText = `
      width: 48px; height: 48px; background: #333; border: 2px solid #ffcc00;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; color: #fff; cursor: pointer; position: relative;
      border-radius: 4px; box-shadow: 0 0 8px rgba(255,204,0,0.4);
    `;
    this.craftOutput.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.takeOutput();
    });
    this.craftOutput.addEventListener('contextmenu', (e) => e.preventDefault());
    craftArea.appendChild(this.craftOutput);
    panel.appendChild(craftArea);

    // Right side: inventory grid + hotbar
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

    const invTitle = document.createElement('div');
    invTitle.style.cssText = 'font-family: monospace; font-size: 12px; color: #fff; font-weight: bold;';
    invTitle.textContent = 'Inventory';
    rightSide.appendChild(invTitle);

    const invGrid = document.createElement('div');
    invGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 2px;';
    for (let i = 0; i < 27; i++) {
      invGrid.appendChild(this.makeSlot(i, false));
    }
    rightSide.appendChild(invGrid);

    const hotbarTitle = document.createElement('div');
    hotbarTitle.style.cssText = 'font-family: monospace; font-size: 12px; color: #fff; font-weight: bold; margin-top: 4px;';
    hotbarTitle.textContent = 'Hotbar (Bag)';
    rightSide.appendChild(hotbarTitle);

    const hotbarRow = document.createElement('div');
    hotbarRow.style.cssText = 'display: grid; grid-template-columns: repeat(9, 44px); gap: 2px;';
    for (let i = 0; i < 9; i++) {
      hotbarRow.appendChild(this.makeSlot(i, true));
    }
    rightSide.appendChild(hotbarRow);
    panel.appendChild(rightSide);

    // Cursor Drag element
    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 300; display: none;
      width: 44px; height: 44px; background: rgba(255,255,255,0.25);
      border: 2px solid #fff; font-family: monospace; font-size: 11px; color: #fff;
      align-items: center; justify-content: center; border-radius: 4px;
    `;
    document.body.appendChild(this.dragEl);

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 400; display: none;
      background: rgba(16, 16, 24, 0.95); border: 2px solid #777; border-radius: 4px;
      padding: 6px 10px; font-family: monospace; font-size: 12px; color: #fff;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.7); white-space: nowrap;
    `;
    document.body.appendChild(this.tooltipEl);

    document.addEventListener('mousemove', this.onMouseMove);
  }

  private makeSlot(slotIdx: number, isHotbar: boolean): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 44px; height: 44px; background: #333; border: 2px solid #555;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; color: #fff; cursor: pointer;
      position: relative; border-radius: 2px;
    `;
    el.addEventListener('mousedown', (e) => this.onSlotClick(e, slotIdx, isHotbar));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  private onSlotClick(e: MouseEvent, slotIdx: number, isHotbar: boolean): void {
    e.preventDefault();
    const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];

    // Shift-Click: Quick Transfer between Hotbar & Inventory
    if (e.shiftKey && slot.itemId) {
      if (isHotbar) {
        const rem = this.inventory.addItem(slot.itemId, slot.count, slot.durability);
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      } else {
        const rem = this.hotbar.addItem(slot.itemId, slot.count, slot.durability);
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      }
      this.refresh();
      return;
    }

    const isRightClick = e.button === 2;

    if (this.dragItem) {
      if (isRightClick) {
        // Right click holding item: drop 1 item into slot
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
        // Left click holding item: place all / stack / swap
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
        // Right click without holding item: pick up HALF stack!
        const half = Math.ceil(slot.count / 2);
        this.dragItem = { itemId: slot.itemId, count: half, durability: slot.durability };
        slot.count -= half;
      } else {
        // Left click: pick up entire slot
        this.dragItem = { itemId: slot.itemId, count: slot.count, durability: slot.durability };
        slot.itemId = null;
        slot.count = 0;
      }
    }
    this.refresh();
  }

  private onCraftSlotClick(e: MouseEvent, r: number, c: number): void {
    e.preventDefault();
    const current = this.craftGrid[r][c];

    if (this.dragItem) {
      if (!current) {
        // Put 1 item from cursor into crafting grid slot
        this.craftGrid[r][c] = this.dragItem.itemId;
        this.dragItem.count--;
        if (this.dragItem.count <= 0) this.dragItem = null;
      } else if (current === this.dragItem.itemId) {
        // Already same item
      } else {
        // Swap with cursor item
        const tmp = current;
        this.craftGrid[r][c] = this.dragItem.itemId;
        this.dragItem = { itemId: tmp, count: 1 };
      }
    } else if (current) {
      // Pick up 1 item from crafting grid back to cursor
      this.dragItem = { itemId: current, count: 1 };
      this.craftGrid[r][c] = null;
    }
    this.refresh();
  }

  private takeOutput(): void {
    const recipe = checkRecipe(this.craftGrid);
    if (!recipe) return;

    if (this.dragItem) {
      if (this.dragItem.itemId === recipe.result.itemId) {
        const max = getItemById(recipe.result.itemId)?.maxStack ?? 64;
        if (this.dragItem.count + recipe.result.count <= max) {
          this.dragItem.count += recipe.result.count;
          this.consumeCraftGrid();
        }
      }
    } else {
      this.dragItem = { itemId: recipe.result.itemId, count: recipe.result.count };
      this.consumeCraftGrid();
    }
    this.refresh();
  }

  private consumeCraftGrid(): void {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.craftGrid[r][c]) {
          this.craftGrid[r][c] = null;
        }
      }
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.visible) {
      if (this.dragEl) this.dragEl.style.display = 'none';
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      return;
    }

    if (this.dragItem) {
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      if (this.dragEl) {
        this.dragEl.style.display = 'flex';
        this.dragEl.style.left = `${e.clientX - 22}px`;
        this.dragEl.style.top = `${e.clientY - 22}px`;
        this.dragEl.textContent = '';
        if (this.dragItem.itemId) {
          const icon = createItemIcon(this.dragItem.itemId, 28);
          this.dragEl.appendChild(icon);
          if (this.dragItem.count > 1) {
            const c = document.createElement('span');
            c.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
            c.textContent = String(this.dragItem.count);
            this.dragEl.appendChild(c);
          }
        }
      }
      return;
    }

    if (this.dragEl) this.dragEl.style.display = 'none';

    if (this.tooltipEl) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const slotEl = target?.closest<HTMLElement>('[data-item-id]');
      const itemId = slotEl?.dataset.itemId;

      if (itemId) {
        const itemDef = getItemById(itemId);
        if (itemDef) {
          this.tooltipEl.textContent = itemDef.name;
          this.tooltipEl.style.display = 'block';
          const left = Math.min(e.clientX + 14, window.innerWidth - 150);
          const top = Math.min(e.clientY + 14, window.innerHeight - 40);
          this.tooltipEl.style.left = `${Math.max(8, left)}px`;
          this.tooltipEl.style.top = `${Math.max(8, top)}px`;
          return;
        }
      }
      this.tooltipEl.style.display = 'none';
    }
  };

  refresh(): void {
    if (!this.container) return;

    // Collect all slots (0..8 = craft grid, 9 = craft result, 10..36 = inv, 37..45 = hotbar)
    const allSlots = this.container.querySelectorAll<HTMLDivElement>('div[style*="width: 44px"], div[style*="width: 48px"]');
    if (allSlots.length < 46) return;

    // Craft grid (indices 0-8)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const item = this.craftGrid[r][c];
        this.renderSlot(allSlots[r * 3 + c], item ? { itemId: item, count: 1 } : { itemId: null, count: 0 });
      }
    }

    // Craft result (index 9)
    const recipe = checkRecipe(this.craftGrid);
    this.renderSlot(allSlots[9], recipe ? { itemId: recipe.result.itemId, count: recipe.result.count } : { itemId: null, count: 0 });

    // Inventory (indices 10-36)
    for (let i = 0; i < 27; i++) {
      this.renderSlot(allSlots[10 + i], this.inventory.slots[i]);
    }
    // Hotbar (indices 37-45)
    for (let i = 0; i < 9; i++) {
      this.renderSlot(allSlots[37 + i], this.hotbar.slots[i]);
      allSlots[37 + i].style.borderColor = i === this.hotbar.activeSlotIndex ? '#fff' : '#555';
    }
  }

  private renderSlot(el: HTMLDivElement, slot: { itemId: string | null; count: number; durability?: number }): void {
    el.textContent = '';
    if (slot.itemId) {
      el.dataset.itemId = slot.itemId;
      const icon = createItemIcon(slot.itemId, 28);
      el.appendChild(icon);

      if (slot.count > 1) {
        const c = document.createElement('span');
        c.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
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

  toggle(): void {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'flex' : 'none';
    }
    if (!this.visible) {
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      if (this.dragEl) this.dragEl.style.display = 'none';

      // Return any held drag item back to inventory / hotbar on close
      if (this.dragItem && this.dragItem.count > 0) {
        const rem = this.inventory.addItem(this.dragItem.itemId, this.dragItem.count);
        if (rem > 0) this.hotbar.addItem(this.dragItem.itemId, rem);
        this.dragItem = null;
      }

      // Return crafting grid items back to inventory on close
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.craftGrid[r][c]) {
            const rem = this.inventory.addItem(this.craftGrid[r][c]!, 1);
            if (rem > 0) this.hotbar.addItem(this.craftGrid[r][c]!, rem);
            this.craftGrid[r][c] = null;
          }
        }
      }
    }
    if (this.visible) {
      this.refresh();
      if (inputManager.isPointerLocked) document.exitPointerLock();
    }
  }

  get isOpen(): boolean { return this.visible; }
}
