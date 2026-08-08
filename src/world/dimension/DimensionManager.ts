import * as THREE from 'three';
import type { World } from '../World';
import type { HeightMap } from '../terrain/HeightMap';
import { getBlockById } from '../BlockRegistry';
import { CHUNK_HEIGHT } from '../../utils/constants';

export enum DimensionType {
  OVERWORLD = 'overworld',
  NETHER = 'nether',
}

export class DimensionManager {
  private static instance: DimensionManager;
  currentDimension: DimensionType = DimensionType.OVERWORLD;

  private constructor() {}

  static getInstance(): DimensionManager {
    if (!DimensionManager.instance) {
      DimensionManager.instance = new DimensionManager();
    }
    return DimensionManager.instance;
  }

  isNether(): boolean {
    return this.currentDimension === DimensionType.NETHER;
  }

  setDimension(dimension: DimensionType, scene?: THREE.Scene): void {
    this.currentDimension = dimension;

    if (scene) {
      if (dimension === DimensionType.NETHER) {
        scene.background = new THREE.Color(0x330808);
        scene.fog = new THREE.FogExp2(0x4a0e0e, 0.035);
        // Nether ambient: warm lava glow
        scene.traverse((child) => {
          if (child instanceof THREE.AmbientLight) {
            child.color.set(0xff6633);
            child.intensity = 0.45;
          } else if (child instanceof THREE.DirectionalLight) {
            child.intensity = 0.15;
            child.color.set(0xff4400);
          } else if (child instanceof THREE.HemisphereLight) {
            child.intensity = 0.25;
          }
        });
      } else {
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);
        // Overworld ambient: normal lighting
        scene.traverse((child) => {
          if (child instanceof THREE.AmbientLight) {
            child.color.set(0xffffff);
            child.intensity = 0.6;
          } else if (child instanceof THREE.DirectionalLight) {
            child.intensity = 0.8;
            child.color.set(0xffffff);
          } else if (child instanceof THREE.HemisphereLight) {
            child.intensity = 0.5;
          }
        });
      }
    }
  }

  /** Converts coordinates when teleporting between dimensions (1 Nether = 8 Overworld). */
  getConvertedCoordinates(pos: { x: number; y: number; z: number }, targetDimension: DimensionType): { x: number; y: number; z: number } {
    const result = { x: pos.x, y: pos.y, z: pos.z };
    if (this.currentDimension === DimensionType.OVERWORLD && targetDimension === DimensionType.NETHER) {
      result.x = Math.floor(pos.x / 8);
      result.z = Math.floor(pos.z / 8);
    } else if (this.currentDimension === DimensionType.NETHER && targetDimension === DimensionType.OVERWORLD) {
      result.x = Math.floor(pos.x * 8);
      result.z = Math.floor(pos.z * 8);
    }
    return result;
  }

  /**
   * Calculates a safe standing Y coordinate at target (X, Z) in targetDimension.
   * Ensures player does not spawn inside solid blocks or fall endlessly into void.
   */
  findSafeTeleportY(
    world: World,
    targetX: number,
    origY: number,
    targetZ: number,
    targetDimension: DimensionType,
    heightMap?: HeightMap
  ): number {
    const tx = Math.floor(targetX);
    const tz = Math.floor(targetZ);
    const startY = Math.max(5, Math.min(115, Math.floor(origY)));

    const isSolid = (y: number): boolean => {
      if (y < 0 || y >= CHUNK_HEIGHT) return true;
      const bId = world.getBlock(tx, y, tz);
      if (bId === 0 || bId === 7 || bId === 18) return false;
      const block = getBlockById(bId);
      return block ? block.solid : false;
    };

    const isSafeStand = (y: number): boolean => {
      if (y <= 2 || y >= CHUNK_HEIGHT - 2) return false;
      const solidBelow = isSolid(y - 1);
      const freeFeet = !isSolid(y);
      const freeHead = !isSolid(y + 1);
      return solidBelow && freeFeet && freeHead;
    };

    // 1. Check if original Y is already a safe standing spot
    if (isSafeStand(startY)) {
      return startY;
    }

    // 2. If original Y is inside a solid block, search UPWARDS for first 2-block open space above solid ground
    if (isSolid(startY) || isSolid(startY + 1)) {
      for (let y = startY; y <= 115; y++) {
        if (isSafeStand(y)) {
          return y;
        }
      }
    }

    // 3. Search DOWNWARDS from Y = 100 to Y = 15 for a safe floor
    for (let y = 100; y >= 15; y--) {
      if (isSafeStand(y)) {
        return y;
      }
    }

    // 4. Fallback for Overworld surface height
    if (targetDimension === DimensionType.OVERWORLD && heightMap) {
      const h = heightMap.getHeight(tx, tz);
      return Math.max(5, h + 1);
    }

    // 5. Fallback default for Nether floor
    return 35;
  }
}

