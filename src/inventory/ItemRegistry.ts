export interface ItemType {
  id: string;
  name: string;
  maxStack: number;
  isBlock: boolean;
  blockId?: number;
  toolType?: 'pickaxe' | 'axe' | 'shovel' | 'sword';
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
  { id: 'water', name: 'Water', maxStack: 64, isBlock: false },
  { id: 'plank', name: 'Plank', maxStack: 64, isBlock: true, blockId: 8 },
  { id: 'crafting_table', name: 'Crafting Table', maxStack: 64, isBlock: true, blockId: 9 },
  { id: 'stick', name: 'Stick', maxStack: 64, isBlock: false },
  { id: 'wooden_pickaxe', name: 'Wooden Pickaxe', maxStack: 1, isBlock: false, toolType: 'pickaxe', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'wooden_sword', name: 'Wooden Sword', maxStack: 1, isBlock: false, toolType: 'sword', maxDurability: 60, speedMultiplier: 1.5 },
  { id: 'wooden_shovel', name: 'Wooden Shovel', maxStack: 1, isBlock: false, toolType: 'shovel', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'wooden_axe', name: 'Wooden Axe', maxStack: 1, isBlock: false, toolType: 'axe', maxDurability: 60, speedMultiplier: 2.5 },
  { id: 'stone_pickaxe', name: 'Stone Pickaxe', maxStack: 1, isBlock: false, toolType: 'pickaxe', maxDurability: 130, speedMultiplier: 4.5 },
  { id: 'stone_sword', name: 'Stone Sword', maxStack: 1, isBlock: false, toolType: 'sword', maxDurability: 130, speedMultiplier: 2.5 },
  { id: 'sandstone', name: 'Sandstone', maxStack: 64, isBlock: true, blockId: 10 },
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
