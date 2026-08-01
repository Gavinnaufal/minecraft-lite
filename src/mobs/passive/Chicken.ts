import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Chicken extends Mob {
  private stateMachine = new StateMachine();
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0xffffff);
    this.health = 4;
    this.width = 0.5;
    this.height = 0.7;
    this.isHostile = false;

    // Create 3D Compound Group Mesh for Small Chicken
    const chickGroup = new THREE.Group();

    // 1. Body (White Box)
    const bodyGeo = new THREE.BoxGeometry(0.45, 0.45, 0.55);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.4, 0);
    chickGroup.add(bodyMesh);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.08, 0.3, 0.35);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.25, 0.4, 0);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.25, 0.4, 0);
    chickGroup.add(wingL);
    chickGroup.add(wingR);

    // 2. Head, Beak & Red Wattle
    const headGeo = new THREE.BoxGeometry(0.3, 0.35, 0.3);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.65, 0.25);
    chickGroup.add(headMesh);

    // Yellow Beak
    const beakGeo = new THREE.BoxGeometry(0.18, 0.1, 0.15);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d });
    const beakMesh = new THREE.Mesh(beakGeo, beakMat);
    beakMesh.position.set(0, 0.62, 0.42);
    chickGroup.add(beakMesh);

    // Red Wattle
    const wattleGeo = new THREE.BoxGeometry(0.1, 0.12, 0.08);
    const wattleMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f });
    const wattleMesh = new THREE.Mesh(wattleGeo, wattleMat);
    wattleMesh.position.set(0, 0.51, 0.4);
    chickGroup.add(wattleMesh);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 0.7, 0.39);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.12, 0.7, 0.39);
    chickGroup.add(eyeL);
    chickGroup.add(eyeR);

    // 3. Yellow Thin Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.25, 0.1);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.1, 0.125, 0.02);
    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.1, 0.125, 0.02);

    chickGroup.add(this.legL);
    chickGroup.add(this.legR);

    this.mesh = chickGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 4);
    this.isHostile = false;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (state === State.Wander) {
        const wanderDx = (Math.random() - 0.5) * 1.6;
        const wanderDz = (Math.random() - 0.5) * 1.6;
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

    // Quick leg swing animation
    if (isMoving) {
      this.animTimer += deltaTime * 12;
      const swing = Math.sin(this.animTimer) * 0.45;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
    }

    this.updatePhysics(deltaTime, world);
  }
}
