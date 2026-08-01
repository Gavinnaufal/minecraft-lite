import type { Chunk } from '../Chunk';
import type { HeightMap } from '../terrain/HeightMap';
import type { BiomeGenerator } from '../terrain/BiomeGenerator';
import { BiomeType } from '../terrain/BiomeGenerator';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, WATER_LEVEL } from '../../utils/constants';
import { buildOakHousePrefab } from './prefabs/HousePrefab';
import { buildStoneHousePrefab } from './prefabs/StoneHousePrefab';

function villageHash(chunkX: number, chunkZ: number): number {
  let h = (chunkX * 1619 + chunkZ * 31337) ^ 0x5bd1e995;
  h = ((h ^ (h >> 13)) * 1274126177) ^ ((h << 15) | 0);
  return Math.abs(h);
}

export class VillageGenerator {
  private readonly villageGridScale = 20; // Check 1 potential village per 20x20 chunk grid (~320x320 blocks)

  /**
   * Returns true if a village center is located near the given chunk coordinate.
   */
  getVillageCenter(chunkX: number, chunkZ: number, biomeGen: BiomeGenerator): { cx: number; cz: number } | null {
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

    // Village only spawns in Plains biome
    if (biomeGen.getBiome(centerWX, centerWZ) !== BiomeType.Plains) {
      return null;
    }

    return { cx: centerWX, cz: centerWZ };
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
        const center = this.getVillageCenter(gx * this.villageGridScale, gz * this.villageGridScale, biomeGen);
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

        // Path detection (dirt path along main village cross roads)
        const isMainRoad = (Math.abs(relX) <= 1 && Math.abs(relZ) <= 15) || (Math.abs(relZ) <= 1 && Math.abs(relX) <= 15);
        if (isMainRoad) {
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
  }
}
