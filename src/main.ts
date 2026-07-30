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
import { ChunkManager } from './world/ChunkManager';
import { World } from './world/World';
import { gameSettings } from './core/GameSettings';
import { worldToChunkCoord } from './utils/math';
import { SettingsMenu } from './ui/SettingsMenu';
import { HUD } from './ui/HUD';
import { InventoryScreen } from './ui/InventoryScreen';
import { NoiseGenerator, seedFromString } from './world/terrain/NoiseGenerator';
import { HeightMap } from './world/terrain/HeightMap';
import { BiomeGenerator, BiomeType } from './world/terrain/BiomeGenerator';
import { generateTrees } from './world/terrain/TreeGenerator';
import { BlockBreaker } from './interaction/BlockBreaker';
import { BlockPlacer } from './interaction/BlockPlacer';
import { Inventory } from './inventory/Inventory';
import { Hotbar } from './inventory/Hotbar';
import { blockIdToItemId } from './inventory/ItemRegistry';
import { SaveManager } from './save/SaveManager';
import { MobManager } from './mobs/MobManager';
import { Cow } from './mobs/passive/Cow';
import * as THREE from 'three';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_HEIGHT, WATER_LEVEL } from './utils/constants';
import type { Chunk } from './world/Chunk';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element #game not found');

console.log('Mini Minecraft initialized');

// World gen
let worldSeed = Date.now();
let worldSeedString = String(worldSeed);

function createGenerators(seed: number) {
  const n = new NoiseGenerator(seed);
  return {
    heightMap: new HeightMap(n),
    biomeGen: new BiomeGenerator(new NoiseGenerator(seed + 1)),
    caveNoise: new NoiseGenerator(seed + 2),
  };
}

let { heightMap, biomeGen, caveNoise } = createGenerators(worldSeed);

// Player & physics
const player = new Player();
const playerController = new PlayerController(player);

// World
const chunkManager = new ChunkManager(scene);
const world = new World(chunkManager);
const playerCollision = new PlayerCollision(player, world);

chunkManager.terrainFiller = (chunk: Chunk) => {
  chunk.fill(0);
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunk.chunkX * CHUNK_SIZE_X + lx;
      const wz = chunk.chunkZ * CHUNK_SIZE_Z + lz;
      const h = heightMap.getHeight(wx, wz);
      for (let y = 0; y <= h && y < CHUNK_HEIGHT; y++) {
        const depth = h - y;
        let bid: number;
        if (depth === 0) {
          const biome = biomeGen.getBiome(wx, wz);
          if (biome === BiomeType.Desert) bid = 4;
          else if (biome === BiomeType.Mountain && h > 80) bid = 3;
          else bid = 1;
        } else if (depth <= 3) {
          bid = biomeGen.getBiome(wx, wz) === BiomeType.Desert ? 4 : 2;
        } else bid = 3;
        chunk.setBlock(lx, y, lz, bid);
      }
    }
  }
  for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
      const wx = chunk.chunkX * CHUNK_SIZE_X + lx;
      const wz = chunk.chunkZ * CHUNK_SIZE_Z + lz;
      const h = heightMap.getHeight(wx, wz);
      if (h < WATER_LEVEL) {
        for (let y = h + 1; y <= WATER_LEVEL && y < CHUNK_HEIGHT; y++) {
          chunk.setBlock(lx, y, lz, 7);
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
  generateTrees(chunk, heightMap, biomeGen);
};

console.log(`[Seed] World seed: "${worldSeedString}" (${worldSeed})`);

// Inventory
const inventory = new Inventory();
const hotbar = new Hotbar();

// Mobs
const mobManager = new MobManager(scene);
const dayNight = new DayNightCycle();

// Spawn player on terrain surface immediately
const spawnH = heightMap.getHeight(player.position.x, player.position.z);
player.position.y = spawnH + 2;
camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);

// Load terrain NOW (don't wait for save/load)
chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
console.log(`[World] Loading terrain around (${player.position.x.toFixed(0)}, ${player.position.z.toFixed(0)})...`);

// Spawn initial mobs
for (let i = 0; i < 3; i++) {
  mobManager.spawn(
    new THREE.Vector3(player.position.x + (Math.random() - 0.5) * 30, 60, player.position.z + (Math.random() - 0.5) * 30),
    new Cow(new THREE.Vector3()),
  );
}

