import * as THREE from 'three';
import { Mob } from './Mob';
import type { Player } from '../player/Player';

export class MobManager {
  mobs: Mob[] = [];
  private scene: THREE.Scene;
  mobCap = 10;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawn(_position: THREE.Vector3, mob: Mob): void {
    if (this.mobs.length >= this.mobCap) return;
    this.mobs.push(mob);
    this.scene.add(mob.mesh);
  }

  despawn(mob: Mob): void {
    const idx = this.mobs.indexOf(mob);
    if (idx >= 0) this.mobs.splice(idx, 1);
    this.scene.remove(mob.mesh);
    mob.mesh.geometry.dispose();
    (mob.mesh.material as THREE.Material).dispose();
  }

  update(deltaTime: number, playerPos?: THREE.Vector3, player?: Player): void {
    for (const mob of this.mobs) {
      mob.update(deltaTime, playerPos, player);
    }
  }
}
