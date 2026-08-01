import './style.css';
import { Engine } from './core/Engine';
import { renderer, scene, camera, lights } from './core/Renderer';
import { inputManager } from './core/InputManager';
import { Clock } from './core/Clock';
import { PlayerCamera } from './player/Camera';
import { Player } from './player/Player';
import { PlayerController } from './player/PlayerController';
import { PlayerCollision } from './player/PlayerCollision';
import { createSky } from './environment/Skybox';
import { DayNightCycle } from './environment/DayNightCycle';
import { CloudManager } from './environment/CloudManager';
import { ChunkManager } from './world/ChunkManager';
import { World } from './world/World';
import { AudioManager } from './audio/AudioManager';
import { NetworkManager } from './multiplayer/NetworkManager';
import { gameSettings } from './core/GameSettings';
import { worldToChunkCoord } from './utils/math';
import { SettingsMenu } from './ui/SettingsMenu';
import { PauseMenu } from './ui/PauseMenu';
import { HUD } from './ui/HUD';
import { InventoryScreen } from './ui/InventoryScreen';
import { MainMenu } from './ui/MainMenu';
import { HandModel } from './ui/HandModel';
import { ParticleSystem } from './world/ParticleSystem';
import { ItemDropManager } from './world/ItemDropManager';
import { IronGolem } from './mobs/npc/IronGolem';
import { Villager } from './mobs/npc/Villager';
import { Skeleton } from './mobs/hostile/Skeleton';
import { Spider } from './mobs/hostile/Spider';
import { Enderman } from './mobs/hostile/Enderman';
import { Pig } from './mobs/passive/Pig';
import { Chicken } from './mobs/passive/Chicken';
import { Goat } from './mobs/passive/Goat';
import { Turtle } from './mobs/passive/Turtle';
import { ProjectileManager } from './entities/ProjectileManager';
import { ChatBox } from './multiplayer/ChatBox';
import { TorchLightManager } from './world/TorchLightManager';
import { DimensionManager, DimensionType } from './world/dimension/DimensionManager';
import { PortalDetector } from './world/dimension/PortalDetector';
import { DimensionTransitionOverlay } from './ui/DimensionTransitionOverlay';
import { NoiseGenerator, seedFromString } from './world/terrain/NoiseGenerator';
import { HeightMap } from './world/terrain/HeightMap';
import { BiomeGenerator, BiomeType } from './world/terrain/BiomeGenerator';
import { generateTrees } from './world/terrain/TreeGenerator';
import { VillageGenerator } from './world/structures/VillageGenerator';
import { OreGenerator } from './world/ores/OreGenerator';
import { BlockBreaker } from './interaction/BlockBreaker';
import { BlockPlacer } from './interaction/BlockPlacer';
import { Inventory } from './inventory/Inventory';
import { Hotbar } from './inventory/Hotbar';
import { blockIdToItemId, itemIdToBlockId, getItemById } from './inventory/ItemRegistry';
import { loadBlockTexture } from './world/BlockRegistry';
import { SaveManager } from './save/SaveManager';
import { MobManager } from './mobs/MobManager';
import { Cow } from './mobs/passive/Cow';
import { Zombie } from './mobs/hostile/Zombie';
import { BlockHighlight } from './interaction/BlockHighlight';
import { DebugScreen } from './ui/DebugScreen';
import { ToastSystem } from './ui/ToastSystem';
import { FurnaceScreen } from './ui/FurnaceScreen';
import * as THREE from 'three';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT, WATER_LEVEL } from './utils/constants';
import type { Chunk } from './world/Chunk';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element #game not found');

console.log('Mini Minecraft initialized');

// Dynamic PointLight for Held Torch
const playerTorchLight = new THREE.PointLight(0xffaa44, 0, 20);
scene.add(playerTorchLight);
const waterTexture = loadBlockTexture('water');

// World gen
let worldSeed = Date.now();
let worldSeedString = String(worldSeed);

function createGenerators(seed: number) {
  const n = new NoiseGenerator(seed);
  return {
    heightMap: new HeightMap(n),
    biomeGen: new BiomeGenerator(new NoiseGenerator(seed + 1)),
    caveNoise: new NoiseGenerator(seed + 2),
    lakeNoise: new NoiseGenerator(seed + 4),
  };
}

let { heightMap, biomeGen, caveNoise, lakeNoise } = createGenerators(worldSeed);
const villageGen = new VillageGenerator();
let oreGen = new OreGenerator(worldSeed);

// Player & physics
const player = new Player();

// World
const chunkManager = new ChunkManager(scene);
const world = new World(chunkManager);
const playerController = new PlayerController(player, world);
const playerCollision = new PlayerCollision(player, world);

