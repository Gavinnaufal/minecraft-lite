import type { World } from '../World';
import { ChestManager } from '../../inventory/ChestManager';

export class NetherFortressGenerator {
  private static instance: NetherFortressGenerator;
  private generatedFortresses = new Set<string>();

  static getInstance(): NetherFortressGenerator {
    if (!NetherFortressGenerator.instance) {
      NetherFortressGenerator.instance = new NetherFortressGenerator();
    }
    return NetherFortressGenerator.instance;
  }

  shouldGenerateInChunk(chunkX: number, chunkZ: number): boolean {
    // Generate fortress on a 16x16 chunk grid in the Nether dimension
    return Math.abs(chunkX) % 16 === 0 && Math.abs(chunkZ) % 16 === 0;
  }

  generateFortressAtChunk(world: World, chunkX: number, chunkZ: number): void {
    const key = `${chunkX},${chunkZ}`;
    if (this.generatedFortresses.has(key)) return;
    this.generatedFortresses.add(key);

    const startX = chunkX * 16 + 2;
    const startZ = chunkZ * 16 + 2;
    const startY = 32; // Standard Nether bridge height

    const NETHER_BRICK_ID = 24;
    const CHEST_ID = 12;

    // 1. Generate Main Bridge Corridor (24x5x5)
    for (let x = startX; x < startX + 24; x++) {
      for (let z = startZ; z < startZ + 5; z++) {
        // Floor
        world.setBlock(x, startY, z, NETHER_BRICK_ID);

        // Side Walls
        if (z === startZ || z === startZ + 4) {
          world.setBlock(x, startY + 1, z, NETHER_BRICK_ID);
        }
      }
    }

    // 2. Generate Support Pillars down to floor
    const pillarPositions = [
      { x: startX + 2, z: startZ + 2 },
      { x: startX + 11, z: startZ + 2 },
      { x: startX + 20, z: startZ + 2 },
    ];
    for (const p of pillarPositions) {
      for (let y = startY - 1; y >= startY - 12; y--) {
        world.setBlock(p.x, y, p.z, NETHER_BRICK_ID);
        world.setBlock(p.x + 1, y, p.z, NETHER_BRICK_ID);
      }
    }

    // 3. Generate Central Loot Room (7x6x7)
    const roomX = startX + 8;
    const roomZ = startZ + 5;
    for (let rx = roomX; rx < roomX + 7; rx++) {
      for (let rz = roomZ; rz < roomZ + 7; rz++) {
        for (let ry = startY; ry < startY + 6; ry++) {
          const isWall = rx === roomX || rx === roomX + 6 || rz === roomZ || rz === roomZ + 6 || ry === startY || ry === startY + 5;
          if (isWall) {
            world.setBlock(rx, ry, rz, NETHER_BRICK_ID);
          } else {
            world.setBlock(rx, ry, rz, 0); // Air inside
          }
        }
      }
    }

    // Doorway into Loot Room
    world.setBlock(startX + 11, startY + 1, startZ + 5, 0);
    world.setBlock(startX + 11, startY + 2, startZ + 5, 0);

    // 4. Spawn Loot Chest inside Room (CP-277)
    const chestX = roomX + 3;
    const chestY = startY + 1;
    const chestZ = roomZ + 3;
    world.setBlock(chestX, chestY, chestZ, CHEST_ID);

    // Register Fortress Loot Table
    const lootSlots = [
      { itemId: 'blaze_rod', count: Math.floor(Math.random() * 3) + 1 },
      { itemId: 'iron_ingot', count: Math.floor(Math.random() * 4) + 1 },
      { itemId: 'emerald', count: Math.floor(Math.random() * 2) + 1 },
      { itemId: 'coal', count: Math.floor(Math.random() * 5) + 2 },
    ];
    const chestManager = ChestManager.getInstance();
    const chestSlots = chestManager.getChestSlots(chestX, chestY, chestZ);
    for (let i = 0; i < lootSlots.length; i++) {
      chestSlots[i] = lootSlots[i];
    }
  }
}