// Save/Load (async, non-blocking)
const saveManager = new SaveManager(chunkManager, player, inventory, hotbar, dayNight, () => worldSeed);
saveManager.init().then(() => saveManager.load()).then((savedSeed) => {
  if (savedSeed !== null) {
    if (savedSeed !== worldSeed) {
      // Seed changed since save — regenerate
      worldSeed = savedSeed;
      const gens = createGenerators(worldSeed);
      heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise;
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

// Interaction
const blockBreaker = new BlockBreaker(scene, world);
const blockPlacer = new BlockPlacer(world);

blockBreaker.setOnBlockBroken((_x, _y, _z, blockId) => {
  const itemId = blockIdToItemId(blockId);
  if (itemId) {
    const rem = hotbar.addItem(itemId, 1);
    if (rem > 0) inventory.addItem(itemId, rem);
  }
});

// UI
const settingsMenu = new SettingsMenu();
settingsMenu.create(() => {
  chunkManager.forceReload(gameSettings.renderDistance, camera.position.x, camera.position.z);
});
const hud = new HUD(hotbar);

const inventoryScreen = new InventoryScreen(inventory, hotbar);
inventoryScreen.create();

canvas.addEventListener('click', () => inputManager.requestPointerLock());
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar switching
window.addEventListener('keydown', (e) => {
  if (e.key === 'o' || e.key === 'O') { settingsMenu.toggle(); return; }
  if (e.key === 'e' || e.key === 'E') { inventoryScreen.toggle(); return; }
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) hotbar.activeSlotIndex = num - 1;
});
window.addEventListener('wheel', (e) => {
  if (!inputManager.isPointerLocked) return;
  if (e.deltaY > 0) hotbar.activeSlotIndex = (hotbar.activeSlotIndex + 1) % 9;
  else hotbar.activeSlotIndex = (hotbar.activeSlotIndex + 8) % 9;
});

// Sky
const sky = createSky();
scene.add(sky);

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

// Engine
let previousChunkX = 0, previousChunkZ = 0;
let wasRightDown = false;
const engine = new Engine();

engine.setUpdateCallback((deltaTime) => {
  dayNight.update(deltaTime);
  playerCamera.update();
  playerController.update(deltaTime, camera);
  playerCollision.checkAndResolve();

  camera.position.set(
    player.position.x,
    player.position.y + player.eyeHeight,
    player.position.z,
  );

  sky.position.copy(camera.position);
  sky.position.y = 0;

  // Day/night lighting
  const sunAngle = dayNight.timeOfDay * Math.PI * 2;
  const sunDist = 50;
  lights.directional.position.set(
    Math.cos(sunAngle) * sunDist,
    Math.sin(sunAngle) * sunDist,
    10,
  );
  lights.directional.intensity = dayNight.lightIntensity;
  lights.ambient.intensity = Math.max(0.1, dayNight.lightIntensity * 0.3);
  mobManager.update(deltaTime, new THREE.Vector3(player.position.x, player.position.y, player.position.z));

  blockBreaker.updateOutline(camera);
  blockBreaker.updateBreak(deltaTime, inputManager.isLeftMouseDown, camera);

  const bp = blockBreaker.getBreakProgress();
  if (bp > 0) { progressBar.style.display = 'block'; progressFill.style.width = `${bp * 100}%`; }
  else progressBar.style.display = 'none';

  const activeItem = hotbar.getActiveItem();
  const placeBlockId = activeItem.itemId ? 3 : 0;
  if (inputManager.isRightMouseDown && !wasRightDown) {
    blockPlacer.place(camera, placeBlockId, player.position.x, player.position.y, player.position.z);
  }
  wasRightDown = inputManager.isRightMouseDown;

  const { chunkX: cx, chunkZ: cz } = worldToChunkCoord(player.position.x, 0, player.position.z);
  if (cx !== previousChunkX || cz !== previousChunkZ) {
    previousChunkX = cx; previousChunkZ = cz;
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
  }

  renderer.render(scene, camera);
  inputManager.resetMouseDelta();
  clock.update(deltaTime);
  hud.update();
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
    heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise;
    chunkManager.unloadAllChunks();
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
    console.log(`[Seed] Regenerated: "${seedStr}"`);
  };
  win.save = () => saveManager.save();
  win.load = () => saveManager.load();
  console.log('[Debug] Commands: tp, setSeed, save, load, world, hotbar');
}
