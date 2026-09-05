// Web Worker: greedy voxel meshing (no Three.js dependency)
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';

interface BlockInfo {
  id: number;
  solid: boolean;
  transparent: boolean;
  name?: string;
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

let blockById: (BlockInfo | undefined)[] = [];

function getBlock(id: number): BlockInfo | undefined {
  return blockById[id];
}

function isOpaque(id: number): boolean {
  const b = getBlock(id);
  return b ? b.solid && !b.transparent : false;
}

function isWater(id: number): boolean {
  const b = getBlock(id);
  return b ? b.name === 'water' : false;
}

function getFaceIndices(faIdx: number): number[] {
  if (faIdx === 0 || faIdx === 3 || faIdx === 5) {
    return [0, 1, 2, 0, 2, 3];
  }
  return [0, 2, 1, 0, 3, 2];
}

const mask = new Uint8Array(MAX_DIM * MAX_DIM);
const visited = new Uint8Array(MAX_DIM * MAX_DIM);

const POS = new Float32Array(MAX_QUADS * 4 * 3);
const NRM = new Float32Array(MAX_QUADS * 4 * 3);
const UV = new Float32Array(MAX_QUADS * 4 * 2);
const IDX = new Uint32Array(MAX_QUADS * 6);

const WATER_POS = new Float32Array(MAX_QUADS * 4 * 3);
const WATER_NRM = new Float32Array(MAX_QUADS * 4 * 3);
const WATER_UV = new Float32Array(MAX_QUADS * 4 * 2);
const WATER_IDX = new Uint32Array(MAX_QUADS * 6);

function borderIndexX(y: number, z: number): number {
  return z + y * CHUNK_SIZE_Z;
}

function borderIndexZ(x: number, y: number): number {
  return x + y * CHUNK_SIZE_X;
}

function getAxisVal(x: number, y: number, z: number, axis: Axis): number {
  if (axis === 'x') return x;
  if (axis === 'y') return y;
  return z;
}

function setAxis(x: number[], y: number[], z: number[], axis: Axis, val: number): void {
  if (axis === 'x') { x[0] = val; return; }
  if (axis === 'y') { y[0] = val; return; }
  z[0] = val;
}

function blockIndex(x: number, y: number, z: number): number {
  return x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;
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

  if (neighborId === 0) return true;
  if (neighborId === currentBlockId) return false;
  if (isOpaque(neighborId)) return false;
  return true;
}

interface QuadData {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

function meshSolid(
  blocks: Uint8Array,
  eastBorder?: Uint8Array,
  westBorder?: Uint8Array,
  northBorder?: Uint8Array,
  southBorder?: Uint8Array,
) {
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
          const x = px[0], y = py[0], z = pz[0];
          const bid = blocks[blockIndex(x, y, z)];
          if (bid === 0 || isWater(bid) || bid === 11 || bid === 14 || bid === 25 || bid === 26 || bid === 27 || bid === 28) continue;

          if (isFaceVisible(blocks, x, y, z, fa.dir[0], fa.dir[1], fa.dir[2], bid, eastBorder, westBorder, northBorder, southBorder)) {
            mask[b * fa.aSize + a] = bid;
          }
        }
      }

