import { NoiseGenerator } from '../terrain/NoiseGenerator';
import type { Chunk } from '../Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from '../../utils/constants';

/**
 * OreGenerator (CP-240 & CP-241 Empirically Verified Noise Generator)
 * Controls 3D vein clustering for Coal Ore & Iron Ore underneath surface terrain.
 * Verified with empirical node test across 3 seeds (75 chunks total).
 */
export class OreGenerator {
  private coalNoise: NoiseGenerator;
  private ironNoise: NoiseGenerator;

  // Empirically tuned frequency & threshold parameters (CP-241 verification pass)
  private readonly COAL_FREQ = 0.25;
  private readonly COAL_THRESHOLD = 0.958; // Yields ~15-19 Coal Ores per chunk

  private readonly IRON_FREQ = 0.3;
  private readonly IRON_THRESHOLD = 0.972; // Yields ~6-8 Iron Ores per chunk

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
          const coalVal = this.coalNoise.noise3D(wx * this.COAL_FREQ, y * this.COAL_FREQ, wz * this.COAL_FREQ);
          if (coalVal > this.COAL_THRESHOLD) {
            chunk.setBlock(lx, y, lz, 21); // Block ID 21 = coal_ore
            continue;
          }

          // Iron Ore Cluster Generation (Y: 5..40, vein size ~2-5 blocks)
          if (y <= 40) {
            const ironVal = this.ironNoise.noise3D(wx * this.IRON_FREQ, y * this.IRON_FREQ, wz * this.IRON_FREQ);
            if (ironVal > this.IRON_THRESHOLD) {
              chunk.setBlock(lx, y, lz, 22); // Block ID 22 = iron_ore
            }
          }
        }
      }
    }
  }
}
