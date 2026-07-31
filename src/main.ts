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
import { ChatBox } from './multiplayer/ChatBox';
import { TorchLightManager } from './world/TorchLightManager';
import { NoiseGenerator, seedFromString } from './world/terrain/NoiseGenerator';
import { HeightMap } from './world/terrain/HeightMap';
import { BiomeGenerator, BiomeType } from './world/terrain/BiomeGenerator';
import { generateTrees } from './world/terrain/TreeGenerator';
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
  };
}

let { heightMap, biomeGen, caveNoise } = createGenerators(worldSeed);

// Player & physics
const player = new Player();

// World
const chunkManager = new ChunkManager(scene);
const world = new World(chunkManager);
const playerController = new PlayerController(player, world);
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
  world.applyModificationsToChunk(chunk);
};

console.log(`[Seed] World seed: "${worldSeedString}" (${worldSeed})`);

// Inventory
const inventory = new Inventory();
const hotbar = new Hotbar();

// Mobs
const mobManager = new MobManager(scene, world);
const dayNight = new DayNightCycle();

// Spawn player on terrain surface immediately
const spawnH = heightMap.getHeight(player.position.x, player.position.z);
player.position.y = spawnH + 2;
camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);

// Load terrain NOW (don't wait for save/load)
chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
console.log(`[World] Loading terrain around (${player.position.x.toFixed(0)}, ${player.position.z.toFixed(0)})...`);

// Spawn initial mobs on solid land
function getLandSpawnPos(originX: number, originZ: number, radius: number): THREE.Vector3 | null {
  for (let attempt = 0; attempt < 15; attempt++) {
    const rx = originX + (Math.random() - 0.5) * radius;
    const rz = originZ + (Math.random() - 0.5) * radius;
    const h = heightMap.getHeight(rx, rz);
    if (h > WATER_LEVEL + 1) {
      return new THREE.Vector3(rx, h + 1, rz);
    }
  }
  return null;
}

for (let i = 0; i < 4; i++) {
  const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 40);
  if (spawnPos) {
    mobManager.spawn(spawnPos, new Cow(spawnPos));
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

// Interaction & Polish
const particleSystem = new ParticleSystem(scene);
const itemDropManager = new ItemDropManager(scene);
const torchLightManager = new TorchLightManager(scene);
const blockBreaker = new BlockBreaker(scene, world);
const blockPlacer = new BlockPlacer(world);
const blockHighlight = new BlockHighlight(scene);
const debugScreen = new DebugScreen();
const toastSystem = ToastSystem.getInstance();

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

const pauseMenu = new PauseMenu(saveManager, settingsMenu, () => {
  inputManager.requestPointerLock();
});
pauseMenu.create();

mainMenu.create();

canvas.addEventListener('click', () => {
  if (!mainMenu.isOpen && !pauseMenu.isOpen && !inventoryScreen.isOpen && !chestScreen.isOpen) {
    inputManager.requestPointerLock();
  }
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar switching & Menu toggling
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (chestScreen.isOpen) {
      chestScreen.closeChest();
    } else if (inventoryScreen.isOpen) {
      inventoryScreen.toggle();
    } else {
      pauseMenu.toggle();
    }
    return;
  }
  if (pauseMenu.isOpen) return;
  if (e.key === 'o' || e.key === 'O') { settingsMenu.toggle(); return; }
  if (e.key === 'e' || e.key === 'E') {
    if (chestScreen.isOpen) chestScreen.closeChest();
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
  if (mainMenu.isOpen || pauseMenu.isOpen || inventoryScreen.isOpen || chestScreen.isOpen || chatBox.visible) {
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

  // Spawn hostile zombies at night on solid land
  if (dayNight.isNight && mobManager.mobs.length < mobManager.mobCap && Math.random() < 0.005) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 40);
    if (spawnPos) {
      mobManager.spawn(spawnPos, new Zombie(spawnPos));
    }
  }

  mobManager.update(deltaTime, new THREE.Vector3(player.position.x, player.position.y, player.position.z), player);

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
        itemDropManager.spawnDrop(dropPos, 'beef', Math.floor(Math.random() * 2) + 1);
      } else if (deadMob instanceof Zombie) {
        itemDropManager.spawnDrop(dropPos, 'rotten_flesh', Math.floor(Math.random() * 2) + 1);
      }
    }
  }
  wasLeftDown = inputManager.isLeftMouseDown;

  const bp = blockBreaker.getBreakProgress();
  if (bp > 0) { progressBar.style.display = 'block'; progressFill.style.width = `${bp * 100}%`; }
  else progressBar.style.display = 'none';

  const activeItem = hotbar.getActiveItem();
  if (inputManager.isRightMouseDown && !wasRightDown) {
    const targetHit = blockBreaker.getTarget(camera);

    // Right-click Chest block (12) or Crafting Table (9) in the world!
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
      }
    }

    if (activeItem.itemId && activeItem.count > 0) {
      if (activeItem.itemId === 'beef' || activeItem.itemId === 'rotten_flesh' || activeItem.itemId === 'bread') {
        // Eat food to restore HP!
        if (player.health < 20) {
          const healAmount = activeItem.itemId === 'bread' ? 5 : activeItem.itemId === 'beef' ? 4 : 2;
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
              networkManager.sendBlockChange(targetHit.blockX + targetHit.normalX, targetHit.blockY + targetHit.normalY, targetHit.blockZ + targetHit.normalZ, blockIdToPlace);
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
    heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise;
    chunkManager.unloadAllChunks();
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
    console.log(`[Seed] Regenerated: "${seedStr}"`);
  };
  win.save = () => saveManager.save();
  win.load = () => saveManager.load();
  console.log('[Debug] Commands: tp, setSeed, save, load, world, hotbar');
}
