import './style.css';
import { Engine } from './core/Engine';
import { renderer, scene, camera, lights } from './core/Renderer';
import { inputManager, InputManager } from './core/InputManager';
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
import { TouchControls } from './ui/TouchControls';
import { InventoryScreen } from './ui/InventoryScreen';
import { MainMenu } from './ui/MainMenu';
import { HandModel } from './ui/HandModel';
import { ParticleSystem } from './world/ParticleSystem';
import { ItemDropManager } from './world/ItemDropManager';
import { Mob } from './mobs/Mob';
import { IronGolem } from './mobs/npc/IronGolem';
import { Villager } from './mobs/npc/Villager';
import { isFoodForMob } from './mobs/ai/MobFoodRegistry';
import { BreedingManager } from './mobs/ai/BreedingManager';
import { TradingScreen } from './ui/TradingScreen';
import { VillagerTradingManager } from './economy/VillagerTrading';
import { Skeleton } from './mobs/hostile/Skeleton';
import { Spider } from './mobs/hostile/Spider';
import { Enderman } from './mobs/hostile/Enderman';
import { Blaze } from './mobs/hostile/Blaze';
import { Ghast } from './mobs/hostile/Ghast';
import { Pig } from './mobs/passive/Pig';
import { Chicken } from './mobs/passive/Chicken';
import { Goat } from './mobs/passive/Goat';
import { Turtle } from './mobs/passive/Turtle';
import { ProjectileManager } from './entities/ProjectileManager';
import { ChatBox } from './multiplayer/ChatBox';
import { TorchLightManager } from './world/TorchLightManager';
import { DimensionManager, DimensionType } from './world/dimension/DimensionManager';
import { PortalDetector } from './world/dimension/PortalDetector';
import { NetherFortressGenerator } from './world/structures/NetherFortressGenerator';
import { DimensionTransitionOverlay } from './ui/DimensionTransitionOverlay';
import { NetherWorldGenerator } from './world/dimension/NetherWorldGenerator';
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
import { loadBlockTexture, getBlockById } from './world/BlockRegistry';
import { SaveManager } from './save/SaveManager';
import { MobManager } from './mobs/MobManager';
import { Cow } from './mobs/passive/Cow';
import { Zombie } from './mobs/hostile/Zombie';
import { BlockHighlight } from './interaction/BlockHighlight';
import { DebugScreen } from './ui/DebugScreen';
import { ToastSystem } from './ui/ToastSystem';
import { FurnaceScreen } from './ui/FurnaceScreen';
import { FurnaceManager } from './inventory/FurnaceManager';
import { CropManager } from './world/farming/CropManager';
import { survivalManager } from './survival/SurvivalManager';
import { statsTracker } from './survival/StatsTracker';
import { EndGameScreen } from './ui/EndGameScreen';
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
const netherWorldGen = new NetherWorldGenerator(worldSeed);

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

const fillChunkStaged = (chunk: Chunk, stage: number): boolean => {
  if (DimensionManager.getInstance().isNether()) {
    if (stage === 1) {
      chunk.fill(0);
      const chunkMinWX = chunk.chunkX * CHUNK_SIZE_X;
      const chunkMinWZ = chunk.chunkZ * CHUNK_SIZE_Z;
      for (let lz = 0; lz < CHUNK_SIZE_Z; lz++) {
        for (let lx = 0; lx < CHUNK_SIZE_X; lx++) {
          const wx = chunkMinWX + lx;
          const wz = chunkMinWZ + lz;
          for (let y = 0; y < CHUNK_HEIGHT; y++) {
            const bid = netherWorldGen.getBlockId(wx, y, wz);
            if (bid !== 0) {
              chunk.setBlock(lx, y, lz, bid);
            }
          }
        }
      }
      return false;
    } else if (stage === 2) {
      world.applyModificationsToChunk(chunk);
      return true;
    }
    return true;
  }

  // Frame A (Stage 1): Base heightmap + biome + surface layering + water fill
  if (stage === 1) {
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

        if (h < WATER_LEVEL) {
          for (let y = h + 1; y <= WATER_LEVEL && y < CHUNK_HEIGHT; y++) {
            chunk.setBlock(lx, y, lz, 7); // Water block
          }
        }
      }
    }
    return false;
  }

  // Frame B (Stage 2): 3D Cave carving noise
  if (stage === 2) {
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
    return false;
  }

  // Frame C (Stage 3): Ore generation & Tree generation
  if (stage === 3) {
    oreGen.generateForChunk(chunk);
    generateTrees(chunk, heightMap, biomeGen);
    return false;
  }

  // Frame D (Stage 4): Village structures, Mobs, and World Modifications
  if (stage === 4) {
    villageGen.generateForChunk(chunk, heightMap, biomeGen);
    villageGen.spawnVillageNPCsForChunk(chunk, mobManager, heightMap, biomeGen);
    spawnNaturalMobsForChunk(chunk, mobManager, heightMap, biomeGen);
    world.applyModificationsToChunk(chunk);
    return true;
  }

  return true;
};

chunkManager.terrainStageFiller = fillChunkStaged;

// Synchronous single-pass wrapper for teleportation/initialization
chunkManager.terrainFiller = (chunk: Chunk) => {
  for (let s = 1; s <= 4; s++) {
    const isDone = fillChunkStaged(chunk, s);
    if (isDone) break;
  }
};

