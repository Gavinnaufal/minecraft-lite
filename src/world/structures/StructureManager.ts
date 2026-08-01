import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../../utils/constants';

export interface StructureBlock {
  localX: number; // 0..15 within chunk or relative
  y: number;
  localZ: number;
  blockId: number;
}

export class StructureManager {
  private static instance: StructureManager | null = null;

  static getInstance(): StructureManager {
    if (!StructureManager.instance) {
      StructureManager.instance = new StructureManager();
    }
    return StructureManager.instance;
  }

  /**
   * Safe block placement for structure prefabs inside a target chunk.
   */
  placeBlockInChunk(chunk: Chunk, lx: number, y: number, lz: number, blockId: number, overwrite = true): boolean {
    if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z || y < 1 || y >= CHUNK_HEIGHT) {
      return false;
    }
    if (!overwrite && chunk.getBlock(lx, y, lz) !== 0) {
      return false;
    }
    chunk.setBlock(lx, y, lz, blockId);
    return true;
  }
}
