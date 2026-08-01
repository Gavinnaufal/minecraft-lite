import { NoiseGenerator } from './NoiseGenerator';
import { CHUNK_HEIGHT, WATER_LEVEL } from '../../utils/constants';

export class HeightMap {
  private readonly noise: NoiseGenerator;

  readonly scale: number;
  readonly octaves: number;
  readonly persistence: number;
  readonly lacunarity: number;

  private readonly maxAmplitude: number;

  constructor(
    noise: NoiseGenerator,
    scale = 120,
    octaves = 4,
    persistence = 0.38,
    lacunarity = 2.0,
  ) {
    this.noise = noise;
    this.scale = scale;
    this.octaves = octaves;
    this.persistence = persistence;
    this.lacunarity = lacunarity;

    let amp = 1;
    let total = 0;
    for (let i = 0; i < octaves; i++) {
      total += amp;
      amp *= persistence;
    }
    this.maxAmplitude = total;
  }

  /** Returns terrain height at world (x, z), clamped to [0, CHUNK_HEIGHT] */
  getHeight(worldX: number, worldZ: number): number {
    const sx = worldX / this.scale;
    const sz = worldZ / this.scale;

    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < this.octaves; i++) {
      value += this.noise.noise2D(sx * frequency, sz * frequency) * amplitude;
      frequency *= this.lacunarity;
      amplitude *= this.persistence;
    }

    // Normalize to [-1, 1] then map to gentle terrain around WATER_LEVEL
    const normalized = value / this.maxAmplitude;
    // Max hill height ~22 blocks above water, min valley ~6 blocks below water
    const height = WATER_LEVEL + normalized * 22;
    return Math.round(Math.min(CHUNK_HEIGHT - 1, Math.max(1, height)));
  }
}
