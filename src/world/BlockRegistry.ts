import * as THREE from 'three';

export interface BlockType {
  id: number;
  name: string;
  color: number;
  solid: boolean;
  transparent: boolean;
  hardness: number;
  textureTop?: string;
  textureBottom?: string;
  textureSide?: string;
}

const blockTypes: BlockType[] = [
  { id: 0, name: 'air', color: 0x000000, solid: false, transparent: true, hardness: 0 },
  {
    id: 1,
    name: 'grass',
    color: 0x4caf50,
    solid: true,
    transparent: false,
    hardness: 0.8,
    textureTop: 'grass_top',
    textureBottom: 'dirt',
    textureSide: 'grass_side',
  },
  { id: 2, name: 'dirt', color: 0x8b5e3c, solid: true, transparent: false, hardness: 0.5 },
  { id: 3, name: 'stone', color: 0x808080, solid: true, transparent: false, hardness: 1.5 },
  { id: 4, name: 'sand', color: 0xf4e4a0, solid: true, transparent: false, hardness: 0.5 },
  {
    id: 5,
    name: 'wood_log',
    color: 0x785a37,
    solid: true,
    transparent: false,
    hardness: 2.0,
    textureTop: 'wood_log_top',
    textureBottom: 'wood_log_top',
    textureSide: 'wood_log',
  },
  { id: 6, name: 'leaves', color: 0x228b22, solid: true, transparent: true, hardness: 0.2 },
  { id: 7, name: 'water', color: 0x3399ff, solid: false, transparent: true, hardness: -1 },
];

const byId = new Map<number, BlockType>();
const byName = new Map<string, BlockType>();

for (const block of blockTypes) {
  byId.set(block.id, block);
  byName.set(block.name, block);
}

export function getBlockById(id: number): BlockType | undefined {
  return byId.get(id);
}

export function getBlockByName(name: string): BlockType | undefined {
  return byName.get(name);
}

export function getAllBlocks(): readonly BlockType[] {
  return blockTypes;
}

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();

export function loadBlockTexture(name: string): THREE.Texture {
  if (textureCache.has(name)) {
    return textureCache.get(name)!;
  }

  const texture = textureLoader.load(`/textures/blocks/${name}.png`);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  textureCache.set(name, texture);
  return texture;
}

export function createBlockMaterial(blockId: number): THREE.Material | THREE.Material[] {
  const block = getBlockById(blockId);
  if (!block || block.id === 0) {
    return new THREE.MeshStandardMaterial({ color: 0x000000, visible: false });
  }

  if (block.textureTop || block.textureBottom || block.textureSide) {
    const topTex = block.textureTop ?? block.name;
    const bottomTex = block.textureBottom ?? block.name;
    const sideTex = block.textureSide ?? block.name;

    const top = new THREE.MeshStandardMaterial({ map: loadBlockTexture(topTex) });
    const bottom = new THREE.MeshStandardMaterial({ map: loadBlockTexture(bottomTex) });
    const side = new THREE.MeshStandardMaterial({ map: loadBlockTexture(sideTex) });

    return [side, side, top, bottom, side, side];
  }

  const texture = loadBlockTexture(block.name);
  const material = new THREE.MeshStandardMaterial({ map: texture });

  if (block.transparent) {
    material.transparent = true;
    material.opacity = 0.6;
    material.depthWrite = false;
  }

  return material;
}
