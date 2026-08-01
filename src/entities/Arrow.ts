import * as THREE from 'three';
import type { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';

export class Arrow {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isStuck = false;
  lifeTime = 0;
  shooterId?: string;

  constructor(position: THREE.Vector3, direction: THREE.Vector3, speed = 22.0, shooterId?: string) {
    this.position = position.clone();
    this.velocity = direction.clone().normalize().multiplyScalar(speed);
    this.shooterId = shooterId;

    // Create 3D Arrow Mesh
    this.mesh = new THREE.Group();

    // Arrow Shaft (Wood)
    const shaftGeo = new THREE.BoxGeometry(0.04, 0.5, 0.04);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    this.mesh.add(shaftMesh);

    // Arrow Head (Flint/Iron tip)
    const headGeo = new THREE.BoxGeometry(0.08, 0.1, 0.08);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x616161 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.28, 0);
    this.mesh.add(headMesh);

    // Arrow Fletching (White Feathers)
    const featherGeo = new THREE.BoxGeometry(0.1, 0.12, 0.02);
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const featherMesh = new THREE.Mesh(featherGeo, featherMat);
    featherMesh.position.set(0, -0.22, 0);
    this.mesh.add(featherMesh);

    this.mesh.position.copy(this.position);
    this.updateRotation();
  }

  private updateRotation(): void {
    if (this.velocity.lengthSq() > 0.001) {
      const dir = this.velocity.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      this.mesh.quaternion.setFromUnitVectors(up, dir);
    }
  }

  update(deltaTime: number, world?: World): boolean {
    if (this.isStuck) {
      this.lifeTime += deltaTime;
      return this.lifeTime > 8.0; // Despawn stuck arrows after 8 seconds
    }

    this.lifeTime += deltaTime;
    if (this.lifeTime > 10.0) return true; // Max flight time

    // Gravity effect on flight trajectory
    this.velocity.y += -14.0 * deltaTime;

    const nextPos = this.position.clone().addScaledVector(this.velocity, deltaTime);

    // Collision check against solid world blocks
    if (world) {
      const bx = Math.floor(nextPos.x);
      const by = Math.floor(nextPos.y);
      const bz = Math.floor(nextPos.z);

      const blockId = world.getBlock(bx, by, bz);
      if (blockId !== 0 && blockId !== 7 && getBlockById(blockId)?.solid) {
        this.isStuck = true;
        this.velocity.set(0, 0, 0);
        return false;
      }
    }

    this.position.copy(nextPos);
    this.mesh.position.copy(this.position);
    this.updateRotation();

    return false;
  }
}
