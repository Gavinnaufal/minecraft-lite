import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../../utils/constants';

export interface StructureBoundingBox {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export class StructureManager {
  private static instance: StructureManager | null = null;
  private readonly boundsList: StructureBoundingBox[] = [];

  static getInstance(): StructureManager {
    if (!StructureManager.instance) {
      StructureManager.instance = new StructureManager();
    }
    return StructureManager.instance;
  }

  registerBounds(bounds: StructureBoundingBox): void {
    this.boundsList.push(bounds);
  }

  getBounds(): readonly StructureBoundingBox[] {
    return this.boundsList;
  }

  /**
   * Safe block placement for structure prefabs inside a target chunk.
   * Automatically fills solid foundation underneath floor blocks if there's air
   * and marks the chunk dirty to ensure border face culling is re-meshed cleanly.
   */
  placeBlockInChunk(chunk: Chunk, lx: number, y: number, lz: number, blockId: number, overwrite = true): boolean {
    if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z || y < 1 || y >= CHUNK_HEIGHT) {
      return false;
    }
    if (!overwrite && chunk.getBlock(lx, y, lz) !== 0) {
      return false;
    }
    chunk.setBlock(lx, y, lz, blockId);
    chunk.isDirty = true; // Ensure chunk is re-meshed cleanly with structure blocks

    // If placing a solid floor/foundation block, fill downward if air beneath
    if (blockId === 3 || blockId === 5) {
      for (let fillY = y - 1; fillY >= Math.max(1, y - 3); fillY--) {
        const below = chunk.getBlock(lx, fillY, lz);
        if (below === 0 || below === 7) {
          chunk.setBlock(lx, fillY, lz, 3); // Stone foundation
        } else {
          break;
        }
      }
    }

    return true;
  }
}
