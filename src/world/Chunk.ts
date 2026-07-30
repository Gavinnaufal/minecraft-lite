import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';

const CHUNK_VOLUME = CHUNK_SIZE_X * CHUNK_SIZE_Z * CHUNK_HEIGHT;

export class Chunk {
  readonly chunkX: number;
  readonly chunkZ: number;
  readonly blocks = new Uint8Array(CHUNK_VOLUME);
  isDirty = true;

  constructor(chunkX: number, chunkZ: number) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
  }

  getBlock(localX: number, localY: number, localZ: number): number {
    if (!this.isInBounds(localX, localY, localZ)) {
      return 0;
    }
    return this.blocks[this.blockIndex(localX, localY, localZ)];
  }

  setBlock(localX: number, localY: number, localZ: number, blockId: number): void {
    if (!this.isInBounds(localX, localY, localZ)) return;
    this.blocks[this.blockIndex(localX, localY, localZ)] = blockId;
    this.isDirty = true;
  }

  fill(blockId: number): void {
    this.blocks.fill(blockId);
    this.isDirty = true;
  }

  private blockIndex(x: number, y: number, z: number): number {
    return x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;
  }

  private isInBounds(x: number, y: number, z: number): boolean {
    return (
      x >= 0 && x < CHUNK_SIZE_X &&
      y >= 0 && y < CHUNK_HEIGHT &&
      z >= 0 && z < CHUNK_SIZE_Z
    );
  }
}
