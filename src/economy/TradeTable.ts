export interface TradeItem {
  itemId: string;
  count: number;
}

export interface TradeRecipe {
  id: string;
  name: string;
  inputs: TradeItem[];
  outputs: TradeItem[];
}

export const GENERIC_TRADE_RECIPES: TradeRecipe[] = [
  {
    id: 'wheat_to_emerald',
    name: '5x Wheat \u2192 1x Emerald',
    inputs: [{ itemId: 'wheat', count: 5 }],
    outputs: [{ itemId: 'emerald', count: 1 }],
  },
  {
    id: 'emerald_to_bread',
    name: '1x Emerald \u2192 3x Bread',
    inputs: [{ itemId: 'emerald', count: 1 }],
    outputs: [{ itemId: 'bread', count: 3 }],
  },
  {
    id: 'emerald_to_iron_sword',
    name: '3x Emerald \u2192 1x Iron Sword',
    inputs: [{ itemId: 'emerald', count: 3 }],
    outputs: [{ itemId: 'iron_sword', count: 1 }],
  },
  {
    id: 'emerald_to_bow_and_arrows',
    name: '5x Emerald \u2192 1x Bow + 5x Arrow',
    inputs: [{ itemId: 'emerald', count: 5 }],
    outputs: [
      { itemId: 'bow', count: 1 },
      { itemId: 'arrow', count: 5 },
    ],
  },
];

export function getGenericTradeRecipes(): readonly TradeRecipe[] {
  return GENERIC_TRADE_RECIPES;
}
