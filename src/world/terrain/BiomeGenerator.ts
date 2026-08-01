import { NoiseGenerator } from './NoiseGenerator';

export enum BiomeType {
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

    if (value < 0.35) return BiomeType.Desert;
    if (value < 0.6) return BiomeType.Plains;
    if (value < 0.8) return BiomeType.Forest;
    return BiomeType.Mountain;
  }
}
