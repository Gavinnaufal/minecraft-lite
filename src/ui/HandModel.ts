import * as THREE from 'three';
import { Hotbar } from '../inventory/Hotbar';
import { createBlockMaterial } from '../world/BlockRegistry';
import { itemIdToBlockId } from '../inventory/ItemRegistry';

export class HandModel {
  private camera: THREE.PerspectiveCamera;
  private hotbar: Hotbar;
  private handGroup: THREE.Group;
  private armMesh: THREE.Mesh;
  private itemMesh: THREE.Object3D | null = null;
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

  update(deltaTime: number, isWalking: boolean, isHitting: boolean = false): void {
    const activeItem = this.hotbar.getActiveItem();
    if (activeItem.itemId !== this.currentItemId) {
      this.currentItemId = activeItem.itemId;
      this.updateItemMesh(activeItem.itemId);
    }

    // Continuous swing when holding left click / hitting
    if (isHitting && !this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
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
      this.swingProgress += deltaTime * 6.0;
      if (this.swingProgress >= 1.0) {
        if (isHitting) {
          this.swingProgress = 0;
        } else {
          this.swingProgress = 0;
          this.isSwinging = false;
        }
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

    const blockId = itemIdToBlockId(itemId);
    if (blockId) {
      // Held Block Mini Cube using exact block texture/material
      const blockGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const blockMat = createBlockMaterial(blockId);
      this.itemMesh = new THREE.Mesh(blockGeo, blockMat);
      this.itemMesh.position.set(0, 0.08, -0.12);
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('pickaxe')) {
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
    } else if (itemId.includes('axe') || itemId.includes('shovel') || itemId.includes('hoe')) {
      const isStone = itemId.includes('stone');
      const toolGeo = new THREE.BoxGeometry(0.05, 0.48, 0.12);
      const toolMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      this.itemMesh = new THREE.Mesh(toolGeo, toolMat);
      this.itemMesh.position.set(0, 0.1, -0.15);
      this.itemMesh.rotation.set(-0.3, 0, 0);
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'torch') {
      const torchGroup = new THREE.Group();
      const stickGeo = new THREE.BoxGeometry(0.04, 0.35, 0.04);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      const stickMesh = new THREE.Mesh(stickGeo, stickMat);
      stickMesh.position.y = 0.15;

      const flameGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.y = 0.34;

      torchGroup.add(stickMesh);
      torchGroup.add(flameMesh);
      torchGroup.position.set(0, 0.05, -0.12);
      torchGroup.rotation.set(-0.2, 0, 0);
      this.itemMesh = torchGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'stick') {
      const stickGeo = new THREE.BoxGeometry(0.03, 0.4, 0.03);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      this.itemMesh = new THREE.Mesh(stickGeo, stickMat);
      this.itemMesh.position.set(0, 0.1, -0.12);
      this.itemMesh.rotation.set(-0.3, 0, 0);
      this.handGroup.add(this.itemMesh);
    } else {
      const genericGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
      const genericMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
      this.itemMesh = new THREE.Mesh(genericGeo, genericMat);
      this.itemMesh.position.set(0, 0.08, -0.12);
      this.handGroup.add(this.itemMesh);
    }
  }
}
