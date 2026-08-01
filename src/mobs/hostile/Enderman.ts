import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Enderman extends Mob {
  private stateMachine = new StateMachine();
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private enderParticles: THREE.Mesh[] = [];
  private animTimer = 0;
  private particleTimer = 0;
  isProvoked = false;

  constructor(position: THREE.Vector3) {
    super(position, 0x111111);
    this.health = 40;
    this.width = 0.6;
    this.height = 2.9;
    this.isHostile = false; // Neutral until looked at or attacked

    // Create 3D Compound Group Mesh for Tall Pitch-Black Enderman (~2.9 blocks)
    const enderGroup = new THREE.Group();

    // 1. Head (Pitch Black)
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 2.65, 0);
    enderGroup.add(headMesh);

    // 2. Magenta/Purple Glowing Eyes
    const eyeGeo = new THREE.BoxGeometry(0.38, 0.08, 0.05);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd500f9, emissive: 0xaa00d6 });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.set(0, 2.68, 0.22);
    enderGroup.add(eyeMesh);

    // 3. Slender Torso
    const torsoGeo = new THREE.BoxGeometry(0.35, 0.9, 0.22);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, 1.95, 0);
    enderGroup.add(torsoMesh);

    // 4. Extra Long Thin Arms
    const armGeo = new THREE.BoxGeometry(0.12, 1.45, 0.12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-0.28, 1.5, 0);
    const armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(0.28, 1.5, 0);

    enderGroup.add(armL);
    enderGroup.add(armR);

    // 5. Extra Long Thin Legs
    const legGeo = new THREE.BoxGeometry(0.12, 1.45, 0.12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.14, 0.72, 0);
    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.14, 0.72, 0);

    enderGroup.add(this.legL);
    enderGroup.add(this.legR);

    // 6. Floating Purple Ender Particles
    const pGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xd500f9, emissive: 0xaa00d6 });

    for (let i = 0; i < 8; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 0.9,
        Math.random() * 2.8,
        (Math.random() - 0.5) * 0.9
      );
      enderGroup.add(pMesh);
      this.enderParticles.push(pMesh);
    }

    this.mesh = enderGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 40);
    this.isHostile = false;
    this.isProvoked = false;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (this.isProvoked || state === State.Chase) {
        const dx = playerPos.x - this.position.x;
        const dz = playerPos.z - this.position.z;
        const horizDist = Math.sqrt(dx * dx + dz * dz);

        if (horizDist > 0.001) {
          const chaseSpeed = 3.6;
          this.velocity.x = (dx / horizDist) * chaseSpeed;
          this.velocity.z = (dz / horizDist) * chaseSpeed;
          this.mesh.rotation.y = Math.atan2(dx, dz);
          isMoving = true;
        }
      } else if (state === State.Wander) {
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

    // Long Striding Leg Animation
    if (isMoving) {
      this.animTimer += deltaTime * 7;
      const swing = Math.sin(this.animTimer) * 0.45;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
    }

    // Floating purple Ender particle animation
    this.particleTimer += deltaTime * 3.5;
    for (let i = 0; i < this.enderParticles.length; i++) {
      const p = this.enderParticles[i];
      p.position.y += Math.sin(this.particleTimer + i * 1.2) * 0.006;
      p.rotation.x += deltaTime * 1.5;
      p.rotation.y += deltaTime * 2.0;
    }

    this.updatePhysics(deltaTime, world);
  }
}
