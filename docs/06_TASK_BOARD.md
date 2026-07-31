# TASK BOARD — Mini Minecraft
## Final Progress

| Fase | CP Range | Selesai | % |
|---|---|---|---|
| Fase 0 — Setup & Tooling | 1–10 | 10 | 100% |
| Fase 1 — Rendering & Kamera | 11–20 | 10 | 100% |
| Fase 2 — Voxel & Chunk | 21–35 | 15 | 100% |
| Fase 3 — World Generation | 36–45 | 10 | 100% |
| Fase 4 — Interaksi Blok | 46–55 | 10 | 100% |
| Fase 5 — Player Physics | 56–65 | 10 | 100% |
| Fase 6 — Inventory & Hotbar | 66–75 | 10 | 100% |
| Fase 7 — Crafting | 76–82 | 7 | 100% |
| Fase 8 — Day/Night | 83–88 | 6 | 100% |
| Fase 9 — Mobs & AI | 89–96 | 8 | 100% |
| Fase 10 — Save/Load | 97–102 | 6 | 100% |
| Fase 11 — UI/UX Polish | 103–108 | 6 | 100% |
| Fase 12 — Optimasi | 109–115 | 7 | 100% |
| Fase 13 — Audio | 116–120 | 5 | 100% |
| Fase 14 — Multiplayer | 121–125 | 5 | 100% |
| Fase 15 — Polish & Release | 126–130 | 5 | 100% |
| Fase 16 — Feature Expansion | 131–144 | 14 | 100% |
| Fase 17 — Master Polish | 145–155 | 11 | 100% |
| **TOTAL** | | **155** | **100%** |

Build: ✅ `npm run build` passes (646KB bundle, 456ms)

---

## CHECKLIST DETAIL PER FASE

### Fase 0 — Setup & Tooling (10/10)
- [x] CP-1: Inisialisasi project Vite + TypeScript
- [x] CP-2: Install & konfigurasi Three.js + simplex-noise
- [x] CP-3: Setup struktur folder sesuai dokumen arsitektur
- [x] CP-4: Konfigurasi tsconfig.json & strict mode
- [x] CP-5: Buat constants.ts
- [x] CP-6: Buat Engine.ts — game loop dasar
- [x] CP-7: Buat Renderer.ts — scene, camera, WebGLRenderer dasar
- [x] CP-8: Setup InputManager.ts — keyboard state tracking
- [x] CP-9: Setup pointer lock untuk mouse look
- [x] CP-10: Setup ESLint/Prettier

### Fase 1 — Rendering & Kamera (10/10)
- [x] CP-11: Render 1 kubus tunggal (test mesh)
- [x] CP-12: Buat Camera.ts — first-person camera dari mouse movement
- [x] CP-13: Implementasi FOV & aspect ratio responsif (resize window)
- [x] CP-14: Tambahkan ambient + directional light dasar
- [x] CP-15: Buat material dasar per warna
- [x] CP-16: Load tekstur blok pertama dari public/textures
- [x] CP-17: Setup texture atlas / UV mapping per face blok
- [x] CP-18: Buat Clock.ts — delta time presisi & FPS counter overlay
- [x] CP-19: Setup skybox dasar (warna gradient sederhana)
- [x] CP-20: Review performa render 1000 kubus statis

### Fase 2 — Voxel & Chunk (15/15)
- [x] CP-21: Buat BlockRegistry.ts — daftar tipe blok & properti
- [x] CP-22: Buat Chunk.ts — struktur data 3D array blok per chunk
- [x] CP-23: Buat ChunkMesher.ts — generate mesh naive
- [x] CP-24: Implementasi face culling (skip face yang tertutup blok solid)
- [x] CP-25: Implementasi greedy meshing
- [x] CP-26: Buat ChunkManager.ts — kelola koleksi chunk aktif
- [x] CP-27: Implementasi world-to-chunk coordinate conversion
- [x] CP-28: Load/unload chunk berdasar jarak dari player
- [x] CP-29: Implementasi render distance configurable
- [x] CP-30: Optimasi: pindahkan mesh generation ke Web Worker
- [x] CP-31: Buat World.ts — API get/set block by world coordinate
- [x] CP-32: Test edit manual blok lewat console/debug command
- [x] CP-33: Implementasi chunk border stitching
- [x] CP-34: Buat sistem chunk dirty-flag
- [x] CP-35: Stress test 8x8 chunk area, ukur FPS

