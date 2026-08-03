import * as THREE from 'three';
import { Mob } from './Mob';
import type { Player } from '../player/Player';
import type { World } from '../world/World';
import type { EquipmentSlots } from '../inventory/EquipmentSlots';

export class MobManager {
  mobs: Mob[] = [];
  private pool: Mob[] = [];
  private scene: THREE.Scene;
  private world?: World;
  mobCap = 18;

  constructor(scene: THREE.Scene, world?: World) {
    this.scene = scene;
    this.world = world;
  }

  setWorld(world: World): void {
    this.world = world;
  }

  spawn(position: THREE.Vector3, mob: Mob): Mob {
    if (this.mobs.length >= this.mobCap) return mob;

    const mobClass = mob.constructor as new (pos: THREE.Vector3) => Mob;
    const poolIdx = this.pool.findIndex((m) => m instanceof mobClass);

    let activeMob: Mob;
    if (poolIdx >= 0) {
      activeMob = this.pool.splice(poolIdx, 1)[0];
      activeMob.reset(position);
    } else {
      activeMob = mob;
      activeMob.reset(position);
    }

    this.mobs.push(activeMob);
    this.scene.add(activeMob.mesh);
    return activeMob;
  }

  addMob(mob: Mob): void {
    this.mobs.push(mob);
    this.scene.add(mob.mesh);
  }

  clearAllMobs(): void {
    for (const mob of this.mobs) {
      this.scene.remove(mob.mesh);
    }
    this.mobs = [];
  }

  despawn(mob: Mob): void {
    const idx = this.mobs.indexOf(mob);
    if (idx >= 0) {
      this.mobs.splice(idx, 1);
      this.scene.remove(mob.mesh);
      this.pool.push(mob);
    }
  }

  damageMob(index: number, damage: number, attackerPos?: THREE.Vector3): Mob | null {
    const mob = this.mobs[index];
    if (mob) {
      if (attackerPos) {
        const knockDir = new THREE.Vector3().subVectors(mob.position, attackerPos);
        knockDir.y = 0;
        if (knockDir.lengthSq() > 0.001) {
          knockDir.normalize();
          mob.velocity.x += knockDir.x * 6;
          mob.velocity.y += 3.5;
          mob.velocity.z += knockDir.z * 6;
        }
      }
      const dead = mob.takeDamage(damage);
      if (dead) {
        this.despawn(mob);
        return mob;
      }
    }
    return null;
  }

  update(deltaTime: number, playerPos?: THREE.Vector3, player?: Player, camera?: THREE.PerspectiveCamera, isNight: boolean = true, equipmentSlots?: EquipmentSlots): void {
    const CULL_DIST_SQ = 80 * 80;

    for (const mob of this.mobs) {
      if (playerPos) {
        const dx = mob.position.x - playerPos.x;
        const dz = mob.position.z - playerPos.z;
        const distSq = dx * dx + dz * dz;

        if (distSq > CULL_DIST_SQ) {
          mob.mesh.visible = false;
          continue; // Skip AI update for far mobs
        }
        mob.mesh.visible = true;
      }
      mob.update(deltaTime, this.world, playerPos, player, this, camera, isNight, equipmentSlots);
    }

    // Despawn mobs that are extremely far away (>120 blocks) to free memory
    if (playerPos) {
      const DESPAWN_DIST_SQ = 120 * 120;
      for (let i = this.mobs.length - 1; i >= 0; i--) {
        const mob = this.mobs[i];
        const dx = mob.position.x - playerPos.x;
        const dz = mob.position.z - playerPos.z;
        if (dx * dx + dz * dz > DESPAWN_DIST_SQ) {
          this.despawn(mob);
        }
      }
    }
  }
}
