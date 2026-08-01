import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Turtle extends Mob {
  private stateMachine = new StateMachine();
  private flipperFL: THREE.Mesh;
  private flipperFR: THREE.Mesh;
  private flipperBL: THREE.Mesh;
  private flipperBR: THREE.Mesh;
  private animTimer = 0;
  isSwimming = false;

  constructor(position: THREE.Vector3) {
    super(position, 0x2e7d32);
    this.health = 30;
    this.width = 0.9;
    this.height = 0.45;
    this.isHostile = false;

    // Create 3D Compound Group Mesh for Turtle (Low Shell & Flippers)
    const turtleGroup = new THREE.Group();

    // 1. Turtle Shell (Dark Green Box)
    const shellGeo = new THREE.BoxGeometry(0.9, 0.35, 1.1);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(0, 0.25, 0);
    turtleGroup.add(shellMesh);

    // Shell Ridge Trim
    const trimGeo = new THREE.BoxGeometry(0.95, 0.08, 1.15);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 0.12, 0);
    turtleGroup.add(trimMesh);

    // 2. Head
    const headGeo = new THREE.BoxGeometry(0.32, 0.22, 0.32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.22, 0.65);
    turtleGroup.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 0.25, 0.8);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.12, 0.25, 0.8);
    turtleGroup.add(eyeL);
    turtleGroup.add(eyeR);

    // 3. 4 Flippers (Front long, Back short)
    const flipperFrontGeo = new THREE.BoxGeometry(0.35, 0.08, 0.35);
    const flipperBackGeo = new THREE.BoxGeometry(0.25, 0.08, 0.25);
    const flipperMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });

    this.flipperFL = new THREE.Mesh(flipperFrontGeo, flipperMat);
    this.flipperFL.position.set(-0.55, 0.1, 0.4);
    this.flipperFR = new THREE.Mesh(flipperFrontGeo, flipperMat);
    this.flipperFR.position.set(0.55, 0.1, 0.4);

    this.flipperBL = new THREE.Mesh(flipperBackGeo, flipperMat);
    this.flipperBL.position.set(-0.5, 0.1, -0.4);
    this.flipperBR = new THREE.Mesh(flipperBackGeo, flipperMat);
    this.flipperBR.position.set(0.5, 0.1, -0.4);

    turtleGroup.add(this.flipperFL);
    turtleGroup.add(this.flipperFR);
    turtleGroup.add(this.flipperBL);
    turtleGroup.add(this.flipperBR);

    this.mesh = turtleGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 30);
    this.isHostile = false;
    this.isSwimming = false;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;

    // Check if submerged in water
    if (world) {
      const currentBlock = world.getBlock(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z));
      this.isSwimming = (currentBlock === 7);
    }

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (state === State.Wander) {
        const speed = this.isSwimming ? 2.2 : 0.8; // Slow crawl on land, fast in water
        const wanderDx = (Math.random() - 0.5) * speed;
        const wanderDz = (Math.random() - 0.5) * speed;

        this.velocity.x = wanderDx;
        this.velocity.z = wanderDz;
        isMoving = Math.abs(wanderDx) > 0.001 || Math.abs(wanderDz) > 0.001;

        if (isMoving) {
          this.mesh.rotation.y = Math.atan2(wanderDx, wanderDz);
        }
      }
    }

    // Flipper Crawl / Swim Animation
    if (isMoving) {
      const animSpeed = this.isSwimming ? 10 : 5;
      this.animTimer += deltaTime * animSpeed;
      const flipperSwing = Math.sin(this.animTimer) * 0.5;

      this.flipperFL.rotation.y = flipperSwing;
      this.flipperFR.rotation.y = -flipperSwing;
      this.flipperBL.rotation.y = -flipperSwing;
      this.flipperBR.rotation.y = flipperSwing;
    } else {
      this.flipperFL.rotation.y = 0;
      this.flipperFR.rotation.y = 0;
      this.flipperBL.rotation.y = 0;
      this.flipperBR.rotation.y = 0;
    }

    // Seagrass eating in water & beach egg laying at night
    if (this.isSwimming) {
      this.health = Math.min(30, this.health + deltaTime * 0.2); // Regeneration from eating seagrass
    }

    this.updatePhysics(deltaTime, world);
  }
}