function spawnNaturalMobsForChunk(chunk: Chunk, mobManager: MobManager, heightMap: HeightMap, biomeGen: BiomeGenerator): void {
  if (!mobManager.canSpawnPassive()) return;
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

// Spawn player on terrain surface immediately with seed-randomized offset
const spawnSeedX = Math.round((Math.sin(worldSeed * 0.0001) * 10000) % 400);
const spawnSeedZ = Math.round((Math.cos(worldSeed * 0.0001) * 10000) % 400);
player.position.x = spawnSeedX + 0.5;
player.position.z = spawnSeedZ + 0.5;
const spawnH = heightMap.getHeight(player.position.x, player.position.z);
player.position.y = spawnH + 2.1;
player.velocity.x = 0;
player.velocity.y = 0;
player.velocity.z = 0;
player.isGrounded = false;
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
const saveManager = new SaveManager(chunkManager, world, player, inventory, hotbar, dayNight, () => worldSeed, mobManager);
saveManager.init().catch((err) => {
  console.warn('[Save] Failed to init save adapter:', err);
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

const cropManager = CropManager.getInstance();
cropManager.onCropGrow = (x, y, z, stage) => {
  const pos = new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5);
  particleSystem.spawnBlockBreakParticles(pos, stage === 2 ? 0xfbc02d : 0x88bb33);
  AudioManager.getInstance().playSFX('pop');
  if (stage === 1) {
    toastSystem.show('🌱 Gandum Tumbuh! (Tahap 2/3: Batang Hijau)', 'info');
  } else if (stage === 2) {
    toastSystem.show('🌾 Gandum Telah Matang Sempurna! Siap Dipanen ✨', 'success');
  }
};

const BLOCK_PARTICLE_COLORS: Record<number, number> = {
  1: 0x55aa33, 2: 0x795548, 3: 0x9e9e9e, 4: 0xe4c875, 5: 0x5d4037, 6: 0x2e7d32, 8: 0xb18c5d, 9: 0x8d6e63, 10: 0xe0d6b8, 11: 0xffaa00, 12: 0x8b5a2b, 13: 0x4e3629, 14: 0xfbc02d, 25: 0x7cb342, 26: 0x9ccc65, 27: 0xb18c5d, 28: 0x546e7a
};

blockBreaker.setOnBlockBroken((x, y, z, blockId) => {
  statsTracker.recordBlockBroken(1);
  particleSystem.spawnBlockBreakParticles(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), BLOCK_PARTICLE_COLORS[blockId] ?? 0x8d6e63);

  const blockDef = getBlockById(blockId);
  if (blockDef?.minPickaxeTier !== undefined) {
    const activeTool = hotbar.getActiveItem();
    const toolMeta = activeTool.itemId ? getItemById(activeTool.itemId) : null;
    const isPickaxe = toolMeta?.toolType === 'pickaxe';
    const pickaxeTier = isPickaxe && toolMeta?.toolTier !== undefined ? toolMeta.toolTier : 0;

    if (pickaxeTier >= blockDef.minPickaxeTier) {
      const dropItem = blockId === 22 ? 'raw_iron' : (blockIdToItemId(blockId) ?? 'stone');
      itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), dropItem, 1);
    } else {
      toastSystem.show(`Butuh Pickaxe Tier ${blockDef.minPickaxeTier} atau lebih tinggi untuk mengambil ${blockDef.name}!`, 'warning');
    }
  } else if (blockId === 1) {
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
    // Mature Wheat Crop drops 1 Wheat + 1-2 Seeds
    CropManager.getInstance().unregisterCrop(x, y, z);
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat', 1);
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat_seeds', Math.floor(Math.random() * 2) + 1);
    toastSystem.show('🌾 Panen Gandum Matang! (+1 Wheat, +Seeds)', 'success');
  } else if (blockId === 25 || blockId === 26) {
    // Immature Crop drops 1 Seeds only
    CropManager.getInstance().unregisterCrop(x, y, z);
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'wheat_seeds', 1);
    toastSystem.show('🌱 Tanaman Gandum Belum Matang! (Hanya dapat 1 benih)', 'info');
  } else if (blockId === 21) {
    // Coal Ore drops 1 Coal with any tool / bare hands
    itemDropManager.spawnDrop(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), 'coal', 1);
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

// UI & Screens Setup
const hud = new HUD(hotbar);
hud.updateLives(survivalManager.lives, survivalManager.getDifficultyConfig().initialLives, survivalManager.difficulty);
survivalManager.onLivesChange = (remainingLives, maxLives) => {
  hud.updateLives(remainingLives, maxLives, survivalManager.difficulty);
};
scene.add(camera);
const handModel = new HandModel(camera, hotbar);

import { EquipmentSlots } from './inventory/EquipmentSlots';
const equipmentSlots = new EquipmentSlots();
saveManager.setEquipmentSlots(equipmentSlots);

const inventoryScreen = new InventoryScreen(inventory, hotbar, equipmentSlots);
inventoryScreen.create();
inventoryScreen.onClose = () => updateTouchControlsState();

const chestScreen = new ChestScreen(inventory, hotbar);
chestScreen.create();
chestScreen.onClose = () => updateTouchControlsState();

const furnaceScreen = new FurnaceScreen(inventory, hotbar);
furnaceScreen.onClose = () => updateTouchControlsState();

const tradingScreen = new TradingScreen(inventory, hotbar, particleSystem);
tradingScreen.create();
tradingScreen.onClose = () => updateTouchControlsState();

const settingsMenu = new SettingsMenu();

/**
 * Reset seluruh status permainan ke kondisi awal (New Game):
 * 1. Hentikan autosave & bersihkan IndexedDB
 * 2. Reset state survival (Hari 1, nyawa penuh, status playing)
 * 3. Reset jam waktu ke 06:00 pagi
 * 4. Reset statistik permainan ke 0
 * 5. Kosongkan semua 27 slot inventory, 9 slot hotbar, 4 slot zirah, crafting grid
 * 6. Kosongkan semua peti & furnace
 * 7. Bersihkan semua item drop di dunia
 * 8. Kembalikan HP (20), Hunger (20), dan posisi ke titik spawn awal
 * 9. Reset HUD & visual tangan
 * 10. Mulai kembali autosave
 */
async function resetEntireGameState(clearSavedDb = true): Promise<void> {
  saveManager.stopAutoSave();
  if (clearSavedDb) {
    try {
      await saveManager.clearSave();
    } catch (e) {
      console.warn('[Save] Error clearing save data:', e);
    }
  }
  survivalManager.resetState();
  dayNight.resetTime();
  statsTracker.reset();

  // Clear all inventories, hotbars, equipment, chests, furnaces, and active mobs
  inventory.clear();
  hotbar.clear();
  equipmentSlots.clear();
  inventoryScreen.reset();
  ChestManager.getInstance().clearAllChests();
  FurnaceManager.getInstance().clearAllFurnaces();
  CropManager.getInstance().clear();
  villageGen.clear();
  itemDropManager.clearAll();
  mobManager.clearAllMobs();

  // Reset world blocks and memory chunks to pristine procedural state
  world.setModifiedBlocks([]);
  chunkManager.unloadAllChunks();

  // Reset player physics & stats
  player.health = 20;
  player.hunger = 20;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.velocity.z = 0;

  // Reset player spawn position
  const spawnY = heightMap.getHeight(0.5, 0.5) + 2.1;
  player.position.x = 0.5;
  player.position.y = spawnY;
  player.position.z = 0.5;
  camera.position.set(0.5, spawnY + player.eyeHeight, 0.5);

  // Reload pristine chunks around spawn point
  chunkManager.update(0.5, 0.5, gameSettings.renderDistance);

  // Reset dimension & HUD
  DimensionManager.getInstance().currentDimension = DimensionType.OVERWORLD;
  hud.update(20, 20);
  hud.setTime(dayNight.timeOfDay, survivalManager.currentDay);
  hud.updateLives(survivalManager.lives, survivalManager.getDifficultyConfig().initialLives, survivalManager.difficulty);
  hud.setDimension('overworld');
  hud.updateArmor(0);

  saveManager.startAutoSave();
}

