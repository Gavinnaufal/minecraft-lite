import * as THREE from 'three';
import { raycaster } from '../player/Raycaster';
import type { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';
import { getItemById } from '../inventory/ItemRegistry';
import { AudioManager } from '../audio/AudioManager';

// Pre-create 10 Minecraft 16x16 pixelated crack stage textures
const crackTextures: THREE.CanvasTexture[] = [];

function initCrackTextures(): void {
  if (crackTextures.length > 0) return;

  const crackPixels: [number, number, number][] = [
    // [x, y, minStage]
    [7, 7, 0], [8, 7, 0], [7, 8, 0],
    [6, 6, 1], [9, 8, 1], [8, 9, 1], [6, 7, 1],
    [5, 5, 2], [10, 9, 2], [9, 10, 2], [5, 6, 2], [7, 9, 2],
    [4, 4, 3], [11, 10, 3], [10, 11, 3], [4, 5, 3], [6, 8, 3], [8, 10, 3],
    [3, 3, 4], [12, 11, 4], [11, 12, 4], [3, 4, 4], [5, 7, 4], [9, 11, 4], [7, 5, 4],
    [2, 3, 5], [13, 12, 5], [12, 13, 5], [2, 4, 5], [4, 8, 5], [10, 12, 5], [8, 4, 5],
    [1, 2, 6], [14, 13, 6], [13, 14, 6], [1, 3, 6], [3, 9, 6], [11, 13, 6], [9, 3, 6],
    [0, 1, 7], [15, 14, 7], [14, 15, 7], [0, 2, 7], [2, 10, 7], [12, 14, 7], [10, 2, 7],
    [1, 1, 8], [14, 14, 8], [15, 15, 8], [1, 0, 8], [1, 11, 8], [13, 15, 8], [11, 1, 8],
    [2, 1, 9], [13, 14, 9], [14, 14, 9], [2, 0, 9], [0, 12, 9], [14, 15, 9], [12, 0, 9],
    // Cross cracks
    [7, 3, 2], [8, 4, 3], [9, 5, 4], [10, 6, 5], [11, 7, 6], [12, 8, 7],
    [3, 7, 2], [4, 8, 3], [5, 9, 4], [6, 10, 5], [7, 11, 6], [8, 12, 7],
    [12, 3, 4], [11, 4, 5], [10, 5, 6], [9, 6, 7], [8, 7, 8],
    [3, 12, 4], [4, 11, 5], [5, 10, 6], [6, 9, 7], [7, 8, 8],
  ];

  for (let stage = 0; stage < 10; stage++) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 16, 16);
    ctx.fillStyle = '#000000';

    for (const [px, py, minStage] of crackPixels) {
      if (stage >= minStage) {
        ctx.fillRect(px, py, 1, 1);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    crackTextures.push(tex);
  }
}

export class BlockBreaker {
  private outline: THREE.LineSegments | null = null;
  private crackMesh: THREE.Mesh | null = null;
  private currentStage = -1;
  private readonly world: World;
  private readonly scene: THREE.Scene;

  private breakProgress = 0;
  private onBlockBroken: ((x: number, y: number, z: number, blockId: number) => void) | null = null;

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene;
    this.world = world;
    initCrackTextures();
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
    const hit = raycaster(this.world, camera);

    if (!isHolding || !hit || hit.blockId === 0) {
      this.breakProgress = 0;
      this.removeCrackOverlay();
      return;
    }

    const block = getBlockById(hit.blockId);
    if (!block || block.hardness <= 0) {
      this.breakProgress = 0;
      this.removeCrackOverlay();
      return;
    }

    let speedMult = 1.0;
    if (activeItem?.itemId) {
      const itemDef = getItemById(activeItem.itemId);
      if (itemDef?.speedMultiplier) {
        speedMult = itemDef.speedMultiplier;
      }
    }

    this.breakProgress += (deltaTime * speedMult) / block.hardness;
    this.updateCrackOverlay(hit);

    if (this.breakProgress >= 1) {
      this.removeCrackOverlay();
      this.world.setBlock(hit.blockX, hit.blockY, hit.blockZ, 0);
      AudioManager.getInstance().playSFX('break');
      this.onBlockBroken?.(hit.blockX, hit.blockY, hit.blockZ, hit.blockId);
      this.breakProgress = 0;
    }
  }

  private updateCrackOverlay(hit: NonNullable<ReturnType<typeof raycaster>>): void {
    if (this.breakProgress <= 0.02) {
      this.removeCrackOverlay();
      return;
    }

    const stage = Math.min(9, Math.floor(this.breakProgress * 10));

    if (stage !== this.currentStage || !this.crackMesh) {
      this.removeCrackOverlay();
      this.currentStage = stage;

      const geo = new THREE.BoxGeometry(1.004, 1.004, 1.004);
      const mat = new THREE.MeshBasicMaterial({
        map: crackTextures[stage],
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });

      this.crackMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.crackMesh);
    }

    // Shudder / Shake effect as block is crumbling (progress > 0.3)
    let shakeX = 0, shakeY = 0, shakeZ = 0;
    if (this.breakProgress > 0.3) {
      const intensity = (this.breakProgress - 0.3) * 0.035;
      shakeX = (Math.random() - 0.5) * intensity;
      shakeY = (Math.random() - 0.5) * intensity;
      shakeZ = (Math.random() - 0.5) * intensity;
    }

    this.crackMesh.position.set(
      hit.blockX + 0.5 + shakeX,
      hit.blockY + 0.5 + shakeY,
      hit.blockZ + 0.5 + shakeZ,
    );
  }

  private removeCrackOverlay(): void {
    if (this.crackMesh) {
      this.scene.remove(this.crackMesh);
      this.crackMesh.geometry.dispose();
      (this.crackMesh.material as THREE.Material).dispose();
      this.crackMesh = null;
      this.currentStage = -1;
    }
  }

  getBreakProgress(): number {
    return this.breakProgress;
  }
}
