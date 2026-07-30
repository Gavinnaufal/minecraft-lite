import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';
import { Player } from '../../player/Player';

const CHASE_SPEED = 2.5;    // unit/detik
const ATTACK_RANGE = 1.5;   // unit — jarak untuk mulai menyerang
const ATTACK_DAMAGE = 2;    // HP yang dikurangi per serangan
const ATTACK_COOLDOWN = 1.0; // detik antar serangan

export class Zombie extends Mob {
  private stateMachine = new StateMachine();
  /** Timer cooldown serangan dalam detik */
  private attackTimer = 0;

  constructor(position: THREE.Vector3) {
    super(position, 0x2d5a27);
    this.health = 20;
  }

  /**
   * Update zombie per frame.
   * @param deltaTime  Waktu antar frame (detik)
   * @param playerPos  Posisi player saat ini
   * @param player     Instance Player — diperlukan untuk mengurangi HP saat attack
   */
  update(deltaTime: number, playerPos?: THREE.Vector3, player?: Player): void {
    if (!playerPos) return;

    const dist = this.position.distanceTo(playerPos);
    const state = this.stateMachine.update(deltaTime, dist);

    if (state === State.Chase) {
      // Gerak menuju player
      const dir = new THREE.Vector3()
        .subVectors(playerPos, this.position)
        .normalize();
      this.position.x += dir.x * CHASE_SPEED * deltaTime;
      this.position.z += dir.z * CHASE_SPEED * deltaTime;
      // Reset timer saat masuk chase (agar serangan pertama tidak delay)
      this.attackTimer = ATTACK_COOLDOWN;

    } else if (state === State.Attack) {
      // Berhenti bergerak, serang player secara periodik
      this.attackTimer += deltaTime;
      if (this.attackTimer >= ATTACK_COOLDOWN) {
        this.attackTimer = 0;
        if (player && dist < ATTACK_RANGE) {
          player.health = Math.max(0, player.health - ATTACK_DAMAGE);
        }
      }

    } else if (state === State.Wander) {
      this.position.x += (Math.random() - 0.5) * 1.5 * deltaTime;
      this.position.z += (Math.random() - 0.5) * 1.5 * deltaTime;
    }

    this.position.y = Math.max(0, this.position.y);
    this.mesh.position.copy(this.position);
  }
}
