export interface ItemType {
  id: string;
  name: string;
  maxStack: number;
  isBlock: boolean;
  blockId?: number;
  toolType?: 'pickaxe' | 'axe' | 'shovel' | 'sword' | 'hoe';
  maxDurability?: number;
  speedMultiplier?: number;
}

const items: ItemType[] = [
  { id: 'grass', name: 'Grass', maxStack: 64, isBlock: true, blockId: 1 },
  { id: 'dirt', name: 'Dirt', maxStack: 64, isBlock: true, blockId: 2 },
  { id: 'stone', name: 'Stone', maxStack: 64, isBlock: true, blockId: 3 },
  { id: 'sand', name: 'Sand', maxStack: 64, isBlock: true, blockId: 4 },
  { id: 'wood_log', name: 'Wood Log', maxStack: 64, isBlock: true, blockId: 5 },
  { id: 'leaves', name: 'Leaves', maxStack: 64, isBlock: true, blockId: 6 },
  { id: 'water', name: 'Water', maxStack: 64, isBlock: true, blockId: 7 },
  { id: 'plank', name: 'Plank', maxStack: 64, isBlock: true, blockId: 8 },
  { id: 'crafting_table', name: 'Crafting Table', maxStack: 64, isBlock: true, blockId: 9 },
  { id: 'stick', name: 'Stick', maxStack: 64, isBlock: false },
  { id: 'wooden_pickaxe', name: 'Wooden Pickaxe', maxStack: 1, isBlock: false, toolType: 'pickaxe', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'wooden_sword', name: 'Wooden Sword', maxStack: 1, isBlock: false, toolType: 'sword', maxDurability: 60, speedMultiplier: 1.5 },
  { id: 'wooden_shovel', name: 'Wooden Shovel', maxStack: 1, isBlock: false, toolType: 'shovel', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'wooden_axe', name: 'Wooden Axe', maxStack: 1, isBlock: false, toolType: 'axe', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'wooden_hoe', name: 'Wooden Hoe', maxStack: 1, isBlock: false, toolType: 'hoe', maxDurability: 60, speedMultiplier: 1.5 },
  { id: 'stone_pickaxe', name: 'Stone Pickaxe', maxStack: 1, isBlock: false, toolType: 'pickaxe', maxDurability: 130, speedMultiplier: 4.5 },
  { id: 'stone_sword', name: 'Stone Sword', maxStack: 1, isBlock: false, toolType: 'sword', maxDurability: 130, speedMultiplier: 2.5 },
  { id: 'stone_axe', name: 'Stone Axe', maxStack: 1, isBlock: false, toolType: 'axe', maxDurability: 130, speedMultiplier: 4.5 },
  { id: 'stone_shovel', name: 'Stone Shovel', maxStack: 1, isBlock: false, toolType: 'shovel', maxDurability: 130, speedMultiplier: 4.5 },
  { id: 'stone_hoe', name: 'Stone Hoe', maxStack: 1, isBlock: false, toolType: 'hoe', maxDurability: 130, speedMultiplier: 2.5 },
  { id: 'sandstone', name: 'Sandstone', maxStack: 64, isBlock: true, blockId: 10 },
  { id: 'beef', name: 'Raw Beef', maxStack: 64, isBlock: false },
  { id: 'rotten_flesh', name: 'Rotten Flesh', maxStack: 64, isBlock: false },
  { id: 'torch', name: 'Torch', maxStack: 64, isBlock: true, blockId: 11 },
  { id: 'chest', name: 'Chest', maxStack: 64, isBlock: true, blockId: 12 },
  { id: 'wheat_seeds', name: 'Wheat Seeds', maxStack: 64, isBlock: false },
  { id: 'wheat', name: 'Wheat', maxStack: 64, isBlock: false },
  { id: 'bread', name: 'Bread', maxStack: 64, isBlock: false },
  { id: 'iron_ingot', name: 'Iron Ingot', maxStack: 64, isBlock: false },
  { id: 'bone', name: 'Bone', maxStack: 64, isBlock: false },
  { id: 'arrow', name: 'Arrow', maxStack: 64, isBlock: false },
  { id: 'string', name: 'String', maxStack: 64, isBlock: false },
  { id: 'ender_pearl', name: 'Ender Pearl', maxStack: 16, isBlock: false },
  { id: 'raw_porkchop', name: 'Raw Porkchop', maxStack: 64, isBlock: false },
  { id: 'raw_chicken', name: 'Raw Chicken', maxStack: 64, isBlock: false },
  { id: 'feather', name: 'Feather', maxStack: 64, isBlock: false },
  { id: 'mutton', name: 'Raw Mutton', maxStack: 64, isBlock: false },
];

const byId = new Map<string, ItemType>();

for (const item of items) {
  byId.set(item.id, item);
}

export function getItemById(id: string): ItemType | undefined {
  return byId.get(id);
}

export function getAllItems(): readonly ItemType[] {
  return items;
}

export function blockIdToItemId(blockId: number): string | null {
  for (const item of items) {
    if (item.isBlock && item.blockId === blockId) return item.id;
  }
  return null;
}

export function itemIdToBlockId(itemId: string): number | null {
  const item = getItemById(itemId);
  if (item && item.isBlock && item.blockId !== undefined && item.blockId > 0) {
    return item.blockId;
  }
  return null;
}
