import * as THREE from 'three';

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
}
