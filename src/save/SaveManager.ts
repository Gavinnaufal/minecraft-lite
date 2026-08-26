import * as THREE from 'three';
import { StorageAdapter } from './StorageAdapter';
import type { Player } from '../player/Player';
import type { Inventory } from '../inventory/Inventory';
import type { Hotbar } from '../inventory/Hotbar';
import type { DayNightCycle } from '../environment/DayNightCycle';
import type { World, BlockModification } from '../world/World';
import type { ChunkManager } from '../world/ChunkManager';
import type { MobManager } from '../mobs/MobManager';
import type { Mob } from '../mobs/Mob';
import { Cow } from '../mobs/passive/Cow';
import { Pig } from '../mobs/passive/Pig';
import { Chicken } from '../mobs/passive/Chicken';
import { Goat } from '../mobs/passive/Goat';
import { Turtle } from '../mobs/passive/Turtle';
import { gameSettings } from '../core/GameSettings';
import { DimensionManager } from '../world/dimension/DimensionManager';
import { FurnaceManager, type FurnaceData } from '../inventory/FurnaceManager';
import { CropManager } from '../world/farming/CropManager';

const SAVE_VERSION = 3;

export class SaveManager {
  private storage = new StorageAdapter();
  private chunkManager: ChunkManager;
  private world: World;
  private player: Player;
  private inventory: Inventory;
  private hotbar: Hotbar;
  private dayNight: DayNightCycle;
  private mobManager?: MobManager;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private getSeed: () => number;

  constructor(
    chunkManager: ChunkManager,
    world: World,
    player: Player,
    inventory: Inventory,
    hotbar: Hotbar,
    dayNight: DayNightCycle,
    getSeed: () => number,
    mobManager?: MobManager,
  ) {
    this.chunkManager = chunkManager;
    this.world = world;
    this.player = player;
    this.inventory = inventory;
    this.hotbar = hotbar;
    this.dayNight = dayNight;
    this.getSeed = getSeed;
    this.mobManager = mobManager;
  }

  async init(): Promise<void> {
    await this.storage.open();
  }

  private isSaveInProgress = false;

