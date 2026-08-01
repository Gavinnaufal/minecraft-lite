import type { Chunk } from '../../Chunk';
import { StructureManager } from '../StructureManager';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../../utils/constants';

export function buildOakHousePrefab(
  chunk: Chunk,
  chunkMinWX: number,
  chunkMinWZ: number,
  originWX: number,
  groundY: number,
  originWZ: number,
): void {
  const manager = StructureManager.getInstance();
  const width = 5;
  const depth = 5;
  const height = 4;

  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < depth; dz++) {
      const wx = originWX + dx;
      const wz = originWZ + dz;

      const lx = wx - chunkMinWX;
      const lz = wz - chunkMinWZ;

      if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z) continue;

      // 1. Foundation & Floor (y = groundY)
      manager.placeBlockInChunk(chunk, lx, groundY, lz, 3); // Stone foundation

      // 2. Interior & Air clearance (y = groundY + 1 to groundY + height)
      for (let dy = 1; dy <= height; dy++) {
        const y = groundY + dy;
        const isCorner = (dx === 0 || dx === width - 1) && (dz === 0 || dz === depth - 1);
        const isWall = dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1;

        if (isCorner) {
          // Log pillars on 4 corners
          manager.placeBlockInChunk(chunk, lx, y, lz, 5); // wood_log
        } else if (isWall) {
          // Front door (dz === 0, dx === 2, y = groundY + 1..2)
          const isDoor = dz === 0 && dx === 2 && (dy === 1 || dy === 2);
          // Windows (side walls center, dy === 2)
          const isWindow = dy === 2 && ((dx === 0 || dx === width - 1) && dz === 2);

          if (isDoor || isWindow) {
            manager.placeBlockInChunk(chunk, lx, y, lz, 0); // Air opening
          } else {
            manager.placeBlockInChunk(chunk, lx, y, lz, 8); // Wooden plank wall
          }
        } else {
          // Inside room (air)
          manager.placeBlockInChunk(chunk, lx, y, lz, 0);
        }
      }

      // 3. Roof (y = groundY + height + 1)
      const roofY = groundY + height + 1;
      manager.placeBlockInChunk(chunk, lx, roofY, lz, 8); // Plank roof
    }
  }

  // Place torch inside house at (originWX + 2, groundY + 3, originWZ + 3)
  const torchWX = originWX + 2;
  const torchWZ = originWZ + 3;
  const torchLX = torchWX - chunkMinWX;
  const torchLZ = torchWZ - chunkMinWZ;
  if (torchLX >= 0 && torchLX < CHUNK_SIZE_X && torchLZ >= 0 && torchLZ < CHUNK_SIZE_Z) {
    manager.placeBlockInChunk(chunk, torchLX, groundY + 3, torchLZ, 11); // Torch
    manager.placeBlockInChunk(chunk, torchLX, groundY + 1, torchLZ - 1, 9); // Crafting Table
  }
}
