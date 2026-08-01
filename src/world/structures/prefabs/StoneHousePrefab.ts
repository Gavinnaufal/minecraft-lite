import type { Chunk } from '../../Chunk';
import { StructureManager } from '../StructureManager';
import { VillageLoot } from '../VillageLoot';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../../utils/constants';

export function buildStoneHousePrefab(
  chunk: Chunk,
  chunkMinWX: number,
  chunkMinWZ: number,
  originWX: number,
  groundY: number,
  originWZ: number,
): void {
  const manager = StructureManager.getInstance();
  const width = 6;
  const depth = 6;
  const height = 4;

  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < depth; dz++) {
      const wx = originWX + dx;
      const wz = originWZ + dz;

      const lx = wx - chunkMinWX;
      const lz = wz - chunkMinWZ;

      if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z) continue;

      // 1. Foundation & Floor (y = groundY)
      manager.placeBlockInChunk(chunk, lx, groundY, lz, 3); // Stone floor

      // 2. Stone Walls & Interior (y = groundY + 1 to groundY + height)
      for (let dy = 1; dy <= height; dy++) {
        const y = groundY + dy;
        const isWall = dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1;

        if (isWall) {
          // Doorway on front wall (dz === 0, dx === 3, y = 1..2)
          const isDoor = dz === 0 && dx === 3 && (dy === 1 || dy === 2);
          // Windows on side walls (dy === 2)
          const isWindow = dy === 2 && ((dx === 0 || dx === width - 1) && (dz === 2 || dz === 3));

          if (isDoor || isWindow) {
            manager.placeBlockInChunk(chunk, lx, y, lz, 0); // Air opening
          } else {
            manager.placeBlockInChunk(chunk, lx, y, lz, 3); // Stone wall
          }
        } else {
          // Interior (air)
          manager.placeBlockInChunk(chunk, lx, y, lz, 0);
        }
      }

      // 3. Stone & Plank Roof (y = groundY + height + 1)
      const roofY = groundY + height + 1;
      manager.placeBlockInChunk(chunk, lx, roofY, lz, 3); // Stone roof
    }
  }

  // Interior furnishings (chest & torch)
  const torchWX = originWX + 3;
  const torchWZ = originWZ + 4;
  const torchLX = torchWX - chunkMinWX;
  const torchLZ = torchWZ - chunkMinWZ;
  if (torchLX >= 0 && torchLX < CHUNK_SIZE_X && torchLZ >= 0 && torchLZ < CHUNK_SIZE_Z) {
    manager.placeBlockInChunk(chunk, torchLX, groundY + 3, torchLZ, 11); // Torch
    const chestWX = torchWX - 1;
    manager.placeBlockInChunk(chunk, torchLX - 1, groundY + 1, torchLZ, 12); // Chest
    VillageLoot.fillChest(chestWX, groundY + 1, torchWZ);
  }
}
