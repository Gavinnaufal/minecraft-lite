import { createNoise3D } from 'simplex-noise';

function seededRandom(seed) {
  let s = seed | 0;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

class NoiseGenerator {
  constructor(seed) {
    this.fn3D = createNoise3D(seededRandom(seed));
  }
  noise3D(x, y, z) {
    return (this.fn3D(x, y, z) + 1) * 0.5;
  }
}

function verifySeed(seed) {
  const coalNoise = new NoiseGenerator(seed + 101);
  const ironNoise = new NoiseGenerator(seed + 202);
  const caveNoise = new NoiseGenerator(seed + 2);

  const coalScale = 0.25;
  const coalThresh = 0.958;
  const ironScale = 0.3;
  const ironThresh = 0.972;

  let totalCoalCount = 0;
  let totalIronCount = 0;
  let exposedCoal = 0;
  let exposedIron = 0;
  const totalChunks = 25;

  for (let cz = 0; cz < 5; cz++) {
    for (let cx = 0; cx < 5; cx++) {
      const minWX = cx * 16;
      const minWZ = cz * 16;

      for (let lz = 0; lz < 16; lz++) {
        for (let lx = 0; lx < 16; lx++) {
          const wx = minWX + lx;
          const wz = minWZ + lz;

          for (let y = 5; y <= 60; y++) {
            const caveVal = caveNoise.noise3D(wx / 45, y / 45, wz / 45);
            if (caveVal > 0.64) continue; // Cave space

            const coalVal = coalNoise.noise3D(wx * coalScale, y * coalScale, wz * coalScale);
            if (coalVal > coalThresh) {
              totalCoalCount++;
              const adjCave = caveNoise.noise3D((wx + 1) / 45, y / 45, wz / 45) > 0.64 ||
                              caveNoise.noise3D((wx - 1) / 45, y / 45, wz / 45) > 0.64 ||
                              caveNoise.noise3D(wx / 45, (y + 1) / 45, wz / 45) > 0.64 ||
                              caveNoise.noise3D(wx / 45, (y - 1) / 45, wz / 45) > 0.64;
              if (adjCave) exposedCoal++;
              continue;
            }

            if (y <= 40) {
              const ironVal = ironNoise.noise3D(wx * ironScale, y * ironScale, wz * ironScale);
              if (ironVal > ironThresh) {
                totalIronCount++;
                const adjCave = caveNoise.noise3D((wx + 1) / 45, y / 45, wz / 45) > 0.64 ||
                                caveNoise.noise3D((wx - 1) / 45, y / 45, wz / 45) > 0.64 ||
                                caveNoise.noise3D(wx / 45, (y + 1) / 45, wz / 45) > 0.64 ||
                                caveNoise.noise3D(wx / 45, (y - 1) / 45, wz / 45) > 0.64;
                if (adjCave) exposedIron++;
              }
            }
          }
        }
      }
    }
  }

  console.log(`=== SEED ${seed} ===`);
  console.log(`Coal Ore Total: ${totalCoalCount} (Avg/chunk: ${(totalCoalCount/totalChunks).toFixed(1)}, Exposed in caves: ${exposedCoal})`);
  console.log(`Iron Ore Total: ${totalIronCount} (Avg/chunk: ${(totalIronCount/totalChunks).toFixed(1)}, Exposed in caves: ${exposedIron})`);
}

verifySeed(12345);
verifySeed(99999);
verifySeed(424242);
