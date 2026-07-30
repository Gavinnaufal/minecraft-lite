import type { Player } from './Player';
import type { World } from '../world/World';

export class PlayerCollision {
  private readonly player: Player;
  private readonly world: World;

  constructor(player: Player, world: World) {
    this.player = player;
    this.world = world;
  }

  checkAndResolve(): void {
    const bb = this.player.getAABB();

    // Check ground
    this.player.isGrounded = false;
    const footY = this.player.position.y;
    const checkX = Math.floor(this.player.position.x);
    const checkZ = Math.floor(this.player.position.z);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const wx = checkX + dx;
        const wz = checkZ + dz;
        if (this.world.getBlock(wx, Math.floor(footY - 0.01), wz) !== 0) {
          this.player.isGrounded = true;
        }
      }
    }

    // Resolve Y (vertical)
    this.resolveAxis('y', bb);

    // Resolve X
    this.resolveAxis('x', bb);

    // Resolve Z
    this.resolveAxis('z', bb);
  }

  private resolveAxis(axis: 'x' | 'y' | 'z', _bb: ReturnType<Player['getAABB']>): void {
    const bb = this.player.getAABB();

    const minCheck = axis === 'y' ? Math.floor(bb.minY) : axis === 'x' ? Math.floor(bb.minX) : Math.floor(bb.minZ);
    const maxCheck = axis === 'y' ? Math.ceil(bb.maxY) : axis === 'x' ? Math.ceil(bb.maxX) : Math.ceil(bb.maxZ);

    for (let c = minCheck; c <= maxCheck; c++) {
      const push = this.checkBlock(bb, c, axis);
      if (push !== 0) {
        if (axis === 'x') this.player.position.x += push;
        else if (axis === 'y') { this.player.position.y += push; if (push > 0) this.player.velocity.y = 0; }
        else this.player.position.z += push;
        return;
      }
    }
  }

  private checkBlock(bb: ReturnType<Player['getAABB']>, coord: number, axis: 'x' | 'y' | 'z'): number {
    const bx = axis === 'x' ? coord : Math.floor(this.player.position.x);
    const by = axis === 'y' ? coord : Math.floor(bb.minY);
    const bz = axis === 'z' ? coord : Math.floor(this.player.position.z);

    const blockId = this.world.getBlock(bx, by, bz);
    if (blockId === 0) return 0;

    const blockMinX = bx, blockMaxX = bx + 1;
    const blockMinY = by, blockMaxY = by + 1;
    const blockMinZ = bz, blockMaxZ = bz + 1;

    // Check overlap
    if (bb.maxX <= blockMinX || bb.minX >= blockMaxX) return 0;
    if (bb.maxY <= blockMinY || bb.minY >= blockMaxY) return 0;
    if (bb.maxZ <= blockMinZ || bb.minZ >= blockMaxZ) return 0;

    // Push out
    if (axis === 'x') return bb.maxX - blockMinX < blockMaxX - bb.minX ? blockMinX - bb.maxX : blockMaxX - bb.minX;
    if (axis === 'y') return bb.maxY - blockMinY < blockMaxY - bb.minY ? blockMinY - bb.maxY : blockMaxY - bb.minY;
    return bb.maxZ - blockMinZ < blockMaxZ - bb.minZ ? blockMinZ - bb.maxZ : blockMaxZ - bb.minZ;
  }
}
