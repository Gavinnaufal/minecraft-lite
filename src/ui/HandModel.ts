import * as THREE from 'three';
import { Hotbar } from '../inventory/Hotbar';
import { createBlockMaterial, loadBlockTexture } from '../world/BlockRegistry';
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

    if (itemId === 'torch') {
      const torchGroup = new THREE.Group();

      const planeGeo = new THREE.PlaneGeometry(0.24, 0.32);
      const torchTex = loadBlockTexture('torch');
      const torchMat = new THREE.MeshBasicMaterial({
        map: torchTex,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
      });

      const p1 = new THREE.Mesh(planeGeo, torchMat);
      p1.rotation.y = Math.PI * 0.25;

      const p2 = new THREE.Mesh(planeGeo, torchMat);
      p2.rotation.y = -Math.PI * 0.25;

      torchGroup.add(p1);
      torchGroup.add(p2);

      torchGroup.position.set(0, 0.12, -0.14);
      torchGroup.rotation.set(-0.2, 0.2, 0);
      this.itemMesh = torchGroup;
      this.handGroup.add(this.itemMesh);
      return;
    }

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
      const pickGroup = new THREE.Group();

      // Handle (Wooden Shaft)
      const handleGeo = new THREE.BoxGeometry(0.03, 0.48, 0.03);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.set(0, 0.1, 0);

      // Pickaxe Head Crossbar
      const headGeo = new THREE.BoxGeometry(0.05, 0.07, 0.28);
      const headMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, 0.32, 0);

      // Left & Right Tips
      const tipGeo = new THREE.BoxGeometry(0.045, 0.09, 0.045);
      const tipL = new THREE.Mesh(tipGeo, headMat);
      tipL.position.set(0, 0.28, 0.13);
      tipL.rotation.x = 0.2;
      const tipR = new THREE.Mesh(tipGeo, headMat);
      tipR.position.set(0, 0.28, -0.13);
      tipR.rotation.x = -0.2;

      pickGroup.add(handleMesh);
      pickGroup.add(headMesh);
      pickGroup.add(tipL);
      pickGroup.add(tipR);

      pickGroup.position.set(0, 0.02, -0.15);
      pickGroup.rotation.set(-0.4, 0, 0);
      this.itemMesh = pickGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('sword')) {
      const isStone = itemId.includes('stone');
      const swordGroup = new THREE.Group();

      // Hilt Handle
      const hiltGeo = new THREE.BoxGeometry(0.03, 0.14, 0.03);
      const hiltMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
      const hiltMesh = new THREE.Mesh(hiltGeo, hiltMat);
      hiltMesh.position.set(0, 0.02, 0);

      // Crossguard
      const guardGeo = new THREE.BoxGeometry(0.05, 0.04, 0.2);
      const guardMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x616161 : 0x6d4c41 });
      const guardMesh = new THREE.Mesh(guardGeo, guardMat);
      guardMesh.position.set(0, 0.09, 0);

      // Blade
      const bladeGeo = new THREE.BoxGeometry(0.035, 0.5, 0.07);
      const bladeMat = new THREE.MeshStandardMaterial({ color: isStone ? 0xb0bec5 : 0xa1887f });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.set(0, 0.35, 0);

      swordGroup.add(hiltMesh);
      swordGroup.add(guardMesh);
      swordGroup.add(bladeMesh);

      swordGroup.position.set(0, 0.05, -0.15);
      this.itemMesh = swordGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('axe')) {
      const isStone = itemId.includes('stone');
      const axeGroup = new THREE.Group();

      const handleGeo = new THREE.BoxGeometry(0.03, 0.48, 0.03);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.set(0, 0.1, 0);

      const bladeGeo = new THREE.BoxGeometry(0.05, 0.18, 0.14);
      const bladeMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.set(0, 0.28, 0.07);

      axeGroup.add(handleMesh);
      axeGroup.add(bladeMesh);
      axeGroup.position.set(0, 0.02, -0.15);
      axeGroup.rotation.set(-0.3, 0, 0);
      this.itemMesh = axeGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('shovel')) {
      const isStone = itemId.includes('stone');
      const shovelGroup = new THREE.Group();

      const handleGeo = new THREE.BoxGeometry(0.03, 0.48, 0.03);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.set(0, 0.1, 0);

      const scoopGeo = new THREE.BoxGeometry(0.03, 0.16, 0.12);
      const scoopMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      const scoopMesh = new THREE.Mesh(scoopGeo, scoopMat);
      scoopMesh.position.set(0, 0.32, 0);

      shovelGroup.add(handleMesh);
      shovelGroup.add(scoopMesh);
      shovelGroup.position.set(0, 0.02, -0.15);
      shovelGroup.rotation.set(-0.3, 0, 0);
      this.itemMesh = shovelGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId.includes('hoe')) {
      const isStone = itemId.includes('stone');
      const hoeGroup = new THREE.Group();

      const handleGeo = new THREE.BoxGeometry(0.03, 0.48, 0.03);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.set(0, 0.1, 0);

      const bladeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.16);
      const bladeMat = new THREE.MeshStandardMaterial({ color: isStone ? 0x9e9e9e : 0x8d6e63 });
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.set(0, 0.32, 0.06);

      hoeGroup.add(handleMesh);
      hoeGroup.add(bladeMesh);
      hoeGroup.position.set(0, 0.02, -0.15);
      hoeGroup.rotation.set(-0.3, 0, 0);
      this.itemMesh = hoeGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'stick') {
      const stickGeo = new THREE.BoxGeometry(0.03, 0.4, 0.03);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
      this.itemMesh = new THREE.Mesh(stickGeo, stickMat);
      this.itemMesh.position.set(0, 0.1, -0.12);
      this.itemMesh.rotation.set(-0.3, 0, 0);
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'beef') {
      // High-Fidelity 3D Raw Beef Steak Slab
      const meatGroup = new THREE.Group();

      // Red Lean Meat Base
      const meatGeo = new THREE.BoxGeometry(0.18, 0.08, 0.22);
      const meatMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c });
      const meatMesh = new THREE.Mesh(meatGeo, meatMat);

      // Creamy Fat Rim Layer
      const fatGeo = new THREE.BoxGeometry(0.19, 0.05, 0.06);
      const fatMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
      const fatMesh = new THREE.Mesh(fatGeo, fatMat);
      fatMesh.position.set(0, 0.02, 0.09);

      // Bone Marrow Center Accent
      const boneGeo = new THREE.BoxGeometry(0.05, 0.09, 0.05);
      const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
      const boneMesh = new THREE.Mesh(boneGeo, boneMat);
      boneMesh.position.set(-0.03, 0, -0.03);

      meatGroup.add(meatMesh);
      meatGroup.add(fatMesh);
      meatGroup.add(boneMesh);
      meatGroup.position.set(0, 0.08, -0.12);
      meatGroup.rotation.set(0.3, 0.25, 0);
      this.itemMesh = meatGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'rotten_flesh') {
      // High-Fidelity 3D Dark Green Zombie Rotten Flesh
      const fleshGroup = new THREE.Group();

      // Main Decayed Meat Slab
      const fleshGeo = new THREE.BoxGeometry(0.18, 0.08, 0.2);
      const fleshMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
      const fleshMesh = new THREE.Mesh(fleshGeo, fleshMat);

      // Rotten Mold Brown Patches
      const spotGeo = new THREE.BoxGeometry(0.1, 0.04, 0.1);
      const spotMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
      const spotMesh = new THREE.Mesh(spotGeo, spotMat);
      spotMesh.position.set(-0.02, 0.03, -0.02);

      // Toxic Slime Green Mold Accent
      const slimeGeo = new THREE.BoxGeometry(0.08, 0.05, 0.08);
      const slimeMat = new THREE.MeshStandardMaterial({ color: 0x76ff03 });
      const slimeMesh = new THREE.Mesh(slimeGeo, slimeMat);
      slimeMesh.position.set(0.03, 0.02, 0.04);

      fleshGroup.add(fleshMesh);
      fleshGroup.add(spotMesh);
      fleshGroup.add(slimeMesh);
      fleshGroup.position.set(0, 0.08, -0.12);
      fleshGroup.rotation.set(0.2, -0.3, 0.1);
      this.itemMesh = fleshGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'bread') {
      // High-Fidelity 3D Golden Loaf of Bread
      const breadGroup = new THREE.Group();

      // Main Loaf Base
      const loafGeo = new THREE.BoxGeometry(0.16, 0.11, 0.26);
      const loafMat = new THREE.MeshStandardMaterial({ color: 0xd84315 });
      const loafMesh = new THREE.Mesh(loafGeo, loafMat);

      // Golden Crust Top
      const crustGeo = new THREE.BoxGeometry(0.14, 0.03, 0.24);
      const crustMat = new THREE.MeshStandardMaterial({ color: 0xff8f00 });
      const crustMesh = new THREE.Mesh(crustGeo, crustMat);
      crustMesh.position.y = 0.06;

      // 3 Scored Top Cut Slices
      const sliceMat = new THREE.MeshStandardMaterial({ color: 0xffe082 });
      for (let i = -1; i <= 1; i++) {
        const sliceGeo = new THREE.BoxGeometry(0.12, 0.02, 0.03);
        const sliceMesh = new THREE.Mesh(sliceGeo, sliceMat);
        sliceMesh.position.set(0, 0.075, i * 0.06);
        breadGroup.add(sliceMesh);
      }

      breadGroup.add(loafMesh);
      breadGroup.add(crustMesh);
      breadGroup.position.set(0, 0.08, -0.12);
      breadGroup.rotation.set(0.2, 0.2, 0);
      this.itemMesh = breadGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'wheat') {
      // High-Fidelity 3D Golden Wheat Stalk Bundle
      const wheatGroup = new THREE.Group();

      const stalkMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d });
      for (let i = 0; i < 4; i++) {
        const stalkGeo = new THREE.BoxGeometry(0.04, 0.36, 0.04);
        const stalkMesh = new THREE.Mesh(stalkGeo, stalkMat);
        stalkMesh.position.set((i % 2 - 0.5) * 0.04, 0, (Math.floor(i / 2) - 0.5) * 0.04);
        wheatGroup.add(stalkMesh);
      }

      const tieGeo = new THREE.BoxGeometry(0.1, 0.04, 0.1);
      const tieMat = new THREE.MeshStandardMaterial({ color: 0x388e3c });
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.y = 0;
      wheatGroup.add(tieMesh);

      wheatGroup.position.set(0, 0.1, -0.12);
      wheatGroup.rotation.set(-0.2, 0.2, 0);
      this.itemMesh = wheatGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'wheat_seeds') {
      // 3D Seed Grains Cluster
      const seedGroup = new THREE.Group();
      const seedMat1 = new THREE.MeshStandardMaterial({ color: 0x81c784 });
      const seedMat2 = new THREE.MeshStandardMaterial({ color: 0xcddc39 });

      for (let i = 0; i < 5; i++) {
        const grainGeo = new THREE.BoxGeometry(0.04, 0.06, 0.04);
        const grainMesh = new THREE.Mesh(grainGeo, i % 2 === 0 ? seedMat1 : seedMat2);
        grainMesh.position.set((i - 2) * 0.03, (i % 2) * 0.02, (i % 2) * 0.03);
        seedGroup.add(grainMesh);
      }
      seedGroup.position.set(0, 0.08, -0.12);
      this.itemMesh = seedGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'coal' || itemId === 'charcoal') {
      // Dark Lump of Coal with Faceted Cubes
      const coalGroup = new THREE.Group();
      const coalMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });
      const mainCoalGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const mainCoal = new THREE.Mesh(mainCoalGeo, coalMat);

      const lumpGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const lump1 = new THREE.Mesh(lumpGeo, coalMat);
      lump1.position.set(0.04, 0.04, 0.04);

      coalGroup.add(mainCoal);
      coalGroup.add(lump1);
      coalGroup.position.set(0, 0.08, -0.12);
      coalGroup.rotation.set(0.3, 0.4, 0.1);
      this.itemMesh = coalGroup;
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'iron_ingot') {
      // Metallic Silver Ingot Trapezoid
      const ingotGeo = new THREE.BoxGeometry(0.12, 0.07, 0.24);
      const ingotMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.7, roughness: 0.25 });
      this.itemMesh = new THREE.Mesh(ingotGeo, ingotMat);
      this.itemMesh.position.set(0, 0.08, -0.12);
      this.itemMesh.rotation.set(0.2, 0.3, 0);
      this.handGroup.add(this.itemMesh);
    } else if (itemId === 'gold_ingot') {
      // Shiny Gold Ingot
      const ingotGeo = new THREE.BoxGeometry(0.12, 0.07, 0.24);
      const ingotMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.85, roughness: 0.15 });
      this.itemMesh = new THREE.Mesh(ingotGeo, ingotMat);
      this.itemMesh.position.set(0, 0.08, -0.12);
      this.itemMesh.rotation.set(0.2, 0.3, 0);
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
