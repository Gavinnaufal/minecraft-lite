import type { Slot } from './Inventory';
import { getItemById } from './ItemRegistry';

export class Hotbar {
  readonly slots: Slot[] = new Array(9);
  activeSlotIndex = 0;

  constructor() {
    for (let i = 0; i < 9; i++) {
      this.slots[i] = { itemId: null, count: 0 };
    }
  }

  getActiveItem(): Slot {
    return this.slots[this.activeSlotIndex];
  }

  addItem(itemId: string, count: number): number {
    const item = getItemById(itemId);
    if (!item) return count;

    let remaining = count;
    for (let i = 0; i < 9; i++) {
      const slot = this.slots[i];
      if (slot.itemId === itemId && slot.count < item.maxStack) {
        const space = item.maxStack - slot.count;
        const add = Math.min(space, remaining);
        slot.count += add;
        remaining -= add;
        if (remaining <= 0) return 0;
      }
    }
    for (let i = 0; i < 9; i++) {
      const slot = this.slots[i];
      if (slot.itemId === null) {
        const add = Math.min(item.maxStack, remaining);
        slot.itemId = itemId;
        slot.count = add;
        remaining -= add;
        if (remaining <= 0) return 0;
      }
    }
    return remaining;
  }
}
