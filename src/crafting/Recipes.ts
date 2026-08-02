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
  // 10. Stone Axe
  { pattern: [['stone', 'stone'], ['stone', 'stick'], [null, 'stick']], result: { itemId: 'stone_axe', count: 1 } },
  // 11. Stone Shovel
  { pattern: [['stone'], ['stick'], ['stick']], result: { itemId: 'stone_shovel', count: 1 } },
  // 12. Sand to Sandstone
  { pattern: [['sand', 'sand'], ['sand', 'sand']], result: { itemId: 'sandstone', count: 1 } },
  // 13. Stick + Plank to Torch
  { pattern: [['plank'], ['stick']], result: { itemId: 'torch', count: 4 } },
  { pattern: [['wood_log'], ['stick']], result: { itemId: 'torch', count: 4 } },
  // 14. 8 Planks to Chest
  { pattern: [['plank', 'plank', 'plank'], ['plank', null, 'plank'], ['plank', 'plank', 'plank']], result: { itemId: 'chest', count: 1 } },
  // 15. Wooden Hoe
  { pattern: [['plank', 'plank'], [null, 'stick'], [null, 'stick']], result: { itemId: 'wooden_hoe', count: 1 } },
  // 16. Stone Hoe
  { pattern: [['stone', 'stone'], [null, 'stick'], [null, 'stick']], result: { itemId: 'stone_hoe', count: 1 } },
  // 17. Wheat to Bread
  { pattern: [['wheat', 'wheat', 'wheat']], result: { itemId: 'bread', count: 1 } },
  // v2.0 Recipes
  // 18. Iron Sword
  { pattern: [['iron_ingot'], ['iron_ingot'], ['stick']], result: { itemId: 'iron_sword', count: 1 } },
  // 19. Iron Pickaxe
  { pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], [null, 'stick', null], [null, 'stick', null]], result: { itemId: 'iron_pickaxe', count: 1 } },
  // 20. Iron Axe
  { pattern: [['iron_ingot', 'iron_ingot'], ['iron_ingot', 'stick'], [null, 'stick']], result: { itemId: 'iron_axe', count: 1 } },
  // 21. Iron Shovel
  { pattern: [['iron_ingot'], ['stick'], ['stick']], result: { itemId: 'iron_shovel', count: 1 } },
  // 22. Bow (stick + string)
  { pattern: [[null, 'stick', 'string'], ['stick', null, 'string'], [null, 'stick', 'string']], result: { itemId: 'bow', count: 1 } },
  // 23. Arrow (flint + stick + feather)
  { pattern: [['stone'], ['stick'], ['feather']], result: { itemId: 'arrow', count: 4 } },
  // 24. Netherrack to Glowstone (4 netherrack)
  { pattern: [['netherrack', 'netherrack'], ['netherrack', 'netherrack']], result: { itemId: 'glowstone', count: 1 } },
  // 25. 8 Stone to Furnace
  { pattern: [['stone', 'stone', 'stone'], ['stone', null, 'stone'], ['stone', 'stone', 'stone']], result: { itemId: 'furnace', count: 1 } },
];

export interface SmeltingRecipe {
  input: string;
  result: { itemId: string; count: number };
  cookTimeSec?: number;
}

export const smeltingRecipes: SmeltingRecipe[] = [
  { input: 'raw_iron', result: { itemId: 'iron_ingot', count: 1 } },
  { input: 'raw_beef', result: { itemId: 'cooked_beef', count: 1 } },
  { input: 'beef', result: { itemId: 'cooked_beef', count: 1 } },
  { input: 'raw_porkchop', result: { itemId: 'cooked_porkchop', count: 1 } },
  { input: 'raw_chicken', result: { itemId: 'cooked_chicken', count: 1 } },
  { input: 'mutton', result: { itemId: 'cooked_mutton', count: 1 } },
];

export function getSmeltResult(inputItemId: string): string | null {
  const recipe = smeltingRecipes.find((r) => r.input === inputItemId);
  return recipe ? recipe.result.itemId : null;
}