function getWaterTerrain(wx: number, wz: number) {
  const baseH = heightMap.getHeight(wx, wz);
  const biome = biomeGen.getBiome(wx, wz);
  const notDesert = biome !== BiomeType.Desert;

  // Distance from spawn point (0, 0)
  const spawnDist = Math.hypot(wx, wz);
  // Spawn protection: 0 within 35 blocks of spawn, smoothly fading in up to 75 blocks
  const spawnFactor = Math.min(1, Math.max(0, (spawnDist - 35) / 40));

  // River noise (iso-line technique, reduced frequency by ~50%)
  const riverVal = lakeNoise.noise2D(wx / 75, wz / 75);
  const distFromCenter = Math.abs(riverVal - 0.5);

  // Pool noise for small shallow puddles/ponds (reduced frequency by 50%: threshold 0.85)
  const poolVal = lakeNoise.noise2D(wx / 35, wz / 35);
  const poolFactor = Math.max(0, (poolVal - 0.85) / 0.15); // 0 to 1 inside pool

  let h = baseH;
  let isWater = false;
  let isBeach = false;

  if (notDesert && spawnFactor > 0) {
    // 1. River channel & smooth bank slope:
    let riverTargetH = baseH;

    if (distFromCenter < 0.018) {
      const depthFactor = 1 - (distFromCenter / 0.018);
      // Very shallow: 1 block deep (or 2 in exact center)
      const depth = depthFactor > 0.6 ? 2 : 1;
      riverTargetH = WATER_LEVEL - depth;
    } else if (distFromCenter < 0.12) {
      // Smooth transition zone across ~12 blocks
      const t = (distFromCenter - 0.018) / (0.12 - 0.018);
      const smoothT = t * t * (3 - 2 * t);
      const waterEdgeH = WATER_LEVEL - 1;
      riverTargetH = Math.round(waterEdgeH + (baseH - waterEdgeH) * smoothT);
    }

    // 2. Small shallow puddle/lake channel:
    let poolTargetH = baseH;

    if (poolFactor > 0) {
      if (poolFactor > 0.2) {
        // Very shallow: 1 block deep (or 2 in center)
        const depth = poolFactor > 0.7 ? 2 : 1;
        poolTargetH = WATER_LEVEL - depth;
      } else {
        const t = 1.0 - (poolFactor / 0.2);
        const smoothT = t * t * (3 - 2 * t);
        const waterEdgeH = WATER_LEVEL - 1;
        poolTargetH = Math.round(waterEdgeH + (baseH - waterEdgeH) * smoothT);
      }
    }

    // Combine river and pool depressions
    const carvedH = Math.min(baseH, Math.min(riverTargetH, poolTargetH));

    // Apply spawn protection blend (prevents water near spawn)
    h = Math.round(baseH * (1 - spawnFactor) + carvedH * spawnFactor);

    if (h < WATER_LEVEL) {
      isWater = true;
      isBeach = true;
    } else if (h <= WATER_LEVEL + 2) {
      isBeach = true; // Sand beach shore!
    }
  }

  h = Math.max(1, h);
  return { h, isWater, isBeach, biome };
}

chunkManager.terrainFiller = (chunk: Chunk) => {
  chunk.fill(0);
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunk.chunkX * CHUNK_SIZE_X + lx;
      const wz = chunk.chunkZ * CHUNK_SIZE_Z + lz;
      const { h, isBeach, biome } = getWaterTerrain(wx, wz);

      for (let y = 0; y <= h && y < CHUNK_HEIGHT; y++) {
        const depth = h - y;
        let bid: number;
        if (isBeach && depth <= 2) {
          bid = 4; // Sand beach or underwater sand bed!
        } else if (depth === 0) {
          if (biome === BiomeType.Desert) bid = 4;
          else if (biome === BiomeType.Mountain && h > 80) bid = 3;
          else bid = 1; // Grass
        } else if (depth <= 3) {
          bid = biome === BiomeType.Desert ? 4 : 2; // Dirt
        } else {
          bid = 3; // Stone
        }
        chunk.setBlock(lx, y, lz, bid);
      }
    }
  }
  // Fill water in any column below WATER_LEVEL
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunk.chunkX * CHUNK_SIZE_X + lx;
      const wz = chunk.chunkZ * CHUNK_SIZE_Z + lz;
      const { h } = getWaterTerrain(wx, wz);

      if (h < WATER_LEVEL) {
        for (let y = h + 1; y <= WATER_LEVEL && y < CHUNK_HEIGHT; y++) {
          chunk.setBlock(lx, y, lz, 7); // Water block
        }
      }
    }
  }
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunk.chunkX * CHUNK_SIZE_X + lx;
      const wz = chunk.chunkZ * CHUNK_SIZE_Z + lz;
      const sh = heightMap.getHeight(wx, wz);
      for (let y = 8; y < sh - 12 && y < CHUNK_HEIGHT; y++) {
        const bid = chunk.getBlock(lx, y, lz);
        if (bid === 0 || bid === 7) continue;
        
        const depthFromSurface = sh - y;
        const depthFactor = Math.min(depthFromSurface / 20, 1);
        const dynamicThreshold = 0.68 - (depthFactor * 0.08);
        
        if (caveNoise.noise3D(wx / 45, y / 45, wz / 45) > dynamicThreshold) {
          chunk.setBlock(lx, y, lz, 0);
        }
      }
    }
  }
  oreGen.generateForChunk(chunk);
  generateTrees(chunk, heightMap, biomeGen);
  villageGen.generateForChunk(chunk, heightMap, biomeGen);
  villageGen.spawnVillageNPCsForChunk(chunk, mobManager, heightMap, biomeGen);
  spawnNaturalMobsForChunk(chunk, mobManager, heightMap, biomeGen);
  world.applyModificationsToChunk(chunk);
};

function spawnNaturalMobsForChunk(chunk: Chunk, mobManager: MobManager, heightMap: HeightMap, biomeGen: BiomeGenerator): void {
  if (mobManager.mobs.length >= mobManager.mobCap) return;
  if (Math.random() > 0.45) return;

  const worldX = chunk.chunkX * CHUNK_SIZE_X + Math.floor(Math.random() * (CHUNK_SIZE_X - 2)) + 1;
  const worldZ = chunk.chunkZ * CHUNK_SIZE_Z + Math.floor(Math.random() * (CHUNK_SIZE_Z - 2)) + 1;
  const h = heightMap.getHeight(worldX, worldZ);
  if (h <= WATER_LEVEL + 1) return;

  const spawnPos = new THREE.Vector3(worldX, h + 1, worldZ);

  for (const existing of mobManager.mobs) {
    if (existing.position.distanceTo(spawnPos) < 10) return;
  }

  const biome = biomeGen.getBiome(worldX, worldZ);
  const rand = Math.random();

  if (biome === BiomeType.Mountain || h > 70) {
    mobManager.spawn(spawnPos, new Goat(spawnPos));
  } else if (biome === BiomeType.Desert) {
    mobManager.spawn(spawnPos, new Turtle(spawnPos));
  } else {
    if (rand < 0.30) mobManager.spawn(spawnPos, new Pig(spawnPos));
    else if (rand < 0.60) mobManager.spawn(spawnPos, new Chicken(spawnPos));
    else if (rand < 0.85) mobManager.spawn(spawnPos, new Cow(spawnPos));
    else mobManager.spawn(spawnPos, new Enderman(spawnPos));
  }
}

