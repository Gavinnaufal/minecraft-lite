import * as THREE from 'three';
import type { World } from '../world/World';
import { getBlockById } from '../world/BlockRegistry';

export class Fireball {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifeTime = 0;
  maxLifeTime = 8.0;
  shouldRemove = false;
  isExplosive = false;
  damage = 4.0;

  constructor(position: THREE.Vector3, direction: THREE.Vector3, speed = 14.0, isExplosive = false) {
    this.position = position.clone();
    this.velocity = direction.clone().normalize().multiplyScalar(speed);
    this.isExplosive = isExplosive;
    this.damage = isExplosive ? 7.0 : 4.0;

    const size = isExplosive ? 0.6 : 0.35;
    const geo = new THREE.SphereGeometry(size, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: isExplosive ? 0xff3d00 : 0xffa000,
      emissive: isExplosive ? 0xdd2c00 : 0xff6d00,
      emissiveIntensity: 0.8,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
  }

  update(deltaTime: number, world?: World): void {
    if (this.shouldRemove) return;
    this.lifeTime += deltaTime;
    if (this.lifeTime >= this.maxLifeTime) {
      this.shouldRemove = true;
      return;
    }

    this.position.addScaledVector(this.velocity, deltaTime);
    this.mesh.position.copy(this.position);

    if (world) {
      const bx = Math.floor(this.position.x);
      const by = Math.floor(this.position.y);
      const bz = Math.floor(this.position.z);
      const blockId = world.getBlock(bx, by, bz);
      const blockData = getBlockById(blockId);
      if (blockData && blockData.solid) {
        this.shouldRemove = true;
      }
    }
  }
}
