import type { Villager } from '../mobs/npc/Villager';
import type { TradeRecipe } from './TradeTable';
import type { Inventory } from '../inventory/Inventory';
import type { Hotbar } from '../inventory/Hotbar';

export class VillagerTradingManager {
  private static instance: VillagerTradingManager;
  private cooldowns = new Map<Villager, number>();

  static getInstance(): VillagerTradingManager {
    if (!VillagerTradingManager.instance) {
      VillagerTradingManager.instance = new VillagerTradingManager();
    }
    return VillagerTradingManager.instance;
  }

  getRemainingCooldown(villager: Villager): number {
    const cd = this.cooldowns.get(villager) ?? 0;
    return Math.max(0, parseFloat(cd.toFixed(1)));
  }

  isCooldownActive(villager: Villager): boolean {
    return this.getRemainingCooldown(villager) > 0;
  }

  setCooldown(villager: Villager, durationSec: number = 4): void {
    this.cooldowns.set(villager, durationSec);
  }

  update(deltaTime: number): void {
    for (const [villager, time] of this.cooldowns.entries()) {
      const nextTime = time - deltaTime;
      if (nextTime <= 0) {
        this.cooldowns.delete(villager);
      } else {
        this.cooldowns.set(villager, nextTime);
      }
    }
  }

  /**
   * Calculates total count of a specific item across both Inventory (27 slots) and Hotbar (9 slots).
   */
  getTotalItemCount(itemId: string, inventory: Inventory, hotbar: Hotbar): number {
    let total = 0;
    for (const slot of inventory.slots) {
      if (slot.itemId === itemId && slot.count > 0) {
        total += slot.count;
      }
    }
    for (const slot of hotbar.slots) {
      if (slot.itemId === itemId && slot.count > 0) {
        total += slot.count;
      }
    }
    return total;
  }

  canAffordTrade(recipe: TradeRecipe, inventory: Inventory, hotbar: Hotbar): boolean {
    for (const req of recipe.inputs) {
      const available = this.getTotalItemCount(req.itemId, inventory, hotbar);
      if (available < req.count) return false;
    }
    return true;
  }

  /**
   * CP-253 Trade Execution Logic
   * Validates if player has required input items across Inventory & Hotbar,
   * deducts inputs, and grants output items.
   */
  executeTrade(recipe: TradeRecipe, inventory: Inventory, hotbar: Hotbar): boolean {
    if (!this.canAffordTrade(recipe, inventory, hotbar)) return false;

    // Deduct inputs from Inventory & Hotbar
    for (const req of recipe.inputs) {
      let needed = req.count;

      // Deduct from Inventory first
      for (const slot of inventory.slots) {
        if (needed <= 0) break;
        if (slot.itemId === req.itemId && slot.count > 0) {
          const deduct = Math.min(needed, slot.count);
          slot.count -= deduct;
          needed -= deduct;
          if (slot.count <= 0) {
            slot.itemId = null;
            slot.count = 0;
          }
        }
      }

      // Deduct from Hotbar if needed
      for (const slot of hotbar.slots) {
        if (needed <= 0) break;
        if (slot.itemId === req.itemId && slot.count > 0) {
          const deduct = Math.min(needed, slot.count);
          slot.count -= deduct;
          needed -= deduct;
          if (slot.count <= 0) {
            slot.itemId = null;
            slot.count = 0;
          }
        }
      }
    }

    // Grant outputs to Hotbar first, then Inventory
    for (const out of recipe.outputs) {
      const leftover = hotbar.addItem(out.itemId, out.count);
      if (leftover > 0) {
        inventory.addItem(out.itemId, leftover);
      }
    }

    return true;
  }
}