### Fase 3 — World Generation (10/10)
- [x] CP-36: Buat NoiseGenerator.ts — wrapper simplex-noise dengan seed
- [x] CP-37: Buat HeightMap.ts — generate height per kolom (x,z)
- [x] CP-38: Terapkan height map to chunk generation
- [x] CP-39: Implementasi layering blok
- [x] CP-40: Buat BiomeGenerator.ts — tentukan biome per kolom
- [x] CP-41: Terapkan variasi blok per biome
- [x] CP-42: Implementasi generasi pohon sederhana
- [x] CP-43: Implementasi water level
- [x] CP-44: Implementasi cave generation dasar
- [x] CP-45: Implementasi seed system

### Fase 4 — Interaksi Blok (9/10)
- [x] CP-46: Buat Raycaster.ts — deteksi blok yang dilihat player
- [x] CP-47: Implementasi jarak maksimum interaksi (~5 unit)
- [x] CP-48: Buat BlockBreaker.ts — hapus blok saat klik kiri
- [x] CP-49: Tambahkan progress bar / animasi breaking (hold-to-break)
- [x] CP-50: Trigger re-mesh chunk otomatis setelah blok berubah
- [x] CP-51: Buat BlockPlacer.ts — tempatkan blok saat klik kanan
- [x] CP-52: Validasi placement: tidak boleh timpa posisi player
- [x] CP-53: Snapping placement ke grid & sisi blok yang benar
- [x] CP-54: Hubungkan break block → drop item ke inventory
- [x] CP-55: Sound/visual feedback break & place (particles/scale animation)

### Fase 5 — Player Physics (10/10)
- [x] CP-56: Buat PlayerController.ts — movement WASD dasar (tanpa collision)
- [x] CP-57: Implementasi gravity sederhana
- [x] CP-58: Buat PlayerCollision.ts — AABB player vs voxel grid
- [x] CP-59: Implementasi ground detection
- [x] CP-60: Implementasi jump (Space) dengan physics sederhana
- [x] CP-61: Implementasi collision dinding (slide along walls)
- [x] CP-62: Implementasi step-up otomatis (naik blok setinggi 1 tanpa lompat)
- [x] CP-63: Implementasi sneak/shift
- [x] CP-64: Implementasi swimming state sederhana saat masuk water
- [x] CP-65: Playtest movement 10 menit, catat bug collision

### Fase 6 — Inventory & Hotbar (10/10)
- [x] CP-66: Buat ItemRegistry.ts — daftar item & metadata
- [x] CP-67: Buat Inventory.ts — struktur data slot (27 slot)
- [x] CP-68: Implementasi stacking logic
- [x] CP-69: Buat Hotbar.ts — 9 slot terpisah dari inventory utama
- [x] CP-70: Implementasi switch hotbar via angka 1-9
- [x] CP-71: Implementasi switch hotbar via scroll mouse
- [x] CP-72: Buat HUD.ts — render hotbar visual di layar
- [x] CP-73: Buat InventoryScreen.ts — UI grid 27 slot, toggle dengan E
- [x] CP-74: Implementasi drag-drop antar slot inventory
- [x] CP-75: Sinkronisasi: block drop → otomatis masuk slot inventory yang tepat

### Fase 7 — Crafting (7/7)
- [x] CP-76: Buat Recipes.ts — daftar resep
- [x] CP-77: Buat CraftingSystem.ts — cek pola grid 2x2
- [x] CP-78: Implementasi crafting table sebagai blok interaktif
- [x] CP-79: Buat UI crafting grid 3x3 + slot output
- [x] CP-80: Implementasi validasi pola resep (shaped recipe)
- [x] CP-81: Implementasi consume item saat craft berhasil
- [x] CP-82: Playtest full crafting chain

### Fase 8 — Day/Night (6/6)
- [x] CP-83: Buat DayNightCycle.ts — timer siklus waktu
- [x] CP-84: Update posisi & intensitas directional light sesuai waktu
- [x] CP-85: Update warna skybox sesuai waktu (siang/senja/malam)
- [x] CP-86: Implementasi ambient light minimum saat malam
- [x] CP-87: Tambahkan indikator waktu di HUD
- [x] CP-88: Hubungkan waktu malam ke trigger spawn mob (isNight)

### Fase 9 — Mobs & AI (8/8)
- [x] CP-89: Buat Mob.ts — base class
- [x] CP-90: Buat MobManager.ts — spawn/despawn & update loop
- [x] CP-91: Buat StateMachine.ts — state idle/wander
- [x] CP-92: Implementasi Cow.ts (passive) — wander + terrain collision
- [x] CP-93: Implementasi attack pada passive mob → drop item
- [x] CP-94: Implementasi Zombie.ts (hostile) — state chase
- [x] CP-95: Implementasi attack state zombie → damage player saat kontak
- [x] CP-96: Hubungkan spawn zombie ke isNight

