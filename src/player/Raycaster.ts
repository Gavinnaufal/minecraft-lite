import * as THREE from 'three';
import { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';

export interface RaycastHit {
  /** World position of the hit block */
  blockX: number;
  blockY: number;
  blockZ: number;
  /** Normal of the face that was hit */
  normalX: number;
  normalY: number;
  normalZ: number;
  /** The block ID that was hit */
  blockId: number;
}

const MAX_DISTANCE = 5;

const direction = new THREE.Vector3();
const origin = new THREE.Vector3();

export function raycaster(world: World, camera: THREE.PerspectiveCamera): RaycastHit | null {
  camera.getWorldDirection(direction);
  camera.getWorldPosition(origin);

  const stepX = direction.x > 0 ? 1 : direction.x < 0 ? -1 : 0;
  const stepY = direction.y > 0 ? 1 : direction.y < 0 ? -1 : 0;
  const stepZ = direction.z > 0 ? 1 : direction.z < 0 ? -1 : 0;

  let blockX = Math.floor(origin.x);
  let blockY = Math.floor(origin.y);
  let blockZ = Math.floor(origin.z);

  const tDeltaX = stepX === 0 ? Infinity : Math.abs(1 / direction.x);
  const tDeltaY = stepY === 0 ? Infinity : Math.abs(1 / direction.y);
  const tDeltaZ = stepZ === 0 ? Infinity : Math.abs(1 / direction.z);

  const nextX = stepX > 0 ? blockX + 1 : blockX;
  const nextY = stepY > 0 ? blockY + 1 : blockY;
  const nextZ = stepZ > 0 ? blockZ + 1 : blockZ;

  let tMaxX = stepX === 0 ? Infinity : Math.abs((nextX - origin.x) / direction.x);
  let tMaxY = stepY === 0 ? Infinity : Math.abs((nextY - origin.y) / direction.y);
  let tMaxZ = stepZ === 0 ? Infinity : Math.abs((nextZ - origin.z) / direction.z);

  let normalX = 0;
  let normalY = 0;
  let normalZ = 0;

  for (let i = 0; i < MAX_DISTANCE * 3; i++) {
    blockY = Math.max(0, blockY);

    const blockId = world.getBlock(blockX, blockY, blockZ);
    const block = getBlockById(blockId);
    if (block && block.solid) {
      return { blockX, blockY, blockZ, normalX, normalY, normalZ, blockId };
    }

    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      blockX += stepX;
      tMaxX += tDeltaX;
      normalX = -stepX;
      normalY = 0;
      normalZ = 0;
    } else if (tMaxY < tMaxZ) {
      blockY += stepY;
      tMaxY += tDeltaY;
      normalX = 0;
      normalY = -stepY;
      normalZ = 0;
    } else {
      blockZ += stepZ;
      tMaxZ += tDeltaZ;
      normalX = 0;
      normalY = 0;
      normalZ = -stepZ;
    }

    if (tMaxX > MAX_DISTANCE && tMaxY > MAX_DISTANCE && tMaxZ > MAX_DISTANCE) {
      return null;
    }
  }

  return null;
}
