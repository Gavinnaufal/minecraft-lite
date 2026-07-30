import { ChunkManager } from './ChunkManager';
import type { Chunk } from './Chunk';
import { worldToChunkCoord } from '../utils/math';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../utils/constants';

export interface BlockModification {
  x: number;
  y: number;
  z: number;
  blockId: number;
}

export class World {
  private readonly chunkManager: ChunkManager;
  private readonly modifiedBlocks = new Map<string, number>();

  constructor(chunkManager: ChunkManager) {
    this.chunkManager = chunkManager;
  }

  getBlock(worldX: number, worldY: number, worldZ: number): number {
    const { chunkX, chunkZ, localX, localY, localZ } = worldToChunkCoord(worldX, worldY, worldZ);

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return 0;

    return chunk.getBlock(localX, localY, localZ);
  }

  setBlock(worldX: number, worldY: number, worldZ: number, blockId: number, isUserEdit = true): void {
    const { chunkX, chunkZ, localX, localY, localZ } = worldToChunkCoord(worldX, worldY, worldZ);

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return;

    chunk.setBlock(localX, localY, localZ, blockId);
    this.chunkManager.meshChunk(chunkX, chunkZ);

    if (isUserEdit) {
      this.modifiedBlocks.set(`${worldX},${worldY},${worldZ}`, blockId);
    }

    // Re-mesh adjacent neighbor chunks if block is on chunk border
    if (localX === 0) {
      const neighbor = this.chunkManager.getChunk(chunkX - 1, chunkZ);
      if (neighbor) { neighbor.isDirty = true; this.chunkManager.meshChunk(chunkX - 1, chunkZ); }
    } else if (localX === 15) {
      const neighbor = this.chunkManager.getChunk(chunkX + 1, chunkZ);
      if (neighbor) { neighbor.isDirty = true; this.chunkManager.meshChunk(chunkX + 1, chunkZ); }
    }

    if (localZ === 0) {
      const neighbor = this.chunkManager.getChunk(chunkX, chunkZ - 1);
      if (neighbor) { neighbor.isDirty = true; this.chunkManager.meshChunk(chunkX, chunkZ - 1); }
    } else if (localZ === 15) {
      const neighbor = this.chunkManager.getChunk(chunkX, chunkZ + 1);
      if (neighbor) { neighbor.isDirty = true; this.chunkManager.meshChunk(chunkX, chunkZ + 1); }
    }
  }

  getModifiedBlocks(): BlockModification[] {
    const list: BlockModification[] = [];
    this.modifiedBlocks.forEach((blockId, key) => {
      const [x, y, z] = key.split(',').map(Number);
      list.push({ x, y, z, blockId });
    });
    return list;
  }

  setModifiedBlocks(list: BlockModification[]): void {
    this.modifiedBlocks.clear();
    for (const item of list) {
      this.modifiedBlocks.set(`${item.x},${item.y},${item.z}`, item.blockId);
    }
  }

  applyModificationsToChunk(chunk: Chunk): void {
    const chunkMinX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMaxX = chunkMinX + CHUNK_SIZE_X;
    const chunkMinZ = chunk.chunkZ * CHUNK_SIZE_Z;
    const chunkMaxZ = chunkMinZ + CHUNK_SIZE_Z;

    this.modifiedBlocks.forEach((blockId, key) => {
      const [x, y, z] = key.split(',').map(Number);
      if (x >= chunkMinX && x < chunkMaxX && z >= chunkMinZ && z < chunkMaxZ) {
        const lx = x - chunkMinX;
        const lz = z - chunkMinZ;
        chunk.setBlock(lx, y, lz, blockId);
      }
    });
  }
}
