import * as THREE from 'three';
import { createBlockMaterial, getBlockById } from './BlockRegistry';
import type { Chunk } from './Chunk';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';

export interface ChunkMeshData {
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
  waterGeometry?: THREE.BufferGeometry;
  waterMaterial?: THREE.Material;
}

export interface NeighborBorders {
  east?: Uint8Array;
  west?: Uint8Array;
  north?: Uint8Array;
  south?: Uint8Array;
}

type Axis = 'x' | 'y' | 'z';

interface FaceAxis {
  dir: [number, number, number];
  planeAxis: Axis;
  aAxis: Axis;
  bAxis: Axis;
  planeSize: number;
  aSize: number;
  bSize: number;
  quadFacePos: number;
}

// prettier-ignore
const FACE_AXES: FaceAxis[] = [
  { dir: [ 0,  1,  0], planeAxis: 'y', aAxis: 'x', bAxis: 'z', planeSize: CHUNK_HEIGHT, aSize: CHUNK_SIZE_X, bSize: CHUNK_SIZE_Z, quadFacePos: 1 },
  { dir: [ 0, -1,  0], planeAxis: 'y', aAxis: 'x', bAxis: 'z', planeSize: CHUNK_HEIGHT, aSize: CHUNK_SIZE_X, bSize: CHUNK_SIZE_Z, quadFacePos: 0 },
  { dir: [ 1,  0,  0], planeAxis: 'x', aAxis: 'y', bAxis: 'z', planeSize: CHUNK_SIZE_X, aSize: CHUNK_HEIGHT, bSize: CHUNK_SIZE_Z, quadFacePos: 1 },
  { dir: [-1,  0,  0], planeAxis: 'x', aAxis: 'y', bAxis: 'z', planeSize: CHUNK_SIZE_X, aSize: CHUNK_HEIGHT, bSize: CHUNK_SIZE_Z, quadFacePos: 0 },
  { dir: [ 0,  0,  1], planeAxis: 'z', aAxis: 'x', bAxis: 'y', planeSize: CHUNK_SIZE_Z, aSize: CHUNK_SIZE_X, bSize: CHUNK_HEIGHT, quadFacePos: 1 },
  { dir: [ 0,  0, -1], planeAxis: 'z', aAxis: 'x', bAxis: 'y', planeSize: CHUNK_SIZE_Z, aSize: CHUNK_SIZE_X, bSize: CHUNK_HEIGHT, quadFacePos: 0 },
];

const MAX_DIM = Math.max(CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT);
const MAX_QUADS = CHUNK_SIZE_X * CHUNK_SIZE_Z * CHUNK_HEIGHT * 6;

function borderIndexX(y: number, z: number): number {
  return z + y * CHUNK_SIZE_Z;
}
function borderIndexZ(x: number, y: number): number {
  return x + y * CHUNK_SIZE_X;
}
function blockIndex(x: number, y: number, z: number): number {
  return x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;
}
function getAxisVal(x: number, y: number, z: number, axis: Axis): number {
  if (axis === 'x') return x;
  if (axis === 'y') return y;
  return z;
}
function setAxis(xa: number[], ya: number[], za: number[], axis: Axis, val: number): void {
  if (axis === 'x') { xa[0] = val; return; }
  if (axis === 'y') { ya[0] = val; return; }
  za[0] = val;
}

function isSolid(blockId: number): boolean {
  const b = getBlockById(blockId);
  return b ? b.solid : false;
}

function isOpaque(blockId: number): boolean {
  const b = getBlockById(blockId);
  return b ? b.solid && !b.transparent : false;
}

function isWater(blockId: number): boolean {
  const b = getBlockById(blockId);
  return b ? b.name === 'water' : false;
}

