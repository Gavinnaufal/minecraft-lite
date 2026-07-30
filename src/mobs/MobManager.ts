import * as THREE from 'three';
import { Mob } from './Mob';
import type { Player } from '../player/Player';
import type { World } from '../world/World';

export class MobManager {
  mobs: Mob[] = [];
  private pool: Mob[] = [];
  private scene: THREE.Scene;
  private world?: World;
  mobCap = 10;

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

  despawn(mob: Mob): void {
    const idx = this.mobs.indexOf(mob);
    if (idx >= 0) {
      this.mobs.splice(idx, 1);
      this.scene.remove(mob.mesh);
      this.pool.push(mob);
    }
  }

  damageMob(index: number, damage: number): void {
    const mob = this.mobs[index];
    if (mob) {
      const dead = mob.takeDamage(damage);
      if (dead) {
        this.despawn(mob);
      }
    }
  }

  update(deltaTime: number, playerPos?: THREE.Vector3, player?: Player): void {
    for (const mob of this.mobs) {
      mob.update(deltaTime, this.world, playerPos, player);
    }
  }
}
