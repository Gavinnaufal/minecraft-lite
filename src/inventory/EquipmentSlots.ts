import { getItemById } from './ItemRegistry';

export type ArmorSlotType = 'helmet' | 'chestplate' | 'leggings' | 'boots';

export interface EquipmentSlotData {
  slotType: ArmorSlotType;
  itemId: string | null;
  count: number;
}

export class EquipmentSlots {
  public slots: Record<ArmorSlotType, { itemId: string | null; count: number }> = {
    helmet: { itemId: null, count: 0 },
    chestplate: { itemId: null, count: 0 },
    leggings: { itemId: null, count: 0 },
    boots: { itemId: null, count: 0 },
  };

  equip(slotType: ArmorSlotType, itemId: string): { itemId: string | null; count: number } | null {
    const previous = { ...this.slots[slotType] };
    this.slots[slotType] = { itemId, count: 1 };
    return previous.itemId ? previous : null;
  }

  unequip(slotType: ArmorSlotType): { itemId: string | null; count: number } | null {
    const current = { ...this.slots[slotType] };
    if (!current.itemId) return null;
    this.slots[slotType] = { itemId: null, count: 0 };
    return current;
  }

  getItem(slotType: ArmorSlotType): { itemId: string | null; count: number } {
    return this.slots[slotType];
  }

  getTotalDefense(): number {
    let totalDefense = 0;
    for (const slotKey of Object.keys(this.slots) as ArmorSlotType[]) {
      const item = this.slots[slotKey];
      if (item.itemId) {
        const itemData = getItemById(item.itemId);
        if (itemData && itemData.armorDefense) {
          totalDefense += itemData.armorDefense;
        }
      }
    }
    return totalDefense;
  }

  clear(): void {
    this.slots.helmet = { itemId: null, count: 0 };
    this.slots.chestplate = { itemId: null, count: 0 };
    this.slots.leggings = { itemId: null, count: 0 };
    this.slots.boots = { itemId: null, count: 0 };
  }
}
