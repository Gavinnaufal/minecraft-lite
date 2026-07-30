export interface ItemType {
  id: string;
  name: string;
  maxStack: number;
  isBlock: boolean;
  blockId?: number;
}

const items: ItemType[] = [
  { id: 'grass', name: 'Grass', maxStack: 64, isBlock: true, blockId: 1 },
  { id: 'dirt', name: 'Dirt', maxStack: 64, isBlock: true, blockId: 2 },
  { id: 'stone', name: 'Stone', maxStack: 64, isBlock: true, blockId: 3 },
  { id: 'sand', name: 'Sand', maxStack: 64, isBlock: true, blockId: 4 },
  { id: 'wood_log', name: 'Wood Log', maxStack: 64, isBlock: true, blockId: 5 },
  { id: 'leaves', name: 'Leaves', maxStack: 64, isBlock: true, blockId: 6 },
  { id: 'water', name: 'Water', maxStack: 64, isBlock: false },
  { id: 'plank', name: 'Plank', maxStack: 64, isBlock: true, blockId: -1 },
  { id: 'stick', name: 'Stick', maxStack: 64, isBlock: false },
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
