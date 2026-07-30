import * as THREE from 'three';
import { raycaster } from '../player/Raycaster';
import type { World } from '../world/World';

export class BlockPlacer {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  place(camera: THREE.PerspectiveCamera, blockId: number, playerX: number, playerY: number, playerZ: number): boolean {
    if (blockId === 0) return false;

    const hit = raycaster(this.world, camera);
    if (!hit || hit.blockId === 0) return false;

    const placeX = hit.blockX + hit.normalX;
    const placeY = hit.blockY + hit.normalY;
    const placeZ = hit.blockZ + hit.normalZ;

    // Don't place where player is standing
    const px = Math.floor(playerX);
    const py = Math.floor(playerY);
    const pz = Math.floor(playerZ);
    const headY = Math.floor(playerY + 1.6);
    if (
      (placeX === px && placeY === py && placeZ === pz) ||
      (placeX === px && placeY === headY && placeZ === pz)
    ) {
      return false;
    }

    const existing = this.world.getBlock(placeX, placeY, placeZ);
    if (existing !== 0) return false;

    this.world.setBlock(placeX, placeY, placeZ, blockId);
    return true;
  }
}
