import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';
import { AudioManager } from '../../audio/AudioManager';

export class Villager extends Mob {
  private stateMachine = new StateMachine();
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private animTimer = 0;
  private idleSoundTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0x8d5524);
    this.health = 20;

    // Create 3D Compound Group Mesh for Villager NPC
    const villagerGroup = new THREE.Group();

    // 1. Brown Robe (Torso & Coat)
    const robeGeo = new THREE.BoxGeometry(0.6, 0.95, 0.4);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
    const robeMesh = new THREE.Mesh(robeGeo, robeMat);
    robeMesh.position.set(0, 0.9, 0);
    villagerGroup.add(robeMesh);

    // 2. Head (Skin color)
    const headGeo = new THREE.BoxGeometry(0.48, 0.52, 0.48);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xc58c85 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 1.6, 0);
    villagerGroup.add(headMesh);

    // 3. Iconic Big Nose
    const noseGeo = new THREE.BoxGeometry(0.14, 0.28, 0.18);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xb57c75 });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 1.5, 0.32);
    villagerGroup.add(noseMesh);

    // 4. Crossed Arms (Folded in front)
    const armsGeo = new THREE.BoxGeometry(0.62, 0.24, 0.3);
    const armsMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
    const armsMesh = new THREE.Mesh(armsGeo, armsMat);
    armsMesh.position.set(0, 1.05, 0.22);
    villagerGroup.add(armsMesh);

    // 5. 2 Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.5, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.15, 0.25, 0);
    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.15, 0.25, 0);

    villagerGroup.add(this.legL);
    villagerGroup.add(this.legR);

    this.mesh = villagerGroup;
    this.mesh.position.copy(position);
  }

  private villageCenter: THREE.Vector3 | null = null;

  setVillageCenter(center: THREE.Vector3): void {
    this.villageCenter = center.clone();
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 20);
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;
    if (playerPos) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Wander) {
        let dx = (Math.random() - 0.5) * 1.5;
        let dz = (Math.random() - 0.5) * 1.5;

        // If tethered to a village center and wandering too far (> 25 blocks), pull back toward village
        if (this.villageCenter) {
          const distToVillage = this.position.distanceTo(this.villageCenter);
          if (distToVillage > 25) {
            const pullDir = new THREE.Vector3().subVectors(this.villageCenter, this.position).normalize();
            dx = pullDir.x * 1.2;
            dz = pullDir.z * 1.2;
          }
        }

        // Check 3 candidate directions and favor dirt path blocks (blockId === 2)
        let bestDx = dx;
        let bestDz = dz;

        const candidates = [
          { x: dx, z: dz },
          { x: dz, z: -dx },
          { x: -dz, z: dx },
        ];

        for (const cand of candidates) {
          const checkX = Math.floor(this.position.x + cand.x * 1.5);
          const checkY = Math.floor(this.position.y);
          const checkZ = Math.floor(this.position.z + cand.z * 1.5);

          const blockBelow = world?.getBlock(checkX, checkY, checkZ);
          if (blockBelow === 2) { // Dirt path block!
            bestDx = cand.x;
            bestDz = cand.z;
            break;
          }
        }

        const nextX = this.position.x + bestDx * deltaTime;
        const nextZ = this.position.z + bestDz * deltaTime;

        // Water avoidance
        const nextBlock = world?.getBlock(Math.floor(nextX), Math.floor(this.position.y), Math.floor(nextZ));
        if (nextBlock !== 7) {
          this.velocity.x = bestDx;
          this.velocity.z = bestDz;
          isMoving = Math.abs(bestDx) > 0.001 || Math.abs(bestDz) > 0.001;

          if (isMoving) {
            this.mesh.rotation.y = Math.atan2(bestDx, bestDz);
          }
        } else {
          this.velocity.x = 0;
          this.velocity.z = 0;
        }
      }
    }

    // Walking animation
    if (isMoving) {
      this.animTimer += deltaTime * 8;
      const swing = Math.sin(this.animTimer) * 0.4;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
    }

    // Periodic idle/greeting "Hmm" sound effect when player is nearby
    if (playerPos && this.position.distanceTo(playerPos) < 10) {
      this.idleSoundTimer += deltaTime;
      if (this.idleSoundTimer >= 8) {
        this.idleSoundTimer = 0;
        AudioManager.getInstance().playSFX('villager_hmm');
      }
    }

    this.updatePhysics(deltaTime, world);
  }

  override takeDamage(amount: number): boolean {
    AudioManager.getInstance().playSFX('villager_hurt');
    return super.takeDamage(amount);
  }
}
