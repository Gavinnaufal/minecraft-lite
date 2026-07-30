import { StorageAdapter } from './StorageAdapter';
import type { Player } from '../player/Player';
import type { Inventory } from '../inventory/Inventory';
import type { Hotbar } from '../inventory/Hotbar';
import type { DayNightCycle } from '../environment/DayNightCycle';
import type { World, BlockModification } from '../world/World';
import type { ChunkManager } from '../world/ChunkManager';
import { gameSettings } from '../core/GameSettings';

export class SaveManager {
  private storage = new StorageAdapter();
  private chunkManager: ChunkManager;
  private world: World;
  private player: Player;
  private inventory: Inventory;
  private hotbar: Hotbar;
  private dayNight: DayNightCycle;
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
  ) {
    this.chunkManager = chunkManager;
    this.world = world;
    this.player = player;
    this.inventory = inventory;
    this.hotbar = hotbar;
    this.dayNight = dayNight;
    this.getSeed = getSeed;
  }

  async init(): Promise<void> {
    await this.storage.open();
  }

  async save(): Promise<void> {
    const data = {
      worldSeed: this.getSeed(),
      player: {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        health: this.player.health,
      },
      inventory: this.inventory.slots,
      hotbar: this.hotbar.slots,
      hotbarIndex: this.hotbar.activeSlotIndex,
      timeOfDay: this.dayNight.timeOfDay,
      modifiedBlocks: this.world.getModifiedBlocks(),
    };
    await this.storage.saveData('world', data);
  }

  async load(): Promise<number | null> {
    const data = await this.storage.loadData<{
      worldSeed: number;
      player: { x: number; y: number; z: number; health: number };
      inventory: { itemId: string | null; count: number }[];
      hotbar: { itemId: string | null; count: number }[];
      hotbarIndex: number;
      timeOfDay: number;
      modifiedBlocks?: BlockModification[];
    }>('world');

    if (!data) return null;

    this.player.position.x = data.player.x;
    this.player.position.y = data.player.y;
    this.player.position.z = data.player.z;
    this.player.health = data.player.health;

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
}