const mainMenu = new MainMenu(settingsMenu, async (isLoad) => {
  if (isLoad) {
    try {
      const savedSeed = await saveManager.load();
      if (savedSeed !== null) {
        if (savedSeed !== worldSeed) {
          worldSeed = savedSeed;
          const gens = createGenerators(worldSeed);
          heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise; lakeNoise = gens.lakeNoise;
          chunkManager.unloadAllChunks();
          chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
        }
        camera.position.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);
        hud.update(player.health, player.hunger);
        hud.setTime(dayNight.timeOfDay, survivalManager.currentDay);
        hud.updateLives(survivalManager.lives, survivalManager.getDifficultyConfig().initialLives, survivalManager.difficulty);
        hud.updateArmor(equipmentSlots.getTotalDefense());
      }
    } catch (err) {
      console.warn('[Save] Failed to load:', err);
    }
  } else {
    // Fresh New World: ensure 100% clean reset of inventory, hotbar, equipment, time, and spawn point
    await resetEntireGameState(true);
  }
  inputManager.requestPointerLock();
  updateTouchControlsState();
});

settingsMenu.create(
  () => {
    renderer.setPixelRatio(gameSettings.pixelRatio);
    chunkManager.forceReload(gameSettings.renderDistance, camera.position.x, camera.position.z);
    updateTouchControlsState();
  },
  async () => {
    // Reset World: clear saved data and reset state
    await resetEntireGameState(true);
    window.location.reload();
  },
  () => {
    // Quit to Main Menu: stop music, show main menu
    AudioManager.getInstance().stopMusic();
    mainMenu.show();
    updateTouchControlsState();
  },
);

const pauseMenu = new PauseMenu(saveManager, settingsMenu, () => {
  inputManager.requestPointerLock();
  updateTouchControlsState();
});
pauseMenu.create();

function triggerSkipToNight(): void {
  if (DimensionManager.getInstance().isNether()) {
    toastSystem.show('Dimensi Nether tidak memiliki siklus siang/malam!', 'info');
    return;
  }
  const skipped = dayNight.skipToNight();
  if (skipped) {
    AudioManager.getInstance().playSFX('night_horn');
    hud.setTime(dayNight.timeOfDay, survivalManager.currentDay);
    toastSystem.show(`🌑 Malam Hari ke-${survivalManager.currentDay} dimulai! Bersiaplah bertahan!`, 'warning');
  } else {
    toastSystem.show('Saat ini sudah malam hari!', 'info');
  }
}

hud.onSkipToNight = () => {
  triggerSkipToNight();
};

pauseMenu.onSkipToNight = () => {
  triggerSkipToNight();
};

const touchControls = TouchControls.getInstance();
touchControls.onToggleInventory = () => {
  if (furnaceScreen.getIsOpen()) furnaceScreen.close();
  else if (chestScreen.isOpen) chestScreen.closeChest();
  else if (tradingScreen.isOpen) tradingScreen.close();
  else inventoryScreen.toggle();
  updateTouchControlsState();
};

touchControls.onTogglePauseMenu = () => {
  inputManager.clearKeys();
  if (chatBox.visible) {
    chatBox.close();
  } else if (tradingScreen.isOpen) {
    tradingScreen.close();
  } else if (furnaceScreen.getIsOpen()) {
    furnaceScreen.close();
  } else if (chestScreen.isOpen) {
    chestScreen.closeChest();
  } else if (inventoryScreen.isOpen) {
    inventoryScreen.close();
  } else {
    pauseMenu.toggle();
  }
  updateTouchControlsState();
};

const endGameScreen = new EndGameScreen(async () => {
  await resetEntireGameState(true);
  AudioManager.getInstance().stopMusic();
  mainMenu.show();
  updateTouchControlsState();
});

const updateTouchControlsState = (): void => {
  const modalOpen =
    mainMenu.isOpen ||
    pauseMenu.isOpen ||
    settingsMenu.isOpen ||
    inventoryScreen.isOpen ||
    chestScreen.isOpen ||
    furnaceScreen.getIsOpen() ||
    tradingScreen.isOpen ||
    chatBox.visible ||
    endGameScreen.isOpen;
  touchControls.setEnabled(!modalOpen);
  hud.setVisible(!modalOpen);
};

mainMenu.create();
touchControls.setEnabled(false); // Touch controls are strictly disabled while Main Menu is active
hud.setVisible(false); // HUD is strictly hidden while Main Menu is active

