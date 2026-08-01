import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Spider extends Mob {
  private stateMachine = new StateMachine();
  private legs: THREE.Mesh[] = [];
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0x1b1b1b);
    this.health = 16;
    this.isHostile = true;

    // Create 3D Compound Group Mesh for 8-Legged Spider
    const spiderGroup = new THREE.Group();

    // 1. Head / Cephalothorax (Dark Charcoal/Black)
    const headGeo = new THREE.BoxGeometry(0.65, 0.45, 0.55);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.4, 0.3);
    spiderGroup.add(headMesh);

    // 2. Red Glowing Eyes (4 frontal dots)
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xcc0000 });

    const eyeL1 = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL1.position.set(-0.18, 0.42, 0.58);
    const eyeL2 = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL2.position.set(-0.06, 0.42, 0.58);
    const eyeR1 = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR1.position.set(0.06, 0.42, 0.58);
    const eyeR2 = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR2.position.set(0.18, 0.42, 0.58);

    spiderGroup.add(eyeL1);
    spiderGroup.add(eyeL2);
    spiderGroup.add(eyeR1);
    spiderGroup.add(eyeR2);

    // 3. Abdomen (Large rear body)
    const abdoGeo = new THREE.BoxGeometry(0.85, 0.65, 0.95);
    const abdoMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });
    const abdoMesh = new THREE.Mesh(abdoGeo, abdoMat);
    abdoMesh.position.set(0, 0.5, -0.45);
    spiderGroup.add(abdoMesh);

    // 4. 8 Articulated Legs (4 left, 4 right)
    const legGeo = new THREE.BoxGeometry(0.65, 0.1, 0.1);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x212121 });

    for (let i = 0; i < 4; i++) {
      const zOffset = 0.45 - i * 0.28;

      // Left Leg
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.6, 0.35, zOffset);
      legL.rotation.z = 0.25; // Angle outward
      spiderGroup.add(legL);
      this.legs.push(legL);

      // Right Leg
      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.6, 0.35, zOffset);
      legR.rotation.z = -0.25; // Angle outward
      spiderGroup.add(legR);
      this.legs.push(legR);
    }

    this.mesh = spiderGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 16);
    this.isHostile = true;
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist3D);

      if (state === State.Chase || dist3D < 14) {
        const dx = playerPos.x - this.position.x;
        const dz = playerPos.z - this.position.z;
        const horizDist = Math.sqrt(dx * dx + dz * dz);

        if (horizDist > 0.001) {
          const chaseSpeed = 3.4; // Fast spider chase
          this.velocity.x = (dx / horizDist) * chaseSpeed;
          this.velocity.z = (dz / horizDist) * chaseSpeed;
          this.mesh.rotation.y = Math.atan2(dx, dz);
          isMoving = true;
        }
      } else if (state === State.Wander) {
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

    // 8-Leg Scuttling Crawl Animation
    if (isMoving) {
      this.animTimer += deltaTime * 14;
      for (let i = 0; i < this.legs.length; i++) {
        const phase = i % 2 === 0 ? 1 : -1;
        const legSwing = Math.sin(this.animTimer + i * 0.5) * 0.35 * phase;
        this.legs[i].rotation.y = legSwing;
      }
    } else {
      for (let i = 0; i < this.legs.length; i++) {
        this.legs[i].rotation.y = 0;
      }
    }

    this.updatePhysics(deltaTime, world);
  }
}
