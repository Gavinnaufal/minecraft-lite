import type { EquipmentSlots } from './EquipmentSlots';

export class ArmorSystem {
  private static instance: ArmorSystem;

  static getInstance(): ArmorSystem {
    if (!ArmorSystem.instance) {
      ArmorSystem.instance = new ArmorSystem();
    }
    return ArmorSystem.instance;
  }

  /**
   * CP-269 Armor System Damage Reduction
   * Calculates final damage after applying total defense points reduction.
   * Standard formula: 4% damage reduction per defense point, capped at 80% max reduction.
   * Minimum damage is 1 point if raw damage > 0.
   */
  calculateMitigatedDamage(rawDamage: number, equipment: EquipmentSlots | null | undefined): number {
    if (rawDamage <= 0) return 0;
    if (!equipment) return rawDamage;

    const totalDefense = equipment.getTotalDefense();
    if (totalDefense <= 0) return rawDamage;

    const reductionPercent = Math.min(0.80, totalDefense * 0.04);
    const mitigated = rawDamage * (1 - reductionPercent);
    return Math.max(1, Math.round(mitigated * 10) / 10);
  }
}
