import { getItemById } from './ItemRegistry';

export interface Slot {
  itemId: string | null;
  count: number;
  durability?: number;
}

export class Inventory {
  readonly slots: Slot[] = new Array(27);

  constructor() {
    for (let i = 0; i < 27; i++) {
      this.slots[i] = { itemId: null, count: 0 };
    }
  }

  addItem(itemId: string, count: number, durability?: number): number {
    const item = getItemById(itemId);
    if (!item) return count;

    let remaining = count;

    // Stack into existing slots
    for (const slot of this.slots) {
      if (slot.itemId === itemId && slot.count < item.maxStack && !item.toolType) {
        const space = item.maxStack - slot.count;
        const add = Math.min(space, remaining);
        slot.count += add;
        remaining -= add;
        if (remaining <= 0) return 0;
      }
    }

    // Fill empty slots
    for (const slot of this.slots) {
      if (slot.itemId === null) {
        const add = Math.min(item.maxStack, remaining);
        slot.itemId = itemId;
        slot.count = add;
        slot.durability = durability ?? item.maxDurability;
        remaining -= add;
        if (remaining <= 0) return 0;
      }
    }

    return remaining;
  }

  removeItem(slotIndex: number, count: number): void {
    const slot = this.slots[slotIndex];
    if (!slot || !slot.itemId) return;
    slot.count -= count;
    if (slot.count <= 0) {
      slot.itemId = null;
      slot.count = 0;
    }
  }

  clear(): void {
    for (let i = 0; i < 27; i++) {
      this.slots[i] = { itemId: null, count: 0 };
    }
  }
}
