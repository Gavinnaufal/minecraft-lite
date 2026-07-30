import * as THREE from 'three';
import { Mob } from '../Mob';
import { StateMachine, State } from '../ai/StateMachine';

export class Cow extends Mob {
  private stateMachine = new StateMachine();

  constructor(position: THREE.Vector3) {
    super(position, 0x8b4513);
    this.health = 8;
  }

  update(deltaTime: number, playerPos?: THREE.Vector3): void {
    if (!playerPos) return;

    const dist = this.position.distanceTo(playerPos);
    const state = this.stateMachine.update(deltaTime, dist);

    if (state === State.Wander) {
      this.position.x += (Math.random() - 0.5) * 2 * deltaTime;
      this.position.z += (Math.random() - 0.5) * 2 * deltaTime;
    }

    this.position.y = Math.max(0, this.position.y);
    this.mesh.position.copy(this.position);
  }
}
