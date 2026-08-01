import { NoiseGenerator } from '../terrain/NoiseGenerator';
import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../utils/constants';

export class OreGenerator {
  private coalNoise: NoiseGenerator;
  private ironNoise: NoiseGenerator;

  constructor(seed: number) {
    // Offset seeds to produce independent 3D noise fields
    this.coalNoise = new NoiseGenerator(seed + 101);
    this.ironNoise = new NoiseGenerator(seed + 202);
  }

  generateForChunk(chunk: Chunk): void {
    const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
    const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;

    for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
        const wx = chunkMinWX + lx;
        const wz = chunkMinWZ + lz;

        // Iterate underground Y levels where stone is generated
        for (let y = 5; y <= 60; y++) {
          const currentBlock = chunk.getBlock(lx, y, lz);
          // Ores only replace solid stone (Block ID 3)
          if (currentBlock !== 3) continue;

          // Coal Ore Cluster Generation (Y: 5..60, tight threshold > 0.73)
          const coalVal = this.coalNoise.noise3D(wx / 12, y / 12, wz / 12);
          if (coalVal > 0.73) {
            chunk.setBlock(lx, y, lz, 21); // Block ID 21 = coal_ore
            continue;
          }

          // Iron Ore Cluster Generation (Y: 5..40, tight threshold > 0.78 for rarity)
          if (y <= 40) {
            const ironVal = this.ironNoise.noise3D(wx / 10, y / 10, wz / 10);
            if (ironVal > 0.78) {
              chunk.setBlock(lx, y, lz, 22); // Block ID 22 = iron_ore
            }
          }
        }
      }
    }
  }
}
