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
    this.updatePhysics(deltaTime, world);
  }

  protected updatePhysics(deltaTime: number, world?: World): void {
    if (!world) {
      this.position.y = Math.max(0, this.position.y);
      this.mesh.position.copy(this.position);
      return;
    }

    // Gravity
    this.velocity.y += -29.4 * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Terrain ground collision
    const footY = this.position.y;
    const bx = Math.floor(this.position.x);
    const bz = Math.floor(this.position.z);
    const by = Math.floor(footY);

    const blockAtFoot = world.getBlock(bx, by, bz);
    if (blockAtFoot !== 0 && blockAtFoot !== 7) {
      this.position.y = by + 1;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
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
    return this.health <= 0;
  }
}
