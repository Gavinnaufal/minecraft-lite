import * as THREE from 'three';
import type { World } from '../world/World';
import type { Player } from '../player/Player';
import type { MobManager } from './MobManager';
import { getBlockById } from '../world/BlockRegistry';

export class Mob {
  mesh: THREE.Object3D;
  health = 10;
  position: THREE.Vector3;
  velocity = new THREE.Vector3();
  isGrounded = false;
  isHostile = false;
  width = 0.8;
  height = 1.4;
  private hitFlashTimer = 0;
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

  constructor(position: THREE.Vector3, color: number) {
    this.position = position.clone();
    const geo = new THREE.BoxGeometry(this.width, this.height, this.width);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
  }

  reset(position: THREE.Vector3, maxHealth = 10): void {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.health = maxHealth;
    this.isGrounded = false;
    this.mesh.position.copy(position);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(deltaTime: number, world?: World, _playerPos?: THREE.Vector3, _player?: Player, _mobManager?: MobManager, _camera?: THREE.PerspectiveCamera): void {
    this.updatePhysics(deltaTime, world);
  }

  protected updatePhysics(deltaTime: number, world?: World): void {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaTime;
      if (this.hitFlashTimer <= 0) {
        this.resetMaterials();
      }
    }

    if (!world) {
      this.position.y = Math.max(0, this.position.y);
      this.mesh.position.copy(this.position);
      return;
    }

    const hw = this.width / 2;
    const cx = Math.floor(this.position.x);
    const cz = Math.floor(this.position.z);
    const footY = Math.floor(this.position.y);
    const bodyY = Math.floor(this.position.y + 0.5);

    const inWater = world.getBlock(cx, footY, cz) === 7 || world.getBlock(cx, bodyY, cz) === 7;

    if (inWater) {
      this.velocity.y = Math.min(this.velocity.y + 20 * deltaTime, 2.5);
      this.isGrounded = false;
    } else {
      this.velocity.y += -29.4 * deltaTime;
    }

    // ── 1. Move & resolve Y ──
    this.position.y += this.velocity.y * deltaTime;

    if (this.velocity.y <= 0) {
      // Falling — check blocks under feet
      const checkY = Math.floor(this.position.y);
      if (this.mobHasBlockBelow(world, checkY, hw)) {
        this.position.y = checkY + 1;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    } else {
      // Rising — check blocks above head
      this.isGrounded = false;
      const headY = Math.floor(this.position.y + this.height);
      if (this.mobHasBlockAt(world, headY, hw)) {
        this.position.y = headY - this.height;
        this.velocity.y = 0;
      }
    }

    // ── 2. Move & resolve X ──
    const prevX = this.position.x;
    this.position.x += this.velocity.x * deltaTime;

    if (this.mobHasBodyCollision(world, hw)) {
      // Check if it's a 1-block step with open headroom above
      if (this.isGrounded && this.canMobJumpOver(world, prevX, this.position.z, hw)) {
        this.position.x = prevX;
        this.velocity.y = 7.5; // Jump over 1-block step
        this.isGrounded = false;
      } else {
        // Blocked by 2+ tall wall or ceiling! Strictly hold mob back!
        this.position.x = prevX;
        this.velocity.x = 0;
      }
    }

    // ── 3. Move & resolve Z ──
    const prevZ = this.position.z;
    this.position.z += this.velocity.z * deltaTime;

    if (this.mobHasBodyCollision(world, hw)) {
      if (this.isGrounded && this.canMobJumpOver(world, this.position.x, prevZ, hw)) {
        this.position.z = prevZ;
        this.velocity.y = 7.5; // Jump over 1-block step
        this.isGrounded = false;
      } else {
        // Blocked by 2+ tall wall or ceiling! Strictly hold mob back!
        this.position.z = prevZ;
        this.velocity.z = 0;
      }
    }

    this.velocity.x *= 0.85;
    this.velocity.z *= 0.85;

    this.mesh.position.copy(this.position);
  }

  /** Check if any solid block is under the mob's footprint at the given Y. */
  private mobHasBlockBelow(world: World, checkY: number, hw: number): boolean {
    const minX = Math.floor(this.position.x - hw + 0.05);
    const maxX = Math.floor(this.position.x + hw - 0.05);
    const minZ = Math.floor(this.position.z - hw + 0.05);
    const maxZ = Math.floor(this.position.z + hw - 0.05);

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const b = world.getBlock(x, checkY, z);
        if (b !== 0 && getBlockById(b)?.solid) return true;
      }
    }
    return false;
  }

  /** Check if any solid block is at the given Y across the mob's footprint. */
  private mobHasBlockAt(world: World, checkY: number, hw: number): boolean {
    return this.mobHasBlockBelow(world, checkY, hw);
  }

  /** Check if the mob's body (from feet+0.1 to head−0.1) overlaps any solid block. */
  private mobHasBodyCollision(world: World, hw: number): boolean {
    const minX = Math.floor(this.position.x - hw);
    const maxX = Math.floor(this.position.x + hw);
    const minY = Math.floor(this.position.y + 0.1);
    const maxY = Math.floor(this.position.y + this.height - 0.1);
    const minZ = Math.floor(this.position.z - hw);
    const maxZ = Math.floor(this.position.z + hw);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          const b = world.getBlock(x, y, z);
          if (b !== 0 && getBlockById(b)?.solid) return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a hurdle ahead is strictly a 1-block step with clear headroom above.
   * If wall is 2+ blocks tall or headroom is blocked, returns false (mob stays blocked).
   */
  private canMobJumpOver(world: World, x: number, z: number, hw: number): boolean {
    const footY = Math.floor(this.position.y);
    const headY1 = footY + 2; // Block level 2 above feet
    const headY2 = footY + 3; // Block level 3 above feet

    const minX = Math.floor(x - hw + 0.05);
    const maxX = Math.floor(x + hw - 0.05);
    const minZ = Math.floor(z - hw + 0.05);
    const maxZ = Math.floor(z + hw - 0.05);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const bHead1 = world.getBlock(cx, headY1, cz);
        const bHead2 = world.getBlock(cx, headY2, cz);
        // If 2nd block height or ceiling is solid, cannot jump over!
        if ((bHead1 !== 0 && getBlockById(bHead1)?.solid) || (bHead2 !== 0 && getBlockById(bHead2)?.solid)) {
          return false;
        }
      }
    }
    return true;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.triggerRedFlash();
    return this.health <= 0;
  }

  applyKnockback(direction: THREE.Vector3, force = 6.0): void {
    const horizDir = direction.clone();
    horizDir.y = 0;
    if (horizDir.lengthSq() > 0.001) {
      horizDir.normalize();
    }
    this.velocity.x = horizDir.x * force;
    this.velocity.z = horizDir.z * force;
    this.velocity.y = 3.5;
    this.isGrounded = false;
  }

  private triggerRedFlash(): void {
    if (this.hitFlashTimer <= 0) {
      this.originalMaterials.clear();
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.originalMaterials.set(child, child.material);
          child.material = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xaa0000 });
        }
      });
    }
    this.hitFlashTimer = 0.2;
  }

  private resetMaterials(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && this.originalMaterials.has(child)) {
        child.material = this.originalMaterials.get(child)!;
      }
    });
    this.originalMaterials.clear();
  }
}
