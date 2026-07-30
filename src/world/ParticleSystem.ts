import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private particleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawnBlockBreakParticles(position: THREE.Vector3, colorHex = 0x8d6e63): void {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.6,
        position.y + 0.3 + Math.random() * 0.4,
        position.z + (Math.random() - 0.5) * 0.6,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        2.5 + Math.random() * 3.0,
        (Math.random() - 0.5) * 4.0,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
      });
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.y += -18.0 * deltaTime; // Gravity
      p.mesh.position.addScaledVector(p.velocity, deltaTime);
      p.mesh.scale.multiplyScalar(0.93); // Shrink over time
    }
  }
}