interface QuadData {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

function isFaceVisible(
  blocks: Uint8Array,
  x: number, y: number, z: number,
  nx: number, ny: number, nz: number,
  currentBlockId: number,
  eastBorder?: Uint8Array, westBorder?: Uint8Array,
  northBorder?: Uint8Array, southBorder?: Uint8Array,
): boolean {
  const nxPos = x + nx;
  const nyPos = y + ny;
  const nzPos = z + nz;
  if (nyPos < 0 || nyPos >= CHUNK_HEIGHT) return true;

  let neighborId: number;
  
  if (nxPos < 0 && westBorder) {
    neighborId = westBorder[borderIndexX(nyPos, z)];
  } else if (nxPos >= CHUNK_SIZE_X && eastBorder) {
    neighborId = eastBorder[borderIndexX(nyPos, z)];
  } else if (nzPos < 0 && southBorder) {
    neighborId = southBorder[borderIndexZ(x, nyPos)];
  } else if (nzPos >= CHUNK_SIZE_Z && northBorder) {
    neighborId = northBorder[borderIndexZ(x, nyPos)];
  } else if (nxPos < 0 || nxPos >= CHUNK_SIZE_X || nzPos < 0 || nzPos >= CHUNK_SIZE_Z) {
    return true;
  } else {
    neighborId = blocks[blockIndex(nxPos, nyPos, nzPos)];
  }

  // Air neighbor - always visible
  if (neighborId === 0) return true;
  
  // Same block type - don't render (prevents z-fighting for transparent blocks)
  if (neighborId === currentBlockId) return false;
  
  // Opaque neighbor - cull the face
  if (isOpaque(neighborId)) return false;
  
  // Transparent neighbor (different type) - render the face
  return true;
}

function doMesh(
  blocks: Uint8Array,
  pos: Float32Array, nrm: Float32Array, uv: Float32Array, idx: Uint32Array,
  eastBorder?: Uint8Array, westBorder?: Uint8Array,
  northBorder?: Uint8Array, southBorder?: Uint8Array,
): { quadCount: number; vertexIndex: number; groupQuads: Map<number, number> } {
  const mask = new Uint8Array(MAX_DIM * MAX_DIM);
  const visited = new Uint8Array(MAX_DIM * MAX_DIM);

  // Phase 1: Collect quads grouped by blockId
  const blockGroups = new Map<number, QuadData[]>();

  for (const fa of FACE_AXES) {
    for (let plane = 0; plane < fa.planeSize; plane++) {
      mask.fill(0);
      visited.fill(0);

      const px: number[] = [0], py: number[] = [0], pz: number[] = [0];
      setAxis(px, py, pz, fa.planeAxis, plane);

      for (let b = 0; b < fa.bSize; b++) {
        setAxis(px, py, pz, fa.bAxis, b);
        for (let a = 0; a < fa.aSize; a++) {
          setAxis(px, py, pz, fa.aAxis, a);
          const bid = blocks[blockIndex(px[0], py[0], pz[0])];

          if (bid === 0 || isWater(bid)) continue;
          if (!isSolid(bid)) continue;

          if (isFaceVisible(blocks, px[0], py[0], pz[0], fa.dir[0], fa.dir[1], fa.dir[2], bid, eastBorder, westBorder, northBorder, southBorder)) {
            mask[b * fa.aSize + a] = bid;
          }
        }
      }

      for (let b = 0; b < fa.bSize; b++) {
        for (let a = 0; a < fa.aSize; a++) {
          const mi = b * fa.aSize + a;
          const bid = mask[mi];
          if (bid === 0 || visited[mi]) continue;

          let w = 1;
          while (a + w < fa.aSize && mask[mi + w] === bid && !visited[mi + w]) w++;
          let h = 1;
          outer: for (; b + h < fa.bSize; h++) {
            for (let k = 0; k < w; k++) {
              if (mask[(b + h) * fa.aSize + a + k] !== bid || visited[(b + h) * fa.aSize + a + k]) break outer;
            }
          }
          for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) visited[(b + dy) * fa.aSize + a + dx] = 1;

          const bx: number[] = [0], by: number[] = [0], bz: number[] = [0];
          setAxis(bx, by, bz, fa.planeAxis, plane);
          setAxis(bx, by, bz, fa.aAxis, a);
          setAxis(bx, by, bz, fa.bAxis, b);

          const px2: number[] = [bx[0]], py2: number[] = [by[0]], pz2: number[] = [bz[0]];
          setAxis(px2, py2, pz2, fa.planeAxis, getAxisVal(bx[0], by[0], bz[0], fa.planeAxis) + fa.quadFacePos);

          const ax0 = getAxisVal(bx[0], by[0], bz[0], fa.aAxis);
          const bx0 = getAxisVal(bx[0], by[0], bz[0], fa.bAxis);
          const corners: [number, number][] = [[ax0 + w, bx0], [ax0, bx0], [ax0, bx0 + h], [ax0 + w, bx0 + h]];

          const quadPositions: number[] = [];
          const quadNormals: number[] = [];
          const quadUVs: number[] = [];

          for (let v = 0; v < 4; v++) {
            const cp = [px2[0], py2[0], pz2[0]];
            if (fa.aAxis === 'x') cp[0] = corners[v][0];
            else if (fa.aAxis === 'y') cp[1] = corners[v][0];
            else cp[2] = corners[v][0];

            if (fa.bAxis === 'x') cp[0] = corners[v][1];
            else if (fa.bAxis === 'y') cp[1] = corners[v][1];
            else cp[2] = corners[v][1];

            quadPositions.push(cp[0], cp[1], cp[2]);
            quadNormals.push(fa.dir[0], fa.dir[1], fa.dir[2]);
            quadUVs.push(v === 0 || v === 3 ? w : 0, v < 2 ? 0 : h);
          }

          const indices = fa.quadFacePos === 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];

          if (!blockGroups.has(bid)) {
            blockGroups.set(bid, []);
          }
          blockGroups.get(bid)!.push({
            positions: quadPositions,
            normals: quadNormals,
            uvs: quadUVs,
            indices,
          });
        }
      }
    }
  }

  // Phase 2: Flatten grouped quads into final buffers
  let quadCount = 0;
  const groupQuads = new Map<number, number>();

  const sortedBlockIds = Array.from(blockGroups.keys()).sort((a, b) => a - b);

  for (const bid of sortedBlockIds) {
    const quads = blockGroups.get(bid)!;
    groupQuads.set(bid, quads.length);

    for (const quad of quads) {
      const baseVertex = quadCount * 4;
      const baseIdx = quadCount * 6;

      for (let i = 0; i < 12; i++) {
        pos[baseVertex * 3 + i] = quad.positions[i];
      }

      for (let i = 0; i < 12; i++) {
        nrm[baseVertex * 3 + i] = quad.normals[i];
      }

      for (let i = 0; i < 8; i++) {
        uv[baseVertex * 2 + i] = quad.uvs[i];
      }

      for (let i = 0; i < 6; i++) {
        idx[baseIdx + i] = quad.indices[i] + baseVertex;
      }

      quadCount++;
    }
  }

  return { quadCount, vertexIndex: quadCount * 4, groupQuads };
}

