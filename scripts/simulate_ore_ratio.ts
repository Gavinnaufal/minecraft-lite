import { OreGenerator } from '../src/world/ores/OreGenerator';
import { Chunk } from '../src/world/Chunk';

interface ChunkOreStat {
  chunkX: number;
  chunkZ: number;
  coalCount: number;
  ironCount: number;
  stoneCount: number;
}

interface SeedProfilingResult {
  seed: number;
  chunks: ChunkOreStat[];
  totalCoal: number;
  totalIron: number;
  totalStone: number;
  avgCoalPerChunk: number;
  avgIronPerChunk: number;
  minCoalPerChunk: number;
  maxCoalPerChunk: number;
  minIronPerChunk: number;
  maxIronPerChunk: number;
}

function runProfilingForSeed(seed: number, gridWidth: number = 4): SeedProfilingResult {
  const oreGen = new OreGenerator(seed);
  const chunkStats: ChunkOreStat[] = [];

  let totalCoal = 0;
  let totalIron = 0;
  let totalStone = 0;

  for (let cz = 0; cz < gridWidth; cz++) {
    for (let cx = 0; cx < gridWidth; cx++) {
      const chunk = new Chunk(cx, cz);
      
      // Populate subterranean stone (Y: 5..60)
      for (let lz = 0; lz < 16; lz++) {
        for (let lx = 0; lx < 16; lx++) {
          for (let y = 5; y <= 60; y++) {
            chunk.setBlock(lx, y, lz, 3); // Stone ID = 3
          }
        }
      }

      // Generate Ores using production OreGenerator
      oreGen.generateForChunk(chunk);

      let coalCount = 0;
      let ironCount = 0;
      let stoneCount = 0;

      for (let lz = 0; lz < 16; lz++) {
        for (let lx = 0; lx < 16; lx++) {
          for (let y = 5; y <= 60; y++) {
            const b = chunk.getBlock(lx, y, lz);
            if (b === 21) coalCount++;
            else if (b === 22) ironCount++;
            else if (b === 3) stoneCount++;
          }
        }
      }

      totalCoal += coalCount;
      totalIron += ironCount;
      totalStone += stoneCount;

      chunkStats.push({ chunkX: cx, chunkZ: cz, coalCount, ironCount, stoneCount });
    }
  }

  const coalCounts = chunkStats.map((c) => c.coalCount);
  const ironCounts = chunkStats.map((c) => c.ironCount);

  return {
    seed,
    chunks: chunkStats,
    totalCoal,
    totalIron,
    totalStone,
    avgCoalPerChunk: parseFloat((totalCoal / chunkStats.length).toFixed(2)),
    avgIronPerChunk: parseFloat((totalIron / chunkStats.length).toFixed(2)),
    minCoalPerChunk: Math.min(...coalCounts),
    maxCoalPerChunk: Math.max(...coalCounts),
    minIronPerChunk: Math.min(...ironCounts),
    maxIronPerChunk: Math.max(...ironCounts),
  };
}

function runFullOreProfiling() {
  const seeds = [12345, 67890, 42911];
  console.log('================================================================');
  console.log('  MINI MINECRAFT (EXPANSION V3.0) — ORE DENSITY PROFILING REPORT');
  console.log('  Testing production OreGenerator.ts across 3 seeds (48 chunks)');
  console.log('================================================================\n');

  const results: SeedProfilingResult[] = [];

  for (const seed of seeds) {
    const res = runProfilingForSeed(seed, 4); // 4x4 = 16 chunks per seed
    results.push(res);

    console.log(`--- SEED: ${seed} (16 Chunks Area: 4x4 Grid) ---`);
    console.log(`Total Coal Ore : ${res.totalCoal} (Avg: ${res.avgCoalPerChunk}/chunk, Range: ${res.minCoalPerChunk}-${res.maxCoalPerChunk})`);
    console.log(`Total Iron Ore : ${res.totalIron} (Avg: ${res.avgIronPerChunk}/chunk, Range: ${res.minIronPerChunk}-${res.maxIronPerChunk})`);
    console.log(`Total Stone    : ${res.totalStone}`);
    console.log('');
  }

  console.log('=== SUMMARY TABLE ACROSS ALL SEEDS ===');
  console.log('| Seed | Area (Chunks) | Total Coal Ore | Avg Coal/Chunk | Total Iron Ore | Avg Iron/Chunk | Ratio Coal:Iron |');
  console.log('|---|---|---|---|---|---|---|');

  let overallCoal = 0;
  let overallIron = 0;
  let overallChunks = 0;

  for (const res of results) {
    overallCoal += res.totalCoal;
    overallIron += res.totalIron;
    overallChunks += res.chunks.length;
    const ratio = (res.totalCoal / res.totalIron).toFixed(2);
    console.log(`| ${res.seed} | 16 chunks | ${res.totalCoal} | ${res.avgCoalPerChunk} | ${res.totalIron} | ${res.avgIronPerChunk} | ${ratio}:1 |`);
  }

  const grandAvgCoal = (overallCoal / overallChunks).toFixed(2);
  const grandAvgIron = (overallIron / overallChunks).toFixed(2);
  const grandRatio = (overallCoal / overallIron).toFixed(2);

  console.log(`| **GRAND TOTAL** | **${overallChunks} chunks** | **${overallCoal}** | **${grandAvgCoal}** | **${overallIron}** | **${grandAvgIron}** | **${grandRatio}:1** |\n`);

  console.log('=== EXPLORATION ESTIMATE (5-MINUTE CAVE EXPLORATION ~ 4-6 CHUNKS) ===');
  const estCoal5Min = Math.round(parseFloat(grandAvgCoal) * 5);
  const estIron5Min = Math.round(parseFloat(grandAvgIron) * 5);
  console.log(`- In a typical 5-minute cave exploration (~5 chunks area):`);
  console.log(`  - Estimated Coal Ore  : ~${estCoal5Min} blocks (Sufficient for ~10+ furnace smelting fuel cycles)`);
  console.log(`  - Estimated Iron Ore  : ~${estIron5Min} blocks (Sufficient for ~1 full set of Iron Pickaxe + Sword + Axe requiring 6 ingots)`);
}

runFullOreProfiling();
