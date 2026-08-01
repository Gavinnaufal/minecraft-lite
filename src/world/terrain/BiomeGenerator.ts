import { NoiseGenerator } from './NoiseGenerator';

export enum BiomeType {
  Ocean = 'ocean',
  Desert = 'desert',
  Plains = 'plains',
  Forest = 'forest',
  Mountain = 'mountain',
}

export class BiomeGenerator {
  /** Large-scale noise [0,1]: low = ocean, high = land (scale ~300) */
  private readonly continentNoise: NoiseGenerator;
  /** Medium-scale noise [0,1]: determines which land biome (scale ~150) */
  private readonly biomeNoise: NoiseGenerator;
  private readonly continentScale: number;
  private readonly biomeScale: number;

  constructor(
    continentNoise: NoiseGenerator,
    biomeNoise: NoiseGenerator,
    continentScale = 300,
    biomeScale = 150,
  ) {
    this.continentNoise = continentNoise;
    this.biomeNoise = biomeNoise;
    this.continentScale = continentScale;
    this.biomeScale = biomeScale;
  }

  getBiome(worldX: number, worldZ: number): BiomeType {
    // continentVal in [0,1]: < 0.45 → ocean (~45% of terrain)
    const continentVal = this.continentNoise.noise2D(
      worldX / this.continentScale,
      worldZ / this.continentScale,
    );
    if (continentVal < 0.45) return BiomeType.Ocean;

    // Land biomes determined by a separate finer-scale noise
    const biomeVal = this.biomeNoise.noise2D(
      worldX / this.biomeScale,
      worldZ / this.biomeScale,
    );
    if (biomeVal < 0.25) return BiomeType.Desert;
    if (biomeVal < 0.55) return BiomeType.Plains;
    if (biomeVal < 0.8)  return BiomeType.Forest;
    return BiomeType.Mountain;
  }

  /**
   * Raw continent noise value [0,1].
   * < 0.45 = ocean, 0.45–0.55 = coastal transition, > 0.55 = deep land.
   */
  getRawValue(worldX: number, worldZ: number): number {
    return this.continentNoise.noise2D(
      worldX / this.continentScale,
      worldZ / this.continentScale,
    );
  }
}