      for (let b = 0; b < fa.bSize; b++) {
        for (let a = 0; a < fa.aSize; a++) {
          const idx = b * fa.aSize + a;
          const bid = mask[idx];
          if (bid === 0 || visited[idx]) continue;

          let w = 1;
          while (a + w < fa.aSize && mask[idx + w] === bid && !visited[idx + w]) w++;
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

  // Cross-Mesh Pass for Torches (11) and Crops (14, 25, 26)
  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    for (let z = 0; z < CHUNK_SIZE_Z; z++) {
      for (let x = 0; x < CHUNK_SIZE_X; x++) {
        const bid = blocks[blockIndex(x, y, z)];
        if (bid === 11 || bid === 14 || bid === 25 || bid === 26) {
          const heightOffset = bid === 25 ? 0.45 : bid === 26 ? 0.65 : 0.85;
          const x0 = x + 0.15, x1 = x + 0.85;
          const y0 = y, y1 = y + heightOffset;
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
        } else if (bid === 28) {
          // Spike Trap: Thin metal base plate + 4 sharp intersecting spike blades
          const yBase = y + 0.06;
          const yTop = y + 0.65;
          const xMin = x + 0.1, xMax = x + 0.9;
          const zMin = z + 0.1, zMax = z + 0.9;
          const xMid = x + 0.5, zMid = z + 0.5;

          // 1. Horizontal Base Plate (Top)
          const basePos = [xMax, yBase, zMin, xMin, yBase, zMin, xMin, yBase, zMax, xMax, yBase, zMax];
          const baseNrm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const baseUv = [1, 1, 0, 1, 0, 0.82, 1, 0.82];
          const baseIdx = [0, 1, 2, 0, 2, 3];

          // 2. Diagonal Blade 1: (xMin, zMin) to (xMax, zMax)
          const d1Pos = [xMin, yTop, zMin, xMax, yTop, zMax, xMax, y, zMax, xMin, y, zMin];
          const d1Nrm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const d1Uv = [0, 1, 1, 1, 1, 0, 0, 0];
          const d1Idx = [0, 1, 2, 0, 2, 3];

          // 3. Diagonal Blade 2: (xMin, zMax) to (xMax, zMin)
          const d2Pos = [xMin, yTop, zMax, xMax, yTop, zMin, xMax, y, zMin, xMin, y, zMax];
          const d2Nrm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const d2Uv = [0, 1, 1, 1, 1, 0, 0, 0];
          const d2Idx = [0, 1, 2, 0, 2, 3];

          // 4. Center Blade X: (xMin, zMid) to (xMax, zMid)
          const cxPos = [xMin, yTop, zMid, xMax, yTop, zMid, xMax, y, zMid, xMin, y, zMid];
          const cxNrm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const cxUv = [0, 1, 1, 1, 1, 0, 0, 0];
          const cxIdx = [0, 1, 2, 0, 2, 3];

          // 5. Center Blade Z: (xMid, zMin) to (xMid, zMax)
          const czPos = [xMid, yTop, zMin, xMid, yTop, zMax, xMid, y, zMax, xMid, y, zMin];
          const czNrm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
          const czUv = [0, 1, 1, 1, 1, 0, 0, 0];
          const czIdx = [0, 1, 2, 0, 2, 3];

          const quads = [
            { pos: basePos, nrm: baseNrm, uv: baseUv, idx: baseIdx },
            { pos: d1Pos, nrm: d1Nrm, uv: d1Uv, idx: d1Idx },
            { pos: d2Pos, nrm: d2Nrm, uv: d2Uv, idx: d2Idx },
            { pos: cxPos, nrm: cxNrm, uv: cxUv, idx: cxIdx },
            { pos: czPos, nrm: czNrm, uv: czUv, idx: czIdx },
          ];

          quads.forEach((q, qIdx) => {
            const groupKey = `${bid}_${qIdx}`;
            if (!blockGroups.has(groupKey)) blockGroups.set(groupKey, []);
            blockGroups.get(groupKey)!.push({ positions: q.pos, normals: q.nrm, uvs: q.uv, indices: q.idx });
          });
        } else if (bid === 27) {
          // Wooden Fence: 1.5 blocks tall post + dynamic connecting crossbars
          const pMinX = x + 0.375, pMaxX = x + 0.625;
          const pMinZ = z + 0.375, pMaxZ = z + 0.625;
          const y0 = y, y15 = y + 1.5;

          const addFace = (faIdx: number, p: number[], uv: number[], n: number[]) => {
            const groupKey = `${bid}_${faIdx}`;
            if (!blockGroups.has(groupKey)) blockGroups.set(groupKey, []);
            blockGroups.get(groupKey)!.push({ positions: p, normals: n, uvs: uv, indices: [0, 1, 2, 0, 2, 3] });
          };

          // 1. Central Post (Height: y to y + 1.5)
          // Top (+Y -> faIdx 0)
          addFace(0, [pMaxX, y15, pMinZ, pMinX, y15, pMinZ, pMinX, y15, pMaxZ, pMaxX, y15, pMaxZ], [1, 1, 0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
          // Bottom (-Y -> faIdx 1)
          addFace(1, [pMinX, y0, pMinZ, pMaxX, y0, pMinZ, pMaxX, y0, pMaxZ, pMinX, y0, pMaxZ], [0, 1, 1, 1, 1, 0, 0, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]);
          // East (+X -> faIdx 2)
          addFace(2, [pMaxX, y15, pMinZ, pMaxX, y15, pMaxZ, pMaxX, y0, pMaxZ, pMaxX, y0, pMinZ], [0, 1.5, 0.25, 1.5, 0.25, 0, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]);
          // West (-X -> faIdx 3)
          addFace(3, [pMinX, y15, pMaxZ, pMinX, y15, pMinZ, pMinX, y0, pMinZ, pMinX, y0, pMaxZ], [0.25, 1.5, 0, 1.5, 0, 0, 0.25, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0]);
          // South (+Z -> faIdx 4)
          addFace(4, [pMaxX, y15, pMaxZ, pMinX, y15, pMaxZ, pMinX, y0, pMaxZ, pMaxX, y0, pMaxZ], [0.25, 1.5, 0, 1.5, 0, 0, 0.25, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
          // North (-Z -> faIdx 5)
          addFace(5, [pMinX, y15, pMinZ, pMaxX, y15, pMinZ, pMaxX, y0, pMinZ, pMinX, y0, pMinZ], [0, 1.5, 0.25, 1.5, 0.25, 0, 0, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);

          // Check neighbor connections
          const checkConnect = (nx: number, nz: number): boolean => {
            if (nx >= 0 && nx < CHUNK_SIZE_X && nz >= 0 && nz < CHUNK_SIZE_Z) {
              const nb = blocks[blockIndex(nx, y, nz)];
              return nb === 27 || isOpaque(nb);
            }
            if (nx >= CHUNK_SIZE_X && eastBorder) return eastBorder[borderIndexX(y, nz)] === 27 || isOpaque(eastBorder[borderIndexX(y, nz)]);
            if (nx < 0 && westBorder) return westBorder[borderIndexX(y, nz)] === 27 || isOpaque(westBorder[borderIndexX(y, nz)]);
            if (nz >= CHUNK_SIZE_Z && southBorder) return southBorder[borderIndexZ(nx, y)] === 27 || isOpaque(southBorder[borderIndexZ(nx, y)]);
            if (nz < 0 && northBorder) return northBorder[borderIndexZ(nx, y)] === 27 || isOpaque(northBorder[borderIndexZ(nx, y)]);
            return false;
          };

          const connE = checkConnect(x + 1, z);
          const connW = checkConnect(x - 1, z);
          const connN = checkConnect(x, z - 1);
          const connS = checkConnect(x, z + 1);

          // Horizontal Rails (Upper: y+1.05 to y+1.3, Lower: y+0.4 to y+0.65)
          const addRailX = (xStart: number, xEnd: number) => {
            const rz0 = z + 0.4375, rz1 = z + 0.5625;
            for (const [ry0, ry1] of [[y + 0.4, y + 0.65], [y + 1.05, y + 1.3]]) {
              // Top
              addFace(0, [xEnd, ry1, rz0, xStart, ry1, rz0, xStart, ry1, rz1, xEnd, ry1, rz1], [1, 1, 0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
              // Bottom
              addFace(1, [xStart, ry0, rz0, xEnd, ry0, rz0, xEnd, ry0, rz1, xStart, ry0, rz1], [0, 1, 1, 1, 1, 0, 0, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]);
              // South
              addFace(4, [xEnd, ry1, rz1, xStart, ry1, rz1, xStart, ry0, rz1, xEnd, ry0, rz1], [1, 0.25, 0, 0.25, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
              // North
              addFace(5, [xStart, ry1, rz0, xEnd, ry1, rz0, xEnd, ry0, rz0, xStart, ry0, rz0], [0, 0.25, 1, 0.25, 1, 0, 0, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
            }
          };

          const addRailZ = (zStart: number, zEnd: number) => {
            const rx0 = x + 0.4375, rx1 = x + 0.5625;
            for (const [ry0, ry1] of [[y + 0.4, y + 0.65], [y + 1.05, y + 1.3]]) {
              // Top
              addFace(0, [rx1, ry1, zStart, rx0, ry1, zStart, rx0, ry1, zEnd, rx1, ry1, zEnd], [1, 1, 0, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
              // Bottom
              addFace(1, [rx0, ry0, zStart, rx1, ry0, zStart, rx1, ry0, zEnd, rx0, ry0, zEnd], [0, 1, 1, 1, 1, 0, 0, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]);
              // East
              addFace(2, [rx1, ry1, zStart, rx1, ry1, zEnd, rx1, ry0, zEnd, rx1, ry0, zStart], [0, 0.25, 1, 0.25, 1, 0, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]);
              // West
              addFace(3, [rx0, ry1, zEnd, rx0, ry1, zStart, rx0, ry0, zStart, rx0, ry0, zEnd], [1, 0.25, 0, 0.25, 0, 0, 1, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0]);
            }
          };

          if (connE) addRailX(pMaxX, x + 1.0);
          if (connW) addRailX(x, pMinX);
          if (connS) addRailZ(pMaxZ, z + 1.0);
          if (connN) addRailZ(z, pMinZ);
        }
      }
    }
  }

  let quadCount = 0;
  const groupQuads: Record<string, number> = {};

  const sortedKeys = Array.from(blockGroups.keys()).sort((a, b) => {
    const [bidA, faA] = a.split('_').map(Number);
    const [bidB, faB] = b.split('_').map(Number);
    if (bidA !== bidB) return bidA - bidB;
    return faA - faB;
  });

  for (const key of sortedKeys) {
    const quads = blockGroups.get(key)!;
    groupQuads[key] = quads.length;

    for (const quad of quads) {
      const baseVertex = quadCount * 4;
      const baseIdx = quadCount * 6;

      for (let i = 0; i < 12; i++) POS[baseVertex * 3 + i] = quad.positions[i];
      for (let i = 0; i < 12; i++) NRM[baseVertex * 3 + i] = quad.normals[i];
      for (let i = 0; i < 8; i++) UV[baseVertex * 2 + i] = quad.uvs[i];
      for (let i = 0; i < 6; i++) IDX[baseIdx + i] = quad.indices[i] + baseVertex;

      quadCount++;
    }
  }

  return { quadCount, vertexIndex: quadCount * 4, groupQuads };
}

function meshWater(
  blocks: Uint8Array,
  eastBorder?: Uint8Array,
  westBorder?: Uint8Array,
  northBorder?: Uint8Array,
  southBorder?: Uint8Array,
) {
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
          const x = px[0], y = py[0], z = pz[0];
          const bid = blocks[blockIndex(x, y, z)];
          if (!isWater(bid)) continue;

          if (isFaceVisible(blocks, x, y, z, fa.dir[0], fa.dir[1], fa.dir[2], bid, eastBorder, westBorder, northBorder, southBorder)) {
            mask[b * fa.aSize + a] = bid;
          }
        }
      }

      for (let b = 0; b < fa.bSize; b++) {
        for (let a = 0; a < fa.aSize; a++) {
          const idx = b * fa.aSize + a;
          const bid = mask[idx];
          if (bid === 0 || visited[idx]) continue;

          let w = 1;
          while (a + w < fa.aSize && mask[idx + w] === bid && !visited[idx + w]) w++;
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

      for (let i = 0; i < 12; i++) WATER_POS[baseVertex * 3 + i] = quad.positions[i];
      for (let i = 0; i < 12; i++) WATER_NRM[baseVertex * 3 + i] = quad.normals[i];
      for (let i = 0; i < 8; i++) WATER_UV[baseVertex * 2 + i] = quad.uvs[i];
      for (let i = 0; i < 6; i++) WATER_IDX[baseIdx + i] = quad.indices[i] + baseVertex;

      quadCount++;
    }
  }

  return { quadCount, vertexIndex: quadCount * 4 };
}

self.onmessage = (event: MessageEvent) => {
  const msg = event.data;

  if (msg.type === 'init') {
    blockById = msg.blockTypes;
    self.postMessage({ type: 'initDone' });
    return;
  }

  if (msg.type === 'mesh') {
    const { id, chunkX, chunkZ } = msg;
    const blocks = msg.blocks as Uint8Array;
    const eastBorder = msg.eastBorder as Uint8Array | undefined;
    const westBorder = msg.westBorder as Uint8Array | undefined;
    const northBorder = msg.northBorder as Uint8Array | undefined;
    const southBorder = msg.southBorder as Uint8Array | undefined;

    const solidRes = meshSolid(blocks, eastBorder, westBorder, northBorder, southBorder);
    const waterRes = meshWater(blocks, eastBorder, westBorder, northBorder, southBorder);

    const posCopy = POS.slice(0, solidRes.vertexIndex * 3);
    const nrmCopy = NRM.slice(0, solidRes.vertexIndex * 3);
    const uvCopy = UV.slice(0, solidRes.vertexIndex * 2);
    const idxCopy = IDX.slice(0, solidRes.quadCount * 6);

    const waterPosCopy = WATER_POS.slice(0, waterRes.vertexIndex * 3);
    const waterNrmCopy = WATER_NRM.slice(0, waterRes.vertexIndex * 3);
    const waterUvCopy = WATER_UV.slice(0, waterRes.vertexIndex * 2);
    const waterIdxCopy = WATER_IDX.slice(0, waterRes.quadCount * 6);

    const transferables: Transferable[] = [
      posCopy.buffer,
      nrmCopy.buffer,
      uvCopy.buffer,
      idxCopy.buffer,
      waterPosCopy.buffer,
      waterNrmCopy.buffer,
      waterUvCopy.buffer,
      waterIdxCopy.buffer,
    ];

    (self as unknown as Worker).postMessage(
      {
        type: 'meshResult',
        id,
        chunkX,
        chunkZ,
        quadCount: solidRes.quadCount,
        positions: posCopy,
        normals: nrmCopy,
        uvs: uvCopy,
        indices: idxCopy,
        groupQuads: solidRes.groupQuads,
        waterQuadCount: waterRes.quadCount,
        waterPositions: waterPosCopy,
        waterNormals: waterNrmCopy,
        waterUvs: waterUvCopy,
        waterIndices: waterIdxCopy,
      },
      transferables,
    );
  }
};