function doWaterMesh(
  blocks: Uint8Array,
  pos: Float32Array, nrm: Float32Array, uv: Float32Array, idx: Uint32Array,
  eastBorder?: Uint8Array, westBorder?: Uint8Array,
  northBorder?: Uint8Array, southBorder?: Uint8Array,
): { quadCount: number; vertexIndex: number } {
  const mask = new Uint8Array(MAX_DIM * MAX_DIM);
  const visited = new Uint8Array(MAX_DIM * MAX_DIM);

  // Phase 1: Collect quads grouped by blockId
  const blockGroups = new Map<number, QuadData[]>();

  for (const fa of FACE_AXES) {
    for (let plane = 0; plane < fa.planeSize; plane++) {
      mask.fill(0);
      visited.fill(0);

      const px: number[] = [0], py: number[] = [0], pz: number[] = [0];
      setAxis(px, py, pz, fa.planeAxis, plane);

      for (let b = 0; b < fa.bSize; b++) {
        setAxis(px, py, pz, fa.bAxis, b);
        for (let a = 0; a < fa.aSize; a++) {
          setAxis(px, py, pz, fa.aAxis, a);
          const bid = blocks[blockIndex(px[0], py[0], pz[0])];

          if (!isWater(bid)) continue;

          if (isFaceVisible(blocks, px[0], py[0], pz[0], fa.dir[0], fa.dir[1], fa.dir[2], bid, eastBorder, westBorder, northBorder, southBorder)) {
            mask[b * fa.aSize + a] = bid;
          }
        }
      }

      for (let b = 0; b < fa.bSize; b++) {
        for (let a = 0; a < fa.aSize; a++) {
          const mi = b * fa.aSize + a;
          const bid = mask[mi];
          if (bid === 0 || visited[mi]) continue;

          let w = 1;
          while (a + w < fa.aSize && mask[mi + w] === bid && !visited[mi + w]) w++;
          let h = 1;
          outer2: for (; b + h < fa.bSize; h++) {
            for (let k = 0; k < w; k++) {
              if (mask[(b + h) * fa.aSize + a + k] !== bid || visited[(b + h) * fa.aSize + a + k]) break outer2;
            }
          }
          for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) visited[(b + dy) * fa.aSize + a + dx] = 1;

          const bx: number[] = [0], by: number[] = [0], bz: number[] = [0];
          setAxis(bx, by, bz, fa.planeAxis, plane);
          setAxis(bx, by, bz, fa.aAxis, a);
          setAxis(bx, by, bz, fa.bAxis, b);

          const px2: number[] = [bx[0]], py2: number[] = [by[0]], pz2: number[] = [bz[0]];
          setAxis(px2, py2, pz2, fa.planeAxis, getAxisVal(bx[0], by[0], bz[0], fa.planeAxis) + fa.quadFacePos);

          const ax0 = getAxisVal(bx[0], by[0], bz[0], fa.aAxis);
          const bx0 = getAxisVal(bx[0], by[0], bz[0], fa.bAxis);
          const corners: [number, number][] = [[ax0 + w, bx0], [ax0, bx0], [ax0, bx0 + h], [ax0 + w, bx0 + h]];

          const quadPositions: number[] = [];
          const quadNormals: number[] = [];
          const quadUVs: number[] = [];

          for (let v = 0; v < 4; v++) {
            const cp = [px2[0], py2[0], pz2[0]];
            if (fa.aAxis === 'x') cp[0] = corners[v][0];
            else if (fa.aAxis === 'y') cp[1] = corners[v][0];
            else cp[2] = corners[v][0];

            if (fa.bAxis === 'x') cp[0] = corners[v][1];
            else if (fa.bAxis === 'y') cp[1] = corners[v][1];
            else cp[2] = corners[v][1];

            quadPositions.push(cp[0], cp[1], cp[2]);
            quadNormals.push(fa.dir[0], fa.dir[1], fa.dir[2]);
            quadUVs.push(v === 0 || v === 3 ? w : 0, v < 2 ? 0 : h);
          }

          const indices = fa.quadFacePos === 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];

          if (!blockGroups.has(bid)) {
            blockGroups.set(bid, []);
          }
          blockGroups.get(bid)!.push({
            positions: quadPositions,
            normals: quadNormals,
            uvs: quadUVs,
            indices,
          });
        }
      }
    }
  }

  // Phase 2: Flatten grouped quads into final buffers
  let quadCount = 0;

  const sortedBlockIds = Array.from(blockGroups.keys()).sort((a, b) => a - b);

  for (const bid of sortedBlockIds) {
    const quads = blockGroups.get(bid)!;

    for (const quad of quads) {
      const baseVertex = quadCount * 4;
      const baseIdx = quadCount * 6;

      for (let i = 0; i < 12; i++) {
        pos[baseVertex * 3 + i] = quad.positions[i];
      }

      for (let i = 0; i < 12; i++) {
        nrm[baseVertex * 3 + i] = quad.normals[i];
      }

      for (let i = 0; i < 8; i++) {
        uv[baseVertex * 2 + i] = quad.uvs[i];
      }

      for (let i = 0; i < 6; i++) {
        idx[baseIdx + i] = quad.indices[i] + baseVertex;
      }

      quadCount++;
    }
  }

  return { quadCount, vertexIndex: quadCount * 4 };
}

