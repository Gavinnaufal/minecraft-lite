import { createNoise2D, createNoise3D } from 'simplex-noise';

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export class NoiseGenerator {
  private readonly fn2D: ReturnType<typeof createNoise2D>;
  private readonly fn3D: ReturnType<typeof createNoise3D>;

  constructor(seed: number) {
    const random = seededRandom(seed);
    this.fn2D = createNoise2D(random);
    this.fn3D = createNoise3D(random);
  }

  /** Returns noise value in range [0, 1] */
  noise2D(x: number, z: number): number {
    return (this.fn2D(x, z) + 1) * 0.5;
  }

  /** Returns noise value in range [0, 1] */
  noise3D(x: number, y: number, z: number): number {
    return (this.fn3D(x, y, z) + 1) * 0.5;
  }
}
