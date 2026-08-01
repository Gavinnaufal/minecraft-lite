import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class IronGolem extends Mob {
  private stateMachine = new StateMachine();
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0xd0d0d0);
    this.health = 100; // Tanky 100 HP

    // Create 3D Compound Group Mesh for Iron Golem (~2.7 blocks tall)
    const golemGroup = new THREE.Group();

    // 1. Broad Chest / Torso
    const chestGeo = new THREE.BoxGeometry(1.2, 1.0, 0.7);
    const chestMat = new THREE.MeshStandardMaterial({ color: 0xcfcfcf });
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.set(0, 1.7, 0);
    golemGroup.add(chestMesh);

    // 2. Green Vines / Moss Accent on Chest
    const vineGeo = new THREE.BoxGeometry(0.6, 0.4, 0.72);
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
    const vineMesh = new THREE.Mesh(vineGeo, vineMat);
    vineMesh.position.set(0.2, 1.7, 0);
    golemGroup.add(vineMesh);

    // 3. Waist / Abdomen
    const waistGeo = new THREE.BoxGeometry(0.7, 0.4, 0.5);
    const waistMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
    const waistMesh = new THREE.Mesh(waistGeo, waistMat);
    waistMesh.position.set(0, 1.1, 0);
    golemGroup.add(waistMesh);

    // 4. Head
    const headGeo = new THREE.BoxGeometry(0.45, 0.55, 0.45);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 2.45, 0.05);
    golemGroup.add(headMesh);

    // 5. Golem Nose
    const noseGeo = new THREE.BoxGeometry(0.12, 0.25, 0.15);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 2.35, 0.32);
    golemGroup.add(noseMesh);

    // 6. Long Arms (Hanging down to knees)
    const armGeo = new THREE.BoxGeometry(0.32, 1.35, 0.32);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5 });

    this.armL = new THREE.Mesh(armGeo, armMat);
    this.armL.position.set(-0.76, 1.5, 0);
    this.armR = new THREE.Mesh(armGeo, armMat);
    this.armR.position.set(0.76, 1.5, 0);

    golemGroup.add(this.armL);
    golemGroup.add(this.armR);

    // 7. Thick Legs
    const legGeo = new THREE.BoxGeometry(0.35, 0.85, 0.35);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x78909c });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.25, 0.43, 0);
    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.25, 0.43, 0);

    golemGroup.add(this.legL);
    golemGroup.add(this.legR);

    this.mesh = golemGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 100);
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;
    if (playerPos) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Wander) {
        const dx = (Math.random() - 0.5) * 1.2;
        const dz = (Math.random() - 0.5) * 1.2;
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

    // Heavy Golem Stride Animation
    if (isMoving) {
      this.animTimer += deltaTime * 5;
      const swing = Math.sin(this.animTimer) * 0.35;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = -swing * 0.8;
      this.armR.rotation.x = swing * 0.8;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      this.armL.rotation.x = 0;
      this.armR.rotation.x = 0;
    }

    this.updatePhysics(deltaTime, world);
  }
}
