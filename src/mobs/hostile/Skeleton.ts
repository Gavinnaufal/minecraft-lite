import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Skeleton extends Mob {
  private stateMachine = new StateMachine();
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private armR: THREE.Mesh;
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0xe0e0e0);
    this.health = 20;
    this.isHostile = true;

    // Create 3D Compound Group Mesh for Skeleton
    const skelGroup = new THREE.Group();

    // 1. Head (Bone White)
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 1.55, 0);
    skelGroup.add(headMesh);

    // Dark Eye Sockets
    const eyeGeo = new THREE.BoxGeometry(0.35, 0.12, 0.05);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.set(0, 1.58, 0.22);
    skelGroup.add(eyeMesh);

    // 2. Ribcage / Torso (Slender Bone)
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.85, 0.22);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, 0.9, 0);
    skelGroup.add(torsoMesh);

    // 3. Thin Bone Arms
    const armGeo = new THREE.BoxGeometry(0.14, 0.82, 0.14);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd6d6d6 });

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-0.32, 0.9, 0);
    skelGroup.add(armL);

    // Right Arm (Aims Bow Forward)
    this.armR = new THREE.Mesh(armGeo, armMat);
    this.armR.position.set(0.32, 0.9, 0.2);
    this.armR.rotation.x = -Math.PI / 2.5; // Aim forward
    skelGroup.add(this.armR);

    // 4. Wood Bow Mesh in Right Hand
    const bowGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const bowMesh = new THREE.Mesh(bowGeo, bowMat);
    bowMesh.position.set(0.32, 0.9, 0.55);
    skelGroup.add(bowMesh);

    // 5. Thin Bone Legs
    const legGeo = new THREE.BoxGeometry(0.15, 0.85, 0.15);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xd6d6d6 });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.15, 0.42, 0);
    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.15, 0.42, 0);

    skelGroup.add(this.legL);
    skelGroup.add(this.legR);

    this.mesh = skelGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 20);
    this.isHostile = true;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;
    if (playerPos) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Wander) {
        const dx = (Math.random() - 0.5) * 1.5;
        const dz = (Math.random() - 0.5) * 1.5;
        const nextX = this.position.x + dx * deltaTime;
        const nextZ = this.position.z + dz * deltaTime;

        // Water avoidance
        const nextBlock = world?.getBlock(Math.floor(nextX), Math.floor(this.position.y), Math.floor(nextZ));
        if (nextBlock !== 7) {
          this.velocity.x = dx;
          this.velocity.z = dz;
          isMoving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;

          if (isMoving) {
            this.mesh.rotation.y = Math.atan2(dx, dz);
          }
        } else {
          this.velocity.x = 0;
          this.velocity.z = 0;
        }
      }
    }

    // Bone Leg Walk Animation
    if (isMoving) {
      this.animTimer += deltaTime * 8;
      const swing = Math.sin(this.animTimer) * 0.4;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
    }

    this.updatePhysics(deltaTime, world);
  }
}
