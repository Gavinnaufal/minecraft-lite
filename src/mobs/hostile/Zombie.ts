import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';

export class Zombie extends Mob {
  private stateMachine = new StateMachine();

  constructor(position: THREE.Vector3) {
    super(position, 0x2d5a27);
    this.health = 20;
  }

  update(deltaTime: number, playerPos?: THREE.Vector3): void {
    if (!playerPos) return;

    const dist = this.position.distanceTo(playerPos);
    const state = this.stateMachine.update(deltaTime, dist);

    if (state === State.Chase) {
      const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
      this.position.x += dir.x * 2.5 * deltaTime;
      this.position.z += dir.z * 2.5 * deltaTime;
    } else if (state === State.Wander) {
      this.position.x += (Math.random() - 0.5) * 1.5 * deltaTime;
      this.position.z += (Math.random() - 0.5) * 1.5 * deltaTime;
    }

    if (state === State.Attack) {
      // Damage player — handled externally
    }

    this.position.y = Math.max(0, this.position.y);
    this.mesh.position.copy(this.position);
  }
}