  private yieldToNextFrame(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  async save(): Promise<void> {
    if (this.isSaveInProgress) return;
    this.isSaveInProgress = true;

    try {
      // Step 1: Snapshot player state & inventory (Frame 1)
      const saveVersion = SAVE_VERSION;
      const worldSeed = this.getSeed();
      const dimension = DimensionManager.getInstance().currentDimension;
      const playerPos = {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        health: this.player.health,
        hunger: this.player.hunger,
      };
      const inventorySlots = this.inventory.slots.map((s) => ({ ...s }));
      const hotbarSlots = this.hotbar.slots.map((s) => ({ ...s }));
      const hotbarIndex = this.hotbar.activeSlotIndex;
      const timeOfDay = this.dayNight.timeOfDay;

      // Yield execution back to main thread render loop
      await this.yieldToNextFrame();

      // Step 2: Snapshot modified blocks & furnace state (Frame 2)
      const modifiedBlocks = this.world.getModifiedBlocks();
      const furnaces = FurnaceManager.getInstance().getAllFurnaces();

      // Yield execution back to main thread render loop
      await this.yieldToNextFrame();

      // Step 3: Snapshot mob state & persist to IndexedDB (Frame 3)
      const mobsData = this.mobManager ? this.mobManager.mobs.map((m) => ({
        type: m.constructor.name,
        x: m.position.x,
        y: m.position.y,
        z: m.position.z,
        isBaby: m.isBaby,
        growthTimer: m.growthTimer,
        loveTimer: m.loveTimer,
        breedingCooldown: m.breedingCooldown,
      })) : [];

      const data = {
        saveVersion,
        worldSeed,
        dimension,
        player: playerPos,
        inventory: inventorySlots,
        hotbar: hotbarSlots,
        hotbarIndex,
        timeOfDay,
        modifiedBlocks,
        furnaces,
        crops: CropManager.getInstance().toJSON(),
        mobsData,
      };

      await this.storage.saveData('world', data);
    } finally {
      this.isSaveInProgress = false;
    }
  }

  async load(): Promise<number | null> {
    const data = await this.storage.loadData<{
      saveVersion?: number;
      worldSeed: number;
      dimension?: string;
      player: { x: number; y: number; z: number; health: number; hunger?: number };
      inventory: { itemId: string | null; count: number }[];
      hotbar: { itemId: string | null; count: number }[];
      hotbarIndex: number;
      timeOfDay: number;
      modifiedBlocks?: BlockModification[];
      furnaces?: Record<string, FurnaceData>;
      crops?: Array<{ x: number; y: number; z: number; stage: number; growthTimer: number }>;
      mobsData?: {
        type: string;
        x: number;
        y: number;
        z: number;
        isBaby: boolean;
        growthTimer: number;
        loveTimer: number;
        breedingCooldown: number;
      }[];
    }>('world');

    if (!data) return null;

    if (data.furnaces) {
      FurnaceManager.getInstance().loadFurnaces(data.furnaces);
    }

    if (data.crops) {
      CropManager.getInstance().fromJSON(data.crops);
    }

    if (data.mobsData && this.mobManager) {
      this.mobManager.clearAllMobs();
      for (const item of data.mobsData) {
        const pos = new THREE.Vector3(item.x, item.y, item.z);
        let mob: Mob | null = null;
        if (item.type === 'Cow') mob = new Cow(pos);
        else if (item.type === 'Pig') mob = new Pig(pos);
        else if (item.type === 'Chicken') mob = new Chicken(pos);
        else if (item.type === 'Goat') mob = new Goat(pos);
        else if (item.type === 'Turtle') mob = new Turtle(pos);

        if (mob) {
          mob.isBaby = item.isBaby;
          mob.growthTimer = item.growthTimer;
          mob.loveTimer = item.loveTimer;
          mob.breedingCooldown = item.breedingCooldown;
          if (mob.isBaby) {
            const progress = Math.min(1.0, 0.5 + 0.5 * (mob.growthTimer / 60));
            mob.mesh.scale.set(progress, progress, progress);
          }
          this.mobManager.addMob(mob);
        }
      }
    }

    // v1.0 -> v2.0 migration: add default dimension if missing
    if (!data.saveVersion || data.saveVersion < 2) {
      console.log('[Save] Migrating v1.0 save to v2.0 format');
      data.dimension = data.dimension || 'overworld';
    }

    // Restore dimension
    if (data.dimension) {
      const dim = data.dimension as 'overworld' | 'nether';
      DimensionManager.getInstance().currentDimension = dim as ReturnType<typeof DimensionManager.getInstance>['currentDimension'];
    }

    this.player.position.x = data.player.x;
    this.player.position.y = data.player.y;
    this.player.position.z = data.player.z;
    this.player.health = data.player.health;
    this.player.hunger = data.player.hunger ?? 20;

    for (let i = 0; i < 27; i++) {
      this.inventory.slots[i] = data.inventory[i] ?? { itemId: null, count: 0 };
    }
    for (let i = 0; i < 9; i++) {
      this.hotbar.slots[i] = data.hotbar[i] ?? { itemId: null, count: 0 };
    }
    this.hotbar.activeSlotIndex = data.hotbarIndex;

    this.dayNight.timeOfDay = data.timeOfDay;

    if (data.modifiedBlocks) {
      this.world.setModifiedBlocks(data.modifiedBlocks);
      this.chunkManager.forceReload(gameSettings.renderDistance, this.player.position.x, this.player.position.z);
    }

    return data.worldSeed;
  }

  startAutoSave(intervalMs = 120000): void {
    this.autoSaveInterval = setInterval(() => {
      this.save().catch(() => {});
    }, intervalMs);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async clearSave(): Promise<void> {
    await this.storage.clearData('world');
  }
}
