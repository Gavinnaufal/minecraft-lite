import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';
import { getBlockById } from '../../world/BlockRegistry';
import { AudioManager } from '../../audio/AudioManager';

export class Goat extends Mob {
  private stateMachine = new StateMachine();
  private legFL: THREE.Mesh;
  private legFR: THREE.Mesh;
  private legBL: THREE.Mesh;
  private legBR: THREE.Mesh;
  private animTimer = 0;
  private jumpTimer = 0;
  private soundTimer = 5 + Math.random() * 7;

  constructor(position: THREE.Vector3) {
    super(position, 0xf5f5dc);
    this.health = 10;
    this.width = 0.8;
    this.height = 1.1;
    this.isHostile = false;

    // Create 3D Compound Group Mesh for Goat with Horns
    const goatGroup = new THREE.Group();

    // 1. Fur Body (Cream White Box)
    const bodyGeo = new THREE.BoxGeometry(0.75, 0.75, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.7, 0);
    goatGroup.add(bodyMesh);

    // 2. Head & Horns
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xefefd0 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.9, 0.65);
    goatGroup.add(headMesh);

    // Dark Curved Horns
    const hornGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x424242 });
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(-0.18, 1.25, 0.55);
    hornL.rotation.x = -0.3;
    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.18, 1.25, 0.55);
    hornR.rotation.x = -0.3;

    goatGroup.add(hornL);
    goatGroup.add(hornR);

    // Beard
    const beardGeo = new THREE.BoxGeometry(0.18, 0.25, 0.18);
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xe0e0c0 });
    const beardMesh = new THREE.Mesh(beardGeo, beardMat);
    beardMesh.position.set(0, 0.55, 0.82);
    goatGroup.add(beardMesh);

    // 3. 4 Legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });

    this.legFL = new THREE.Mesh(legGeo, legMat);
    this.legFL.position.set(-0.25, 0.2, 0.35);
    this.legFR = new THREE.Mesh(legGeo, legMat);
    this.legFR.position.set(0.25, 0.2, 0.35);
    this.legBL = new THREE.Mesh(legGeo, legMat);
    this.legBL.position.set(-0.25, 0.2, -0.35);
    this.legBR = new THREE.Mesh(legGeo, legMat);
    this.legBR.position.set(0.25, 0.2, -0.35);

    goatGroup.add(this.legFL);
    goatGroup.add(this.legFR);
    goatGroup.add(this.legBL);
    goatGroup.add(this.legBR);

    this.mesh = goatGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 10);
    this.isHostile = false;
    this.animTimer = 0;
    this.jumpTimer = 0;
    this.soundTimer = 5 + Math.random() * 7;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;
    this.jumpTimer += deltaTime;

    this.soundTimer -= deltaTime;
    if (this.soundTimer <= 0) {
      this.soundTimer = 9 + Math.random() * 10;
      AudioManager.getInstance().playSFX('goat_baa');
    }

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (state === State.Wander) {
        const wanderDx = (Math.random() - 0.5) * 1.8;
        const wanderDz = (Math.random() - 0.5) * 1.8;
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

    // Mountain Climbing Super Jump when encountering steep terrain
    if (world && isMoving && this.isGrounded && this.jumpTimer > 2.0) {
      const moveDirX = this.velocity.x !== 0 ? Math.sign(this.velocity.x) : 0;
      const moveDirZ = this.velocity.z !== 0 ? Math.sign(this.velocity.z) : 0;
      const checkX = Math.floor(this.position.x + moveDirX * 0.6);
      const checkY = Math.floor(this.position.y + 0.5);
      const checkZ = Math.floor(this.position.z + moveDirZ * 0.6);

      const frontBlock = world.getBlock(checkX, checkY, checkZ);
      if (frontBlock !== 0 && frontBlock !== 7 && getBlockById(frontBlock)?.solid) {
        this.velocity.y = 8.5; // Mountain goat high jump
        this.isGrounded = false;
        this.jumpTimer = 0;
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