export function buildChunkMesh(
  chunk: Chunk,
  neighbors?: NeighborBorders,
): ChunkMeshData | null {
  // Solid mesh pass
  const pos = new Float32Array(MAX_QUADS * 4 * 3);
  const nrm = new Float32Array(MAX_QUADS * 4 * 3);
  const uv = new Float32Array(MAX_QUADS * 4 * 2);
  const idx = new Uint32Array(MAX_QUADS * 6);

  const blocks = chunk.blocks;
  const { quadCount, vertexIndex, groupQuads } = doMesh(
    blocks, pos, nrm, uv, idx,
    neighbors?.east, neighbors?.west, neighbors?.north, neighbors?.south,
  );

  if (quadCount === 0) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, vertexIndex * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(nrm.slice(0, vertexIndex * 3), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv.slice(0, vertexIndex * 2), 2));
  geometry.setIndex(new THREE.BufferAttribute(idx.slice(0, quadCount * 6), 1));
  geometry.computeBoundingSphere();

  const materials: THREE.Material[] = [];
  const groups: { blockId: number; quadCount: number }[] = [];
  
  // IMPORTANT: Must iterate in same sorted order as doMesh() flattening
  const sortedBlockIds = Array.from(groupQuads.keys()).sort((a, b) => a - b);
  for (const blockId of sortedBlockIds) {
    const quadCount = groupQuads.get(blockId)!;
    groups.push({ blockId, quadCount });
  }

  let indexOffset = 0;
  for (const group of groups) {
    const mat = createBlockMaterial(group.blockId);
    const matIdx = materials.length;
    materials.push(...(Array.isArray(mat) ? mat : [mat]));
    geometry.addGroup(indexOffset * 6, group.quadCount * 6, matIdx);
    indexOffset += group.quadCount;
  }

  // Water mesh pass
  const waterPos = new Float32Array(MAX_QUADS * 4 * 3);
  const waterNrm = new Float32Array(MAX_QUADS * 4 * 3);
  const waterUv = new Float32Array(MAX_QUADS * 4 * 2);
  const waterIdx = new Uint32Array(MAX_QUADS * 6);

  const waterResult = doWaterMesh(
    blocks, waterPos, waterNrm, waterUv, waterIdx,
    neighbors?.east, neighbors?.west, neighbors?.north, neighbors?.south,
  );

  let waterGeometry: THREE.BufferGeometry | undefined;
  let waterMaterial: THREE.Material | undefined;

  if (waterResult.quadCount > 0) {
    waterGeometry = new THREE.BufferGeometry();
    waterGeometry.setAttribute('position', new THREE.BufferAttribute(waterPos.slice(0, waterResult.vertexIndex * 3), 3));
    waterGeometry.setAttribute('normal', new THREE.BufferAttribute(waterNrm.slice(0, waterResult.vertexIndex * 3), 3));
    waterGeometry.setAttribute('uv', new THREE.BufferAttribute(waterUv.slice(0, waterResult.vertexIndex * 2), 2));
    waterGeometry.setIndex(new THREE.BufferAttribute(waterIdx.slice(0, waterResult.quadCount * 6), 1));
    waterGeometry.computeBoundingSphere();

    waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  return { geometry, materials, waterGeometry, waterMaterial };
}

// Placeholder for async worker path (not yet used)
export async function buildChunkMeshAsync(
  chunk: Chunk,
  neighbors?: NeighborBorders,
): Promise<ChunkMeshData | null> {
  return buildChunkMesh(chunk, neighbors);
}
