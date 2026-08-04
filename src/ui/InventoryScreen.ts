import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { EquipmentSlots, type ArmorSlotType } from '../inventory/EquipmentSlots';
import { getItemById } from '../inventory/ItemRegistry';
import { checkRecipe } from '../crafting/CraftingSystem';
import { createItemIcon } from './IconGenerator';

export interface CraftGridSlot {
  itemId: string;
  count: number;
}

export class InventoryScreen {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private readonly equipmentSlots?: EquipmentSlots;
  private dragItem: { itemId: string; count: number; durability?: number } | null = null;
  private dragEl: HTMLDivElement | null = null;
  private tooltipEl: HTMLDivElement | null = null;
  private armorSlotEls: Record<ArmorSlotType, HTMLDivElement | null> = {
    helmet: null,
    chestplate: null,
    leggings: null,
    boots: null,
  };

  // Crafting 3x3 Grid with Stack Support
  private craftGrid: (CraftGridSlot | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  private craftSlots: HTMLDivElement[] = [];
  private craftOutput: HTMLDivElement | null = null;

  constructor(inventory: Inventory, hotbar: Hotbar, equipmentSlots?: EquipmentSlots) {
    this.inventory = inventory;
    this.hotbar = hotbar;
    this.equipmentSlots = equipmentSlots;
  }

  get isOpen(): boolean {
    return this.visible;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 200;
      justify-content: center; align-items: center; flex-direction: column;
    `;
    this.container.addEventListener('mousedown', (e) => e.stopPropagation());
    this.container.addEventListener('mouseup', (e) => e.stopPropagation());
    this.container.addEventListener('click', (e) => e.stopPropagation());
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    document.body.appendChild(this.container);

    // Main panel - Minecraft Classic Gray GUI Box
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: #c6c6c6; border-top: 4px solid #ffffff; border-left: 4px solid #ffffff;
      border-bottom: 4px solid #555555; border-right: 4px solid #555555;
      padding: 24px; display: flex; gap: 24px; border-radius: 4px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    `;
    this.container.appendChild(panel);

    // Equipment / Armor Column (Far Left)
    const armorCol = document.createElement('div');
    armorCol.style.cssText = 'display: flex; flex-direction: column; gap: 8px; background: #8b8b8b; padding: 12px; border: 3px solid #373737; border-radius: 4px; position: relative; margin-right: 4px;';
    
    const armorLabel = document.createElement('div');
    armorLabel.style.cssText = 'position: absolute; top: -24px; left: 0; font-family: monospace; font-size: 14px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff;';
    armorLabel.textContent = 'Armor';
    armorCol.appendChild(armorLabel);

    const slotTypes: ArmorSlotType[] = ['helmet', 'chestplate', 'leggings', 'boots'];
    for (const slotType of slotTypes) {
      const slotEl = document.createElement('div');
      slotEl.dataset.slotType = 'armor';
      slotEl.dataset.armorSlot = slotType;
      slotEl.style.cssText = `
        width: 56px; height: 56px; background: #8b8b8b;
        border-top: 3px solid #373737; border-left: 3px solid #373737;
        border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 12px; color: #fff; cursor: pointer;
        position: relative; border-radius: 2px;
      `;
      slotEl.addEventListener('mousedown', (e) => this.onArmorSlotClick(e, slotType));
      slotEl.addEventListener('contextmenu', (e) => e.preventDefault());
      armorCol.appendChild(slotEl);
      this.armorSlotEls[slotType] = slotEl;
    }
    panel.appendChild(armorCol);

    // Left side: crafting grid
    const craftArea = document.createElement('div');
    craftArea.style.cssText = 'display: flex; gap: 12px; align-items: center; background: #8b8b8b; padding: 16px; border: 3px solid #373737; border-radius: 4px; position: relative;';
    
    const craftLabel = document.createElement('div');
    craftLabel.style.cssText = 'position: absolute; top: -24px; left: 0; font-family: monospace; font-size: 15px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff;';
    craftLabel.textContent = 'Crafting Table (3x3)';

    const craftGridDiv = document.createElement('div');
    craftGridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(3, 56px); gap: 4px; position: relative;';
    craftGridDiv.appendChild(craftLabel);

    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.dataset.slotType = 'craft';
      el.style.cssText = `
        width: 56px; height: 56px; background: #8b8b8b;
        border-top: 3px solid #373737; border-left: 3px solid #373737;
        border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 12px; color: #fff; cursor: pointer;
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
    arrow.textContent = '➔';
    arrow.style.cssText = 'color: #373737; font-size: 32px; font-weight: bold; margin: 0 6px; text-shadow: 1px 1px 0 #fff;';
    craftArea.appendChild(arrow);

    this.craftOutput = document.createElement('div');
    this.craftOutput.dataset.slotType = 'output';
    this.craftOutput.style.cssText = `
      width: 64px; height: 64px; background: #8b8b8b;
      border-top: 3px solid #373737; border-left: 3px solid #373737;
      border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 12px; color: #fff; cursor: pointer; position: relative;
      border-radius: 4px; box-shadow: 0 0 10px rgba(255,204,0,0.6);
    `;
    this.craftOutput.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.takeOutput(e.shiftKey);
    });
    this.craftOutput.addEventListener('contextmenu', (e) => e.preventDefault());
    craftArea.appendChild(this.craftOutput);
    panel.appendChild(craftArea);

    // Right side: inventory grid + hotbar
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    const invTitle = document.createElement('div');
    invTitle.style.cssText = 'font-family: monospace; font-size: 15px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff;';
    invTitle.textContent = 'Inventory Karakter';
    rightSide.appendChild(invTitle);

    const invGrid = document.createElement('div');
    invGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 56px); gap: 4px;';
    for (let i = 0; i < 27; i++) {
      invGrid.appendChild(this.makeSlot(i, false));
    }
    rightSide.appendChild(invGrid);

    const hotbarTitle = document.createElement('div');
    hotbarTitle.style.cssText = 'font-family: monospace; font-size: 15px; color: #222; font-weight: bold; margin-top: 6px; text-shadow: 1px 1px 0 #fff;';
    hotbarTitle.textContent = 'Hotbar (Item Aktif)';
    rightSide.appendChild(hotbarTitle);

    const hotbarRow = document.createElement('div');
    hotbarRow.style.cssText = 'display: grid; grid-template-columns: repeat(9, 56px); gap: 4px;';
    for (let i = 0; i < 9; i++) {
      hotbarRow.appendChild(this.makeSlot(i, true));
    }
    rightSide.appendChild(hotbarRow);
    panel.appendChild(rightSide);

    // Cursor Drag element
    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 300; display: none;
      width: 56px; height: 56px; background: rgba(255,255,255,0.3);
      border: 2px solid #fff; font-family: monospace; font-size: 12px; color: #fff;
      align-items: center; justify-content: center; border-radius: 4px;
    `;
    document.body.appendChild(this.dragEl);

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 400; display: none;
      background: rgba(16, 0, 32, 0.95); border: 2px solid #5000ff; border-radius: 4px;
      padding: 8px 12px; font-family: monospace; font-size: 14px; color: #fff;
      box-shadow: 3px 3px 10px rgba(0,0,0,0.8); white-space: nowrap;
    `;
    document.body.appendChild(this.tooltipEl);

    document.addEventListener('mousemove', this.onMouseMove);
  }

  private makeSlot(slotIdx: number, isHotbar: boolean): HTMLDivElement {
    const el = document.createElement('div');
    el.dataset.slotType = 'slot';
    el.style.cssText = `
      width: 56px; height: 56px; background: #8b8b8b;
      border-top: 3px solid #373737; border-left: 3px solid #373737;
      border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 13px; color: #fff; cursor: pointer;
      position: relative; border-radius: 2px;
    `;
    el.addEventListener('mousedown', (e) => this.onSlotClick(e, slotIdx, isHotbar));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  private onArmorSlotClick(e: MouseEvent, slotType: ArmorSlotType): void {
    e.preventDefault();
    if (!this.equipmentSlots) return;

    const currentArmor = this.equipmentSlots.getItem(slotType);

    if (this.dragItem) {
      const itemMeta = getItemById(this.dragItem.itemId);
      if (itemMeta?.armorSlot === slotType) {
        const oldArmor = this.equipmentSlots.equip(slotType, this.dragItem.itemId);
        if (oldArmor && oldArmor.itemId) {
          this.dragItem = { itemId: oldArmor.itemId, count: 1 };
        } else {
          this.dragItem = null;
        }
      }
    } else if (currentArmor.itemId) {
      const unequipped = this.equipmentSlots.unequip(slotType);
      if (unequipped && unequipped.itemId) {
        this.dragItem = { itemId: unequipped.itemId, count: 1 };
      }
    }
    this.refresh();
  }

  private onSlotClick(e: MouseEvent, slotIdx: number, isHotbar: boolean): void {
    e.preventDefault();
    const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];

    // Shift-Click: Auto-equip if armor item, or Quick Transfer between Hotbar & Inventory
    if (e.shiftKey && slot.itemId) {
      const itemMeta = getItemById(slot.itemId);
      if (itemMeta?.armorSlot && this.equipmentSlots) {
        const equipped = this.equipmentSlots.equip(itemMeta.armorSlot, slot.itemId);
        if (equipped && equipped.itemId) {
          slot.itemId = equipped.itemId;
          slot.count = 1;
        } else {
          slot.itemId = null;
          slot.count = 0;
        }
        this.refresh();
        return;
      }
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
    const isRightClick = e.button === 2;

    if (this.dragItem) {
      if (!current) {
        if (isRightClick) {
          this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: 1 };
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        } else {
          this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: this.dragItem.count };
          this.dragItem = null;
        }
      } else if (current.itemId === this.dragItem.itemId) {
        const max = getItemById(current.itemId)?.maxStack ?? 64;
        if (isRightClick) {
          if (current.count < max) {
            current.count++;
            this.dragItem.count--;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        } else {
          const space = max - current.count;
          const add = Math.min(space, this.dragItem.count);
          current.count += add;
          this.dragItem.count -= add;
          if (this.dragItem.count <= 0) this.dragItem = null;
        }
      } else {
        const tmp = current;
        this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: this.dragItem.count };
        this.dragItem = { itemId: tmp.itemId, count: tmp.count };
      }
    } else if (current) {
      if (isRightClick && current.count > 1) {
        const half = Math.ceil(current.count / 2);
        this.dragItem = { itemId: current.itemId, count: half };
        current.count -= half;
      } else {
        this.dragItem = { itemId: current.itemId, count: current.count };
        this.craftGrid[r][c] = null;
      }
    }
    this.refresh();
  }

  private getSimpleCraftGridIds(): (string | null)[][] {
    return this.craftGrid.map(row => row.map(cell => cell ? cell.itemId : null));
  }

  private takeOutput(isShiftKey = false): void {
    const simpleGrid = this.getSimpleCraftGridIds();
    const recipe = checkRecipe(simpleGrid);
    if (!recipe) return;

    // Calculate max batches available in grid
    let maxBatches = 64;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.craftGrid[r][c]) {
          maxBatches = Math.min(maxBatches, this.craftGrid[r][c]!.count);
        }
      }
    }

    const maxStack = getItemById(recipe.result.itemId)?.maxStack ?? 64;

    if (isShiftKey || maxBatches > 1) {
      // Craft ALL available batches at once (or up to maxStack 64)
      const maxPossibleBatches = Math.min(maxBatches, Math.floor(maxStack / recipe.result.count));
      const totalYield = maxPossibleBatches * recipe.result.count;

      if (totalYield > 0) {
        // Add yield directly into inventory/hotbar or drag cursor
        let rem = this.inventory.addItem(recipe.result.itemId, totalYield);
        if (rem > 0) {
          rem = this.hotbar.addItem(recipe.result.itemId, rem);
        }
        if (rem > 0) {
          if (this.dragItem && this.dragItem.itemId === recipe.result.itemId) {
            this.dragItem.count += rem;
          } else if (!this.dragItem) {
            this.dragItem = { itemId: recipe.result.itemId, count: rem };
          }
        }
        this.consumeCraftGrid(maxPossibleBatches);
      }
    } else {
      // Single Batch Craft
      if (this.dragItem) {
        if (this.dragItem.itemId === recipe.result.itemId) {
          if (this.dragItem.count + recipe.result.count <= maxStack) {
            this.dragItem.count += recipe.result.count;
            this.consumeCraftGrid(1);
          }
        }
      } else {
        this.dragItem = { itemId: recipe.result.itemId, count: recipe.result.count };
        this.consumeCraftGrid(1);
      }
    }
    this.refresh();
  }

  private consumeCraftGrid(amount = 1): void {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const slot = this.craftGrid[r][c];
        if (slot) {
          slot.count -= amount;
          if (slot.count <= 0) {
            this.craftGrid[r][c] = null;
          }
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
        this.dragEl.style.left = `${e.clientX - 28}px`;
        this.dragEl.style.top = `${e.clientY - 28}px`;
        this.dragEl.textContent = '';
        if (this.dragItem.itemId) {
          const icon = createItemIcon(this.dragItem.itemId, 38);
          this.dragEl.appendChild(icon);
          if (this.dragItem.count > 1) {
            const c = document.createElement('span');
            c.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:13px;font-weight:bold;color:#fff;text-shadow:2px 2px 0 #000;';
            c.textContent = String(this.dragItem.count);
            this.dragEl.appendChild(c);
          }
        }
      }
    } else {
      if (this.dragEl) this.dragEl.style.display = 'none';
    }
  };

  show(): void {
    this.visible = true;
    if (this.container) this.container.style.display = 'flex';
    this.refresh();
  }

  open(): void {
    this.show();
  }

  hide(): void {
    this.visible = false;
    if (this.container) this.container.style.display = 'none';
    if (this.dragEl) this.dragEl.style.display = 'none';
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
    this.returnCraftGridToInventory();
  }

  close(): void {
    this.hide();
  }

  toggle(): void {
    if (this.visible) this.hide();
    else this.show();
  }

  private returnCraftGridToInventory(): void {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const slot = this.craftGrid[r][c];
        if (slot) {
          let rem = this.inventory.addItem(slot.itemId, slot.count);
          if (rem > 0) this.hotbar.addItem(slot.itemId, rem);
          this.craftGrid[r][c] = null;
        }
      }
    }
    if (this.dragItem) {
      let rem = this.inventory.addItem(this.dragItem.itemId, this.dragItem.count, this.dragItem.durability);
      if (rem > 0) this.hotbar.addItem(this.dragItem.itemId, rem, this.dragItem.durability);
      this.dragItem = null;
    }
  }

  refresh(): void {
    if (!this.container) return;

    // Refresh Armor slots
    if (this.equipmentSlots) {
      const slotTypes: ArmorSlotType[] = ['helmet', 'chestplate', 'leggings', 'boots'];
      for (const slotType of slotTypes) {
        const slotEl = this.armorSlotEls[slotType];
        if (!slotEl) continue;
        slotEl.innerHTML = '';
        const item = this.equipmentSlots.getItem(slotType);
        if (item && item.itemId) {
          slotEl.appendChild(createItemIcon(item.itemId, 38));
        } else {
          slotEl.textContent = slotType.substring(0, 3).toUpperCase();
        }
      }
    }

    // Refresh Crafting 3x3 Grid
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      const el = this.craftSlots[i];
      if (!el) continue;
      el.innerHTML = '';
      const item = this.craftGrid[r][c];
      if (item) {
        el.appendChild(createItemIcon(item.itemId, 38));
        if (item.count > 1) {
          const countSpan = document.createElement('span');
          countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:12px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
          countSpan.textContent = String(item.count);
          el.appendChild(countSpan);
        }
      }
    }

    // Refresh Output Slot
    if (this.craftOutput) {
      this.craftOutput.innerHTML = '';
      const simpleGrid = this.getSimpleCraftGridIds();
      const recipe = checkRecipe(simpleGrid);
      if (recipe) {
        let maxBatches = 64;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            if (this.craftGrid[r][c]) {
              maxBatches = Math.min(maxBatches, this.craftGrid[r][c]!.count);
            }
          }
        }
        const yieldCount = recipe.result.count * (maxBatches > 1 ? maxBatches : 1);

        this.craftOutput.appendChild(createItemIcon(recipe.result.itemId, 44));
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:13px;font-weight:bold;color:#ffcc00;text-shadow:1px 1px 0 #000;';
        countSpan.textContent = String(yieldCount);
        this.craftOutput.appendChild(countSpan);
      }
    }

    // Refresh Inventory slots
    const invSlots = this.container.querySelectorAll<HTMLDivElement>('[data-slot-type="slot"]');
    invSlots.forEach((el, idx) => {
      const isHotbar = idx >= 27;
      const slotIdx = isHotbar ? idx - 27 : idx;
      const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];
      el.innerHTML = '';

      if (slot.itemId) {
        el.appendChild(createItemIcon(slot.itemId, 38));
        if (slot.count > 1) {
          const c = document.createElement('span');
          c.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:12px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
          c.textContent = String(slot.count);
          el.appendChild(c);
        }
      }
    });
  }
}
