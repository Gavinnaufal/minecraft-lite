import * as THREE from 'three';
import { Arrow } from './Arrow';
import { Fireball } from './Fireball';
import type { World } from '../world/World';
import type { Player } from '../player/Player';
import type { MobManager } from '../mobs/MobManager';
import type { EquipmentSlots } from '../inventory/EquipmentSlots';
import { AudioManager } from '../audio/AudioManager';
import { statsTracker } from '../survival/StatsTracker';

export class ProjectileManager {
  private static instance: ProjectileManager | null = null;
  arrows: Arrow[] = [];
  fireballs: Fireball[] = [];
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

  /**
   * Helper method to safely dispose WebGL geometries and materials
   * for Three.js Mesh or Group objects to prevent VRAM memory leaks.
   */
  private disposeObject3D(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  spawnArrow(position: THREE.Vector3, direction: THREE.Vector3, speed = 22.0, shooterId?: string): Arrow {
    const arrow = new Arrow(position, direction, speed, shooterId);
    this.arrows.push(arrow);
    if (this.scene) {
      this.scene.add(arrow.mesh);
    }
    return arrow;
  }

  spawnFireball(position: THREE.Vector3, direction: THREE.Vector3, speed = 14.0, isExplosive = false): Fireball {
    const fireball = new Fireball(position, direction, speed, isExplosive);
    this.fireballs.push(fireball);
    if (this.scene) {
      this.scene.add(fireball.mesh);
    }
    return fireball;
  }

  update(deltaTime: number, world?: World, player?: Player, mobManager?: MobManager, equipmentSlots?: EquipmentSlots): void {
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
          player.damage(3, equipmentSlots);
          AudioManager.getInstance().playSFX('hit');
          if (this.scene) this.scene.remove(arrow.mesh);
          this.disposeObject3D(arrow.mesh);
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
            const isDead = mob.takeDamage(4);
            mob.applyKnockback(arrow.velocity.clone().normalize(), 5.0);
            AudioManager.getInstance().playSFX('hit');
            if (isDead && mob.isHostile) {
              statsTracker.recordMonsterKill(1);
            }
            if (this.scene) this.scene.remove(arrow.mesh);
            this.disposeObject3D(arrow.mesh);
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
        this.disposeObject3D(arrow.mesh);
        this.arrows.splice(i, 1);
      }
    }

    // 2. Fireballs update loop
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.update(deltaTime, world);

      // Hit player check
      if (player && player.health > 0) {
        const dist = fb.position.distanceTo(new THREE.Vector3(player.position.x, player.position.y + 0.9, player.position.z));
        if (dist < 1.0) {
          player.damage(fb.damage, equipmentSlots);
          AudioManager.getInstance().playSFX('explosion');
          fb.shouldRemove = true;
        }
      }

      if (fb.shouldRemove) {
        if (this.scene) this.scene.remove(fb.mesh);
        this.disposeObject3D(fb.mesh);
        this.fireballs.splice(i, 1);
      }
    }
  }

  clear(): void {
    if (this.scene) {
      for (const arrow of this.arrows) {
        this.scene.remove(arrow.mesh);
        this.disposeObject3D(arrow.mesh);
      }
      for (const fb of this.fireballs) {
        this.scene.remove(fb.mesh);
        this.disposeObject3D(fb.mesh);
      }
    }
    this.arrows = [];
    this.fireballs = [];
  }
}