canvas.addEventListener('click', () => {
  if (!mainMenu.isOpen && !pauseMenu.isOpen && !inventoryScreen.isOpen && !chestScreen.isOpen && !furnaceScreen.getIsOpen() && !tradingScreen.isOpen) {
    inputManager.requestPointerLock();
  }
  updateTouchControlsState();
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar switching & Menu toggling
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    inputManager.clearKeys();
    if (chatBox.visible) {
      chatBox.close();
    } else if (tradingScreen.isOpen) {
      tradingScreen.close();
    } else if (furnaceScreen.getIsOpen()) {
      furnaceScreen.close();
    } else if (chestScreen.isOpen) {
      chestScreen.closeChest();
    } else if (inventoryScreen.isOpen) {
      inventoryScreen.toggle();
    } else {
      pauseMenu.toggle();
    }
    updateTouchControlsState();
    return;
  }
  if (pauseMenu.isOpen || chatBox.visible) return;
  if (e.key === 'o' || e.key === 'O') {
    inputManager.clearKeys();
    settingsMenu.toggle();
    updateTouchControlsState();
    return;
  }
  if (e.key === 'e' || e.key === 'E') {
    inputManager.clearKeys();
    if (furnaceScreen.getIsOpen()) furnaceScreen.close();
    else if (chestScreen.isOpen) chestScreen.closeChest();
    else inventoryScreen.toggle();
    updateTouchControlsState();
    return;
  }
  if (e.key === 'n' || e.key === 'N') {
    if (!mainMenu.isOpen && !inventoryScreen.isOpen && !chestScreen.isOpen && !furnaceScreen.getIsOpen() && !tradingScreen.isOpen && !endGameScreen.isOpen) {
      triggerSkipToNight();
    }
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
let currentCaveLightFactor = 1.0;

function isCaveArea(worldInstance: World, px: number, py: number, pz: number): boolean {
  if (DimensionManager.getInstance().isNether()) return true;
  const bx = Math.floor(px);
  const by = Math.floor(py);
  const bz = Math.floor(pz);

  if (by >= 120) return false;

  let solidCount = 0;
  for (let checkY = by + 2; checkY < CHUNK_HEIGHT; checkY++) {
    const bId = worldInstance.getBlock(bx, checkY, bz);
    if (bId !== 0 && bId !== 7 && bId !== 18) {
      const block = getBlockById(bId);
      if (block && block.solid) {
        solidCount++;
        if (solidCount >= 2) return true;
      }
    }
  }
  return false;
}

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

survivalManager.onGameOver = (reason: string) => {
  console.warn(`[Survival Event] >>> GAME_OVER <<< ${reason}`);
  toastSystem.show(`☠️ GAME OVER: ${reason}`, 'error');
  endGameScreen.show('lose', reason);
  updateTouchControlsState();
};

survivalManager.onGameWon = () => {
  console.log(`[Survival Event] >>> GAME_WON <<< Berhasil bertahan 15 Hari!`);
  toastSystem.show('🎉 SELAMAT! Kamu berhasil bertahan hidup sampai Hari 15!', 'success');
  endGameScreen.show('win');
  updateTouchControlsState();
};

survivalManager.onDayChange = (newDay: number) => {
  console.log(`[Survival Event] Hari berganti ke: Hari ${newDay}`);
  toastSystem.show(`📅 Hari ke-${newDay} dimulai!`, 'info');
};

function dropPartialInventory(dropPos: THREE.Vector3): void {
  for (let i = 0; i < hotbar.slots.length; i++) {
    const slot = hotbar.slots[i];
    if (slot && slot.itemId && slot.count > 0) {
      const dropCount = Math.max(1, Math.floor(slot.count / 2));
      itemDropManager.spawnDrop(dropPos, slot.itemId, dropCount);
      slot.count -= dropCount;
      if (slot.count <= 0) {
        slot.itemId = null;
        slot.count = 0;
      }
    }
  }

  for (let i = 0; i < inventory.slots.length; i++) {
    const slot = inventory.slots[i];
    if (slot && slot.itemId && slot.count > 0) {
      const dropCount = Math.max(1, Math.floor(slot.count / 2));
      itemDropManager.spawnDrop(dropPos, slot.itemId, dropCount);
      slot.count -= dropCount;
      if (slot.count <= 0) {
        slot.itemId = null;
        slot.count = 0;
      }
    }
  }
}

function restartPlayer() {
  const deathPos = new THREE.Vector3(player.position.x, Math.max(1, player.position.y), player.position.z);
  const deathResult = survivalManager.handlePlayerDeath();

  if (deathResult.dropPartialItems) {
    dropPartialInventory(deathPos);
    toastSystem.show('⚠️ Kamu pingsan! Sebagian item terjatuh.', 'warning');
  } else if (!deathResult.isGameOver) {
    if (survivalManager.difficulty === 'santai') {
      toastSystem.show('⚠️ Kamu pingsan! Respawn di titik awal (Inventaris aman).', 'info');
    } else {
      toastSystem.show(`💀 Kamu mati! Sisa nyawa: ${deathResult.remainingLives}/3`, 'error');
    }
  }

  if (deathResult.isGameOver) {
    toastSystem.show('☠️ GAME OVER! Petualanganmu berakhir.', 'error');
  }

  player.health = 20;
  player.hunger = 20;
  lastPlayerHealth = 20;
  const spawnY = heightMap.getHeight(0.5, 0.5) + 2.1;
  player.position.x = 0.5;
  player.position.y = spawnY;
  player.position.z = 0.5;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.velocity.z = 0;
  player.isGrounded = false;
  camera.position.set(0.5, spawnY + player.eyeHeight, 0.5);
  chunkManager.update(0.5, 0.5, gameSettings.renderDistance);
  hud.update(player.health, player.hunger);
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

const crosshairRay = new THREE.Raycaster();
crosshairRay.far = 5.0;
let cachedHitMobIdx = -1;
let lastMobRaycastTime = 0;

let prevPlayerX = player.position.x;
let prevPlayerZ = player.position.z;
let starveTimer = 0;
let regenTimer = 0;
let bandageCooldownTimer = 0;

engine.setUpdateCallback((deltaTime) => {
  if (mainMenu.isOpen || pauseMenu.isOpen || inventoryScreen.isOpen || chestScreen.isOpen || furnaceScreen.getIsOpen() || chatBox.visible || endGameScreen.isOpen) {
    prevPlayerX = player.position.x;
    prevPlayerZ = player.position.z;
    return;
  }

  if (bandageCooldownTimer > 0) {
    bandageCooldownTimer = Math.max(0, bandageCooldownTimer - deltaTime);
  }

  statsTracker.updatePlayTime(deltaTime);
  const moveDist = Math.hypot(player.position.x - prevPlayerX, player.position.z - prevPlayerZ);
  const isMoving = moveDist > 0.001;
  if (isMoving && moveDist < 20) {
    statsTracker.recordDistance(moveDist);
  }
  prevPlayerX = player.position.x;
  prevPlayerZ = player.position.z;

  // Hunger Drain Simulation
  const isSprinting = isMoving && (inputManager.isKeyPressed('Shift') || inputManager.isKeyPressed('Control') || inputManager.isKeyPressed('ctrl'));
  const hungerRate = survivalManager.getDifficultyConfig().hungerRate;
  const baseHungerDrainPerSec = (1 / 40); // 1 hunger point every ~40s idle on normal
  const moveMultiplier = isSprinting ? 2.0 : (isMoving ? 1.4 : 1.0);
  const hungerDrain = baseHungerDrainPerSec * moveMultiplier * hungerRate * deltaTime;

  player.hunger = Math.max(0, player.hunger - hungerDrain);

  // Starvation Damage when hunger <= 0
  if (player.hunger <= 0) {
    starveTimer += deltaTime;
    if (starveTimer >= 3.5) {
      starveTimer = 0;
      player.health = Math.max(0, player.health - 1);
      AudioManager.getInstance().playSFX('hit');
      hud.triggerDamageFlash();
      toastSystem.show('⚠️ Kamu kelaparan! Darah berkurang (-1 HP)', 'warning');
    }
  } else {
    starveTimer = 0;
  }

  // Natural HP Regeneration when well-fed (hunger >= 18)
  if (player.hunger >= 18 && player.health < 20 && player.health > 0) {
    regenTimer += deltaTime;
    if (regenTimer >= 4.0) {
      regenTimer = 0;
      player.health = Math.min(20, player.health + 1);
      player.hunger = Math.max(0, player.hunger - 0.4);
    }
  } else {
    regenTimer = 0;
  }

  if (player.health <= 0 || player.position.y < -20) {
    restartPlayer();
  }

  if (player.health < lastPlayerHealth) {
    hud.triggerDamageFlash();
  }
  lastPlayerHealth = player.health;
  hud.updateArmor(equipmentSlots.getTotalDefense());
  hud.update(player.health, player.hunger);

  dayNight.update(deltaTime);
  AudioManager.getInstance().updateAmbience(dayNight.timeOfDay, deltaTime);

  // Dynamic Cave Ambient Lighting (CP169-CP171)
  const inCave = isCaveArea(world, player.position.x, player.position.y + player.eyeHeight, player.position.z);
  const targetFactor = inCave ? 0.35 : 1.0;
  currentCaveLightFactor += (targetFactor - currentCaveLightFactor) * Math.min(1.0, deltaTime * 4.0);

  if (!DimensionManager.getInstance().isNether()) {
    const baseLight = dayNight.lightIntensity;
    lights.ambient.intensity = Math.max(0.08, 0.45 * baseLight * currentCaveLightFactor);
    lights.directional.intensity = Math.max(0.05, 1.15 * baseLight * currentCaveLightFactor);
    lights.hemi.intensity = Math.max(0.08, 0.45 * baseLight * currentCaveLightFactor);
  }
  playerCamera.update();
  playerController.update(deltaTime, camera);
  playerCollision.checkAndResolve(deltaTime);
  networkManager.sendPosition(player.position.x, player.position.y, player.position.z, deltaTime);

  const isWalking = inputManager.isKeyPressed('w') || inputManager.isKeyPressed('a') || inputManager.isKeyPressed('s') || inputManager.isKeyPressed('d');
  handModel.update(deltaTime, isWalking, inputManager.isLeftMouseDown);
  particleSystem.update(deltaTime);
  cropManager.update(deltaTime, world);
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
  VillagerTradingManager.getInstance().update(deltaTime);
  BreedingManager.getInstance().setParticleSystem(particleSystem);
  BreedingManager.getInstance().update(deltaTime, mobManager.mobs, mobManager);

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
    armorPoints: equipmentSlots.getTotalDefense(),
    projectilesCount: ProjectileManager.getInstance().arrows.length + ProjectileManager.getInstance().fireballs.length,
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

  // Dynamic Hostile Mob Cap & Spawn Rate Scaling based on Day & Difficulty
  const currentDay = survivalManager.currentDay;
  const diffConfig = survivalManager.getDifficultyConfig();
  const diffFactor = diffConfig.mobDifficultyFactor; // 0.7 (santai), 1.0 (normal), 1.4 (susah)

  // 1. Dynamic Hostile Mob Cap (scaling from 5 -> 18 on desktop, 3 -> 10 on mobile)
  const baseHostileCap = gameSettings.isMobilePreset ? 3 : 5;
  const maxHostileCap = gameSettings.isMobilePreset ? 10 : 18;
  const dayGrowth = gameSettings.isMobilePreset ? 0.5 : 0.9;
  mobManager.mobCapHostile = Math.min(maxHostileCap, Math.floor(baseHostileCap + (currentDay - 1) * dayGrowth * diffFactor));

  // 2. Dynamic Hostile Spawn Rate (Day 1: ~0.014, Day 6-10: ~0.025, Day 11-15: ~0.040)
  const baseSpawnChance = 0.014;
  const daySpawnFactor = (currentDay - 1) * 0.002 * diffFactor;
  const hostileSpawnChance = Math.min(0.045, baseSpawnChance + daySpawnFactor);

  // Spawn hostile mobs at night on solid land (Overworld only)
  if (!DimensionManager.getInstance().isNether() && dayNight.isNight && mobManager.canSpawnHostile() && Math.random() < hostileSpawnChance) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 20, 50);
    if (spawnPos) {
      // Scaled Mob Health with day (+0.8 HP per day * diffFactor)
      const extraHp = Math.floor((currentDay - 1) * 0.8 * diffFactor);
      const rand = Math.random();
      let mobToSpawn: Mob;
      if (rand < 0.35) {
        mobToSpawn = new Zombie(spawnPos);
      } else if (rand < 0.65) {
        mobToSpawn = new Skeleton(spawnPos);
      } else if (rand < 0.85) {
        mobToSpawn = new Spider(spawnPos);
      } else {
        mobToSpawn = new Enderman(spawnPos);
      }
      mobToSpawn.health += extraHp;
      mobManager.spawn(spawnPos, mobToSpawn);
    }
  }

  // Nether mob spawning: Skeletons, Spiders & Endermen (always dangerous, higher rate)
  if (DimensionManager.getInstance().isNether() && mobManager.canSpawnHostile() && Math.random() < 0.02) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 20, 50);
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
    if (mobManager.canSpawnHostile() && Math.random() < 0.008) {
      const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 20, 50);
      if (spawnPos) {
        const rand = Math.random();
        if (rand < 0.45) mobManager.spawn(spawnPos, new Blaze(spawnPos));
        else if (rand < 0.80) mobManager.spawn(spawnPos, new Ghast(spawnPos));
        else mobManager.spawn(spawnPos, new Skeleton(spawnPos));
      }
    }
  }

  // Spawn passive animals during daytime in appropriate biomes (Overworld only)
  if (!DimensionManager.getInstance().isNether() && !dayNight.isNight && mobManager.canSpawnPassive() && Math.random() < 0.016) {
    const spawnPos = getLandSpawnPos(player.position.x, player.position.z, 20, 60);
    if (spawnPos) {
      const topBlock = world.getBlock(Math.floor(spawnPos.x), Math.floor(spawnPos.y - 1), Math.floor(spawnPos.z));
      if (topBlock === 1 || topBlock === 2) { // Grass (1) or Dirt (2) -> Plains / Forest
        const rand = Math.random();
        if (rand < 0.28) {
          mobManager.spawn(spawnPos, new Pig(spawnPos));
        } else if (rand < 0.55) {
          mobManager.spawn(spawnPos, new Chicken(spawnPos));
        } else if (rand < 0.80) {
          mobManager.spawn(spawnPos, new Cow(spawnPos));
        } else if (rand < 0.94) {
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

  mobManager.update(deltaTime, new THREE.Vector3(player.position.x, player.position.y, player.position.z), player, camera, dayNight.isNight, equipmentSlots);
  
  if (DimensionManager.getInstance().isNether()) {
    const pCX = Math.floor(player.position.x / CHUNK_SIZE_X);
    const pCZ = Math.floor(player.position.z / CHUNK_SIZE_Z);
    const fg = NetherFortressGenerator.getInstance();
    if (fg.shouldGenerateInChunk(pCX, pCZ)) {
      fg.generateFortressAtChunk(world, pCX, pCZ);
    }
  }
  
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

  // Spike Trap Damage mechanic: Deals periodic damage (2 damage/sec) to hostile mobs stepping on spike_trap (ID 28)
  for (let i = mobManager.mobs.length - 1; i >= 0; i--) {
    const mob = mobManager.mobs[i];
    if (mob.isHostile) {
      const mx = Math.floor(mob.position.x);
      const myAtFeet = Math.floor(mob.position.y);
      const myBelow = Math.floor(mob.position.y - 0.2);
      const mz = Math.floor(mob.position.z);

      const blockAtFeet = world.getBlock(mx, myAtFeet, mz);
      const blockBelow = world.getBlock(mx, myBelow, mz);

      if (blockAtFeet === 28 || blockBelow === 28) {
        const isDead = mob.takeDamage(deltaTime * 2.0);
        if (Math.random() < 0.15) {
          particleSystem.spawnBlockBreakParticles(new THREE.Vector3(mob.position.x, mob.position.y + 0.2, mob.position.z), 0x546e7a);
          AudioManager.getInstance().playSFX('hit');
        }
        if (isDead) {
          const dropPos = mob.position.clone();
          dropPos.y += 0.5;
          particleSystem.spawnDeathParticles(dropPos);
          AudioManager.getInstance().playSFX('break');
          statsTracker.recordMonsterKill(1);
          mobManager.despawn(mob);
        }
      }
    }
  }

  ProjectileManager.getInstance().update(deltaTime, world, player, mobManager, equipmentSlots);

  blockBreaker.updateOutline(camera);
  blockBreaker.updateBreak(deltaTime, inputManager.isLeftMouseDown, camera, hotbar.getActiveItem());

  let crosshairState: 'none' | 'block' | 'mob' = 'none';

  const isClicking = inputManager.isLeftMouseDown || inputManager.isRightMouseDown;
  const now = performance.now();

  let hitMobIdx = cachedHitMobIdx;

  if (isClicking || now - lastMobRaycastTime >= 50) {
    lastMobRaycastTime = now;
    hitMobIdx = -1;

    crosshairRay.setFromCamera(new THREE.Vector2(0, 0), camera);

    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;
    const maxDistSq = 6.5 * 6.5; // Distance pre-filter (6.5 meters)

    const candidateMeshes: THREE.Object3D[] = [];

    for (let i = 0; i < mobManager.mobs.length; i++) {
      const mob = mobManager.mobs[i];
      const mobH = (mob as any).height || 1.8;
      const mobCenterY = mob.position.y + mobH * 0.5;

      const dx = mob.position.x - px;
      const dy = mobCenterY - (py + 1.62);
      const dz = mob.position.z - pz;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq <= maxDistSq) {
        // Fast ray-to-mob center vector projection using true vertical center
        const rayToMobX = mob.position.x - crosshairRay.ray.origin.x;
        const rayToMobY = mobCenterY - crosshairRay.ray.origin.y;
        const rayToMobZ = mob.position.z - crosshairRay.ray.origin.z;
        const rDir = crosshairRay.ray.direction;
        const proj = rayToMobX * rDir.x + rayToMobY * rDir.y + rayToMobZ * rDir.z;

        const maxRayExt = crosshairRay.far + Math.max(1.8, mobH * 0.6);
        if (proj > 0 && proj <= maxRayExt) {
          const closeX = crosshairRay.ray.origin.x + rDir.x * proj;
          const closeY = crosshairRay.ray.origin.y + rDir.y * proj;
          const closeZ = crosshairRay.ray.origin.z + rDir.z * proj;
          const perpX = closeX - mob.position.x;
          const perpY = closeY - mobCenterY;
          const perpZ = closeZ - mob.position.z;
          const perpDistSq = perpX * perpX + perpY * perpY + perpZ * perpZ;

          const boundRadius = Math.max(1.6, mobH * 0.65);
          if (perpDistSq <= boundRadius * boundRadius) {
            candidateMeshes.push(mob.mesh);
          }
        }
      }
    }

    if (candidateMeshes.length > 0) {
      const mobHits = crosshairRay.intersectObjects(candidateMeshes, true);
      if (mobHits.length > 0) {
        hitMobIdx = findMobIndexFromHitObject(mobHits[0].object);
      }
    }

    cachedHitMobIdx = hitMobIdx;
  }

  if (hitMobIdx >= 0) {
    crosshairState = 'mob';
  }
  if (crosshairState === 'none' && blockBreaker.getTarget(camera)) {
    crosshairState = 'block';
  }
  hud.setCrosshairState(crosshairState);
  playerController.onWaterSplash = (pos) => {
    particleSystem.spawnWaterSplashParticles(pos);
    AudioManager.getInstance().playSFX('footstep_water');
  };

  const isAnyUIOpen = tradingScreen.isOpen || inventoryScreen.isOpen || furnaceScreen.isOpen || chestScreen.isOpen || pauseMenu.isOpen;

  // Left click mob attack hit (only when no UI is open)
  if (!isAnyUIOpen && inputManager.isLeftMouseDown && !wasLeftDown && hitMobIdx >= 0) {
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
      statsTracker.recordMonsterKill(1);
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
      } else if (deadMob instanceof Blaze) {
        itemDropManager.spawnDrop(dropPos, 'blaze_rod', Math.floor(Math.random() * 2) + 1);
      } else if (deadMob instanceof Ghast) {
        itemDropManager.spawnDrop(dropPos, 'ghast_tear', 1);
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

  // Continuous right click handling for block placement & interaction (only when no UI is open)
  if (!isAnyUIOpen && inputManager.isRightMouseDown && !wasRightDown) {
    if (hitMobIdx >= 0) {
      const targetMob = mobManager.mobs[hitMobIdx];
      if (targetMob instanceof Villager) {
        tradingScreen.open(targetMob);
        wasRightDown = inputManager.isRightMouseDown;
        return;
      }
      const activeItem = hotbar.getActiveItem();
      if (activeItem.itemId && isFoodForMob(targetMob, activeItem.itemId)) {
        if (targetMob.canBreed()) {
          targetMob.loveTimer = 15;
          hotbar.removeItem(activeItem.itemId, 1);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('eat');
          particleSystem.spawnHeartParticles(targetMob.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
          ToastSystem.getInstance().show(`❤️ ${targetMob.constructor.name} memasuki Love Mode!`, 'success');
          wasRightDown = inputManager.isRightMouseDown;
          return;
        } else if (targetMob.isBabyMob()) {
          targetMob.growthTimer += 15;
          hotbar.removeItem(activeItem.itemId, 1);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('eat');
          particleSystem.spawnHeartParticles(targetMob.position.clone().add(new THREE.Vector3(0, 0.8, 0)));
          ToastSystem.getInstance().show(`🌾 Memberi makan ${targetMob.constructor.name} kecil!`, 'info');
          wasRightDown = inputManager.isRightMouseDown;
          return;
        } else if (targetMob.isInLove()) {
          ToastSystem.getInstance().show(`${targetMob.constructor.name} sudah dalam Love Mode!`, 'info');
        } else if (targetMob.breedingCooldown > 0) {
          ToastSystem.getInstance().show(`⏳ ${targetMob.constructor.name} sedang cooldown breeding!`, 'warning');
        }
      }
    }

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
      } else if (hitBlockId === 23) { // Furnace block (ID 23)
        furnaceScreen.open(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        wasRightDown = inputManager.isRightMouseDown;
        return;
      } else if (hitBlockId === 14) { // Mature Wheat Crop (ID 14) Quick Harvest
        cropManager.unregisterCrop(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        itemDropManager.spawnDrop(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 'wheat', 1);
        itemDropManager.spawnDrop(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 'wheat_seeds', Math.floor(Math.random() * 2) + 1);
        particleSystem.spawnBlockBreakParticles(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 0xfbc02d);
        AudioManager.getInstance().playSFX('break');
        handModel.triggerSwing();
        statsTracker.recordBlockBroken(1);
        toastSystem.show('🌾 Panen Gandum Matang! (+1 Wheat, +Seeds)', 'success');

        // If player is holding wheat seeds, auto replant to sprout stage!
        if (activeItem.itemId === 'wheat_seeds') {
          world.setBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 25);
          networkManager.sendBlockChange(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 25);
          cropManager.registerCrop(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 0);
          hotbar.removeItem('wheat_seeds', 1);
          toastSystem.show('🌱 Ditanam Kembali Otomatis!', 'info');
        } else {
          world.setBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 0);
          networkManager.sendBlockChange(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 0);
        }

        wasRightDown = inputManager.isRightMouseDown;
        return;
      } else if (hitBlockId === 25 || hitBlockId === 26) {
        // Immature wheat crop interaction
        if (activeItem.itemId === 'wheat_seeds' || activeItem.itemId === 'bone') {
          // Fertilize & accelerate crop growth!
          const accelerated = cropManager.accelerateGrowth(targetHit.blockX, targetHit.blockY, targetHit.blockZ, world);
          if (accelerated) {
            hotbar.removeItem(activeItem.itemId, 1);
            handModel.triggerSwing();
            particleSystem.spawnBlockBreakParticles(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 0x88bb33);
            AudioManager.getInstance().playSFX('pop');
            toastSystem.show('✨ Pupuk Benih Gandum! Pertumbuhan Dipercepat 🌱', 'success');
            wasRightDown = inputManager.isRightMouseDown;
            return;
          }
        } else {
          // Quick harvest immature crop
          cropManager.unregisterCrop(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
          world.setBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 0);
          networkManager.sendBlockChange(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 0);
          itemDropManager.spawnDrop(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 'wheat_seeds', 1);
          particleSystem.spawnBlockBreakParticles(new THREE.Vector3(targetHit.blockX + 0.5, targetHit.blockY + 0.5, targetHit.blockZ + 0.5), 0x88bb33);
          AudioManager.getInstance().playSFX('break');
          handModel.triggerSwing();
          toastSystem.show('🌱 Tanaman Gandum Belum Matang! (Hanya dapat 1 benih)', 'info');
          wasRightDown = inputManager.isRightMouseDown;
          return;
        }
      }
    }

    if (activeItem.itemId && activeItem.count > 0) {
      const FOOD_DATA: Record<string, { hunger: number; name: string }> = {
        cooked_beef: { hunger: 11, name: 'Cooked Beef' },
        cooked_porkchop: { hunger: 11, name: 'Cooked Porkchop' },
        cooked_chicken: { hunger: 10, name: 'Cooked Chicken' },
        cooked_mutton: { hunger: 10, name: 'Cooked Mutton' },
        bread: { hunger: 7, name: 'Bread' },
        raw_beef: { hunger: 4, name: 'Raw Beef' },
        raw_porkchop: { hunger: 4, name: 'Raw Porkchop' },
        raw_chicken: { hunger: 3, name: 'Raw Chicken' },
        raw_mutton: { hunger: 3, name: 'Raw Mutton' },
        wheat: { hunger: 2, name: 'Wheat' },
        rotten_flesh: { hunger: 3, name: 'Rotten Flesh' },
      };

      if (activeItem.itemId === 'bandage') {
        if (player.health >= 20) {
          toastSystem.show('Kesehatan sudah maksimal! (20/20 HP)', 'info');
        } else if (bandageCooldownTimer > 0) {
          toastSystem.show(`Tunggu ${Math.ceil(bandageCooldownTimer)}d untuk memakai perban lagi!`, 'warning');
        } else {
          player.health = Math.min(20, player.health + 6);
          hotbar.removeItem('bandage', 1);
          bandageCooldownTimer = 5.0;
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('eat');
          hud.update(player.health, player.hunger);
          toastSystem.show('🩹 Memakai Perban! (+6 HP Instan)', 'success');
        }
      } else if (FOOD_DATA[activeItem.itemId]) {
        const food = FOOD_DATA[activeItem.itemId];
        if (player.hunger < 20) {
          player.feed(food.hunger);
          hotbar.removeItem(activeItem.itemId, 1);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('eat');
          hud.update(player.health, player.hunger);
          statsTracker.recordFoodEaten(1);
          toastSystem.show(`Memakan ${food.name} (+${food.hunger} Lapar)`, 'success');
        } else {
          toastSystem.show('Kenyang! Hunger sudah penuh (20/20)', 'info');
        }
      } else if (activeItem.itemId.includes('hoe') && targetHit) {
        // Till Grass (1) or Dirt (2) into Farmland (13)!
        const hitBlockId = world.getBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ);
        if (hitBlockId === 1 || hitBlockId === 2) {
          world.setBlock(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 13);
          networkManager.sendBlockChange(targetHit.blockX, targetHit.blockY, targetHit.blockZ, 13);
          handModel.triggerSwing();
          AudioManager.getInstance().playSFX('footstep');
          statsTracker.recordBlockPlaced(1);
          if (activeItem.durability !== undefined) {
            activeItem.durability--;
            if (activeItem.durability <= 0) {
              hotbar.removeItem(activeItem.itemId, 1);
              AudioManager.getInstance().playSFX('break');
            }
          }
        }
      } else if (activeItem.itemId === 'wheat_seeds' && targetHit) {
        // Plant Wheat Seeds (Stage 0: 25) on top of Farmland (13), Grass (1), or Dirt (2)!
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
            world.setBlock(targetHit.blockX, plantY, targetHit.blockZ, 25); // Plant wheat sprout (Stage 0)
            networkManager.sendBlockChange(targetHit.blockX, plantY, targetHit.blockZ, 25);
            cropManager.registerCrop(targetHit.blockX, plantY, targetHit.blockZ, 0);
            hotbar.removeItem('wheat_seeds', 1);
            handModel.triggerSwing();
            AudioManager.getInstance().playSFX('place');
            statsTracker.recordBlockPlaced(1);
            toastSystem.show('🌱 Menanam Benih Gandum! (Tahap 1/3: Tunas Muda)', 'success');
          }
        }
      } else {
        const blockIdToPlace = itemIdToBlockId(activeItem.itemId);
        if (blockIdToPlace) {
          const placed = blockPlacer.place(camera, blockIdToPlace, player.position.x, player.position.y, player.position.z);
          if (placed) {
            statsTracker.recordBlockPlaced(1);
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
        } else if (activeItem.itemId === 'stick') {
          const itemDef = getItemById(activeItem.itemId);
          const craftHint = InputManager.isTouchDevice() ? 'Buka Inventory untuk craft.' : 'Tekan [E] untuk craft.';
          toastSystem.show(`${itemDef?.name || activeItem.itemId} digunakan untuk resep crafting! ${craftHint}`, 'info');
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
    chunkManager.processLoadQueue(1);
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

      // Unload previous dimension chunks & pre-load target location chunks
      chunkManager.unloadAllChunks();
      const { chunkX: tCX, chunkZ: tCZ } = worldToChunkCoord(targetPos.x, 0, targetPos.z);
      for (let dcx = -1; dcx <= 1; dcx++) {
        for (let dcz = -1; dcz <= 1; dcz++) {
          const c = chunkManager.loadChunk(tCX + dcx, tCZ + dcz);
          if (chunkManager.terrainFiller) {
            chunkManager.terrainFiller(c);
          }
        }
      }

      // Calculate safe Y standing height at target location in destination dimension
      const safeY = DimensionManager.getInstance().findSafeTeleportY(
        world,
        targetPos.x,
        targetPos.y,
        targetPos.z,
        nextDimension,
        heightMap
      );
      targetPos.y = safeY;

      player.position.x = targetPos.x;
      player.position.y = targetPos.y;
      player.position.z = targetPos.z;
      camera.position.set(targetPos.x, targetPos.y + player.eyeHeight, targetPos.z);

      // Auto-generate destination portal frame in target dimension at safeY
      const basePX = Math.floor(targetPos.x);
      const basePY = Math.floor(safeY);
      const basePZ = Math.floor(targetPos.z);

      for (let dy = 0; dy < 5; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const isBorder = (dx === 0 || dx === 3 || dy === 0 || dy === 4);
          const bId = isBorder ? 15 : 18;
          world.setBlock(basePX + dx - 1, basePY - 1 + dy, basePZ, bId);
        }
      }

      // Clear air standing room in front and behind portal (dz = -1 and dz = 1)
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const px = basePX + dx;
          const py = basePY + dy;
          if (world.getBlock(px, py, basePZ - 1) !== 15 && world.getBlock(px, py, basePZ - 1) !== 18) {
            world.setBlock(px, py, basePZ - 1, 0);
          }
          if (world.getBlock(px, py, basePZ + 1) !== 15 && world.getBlock(px, py, basePZ + 1) !== 18) {
            world.setBlock(px, py, basePZ + 1, 0);
          }
        }
      }

      chunkManager.update(targetPos.x, targetPos.z, gameSettings.renderDistance);

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
  hud.update(player.health, player.hunger);
  hud.setTime(dayNight.timeOfDay, survivalManager.currentDay);
});

