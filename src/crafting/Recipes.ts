export interface Recipe {
  pattern: (string | null)[][];
  result: { itemId: string; count: number };
}

export const recipes: Recipe[] = [
  // 1. Log to Plank
  { pattern: [['wood_log']], result: { itemId: 'plank', count: 4 } },
  // 2. Plank to Crafting Table
  { pattern: [['plank', 'plank'], ['plank', 'plank']], result: { itemId: 'crafting_table', count: 1 } },
  // 3. Plank to Stick
  { pattern: [['plank'], ['plank']], result: { itemId: 'stick', count: 4 } },
  // 4. Wooden Pickaxe
  { pattern: [['plank', 'plank', 'plank'], [null, 'stick', null], [null, 'stick', null]], result: { itemId: 'wooden_pickaxe', count: 1 } },
  // 5. Wooden Sword
  { pattern: [['plank'], ['plank'], ['stick']], result: { itemId: 'wooden_sword', count: 1 } },
  // 6. Wooden Shovel
  { pattern: [['plank'], ['stick'], ['stick']], result: { itemId: 'wooden_shovel', count: 1 } },
  // 7. Wooden Axe
  { pattern: [['plank', 'plank'], ['plank', 'stick'], [null, 'stick']], result: { itemId: 'wooden_axe', count: 1 } },
  // 8. Stone Pickaxe
  { pattern: [['stone', 'stone', 'stone'], [null, 'stick', null], [null, 'stick', null]], result: { itemId: 'stone_pickaxe', count: 1 } },
  // 9. Stone Sword
  { pattern: [['stone'], ['stone'], ['stick']], result: { itemId: 'stone_sword', count: 1 } },
  // 10. Sand to Sandstone
  { pattern: [['sand', 'sand'], ['sand', 'sand']], result: { itemId: 'sandstone', count: 1 } },
];
