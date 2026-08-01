import { NoiseGenerator } from '../terrain/NoiseGenerator';

export class NetherWorldGenerator {
  private noise: NoiseGenerator;

  constructor(seed = 12345) {
    this.noise = new NoiseGenerator(seed);
  }

  /** Generates block ID for Nether dimension at position (x, y, z). */
  getBlockId(x: number, y: number, z: number): number {
    // Bedrock floor & ceiling
    if (y <= 1 || y >= 126) return 3; // Stone / Bedrock

    // Nether ceiling terrain
    const ceilingNoise = this.noise.noise2D(x * 0.03, z * 0.03);
    const ceilingHeight = Math.floor(100 + ceilingNoise * 15);
    if (y >= ceilingHeight) {
      // Glowstone cluster chance on ceiling
      if (y >= ceilingHeight && y <= ceilingHeight + 4 && Math.random() < 0.08) {
        return 17; // Glowstone
      }
      return 16; // Netherrack
    }

    // Nether floor terrain
    const floorNoise = this.noise.noise2D(x * 0.025 + 50, z * 0.025 + 50);
    const floorHeight = Math.floor(22 + floorNoise * 18);
    if (y <= floorHeight) {
      // Soul Sand patch
      const soulNoise = this.noise.noise2D(x * 0.06 + 100, z * 0.06 + 100);
      if (y === floorHeight && soulNoise > 0.4) {
        return 20; // Soul Sand
      }
      return 16; // Netherrack
    }

    // Lava Ocean below Y=18
    if (y <= 18) {
      return 19; // Lava
    }

    return 0; // Air cavern
  }
}
