import * as THREE from 'three';

export class Mob {
  mesh: THREE.Mesh;
  health = 10;
  position: THREE.Vector3;

  constructor(position: THREE.Vector3, color: number) {
    this.position = position.clone();
    const geo = new THREE.BoxGeometry(1, 1.5, 1);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
  }

  update(_deltaTime: number, _playerPos?: import('three').Vector3): void {}

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }
}