engine.start();
saveManager.startAutoSave();
console.log('Engine started');

// Debug
if (import.meta.env.DEV) {
  const win = window as unknown as Record<string, unknown>;
  win.world = world; win.chunkManager = chunkManager; win.camera = camera;
  win.player = player; win.hotbar = hotbar; win.inventory = inventory;
  win.saveManager = saveManager; win.touchControls = touchControls;
  win.dayNight = dayNight; win.survival = survivalManager; win.stats = statsTracker; win.endGameScreen = endGameScreen;

  win.clearSave = async () => {
    await resetEntireGameState(true);
    console.log('[Save] Clearing world save data and resetting game state...');
    window.location.reload();
  };
  win.tp = (x: number, y: number, z: number) => {
    player.position.x = x; player.position.y = y; player.position.z = z;
    camera.position.set(x, y + player.eyeHeight, z);
    chunkManager.update(x, z, gameSettings.renderDistance);
  };
  win.setSeed = (seedStr: string) => {
    worldSeed = seedFromString(seedStr); worldSeedString = seedStr;
    const gens = createGenerators(worldSeed);
    heightMap = gens.heightMap; biomeGen = gens.biomeGen; caveNoise = gens.caveNoise; lakeNoise = gens.lakeNoise;
    villageGen.clear();
    chunkManager.unloadAllChunks();
    chunkManager.update(player.position.x, player.position.z, gameSettings.renderDistance);
    console.log(`[Seed] Regenerated: "${seedStr}"`);
  };
  win.save = () => saveManager.save();
  win.load = () => saveManager.load();

  // Survival Mode Debug Helpers
  win.setHunger = (hunger: number) => {
    player.hunger = Math.max(0, Math.min(20, hunger));
    hud.update(player.health, player.hunger);
    console.log(`[Debug] Hunger pemain diatur ke: ${player.hunger}/20`);
  };
  win.setHealth = (hp: number) => {
    player.health = Math.max(0, Math.min(20, hp));
    hud.update(player.health, player.hunger);
    console.log(`[Debug] HP pemain diatur ke: ${player.health}/20`);
  };
  win.setDay = (day: number) => {
    survivalManager.setDay(day);
    console.log(`[Debug] Hari diubah menjadi: Hari ${day}`);
  };
  win.advanceDay = () => {
    survivalManager.advanceDay();
  };
  win.skipToNight = () => {
    triggerSkipToNight();
  };
  win.setDifficulty = (diff: 'santai' | 'normal' | 'susah') => {
    survivalManager.setDifficulty(diff);
  };
  win.setSpeed = (multiplier: number) => {
    dayNight.timeMultiplier = multiplier;
    console.log(`[Debug] Kecepatan siklus waktu diatur ke ${multiplier}x`);
  };
  win.killPlayer = () => {
    player.health = 0;
    console.log('[Debug] Player health set to 0 (trigger death)');
  };
  win.showEndGame = (type: 'win' | 'lose') => {
    endGameScreen.show(type);
    updateTouchControlsState();
  };
  win.giveBandage = (count = 5) => {
    hotbar.addItem('bandage', count);
    console.log(`[Debug] Added ${count}x Bandage to hotbar`);
  };
  win.spawnMob = (type = 'enderman') => {
    const pos = new THREE.Vector3(player.position.x + 3, player.position.y, player.position.z + 3);
    const t = type.toLowerCase();
    if (t === 'enderman') mobManager.addMob(new Enderman(pos));
    else if (t === 'zombie') mobManager.addMob(new Zombie(pos));
    else if (t === 'skeleton') mobManager.addMob(new Skeleton(pos));
    else if (t === 'spider') mobManager.addMob(new Spider(pos));
    else if (t === 'cow') mobManager.addMob(new Cow(pos));
    else if (t === 'golem') mobManager.addMob(new IronGolem(pos));
    else if (t === 'villager') mobManager.addMob(new Villager(pos));
    console.log(`[Debug] Spawned ${type} at (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`);
  };

  console.log('[Debug] Helper commands: clearSave(), setSeed(str), tp(x,y,z), spawnMob("enderman"), save(), load(), setHunger(n), setHealth(n), giveBandage(n), setDay(n), advanceDay(), setDifficulty("santai"|"normal"|"susah"), setSpeed(n), killPlayer(), showEndGame("win"|"lose")');
}
