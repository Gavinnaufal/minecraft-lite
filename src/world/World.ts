import { ChunkManager } from './ChunkManager';
import { worldToChunkCoord } from '../utils/math';

export class World {
  private readonly chunkManager: ChunkManager;

  constructor(chunkManager: ChunkManager) {
    this.chunkManager = chunkManager;
  }

  getBlock(worldX: number, worldY: number, worldZ: number): number {
    const { chunkX, chunkZ, localX, localY, localZ } = worldToChunkCoord(worldX, worldY, worldZ);

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return 0;

    return chunk.getBlock(localX, localY, localZ);
  }

  setBlock(worldX: number, worldY: number, worldZ: number, blockId: number): void {
    const { chunkX, chunkZ, localX, localY, localZ } = worldToChunkCoord(worldX, worldY, worldZ);

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return;

    chunk.setBlock(localX, localY, localZ, blockId);
    this.chunkManager.meshChunk(chunkX, chunkZ);
  }
}
