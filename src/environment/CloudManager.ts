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
      transparent: true,
      opacity: 0.85,
      roughness: 0.8,
      metalness: 0.1,
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
    const cloudBoxGeo = new THREE.BoxGeometry(12, 4, 12);
    const cloudPositions: { x: number; y: number; z: number }[] = [];

    const areaSize = 40; // 40x40 cloud grid
    for (let x = -areaSize / 2; x < areaSize / 2; x++) {
      for (let z = -areaSize / 2; z < areaSize / 2; z++) {
        const val = this.noise.noise2D(x * 0.08, z * 0.08);
        if (val > 0.35) {
          const heightOffset = Math.sin(x * 0.2 + z * 0.3) > 0.5 ? 4 : 0;
          cloudPositions.push({
            x: x * 12,
            y: 110 + heightOffset,
            z: z * 12,
          });
        }
      }
    }

    if (cloudPositions.length > 0) {
      this.instancedMesh = new THREE.InstancedMesh(cloudBoxGeo, this.cloudMaterial, cloudPositions.length);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < cloudPositions.length; i++) {
        dummy.position.set(cloudPositions[i].x, cloudPositions[i].y, cloudPositions[i].z);
        dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      this.cloudGroup.add(this.instancedMesh);
    }
  }

  public update(_deltaTime: number, timeOfDay: number, playerPos: THREE.Vector3): void {
    // 1. Cloud drifting wind
    this.cloudGroup.position.x = playerPos.x + ((Date.now() * 0.003) % 480) - 240;
    this.cloudGroup.position.z = playerPos.z + ((Date.now() * 0.002) % 480) - 240;

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
      this.cloudMaterial.color.setHex(0x334466); // Dark blue night clouds
      this.cloudMaterial.opacity = 0.6;
      this.starsMaterial.opacity = 0.9;
    } else if (isSunset) {
      this.cloudMaterial.color.setHex(0xffaa66); // Sunset golden clouds
      this.cloudMaterial.opacity = 0.85;
      this.starsMaterial.opacity = 0.4;
    } else {
      this.cloudMaterial.color.setHex(0xffffff); // Bright white day clouds
      this.cloudMaterial.opacity = 0.85;
      this.starsMaterial.opacity = 0;
    }
  }
}
