import * as THREE from 'three';
import { Mob } from '../Mob';
import type { World } from '../../world/World';
import type { Player } from '../../player/Player';
import type { MobManager } from '../MobManager';
import type { EquipmentSlots } from '../../inventory/EquipmentSlots';
import { AudioManager } from '../../audio/AudioManager';
import { getBlockById } from '../../world/BlockRegistry';

export class Enderman extends Mob {
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

  private attackTimer = 0;
  private teleTimer = 0;
  private spawnGraceTimer = 2.0;
  private wanderDirX = 0;
  private wanderDirZ = 0;
  private wanderChangeTimer = 0;
  private stareHoldTimer = 0;

  override reset(position: THREE.Vector3): void {
    super.reset(position, 40);
    this.isHostile = false;
    this.isProvoked = false;
    this.animTimer = 0;
    this.attackTimer = 0;
    this.teleTimer = 0;
    this.spawnGraceTimer = 2.0;
    this.wanderChangeTimer = 0;
    this.stareHoldTimer = 0;
  }

  teleportRandomly(world?: World): void {
    const origin = this.position.clone();
    for (let attempt = 0; attempt < 20; attempt++) {
      const radius = 8 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      const tx = origin.x + Math.cos(angle) * radius;
      const tz = origin.z + Math.sin(angle) * radius;
      let ty = origin.y;

      if (world) {
        let foundGround = false;
        for (let checkY = Math.floor(origin.y) + 5; checkY >= Math.floor(origin.y) - 5; checkY--) {
          const bBelow = world.getBlock(Math.floor(tx), checkY, Math.floor(tz));
          const bHead1 = world.getBlock(Math.floor(tx), checkY + 1, Math.floor(tz));
          const bHead2 = world.getBlock(Math.floor(tx), checkY + 2, Math.floor(tz));

          if (bBelow !== 0 && bBelow !== 7 && getBlockById(bBelow)?.solid && bHead1 === 0 && bHead2 === 0) {
            ty = checkY + 1;
            foundGround = true;
            break;
          }
        }
        if (!foundGround) continue;
      }

      // Perform Teleport
      this.position.set(tx, ty, tz);
      this.mesh.position.copy(this.position);
      this.velocity.set(0, 0, 0);
      AudioManager.getInstance().playSFX('click');
      break;
    }
  }

  override takeDamage(amount: number): boolean {
    const isDead = super.takeDamage(amount);
    this.isProvoked = true;
    this.isHostile = true;
    if (!isDead && Math.random() < 0.8) {
      this.teleportRandomly();
    }
    return isDead;
  }

  update(deltaTime: number, world?: World, playerPos?: THREE.Vector3, player?: Player, _mobManager?: MobManager, camera?: THREE.PerspectiveCamera, _isNight?: boolean, equipmentSlots?: EquipmentSlots): void {
    let isMoving = false;

    if (this.spawnGraceTimer > 0) {
      this.spawnGraceTimer -= deltaTime;
    }

    if (playerPos) {
      const dist3D = this.position.distanceTo(playerPos);

      // Stare check: Requires 0.8s continuous direct crosshair gaze at Enderman head with Pointer Lock active
      const hasPointerLock = typeof document !== 'undefined' && !!document.pointerLockElement;
      if (!this.isProvoked && this.spawnGraceTimer <= 0 && hasPointerLock && camera && dist3D < 22) {
        const headPos = new THREE.Vector3(this.position.x, this.position.y + 2.65, this.position.z);
        const camPos = camera.position;
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        const toHead = headPos.clone().sub(camPos).normalize();
        const dot = camDir.dot(toHead);

        if (dot > 0.988) { // Tight precision on head/eyes
          this.stareHoldTimer += deltaTime;
          if (this.stareHoldTimer >= 0.8) {
            this.isProvoked = true;
            this.isHostile = true;
            AudioManager.getInstance().playSFX('click');
          }
        } else {
          this.stareHoldTimer = Math.max(0, this.stareHoldTimer - deltaTime * 2);
        }
      } else {
        this.stareHoldTimer = 0;
      }

      // Water weakness: Enderman takes damage and teleports away when touching water
      if (world) {
        const footBlock = world.getBlock(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z));
        const bodyBlock = world.getBlock(Math.floor(this.position.x), Math.floor(this.position.y + 1), Math.floor(this.position.z));
        if (footBlock === 7 || bodyBlock === 7) {
          this.takeDamage(2);
          this.teleportRandomly(world);
        }
      }

      // Periodic teleportation when provoked
      if (this.isProvoked) {
        this.teleTimer += deltaTime;
        if (this.teleTimer >= 6.0) {
          this.teleTimer = 0;
          this.teleportRandomly(world);
        }

        const dx = playerPos.x - this.position.x;
        const dz = playerPos.z - this.position.z;
        const dy = Math.abs(playerPos.y - this.position.y);
        const horizDist = Math.sqrt(dx * dx + dz * dz);

        this.attackTimer += deltaTime;

        if (horizDist > 0.001) {
          const chaseSpeed = 4.0; // Very fast Enderman sprint
          this.velocity.x = (dx / horizDist) * chaseSpeed;
          this.velocity.z = (dz / horizDist) * chaseSpeed;
          this.mesh.rotation.y = Math.atan2(dx, dz);
          isMoving = true;

          // Heavy Melee Attack on contact (6 damage)
          if (horizDist < 1.6 && dy < 2.5 && this.attackTimer >= 1.0) {
            this.attackTimer = 0;
            if (player && player.health > 0) {
              player.damage(6, equipmentSlots);
              AudioManager.getInstance().playSFX('hit');
            }
          }
        }
      } else {
        // Unprovoked: Wander smoothly in a direction, changing every 3-5 seconds (no glitchy spinning!)
        this.wanderChangeTimer -= deltaTime;
        if (this.wanderChangeTimer <= 0) {
          this.wanderChangeTimer = 3.0 + Math.random() * 2.0;
          if (Math.random() < 0.6) {
            const angle = Math.random() * Math.PI * 2;
            this.wanderDirX = Math.cos(angle) * 1.2;
            this.wanderDirZ = Math.sin(angle) * 1.2;
          } else {
            this.wanderDirX = 0;
            this.wanderDirZ = 0;
          }
        }

        const nextX = this.position.x + this.wanderDirX * deltaTime;
        const nextZ = this.position.z + this.wanderDirZ * deltaTime;

        // Water avoidance
        const nextBlock = world?.getBlock(Math.floor(nextX), Math.floor(this.position.y), Math.floor(nextZ));
        if (nextBlock !== 7) {
          this.velocity.x = this.wanderDirX;
          this.velocity.z = this.wanderDirZ;
          isMoving = Math.abs(this.wanderDirX) > 0.01 || Math.abs(this.wanderDirZ) > 0.01;

          if (isMoving) {
            this.mesh.rotation.y = Math.atan2(this.wanderDirX, this.wanderDirZ);
          }
        } else {
          this.velocity.x = 0;
          this.velocity.z = 0;
          this.wanderChangeTimer = 0; // Pick new direction if hitting water
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
