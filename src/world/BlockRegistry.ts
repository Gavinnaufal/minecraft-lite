import * as THREE from 'three';

export interface BlockType {
  id: number;
  name: string;
  color: number;
  solid: boolean;
  transparent: boolean;
  hardness: number;
  minPickaxeTier?: number;
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
  { id: 8, name: 'plank', color: 0xcd853f, solid: true, transparent: false, hardness: 1.5 },
  {
    id: 9,
    name: 'crafting_table',
    color: 0xa0522d,
    solid: true,
    transparent: false,
    hardness: 2.0,
    textureTop: 'crafting_table_top',
    textureBottom: 'plank',
    textureSide: 'crafting_table_side',
  },
  { id: 10, name: 'sandstone', color: 0xd2b48c, solid: true, transparent: false, hardness: 1.5 },
  { id: 11, name: 'torch', color: 0xffaa00, solid: false, transparent: true, hardness: 0.1 },
  { id: 12, name: 'chest', color: 0x8b5a2b, solid: true, transparent: false, hardness: 2.5 },
  { id: 13, name: 'farmland', color: 0x4e3629, solid: true, transparent: false, hardness: 0.6 },
  { id: 14, name: 'wheat_crop', color: 0x88bb33, solid: false, transparent: true, hardness: 0.1 },
  { id: 15, name: 'obsidian', color: 0x1a122b, solid: true, transparent: false, hardness: 10.0 },
  { id: 16, name: 'netherrack', color: 0x5c1d1d, solid: true, transparent: false, hardness: 0.8 },
  { id: 17, name: 'glowstone', color: 0xffd54f, solid: true, transparent: false, hardness: 0.3 },
  { id: 18, name: 'nether_portal', color: 0x8e24aa, solid: false, transparent: true, hardness: -1 },
  { id: 19, name: 'lava', color: 0xd32f2f, solid: false, transparent: true, hardness: -1 },
  { id: 20, name: 'soul_sand', color: 0x4e3629, solid: true, transparent: false, hardness: 0.6 },
  {
    id: 21,
    name: 'coal_ore',
    color: 0x424242,
    solid: true,
    transparent: false,
    hardness: 2.2,
    textureTop: 'coal_ore',
    textureBottom: 'coal_ore',
    textureSide: 'coal_ore',
  },
  {
    id: 22,
    name: 'iron_ore',
    color: 0xd7a15c,
    solid: true,
    transparent: false,
    hardness: 3.2,
    minPickaxeTier: 2,
    textureTop: 'iron_ore',
    textureBottom: 'iron_ore',
    textureSide: 'iron_ore',
  },
  {
    id: 23,
    name: 'furnace',
    color: 0x5d4037,
    solid: true,
    transparent: false,
    hardness: 3.5,
    textureTop: 'stone',
    textureBottom: 'stone',
    textureSide: 'stone',
  },
  {
    id: 24,
    name: 'nether_brick',
    color: 0x2c1619,
    solid: true,
    transparent: false,
    hardness: 3.0,
    textureTop: 'netherrack',
    textureBottom: 'netherrack',
    textureSide: 'netherrack',
  },
  {
    id: 25,
    name: 'wheat_sprout',
    color: 0x7cb342,
    solid: false,
    transparent: true,
    hardness: 0.1,
    textureTop: 'wheat_crop',
    textureBottom: 'wheat_crop',
    textureSide: 'wheat_crop',
  },
  {
    id: 26,
    name: 'wheat_growing',
    color: 0x9ccc65,
    solid: false,
    transparent: true,
    hardness: 0.1,
    textureTop: 'wheat_crop',
    textureBottom: 'wheat_crop',
    textureSide: 'wheat_crop',
  },
  {
    id: 27,
    name: 'fence',
    color: 0x785a37,
    solid: true,
    transparent: true,
    hardness: 1.5,
    textureTop: 'wood_log_top',
    textureBottom: 'wood_log_top',
    textureSide: 'wood_log',
  },
  {
    id: 28,
    name: 'spike_trap',
    color: 0x546e7a,
    solid: false,
    transparent: true,
    hardness: 1.0,
  },
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
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
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

    if (block.name === 'wheat_sprout' || block.name === 'wheat_growing') {
      side.transparent = false;
      side.alphaTest = 0.5;
      side.depthWrite = true;
      side.side = THREE.DoubleSide;
      return side;
    }

    return [side, side, top, bottom, side, side];
  }

  const texture = loadBlockTexture(block.name);
  const material = new THREE.MeshStandardMaterial({ map: texture });

  if (block.name === 'leaves' || block.name === 'torch' || block.name === 'wheat_crop' || block.name === 'wheat_sprout' || block.name === 'wheat_growing' || block.name === 'spike_trap') {
    material.transparent = false;
    material.alphaTest = 0.5;
    material.depthWrite = true;
    material.side = THREE.DoubleSide;
  } else if (block.name === 'water') {
    material.transparent = true;
    material.opacity = 0.65;
    material.depthWrite = false;
    material.color.setHex(0x3399ff);
  } else if (block.name === 'lava') {
    material.transparent = true;
    material.opacity = 0.9;
    material.color.setHex(0xd32f2f);
  } else if (block.name === 'nether_portal') {
    material.transparent = true;
    material.opacity = 0.75;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;
    material.color.setHex(0x8e24aa);
  } else if (block.transparent) {
    material.transparent = true;
    material.opacity = 0.6;
    material.depthWrite = false;
  }

  return material;
}
