import * as THREE from 'three';
import { Arrow } from './Arrow';
import type { World } from '../world/World';

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

  update(deltaTime: number, world?: World): void {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
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
