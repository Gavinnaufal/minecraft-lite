import * as THREE from 'three';
import type { Chunk } from '../Chunk';
import type { HeightMap } from '../terrain/HeightMap';
import type { BiomeGenerator } from '../terrain/BiomeGenerator';
import { BiomeType } from '../terrain/BiomeGenerator';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT, WATER_LEVEL } from '../../utils/constants';
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
      // Reference ground height at the front doorway (dx = 2, dz = 0)
      const doorGroundY = heightMap.getHeight(hWX + 2, hWZ);
      if (doorGroundY > WATER_LEVEL) {
        // 1. Flatten build site (5x5 footprint + 2-block buffer perimeter) to doorway ground level
        this.flattenBuildSite(chunk, hWX, hWZ, 5, 5, 2, doorGroundY, heightMap);
        // 2. Build Oak House on leveled ground
        buildOakHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, doorGroundY, hWZ);
      }
    }

    for (const loc of stoneHouseLocations) {
      const hWX = villageCX + loc.relX;
      const hWZ = villageCZ + loc.relZ;
      // Reference ground height at the front double doorway (dx = 2, dz = 0)
      const doorGroundY = heightMap.getHeight(hWX + 2, hWZ);
      if (doorGroundY > WATER_LEVEL) {
        // 1. Flatten build site (6x6 footprint + 2-block buffer perimeter) to doorway ground level
        this.flattenBuildSite(chunk, hWX, hWZ, 6, 6, 2, doorGroundY, heightMap);
        // 2. Build Stone House on leveled ground
        buildStoneHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, doorGroundY, hWZ);
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
      const farmGroundY = heightMap.getHeight(fWX + 2, fWZ + 3);
      if (farmGroundY > WATER_LEVEL) {
        this.flattenBuildSite(chunk, fWX, fWZ, 4, 6, 1, farmGroundY, heightMap);
        buildFarmPrefab(chunk, chunkMinWX, chunkMinWZ, fWX, farmGroundY, fWZ);
      }
    }
  }

  /**
   * Flattens a rectangular building plot and its surrounding buffer to a uniform reference level.
   * - Eliminates hill cliffs and buried doorways before structure construction.
   * - Fills gaps downward with solid dirt/stone if terrain is lower.
   * - Carves/clears air overhead if natural terrain or vegetation is higher.
   * - Seamlessly spans cross-chunk boundaries using global world coordinates.
   */
  private flattenBuildSite(
    chunk: Chunk,
    originWX: number,
    originWZ: number,
    width: number,
    depth: number,
    buffer: number,
    referenceGroundY: number,
    heightMap: HeightMap,
  ): void {
    const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

    const minWX = originWX - buffer;
    const maxWX = originWX + width - 1 + buffer;
    const minWZ = originWZ - buffer;
    const maxWZ = originWZ + depth - 1 + buffer;

    for (let wz = minWZ; wz <= maxWZ; wz++) {
      for (let wx = minWX; wx <= maxWX; wx++) {
        const lx = wx - chunkMinWX;
        const lz = wz - chunkMinWZ;

        if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z) continue;

        const naturalH = heightMap.getHeight(wx, wz);
        const isInFootprint = wx >= originWX && wx < originWX + width && wz >= originWZ && wz < originWZ + depth;

        // 1. Fill downward foundation if natural terrain is lower
        for (let fillY = referenceGroundY - 1; fillY >= 1; fillY--) {
          const current = chunk.getBlock(lx, fillY, lz);
          if (current === 0 || current === 7 || current === 6) {
            chunk.setBlock(lx, fillY, lz, fillY === referenceGroundY - 1 ? 2 : 3); // Dirt then Stone
          } else {
            break; // Solid ground reached
          }
        }

        // 2. Surface block at referenceGroundY
        chunk.setBlock(lx, referenceGroundY, lz, isInFootprint ? 3 : 1); // Stone floor inside, grass outside

        // 3. Clear air overhead (clear hills, trees, and cliffs above referenceGroundY)
        const clearTopY = Math.min(CHUNK_HEIGHT - 1, Math.max(naturalH + 6, referenceGroundY + 8));
        for (let y = referenceGroundY + 1; y <= clearTopY; y++) {
          chunk.setBlock(lx, y, lz, 0); // Air
        }

        chunk.isDirty = true;
      }
    }
  }

  /**
   * (Legacy - Deactivated in favor of pre-construction flattenBuildSite)
   */
  // private clearHouseEntrance(...): void { ... }

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
