import * as THREE from 'three';
import type { World } from '../world/World';
import type { Player } from '../player/Player';

export class Mob {
  mesh: THREE.Object3D;
  health = 10;
  position: THREE.Vector3;
  velocity = new THREE.Vector3();
  isGrounded = false;
  readonly width = 0.8;
  readonly height = 1.4;
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
  update(deltaTime: number, world?: World, _playerPos?: THREE.Vector3, _player?: Player): void {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaTime;
      if (this.hitFlashTimer <= 0) {
        this.resetMaterials();
      }
    }
    this.updatePhysics(deltaTime, world);
  }

  protected updatePhysics(deltaTime: number, world?: World): void {
    if (!world) {
      this.position.y = Math.max(0, this.position.y);
      this.mesh.position.copy(this.position);
      return;
    }

    const bx = Math.floor(this.position.x);
    const bz = Math.floor(this.position.z);
    const footY = Math.floor(this.position.y);
    const bodyY = Math.floor(this.position.y + 0.5);

    const inWater = world.getBlock(bx, footY, bz) === 7 || world.getBlock(bx, bodyY, bz) === 7;

    if (inWater) {
      // Floating / Buoyancy in water
      this.velocity.y = Math.min(this.velocity.y + 25 * deltaTime, 3.0);
      this.isGrounded = false;
    } else {
      // Gravity
      this.velocity.y += -29.4 * deltaTime;
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    this.velocity.x *= 0.85;
    this.velocity.z *= 0.85;

    // Terrain ground collision
    const blockAtFoot = world.getBlock(bx, footY, bz);
    if (blockAtFoot !== 0 && blockAtFoot !== 7) {
      this.position.y = footY + 1;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (!inWater) {
      this.isGrounded = false;
    }

    // Step-up / obstacle jump
    const headY = Math.floor(this.position.y + 0.5);
    const blockAtBody = world.getBlock(bx, headY, bz);
    if (blockAtBody !== 0 && blockAtBody !== 7 && this.isGrounded) {
      this.velocity.y = 7.0;
      this.isGrounded = false;
    }

    this.mesh.position.copy(this.position);
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.triggerRedFlash();
    return this.health <= 0;
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
