import * as THREE from 'three';
import { Chunk } from './Chunk';
import { buildChunkMesh } from './ChunkMesher';
import type { NeighborBorders } from './ChunkMesher';
import { worldToChunkCoord } from '../utils/math';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';

export class ChunkManager {
  private readonly chunks = new Map<string, Chunk>();
  private readonly meshes = new Map<string, THREE.Mesh>();
  private readonly waterMeshes = new Map<string, THREE.Mesh>();
  private readonly scene: THREE.Scene;

  private lastPlayerChunkX = NaN;
  private lastPlayerChunkZ = NaN;

  terrainFiller: ((chunk: Chunk) => void) | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private static key(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  getChunk(chunkX: number, chunkZ: number): Chunk | undefined {
    return this.chunks.get(ChunkManager.key(chunkX, chunkZ));
  }

  loadChunk(chunkX: number, chunkZ: number): Chunk {
    const key = ChunkManager.key(chunkX, chunkZ);

    const existing = this.chunks.get(key);
    if (existing) return existing;

    const chunk = new Chunk(chunkX, chunkZ);
    this.chunks.set(key, chunk);

    return chunk;
  }

  private extractEastBorder(chunk: Chunk): Uint8Array {
    const border = new Uint8Array(CHUNK_HEIGHT * CHUNK_SIZE_Z);
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        border[z + y * CHUNK_SIZE_Z] = chunk.getBlock(0, y, z);
      }
    }
    return border;
  }

  private extractWestBorder(chunk: Chunk): Uint8Array {
    const border = new Uint8Array(CHUNK_HEIGHT * CHUNK_SIZE_Z);
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        border[z + y * CHUNK_SIZE_Z] = chunk.getBlock(CHUNK_SIZE_X - 1, y, z);
      }
    }
    return border;
  }

  private extractNorthBorder(chunk: Chunk): Uint8Array {
    const border = new Uint8Array(CHUNK_HEIGHT * CHUNK_SIZE_X);
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_SIZE_X; x++) {
        border[x + y * CHUNK_SIZE_X] = chunk.getBlock(x, y, 0);
      }
    }
    return border;
  }

  private extractSouthBorder(chunk: Chunk): Uint8Array {
    const border = new Uint8Array(CHUNK_HEIGHT * CHUNK_SIZE_X);
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_SIZE_X; x++) {
        border[x + y * CHUNK_SIZE_X] = chunk.getBlock(x, y, CHUNK_SIZE_Z - 1);
      }
    }
    return border;
  }

  async meshChunk(chunkX: number, chunkZ: number): Promise<void> {
    const key = ChunkManager.key(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    if (!chunk) return;
    if (!chunk.isDirty) return;

    // Clean up old solid mesh
    const oldMesh = this.meshes.get(key);
    if (oldMesh) {
      this.scene.remove(oldMesh);
      oldMesh.geometry.dispose();
      const mat = oldMesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        (mat as THREE.Material).dispose();
      }
    }

    // Clean up old water mesh
    const oldWaterMesh = this.waterMeshes.get(key);
    if (oldWaterMesh) {
      this.scene.remove(oldWaterMesh);
      oldWaterMesh.geometry.dispose();
      (oldWaterMesh.material as THREE.Material).dispose();
    }

    const neighbors: NeighborBorders = {};
    const east = this.getChunk(chunkX + 1, chunkZ);
    if (east) neighbors.east = this.extractEastBorder(east);
    const west = this.getChunk(chunkX - 1, chunkZ);
    if (west) neighbors.west = this.extractWestBorder(west);
    const north = this.getChunk(chunkX, chunkZ + 1);
    if (north) neighbors.north = this.extractNorthBorder(north);
    const south = this.getChunk(chunkX, chunkZ - 1);
    if (south) neighbors.south = this.extractSouthBorder(south);

    const meshData = buildChunkMesh(chunk, neighbors);
    if (meshData) {
      // Create solid mesh
      const mesh = new THREE.Mesh(meshData.geometry, meshData.materials);
      mesh.position.set(
        chunkX * CHUNK_SIZE_X,
        0,
        chunkZ * CHUNK_SIZE_Z,
      );
      this.scene.add(mesh);
      this.meshes.set(key, mesh);

      // Create water mesh if present
      if (meshData.waterGeometry && meshData.waterMaterial) {
        const waterMesh = new THREE.Mesh(meshData.waterGeometry, meshData.waterMaterial);
        waterMesh.position.set(
          chunkX * CHUNK_SIZE_X,
          0,
          chunkZ * CHUNK_SIZE_Z,
        );
        waterMesh.renderOrder = 1;
        this.scene.add(waterMesh);
        this.waterMeshes.set(key, waterMesh);
      } else {
        this.waterMeshes.delete(key);
      }
    } else {
      this.meshes.delete(key);
      this.waterMeshes.delete(key);
    }

    chunk.isDirty = false;
  }

  unloadChunk(chunkX: number, chunkZ: number): void {
    const key = ChunkManager.key(chunkX, chunkZ);

    // Clean up solid mesh
    const mesh = this.meshes.get(key);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        (mesh.material as THREE.Material).dispose();
      }
      this.meshes.delete(key);
    }

    // Clean up water mesh
    const waterMesh = this.waterMeshes.get(key);
    if (waterMesh) {
      this.scene.remove(waterMesh);
      waterMesh.geometry.dispose();
      (waterMesh.material as THREE.Material).dispose();
      this.waterMeshes.delete(key);
    }

    this.chunks.delete(key);
  }

  get loadedCount(): number {
    return this.chunks.size;
  }

  forceReload(renderDistance: number, worldX: number, worldZ: number): void {
    this.lastPlayerChunkX = NaN;
    this.lastPlayerChunkZ = NaN;
    this.update(worldX, worldZ, renderDistance);
  }

  unloadAllChunks(): void {
    const keys = [...this.chunks.keys()];
    for (const key of keys) {
      const [cx, cz] = key.split(',').map(Number);
      this.unloadChunk(cx, cz);
    }
  }

  update(worldX: number, worldZ: number, renderDistance: number): void {
    const { chunkX, chunkZ } = worldToChunkCoord(worldX, 0, worldZ);

    if (chunkX === this.lastPlayerChunkX && chunkZ === this.lastPlayerChunkZ) return;

    this.lastPlayerChunkX = chunkX;
    this.lastPlayerChunkZ = chunkZ;

    const minCX = chunkX - renderDistance;
    const maxCX = chunkX + renderDistance;
    const minCZ = chunkZ - renderDistance;
    const maxCZ = chunkZ + renderDistance;

    for (const [key, _chunk] of this.chunks) {
      const [cx, cz] = key.split(',').map(Number);
      if (cx < minCX || cx > maxCX || cz < minCZ || cz > maxCZ) {
        this.unloadChunk(cx, cz);
      }
    }

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cz = minCZ; cz <= maxCZ; cz++) {
        if (!this.chunks.has(ChunkManager.key(cx, cz))) {
          const chunk = this.loadChunk(cx, cz);
          if (this.terrainFiller) {
            this.terrainFiller(chunk);
          } else {
            this.fillTestTerrain(chunk);
          }
          this.meshChunk(cx, cz);
        }
      }
    }
  }

  private fillTestTerrain(chunk: Chunk): void {
    chunk.fill(0);
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        for (let x = 0; x < CHUNK_SIZE_X; x++) {
          const blockId = y === 0 ? 2 : y === 1 ? 3 : 1;
          chunk.setBlock(x, y, z, blockId);
        }
      }
    }
  }
}
