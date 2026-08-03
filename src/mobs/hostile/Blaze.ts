import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { Player } from '../../player/Player';
import type { World } from '../../world/World';
import { ProjectileManager } from '../../entities/ProjectileManager';
import { AudioManager } from '../../audio/AudioManager';

export class Blaze extends Mob {
  private stateMachine = new StateMachine();
  private attackTimer = 0;
  private animTimer = 0;
  private rods: THREE.Mesh[] = [];

  constructor(position: THREE.Vector3) {
    super(position, 0xffb300);
    this.health = 20;
    this.isHostile = true;
    this.isFlying = true;

    // Create 3D Blaze Compound Group Mesh
    const blazeGroup = new THREE.Group();

    // Core Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xff8f00, emissive: 0xff6f00, emissiveIntensity: 0.5 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.9, 0);
    blazeGroup.add(headMesh);

    // 12 Floating Rods
    const rodGeo = new THREE.BoxGeometry(0.12, 0.6, 0.12);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xffca28 });
    for (let i = 0; i < 12; i++) {
      const rod = new THREE.Mesh(rodGeo, rodMat);
      blazeGroup.add(rod);
      this.rods.push(rod);
    }

    this.mesh = blazeGroup;
    this.mesh.position.copy(position);
  }

  override update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, player?: Player): void {
    this.updatePhysics(deltaTime, world);
    this.animTimer += deltaTime * 3.0;

    // Animate floating rods in spinning orbits
    for (let i = 0; i < this.rods.length; i++) {
      const angle = this.animTimer + (i * Math.PI * 2) / 12;
      const radius = 0.5 + Math.sin(this.animTimer * 2 + i) * 0.1;
      const layerY = 0.3 + (i % 3) * 0.4 + Math.sin(angle) * 0.08;
      this.rods[i].position.set(Math.cos(angle) * radius, layerY, Math.sin(angle) * radius);
    }

    if (playerPos && player && player.health > 0) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Chase || dist < 16) {
        // Fly towards player keeping height overhead
        const targetY = playerPos.y + 2.5;
        const dir = new THREE.Vector3().subVectors(playerPos, this.position);
        dir.y = targetY - this.position.y;
        dir.normalize();

        this.velocity.x = dir.x * 3.0;
        this.velocity.y = dir.y * 2.0;
        this.velocity.z = dir.z * 3.0;

        // Attack state: shoot fireballs
        this.attackTimer += deltaTime;
        if (this.attackTimer >= 3.0) {
          this.attackTimer = 0;
          const shootDir = playerPos.clone().add(new THREE.Vector3(0, 0.8, 0)).sub(this.position).normalize();
          const spawnPos = this.position.clone().add(new THREE.Vector3(0, 0.8, 0));
          ProjectileManager.getInstance().spawnFireball(spawnPos, shootDir, 14.0, false);
          AudioManager.getInstance().playSFX('pop');
        }
      }
    }
  }
}
