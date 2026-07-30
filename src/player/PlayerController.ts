import * as THREE from 'three';
import { inputManager } from '../core/InputManager';
import type { Player } from './Player';
import { PLAYER_SPEED, GRAVITY, PLAYER_JUMP_FORCE } from '../utils/constants';
import { AudioManager } from '../audio/AudioManager';

import type { World } from '../world/World';

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export class PlayerController {
  private readonly player: Player;
  private readonly world?: World;
  private stepTimer = 0;
  private wasGroundedLastFrame = false;
  private prevVelocityY = 0;

  constructor(player: Player, world?: World) {
    this.player = player;
    this.world = world;
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

    // Swimming check
    const px = Math.floor(this.player.position.x);
    const py = Math.floor(this.player.position.y);
    const pz = Math.floor(this.player.position.z);
    const inWater = this.world?.getBlock(px, py, pz) === 7 || this.world?.getBlock(px, py + 1, pz) === 7;

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      let speed = PLAYER_SPEED * (inputManager.isKeyPressed('Shift') ? 0.5 : 1);
      if (inWater) speed *= 0.75;
      this.player.velocity.x = (moveX / len) * speed;
      this.player.velocity.z = (moveZ / len) * speed;
    } else {
      this.player.velocity.x *= 0.8;
      this.player.velocity.z *= 0.8;
    }

    if (inWater) {
      this.player.velocity.y *= 0.85;
      this.player.velocity.y += -4.0 * deltaTime;
      if (inputManager.isKeyPressed(' ')) {
        this.player.velocity.y = 3.5;
      }
    } else {
      this.player.velocity.y += GRAVITY * deltaTime;
      if (inputManager.isKeyPressed(' ') && this.player.isGrounded) {
        this.player.velocity.y = PLAYER_JUMP_FORCE;
        this.player.isGrounded = false;
      }
    }

    this.player.position.x += this.player.velocity.x * deltaTime;
    this.player.position.y += this.player.velocity.y * deltaTime;
    this.player.position.z += this.player.velocity.z * deltaTime;

    // Footstep SFX step distance calculation
    const horizontalSpeed = Math.sqrt(this.player.velocity.x * this.player.velocity.x + this.player.velocity.z * this.player.velocity.z);
    if (this.player.isGrounded && horizontalSpeed > 0.5) {
      this.stepTimer += deltaTime * horizontalSpeed;
      if (this.stepTimer >= 2.0) {
        this.stepTimer = 0;
        AudioManager.getInstance().playSFX('footstep');
      }
    } else {
      this.stepTimer = 0;
    }

    // Fall Damage Calculation
    if (this.player.isGrounded && !this.wasGroundedLastFrame) {
      const fallSpeed = Math.abs(this.prevVelocityY);
      if (fallSpeed > 14.0 && !inWater) {
        const fallDamage = Math.floor((fallSpeed - 14.0) * 1.2);
        if (fallDamage > 0) {
          this.player.health = Math.max(0, this.player.health - fallDamage);
          AudioManager.getInstance().playSFX('hit');
        }
      }
    }
    this.wasGroundedLastFrame = this.player.isGrounded;
    this.prevVelocityY = this.player.velocity.y;

    if (this.player.position.y < -20) {
      this.player.position.x = 0;
      this.player.position.y = 64;
      this.player.position.z = 0;
      this.player.velocity.x = 0;
      this.player.velocity.y = 0;
      this.player.velocity.z = 0;
    }
  }
}
