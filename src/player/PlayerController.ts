import * as THREE from 'three';
import { inputManager } from '../core/InputManager';
import type { Player } from './Player';
import { PLAYER_SPEED, GRAVITY, PLAYER_JUMP_FORCE } from '../utils/constants';

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export class PlayerController {
  private readonly player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  update(deltaTime: number, camera: THREE.PerspectiveCamera): void {
    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, _up).normalize();

    let moveX = 0;
    let moveZ = 0;

    if (inputManager.isKeyPressed('w')) { moveX += _forward.x; moveZ += _forward.z; }
    if (inputManager.isKeyPressed('s')) { moveX -= _forward.x; moveZ -= _forward.z; }
    if (inputManager.isKeyPressed('a')) { moveX -= _right.x; moveZ -= _right.z; }
    if (inputManager.isKeyPressed('d')) { moveX += _right.x; moveZ += _right.z; }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      const speed = PLAYER_SPEED * (inputManager.isKeyPressed('Shift') ? 0.5 : 1);
      this.player.velocity.x = (moveX / len) * speed;
      this.player.velocity.z = (moveZ / len) * speed;
    } else {
      this.player.velocity.x *= 0.8;
      this.player.velocity.z *= 0.8;
    }

    this.player.velocity.y += GRAVITY * deltaTime;

    if (inputManager.isKeyPressed(' ') && this.player.isGrounded) {
      this.player.velocity.y = PLAYER_JUMP_FORCE;
      this.player.isGrounded = false;
    }

    this.player.position.x += this.player.velocity.x * deltaTime;
    this.player.position.y += this.player.velocity.y * deltaTime;
    this.player.position.z += this.player.velocity.z * deltaTime;

    if (this.player.position.y < -10) {
      this.player.position.y = 60;
      this.player.velocity.y = 0;
    }
  }
}
