import type { World } from './World';
import { WATER_LEVEL } from '../utils/constants';

/**
 * Checks if breaking or modifying a block allows adjacent water to spread.
 * If the position (x, y, z) is at or below WATER_LEVEL and adjacent to water,
 * water flows in and fills the empty space and connected air blocks below WATER_LEVEL.
 */
export function checkAndSpreadWater(world: World, startX: number, startY: number, startZ: number): void {
  if (startY > WATER_LEVEL || startY < 1) return;

  const queue: [number, number, number][] = [[startX, startY, startZ]];
  const visited = new Set<string>();

  const maxSpreads = 64; // Cap max spread per break to maintain high performance
  let spreads = 0;

  while (queue.length > 0 && spreads < maxSpreads) {
    const [x, y, z] = queue.shift()!;
    const key = `${x},${y},${z}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (y > WATER_LEVEL || y < 1) continue;

    const currentBlock = world.getBlock(x, y, z);
    if (currentBlock !== 0) continue; // Only spread into empty air blocks

    // Check if any neighboring block is Water (ID: 7)
    const neighbors: [number, number, number][] = [
      [x + 1, y, z],
      [x - 1, y, z],
      [x, y, z + 1],
      [x, y, z - 1],
      [x, y + 1, z],
      [x, y - 1, z],
    ];

    let hasWaterNeighbor = false;
    for (const [nx, ny, nz] of neighbors) {
      if (world.getBlock(nx, ny, nz) === 7) {
        hasWaterNeighbor = true;
        break;
      }
    }

    if (hasWaterNeighbor) {
      world.setBlock(x, y, z, 7); // Fill with water block
      spreads++;

      // Queue adjacent air blocks to continue water flow
      for (const [nx, ny, nz] of neighbors) {
        if (ny <= WATER_LEVEL && world.getBlock(nx, ny, nz) === 0) {
          queue.push([nx, ny, nz]);
        }
      }
    }
  }
}
