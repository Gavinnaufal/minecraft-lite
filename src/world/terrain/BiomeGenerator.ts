import { NoiseGenerator } from './NoiseGenerator';

export enum BiomeType {
  Ocean = 'ocean',
  Desert = 'desert',
  Plains = 'plains',
  Forest = 'forest',
  Mountain = 'mountain',
}

export class BiomeGenerator {
  private readonly noise: NoiseGenerator;
  private readonly scale: number;

  constructor(noise: NoiseGenerator, scale = 200) {
    this.noise = noise;
    this.scale = scale;
  }

  getBiome(worldX: number, worldZ: number): BiomeType {
    const value = this.noise.noise2D(worldX / this.scale, worldZ / this.scale);

    if (value < -0.15) return BiomeType.Ocean;
    if (value < 0.2)   return BiomeType.Desert;
    if (value < 0.5)   return BiomeType.Plains;
    if (value < 0.75)  return BiomeType.Forest;
    return BiomeType.Mountain;
  }

  /** Raw noise value [~-1..1] used for smooth biome blending */
  getRawValue(worldX: number, worldZ: number): number {
    return this.noise.noise2D(worldX / this.scale, worldZ / this.scale);
  }
}
