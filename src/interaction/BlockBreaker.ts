import * as THREE from 'three';
import { raycaster } from '../player/Raycaster';
import type { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';
import { getItemById } from '../inventory/ItemRegistry';
import { AudioManager } from '../audio/AudioManager';

export class BlockBreaker {
  private outline: THREE.LineSegments | null = null;
  private readonly world: World;
  private readonly scene: THREE.Scene;

  private breakProgress = 0;
  private onBlockBroken: ((x: number, y: number, z: number, blockId: number) => void) | null = null;

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene;
    this.world = world;
  }

  setOnBlockBroken(cb: (x: number, y: number, z: number, blockId: number) => void): void {
    this.onBlockBroken = cb;
  }

  getTarget(camera: THREE.PerspectiveCamera) {
    return raycaster(this.world, camera);
  }

  updateOutline(camera: THREE.PerspectiveCamera): void {
    if (this.outline) {
      this.scene.remove(this.outline);
      this.outline.geometry.dispose();
      (this.outline.material as THREE.Material).dispose();
      this.outline = null;
    }

    const hit = raycaster(this.world, camera);
    if (!hit || hit.blockId === 0) return;

    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02));
    const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
    this.outline = new THREE.LineSegments(geo, mat);
    this.outline.position.set(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5);
    this.scene.add(this.outline);
  }

  updateBreak(deltaTime: number, isHolding: boolean, camera: THREE.PerspectiveCamera, activeItem?: { itemId: string | null; count: number }): void {
    if (!isHolding) {
      this.breakProgress = 0;
      return;
    }

    const hit = raycaster(this.world, camera);
    if (!hit || hit.blockId === 0) {
      this.breakProgress = 0;
      return;
    }

    const block = getBlockById(hit.blockId);
    if (!block || block.hardness <= 0) return;

    let speedMult = 1.0;
    if (activeItem?.itemId) {
      const itemDef = getItemById(activeItem.itemId);
      if (itemDef?.speedMultiplier) {
        speedMult = itemDef.speedMultiplier;
      }
    }

    this.breakProgress += (deltaTime * speedMult) / block.hardness;

    if (this.breakProgress >= 1) {
      this.world.setBlock(hit.blockX, hit.blockY, hit.blockZ, 0);
      AudioManager.getInstance().playSFX('break');
      this.onBlockBroken?.(hit.blockX, hit.blockY, hit.blockZ, hit.blockId);
      this.breakProgress = 0;
    }
  }

  getBreakProgress(): number {
    return this.breakProgress;
  }
}
