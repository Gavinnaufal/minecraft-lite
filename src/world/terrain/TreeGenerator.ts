import { BiomeType } from './BiomeGenerator';
import { HeightMap } from './HeightMap';
import { BiomeGenerator } from './BiomeGenerator';
import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT, WATER_LEVEL } from '../../utils/constants';

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
  const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
  const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

  const searchMinWX = chunkMinWX - 2;
  const searchMaxWX = chunkMinWX + CHUNK_SIZE_X + 1;
  const searchMinWZ = chunkMinWZ - 2;
  const searchMaxWZ = chunkMinWZ + CHUNK_SIZE_Z + 1;

  for (let wz = searchMinWZ; wz <= searchMaxWZ; wz++) {
    for (let wx = searchMinWX; wx <= searchMaxWX; wx++) {
      if (biomeGen.getBiome(wx, wz) !== BiomeType.Forest) continue;
      if (hash(wx, wz) > 0.04) continue;

      const surfaceY = heightMap.getHeight(wx, wz);
      // Strictly require trunk base to be at least 2 blocks above water level
      if (surfaceY <= WATER_LEVEL + 1) continue;

      const trunkHeight = 4 + Math.floor(hash(wx + 999, wz) * 2);

      const isTrunkInChunk = (
        wx >= chunkMinWX && wx < chunkMinWX + CHUNK_SIZE_X &&
        wz >= chunkMinWZ && wz < chunkMinWZ + CHUNK_SIZE_Z
      );

      if (isTrunkInChunk) {
        const localX = wx - chunkMinWX;
        const localZ = wz - chunkMinWZ;

        let actualSurfaceY = -1;
        for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
          const b = chunk.getBlock(localX, y, localZ);
          if (b !== 0 && b !== 7) {
            actualSurfaceY = y;
            break;
          }
        }

        if (actualSurfaceY <= WATER_LEVEL + 1) continue;
        const groundBid = chunk.getBlock(localX, actualSurfaceY, localZ);
        if (groundBid !== 1 && groundBid !== 2) continue; // Only grow on grass or dirt

        for (let ty = 1; ty <= trunkHeight; ty++) {
          const y = actualSurfaceY + ty;
          if (y >= CHUNK_HEIGHT) break;
          chunk.setBlock(localX, y, localZ, 5); // wood_log
        }
      }

      const leafBase = surfaceY + trunkHeight - 1;
      for (let dy = 0; dy < 3; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dz === 0 && dy < 2) continue;

            const leafWX = wx + dx;
            const leafWZ = wz + dz;
            const ly = leafBase + dy;

            // Strictly check that leaf column ground is solid land (not over water/river)
            const leafGroundY = heightMap.getHeight(leafWX, leafWZ);
            if (leafGroundY <= WATER_LEVEL + 1) continue;

            if (
              leafWX >= chunkMinWX && leafWX < chunkMinWX + CHUNK_SIZE_X &&
              leafWZ >= chunkMinWZ && leafWZ < chunkMinWZ + CHUNK_SIZE_Z &&
              ly >= 0 && ly < CHUNK_HEIGHT
            ) {
              const localLX = leafWX - chunkMinWX;
              const localLZ = leafWZ - chunkMinWZ;
              const currentBid = chunk.getBlock(localLX, ly, localLZ);
              if (currentBid === 0) {
                chunk.setBlock(localLX, ly, localLZ, 6); // leaves
              }
            }
          }
        }
      }
    }
  }
}
