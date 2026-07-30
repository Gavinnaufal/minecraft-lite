import * as THREE from 'three';
import { Hotbar } from '../inventory/Hotbar';

export class HandModel {
  private camera: THREE.PerspectiveCamera;
  private hotbar: Hotbar;
  private handGroup: THREE.Group;
  private armMesh: THREE.Mesh;
  private itemMesh: THREE.Mesh | null = null;
  private isSwinging = false;
  private swingProgress = 0;
  private currentItemId: string | null = null;

  constructor(camera: THREE.PerspectiveCamera, hotbar: Hotbar) {
    this.camera = camera;
    this.hotbar = hotbar;

    this.handGroup = new THREE.Group();

    // Player Steve Arm mesh (skin color / teal sleeve)
    const armGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xc68642 });
    this.armMesh = new THREE.Mesh(armGeo, armMat);
    this.armMesh.position.set(0, -0.15, 0);
    this.handGroup.add(this.armMesh);

    // Initial position relative to camera (bottom-right)
    this.handGroup.position.set(0.38, -0.32, -0.55);
    this.handGroup.rotation.set(0.2, -0.3, 0);

    this.camera.add(this.handGroup);
  }

  triggerSwing(): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
    }
  }

  update(deltaTime: number, isWalking: boolean): void {
    const activeItem = this.hotbar.getActiveItem();
    if (activeItem.itemId !== this.currentItemId) {
      this.currentItemId = activeItem.itemId;
      this.updateItemMesh(activeItem.itemId);
    }

    // Walking idle bobbing animation
    let bobX = 0;
    let bobY = 0;
    if (isWalking) {
      const time = performance.now() * 0.008;
      bobX = Math.sin(time) * 0.02;
      bobY = Math.abs(Math.cos(time)) * 0.02;
    }

    // Swing animation handling
    if (this.isSwinging) {
      this.swingProgress += deltaTime * 5.0; // 0.2s duration
      if (this.swingProgress >= 1.0) {
        this.swingProgress = 0;
        this.isSwinging = false;
      }
    }

    const swingAngle = Math.sin(this.swingProgress * Math.PI);
    this.handGroup.position.set(0.38 + bobX, -0.32 + bobY - swingAngle * 0.08, -0.55 - swingAngle * 0.1);
    this.handGroup.rotation.x = 0.2 - swingAngle * 0.8;
    this.handGroup.rotation.y = -0.3 + swingAngle * 0.4;
    this.handGroup.rotation.z = -swingAngle * 0.3;
  }

  private updateItemMesh(itemId: string | null): void {
    if (this.itemMesh) {
      this.handGroup.remove(this.itemMesh);
      this.itemMesh = null;
    }

    if (!itemId) return;

    if (itemId.includes('pickaxe')) {
      const isStone = itemId.includes('stone');
      const pickGeo = new THREE.BoxGeometry(0.06, 0.45, 0.25);
      const pickMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      this.itemMesh = new THREE.Mesh(pickGeo, pickMat);
      this.itemMesh.position.set(0, 0.1, -0.15);
      this.itemMesh.rotation.set(-0.4, 0, 0);
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('sword')) {
      const isStone = itemId.includes('stone');
      const swordGeo = new THREE.BoxGeometry(0.04, 0.55, 0.08);
      const swordMat = new THREE.MeshStandardMaterial({ color: isStone ? 0xb0bec5 : 0xa1887f });
      this.itemMesh = new THREE.Mesh(swordGeo, swordMat);
      this.itemMesh.position.set(0, 0.15, -0.15);
      this.handGroup.add(this.itemMesh);
    } else {
      // Held Block Mini Cube
      const blockGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const blockMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
      this.itemMesh = new THREE.Mesh(blockGeo, blockMat);
      this.itemMesh.position.set(0, 0.08, -0.12);
      this.handGroup.add(this.itemMesh);
    }
  }
}
