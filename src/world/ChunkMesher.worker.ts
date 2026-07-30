// Web Worker: greedy voxel meshing (no Three.js dependency)
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT } from '../utils/constants';

interface BlockInfo {
  id: number;
  solid: boolean;
  transparent: boolean;
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

function isSolid(id: number): boolean {
  const b = getBlock(id);
  return b ? b.solid && !b.transparent : false;
}

const mask = new Uint8Array(MAX_DIM * MAX_DIM);
const visited = new Uint8Array(MAX_DIM * MAX_DIM);

const POS = new Float32Array(MAX_QUADS * 4 * 3);
const NRM = new Float32Array(MAX_QUADS * 4 * 3);
const UV = new Float32Array(MAX_QUADS * 4 * 2);
const IDX = new Uint32Array(MAX_QUADS * 6);

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
  x: number,
  y: number,
  z: number,
  nx: number,
  ny: number,
  nz: number,
  eastBorder?: Uint8Array,
  westBorder?: Uint8Array,
  northBorder?: Uint8Array,
  southBorder?: Uint8Array,
): boolean {
  const nxPos = x + nx;
  const nyPos = y + ny;
  const nzPos = z + nz;

  if (nyPos < 0 || nyPos >= CHUNK_HEIGHT) return true;

  // Horizontal neighbor in adjacent chunk
  if (nxPos < 0 && westBorder) {
    const nId = westBorder[borderIndexX(nyPos, z)];
    if (nId === 0) return true;
    return !isSolid(nId);
  }
  if (nxPos >= CHUNK_SIZE_X && eastBorder) {
    const nId = eastBorder[borderIndexX(nyPos, z)];
    if (nId === 0) return true;
    return !isSolid(nId);
  }
  if (nzPos < 0 && southBorder) {
    const nId = southBorder[borderIndexZ(x, nyPos)];
    if (nId === 0) return true;
    return !isSolid(nId);
  }
  if (nzPos >= CHUNK_SIZE_Z && northBorder) {
    const nId = northBorder[borderIndexZ(x, nyPos)];
    if (nId === 0) return true;
    return !isSolid(nId);
  }

  if (nxPos < 0 || nxPos >= CHUNK_SIZE_X || nzPos < 0 || nzPos >= CHUNK_SIZE_Z) {
    return true;
  }
  const neighborId = blocks[blockIndex(nxPos, nyPos, nzPos)];
  if (neighborId === 0) return true;
  return !isSolid(neighborId);
}

function addQuad(
  quadCount: number,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  fa: FaceAxis,
): number {
  const baseIdx = quadCount * 4;
  const px: number[] = [x], py: number[] = [y], pz: number[] = [z];
  setAxis(px, py, pz, fa.planeAxis, getAxisVal(x, y, z, fa.planeAxis) + fa.quadFacePos);

  const ax0 = getAxisVal(x, y, z, fa.aAxis);
  const bx0 = getAxisVal(x, y, z, fa.bAxis);

  const corners: [number, number][] = [
    [ax0 + w, bx0],
    [ax0, bx0],
    [ax0, bx0 + h],
    [ax0 + w, bx0 + h],
  ];

  const [nx, ny, nz] = fa.dir;

  for (let v = 0; v < 4; v++) {
    const vo = (baseIdx + v) * 3;
    const cp: number[] = [px[0], py[0], pz[0]];
    setAxis(cp, cp, cp, fa.aAxis, corners[v][0]);
    setAxis(cp, cp, cp, fa.bAxis, corners[v][1]);

    POS[vo] = cp[0];
    POS[vo + 1] = cp[1];
    POS[vo + 2] = cp[2];

    NRM[vo] = nx;
    NRM[vo + 1] = ny;
    NRM[vo + 2] = nz;

    const uvOff = (baseIdx + v) * 2;
    UV[uvOff] = v === 0 || v === 3 ? w : 0;
    UV[uvOff + 1] = v < 2 ? 0 : h;
  }

  const idxBase = quadCount * 6;
  IDX[idxBase] = baseIdx;
  IDX[idxBase + 1] = baseIdx + 1;
  IDX[idxBase + 2] = baseIdx + 2;
  IDX[idxBase + 3] = baseIdx;
  IDX[idxBase + 4] = baseIdx + 2;
  IDX[idxBase + 5] = baseIdx + 3;

  return baseIdx + 4;
}

