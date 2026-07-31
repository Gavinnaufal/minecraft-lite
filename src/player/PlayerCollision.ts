import type { Player } from './Player';
import type { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';

export class PlayerCollision {
  private readonly player: Player;
  private readonly world: World;

  constructor(player: Player, world: World) {
    this.player = player;
    this.world = world;
  }

  /**
   * Applies velocity * deltaTime to position using authentic Minecraft AABB sweep resolution.
   */
  checkAndResolve(deltaTime: number = 1 / 60): void {
    const dt = Math.min(deltaTime, 0.05);

    const intendedDx = this.player.velocity.x * dt;
    const intendedDy = this.player.velocity.y * dt;
    const intendedDz = this.player.velocity.z * dt;

    const hw = this.player.width / 2;
    const height = this.player.height;

    // Player current AABB
    let pMinX = this.player.position.x - hw;
    let pMaxX = this.player.position.x + hw;
    let pMinY = this.player.position.y;
    let pMaxY = this.player.position.y + height;
    let pMinZ = this.player.position.z - hw;
    let pMaxZ = this.player.position.z + hw;

    // Extended search region for candidate blocks
    const sMinX = Math.floor(Math.min(pMinX, pMinX + intendedDx) - 1);
    const sMaxX = Math.floor(Math.max(pMaxX, pMaxX + intendedDx) + 1);
    const sMinY = Math.floor(Math.min(pMinY, pMinY + intendedDy) - 1);
    const sMaxY = Math.floor(Math.max(pMaxY, pMaxY + intendedDy) + 1);
    const sMinZ = Math.floor(Math.min(pMinZ, pMinZ + intendedDz) - 1);
    const sMaxZ = Math.floor(Math.max(pMaxZ, pMaxZ + intendedDz) + 1);

    // Collect candidate solid block AABBs
    const blocks: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }[] = [];
    for (let y = sMinY; y <= sMaxY; y++) {
      for (let x = sMinX; x <= sMaxX; x++) {
        for (let z = sMinZ; z <= sMaxZ; z++) {
          const blockId = this.world.getBlock(x, y, z);
          const blockDef = getBlockById(blockId);
          if (blockId !== 0 && blockDef?.solid) { // Only collide with solid blocks
            blocks.push({
              minX: x,
              maxX: x + 1,
              minY: y,
              maxY: y + 1,
              minZ: z,
              maxZ: z + 1,
            });
          }
        }
      }
    }

    let adjustedDy = intendedDy;

    // 1. Resolve Y Axis
    for (const b of blocks) {
      if (pMaxX > b.minX && pMinX < b.maxX && pMaxZ > b.minZ && pMinZ < b.maxZ) {
        if (adjustedDy > 0 && pMaxY <= b.minY) {
          const maxMove = b.minY - pMaxY;
          if (maxMove < adjustedDy) adjustedDy = Math.max(0, maxMove);
        } else if (adjustedDy < 0 && pMinY >= b.maxY) {
          const maxMove = b.maxY - pMinY;
          if (maxMove > adjustedDy) adjustedDy = Math.min(0, maxMove);
        }
      }
    }

    pMinY += adjustedDy;
    pMaxY += adjustedDy;

    let adjustedDx = intendedDx;

    // 2. Resolve X Axis
    for (const b of blocks) {
      if (pMaxY > b.minY && pMinY < b.maxY && pMaxZ > b.minZ && pMinZ < b.maxZ) {
        if (adjustedDx > 0 && pMaxX <= b.minX) {
          const maxMove = b.minX - pMaxX;
          if (maxMove < adjustedDx) adjustedDx = Math.max(0, maxMove);
        } else if (adjustedDx < 0 && pMinX >= b.maxX) {
          const maxMove = b.maxX - pMinX;
          if (maxMove > adjustedDx) adjustedDx = Math.min(0, maxMove);
        }
      }
    }

    pMinX += adjustedDx;
    pMaxX += adjustedDx;

    let adjustedDz = intendedDz;

    // 3. Resolve Z Axis
    for (const b of blocks) {
      if (pMaxX > b.minX && pMinX < b.maxX && pMaxY > b.minY && pMinY < b.maxY) {
        if (adjustedDz > 0 && pMaxZ <= b.minZ) {
          const maxMove = b.minZ - pMaxZ;
          if (maxMove < adjustedDz) adjustedDz = Math.max(0, maxMove);
        } else if (adjustedDz < 0 && pMinZ >= b.maxZ) {
          const maxMove = b.maxZ - pMinZ;
          if (maxMove > adjustedDz) adjustedDz = Math.min(0, maxMove);
        }
      }
    }

    // Apply resolved movements
    this.player.position.x += adjustedDx;
    this.player.position.y += adjustedDy;
    this.player.position.z += adjustedDz;

    // Update grounded state & zero velocities on collision
    if (intendedDy < 0 && adjustedDy > intendedDy) {
      this.player.isGrounded = true;
      this.player.velocity.y = 0;
    } else if (intendedDy > 0 && adjustedDy < intendedDy) {
      this.player.velocity.y = 0;
    } else {
      this.player.isGrounded = this.checkGrounded(hw);
    }

    if (Math.abs(adjustedDx - intendedDx) > 0.00001) {
      this.player.velocity.x = 0;
    }
    if (Math.abs(adjustedDz - intendedDz) > 0.00001) {
      this.player.velocity.z = 0;
    }
  }

  private checkGrounded(hw: number): boolean {
    const footY = Math.floor(this.player.position.y - 0.05);
    const minX = Math.floor(this.player.position.x - hw + 0.05);
    const maxX = Math.floor(this.player.position.x + hw - 0.05);
    const minZ = Math.floor(this.player.position.z - hw + 0.05);
    const maxZ = Math.floor(this.player.position.z + hw - 0.05);

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const b = this.world.getBlock(x, footY, z);
        if (b !== 0 && b !== 7) return true;
      }
    }
    return false;
  }
}
