import { NoiseGenerator } from '../terrain/NoiseGenerator';
import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../utils/constants';

/**
 * OreGenerator (CP-240 & CP-241 Fine-Tuned Cluster Noise Generator)
 * Controls 3D vein clustering for Coal Ore & Iron Ore underneath surface terrain.
 */
export class OreGenerator {
  private coalNoise: NoiseGenerator;
  private ironNoise: NoiseGenerator;

  // Fine-tuned 3D noise scaling and threshold constants (CP-241)
  private readonly COAL_SCALE = 14.0;
  private readonly COAL_THRESHOLD = 0.72; // ~4% of subterranean stone Y 5..60

  private readonly IRON_SCALE = 10.0;
  private readonly IRON_THRESHOLD = 0.77; // ~1.8% of subterranean stone Y 5..40

  constructor(seed: number) {
    // Offset seeds to produce independent, non-overlapping 3D noise fields
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

          // Coal Ore Cluster Generation (Y: 5..60, vein size ~3-8 blocks)
          const coalVal = this.coalNoise.noise3D(wx / this.COAL_SCALE, y / this.COAL_SCALE, wz / this.COAL_SCALE);
          if (coalVal > this.COAL_THRESHOLD) {
            chunk.setBlock(lx, y, lz, 21); // Block ID 21 = coal_ore
            continue;
          }

          // Iron Ore Cluster Generation (Y: 5..40, vein size ~2-5 blocks)
          if (y <= 40) {
            const ironVal = this.ironNoise.noise3D(wx / this.IRON_SCALE, y / this.IRON_SCALE, wz / this.IRON_SCALE);
            if (ironVal > this.IRON_THRESHOLD) {
              chunk.setBlock(lx, y, lz, 22); // Block ID 22 = iron_ore
            }
          }
        }
      }
    }
  }
}
