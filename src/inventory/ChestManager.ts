export interface ChestSlot {
  itemId: string | null;
  count: number;
  durability?: number;
}

export class ChestManager {
  private static instance: ChestManager;
  private chests = new Map<string, ChestSlot[]>();

  public static getInstance(): ChestManager {
    if (!ChestManager.instance) {
      ChestManager.instance = new ChestManager();
    }
    return ChestManager.instance;
  }

  private getKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  getChestSlots(x: number, y: number, z: number): ChestSlot[] {
    const key = this.getKey(x, y, z);
    if (!this.chests.has(key)) {
      const slots: ChestSlot[] = [];
      for (let i = 0; i < 27; i++) {
        slots.push({ itemId: null, count: 0 });
      }
      this.chests.set(key, slots);
    }
    return this.chests.get(key)!;
  }

  removeChest(x: number, y: number, z: number): ChestSlot[] {
    const key = this.getKey(x, y, z);
    const slots = this.chests.get(key) ?? [];
    this.chests.delete(key);
    return slots;
  }
}
