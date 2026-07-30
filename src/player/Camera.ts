import * as THREE from 'three';
import { inputManager } from '../core/InputManager';

export class PlayerCamera {
  readonly camera: THREE.PerspectiveCamera;
  readonly euler = new THREE.Euler(0, 0, 0, 'YXZ');

  sensitivity = 0.002;

  private static readonly PITCH_LIMIT = (89 * Math.PI) / 180;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.euler.x = (-15 * Math.PI) / 180;
    this.camera.quaternion.setFromEuler(this.euler);
  }

  update(): void {
    const dx = inputManager.mouseDeltaX;
    const dy = inputManager.mouseDeltaY;

    this.euler.y -= dx * this.sensitivity;
    this.euler.x -= dy * this.sensitivity;
    this.euler.x = Math.max(
      -PlayerCamera.PITCH_LIMIT,
      Math.min(PlayerCamera.PITCH_LIMIT, this.euler.x),
    );

    this.camera.quaternion.setFromEuler(this.euler);
  }
}
