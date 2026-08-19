import * as THREE from 'three';
import type { Chunk } from '../Chunk';
import type { HeightMap } from '../terrain/HeightMap';
import type { BiomeGenerator } from '../terrain/BiomeGenerator';
import { BiomeType } from '../terrain/BiomeGenerator';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, WATER_LEVEL } from '../../utils/constants';
import { buildOakHousePrefab } from './prefabs/HousePrefab';
import { buildStoneHousePrefab } from './prefabs/StoneHousePrefab';
import { buildFarmPrefab } from './prefabs/FarmPrefab';
import type { MobManager } from '../../mobs/MobManager';
import { IronGolem } from '../../mobs/npc/IronGolem';
import { Villager } from '../../mobs/npc/Villager';

function villageHash(chunkX: number, chunkZ: number): number {
  let h = (chunkX * 1619 + chunkZ * 31337) ^ 0x5bd1e995;
  h = ((h ^ (h >> 13)) * 1274126177) ^ ((h << 15) | 0);
  return Math.abs(h);
}

export class VillageGenerator {
  private readonly villageGridScale = 6; // Check 1 potential village per 6x6 chunk grid (~96x96 blocks)
  private spawnedVillages = new Set<string>();

  /**
   * Returns true if a village center is located near the given chunk coordinate.
   * Grid (0, 0) near player spawn is ALWAYS a guaranteed Starter Village!
   */
  getVillageCenter(chunkX: number, chunkZ: number, heightMap: HeightMap, biomeGen: BiomeGenerator): { cx: number; cz: number } | null {
    const gridX = Math.floor(chunkX / this.villageGridScale);
    const gridZ = Math.floor(chunkZ / this.villageGridScale);

    // Guaranteed Starter Village at grid (0, 0)
    if (gridX === 0 && gridZ === 0) {
      return { cx: 40, cz: 40 };
    }

    const hashVal = villageHash(gridX, gridZ);

    // 75% chance of a village in this grid region
    if (hashVal % 100 > 75) return null;

    const offsetX = (hashVal % 4) + 1; // Offset 1..4 chunks inside grid
    const offsetZ = ((hashVal >> 3) % 4) + 1;

    const centerChunkX = gridX * this.villageGridScale + offsetX;
    const centerChunkZ = gridZ * this.villageGridScale + offsetZ;

    const centerWX = centerChunkX * CHUNK_SIZE_X + 8;
    const centerWZ = centerChunkZ * CHUNK_SIZE_Z + 8;

    // Validate that terrain is suitable
    if (!this.isFlatPlainsTerrain(centerWX, centerWZ, heightMap, biomeGen)) {
      return null;
    }

    return { cx: centerWX, cz: centerWZ };
  }

  private isFlatPlainsTerrain(centerWX: number, centerWZ: number, heightMap: HeightMap, biomeGen: BiomeGenerator): boolean {
    let minH = Infinity;
    let maxH = -Infinity;

    for (let dx = -12; dx <= 12; dx += 6) {
      for (let dz = -12; dz <= 12; dz += 6) {
        const wx = centerWX + dx;
        const wz = centerWZ + dz;
        const biome = biomeGen.getBiome(wx, wz);
        if (biome !== BiomeType.Plains && biome !== BiomeType.Forest) return false;

        const h = heightMap.getHeight(wx, wz);
        if (h <= WATER_LEVEL + 1) return false; // Don't spawn village in water
        if (h < minH) minH = h;
        if (h > maxH) maxH = h;
      }
    }

    // Require reasonably gentle terrain (height variation <= 14 blocks)
    return (maxH - minH) <= 14;
  }

  /**
   * Generates village paths and structures onto a target chunk.
   */
  generateForChunk(chunk: Chunk, heightMap: HeightMap, biomeGen: BiomeGenerator): void {
    const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

    // Check surrounding chunk grids for nearby village centers
    const currentGridX = Math.floor(chunk.chunkX / this.villageGridScale);
    const currentGridZ = Math.floor(chunk.chunkZ / this.villageGridScale);

    for (let gx = currentGridX - 1; gx <= currentGridX + 1; gx++) {
      for (let gz = currentGridZ - 1; gz <= currentGridZ + 1; gz++) {
        const center = this.getVillageCenter(gx * this.villageGridScale, gz * this.villageGridScale, heightMap, biomeGen);
        if (!center) continue;

        const distToCenter = Math.hypot(
          (chunkMinWX + 8) - center.cx,
          (chunkMinWZ + 8) - center.cz
        );

        // Village radius is ~40 blocks
        if (distToCenter > 60) continue;

        this.buildVillageStructuresInChunk(chunk, center.cx, center.cz, heightMap);
      }
    }
  }

