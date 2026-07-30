import * as THREE from 'three';
import { Chunk } from './Chunk';
import { buildChunkMesh, buildChunkMeshFromWorkerData } from './ChunkMesher';
import type { NeighborBorders } from './ChunkMesher';
import { worldToChunkCoord } from '../utils/math';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';
import { getAllBlocks } from './BlockRegistry';
import ChunkWorker from './ChunkMesher.worker?worker';

export class ChunkManager {
  private readonly chunks = new Map<string, Chunk>();
  private readonly meshes = new Map<string, THREE.Mesh>();
  private readonly waterMeshes = new Map<string, THREE.Mesh>();
  private readonly scene: THREE.Scene;

  private worker: Worker | null = null;
  private nextRequestId = 1;

  private lastPlayerChunkX = NaN;
  private lastPlayerChunkZ = NaN;

  terrainFiller: ((chunk: Chunk) => void) | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initWorker();
  }

  private initWorker(): void {
    try {
      this.worker = new ChunkWorker();
      this.worker.postMessage({
        type: 'init',
        blockTypes: getAllBlocks().map((b) => ({
          id: b.id,
          solid: b.solid,
          transparent: b.transparent,
          name: b.name,
        })),
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (data.type === 'meshResult') {
          this.applyWorkerMeshResult(data);
        }
      };
    } catch (err) {
      console.warn('[ChunkManager] Web Worker initialization failed, using fallback:', err);
      this.worker = null;
    }
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

  meshChunk(chunkX: number, chunkZ: number): void {
    const key = ChunkManager.key(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    if (!chunk || !chunk.isDirty) return;

    const neighbors: NeighborBorders = {};
    const east = this.getChunk(chunkX + 1, chunkZ);
    if (east) neighbors.east = this.extractEastBorder(east);
    const west = this.getChunk(chunkX - 1, chunkZ);
    if (west) neighbors.west = this.extractWestBorder(west);
    const north = this.getChunk(chunkX, chunkZ + 1);
    if (north) neighbors.north = this.extractNorthBorder(north);
    const south = this.getChunk(chunkX, chunkZ - 1);
    if (south) neighbors.south = this.extractSouthBorder(south);

    if (this.worker) {
      const reqId = ++this.nextRequestId;
      this.worker.postMessage({
        type: 'mesh',
        id: reqId,
        chunkX,
        chunkZ,
        blocks: chunk.blocks,
        eastBorder: neighbors.east,
        westBorder: neighbors.west,
        northBorder: neighbors.north,
        southBorder: neighbors.south,
      });
      chunk.isDirty = false;
      return;
    }

    this.meshChunkSync(chunkX, chunkZ, neighbors);
    chunk.isDirty = false;
  }

  private meshChunkSync(chunkX: number, chunkZ: number, neighbors: NeighborBorders): void {
    const key = ChunkManager.key(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    if (!chunk) return;

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

    const meshData = buildChunkMesh(chunk, neighbors);
    if (meshData) {
      const mesh = new THREE.Mesh(meshData.geometry, meshData.materials);
      mesh.position.set(chunkX * CHUNK_SIZE_X, 0, chunkZ * CHUNK_SIZE_Z);
      this.scene.add(mesh);
      this.meshes.set(key, mesh);

      if (meshData.waterGeometry && meshData.waterMaterial) {
        const waterMesh = new THREE.Mesh(meshData.waterGeometry, meshData.waterMaterial);
        waterMesh.position.set(chunkX * CHUNK_SIZE_X, 0, chunkZ * CHUNK_SIZE_Z);
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
  }

  private applyWorkerMeshResult(data: {
    id: number;
    chunkX: number;
    chunkZ: number;
    quadCount: number;
    positions?: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;
    groupQuads?: Record<string, number>;
    waterQuadCount?: number;
    waterPositions?: Float32Array;
    waterNormals?: Float32Array;
    waterUvs?: Float32Array;
    waterIndices?: Uint32Array;
  }): void {
    const key = ChunkManager.key(data.chunkX, data.chunkZ);
    if (!this.chunks.has(key)) return;

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

    const meshData = buildChunkMeshFromWorkerData(data);
    if (meshData) {
      if (meshData.geometry.attributes.position && meshData.geometry.attributes.position.count > 0) {
        const mesh = new THREE.Mesh(meshData.geometry, meshData.materials);
        mesh.position.set(data.chunkX * CHUNK_SIZE_X, 0, data.chunkZ * CHUNK_SIZE_Z);
        this.scene.add(mesh);
        this.meshes.set(key, mesh);
      } else {
        this.meshes.delete(key);
      }

      if (meshData.waterGeometry && meshData.waterMaterial) {
        const waterMesh = new THREE.Mesh(meshData.waterGeometry, meshData.waterMaterial);
        waterMesh.position.set(data.chunkX * CHUNK_SIZE_X, 0, data.chunkZ * CHUNK_SIZE_Z);
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

  private loadQueue: { cx: number; cz: number }[] = [];

  update(worldX: number, worldZ: number, renderDistance: number): void {
    const { chunkX, chunkZ } = worldToChunkCoord(worldX, 0, worldZ);

    const minCX = chunkX - renderDistance;
    const maxCX = chunkX + renderDistance;
    const minCZ = chunkZ - renderDistance;
    const maxCZ = chunkZ + renderDistance;

    // Unload out-of-range chunks
    for (const key of this.chunks.keys()) {
      const [cx, cz] = key.split(',').map(Number);
      if (cx < minCX || cx > maxCX || cz < minCZ || cz > maxCZ) {
        this.unloadChunk(cx, cz);
      }
    }

    if (chunkX === this.lastPlayerChunkX && chunkZ === this.lastPlayerChunkZ) {
      this.processLoadQueue(2);
      return;
    }

    this.lastPlayerChunkX = chunkX;
    this.lastPlayerChunkZ = chunkZ;

    // Rebuild pending load queue sorted by distance to player chunk
    const pending: { cx: number; cz: number; distSq: number }[] = [];
    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cz = minCZ; cz <= maxCZ; cz++) {
        if (!this.chunks.has(ChunkManager.key(cx, cz))) {
          const dx = cx - chunkX;
          const dz = cz - chunkZ;
          pending.push({ cx, cz, distSq: dx * dx + dz * dz });
        }
      }
    }

    pending.sort((a, b) => a.distSq - b.distSq);
    this.loadQueue = pending.map((p) => ({ cx: p.cx, cz: p.cz }));

    this.processLoadQueue(2);
  }

  processLoadQueue(maxChunksPerFrame = 2): void {
    if (this.loadQueue.length === 0) {
      this.meshDirtyChunks(maxChunksPerFrame);
      return;
    }

    const count = Math.min(maxChunksPerFrame, this.loadQueue.length);
    const newChunks: Chunk[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.loadQueue.shift();
      if (!item) break;
      if (this.chunks.has(ChunkManager.key(item.cx, item.cz))) continue;

      const chunk = this.loadChunk(item.cx, item.cz);
      if (this.terrainFiller) {
        this.terrainFiller(chunk);
      } else {
        this.fillTestTerrain(chunk);
      }
      newChunks.push(chunk);
    }

    for (const chunk of newChunks) {
      const east = this.getChunk(chunk.chunkX + 1, chunk.chunkZ);
      if (east) east.isDirty = true;
      const west = this.getChunk(chunk.chunkX - 1, chunk.chunkZ);
      if (west) west.isDirty = true;
      const north = this.getChunk(chunk.chunkX, chunk.chunkZ + 1);
      if (north) north.isDirty = true;
      const south = this.getChunk(chunk.chunkX, chunk.chunkZ - 1);
      if (south) south.isDirty = true;
    }

    for (const chunk of newChunks) {
      this.meshChunk(chunk.chunkX, chunk.chunkZ);
    }
  }

  private meshDirtyChunks(maxCount = 2): void {
    let meshed = 0;
    for (const chunk of this.chunks.values()) {
      if (chunk.isDirty) {
        this.meshChunk(chunk.chunkX, chunk.chunkZ);
        meshed++;
        if (meshed >= maxCount) break;
      }
    }
  }

  private projScreenMatrix = new THREE.Matrix4();
  private frustum = new THREE.Frustum();

  updateFrustumCulling(camera: THREE.PerspectiveCamera): void {
    this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

    const box = new THREE.Box3();
    const minVec = new THREE.Vector3();
    const maxVec = new THREE.Vector3();

    this.meshes.forEach((mesh, key) => {
      const [cx, cz] = key.split(',').map(Number);
      minVec.set(cx * CHUNK_SIZE_X, 0, cz * CHUNK_SIZE_Z);
      maxVec.set((cx + 1) * CHUNK_SIZE_X, CHUNK_HEIGHT, (cz + 1) * CHUNK_SIZE_Z);
      box.set(minVec, maxVec);

      const isVisible = this.frustum.intersectsBox(box);
      mesh.visible = isVisible;

      const waterMesh = this.waterMeshes.get(key);
      if (waterMesh) {
        waterMesh.visible = isVisible;
      }
    });
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

