import type { EquipmentSlots } from '../inventory/EquipmentSlots';
import { ArmorSystem } from '../inventory/ArmorSystem';

export class Player {
  position = { x: 0, y: 60, z: 0 };
  velocity = { x: 0, y: 0, z: 0 };
  isGrounded = false;
  health = 20;
  hunger = 20;
  readonly width = 0.6;
  readonly height = 1.8;
  readonly eyeHeight = 1.6;

  damage(rawAmount: number, equipment?: EquipmentSlots): void {
    const finalDamage = ArmorSystem.getInstance().calculateMitigatedDamage(rawAmount, equipment);
    this.health = Math.max(0, this.health - finalDamage);
  }

  feed(amount: number): void {
    this.hunger = Math.min(20, Math.max(0, this.hunger + amount));
  }

  getAABB() {
    const hw = this.width / 2;
    return {
      minX: this.position.x - hw,
      maxX: this.position.x + hw,
      minY: this.position.y,
      maxY: this.position.y + this.height,
      minZ: this.position.z - hw,
      maxZ: this.position.z + hw,
    };
  }
}
