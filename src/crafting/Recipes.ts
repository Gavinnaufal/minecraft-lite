export interface Recipe {
  pattern: (string | null)[][];
  result: { itemId: string; count: number };
}

export const recipes: Recipe[] = [
  { pattern: [['wood_log']], result: { itemId: 'plank', count: 4 } },
  { pattern: [['plank', 'plank'], ['plank', 'plank']], result: { itemId: 'crafting_table', count: 1 } },
  { pattern: [['plank'], ['plank']], result: { itemId: 'stick', count: 4 } },
  { pattern: [['plank', 'plank', 'plank'], [null, 'stick', null], [null, 'stick', null]], result: { itemId: 'wooden_pickaxe', count: 1 } },
];
