import * as THREE from 'three';
import { NoiseGenerator } from '../world/terrain/NoiseGenerator';

export class CloudManager {
  public cloudGroup: THREE.Group;
  private cloudMaterial: THREE.MeshStandardMaterial;
  private noise: NoiseGenerator;
  private instancedMesh: THREE.InstancedMesh | null = null;
  private sunMesh: THREE.Mesh;
  private moonMesh: THREE.Mesh;
  private starsPoints: THREE.Points;
  private starsMaterial: THREE.PointsMaterial;

  constructor(scene: THREE.Scene) {
    this.cloudGroup = new THREE.Group();
    this.noise = new NoiseGenerator(8888);

    // 1. Cloud Material
    this.cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xeeeeff,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });

    // 2. Generate 3D Voxel Cloud Layer
    this.createCloudLayer();

    // 3. Create Sun & Moon
    const sunGeo = new THREE.PlaneGeometry(24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffae6, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);

    const moonGeo = new THREE.PlaneGeometry(20, 20);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xddedff, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);

    scene.add(this.sunMesh);
    scene.add(this.moonMesh);

    // 4. Create Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let i = 0; i < 400; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 400;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 30; // Above horizon
      const z = r * Math.sin(phi) * Math.sin(theta);
      starCoords.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    this.starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.5,
      transparent: true,
      opacity: 0,
    });
    this.starsPoints = new THREE.Points(starGeo, this.starsMaterial);
    scene.add(this.starsPoints);

    scene.add(this.cloudGroup);
  }

  private createCloudLayer(): void {
    const blockSize = 6; // Each cloud voxel is 6x3x6 (small blocks)
    const cloudBoxGeo = new THREE.BoxGeometry(blockSize, 3, blockSize);
    const cloudPositions: { x: number; y: number; z: number; sx: number; sy: number; sz: number }[] = [];

    // Generate many small scattered cloud patches across a wide area
    const cloudCount = 60; // Number of separate cloud patches
    const spreadArea = 600; // Total spread radius in world units
    const cloudY = 120; // Base cloud altitude

    // Use noise to seed cloud center positions for natural distribution
    for (let i = 0; i < cloudCount; i++) {
      // Scatter cloud centers across the sky using golden-ratio-based distribution
      const angle = i * 2.399963; // Golden angle in radians
      const radius = Math.sqrt(i / cloudCount) * spreadArea;
      const centerX = Math.cos(angle) * radius;
      const centerZ = Math.sin(angle) * radius;

      // Each cloud patch is a small cluster of 3-8 blocks
      const patchSize = 3 + Math.floor(this.noise.noise2D(i * 0.7, i * 1.3) * 3 + 3); // 3-8 blocks

      for (let b = 0; b < patchSize; b++) {
        // Spread blocks within the patch in a rough ellipse shape
        const localAngle = (b / patchSize) * Math.PI * 2 + this.noise.noise2D(i + b, b) * 1.2;
        const localRadius = blockSize * (0.5 + Math.abs(this.noise.noise2D(b * 0.5, i * 0.5)) * 1.5);
        const bx = centerX + Math.cos(localAngle) * localRadius;
        const bz = centerZ + Math.sin(localAngle) * localRadius;
        const by = cloudY + (this.noise.noise2D(bx * 0.01, bz * 0.01)) * 3; // Slight height variation

        // Random slight scale variation for organic feel
        const scaleX = 0.8 + Math.abs(this.noise.noise2D(bx, bz)) * 0.6;
        const scaleZ = 0.8 + Math.abs(this.noise.noise2D(bz, bx)) * 0.6;

        cloudPositions.push({
          x: bx, y: by, z: bz,
          sx: scaleX, sy: 0.6 + Math.random() * 0.4, sz: scaleZ,
        });
      }
    }

    if (cloudPositions.length > 0) {
      this.instancedMesh = new THREE.InstancedMesh(cloudBoxGeo, this.cloudMaterial, cloudPositions.length);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < cloudPositions.length; i++) {
        const p = cloudPositions[i];
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.sx, p.sy, p.sz);
        dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      this.cloudGroup.add(this.instancedMesh);
    }
  }

  public update(_deltaTime: number, timeOfDay: number, playerPos: THREE.Vector3): void {
    // 1. Clouds follow player with gentle wind drift
    const windTime = Date.now() * 0.0005;
    this.cloudGroup.position.x = playerPos.x + Math.sin(windTime) * 30;
    this.cloudGroup.position.z = playerPos.z + Math.cos(windTime * 0.7) * 20;

    // 2. Sun & Moon Orbit
    const angle = timeOfDay * Math.PI * 2;
    const distance = 420;

    // Sun position
    const sunX = playerPos.x + Math.cos(angle) * distance;
    const sunY = playerPos.y + Math.sin(angle) * distance;
    const sunZ = playerPos.z + 50;
    this.sunMesh.position.set(sunX, sunY, sunZ);
    this.sunMesh.lookAt(playerPos);

    // Moon position (opposite to sun)
    const moonX = playerPos.x - Math.cos(angle) * distance;
    const moonY = playerPos.y - Math.sin(angle) * distance;
    const moonZ = playerPos.z - 50;
    this.moonMesh.position.set(moonX, moonY, moonZ);
    this.moonMesh.lookAt(playerPos);

    this.starsPoints.position.copy(playerPos);

    // 3. Day/Night Cloud & Star Color Transitions
    const isNight = timeOfDay < 0.22 || timeOfDay > 0.78;
    const isSunset = (timeOfDay >= 0.22 && timeOfDay <= 0.3) || (timeOfDay >= 0.7 && timeOfDay <= 0.78);

    if (isNight) {
      this.cloudMaterial.color.setHex(0x556688); // Soft blue night clouds
      this.cloudMaterial.opacity = 0.75;
      this.cloudMaterial.emissiveIntensity = 0.05;
      this.starsMaterial.opacity = 0.9;
    } else if (isSunset) {
      this.cloudMaterial.color.setHex(0xffcc88); // Sunset warm clouds
      this.cloudMaterial.opacity = 0.95;
      this.cloudMaterial.emissiveIntensity = 0.25;
      this.starsMaterial.opacity = 0.4;
    } else {
      this.cloudMaterial.color.setHex(0xffffff); // Bright solid white day clouds
      this.cloudMaterial.opacity = 0.95;
      this.cloudMaterial.emissiveIntensity = 0.15;
      this.starsMaterial.opacity = 0;
    }
  }
}
