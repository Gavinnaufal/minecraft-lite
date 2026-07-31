import * as THREE from 'three';
import type { World } from '../world/World';

export class TorchLightManager {
  private scene: THREE.Scene;
  private lights: THREE.PointLight[] = [];
  private poolSize = 16;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    for (let i = 0; i < this.poolSize; i++) {
      const light = new THREE.PointLight(0xffaa00, 0, 16);
      this.scene.add(light);
      this.lights.push(light);
    }
  }

  update(world: World, playerPos: THREE.Vector3): void {
    const px = Math.floor(playerPos.x);
    const py = Math.floor(playerPos.y);
    const pz = Math.floor(playerPos.z);
    const radius = 18;

    const torches: { x: number; y: number; z: number }[] = [];

    const minY = Math.max(0, py - 10);
    const maxY = Math.min(255, py + 10);

    for (let y = minY; y <= maxY; y++) {
      for (let x = px - radius; x <= px + radius; x++) {
        for (let z = pz - radius; z <= pz + radius; z++) {
          if (world.getBlock(x, y, z) === 11) { // Placed Torch
            torches.push({ x, y, z });
            if (torches.length >= this.poolSize) break;
          }
        }
        if (torches.length >= this.poolSize) break;
      }
      if (torches.length >= this.poolSize) break;
    }

    const now = Date.now();
    for (let i = 0; i < this.poolSize; i++) {
      const light = this.lights[i];
      if (i < torches.length) {
        const t = torches[i];
        const flicker = Math.sin(now * 0.014 + i * 1.5) * 0.35 + Math.cos(now * 0.028 + i) * 0.2;
        light.position.set(t.x + 0.5, t.y + 0.55, t.z + 0.5);
        light.intensity = 3.6 + flicker;
      } else {
        light.intensity = 0;
      }
    }
  }
}
