import type { Chunk } from '../../Chunk';
import { StructureManager } from '../StructureManager';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../../utils/constants';

export function buildFarmPrefab(
  chunk: Chunk,
  chunkMinWX: number,
  chunkMinWZ: number,
  originWX: number,
  groundY: number,
  originWZ: number,
): void {
  const manager = StructureManager.getInstance();
  const width = 4;
  const depth = 6;

  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < depth; dz++) {
      const wx = originWX + dx;
      const wz = originWZ + dz;

      const lx = wx - chunkMinWX;
      const lz = wz - chunkMinWZ;

      if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z) continue;

      const isBorder = dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1;
      const isWaterCanal = !isBorder && dx === 2;

      if (isBorder) {
        // Wood log border framing
        manager.placeBlockInChunk(chunk, lx, groundY, lz, 5); // wood_log
        manager.placeBlockInChunk(chunk, lx, groundY + 1, lz, 0); // Air space above border
      } else if (isWaterCanal) {
        // Water canal in middle of farm
        manager.placeBlockInChunk(chunk, lx, groundY, lz, 7); // water
        manager.placeBlockInChunk(chunk, lx, groundY + 1, lz, 0); // Air space
      } else {
        // Farmland soil with wheat crops on top
        manager.placeBlockInChunk(chunk, lx, groundY, lz, 13); // farmland
        manager.placeBlockInChunk(chunk, lx, groundY + 1, lz, 14); // wheat_crop
      }
    }
  }
}
