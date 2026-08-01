import * as THREE from 'three';
import { Arrow } from './Arrow';
import type { World } from '../world/World';
import type { Player } from '../player/Player';
import type { MobManager } from '../mobs/MobManager';
import { AudioManager } from '../audio/AudioManager';

export class ProjectileManager {
  private static instance: ProjectileManager | null = null;
  arrows: Arrow[] = [];
  private scene?: THREE.Scene;

  static getInstance(): ProjectileManager {
    if (!ProjectileManager.instance) {
      ProjectileManager.instance = new ProjectileManager();
    }
    return ProjectileManager.instance;
  }

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  spawnArrow(position: THREE.Vector3, direction: THREE.Vector3, speed = 22.0, shooterId?: string): Arrow {
    const arrow = new Arrow(position, direction, speed, shooterId);
    this.arrows.push(arrow);
    if (this.scene) {
      this.scene.add(arrow.mesh);
    }
    return arrow;
  }

  update(deltaTime: number, world?: World, player?: Player, mobManager?: MobManager): void {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];

      // 1. Hit detection against Player
      if (!arrow.isStuck && player && player.health > 0) {
        const px = player.position.x;
        const py = player.position.y;
        const pz = player.position.z;
        const ax = arrow.position.x;
        const ay = arrow.position.y;
        const az = arrow.position.z;

        if (
          ax >= px - 0.45 && ax <= px + 0.45 &&
          ay >= py && ay <= py + 1.8 &&
          az >= pz - 0.45 && az <= pz + 0.45
        ) {
          player.health = Math.max(0, player.health - 3);
          AudioManager.getInstance().playSFX('hit');
          if (this.scene) this.scene.remove(arrow.mesh);
          this.arrows.splice(i, 1);
          continue;
        }
      }

      // 2. Hit detection against Mobs
      if (!arrow.isStuck && mobManager) {
        let hitMob = false;
        for (const mob of mobManager.mobs) {
          if (mob.health <= 0) continue;
          const mx = mob.position.x;
          const my = mob.position.y;
          const mz = mob.position.z;
          const hw = mob.width / 2;
          const ax = arrow.position.x;
          const ay = arrow.position.y;
          const az = arrow.position.z;

          if (
            ax >= mx - hw && ax <= mx + hw &&
            ay >= my && ay <= my + mob.height &&
            az >= mz - hw && az <= mz + hw
          ) {
            mob.takeDamage(4);
            mob.applyKnockback(arrow.velocity.clone().normalize(), 5.0);
            AudioManager.getInstance().playSFX('hit');
            if (this.scene) this.scene.remove(arrow.mesh);
            this.arrows.splice(i, 1);
            hitMob = true;
            break;
          }
        }
        if (hitMob) continue;
      }

      const shouldDespawn = arrow.update(deltaTime, world);
      if (shouldDespawn) {
        if (this.scene) {
          this.scene.remove(arrow.mesh);
        }
        this.arrows.splice(i, 1);
      }
    }
  }

  clear(): void {
    if (this.scene) {
      for (const arrow of this.arrows) {
        this.scene.remove(arrow.mesh);
      }
    }
    this.arrows = [];
  }
}