### Fase 10 — Save/Load (6/6)
- [x] CP-97: Buat StorageAdapter.ts — wrapper IndexedDB
- [x] CP-98: Buat SaveManager.ts — serialize world (hanya delta perubahan blok)
- [x] CP-99: Implementasi save posisi player & health
- [x] CP-100: Implementasi save inventory & hotbar
- [x] CP-101: Implementasi load: restore semua state saat game dibuka kembali
- [x] CP-102: Implementasi auto-save berkala (tiap 2 menit) + tombol save manual

### Fase 11 — UI/UX Polish (6/6)
- [x] CP-103: Buat PauseMenu.ts — Resume/Save/Load/Settings/Exit
- [x] CP-104: Buat SettingsMenu.ts — render distance, sensitivity, volume
- [x] CP-105: Tambahkan health bar visual (heart icons)
- [x] CP-106: Tambahkan crosshair dinamis
- [x] CP-107: Tambahkan tooltip nama item saat hover di inventory
- [x] CP-108: General visual pass (spacing, font, warna UI konsisten)

### Fase 12 — Optimasi (7/7)
- [x] CP-109: Profiling dengan Chrome DevTools Performance tab
- [x] CP-110: Optimasi chunk meshing lebih lanjut (instancing jika perlu)
- [x] CP-111: Implementasi object pooling untuk mob
- [x] CP-112: Implementasi frustum culling
- [x] CP-113: Optimasi texture atlas
- [x] CP-114: Lazy-load chunk generation
- [x] CP-115: Final stress test

### Fase 13 — Audio (5/5)
- [x] CP-116: Buat AudioManager.ts — load & play SFX dasar
- [x] CP-117: Hubungkan SFX break/place blok
- [x] CP-118: Tambahkan SFX footstep
- [x] CP-119: Tambahkan ambient sound
- [x] CP-120: Tambahkan background music loop + toggle volume di settings

### Fase 14 — Multiplayer (0/5)
- [x] CP-121: Setup server WebSocket sederhana (Node.js)
- [x] CP-122: Sinkronisasi posisi player antar client
- [x] CP-123: Sinkronisasi perubahan blok antar client
- [x] CP-124: Sinkronisasi inventory & mob
- [x] CP-125: Playtest multiplayer 2 client sederhana

### Fase 15 — Polish & Release (5/5)
- [x] CP-126: Bug bash menyeluruh
- [x] CP-127: Buat main menu (New Game/Load Game/Settings)
- [x] CP-128: Build production (vite build) & test performa build final
- [x] CP-129: Deploy ke hosting statis
- [x] CP-130: Tulis README & dokumentasi cara main untuk pemain

### Fase 16 — Feature Expansion (8/8)
- [x] CP-131: Structural Compound 3D Body Mesh & Leg Swing Anim for Cow
- [x] CP-132: Structural Compound 3D Body Mesh & Arm/Leg Anim for Zombie
- [x] CP-133: Physics Fall Damage System
- [x] CP-134: First-Person Hand Model & Tool Swing Animation
- [x] CP-135: Block Break Particle Burst Effect
- [x] CP-136: Floating 3D Item Drops & Magnet Pickup
- [x] CP-137: Tool Durability Bar & Mining Efficiency
- [x] CP-138: In-Game Multiplayer Chat Box ('T') & Name Tags
- [x] CP-139: Dynamic Held Torch Lighting & Water Texture Flow Animation
- [x] CP-140: 3D Camera Pitch Diving, Oxygen Bubbles Bar & Drowning Damage
- [x] CP-141: Storage Chest Block (27-slot Storage Modal & Item Persistence)
- [x] CP-142: Wooden/Stone Hoe Crafting & Farmland Tilling System
- [x] CP-143: Wheat Seeds Drops, Wheat Farming & Bread Food Eating
- [x] CP-144: Glassmorphic UI/UX Redesign & Custom SVG Vector Icons

### Fase 17 — Master Polish (12/12)
- [x] CP-145: Block Selection Outline Wireframe Box
- [x] CP-146: Time-based Dynamic Exponential Distance Fog
- [x] CP-147: Surface-based Footstep Audio System
- [x] CP-148: View Bobbing & Camera Impact Shake
- [x] CP-149: F3 Debug Overlay Screen
- [x] CP-150: Floating Toast Notification Banner System
- [x] CP-151: Mob Hit Visual Flash & Knockback Particles
- [x] CP-152: Submerged Water Fog & Ambient Particle Splash
- [x] CP-153: Authentic 16x16 Pixel Art Textures Pass
- [x] CP-154: 3D Volumetric Voxel Clouds & Celestial System
- [x] CP-155: Agriculture & Quiet Toast System Polish
- [x] CP-156: Authentic AABB Sweep Physics, Dynamic Sprint FOV & Mob Knockback Polish Pass

---

## BLOCKED / BUG
*(Tidak ada blokir atau bug kritis yang dilaporkan saat ini)*
