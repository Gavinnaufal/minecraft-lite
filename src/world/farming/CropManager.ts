import type { World } from '../World';

export interface CropState {
  x: number;
  y: number;
  z: number;
  stage: number; // 0 = sprout (ID 25), 1 = growing (ID 26), 2 = mature (ID 14)
  growthTimer: number;
  growthDuration: number;
}

export class CropManager {
  private static instance: CropManager | null = null;
  private crops: Map<string, CropState> = new Map();

  public static readonly STAGE_SPROUT = 25;
  public static readonly STAGE_GROWING = 26;
  public static readonly STAGE_MATURE = 14;

  public static readonly DEFAULT_STAGE_DURATION = 12.0; // 12 seconds per stage

  public onCropGrow?: (x: number, y: number, z: number, newStage: number) => void;

  private constructor() {}

  public static getInstance(): CropManager {
    if (!CropManager.instance) {
      CropManager.instance = new CropManager();
    }
    return CropManager.instance;
  }

  private getKey(x: number, y: number, z: number): string {
    return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  }

  public registerCrop(x: number, y: number, z: number, initialStage = 0): void {
    const key = this.getKey(x, y, z);
    this.crops.set(key, {
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
      stage: initialStage,
      growthTimer: 0,
      growthDuration: CropManager.DEFAULT_STAGE_DURATION,
    });
  }

  public unregisterCrop(x: number, y: number, z: number): void {
    const key = this.getKey(x, y, z);
    this.crops.delete(key);
  }

  public getCrop(x: number, y: number, z: number): CropState | undefined {
    return this.crops.get(this.getKey(x, y, z));
  }

  public accelerateGrowth(x: number, y: number, z: number, world: World): boolean {
    const key = this.getKey(x, y, z);
    const crop = this.crops.get(key);
    if (!crop) {
      const currentBlock = world.getBlock(x, y, z);
      if (currentBlock === CropManager.STAGE_SPROUT) {
        world.setBlock(x, y, z, CropManager.STAGE_GROWING);
        this.registerCrop(x, y, z, 1);
        this.onCropGrow?.(x, y, z, 1);
        return true;
      } else if (currentBlock === CropManager.STAGE_GROWING) {
        world.setBlock(x, y, z, CropManager.STAGE_MATURE);
        this.unregisterCrop(x, y, z);
        this.onCropGrow?.(x, y, z, 2);
        return true;
      }
      return false;
    }

    if (crop.stage === 0) {
      crop.stage = 1;
      crop.growthTimer = 0;
      world.setBlock(x, y, z, CropManager.STAGE_GROWING);
      this.onCropGrow?.(x, y, z, 1);
      return true;
    } else if (crop.stage === 1) {
      crop.stage = 2;
      world.setBlock(x, y, z, CropManager.STAGE_MATURE);
      this.crops.delete(key);
      this.onCropGrow?.(x, y, z, 2);
      return true;
    }

    return false;
  }

  public update(deltaTime: number, world: World): void {
    if (this.crops.size === 0) return;

    const toRemove: string[] = [];

    for (const [key, crop] of this.crops.entries()) {
      const currentBlock = world.getBlock(crop.x, crop.y, crop.z);

      // 1. Check if crop block still exists in world
      if (
        currentBlock !== CropManager.STAGE_SPROUT &&
        currentBlock !== CropManager.STAGE_GROWING &&
        currentBlock !== CropManager.STAGE_MATURE
      ) {
        toRemove.push(key);
        continue;
      }

      // 2. Check soil underneath: must be farmland (13), grass (1), or dirt (2)
      const soilBlock = world.getBlock(crop.x, crop.y - 1, crop.z);
      if (soilBlock !== 13 && soilBlock !== 1 && soilBlock !== 2) {
        world.setBlock(crop.x, crop.y, crop.z, 0);
        toRemove.push(key);
        continue;
      }

      // 3. Advance growth timer
      crop.growthTimer += deltaTime;

      if (crop.growthTimer >= crop.growthDuration) {
        crop.growthTimer = 0;

        if (crop.stage === 0) {
          crop.stage = 1;
          world.setBlock(crop.x, crop.y, crop.z, CropManager.STAGE_GROWING);
          this.onCropGrow?.(crop.x, crop.y, crop.z, 1);
        } else if (crop.stage === 1) {
          crop.stage = 2;
          world.setBlock(crop.x, crop.y, crop.z, CropManager.STAGE_MATURE);
          this.onCropGrow?.(crop.x, crop.y, crop.z, 2);
          toRemove.push(key); // Fully mature, no further ticking needed
        }
      }
    }

    for (const k of toRemove) {
      this.crops.delete(k);
    }
  }

  public clear(): void {
    this.crops.clear();
  }

  public toJSON(): Array<{ x: number; y: number; z: number; stage: number; growthTimer: number }> {
    return Array.from(this.crops.values()).map((c) => ({
      x: c.x,
      y: c.y,
      z: c.z,
      stage: c.stage,
      growthTimer: c.growthTimer,
    }));
  }

  public fromJSON(data: Array<{ x: number; y: number; z: number; stage: number; growthTimer: number }>): void {
    this.crops.clear();
    if (!Array.isArray(data)) return;
    for (const item of data) {
      const key = this.getKey(item.x, item.y, item.z);
      this.crops.set(key, {
        x: item.x,
        y: item.y,
        z: item.z,
        stage: item.stage ?? 0,
        growthTimer: item.growthTimer ?? 0,
        growthDuration: CropManager.DEFAULT_STAGE_DURATION,
      });
    }
  }
}
