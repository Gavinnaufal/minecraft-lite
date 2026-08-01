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
  private readonly villageGridScale = 20; // Check 1 potential village per 20x20 chunk grid (~320x320 blocks)

  /**
   * Returns true if a village center is located near the given chunk coordinate and terrain is flat Plains.
   */
  getVillageCenter(chunkX: number, chunkZ: number, heightMap: HeightMap, biomeGen: BiomeGenerator): { cx: number; cz: number } | null {
    const gridX = Math.floor(chunkX / this.villageGridScale);
    const gridZ = Math.floor(chunkZ / this.villageGridScale);

    const hashVal = villageHash(gridX, gridZ);

    // 40% chance of a village in this grid region
    if (hashVal % 100 > 40) return null;

    const offsetX = (hashVal % 12) + 4; // Offset 4..15 chunks inside grid
    const offsetZ = ((hashVal >> 4) % 12) + 4;

    const centerChunkX = gridX * this.villageGridScale + offsetX;
    const centerChunkZ = gridZ * this.villageGridScale + offsetZ;

    const centerWX = centerChunkX * CHUNK_SIZE_X + 8;
    const centerWZ = centerChunkZ * CHUNK_SIZE_Z + 8;

    // Validate that terrain is flat Plains
    if (!this.isFlatPlainsTerrain(centerWX, centerWZ, heightMap, biomeGen)) {
      return null;
    }

    return { cx: centerWX, cz: centerWZ };
  }

  private isFlatPlainsTerrain(centerWX: number, centerWZ: number, heightMap: HeightMap, biomeGen: BiomeGenerator): boolean {
    let minH = Infinity;
    let maxH = -Infinity;

    for (let dx = -15; dx <= 15; dx += 5) {
      for (let dz = -15; dz <= 15; dz += 5) {
        const wx = centerWX + dx;
        const wz = centerWZ + dz;
        if (biomeGen.getBiome(wx, wz) !== BiomeType.Plains) return false;

        const h = heightMap.getHeight(wx, wz);
        if (h <= WATER_LEVEL + 1) return false; // Don't spawn village in water
        if (h < minH) minH = h;
        if (h > maxH) maxH = h;
      }
    }

    // Require flat terrain (height variation <= 5 blocks)
    return (maxH - minH) <= 5;
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
      const groundY = heightMap.getHeight(hWX + 2, hWZ + 2);
      if (groundY > WATER_LEVEL) {
        buildOakHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, groundY, hWZ);
      }
    }

    for (const loc of stoneHouseLocations) {
      const hWX = villageCX + loc.relX;
      const hWZ = villageCZ + loc.relZ;
      const groundY = heightMap.getHeight(hWX + 2, hWZ + 2);
      if (groundY > WATER_LEVEL) {
        buildStoneHousePrefab(chunk, chunkMinWX, chunkMinWZ, hWX, groundY, hWZ);
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
      const groundY = heightMap.getHeight(fWX + 2, fWZ + 3);
      if (groundY > WATER_LEVEL) {
        buildFarmPrefab(chunk, chunkMinWX, chunkMinWZ, fWX, groundY, fWZ);
      }
    }
  }

  private spawnedVillages = new Set<string>();

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