  private buildVillageStructuresInChunk(chunk: Chunk, villageCX: number, villageCZ: number, heightMap: HeightMap): void {
    const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

    for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
        const wx = chunkMinWX + lx;
        const wz = chunkMinWZ + lz;

        const relX = wx - villageCX;
        const relZ = wz - villageCZ;

        // Path detection (main cross roads + branch paths connecting to house doors)
        const isMainRoad = (Math.abs(relX) <= 1 && Math.abs(relZ) <= 14) || (Math.abs(relZ) <= 1 && Math.abs(relX) <= 14);
        const isOakPath1 = relZ === 4 && relX >= 0 && relX <= 6;
        const isOakPath2 = relZ === 4 && relX <= 0 && relX >= -6;
        const isStonePath1 = relZ === -8 && relX >= 0 && relX <= 7;
        const isStonePath2 = relZ === -8 && relX <= 0 && relX >= -7;

        const isVillagePath = isMainRoad || isOakPath1 || isOakPath2 || isStonePath1 || isStonePath2;

        if (isVillagePath) {
          const groundY = heightMap.getHeight(wx, wz);
          if (groundY > WATER_LEVEL) {
            chunk.setBlock(lx, groundY, lz, 2); // Dirt path block
          }
        }
      }
    }

    // Build Oak & Stone Houses at designated village offsets
    const oakHouseLocations = [
      { relX: 4, relZ: 4 },
      { relX: -8, relZ: 4 },
    ];
    const stoneHouseLocations = [
      { relX: 4, relZ: -8 },
      { relX: -10, relZ: -8 },
    ];

    for (const loc of oakHouseLocations) {
      const hWX = villageCX + loc.relX;
      const hWZ = villageCZ + loc.relZ;
      let groundY = WATER_LEVEL;
      for (let dx = 0; dx < 5; dx++) {
        for (let dz = 0; dz < 5; dz++) {
          groundY = Math.max(groundY, heightMap.getHeight(hWX + dx, hWZ + dz));
        }
      }
      if (groundY > WATER_LEVEL) {
        buildOakHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, groundY, hWZ);
        this.clearHouseEntrance(chunk, hWX + 2, hWZ, groundY, 'north', 2);
      }
    }

    for (const loc of stoneHouseLocations) {
      const hWX = villageCX + loc.relX;
      const hWZ = villageCZ + loc.relZ;
      let groundY = WATER_LEVEL;
      for (let dx = 0; dx < 6; dx++) {
        for (let dz = 0; dz < 6; dz++) {
          groundY = Math.max(groundY, heightMap.getHeight(hWX + dx, hWZ + dz));
        }
      }
      if (groundY > WATER_LEVEL) {
        buildStoneHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, groundY, hWZ);
        this.clearHouseEntrance(chunk, hWX + 2, hWZ, groundY, 'north', 2);
        this.clearHouseEntrance(chunk, hWX + 3, hWZ, groundY, 'north', 2);
      }
    }

    // Build Wheat Farms at designated village offsets
    const farmLocations = [
      { relX: 8, relZ: 6 },
      { relX: -12, relZ: 6 },
    ];

    for (const loc of farmLocations) {
      const fWX = villageCX + loc.relX;
      const fWZ = villageCZ + loc.relZ;
      let groundY = WATER_LEVEL;
      for (let dx = 0; dx < 4; dx++) {
        for (let dz = 0; dz < 6; dz++) {
          groundY = Math.max(groundY, heightMap.getHeight(fWX + dx, fWZ + dz));
        }
      }
      if (groundY > WATER_LEVEL) {
        buildFarmPrefab(chunk, chunkMinWX, chunkMinWZ, fWX, groundY, fWZ);
      }
    }
  }

  /**
   * Clears air space in front of house doors and creates an approach walkway with foundation.
   * Ensures natural entry without mountain terrain or cliffs blocking the doorway.
   * GUARANTEES that the doorway (step = 0) itself is cleared to AIR as the absolute final step.
   */
  private clearHouseEntrance(
    chunk: Chunk,
    entranceWX: number,
    entranceWZ: number,
    groundY: number,
    facingDirection: 'north' | 'south' | 'east' | 'west' = 'north',
    walkwayBlockId = 2,
  ): void {
    const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

    let dirX = 0;
    let dirZ = 0;

    switch (facingDirection) {
      case 'north': dirZ = -1; break; // Facing -Z
      case 'south': dirZ = 1; break;  // Facing +Z
      case 'west': dirX = -1; break;  // Facing -X
      case 'east': dirX = 1; break;   // Facing +X
    }

    // Phase 1: Process approach walkway (step = 1 and step = 2 outward from door)
    for (let step = 1; step <= 2; step++) {
      const wx = entranceWX + dirX * step;
      const wz = entranceWZ + dirZ * step;
      const lx = wx - chunkMinWX;
      const lz = wz - chunkMinWZ;

      if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z) continue;

      // 1. Foundation under walkway: fill downward until hitting solid ground (prevents floating walkways on slopes)
      for (let fillY = groundY - 1; fillY >= 1; fillY--) {
        const below = chunk.getBlock(lx, fillY, lz);
        if (below === 0 || below === 7 || below === 6) {
          chunk.setBlock(lx, fillY, lz, 3); // Stone foundation
        } else {
          break; // Solid ground reached
        }
      }

      // 2. Approach Walkway: place path block at y = groundY
      chunk.setBlock(lx, groundY, lz, walkwayBlockId);

      // 3. Air clearance above walkway: clear 3 blocks high (y = groundY + 1 to groundY + 3)
      for (let dy = 1; dy <= 3; dy++) {
        const y = groundY + dy;
        chunk.setBlock(lx, y, lz, 0); // Air
      }
      chunk.isDirty = true;
    }

    // Phase 2: Process doorway threshold (step = 0, at entranceWX, entranceWZ)
    const doorLX = entranceWX - chunkMinWX;
    const doorLZ = entranceWZ - chunkMinWZ;
    if (doorLX >= 0 && doorLX < CHUNK_SIZE_X && doorLZ >= 0 && doorLZ < CHUNK_SIZE_Z) {
      // 1. Ensure floor sill at y = groundY is solid stone
      chunk.setBlock(doorLX, groundY, doorLZ, 3);

      // 2. Downward foundation under door floor if built over air
      for (let fillY = groundY - 1; fillY >= 1; fillY--) {
        const below = chunk.getBlock(doorLX, fillY, doorLZ);
        if (below === 0 || below === 7 || below === 6) {
          chunk.setBlock(doorLX, fillY, doorLZ, 3); // Stone foundation under door floor
        } else {
          break;
        }
      }

      // 3. FINAL GUARANTEE: The doorway itself MUST be 100% AIR from groundY + 1 to groundY + 3
      for (let dy = 1; dy <= 3; dy++) {
        const y = groundY + dy;
        chunk.setBlock(doorLX, y, doorLZ, 0); // Guaranteed AIR (executed last, nothing can overwrite this)
      }
      chunk.isDirty = true;
    }
  }

  /**
   * Spawns 1 Iron Golem and 2 Villager NPCs at the center of the village when the center chunk generates.
   */
  spawnVillageNPCsForChunk(chunk: Chunk, mobManager: MobManager, heightMap: HeightMap, biomeGen: BiomeGenerator): void {
    const center = this.getVillageCenter(chunk.chunkX, chunk.chunkZ, heightMap, biomeGen);
    if (!center) return;

    const key = `${center.cx},${center.cz}`;
    if (this.spawnedVillages.has(key)) return;
    this.spawnedVillages.add(key);

    const groundY = heightMap.getHeight(center.cx, center.cz);
    const centerPos = new THREE.Vector3(center.cx, groundY + 1, center.cz);

    // Spawn 1 Iron Golem tethered to village
    const golem = new IronGolem(centerPos);
    golem.setVillageCenter(centerPos);
    mobManager.spawn(centerPos, golem);

    // Spawn 2 Villagers tethered to village
    const v1Pos = new THREE.Vector3(center.cx + 2, groundY + 1, center.cz + 2);
    const v1 = new Villager(v1Pos);
    v1.setVillageCenter(centerPos);
    mobManager.spawn(v1Pos, v1);

    const v2Pos = new THREE.Vector3(center.cx - 2, groundY + 1, center.cz - 2);
    const v2 = new Villager(v2Pos);
    v2.setVillageCenter(centerPos);
    mobManager.spawn(v2Pos, v2);
  }
}