console.log(`[Seed] World seed: "${worldSeedString}" (${worldSeed})`);

// Inventory
const inventory = new Inventory();
const hotbar = new Hotbar();

// Mobs & Projectiles
const mobManager = new MobManager(scene, world);
ProjectileManager.getInstance().setScene(scene);
const dayNight = new DayNightCycle();

// Spawn player on terrain surface immediately
const spawnH = heightMap.getHeight(player.position.x, player.position.z);
player.position.y = spawnH + 2;
camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);

// Load terrain NOW (don't wait for save/load)
chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
console.log(`[World] Loading terrain around (${player.position.x.toFixed(0)}, ${player.position.z.toFixed(0)})...`);

// Spawn initial mobs on solid land (scattered uniformly in polar rings 20..105 blocks away)
function getLandSpawnPos(originX: number, originZ: number, minRadius: number, maxRadius: number): THREE.Vector3 | null {
  for (let attempt = 0; attempt < 25; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const rx = originX + Math.cos(angle) * radius;
    const rz = originZ + Math.sin(angle) * radius;
    const h = heightMap.getHeight(rx, rz);
    if (h > WATER_LEVEL + 1) {
      const pos = new THREE.Vector3(rx, h + 1, rz);
      let tooClose = false;
      for (const m of mobManager.mobs) {
        if (m.position.distanceTo(pos) < 10) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) return pos;
    }
  }
  return null;
}

for (let i = 0; i < 14; i++) {
  const minR = 20 + (i % 4) * 20;
  const maxR = minR + 25;
  const spawnPos = getLandSpawnPos(player.position.x, player.position.z, minR, maxR);
  if (spawnPos) {
    const topBlock = world.getBlock(Math.floor(spawnPos.x), Math.floor(spawnPos.y - 1), Math.floor(spawnPos.z));
    const rand = Math.random();
    if (topBlock === 4) { // Sand (Beach)
      mobManager.spawn(spawnPos, new Turtle(spawnPos));
    } else if (topBlock === 3 || spawnPos.y > 70) { // Stone / Mountain
      mobManager.spawn(spawnPos, new Goat(spawnPos));
    } else { // Grass (1) / Dirt (2)
      if (rand < 0.35) mobManager.spawn(spawnPos, new Pig(spawnPos));
      else if (rand < 0.70) mobManager.spawn(spawnPos, new Chicken(spawnPos));
      else mobManager.spawn(spawnPos, new Cow(spawnPos));
    }
  }
}

// Save/Load (async, non-blocking)
const saveManager = new SaveManager(chunkManager, world, player, inventory, hotbar, dayNight, () => worldSeed);
saveManager.init().then(() => saveManager.load()).then((savedSeed) => {
  if (savedSeed !== null) {
    if (savedSeed !== worldSeed) {
      // Seed changed since save — regenerate
      worldSeed = savedSeed;
      const gens = createGenerators(worldSeed);
      heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise; lakeNoise = gens.lakeNoise;
      chunkManager.unloadAllChunks();
      chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
    }
    console.log(`[Save] Loaded saved game (seed: ${savedSeed})`);
    camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);
  }
}).catch((err) => {
  console.warn('[Save] Failed to load:', err);
});

const playerCamera = new PlayerCamera(camera);

// Interaction & Polish
const particleSystem = new ParticleSystem(scene);
const itemDropManager = new ItemDropManager(scene);
const torchLightManager = new TorchLightManager(scene);
const blockBreaker = new BlockBreaker(scene, world);
const blockPlacer = new BlockPlacer(world);
const blockHighlight = new BlockHighlight(scene);
const debugScreen = new DebugScreen();
const toastSystem = ToastSystem.getInstance();
const dimensionOverlay = new DimensionTransitionOverlay();
let portalTimer = 0;

import { ChestScreen } from './ui/ChestScreen';
import { ChestManager } from './inventory/ChestManager';

const BLOCK_PARTICLE_COLORS: Record<number, number> = {
  1: 0x55aa33, 2: 0x795548, 3: 0x9e9e9e, 4: 0xe4c875, 5: 0x5d4037, 6: 0x2e7d32, 8: 0xb18c5d, 9: 0x8d6e63, 10: 0xe0d6b8, 11: 0xffaa00, 12: 0x8b5a2b, 13: 0x4e3629, 14: 0x88bb33
};

blockBreaker.setOnBlockBroken((x, y, z, blockId) => {
  particleSystem.spawnBlockBreakParticles(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), BLOCK_PARTICLE_COLORS[blockId] ?? 0x8d6e63);

  if (blockId === 1) {
    // Grass block drops 1 Grass + 35% chance Wheat Seeds
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'grass', 1);
    if (Math.random() < 0.35) {
      itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat_seeds', 1);
    }
  } else if (blockId === 12) {
    // Chest block drops chest item + stored slots contents
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'chest', 1);
    const chestContents = ChestManager.getInstance().removeChest(x, y, z);
    for (const slot of chestContents) {
      if (slot.itemId && slot.count > 0) {
        itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), slot.itemId, slot.count);
      }
    }
  } else if (blockId === 14) {
    // Wheat Crop drops 1 Wheat + 1-2 Seeds
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat', 1);
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat_seeds', Math.floor(Math.random() * 2) + 1);
  } else {
    const itemId = blockIdToItemId(blockId);
    if (itemId) {
      itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), itemId, 1);
    }
  }

  networkManager.sendBlockChange(x, y, z, 0);

  // Reduce active tool durability
  const activeTool = hotbar.getActiveItem();
  if (activeTool.itemId && activeTool.durability !== undefined) {
    activeTool.durability--;
    if (activeTool.durability <= 0) {
      const toolMeta = getItemById(activeTool.itemId);
      toastSystem.show(`${toolMeta ? toolMeta.name : activeTool.itemId} Broke!`, 'warning');
      hotbar.removeItem(activeTool.itemId, 1);
      AudioManager.getInstance().playSFX('break');
    }
  }
});

