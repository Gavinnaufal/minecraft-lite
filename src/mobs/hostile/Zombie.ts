import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import type { Player } from '../../player/Player';
import type { World } from '../../world/World';
import { AudioManager } from '../../audio/AudioManager';

const CHASE_SPEED = 2.5;     // unit/detik
const ATTACK_RANGE_HORIZ = 1.8; // horizontal attack range
const ATTACK_RANGE_VERT = 2.5;  // vertical attack range
const ATTACK_DAMAGE = 2;     // HP yang dikurangi per serangan
const ATTACK_COOLDOWN = 1.0;  // detik antar serangan

export class Zombie extends Mob {
  private stateMachine = new StateMachine();
  private attackTimer = 0;
  private animTimer = 0;
  private groanTimer = 4 + Math.random() * 8;

  private headMesh: THREE.Mesh;
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;

  constructor(position: THREE.Vector3) {
    super(position, 0x2d5a27);
    this.health = 20;
    this.isHostile = true;

    // Create 3D Compound Group Mesh for Zombie
    const zombieGroup = new THREE.Group();

    // Head (Green)
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x388e3c });
    this.headMesh = new THREE.Mesh(headGeo, headMat);
    this.headMesh.position.set(0, 1.4, 0);
    zombieGroup.add(this.headMesh);

    // Torso (Cyan / Teal Shirt)
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.3);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00838f });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, 0.8, 0);
    zombieGroup.add(torsoMesh);

    // 2 Arms (Green, outstretched forward at 90 deg)
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });

    this.armL = new THREE.Mesh(armGeo, armMat);
    this.armL.position.set(-0.38, 0.8, 0.25);
    this.armL.rotation.x = Math.PI / 2; // Outstretched arms

    this.armR = new THREE.Mesh(armGeo, armMat);
    this.armR.position.set(0.38, 0.8, 0.25);
    this.armR.rotation.x = Math.PI / 2;

    zombieGroup.add(this.armL);
    zombieGroup.add(this.armR);

    // 2 Legs (Navy Blue Pants)
    const legGeo = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });

    this.legL = new THREE.Mesh(legGeo, legMat);
    this.legL.position.set(-0.14, 0.35, 0);

    this.legR = new THREE.Mesh(legGeo, legMat);
    this.legR.position.set(0.14, 0.35, 0);

    zombieGroup.add(this.legL);
    zombieGroup.add(this.legR);

    this.mesh = zombieGroup;
    this.mesh.position.copy(position);
  }

  override reset(position: THREE.Vector3): void {
    super.reset(position, 20);
    this.attackTimer = 0;
    this.animTimer = 0;
    this.groanTimer = 4 + Math.random() * 8;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, player?: Player): void {
    let isMoving = false;

    if (playerPos) {
      const dx = playerPos.x - this.position.x;
      const dz = playerPos.z - this.position.z;
      const dy = Math.abs(playerPos.y - this.position.y);
      const horizDist = Math.sqrt(dx * dx + dz * dz);
      const dist3D = this.position.distanceTo(playerPos);

      const state = this.stateMachine.update(deltaTime, dist3D);

      this.attackTimer += deltaTime;

      if (horizDist < ATTACK_RANGE_HORIZ && dy < ATTACK_RANGE_VERT) {
        // Face player while attacking
        this.mesh.rotation.y = Math.atan2(dx, dz);
        this.velocity.x = 0;
        this.velocity.z = 0;
        if (this.attackTimer >= ATTACK_COOLDOWN) {
          this.attackTimer = 0;
          if (player && player.health > 0) {
            player.health = Math.max(0, player.health - ATTACK_DAMAGE);
            AudioManager.getInstance().playSFX('hit');
          }
        }
      } else if (state === State.Chase || horizDist < 16) {
        if (horizDist > 0.001) {
          const nx = dx / horizDist;
          const nz = dz / horizDist;
          this.velocity.x = nx * CHASE_SPEED;
          this.velocity.z = nz * CHASE_SPEED;
          this.mesh.rotation.y = Math.atan2(dx, dz);
          isMoving = true;
        }
      } else if (state === State.Wander) {
        const wanderDx = (Math.random() - 0.5) * 1.5;
        const wanderDz = (Math.random() - 0.5) * 1.5;
        this.velocity.x = wanderDx;
        this.velocity.z = wanderDz;
        isMoving = Math.abs(wanderDx) > 0.001 || Math.abs(wanderDz) > 0.001;

        if (isMoving) {
          this.mesh.rotation.y = Math.atan2(wanderDx, wanderDz);
        }
      }
    }

    // Walking / Outstretched Arm & Leg Swing Animation
    if (isMoving) {
      this.animTimer += deltaTime * 10;
      const swing = Math.sin(this.animTimer) * 0.5;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = Math.PI / 2 + swing * 0.25;
      this.armR.rotation.x = Math.PI / 2 - swing * 0.25;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      this.armL.rotation.x = Math.PI / 2;
      this.armR.rotation.x = Math.PI / 2;
    }

    this.groanTimer -= deltaTime;
    if (this.groanTimer <= 0) {
      this.groanTimer = 8 + Math.random() * 12;
      AudioManager.getInstance().playSFX('zombie_groan');
    }

    this.updatePhysics(deltaTime, world);
  }

  override takeDamage(amount: number): boolean {
    AudioManager.getInstance().playSFX('zombie_groan');
    return super.takeDamage(amount);
  }
}
