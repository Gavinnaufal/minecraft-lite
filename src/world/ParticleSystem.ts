import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  useGravity?: boolean;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private particleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawnEnderParticles(position: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({ color: 0xd500f9, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.8,
        position.y + Math.random() * 2.8,
        position.z + (Math.random() - 0.5) * 0.8,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        0.5 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.6,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        useGravity: false,
      });
    }
  }

  spawnHeartParticles(position: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff4081, transparent: true, opacity: 0.95 });

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.7,
        position.y + Math.random() * 0.5,
        position.z + (Math.random() - 0.5) * 0.7,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.8 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.4,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        useGravity: false,
      });
    }
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

  spawnBlockPlaceParticles(position: THREE.Vector3, colorHex = 0xdddddd): void {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.8,
        position.y + 0.1 + Math.random() * 0.8,
        position.z + (Math.random() - 0.5) * 0.8,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        1.0 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.0,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
      });
    }
  }

  spawnDeathParticles(position: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.6,
        position.y + 0.5 + (Math.random() - 0.5) * 0.8,
        position.z + (Math.random() - 0.5) * 0.6,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        1.5 + Math.random() * 3.5,
        (Math.random() - 0.5) * 3.5,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
      });
    }
  }

  spawnWaterSplashParticles(position: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.85 });

    for (let i = 0; i < 14; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5) * 0.5,
        position.y + 0.2,
        position.z + (Math.random() - 0.5) * 0.5,
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3.0,
        3.0 + Math.random() * 2.5,
        (Math.random() - 0.5) * 3.0,
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
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

      if (p.useGravity !== false) {
        p.velocity.y += -18.0 * deltaTime; // Gravity
      }
      p.mesh.position.addScaledVector(p.velocity, deltaTime);
      p.mesh.scale.multiplyScalar(0.93); // Shrink over time
    }
  }
}
