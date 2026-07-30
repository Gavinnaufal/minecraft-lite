import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';

export class Cow extends Mob {
  private stateMachine = new StateMachine();
  private legFL: THREE.Mesh;
  private legFR: THREE.Mesh;
  private legBL: THREE.Mesh;
  private legBR: THREE.Mesh;
  private animTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0x6d4c41);
    this.health = 8;

    // Create 3D Compound Group Mesh for Cow
    const cowGroup = new THREE.Group();

    // Body (Torso)
    const bodyGeo = new THREE.BoxGeometry(0.9, 0.7, 1.3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.65, 0);
    cowGroup.add(bodyMesh);

    // Udder/belly patch (white)
    const patchGeo = new THREE.BoxGeometry(0.7, 0.3, 0.8);
    const patchMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const patchMesh = new THREE.Mesh(patchGeo, patchMat);
    patchMesh.position.set(0, 0.5, 0);
    cowGroup.add(patchMesh);

    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 1.05, 0.65);
    cowGroup.add(headMesh);

    // Snout (Pinkish orange)
    const snoutGeo = new THREE.BoxGeometry(0.4, 0.25, 0.2);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffb74d });
    const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
    snoutMesh.position.set(0, 0.95, 0.9);
    cowGroup.add(snoutMesh);

    // Horns (White/Gray)
    const hornGeo = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(-0.28, 1.35, 0.65);
    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.28, 1.35, 0.65);
    cowGroup.add(hornL);
    cowGroup.add(hornR);

    // 4 Legs
    const legGeo = new THREE.BoxGeometry(0.22, 0.55, 0.22);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });

    this.legFL = new THREE.Mesh(legGeo, legMat);
    this.legFL.position.set(-0.3, 0.28, 0.45);
    this.legFR = new THREE.Mesh(legGeo, legMat);
    this.legFR.position.set(0.3, 0.28, 0.45);

    this.legBL = new THREE.Mesh(legGeo, legMat);
    this.legBL.position.set(-0.3, 0.28, -0.45);
    this.legBR = new THREE.Mesh(legGeo, legMat);
    this.legBR.position.set(0.3, 0.28, -0.45);

    cowGroup.add(this.legFL);
    cowGroup.add(this.legFR);
    cowGroup.add(this.legBL);
    cowGroup.add(this.legBR);

    this.mesh = cowGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 8);
    this.animTimer = 0;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, _player?: Player): void {
    let isMoving = false;
    if (playerPos) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Wander) {
        const dx = (Math.random() - 0.5) * 2 * deltaTime;
        const dz = (Math.random() - 0.5) * 2 * deltaTime;
        this.position.x += dx;
        this.position.z += dz;
        isMoving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;

        if (isMoving) {
          this.mesh.rotation.y = Math.atan2(dx, dz);
        }
      }
    }

    // Leg swing animation
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
