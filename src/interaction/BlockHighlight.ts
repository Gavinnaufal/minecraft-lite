import * as THREE from 'three';
import { World } from '../world/World';
import { raycaster, type RaycastHit } from '../player/Raycaster';

export class BlockHighlight {
  private highlightMesh: THREE.LineSegments;

  constructor(scene: THREE.Scene) {
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
      transparent: true,
      opacity: 0.6,
      depthTest: true,
    });

    this.highlightMesh = new THREE.LineSegments(edgesGeo, lineMat);
    this.highlightMesh.visible = false;
    this.highlightMesh.renderOrder = 999;
    scene.add(this.highlightMesh);
  }

  public update(world: World, camera: THREE.PerspectiveCamera): RaycastHit | null {
    const hit = raycaster(world, camera);
    if (hit) {
      this.highlightMesh.position.set(hit.blockX + 0.5, hit.blockY + 0.5, hit.blockZ + 0.5);
      this.highlightMesh.visible = true;
    } else {
      this.highlightMesh.visible = false;
    }
    return hit;
  }

  public setVisible(visible: boolean): void {
    this.highlightMesh.visible = visible;
  }
}
