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

const FACE_TO_MAT_OFFSET = [2, 3, 0, 1, 4, 5];

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

function isOpaque(blockId: number): boolean {
  const b = getBlockById(blockId);
  return b ? b.solid && !b.transparent : false;
}

function isWater(blockId: number): boolean {
  const b = getBlockById(blockId);
  return b ? b.name === 'water' : false;
}

function getFaceIndices(faIdx: number): number[] {
  if (faIdx === 0 || faIdx === 3 || faIdx === 5) {
    return [0, 1, 2, 0, 2, 3];
  }
  return [0, 2, 1, 0, 3, 2];
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
): { quadCount: number; vertexIndex: number; groupQuads: Map<string, number> } {
  const mask = new Uint8Array(MAX_DIM * MAX_DIM);
  const visited = new Uint8Array(MAX_DIM * MAX_DIM);

  // Phase 1: Collect quads grouped by (blockId_faIdx)
  const blockGroups = new Map<string, QuadData[]>();

  for (let faIdx = 0; faIdx < FACE_AXES.length; faIdx++) {
    const fa = FACE_AXES[faIdx];
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

          if (bid === 0 || isWater(bid) || bid === 11 || bid === 14) continue;

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
          
          const minA = ax0, maxA = ax0 + w;
          const minB = bx0, maxB = bx0 + h;

          const corners: [number, number][] = [[maxA, minB], [minA, minB], [minA, maxB], [maxA, maxB]];

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
            if (faIdx === 2 || faIdx === 3) {
              const uTex = v === 2 || v === 3 ? h : 0;
              const vTex = v === 0 || v === 3 ? w : 0;
              quadUVs.push(uTex, vTex);
            } else {
              quadUVs.push(v === 0 || v === 3 ? w : 0, v < 2 ? 0 : h);
            }
          }

          const indices = getFaceIndices(faIdx);
          const groupKey = `${bid}_${faIdx}`;

          if (!blockGroups.has(groupKey)) {
            blockGroups.set(groupKey, []);
          }
          blockGroups.get(groupKey)!.push({
            positions: quadPositions,
            normals: quadNormals,
            uvs: quadUVs,
            indices,
          });
        }
      }
    }
  }

  // Cross-Mesh Pass for Torches (11) and Crops (14)
  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    for (let z = 0; z < CHUNK_SIZE_Z; z++) {
      for (let x = 0; x < CHUNK_SIZE_X; x++) {
        const bid = blocks[blockIndex(x, y, z)];
        if (bid === 11 || bid === 14) {
          const x0 = x + 0.15, x1 = x + 0.85;
          const y0 = y, y1 = y + 0.85;
          const z0 = z + 0.15, z1 = z + 0.85;

          const pos1 = [x0, y1, z0, x1, y1, z1, x1, y0, z1, x0, y0, z0];
          const nrm1 = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const uvs1 = [0, 1, 1, 1, 1, 0, 0, 0];
          const idx1 = [0, 1, 2, 0, 2, 3];

          const pos2 = [x0, y1, z1, x1, y1, z0, x1, y0, z0, x0, y0, z1];
          const nrm2 = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const uvs2 = [0, 1, 1, 1, 1, 0, 0, 0];
          const idx2 = [0, 1, 2, 0, 2, 3];

          const groupKey0 = `${bid}_0`;
          if (!blockGroups.has(groupKey0)) blockGroups.set(groupKey0, []);
          blockGroups.get(groupKey0)!.push({ positions: pos1, normals: nrm1, uvs: uvs1, indices: idx1 });

          const groupKey1 = `${bid}_1`;
          if (!blockGroups.has(groupKey1)) blockGroups.set(groupKey1, []);
          blockGroups.get(groupKey1)!.push({ positions: pos2, normals: nrm2, uvs: uvs2, indices: idx2 });
        }
      }
    }
  }

  // Phase 2: Flatten grouped quads into final buffers
  let quadCount = 0;
  const groupQuads = new Map<string, number>();

  const sortedKeys = Array.from(blockGroups.keys()).sort((a, b) => {
    const [bidA, faA] = a.split('_').map(Number);
    const [bidB, faB] = b.split('_').map(Number);
    if (bidA !== bidB) return bidA - bidB;
    return faA - faB;
  });

  for (const key of sortedKeys) {
    const quads = blockGroups.get(key)!;
    groupQuads.set(key, quads.length);

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

  const blockGroups = new Map<string, QuadData[]>();

  for (let faIdx = 0; faIdx < FACE_AXES.length; faIdx++) {
    const fa = FACE_AXES[faIdx];
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
            if (faIdx === 2 || faIdx === 3) {
              const uTex = v === 2 || v === 3 ? h : 0;
              const vTex = v === 0 || v === 3 ? w : 0;
              quadUVs.push(uTex, vTex);
            } else {
              quadUVs.push(v === 0 || v === 3 ? w : 0, v < 2 ? 0 : h);
            }
          }

          const indices = getFaceIndices(faIdx);
          const groupKey = `${bid}_${faIdx}`;

          if (!blockGroups.has(groupKey)) {
            blockGroups.set(groupKey, []);
          }
          blockGroups.get(groupKey)!.push({
            positions: quadPositions,
            normals: quadNormals,
            uvs: quadUVs,
            indices,
          });
        }
      }
    }
  }

  let quadCount = 0;

  const sortedKeys = Array.from(blockGroups.keys()).sort((a, b) => {
    const [bidA, faA] = a.split('_').map(Number);
    const [bidB, faB] = b.split('_').map(Number);
    if (bidA !== bidB) return bidA - bidB;
    return faA - faB;
  });

  for (const key of sortedKeys) {
    const quads = blockGroups.get(key)!;

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
  
  // Extract unique blockIds in sorted order
  const blockIds = Array.from(new Set(Array.from(groupQuads.keys()).map((k) => Number(k.split('_')[0])))).sort((a, b) => a - b);

  let indexOffset = 0;
  for (const bid of blockIds) {
    const mat = createBlockMaterial(bid);
    if (Array.isArray(mat)) {
      const baseMatIdx = materials.length;
      materials.push(...mat);
      for (let faIdx = 0; faIdx < 6; faIdx++) {
        const qc = groupQuads.get(`${bid}_${faIdx}`);
        if (qc && qc > 0) {
          const targetMatIdx = baseMatIdx + FACE_TO_MAT_OFFSET[faIdx];
          geometry.addGroup(indexOffset * 6, qc * 6, targetMatIdx);
          indexOffset += qc;
        }
      }
    } else {
      const matIdx = materials.length;
      materials.push(mat);
      for (let faIdx = 0; faIdx < 6; faIdx++) {
        const qc = groupQuads.get(`${bid}_${faIdx}`);
        if (qc && qc > 0) {
          geometry.addGroup(indexOffset * 6, qc * 6, matIdx);
          indexOffset += qc;
        }
      }
    }
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

export function buildChunkMeshFromWorkerData(data: {
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
}): ChunkMeshData | null {
  if (data.quadCount === 0 && (!data.waterQuadCount || data.waterQuadCount === 0)) {
    return null;
  }

  let geometry: THREE.BufferGeometry | undefined;
  const materials: THREE.Material[] = [];

  if (data.quadCount > 0 && data.positions && data.normals && data.uvs && data.indices && data.groupQuads) {
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(data.uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geometry.computeBoundingSphere();

    const groupQuads = new Map<string, number>(Object.entries(data.groupQuads));
    const blockIds = Array.from(new Set(Array.from(groupQuads.keys()).map((k) => Number(k.split('_')[0])))).sort((a, b) => a - b);

    let indexOffset = 0;
    for (const bid of blockIds) {
      const mat = createBlockMaterial(bid);
      if (Array.isArray(mat)) {
        const baseMatIdx = materials.length;
        materials.push(...mat);
        for (let faIdx = 0; faIdx < 6; faIdx++) {
          const qc = groupQuads.get(`${bid}_${faIdx}`);
          if (qc && qc > 0) {
            const targetMatIdx = baseMatIdx + FACE_TO_MAT_OFFSET[faIdx];
            geometry.addGroup(indexOffset * 6, qc * 6, targetMatIdx);
            indexOffset += qc;
          }
        }
      } else {
        const matIdx = materials.length;
        materials.push(mat);
        for (let faIdx = 0; faIdx < 6; faIdx++) {
          const qc = groupQuads.get(`${bid}_${faIdx}`);
          if (qc && qc > 0) {
            geometry.addGroup(indexOffset * 6, qc * 6, matIdx);
            indexOffset += qc;
          }
        }
      }
    }
  }

  let waterGeometry: THREE.BufferGeometry | undefined;
  let waterMaterial: THREE.Material | undefined;

  if (data.waterQuadCount && data.waterQuadCount > 0 && data.waterPositions && data.waterNormals && data.waterUvs && data.waterIndices) {
    waterGeometry = new THREE.BufferGeometry();
    waterGeometry.setAttribute('position', new THREE.BufferAttribute(data.waterPositions, 3));
    waterGeometry.setAttribute('normal', new THREE.BufferAttribute(data.waterNormals, 3));
    waterGeometry.setAttribute('uv', new THREE.BufferAttribute(data.waterUvs, 2));
    waterGeometry.setIndex(new THREE.BufferAttribute(data.waterIndices, 1));
    waterGeometry.computeBoundingSphere();

    waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  if (!geometry && !waterGeometry) return null;

  return {
    geometry: geometry ?? new THREE.BufferGeometry(),
    materials,
    waterGeometry,
    waterMaterial,
  };
}

// Placeholder for async worker path (not yet used)
export async function buildChunkMeshAsync(
  chunk: Chunk,
  neighbors?: NeighborBorders,
): Promise<ChunkMeshData | null> {
  return buildChunkMesh(chunk, neighbors);
}