// UI
const settingsMenu = new SettingsMenu();

const mainMenu = new MainMenu(settingsMenu, (isLoad) => {
  if (isLoad) {
    saveManager.load().then((savedSeed) => {
      if (savedSeed !== null) {
        camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);
      }
    }).catch(() => {});
  }
  inputManager.requestPointerLock();
});

settingsMenu.create(
  () => {
    chunkManager.forceReload(gameSettings.renderDistance, camera.position.x, camera.position.z);
  },
  () => {
    // Reset World: clear saved data and reload the page for a fresh new seed
    saveManager.clearSave().then(() => {
      window.location.reload();
    }).catch(() => {
      window.location.reload();
    });
  },
  () => {
    // Quit to Main Menu: stop music, show main menu
    AudioManager.getInstance().stopMusic();
    mainMenu.show();
  },
);

const hud = new HUD(hotbar);
scene.add(camera);
const handModel = new HandModel(camera, hotbar);

const inventoryScreen = new InventoryScreen(inventory, hotbar);
inventoryScreen.create();

const chestScreen = new ChestScreen(inventory, hotbar);
chestScreen.create();

const furnaceScreen = new FurnaceScreen(inventory, hotbar);

const pauseMenu = new PauseMenu(saveManager, settingsMenu, () => {
  inputManager.requestPointerLock();
});
pauseMenu.create();

mainMenu.create();

canvas.addEventListener('click', () => {
  if (!mainMenu.isOpen && !pauseMenu.isOpen && !inventoryScreen.isOpen && !chestScreen.isOpen && !furnaceScreen.getIsOpen()) {
    inputManager.requestPointerLock();
  }
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar switching & Menu toggling
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (chatBox.visible) {
      chatBox.close();
    } else if (furnaceScreen.getIsOpen()) {
      furnaceScreen.close();
    } else if (chestScreen.isOpen) {
      chestScreen.closeChest();
    } else if (inventoryScreen.isOpen) {
      inventoryScreen.toggle();
    } else {
      pauseMenu.toggle();
    }
    return;
  }
  if (pauseMenu.isOpen || chatBox.visible) return;
  if (e.key === 'o' || e.key === 'O') { settingsMenu.toggle(); return; }
  if (e.key === 'e' || e.key === 'E') {
    if (furnaceScreen.getIsOpen()) furnaceScreen.close();
    else if (chestScreen.isOpen) chestScreen.closeChest();
    else inventoryScreen.toggle();
    return;
  }
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) hotbar.activeSlotIndex = num - 1;
});
window.addEventListener('wheel', (e) => {
  if (!inputManager.isPointerLocked) return;
  if (e.deltaY > 0) hotbar.activeSlotIndex = (hotbar.activeSlotIndex + 1) % 9;
  else hotbar.activeSlotIndex = (hotbar.activeSlotIndex + 8) % 9;
});

// Sky & 3D Voxel Clouds System
const sky = createSky();
scene.add(sky);
const cloudManager = new CloudManager(scene);

// Break progress bar
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  display: none; position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);
  width: 120px; height: 6px; background: rgba(0,0,0,0.5); border: 1px solid #555; z-index: 100;
