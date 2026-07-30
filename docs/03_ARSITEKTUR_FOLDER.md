# ARSITEKTUR FOLDER & STRUKTUR PROYEK
## Mini Minecraft — Stack: Vite + TypeScript + Three.js

---

## 1. STRUKTUR DIREKTORI

```
mini-minecraft/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
│
├── public/
│   ├── textures/
│   │   ├── blocks/            # tekstur per blok (grass.png, stone.png, dst — 16x16 px)
│   │   ├── mobs/               # tekstur mob
│   │   └── ui/                 # icon inventory, crosshair, hotbar frame
│   ├── audio/
│   │   ├── sfx/                # break.mp3, place.mp3, footstep.mp3
│   │   └── music/
│   └── fonts/
│
├── src/
│   ├── main.ts                 # entry point, init game loop
│   │
│   ├── core/
│   │   ├── Engine.ts            # game loop utama (requestAnimationFrame, delta time)
│   │   ├── Renderer.ts          # setup Three.js scene, camera, renderer
│   │   ├── InputManager.ts      # keyboard/mouse handling, pointer lock
│   │   └── Clock.ts             # delta time, FPS counter
│   │
│   ├── world/
│   │   ├── World.ts             # kelola koleksi chunk aktif
│   │   ├── Chunk.ts             # data blok per chunk + mesh generation
│   │   ├── ChunkMesher.ts       # face culling & greedy meshing
│   │   ├── ChunkManager.ts      # load/unload chunk berdasar posisi player
│   │   ├── terrain/
│   │   │   ├── NoiseGenerator.ts   # wrapper simplex noise
│   │   │   ├── HeightMap.ts        # generate height map per chunk
│   │   │   └── BiomeGenerator.ts   # tentukan biome per kolom
│   │   └── BlockRegistry.ts     # daftar semua tipe blok + properti
│   │
│   ├── player/
│   │   ├── Player.ts            # state player (posisi, health, dsb)
│   │   ├── PlayerController.ts  # movement, gravity, jump
│   │   ├── PlayerCollision.ts   # AABB collision vs voxel grid
│   │   ├── Raycaster.ts         # deteksi blok target untuk break/place
│   │   └── Camera.ts            # first-person camera control
│   │
│   ├── interaction/
│   │   ├── BlockBreaker.ts      # logic break blok + progress
│   │   └── BlockPlacer.ts       # logic place blok + validasi
│   │
│   ├── inventory/
│   │   ├── Inventory.ts         # data slot, stack logic
│   │   ├── Hotbar.ts            # slot aktif, switch via angka/scroll
│   │   └── ItemRegistry.ts      # daftar semua item + metadata
│   │
│   ├── crafting/
│   │   ├── CraftingSystem.ts    # cek resep vs grid input
│   │   └── Recipes.ts           # daftar resep crafting
│   │
│   ├── mobs/
│   │   ├── Mob.ts               # base class mob
│   │   ├── MobManager.ts        # spawn/despawn, update semua mob
│   │   ├── passive/Cow.ts
│   │   ├── hostile/Zombie.ts
│   │   └── ai/StateMachine.ts   # idle/wander/chase/attack
│   │
│   ├── environment/
│   │   ├── DayNightCycle.ts     # update waktu, lighting, skybox
│   │   └── Skybox.ts
│   │
│   ├── save/
│   │   ├── SaveManager.ts       # serialize/deserialize world state
│   │   └── StorageAdapter.ts    # wrapper IndexedDB/localStorage
│   │
│   ├── ui/
│   │   ├── HUD.ts               # health bar, hotbar visual, crosshair
│   │   ├── InventoryScreen.ts   # UI drag-drop inventory
│   │   ├── PauseMenu.ts
│   │   └── SettingsMenu.ts
│   │
│   ├── audio/
│   │   └── AudioManager.ts
│   │
│   └── utils/
│       ├── math.ts              # helper vector/grid math
│       ├── constants.ts         # CHUNK_SIZE, RENDER_DISTANCE, dst
│       └── types.ts             # shared TypeScript types/interfaces
│
├── docs/                        # semua dokumen dari paket ini (GDD, PRD, dst)
│   ├── 01_GDD.md
│   ├── 02_PRD.md
│   ├── 03_ARSITEKTUR_FOLDER.md
│   ├── 04_ROADMAP.md
│   ├── 05_PROMPT_DEEPSEEK.md
│   └── 06_TASK_BOARD.md
│
└── tests/                       # (opsional) unit test untuk logic non-visual
    ├── world/
    ├── inventory/
    └── crafting/
```

## 2. PRINSIP MODULARITAS (penting untuk vibe coding)

1. **Satu folder = satu domain sistem.** Saat prompt DeepSeek untuk fitur baru, kamu cukup sertakan file-file dari 1-2 folder relevan, bukan seluruh project — ini hemat token meski context window besar.
2. **Registry pattern** (`BlockRegistry.ts`, `ItemRegistry.ts`) dipakai supaya nambah blok/item baru tidak perlu ubah banyak file — cukup tambah entry.
3. **Manager vs Entity separation**: `*Manager.ts` mengatur koleksi/lifecycle, sedangkan entity class (`Chunk.ts`, `Mob.ts`, `Player.ts`) fokus ke state & behavior sendiri.
4. **core/** tidak boleh tahu detail `world/` atau `mobs/` — komunikasi lewat event/interface agar mudah di-refactor per modul lewat prompt terpisah.

## 3. KONVENSI PENAMAAN & COMMIT

- File: PascalCase untuk class (`ChunkManager.ts`), camelCase untuk util (`math.ts`).
- Commit message mengikuti checkpoint roadmap, contoh: `feat(world): CP-23 implement chunk mesh face culling`.
- Tiap checkpoint roadmap yang selesai = 1 commit (memudahkan rollback kalau prompt DeepSeek berikutnya bikin regresi).

## 4. SETUP AWAL (checkpoint 1-2 di roadmap)

```bash
npm create vite@latest mini-minecraft -- --template vanilla-ts
cd mini-minecraft
npm install three simplex-noise
npm install -D @types/three
```
