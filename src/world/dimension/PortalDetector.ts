import type { World } from '../World';
import { getBlockById } from '../BlockRegistry';

export class PortalDetector {
  /** Detects and fills a 4x5 vertical obsidian portal frame at position (x,y,z). */
  static detectAndIgnitePortal(world: World, x: number, y: number, z: number): boolean {
    // Check X-axis frame orientation (width 4, height 5)
    if (this.checkAndFillFrame(world, x, y, z, 1, 0)) return true;
    // Check Z-axis frame orientation (width 4, height 5)
    if (this.checkAndFillFrame(world, x, y, z, 0, 1)) return true;
    return false;
  }

  private static checkAndFillFrame(world: World, startX: number, startY: number, startZ: number, dirX: number, dirZ: number): boolean {
    const obsidianId = 15;
    const portalId = 18;

    // Scan for lower-left obsidian corner within range
    for (let offsetX = -3; offsetX <= 1; offsetX++) {
      for (let offsetY = -3; offsetY <= 1; offsetY++) {
        const baseX = startX + offsetX * dirX;
        const baseY = startY + offsetY;
        const baseZ = startZ + offsetX * dirZ;

        // Check 4x5 frame template:
        // Base width 4 (dx = 0..3), Height 5 (dy = 0..4)
        let isValid = true;
        for (let dx = 0; dx < 4; dx++) {
          for (let dy = 0; dy < 5; dy++) {
            const px = baseX + dx * dirX;
            const py = baseY + dy;
            const pz = baseZ + dx * dirZ;

            const isBorder = (dx === 0 || dx === 3 || dy === 0 || dy === 4);
            const bId = world.getBlock(px, py, pz);

            if (isBorder) {
              if (bId !== obsidianId && getBlockById(bId)?.name !== 'obsidian') {
                isValid = false;
                break;
              }
            } else {
              if (bId !== 0 && bId !== portalId) {
                isValid = false;
                break;
              }
            }
          }
          if (!isValid) break;
        }

        // Fill inner 2x3 area with portal blocks
        if (isValid) {
          for (let dx = 1; dx <= 2; dx++) {
            for (let dy = 1; dy <= 3; dy++) {
              const px = baseX + dx * dirX;
              const py = baseY + dy;
              const pz = baseZ + dx * dirZ;
              world.setBlock(px, py, pz, portalId);
            }
          }
          return true;
        }
      }
    }
    return false;
  }
}
