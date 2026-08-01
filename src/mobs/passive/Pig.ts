import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Pig extends Mob {
  private stateMachine = new StateMachine();
  private legFL: THREE.Mesh;
  private legFR: THREE.Mesh;
  private legBL: THREE.Mesh;
  private legBR: THREE.Mesh;
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0xffb6c1);
    this.health = 10;
    this.width = 0.8;
    this.height = 0.95;
    this.isHostile = false;

    // Create 3D Compound Group Mesh for Pig
    const pigGroup = new THREE.Group();

    // 1. Body (Pink Box)
    const bodyGeo = new THREE.BoxGeometry(0.8, 0.7, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.65, 0);
    pigGroup.add(bodyMesh);

    // 2. Head & Snout
    const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.8, 0.65);
    pigGroup.add(headMesh);

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.3, 0.2, 0.12);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1 });
    const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
    snoutMesh.position.set(0, 0.72, 0.95);
    pigGroup.add(snoutMesh);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 0.86, 0.93);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.2, 0.86, 0.93);
    pigGroup.add(eyeL);
    pigGroup.add(eyeR);

    // 3. 4 Short Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.35, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xffa4b6 });

    this.legFL = new THREE.Mesh(legGeo, legMat);
    this.legFL.position.set(-0.25, 0.175, 0.35);
    this.legFR = new THREE.Mesh(legGeo, legMat);
    this.legFR.position.set(0.25, 0.175, 0.35);
    this.legBL = new THREE.Mesh(legGeo, legMat);
    this.legBL.position.set(-0.25, 0.175, -0.35);
    this.legBR = new THREE.Mesh(legGeo, legMat);
    this.legBR.position.set(0.25, 0.175, -0.35);

    pigGroup.add(this.legFL);
    pigGroup.add(this.legFR);
    pigGroup.add(this.legBL);
    pigGroup.add(this.legBR);

    this.mesh = pigGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 10);
    this.isHostile = false;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (state === State.Wander) {
        const wanderDx = (Math.random() - 0.5) * 1.5;
        const wanderDz = (Math.random() - 0.5) * 1.5;
        const nextX = this.position.x + wanderDx * deltaTime;
        const nextZ = this.position.z + wanderDz * deltaTime;

        // Water avoidance
        const nextBlock = world?.getBlock(Math.floor(nextX), Math.floor(this.position.y), Math.floor(nextZ));
        if (nextBlock !== 7) {
          this.velocity.x = wanderDx;
          this.velocity.z = wanderDz;
          isMoving = Math.abs(wanderDx) > 0.001 || Math.abs(wanderDz) > 0.001;

          if (isMoving) {
            this.mesh.rotation.y = Math.atan2(wanderDx, wanderDz);
          }
        } else {
          this.velocity.x = 0;
          this.velocity.z = 0;
        }
      }
    }

    // 4-Leg Trot Animation
    if (isMoving) {
      this.animTimer += deltaTime * 8;
      const swing = Math.sin(this.animTimer) * 0.4;
      this.legFL.rotation.x = swing;
      this.legBR.rotation.x = swing;
      this.legFR.rotation.x = -swing;
      this.legBL.rotation.x = -swing;
    } else {
      this.legFL.rotation.x = 0;
      this.legFR.rotation.x = 0;
      this.legBL.rotation.x = 0;
      this.legBR.rotation.x = 0;
    }

    this.updatePhysics(deltaTime, world);
  }
}
