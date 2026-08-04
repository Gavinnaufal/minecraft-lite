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

  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunkMinWX + lx;
      const wz = chunkMinWZ + lz;

      // 1. Biome & Density Check
      if (biomeGen.getBiome(wx, wz) !== BiomeType.Forest) continue;
      if (hash(wx, wz) > 0.04) continue;

      // 2. Find actual surface Y in current chunk
      let actualSurfaceY = -1;
      for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
        const b = chunk.getBlock(lx, y, lz);
        if (b !== 0 && b !== 7) {
          actualSurfaceY = y;
          break;
        }
      }

      // 3. Strictly require trunk base to be on deep solid land (no shorelines, cliffs, or overhangs)
      if (actualSurfaceY <= WATER_LEVEL + 2) continue;

      const groundBid = chunk.getBlock(lx, actualSurfaceY, lz);
      if (groundBid !== 1 && groundBid !== 2) continue; // Must be Grass (1) or Dirt (2)

      // Ensure solid foundation 1 and 2 blocks beneath the surface (prevents floating logs on cliff overhangs/caves)
      if (actualSurfaceY < 2) continue;
      const subGround1 = chunk.getBlock(lx, actualSurfaceY - 1, lz);
      const subGround2 = chunk.getBlock(lx, actualSurfaceY - 2, lz);
      if (subGround1 === 0 || subGround1 === 7 || subGround2 === 0 || subGround2 === 7) continue;

      // 4. Valid Tree Anchor Confirmed: Place Trunk Logs
      const trunkHeight = 4 + Math.floor(hash(wx + 999, wz) * 2);
      for (let ty = 1; ty <= trunkHeight; ty++) {
        const y = actualSurfaceY + ty;
        if (y >= CHUNK_HEIGHT) break;
        chunk.setBlock(lx, y, lz, 5); // wood_log (Block ID 5)
      }

      // 5. Place Attached Leaf Canopy (Only around validated solid trunk)
      const leafBaseY = actualSurfaceY + trunkHeight - 1;
      for (let dy = 0; dy < 3; dy++) {
        for (let dz = -2; dz <= 2; dz++) {
          for (let dx = -2; dx <= 2; dx++) {
            // Corner trimming for natural crown shape
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
            if (dx === 0 && dz === 0 && dy < 2) continue; // Trunk occupies center

            const leafWX = wx + dx;
            const leafWZ = wz + dz;
            const ly = leafBaseY + dy;

            // Never place leaves if the column ground is water or shoreline
            const leafGroundY = heightMap.getHeight(leafWX, leafWZ);
            if (leafGroundY <= WATER_LEVEL + 1) continue;

            const targetLX = lx + dx;
            const targetLZ = lz + dz;

            if (
              targetLX >= 0 && targetLX < CHUNK_SIZE_X &&
              targetLZ >= 0 && targetLZ < CHUNK_SIZE_Z &&
              ly >= 0 && ly < CHUNK_HEIGHT
            ) {
              if (chunk.getBlock(targetLX, ly, targetLZ) === 0) {
                chunk.setBlock(targetLX, ly, targetLZ, 6); // leaves (Block ID 6)
              }
            }
          }
        }
      }
    }
  }
}
