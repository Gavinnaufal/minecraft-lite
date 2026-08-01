import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';

interface ItemDrop {
  mesh: THREE.Mesh;
  itemId: string;
  count: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
}

const ITEM_COLORS: Record<string, number> = {
  grass: 0x55aa33,
  dirt: 0x795548,
  stone: 0x9e9e9e,
  sand: 0xe4c875,
  wood_log: 0x5d4037,
  leaves: 0x2e7d32,
  plank: 0xb18c5d,
  crafting_table: 0x8d6e63,
  sandstone: 0xe0d6b8,
  stick: 0x8d6e63,
  beef: 0xb71c1c,
  rotten_flesh: 0x2e7d32,
  bread: 0xd84315,
  wheat: 0xfbc02d,
  wheat_seeds: 0x81c784,
  chest: 0x8d6e63,
  coal: 0x212121,
  iron_ingot: 0xcfd8dc,
  gold_ingot: 0xffd54f,
  bone: 0xeeeeee,
  arrow: 0x8d6e63,
  string: 0xf5f5f5,
  ender_pearl: 0x00695c,
  raw_porkchop: 0xf48fb1,
};

export class ItemDropManager {
  private scene: THREE.Scene;
  private drops: ItemDrop[] = [];
  private dropGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawnDrop(position: THREE.Vector3, itemId: string, count = 1): void {
    const colorHex = ITEM_COLORS[itemId] ?? 0x9e9e9e;
    const mat = new THREE.MeshStandardMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(this.dropGeo, mat);

    const pos = position.clone();
    mesh.position.copy(pos);

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      2.0 + Math.random() * 1.5,
      (Math.random() - 0.5) * 1.5,
    );

    this.scene.add(mesh);
    this.drops.push({
      mesh,
      itemId,
      count,
      position: pos,
      velocity,
      age: 0,
    });
  }

  update(deltaTime: number, playerPos: THREE.Vector3, onPickup: (itemId: string, count: number) => void): void {
    const time = performance.now() * 0.004;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.age += deltaTime;

      // Rotate 3D drop
      drop.mesh.rotation.y += deltaTime * 3.0;

      // Magnet check towards player
      const dist = drop.position.distanceTo(playerPos);
      if (drop.age > 0.35 && dist < 3.2) {
        // Accelerate magnet swoop pull towards player
        const dir = new THREE.Vector3().subVectors(playerPos, drop.position).normalize();
        const swoopSpeed = 8.0 + (3.2 - dist) * 4.0;
        drop.velocity.lerp(dir.multiplyScalar(swoopSpeed), deltaTime * 10.0);
        drop.mesh.scale.multiplyScalar(0.95);

        if (dist < 0.85) {
          // Pickup
          onPickup(drop.itemId, drop.count);
          AudioManager.getInstance().playSFX('pop');
          this.scene.remove(drop.mesh);
          drop.mesh.geometry.dispose();
          this.drops.splice(i, 1);
          continue;
        }
      } else {
        // Normal Physics
        drop.velocity.y += -15.0 * deltaTime; // Gravity
        drop.velocity.x *= 0.95;
        drop.velocity.z *= 0.95;
      }

      drop.position.addScaledVector(drop.velocity, deltaTime);
      drop.mesh.position.copy(drop.position);
      drop.mesh.position.y += Math.sin(time + i) * 0.003; // Gentle float
    }
  }
}
