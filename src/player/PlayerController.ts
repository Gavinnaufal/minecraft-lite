import * as THREE from 'three';
import { inputManager } from '../core/InputManager';
import type { Player } from './Player';
import { PLAYER_SPEED, GRAVITY, PLAYER_JUMP_FORCE } from '../utils/constants';
import { AudioManager } from '../audio/AudioManager';

import type { World } from '../world/World';

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _lookDir = new THREE.Vector3();

export class PlayerController {
  private readonly player: Player;
  private readonly world?: World;
  private stepTimer = 0;
  private wasGroundedLastFrame = false;
  private wasInWaterLastFrame = false;
  private prevVelocityY = 0;
  public oxygen = 20.0;
  public isSubmerged = false;
  private drownTimer = 0;
  public onWaterSplash?: (pos: THREE.Vector3) => void;

  constructor(player: Player, world?: World) {
    this.player = player;
    this.world = world;
  }

  update(deltaTime: number, camera: THREE.PerspectiveCamera): void {
    camera.getWorldDirection(_lookDir);
    _forward.copy(_lookDir);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, _up).normalize();

    let moveX = 0;
    let moveZ = 0;

    if (inputManager.isKeyPressed('w')) { moveX += _forward.x; moveZ += _forward.z; }
    if (inputManager.isKeyPressed('s')) { moveX -= _forward.x; moveZ -= _forward.z; }
    if (inputManager.isKeyPressed('a')) { moveX -= _right.x; moveZ -= _right.z; }
    if (inputManager.isKeyPressed('d')) { moveX += _right.x; moveZ += _right.z; }

    // Swimming & Submerged check
    const px = Math.floor(this.player.position.x);
    const py = Math.floor(this.player.position.y);
    const headY = Math.floor(this.player.position.y + this.player.eyeHeight);
    const pz = Math.floor(this.player.position.z);
    const inWater = this.world?.getBlock(px, py, pz) === 7 || this.world?.getBlock(px, py + 1, pz) === 7;
    this.isSubmerged = this.world?.getBlock(px, headY, pz) === 7;

    if (inWater && !this.wasInWaterLastFrame) {
      if (this.onWaterSplash) {
        this.onWaterSplash(new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z));
      }
    }
    this.wasInWaterLastFrame = inWater;

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      let speed = PLAYER_SPEED * (inputManager.isKeyPressed('Shift') && !inWater ? 0.5 : 1);
      if (inWater) speed *= 0.8;
      this.player.velocity.x = (moveX / len) * speed;
      this.player.velocity.z = (moveZ / len) * speed;
    } else {
      this.player.velocity.x *= 0.8;
      this.player.velocity.z *= 0.8;
    }

    // Dynamic FOV Speed Effect
    const targetFov = len > 0 && !inputManager.isKeyPressed('Shift') && !inWater ? 80.0 : 75.0;
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, deltaTime * 6);
      camera.updateProjectionMatrix();
    }

    if (inWater) {
      this.player.velocity.y *= 0.88;

      // Pitch-based 3D diving when moving forward/backward underwater
      if (inputManager.isKeyPressed('w')) {
        this.player.velocity.y += _lookDir.y * 3.5 * deltaTime;
      }

      // Explicit Swim UP (Space) & Dive DOWN (Shift / C)
      if (inputManager.isKeyPressed(' ')) {
        this.player.velocity.y = 3.5;
      } else if (inputManager.isKeyPressed('Shift') || inputManager.isKeyPressed('c') || inputManager.isKeyPressed('C')) {
        this.player.velocity.y = -3.5;
      }
    } else {
      this.player.velocity.y += GRAVITY * deltaTime;
      if (inputManager.isKeyPressed(' ') && this.player.isGrounded) {
        this.player.velocity.y = PLAYER_JUMP_FORCE;
        this.player.isGrounded = false;
      }
    }

    // Oxygen & Drowning Mechanics
    if (this.isSubmerged) {
      this.oxygen = Math.max(0, this.oxygen - deltaTime * 1.25);
      if (this.oxygen <= 0) {
        this.drownTimer += deltaTime;
        if (this.drownTimer >= 1.5) {
          this.drownTimer = 0;
          this.player.health = Math.max(0, this.player.health - 2);
          AudioManager.getInstance().playSFX('hit');
        }
      } else {
        this.drownTimer = 0;
      }
    } else {
      this.oxygen = 20.0;
      this.drownTimer = 0;
    }

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
      this.player.health = 0;
    }
  }
}