function meshChunk(
  blocks: Uint8Array,
  eastBorder?: Uint8Array,
  westBorder?: Uint8Array,
  northBorder?: Uint8Array,
  southBorder?: Uint8Array,
) {
  let quadCount = 0;
  let vertexIndex = 0;

  const groupQuads = new Map<number, number>();

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

          const x = px[0], y = py[0], z = pz[0];
          const blockId = blocks[blockIndex(x, y, z)];
          if (blockId === 0) continue;
          if (!isSolid(blockId)) continue;

          if (isFaceVisible(blocks, x, y, z, fa.dir[0], fa.dir[1], fa.dir[2], eastBorder, westBorder, northBorder, southBorder)) {
            mask[b * fa.aSize + a] = blockId;
          }
        }
      }

      for (let b = 0; b < fa.bSize; b++) {
        for (let a = 0; a < fa.aSize; a++) {
          const idx = b * fa.aSize + a;
          const blockId = mask[idx];
          if (blockId === 0 || visited[idx]) continue;

          let w = 1;
          while (a + w < fa.aSize && mask[idx + w] === blockId && !visited[idx + w]) {
            w++;
          }

          let h = 1;
          outer: for (; b + h < fa.bSize; h++) {
            for (let k = 0; k < w; k++) {
              if (mask[(b + h) * fa.aSize + a + k] !== blockId || visited[(b + h) * fa.aSize + a + k]) {
                break outer;
              }
            }
          }

          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              visited[(b + dy) * fa.aSize + a + dx] = 1;
            }
          }

          const bx: number[] = [0], by: number[] = [0], bz: number[] = [0];
          setAxis(bx, by, bz, fa.planeAxis, plane);
          setAxis(bx, by, bz, fa.aAxis, a);
          setAxis(bx, by, bz, fa.bAxis, b);

          vertexIndex = addQuad(quadCount, bx[0], by[0], bz[0], w, h, fa);
          groupQuads.set(blockId, (groupQuads.get(blockId) ?? 0) + 1);
          quadCount++;
        }
      }
    }
  }

  return {
    quadCount,
    vertexIndex,
    groupQuads,
  };
}

interface MeshResult {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  groups: { blockId: number; quadCount: number }[];
}

self.onmessage = (event: MessageEvent) => {
  const msg = event.data;

  if (msg.type === 'init') {
    blockById = msg.blockTypes;
    for (let i = 0; i < blockById.length; i++) {
      if (!blockById[i]) {
        blockById[i] = { id: i, solid: false, transparent: true };
      }
    }
    self.postMessage({ type: 'initDone' });
    return;
  }

  if (msg.type === 'mesh') {
    const blocks = msg.blocks as Uint8Array;
    const eastBorder = msg.eastBorder as Uint8Array | undefined;
    const westBorder = msg.westBorder as Uint8Array | undefined;
    const northBorder = msg.northBorder as Uint8Array | undefined;
    const southBorder = msg.southBorder as Uint8Array | undefined;

    const { quadCount, vertexIndex, groupQuads } = meshChunk(
      blocks,
      eastBorder,
      westBorder,
      northBorder,
      southBorder,
    );

    if (quadCount === 0) {
      (self as unknown as Worker).postMessage({ type: 'meshResult', id: msg.id, quadCount: 0 });
      return;
    }

    const groups: { blockId: number; quadCount: number }[] = [];
    groupQuads.forEach((qc, blockId) => {
      groups.push({ blockId, quadCount: qc });
    });

    const result: MeshResult = {
      positions: POS.slice(0, vertexIndex * 3),
      normals: NRM.slice(0, vertexIndex * 3),
      uvs: UV.slice(0, vertexIndex * 2),
      indices: IDX.slice(0, quadCount * 6),
      groups,
    };

    (self as unknown as Worker).postMessage(
      {
        type: 'meshResult',
        id: msg.id,
        quadCount,
        ...result,
      },
      [
        result.positions.buffer,
        result.normals.buffer,
        result.uvs.buffer,
        result.indices.buffer,
      ] as Transferable[],
    );
  }
};