`;
const progressFill = document.createElement('div');
progressFill.style.cssText = 'height: 100%; background: #fff; width: 0%;';
progressBar.appendChild(progressFill);
document.body.appendChild(progressBar);

const clock = new Clock();
clock.createDisplay();

const networkManager = new NetworkManager(scene);
networkManager.connect();
networkManager.setOnBlockChange((x, y, z, blockId) => {
  world.setBlock(x, y, z, blockId);
});
networkManager.setOnMobDamage((mobIdx, damage) => {
  mobManager.damageMob(mobIdx, damage);
});

const chatBox = new ChatBox((msg) => {
  networkManager.sendChatMessage(msg);
});
networkManager.setOnChatMessage((author, text) => {
  chatBox.addMessage(author, text);
});

// Engine & Polish State
let previousChunkX = 0, previousChunkZ = 0;
let wasRightDown = false;
let wasLeftDown = false;
let lastPlayerHealth = player.health;
let footstepTimer = 0;
let bobbingTimer = 0;

function getFacingDirection(cam: THREE.PerspectiveCamera): string {
  const dir = new THREE.Vector3();
  cam.getWorldDirection(dir);
  if (Math.abs(dir.x) > Math.abs(dir.z)) {
    return dir.x > 0 ? 'East (+X)' : 'West (-X)';
  } else {
    return dir.z > 0 ? 'South (+Z)' : 'North (-Z)';
  }
}

const engine = new Engine();

function restartPlayer() {
  player.health = 20;
  lastPlayerHealth = 20;
  const spawnY = heightMap.getHeight(0, 0) + 2;
  player.position.x = 0;
  player.position.y = spawnY;
  player.position.z = 0;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.velocity.z = 0;
  camera.position.set(0, spawnY + player.eyeHeight, 0);
  chunkManager.update(0, 0, gameSettings.renderDistance);
  hud.update(player.health);
  hud.showDeathMessage();
  AudioManager.getInstance().playSFX('hit');
}

function findMobIndexFromHitObject(hitObject: THREE.Object3D): number {
  for (let i = 0; i < mobManager.mobs.length; i++) {
    const mobMesh = mobManager.mobs[i].mesh;
    let curr: THREE.Object3D | null = hitObject;
    while (curr) {
      if (curr === mobMesh) return i;
      curr = curr.parent;
    }
  }
  return -1;
}

engine.setUpdateCallback((deltaTime) => {
  if (mainMenu.isOpen || pauseMenu.isOpen || inventoryScreen.isOpen || chestScreen.isOpen || furnaceScreen.getIsOpen() || chatBox.visible) {
    return;
  }

  if (player.health <= 0 || player.position.y < -20) {
    restartPlayer();
  }

  if (player.health < lastPlayerHealth) {
    hud.triggerDamageFlash();
  }
  lastPlayerHealth = player.health;

  dayNight.update(deltaTime);
  AudioManager.getInstance().updateAmbience(dayNight.timeOfDay, deltaTime);
  playerCamera.update();
  playerController.update(deltaTime, camera);
  playerCollision.checkAndResolve(deltaTime);
  networkManager.sendPosition(player.position.x, player.position.y, player.position.z, deltaTime);

  const isWalking = inputManager.isKeyPressed('w') || inputManager.isKeyPressed('a') || inputManager.isKeyPressed('s') || inputManager.isKeyPressed('d');
  handModel.update(deltaTime, isWalking, inputManager.isLeftMouseDown);
  particleSystem.update(deltaTime);
  const QUIET_ITEMS = new Set(['grass', 'dirt', 'stone', 'sand', 'leaves']);
  itemDropManager.update(deltaTime, new THREE.Vector3(player.position.x, player.position.y, player.position.z), (itemId, count) => {
    if (!QUIET_ITEMS.has(itemId)) {
      const itemMeta = getItemById(itemId);
      toastSystem.show(`+${count} ${itemMeta ? itemMeta.name : itemId}`, 'info');
    }
    const rem = hotbar.addItem(itemId, count);
    if (rem > 0) inventory.addItem(itemId, rem);
  });

  if ((inputManager.isLeftMouseDown && !wasLeftDown) || (inputManager.isRightMouseDown && !wasRightDown)) {
    handModel.triggerSwing();
  }

  camera.position.set(
    player.position.x,
    player.position.y + player.eyeHeight,
    player.position.z,
  );

  // Surface Footsteps & View Bobbing
  if (isWalking && player.isGrounded) {
    footstepTimer += deltaTime;
    const blockBelow = world.getBlock(Math.floor(player.position.x), Math.floor(player.position.y - 0.2), Math.floor(player.position.z));
    let surface = 'dirt';
    if (blockBelow === 1) surface = 'grass';
    else if (blockBelow === 3 || blockBelow === 10) surface = 'stone';
    else if (blockBelow === 4) surface = 'sand';
    else if (blockBelow === 5 || blockBelow === 8 || blockBelow === 9 || blockBelow === 12) surface = 'wood';
    else if (blockBelow === 7) surface = 'water';

    if (footstepTimer >= 0.35) {
      footstepTimer = 0;
      AudioManager.getInstance().playSFX(`footstep_${surface}`);
    }

    bobbingTimer += deltaTime * 12;
    camera.position.y += Math.sin(bobbingTimer) * 0.035;
    camera.position.x += Math.cos(bobbingTimer * 0.5) * 0.018;
  } else {
    footstepTimer = 0;
  }

  // 3D Block Selection Outline Box
  blockHighlight.update(world, camera);

  // F3 Debug Screen Update
  const facingDir = getFacingDirection(camera);
  const currentBiome = biomeGen.getBiome(Math.floor(player.position.x), Math.floor(player.position.z));
  const biomeName = currentBiome ? (currentBiome.charAt(0).toUpperCase() + currentBiome.slice(1)) : 'Plains';
  debugScreen.update({
    fps: clock.getFPS(),
    posX: player.position.x,
    posY: player.position.y,
    posZ: player.position.z,
    chunkX: Math.floor(player.position.x / CHUNK_SIZE_X),
    chunkZ: Math.floor(player.position.z / CHUNK_SIZE_Z),
    facing: facingDir,
    biome: biomeName,
    dimension: DimensionManager.getInstance().currentDimension,
    mobsCount: mobManager.mobs.length,
  });

  sky.position.copy(camera.position);
  sky.position.y = 0;

  // Placed Torch Dynamic Lighting & Held Torch Light
  torchLightManager.update(world, new THREE.Vector3(player.position.x, player.position.y, player.position.z));

  const currentActiveItem = hotbar.getActiveItem();
  if (currentActiveItem.itemId === 'torch') {
    playerTorchLight.position.copy(camera.position);
    playerTorchLight.intensity = 3.2 + Math.sin(Date.now() * 0.014) * 0.4 + Math.cos(Date.now() * 0.028) * 0.2;
  } else {
    playerTorchLight.intensity = 0;
  }

  // Dynamic Water Surface Ripple Animation
  if (waterTexture) {
    waterTexture.offset.x = (waterTexture.offset.x + deltaTime * 0.03) % 1;
    waterTexture.offset.y = (waterTexture.offset.y + deltaTime * 0.02) % 1;
  }

  // Day/night & Underwater fog styling
  const skyColors = dayNight.skyColor;
  if (scene.background) (scene.background as THREE.Color).set(skyColors.top);
  if (scene.fog) {
    if (playerController.isSubmerged) {
      scene.fog.color.setHex(0x003366);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.08;
    } else {
      scene.fog.color.set(skyColors.bottom);
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.015;
    }
  }

  cloudManager.update(deltaTime, dayNight.timeOfDay, camera.position);

  const sunAngle = dayNight.timeOfDay * Math.PI * 2;
  const sunDist = 50;
  lights.directional.position.set(
    Math.cos(sunAngle) * sunDist,
    Math.sin(sunAngle) * sunDist,
    10,
  );
  lights.directional.intensity = Math.max(0.2, dayNight.lightIntensity * 1.35);
  lights.ambient.intensity = Math.max(0.25, dayNight.lightIntensity * 0.55);
  if (lights.hemi) lights.hemi.intensity = Math.max(0.2, dayNight.lightIntensity * 0.5);

  // Spawn hostile mobs at night on solid land (Overworld only)
  if (!DimensionManager.getInstance().isNether() && dayNight.isNight && mobManager.mobs.length < mobManager.mobCap && Math.random() < 0.01) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 25, 70);
    if (spawnPos) {
      const rand = Math.random();
      if (rand < 0.35) mobManager.spawn(spawnPos, new Zombie(spawnPos));
      else if (rand < 0.65) mobManager.spawn(spawnPos, new Skeleton(spawnPos));
      else if (rand < 0.85) mobManager.spawn(spawnPos, new Spider(spawnPos));
      else mobManager.spawn(spawnPos, new Enderman(spawnPos));
    }
  }

  // Nether mob spawning: Skeletons, Spiders & Endermen (always dangerous, higher rate)
  if (DimensionManager.getInstance().isNether() && mobManager.mobs.length < mobManager.mobCap && Math.random() < 0.015) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 20, 60);
    if (spawnPos) {
      const rand = Math.random();
      if (rand < 0.4) {
        mobManager.spawn(spawnPos, new Skeleton(spawnPos));
      } else if (rand < 0.75) {
        mobManager.spawn(spawnPos, new Spider(spawnPos));
      } else {
        mobManager.spawn(spawnPos, new Enderman(spawnPos));
      }
    }
  }

  // Nether ambient sounds
  if (DimensionManager.getInstance().isNether()) {
    if (Math.random() < 0.003) {
      AudioManager.getInstance().playSFX('nether_ambient');
    }
    if (Math.random() < 0.006) {
      AudioManager.getInstance().playSFX('lava_bubble');
    }
  }

  // Spawn passive animals during daytime in appropriate biomes (Overworld only)
  if (!DimensionManager.getInstance().isNether() && !dayNight.isNight && mobManager.mobs.length < mobManager.mobCap && Math.random() < 0.008) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 25, 75);
    if (spawnPos) {
      const topBlock = world.getBlock(Math.floor(spawnPos.x), Math.floor(spawnPos.y - 1), Math.floor(spawnPos.z));
      if (topBlock === 1 || topBlock === 2) { // Grass (1) or Dirt (2) -> Plains / Forest
        const rand = Math.random();
        if (rand < 0.25) {
          mobManager.spawn(spawnPos, new Pig(spawnPos));
        } else if (rand < 0.50) {
          mobManager.spawn(spawnPos, new Chicken(spawnPos));
        } else if (rand < 0.70) {
          mobManager.spawn(spawnPos, new Cow(spawnPos));
        } else if (rand < 0.88) {
          mobManager.spawn(spawnPos, new Villager(spawnPos));
        } else {
          mobManager.spawn(spawnPos, new Enderman(spawnPos));
        }
      } else if (topBlock === 3 || spawnPos.y > 70) { // Stone (3) -> Mountains
        mobManager.spawn(spawnPos, new Goat(spawnPos));
      } else if (topBlock === 4) { // Sand (4) -> Beach
        mobManager.spawn(spawnPos, new Turtle(spawnPos));
      }
    }
  }

  mobManager.update(deltaTime, new THREE.Vector3(player.position.x, player.position.y, player.position.z), player, camera, dayNight.isNight);
  
  // Undead Daylight Burning mechanic (Zombie & Skeleton burn in direct sunlight)
  if (!dayNight.isNight && !DimensionManager.getInstance().isNether()) {
    for (const mob of mobManager.mobs) {
      if (mob instanceof Zombie || mob instanceof Skeleton) {
        const mx = Math.floor(mob.position.x);
        const my = Math.floor(mob.position.y);
        const mz = Math.floor(mob.position.z);
        const inWater = world.getBlock(mx, my, mz) === 7;
        const headBlock = world.getBlock(mx, my + 2, mz);
        if (!inWater && headBlock === 0) {
          mob.takeDamage(deltaTime * 1.5);
        }
      }
    }
  }

  ProjectileManager.getInstance().update(deltaTime, world, player, mobManager);

  blockBreaker.updateOutline(camera);
  blockBreaker.updateBreak(deltaTime, inputManager.isLeftMouseDown, camera, hotbar.getActiveItem());

  let crosshairState: 'none' | 'block' | 'mob' = 'none';
  const crosshairRay = new THREE.Raycaster();
  crosshairRay.setFromCamera(new THREE.Vector2(0, 0), camera);
  crosshairRay.far = 5.0;

  const mobMeshes = mobManager.mobs.map((m) => m.mesh);
  const mobHits = mobMeshes.length > 0 ? crosshairRay.intersectObjects(mobMeshes, true) : [];

  let hitMobIdx = -1;
  if (mobHits.length > 0) {
    hitMobIdx = findMobIndexFromHitObject(mobHits[0].object);
    if (hitMobIdx >= 0) {
      crosshairState = 'mob';
    }
  }
  if (crosshairState === 'none' && blockBreaker.getTarget(camera)) {
    crosshairState = 'block';
  }
  hud.setCrosshairState(crosshairState);
  playerController.onWaterSplash = (pos) => {
    particleSystem.spawnWaterSplashParticles(pos);
    AudioManager.getInstance().playSFX('footstep_water');
  };

  // Left click mob attack hit
  if (inputManager.isLeftMouseDown && !wasLeftDown && hitMobIdx >= 0) {
    handModel.triggerSwing();
    AudioManager.getInstance().playSFX('hit');

    let damage = 4;
    const activeTool = hotbar.getActiveItem();
    if (activeTool?.itemId) {
      const itemDef = getItemById(activeTool.itemId);
      if (itemDef?.toolType === 'sword') damage = 8;
      else if (itemDef?.toolType) damage = 6;

      // Tool durability reduction on hit
      if (activeTool.durability !== undefined) {
        activeTool.durability--;
        if (activeTool.durability <= 0) {
          hotbar.removeItem(activeTool.itemId, 1);
          AudioManager.getInstance().playSFX('break');
        }
      }
    }

    const targetMob = mobManager.mobs[hitMobIdx];
    if (targetMob) {
      const knockDir = targetMob.position.clone().sub(player.position).normalize();
      targetMob.applyKnockback(knockDir, 6.5);
    }

    const deadMob = mobManager.damageMob(hitMobIdx, damage, new THREE.Vector3(player.position.x, player.position.y, player.position.z));
    networkManager.sendMobDamage(hitMobIdx, damage);

    if (deadMob) {
      const dropPos = targetMob ? targetMob.position.clone() : new THREE.Vector3(player.position.x, player.position.y, player.position.z);
      dropPos.y += 0.5;
      particleSystem.spawnDeathParticles(dropPos);
      AudioManager.getInstance().playSFX('break');

      if (deadMob instanceof Cow) {
        const beefCount = Math.floor(Math.random() * 3); // 0-2x Raw Beef
        if (beefCount > 0) itemDropManager.spawnDrop(dropPos, 'raw_beef', beefCount);
        const leatherCount = Math.floor(Math.random() * 3); // 0-2x Leather
        if (leatherCount > 0) itemDropManager.spawnDrop(dropPos, 'leather', leatherCount);
      } else if (deadMob instanceof Zombie) {
        itemDropManager.spawnDrop(dropPos, 'rotten_flesh', Math.floor(Math.random() * 2) + 1);
      } else if (deadMob instanceof IronGolem) {
        itemDropManager.spawnDrop(dropPos, 'iron_ingot', Math.floor(Math.random() * 3) + 3);
      } else if (deadMob instanceof Skeleton) {
        itemDropManager.spawnDrop(dropPos, 'bone', Math.floor(Math.random() * 2) + 1);
        const arrowCount = Math.floor(Math.random() * 3);
        if (arrowCount > 0) {
          itemDropManager.spawnDrop(dropPos, 'arrow', arrowCount);
        }
      } else if (deadMob instanceof Spider) {
        itemDropManager.spawnDrop(dropPos, 'string', Math.floor(Math.random() * 2) + 1);
      } else if (deadMob instanceof Enderman) {
        if (Math.random() < 0.6) {
          itemDropManager.spawnDrop(dropPos, 'ender_pearl', 1);
        }
      } else if (deadMob instanceof Pig) {
        itemDropManager.spawnDrop(dropPos, 'raw_porkchop', Math.floor(Math.random() * 2) + 1);
      } else if (deadMob instanceof Chicken) {
        itemDropManager.spawnDrop(dropPos, 'raw_chicken', 1);
        const featherCount = Math.floor(Math.random() * 3); // 0-2x Feather
        if (featherCount > 0) itemDropManager.spawnDrop(dropPos, 'feather', featherCount);
      } else if (deadMob instanceof Goat) {
        // Goat has no standard death item drop (Horn obtained by ramming)
      }
    }
  }
  wasLeftDown = inputManager.isLeftMouseDown;

  const bp = blockBreaker.getBreakProgress();
  if (bp > 0) { progressBar.style.display = 'block'; progressFill.style.width = `${bp * 100}%`; }
  else progressBar.style.display = 'none';

  // Continuous right click handling for block placement & interaction
  if (inputManager.isRightMouseDown && !wasRightDown) {
    const targetHit = blockBreaker.getTarget(camera);
    const activeItem = hotbar.getActiveItem();

    if (targetHit) {
      const hitBlockId = world.getBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
      if (hitBlockId === 12) {
        chestScreen.openChest(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        wasRightDown = inputManager.isRightMouseDown;
        return;
      } else if (hitBlockId === 9) {
        inventoryScreen.open();
        wasRightDown = inputManager.isRightMouseDown;
        return;
      } else if (hitBlockId === 10) { // Furnace block
        furnaceScreen.open(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        wasRightDown = inputManager.isRightMouseDown;
        return;
      }
    }

    if (activeItem.itemId && activeItem.count > 0) {
      const isFoodItem = [
        'raw_beef', 'cooked_beef',
        'raw_porkchop', 'cooked_porkchop',
        'raw_chicken', 'cooked_chicken',
        'mutton', 'cooked_mutton',
        'bread', 'rotten_flesh', 'beef'
      ].includes(activeItem.itemId);

      if (isFoodItem) {
        // Eat food to restore HP!
        if (player.health < 20) {
          let healAmount = 3;
          if (activeItem.itemId.startsWith('cooked_')) healAmount = 8;
          else if (activeItem.itemId === 'bread') healAmount = 5;
          else if (activeItem.itemId === 'rotten_flesh') healAmount = 2;
          else healAmount = 3; // raw meats

          player.health = Math.min(20, player.health + healAmount);
          hotbar.removeItem(activeItem.itemId, 1);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('eat');
          hud.update(player.health);
          toastSystem.show(`Memakan ${getItemById(activeItem.itemId)?.name} (+${healAmount} HP)`, 'success');
        } else {
          toastSystem.show('Darah sudah penuh! (20/20 HP)', 'info');
        }
      } else if (activeItem.itemId.includes('hoe') && targetHit) {
        // Till Grass (1) or Dirt (2) into Farmland (13)!
        const hitBlockId = world.getBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        if (hitBlockId === 1 || hitBlockId === 2) {
          world.setBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 13);
          networkManager.sendBlockChange(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 13);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('footstep');
          if (activeItem.durability !== undefined) {
            activeItem.durability--;
            if (activeItem.durability <= 0) {
              hotbar.removeItem(activeItem.itemId, 1);
              AudioManager.getInstance().playSFX('break');
            }
          }
        }
      } else if (activeItem.itemId === 'wheat_seeds' && targetHit) {
        // Plant Wheat Seeds (14) on top of Farmland (13), Grass (1), or Dirt (2)!
        const hitBlockId = world.getBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        if (hitBlockId === 13 || hitBlockId === 1 || hitBlockId === 2) {
          const plantY = targetHit.normalY > 0 ? targetHit.blockY + 1 : targetHit.blockY;
          const soilY = targetHit.normalY > 0 ? targetHit.blockY : targetHit.blockY - 1;
          const currentSoil = world.getBlock(targetHit.blockX, soilY, targetHit.blockZ);

          if (currentSoil === 1 || currentSoil === 2) {
            world.setBlock(targetHit.blockX, soilY, targetHit.blockZ, 13); // Auto-till soil into farmland
            networkManager.sendBlockChange(targetHit.blockX, soilY, targetHit.blockZ, 13);
          }

          if (world.getBlock(targetHit.blockX, plantY, targetHit.blockZ) === 0) {
            world.setBlock(targetHit.blockX, plantY, targetHit.blockZ, 14); // Plant wheat crop
            networkManager.sendBlockChange(targetHit.blockX, plantY, targetHit.blockZ, 14);
            hotbar.removeItem('wheat_seeds', 1);
            handModel.triggerSwing();
            AudioManager.getInstance().playSFX('place');
            toastSystem.show('Wheat Seeds Planted! 🌱', 'success');
          }
        }
      } else {
        const blockIdToPlace = itemIdToBlockId(activeItem.itemId);
        if (blockIdToPlace) {
          const placed = blockPlacer.place(camera, blockIdToPlace, player.position.x, player.position.y, player.position.z);
          if (placed) {
            hotbar.removeItem(activeItem.itemId, 1);
            if (targetHit) {
              const px = targetHit.blockX + targetHit.normalX;
              const py = targetHit.blockY + targetHit.normalY;
              const pz = targetHit.blockZ + targetHit.normalZ;
              networkManager.sendBlockChange(px, py, pz, blockIdToPlace);

              if (blockIdToPlace === 15 || blockIdToPlace === 11) {
                if (PortalDetector.detectAndIgnitePortal(world, px, py, pz)) {
                  AudioManager.getInstance().playSFX('portal_hum');
                  toastSystem.show('Nether Portal Ignited! 🔮', 'success');
                }
              }
            }
          }
        } else if (activeItem.itemId === 'stick' || activeItem.itemId === 'wheat') {
          const itemDef = getItemById(activeItem.itemId);
          toastSystem.show(`${itemDef?.name || activeItem.itemId} digunakan untuk resep crafting! Tekan [E] untuk craft.`, 'info');
        }
      }
    }
  }
  wasRightDown = inputManager.isRightMouseDown;

  const { chunkX: cx, chunkZ: cz } = worldToChunkCoord(player.position.x, 0, player.position.z);
  if (cx !== previousChunkX || cz !== previousChunkZ) {
    previousChunkX = cx; previousChunkZ = cz;
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
  } else {
    chunkManager.processLoadQueue(2);
  }

  // Nether Portal Standing Detection & 3-second Teleport Countdown Timer
  const playerFeetX = Math.floor(player.position.x);
  const playerFeetY = Math.floor(player.position.y);
  const playerFeetZ = Math.floor(player.position.z);
  const feetBlockId = world.getBlock(playerFeetX, playerFeetY, playerFeetZ);
  const bodyBlockId = world.getBlock(playerFeetX, playerFeetY + 1, playerFeetZ);

  if (feetBlockId === 18 || bodyBlockId === 18) {
    portalTimer += deltaTime;
    const isNether = DimensionManager.getInstance().isNether();
    const targetName = isNether ? 'Overworld' : 'Nether';
    dimensionOverlay.show(targetName, portalTimer / 3.0);

    if (Math.random() < 0.08) {
      AudioManager.getInstance().playSFX('portal_hum');
    }

    if (portalTimer >= 3.0) {
      portalTimer = 0;
      dimensionOverlay.hide();

      const nextDimension = isNether ? DimensionType.OVERWORLD : DimensionType.NETHER;
      const targetPos = DimensionManager.getInstance().getConvertedCoordinates(player.position, nextDimension);

      DimensionManager.getInstance().setDimension(nextDimension, scene);
      AudioManager.getInstance().setDimensionAmbience(nextDimension);
      player.position = targetPos;

      // Auto-generate destination portal frame in target dimension
      for (let dy = 0; dy < 5; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const isBorder = (dx === 0 || dx === 3 || dy === 0 || dy === 4);
          const bId = isBorder ? 15 : 18;
          world.setBlock(Math.floor(targetPos.x) + dx - 1, Math.floor(targetPos.y) + dy, Math.floor(targetPos.z), bId);
        }
      }

      AudioManager.getInstance().playSFX('portal_teleport');
      hud.setDimension(nextDimension);
      const welcomeMsg = nextDimension === 'nether' ? 'Welcome to the Nether! 🔥' : `Teleported to ${targetName}! 🔮`;
      toastSystem.show(welcomeMsg, 'success');
    }
  } else if (portalTimer > 0) {
    portalTimer = 0;
    dimensionOverlay.hide();
  }

  chunkManager.updateFrustumCulling(camera);
  renderer.render(scene, camera);
  inputManager.resetMouseDelta();
  clock.update(deltaTime);
  hud.updatePlayerPos(player.position.x, player.position.y, player.position.z, camera.rotation.y, clock.getFPS());
  hud.setSubmergedState(playerController.isSubmerged, playerController.oxygen);
  hud.update(player.health);
  hud.setTime(dayNight.timeOfDay);
});

engine.start();
saveManager.startAutoSave();
console.log('Engine started');

// Debug
if (import.meta.env.DEV) {
  const win = window as unknown as Record<string, unknown>;
  win.world = world; win.chunkManager = chunkManager; win.camera = camera;
  win.player = player; win.hotbar = hotbar; win.inventory = inventory;
  win.tp = (x: number, y: number, z: number) => {
    player.position.x = x; player.position.y = y; player.position.z = z;
    camera.position.set(x, y + player.eyeHeight, z);
    chunkManager.update(x, z, gameSettings.renderDistance);
  };
  win.setSeed = (seedStr: string) => {
    worldSeed = seedFromString(seedStr); worldSeedString = seedStr;
    const gens = createGenerators(worldSeed);
    heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise; lakeNoise = gens.lakeNoise;
    chunkManager.unloadAllChunks();
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
    console.log(`[Seed] Regenerated: "${seedStr}"`);
  };
  win.save = () => saveManager.save();
  win.load = () => saveManager.load();
  console.log('[Debug] Commands: tp, setSeed, save, load, world, hotbar');
}
