import { CHUNK_SIZE_X, CHUNK_SIZE_Z } from './constants';

export interface ChunkCoord {
  chunkX: number;
  chunkZ: number;
  localX: number;
  localY: number;
  localZ: number;
}

export function worldToChunkCoord(worldX: number, worldY: number, worldZ: number): ChunkCoord {
  const chunkX = Math.floor(worldX / CHUNK_SIZE_X);
  const chunkZ = Math.floor(worldZ / CHUNK_SIZE_Z);

  return {
    chunkX,
    chunkZ,
    localX: worldX - chunkX * CHUNK_SIZE_X,
    localY: worldY,
    localZ: worldZ - chunkZ * CHUNK_SIZE_Z,
  };
}

// --- Unit tests ---
function assertEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`[FAIL] ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

function runTests(): void {
  assertEqual(
    worldToChunkCoord(0, 5, 0),
    { chunkX: 0, chunkZ: 0, localX: 0, localY: 5, localZ: 0 },
    'origin block',
  );

  assertEqual(
    worldToChunkCoord(15, 70, 15),
    { chunkX: 0, chunkZ: 0, localX: 15, localY: 70, localZ: 15 },
    'max local coords in chunk (0,0)',
  );

  assertEqual(
    worldToChunkCoord(16, 0, 0),
    { chunkX: 1, chunkZ: 0, localX: 0, localY: 0, localZ: 0 },
    'cross chunk boundary +X',
  );

  assertEqual(
    worldToChunkCoord(-1, 0, -1),
    { chunkX: -1, chunkZ: -1, localX: 15, localY: 0, localZ: 15 },
    'negative world coords',
  );

  assertEqual(
    worldToChunkCoord(-16, 0, -16),
    { chunkX: -1, chunkZ: -1, localX: 0, localY: 0, localZ: 0 },
    'negative world coords edges',
  );

  assertEqual(
    worldToChunkCoord(32, 128, -17),
    { chunkX: 2, chunkZ: -2, localX: 0, localY: 128, localZ: 15 },
    'mixed signs + cross boundary',
  );

  console.log('[math.ts] All unit tests passed');
}

runTests();
