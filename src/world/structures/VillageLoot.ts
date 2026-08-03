import { ChestManager } from '../../inventory/ChestManager';

interface LootPoolEntry {
  itemId: string;
  minCount: number;
  maxCount: number;
  chance: number; // 0..1 probability of being selected
}

const VILLAGE_CHEST_LOOT_POOL: LootPoolEntry[] = [
  { itemId: 'bread', minCount: 1, maxCount: 3, chance: 0.8 },
  { itemId: 'wheat', minCount: 2, maxCount: 6, chance: 0.7 },
  { itemId: 'wheat_seeds', minCount: 2, maxCount: 5, chance: 0.75 },
  { itemId: 'torch', minCount: 3, maxCount: 8, chance: 0.6 },
  { itemId: 'plank', minCount: 4, maxCount: 12, chance: 0.65 },
  { itemId: 'wood_log', minCount: 2, maxCount: 6, chance: 0.5 },
  { itemId: 'stick', minCount: 2, maxCount: 6, chance: 0.4 },
  { itemId: 'wooden_hoe', minCount: 1, maxCount: 1, chance: 0.3 },
  { itemId: 'stone', minCount: 3, maxCount: 8, chance: 0.4 },
  { itemId: 'emerald', minCount: 1, maxCount: 4, chance: 0.55 },
];

export class VillageLoot {
  /**
   * Fills a chest at world coordinates (x, y, z) with randomized village loot items.
   */
  static fillChest(x: number, y: number, z: number): void {
    const slots = ChestManager.getInstance().getChestSlots(x, y, z);

    // Pick 3 to 6 distinct slots to place loot
    const numItems = 3 + Math.floor(Math.random() * 4);
    const availableSlotIndices = Array.from({ length: 27 }, (_, i) => i);

    for (let i = 0; i < numItems; i++) {
      if (availableSlotIndices.length === 0) break;

      // Pick random loot pool entry
      const entry = VILLAGE_CHEST_LOOT_POOL[Math.floor(Math.random() * VILLAGE_CHEST_LOOT_POOL.length)];
      if (Math.random() > entry.chance) continue;

      // Pick random empty slot index
      const randomIndex = Math.floor(Math.random() * availableSlotIndices.length);
      const slotIndex = availableSlotIndices.splice(randomIndex, 1)[0];

      const count = entry.minCount + Math.floor(Math.random() * (entry.maxCount - entry.minCount + 1));
      slots[slotIndex] = {
        itemId: entry.itemId,
        count,
      };
    }
  }
}
