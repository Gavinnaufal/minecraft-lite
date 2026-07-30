import { BiomeType } from './BiomeGenerator';
import { HeightMap } from './HeightMap';
import { BiomeGenerator } from './BiomeGenerator';
import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../../utils/constants';

function hash(x: number, z: number): number {
  let h = (x * 374761393 + z * 668265263) ^ 1274126177;
  h = ((h ^ (h >> 13)) * 1274126177) ^ ((h << 15) | 0);
  h = Math.abs(h);
  return (h % 10000) / 10000;
}

export function generateTrees(
  chunk: Chunk,
  heightMap: HeightMap,
  biomeGen: BiomeGenerator,
): void {
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const worldX = chunk.chunkX * CHUNK_SIZE_X + lx;
      const worldZ = chunk.chunkZ * CHUNK_SIZE_Z + lz;

      if (biomeGen.getBiome(worldX, worldZ) !== BiomeType.Forest) continue;
      if (hash(worldX, worldZ) > 0.04) continue;

      const surfaceY = heightMap.getHeight(worldX, worldZ);
      if (surfaceY <= 0) continue;

      const trunkHeight = 4 + Math.floor(hash(worldX + 999, worldZ) * 2);

      // Trunk
      for (let ty = 1; ty <= trunkHeight; ty++) {
        const y = surfaceY + ty;
        if (y >= CHUNK_HEIGHT) break;
        chunk.setBlock(lx, y, lz, 5); // wood_log
      }

      // Leaves (3x3x3 cube at top of trunk)
      const leafBase = surfaceY + trunkHeight - 1;
      for (let dy = 0; dy < 3; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dz === 0 && dy < 2) continue; // skip trunk center on lower 2 layers
            const lx2 = lx + dx;
            const lz2 = lz + dz;
            const ly = leafBase + dy;

            if (lx2 < 0 || lx2 >= CHUNK_SIZE_X) continue;
            if (lz2 < 0 || lz2 >= CHUNK_SIZE_Z) continue;
            if (ly < 0 || ly >= CHUNK_HEIGHT) continue;

            chunk.setBlock(lx2, ly, lz2, 6); // leaves
          }
        }
      }
    }
  }
}
