import type { Mob } from '../Mob';
import { Cow } from '../passive/Cow';
import { Pig } from '../passive/Pig';
import { Chicken } from '../passive/Chicken';
import { Goat } from '../passive/Goat';
import { Turtle } from '../passive/Turtle';

/**
 * MobFoodRegistry (CP-257)
 * Centralized declarative mapping and pure functions to validate food items accepted by passive mobs for breeding.
 */
const PASSIVE_MOB_FOOD_MAP = new Map<string, readonly string[]>([
  ['Cow', ['wheat']],
  ['Goat', ['wheat']],
  ['Chicken', ['wheat_seeds']],
  ['Pig', ['wheat', 'bread']],
  ['Turtle', ['wheat_seeds']],
]);

/**
 * Returns the list of accepted food item IDs for a given mob.
 * Returns an empty array if the mob type does not support breeding.
 */
export function getAcceptedFoodsForMob(mob: Mob | null | undefined): readonly string[] {
  if (!mob) return [];

  if (mob instanceof Cow) return PASSIVE_MOB_FOOD_MAP.get('Cow') ?? [];
  if (mob instanceof Goat) return PASSIVE_MOB_FOOD_MAP.get('Goat') ?? [];
  if (mob instanceof Chicken) return PASSIVE_MOB_FOOD_MAP.get('Chicken') ?? [];
  if (mob instanceof Pig) return PASSIVE_MOB_FOOD_MAP.get('Pig') ?? [];
  if (mob instanceof Turtle) return PASSIVE_MOB_FOOD_MAP.get('Turtle') ?? [];

  return [];
}

/**
 * Pure function to check if a specific item ID is an accepted food for a given mob.
 */
export function isFoodForMob(mob: Mob | null | undefined, itemId: string | null | undefined): boolean {
  if (!mob || !itemId) return false;
  const accepted = getAcceptedFoodsForMob(mob);
  return accepted.includes(itemId);
}
