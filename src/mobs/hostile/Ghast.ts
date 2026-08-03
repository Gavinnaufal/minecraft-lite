import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { Player } from '../../player/Player';
import type { World } from '../../world/World';
import { ProjectileManager } from '../../entities/ProjectileManager';
import { AudioManager } from '../../audio/AudioManager';

export class Ghast extends Mob {
  private stateMachine = new StateMachine();
  private attackTimer = 0;
  private animTimer = 0;
  private tentacles: THREE.Mesh[] = [];

  constructor(position: THREE.Vector3) {
    super(position, 0xf5f5f5);
    this.health = 30;
    this.isHostile = true;
    this.isFlying = true;
    this.width = 2.2;
    this.height = 2.2;

    // Create 3D Ghast Compound Group Mesh
    const ghastGroup = new THREE.Group();

    // Body (Large White Cube 2.2x2.2x2.2)
    const bodyGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 1.1, 0);
    ghastGroup.add(bodyMesh);

    // Closed Eye Details (Dark Gray Rectangles)
    const eyeGeo = new THREE.BoxGeometry(0.4, 0.2, 0.05);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x424242 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.5, 1.4, 1.11);
    ghastGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.5, 1.4, 1.11);
    ghastGroup.add(rightEye);

    // 9 Floating Tentacles under body
    const tentacleGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
    const tentacleMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const tentacle = new THREE.Mesh(tentacleGeo, tentacleMat);
        tentacle.position.set(-0.7 + c * 0.7, -0.6, -0.7 + r * 0.7);
        ghastGroup.add(tentacle);
        this.tentacles.push(tentacle);
      }
    }

    this.mesh = ghastGroup;
    this.mesh.position.copy(position);
  }

  override update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, player?: Player): void {
    this.updatePhysics(deltaTime, world);
    this.animTimer += deltaTime * 2.0;

    // Animate tentacles sway
    for (let i = 0; i < this.tentacles.length; i++) {
      this.tentacles[i].rotation.z = Math.sin(this.animTimer + i) * 0.15;
      this.tentacles[i].rotation.x = Math.cos(this.animTimer + i) * 0.15;
    }

    if (playerPos && player && player.health > 0) {
      const dist = this.position.distanceTo(playerPos);
      const state = this.stateMachine.update(deltaTime, dist);

      if (state === State.Chase || dist < 32) {
        // High floating AI: float 10 blocks above player
        const targetY = playerPos.y + 10.0;
        const dir = new THREE.Vector3().subVectors(playerPos, this.position);
        dir.y = targetY - this.position.y;
        dir.normalize();

        this.velocity.x = dir.x * 2.0;
        this.velocity.y = dir.y * 1.5;
        this.velocity.z = dir.z * 2.0;

        // Face player
        this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

        // Explosive Fireball Attack
        this.attackTimer += deltaTime;
        if (this.attackTimer >= 4.5) {
          this.attackTimer = 0;
          const shootDir = playerPos.clone().add(new THREE.Vector3(0, 0.8, 0)).sub(this.position).normalize();
          const spawnPos = this.position.clone().add(new THREE.Vector3(0, 0.5, 0));
          ProjectileManager.getInstance().spawnFireball(spawnPos, shootDir, 16.0, true);
          AudioManager.getInstance().playSFX('explosion');
        }
      }
    }
  }
}
