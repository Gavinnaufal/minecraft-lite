# ⛏️ Mini Minecraft 2.0 Expansion (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini dirancang dengan standar arsitektur performa tinggi (*Web Worker Mesh Generation*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Audio Synthesizer*, dan *WebSocket Multiplayer Sync*).

**v2.0 Expansion** menambahkan 10 sistem baru: Ocean, Cave Expansion, Village, Iron Golem, Skeleton, Spider, Enderman, Nether Portal & Dimension, Animal baru, dan Food/Cooking.

---

## 🚀 Fitur Utama

### 🌍 World & Environment
- 🏡 **Perkampungan Warga & Struktur Prefab (Villages & Prefabs)**: Generasi struktur otomatis desa di bioma datar (*Plains*), prefab rumah kayu & batu, ladang pertanian gandum, jalan setapak tanah, serta peti harta karun.
- 🌋 **Ekspansi Gua & Jurang Ravine**: Generasi jurang terjal dalam (*Ravines*), terowongan gua 3D noise dalam, kolam lahar panas (*Lava Pools*), dan kluster *Obsidian*.
- 🌊 **River & Water Polish**: Sungai dan danau dangkal, transisi pantai pasir, lereng tepian halus, air mengalir dinamis.
- 🔮 **Nether Portal & Dimension**: Portal Nether obsidian 4x5, countdown 3 detik teleportasi, dimensi Nether dengan terrain gua, lava ocean, fog merah, dan spawning mob unik.

### 🧑‍🌾 NPC & Mob
- **Villager NPC**: Warga desa 3D dengan AI berjalan di jalan setapak dan efek suara khas *"Hmm"*.
- **Iron Golem**: Pelindung desa raksasa (100 HP), patroli perbatasan, AI membantai mob musuh.
- 💀 **Skeleton**: Pemanah 3D dengan proyektil anak panah (*Ballistic Trajectory Arc*).
- 🕷️ **Spider**: Laba-laba berkaki 8 dengan fisika panjat tebing vertikal dan serangan melompat.
- 👁️ **Enderman**: Setinggi 2.9 blok, mata magenta glowing, partikel ungu, teleportasi acak, provokasi tatapan.
- 🐄 **Cow**: Hewan ternak dasar dengan drop Raw Beef.
- 🐷 **Pig**: Babi pink dengan animasi trot dan drop Raw Porkchop.
- 🐔 **Chicken**: Ayam dengan drop Raw Chicken & Feather.
- 🐐 **Goat**: Kambing gunung dengan lompatan tinggi Y=8.5 dan drop Mutton.
- 🐢 **Turtle**: Kura-kura dengan AI pantai/air, kecepatan berenang 2.2.

### 🎮 Gameplay
- 🍖 **Food & Cooking System**: Daging mentah → daging matang via Furnace (Block ID 10), makan daging matang mengembalikan 8 HP.
- 🛠️ **Crafting System**: Grid crafting 3x3 dengan 24+ resep termasuk Iron Tools, Bow, Arrow, dan Netherrack-to-Glowstone.
- 📦 **Peti Penyimpanan**: Blok peti 27-slot interaktif.
- 🌾 **Farming**: Cangkul, penanaman benih, pertumbuhan gandum 4 tahap.
- 🤿 **Ocean Diving & Oxygen System**: Berenang dan menyelam, bar gelembung nafas.

### 🎨 Visual & Audio
- 🎨 **100% Authentic Minecraft UI/UX Design System**: Inventory, Crafting, Hotbar, Main Menu, F3 Debug Overlay.
- 🔥 **Torch & Dynamic Lighting**: Obor silang X 2-plane dengan pancaran cahaya berkerlip.
- ☁️ **3D Volumetric Voxel Cloud Layer**: Awan 3D berstruktur voxel.
- ☀️ **Orbital Celestial System**: Matahari & Bulan 3D mengorbit dengan 400 bintang.
- 🎵 **Web Audio API Sound Synthesizer**: 20+ suara prosedural (mob, blok, portal, ambient).
- 🌐 **WebSocket Multiplayer**: 2-player sync untuk posisi, blok, damage, dan chat.

### ⚡ Performance
- **Web Worker Mesh Generation**: Multithreaded chunk meshing.
- **Distance Culling**: Mob di luar 80 blok di-hide & skip AI, despawn otomatis >120 blok.
- **Item Drop Pooling**: Max 50 drop aktif, auto-expire 60 detik, distance culling 40 blok.
- **Frustum Culling**: Hanya render chunk dalam view frustum.

---

## 🎮 Kontrol Permainan

| Tombol | Fungsi |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang |
| **Spacebar** | Melompat / Berenang naik |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam |
| **Klik Kiri Mouse** | Menghancurkan Blok / Menyerang Mob |
| **Klik Kanan Mouse** | Memasang Blok / Membuka Peti / Mencangkul / Menanam / Memasak / Makan |
| **Scroll Mouse / Angka 1-9** | Mengganti Slot Hotbar |
| **E** | Membuka Inventory & Crafting Grid |
| **F3** | Debug Overlay (FPS, XYZ, Chunk, Bioma, Dimension) |
| **T** | Membuka Chat Multiplayer |
| **Escape** | Pause Menu / Menutup UI |

---

## 📜 Panduan Resep Crafting

Tekan **`E`** untuk membuka Inventory & Crafting Grid.

### Material Dasar

| Hasil | Jumlah | Pola Grid | Bahan |
|---|---|---|---|
| 🪵 **Plank** | 4x | `[ Wood Log ]` | 1x Wood Log |
| 🥢 **Stick** | 4x | `[ Plank ][ Plank ]` (Vertikal) | 2x Planks |
| 🛠️ **Crafting Table** | 1x | Grid 2x2 Planks | 4x Planks |
| 📦 **Chest** | 1x | Bingkai 3x3 Planks | 8x Planks |
| 💡 **Torch** | 4x | `[ Plank/Log ][ Stick ]` | 1x Plank/Log + 1x Stick |
| 🍞 **Bread** | 1x | `[ Wheat x3 ]` (Horizontal) | 3x Wheat |
| 🥪 **Sandstone** | 1x | Grid 2x2 Sand | 4x Sand |
| ✨ **Glowstone** | 1x | Grid 2x2 Netherrack | 4x Netherrack |

### Peralatan Kayu & Batu

| Hasil | Bahan |
|---|---|
| ⛏️ **Wooden/Stone Pickaxe** | 3x Material + 2x Sticks |
| 🗡️ **Wooden/Stone Sword** | 2x Material + 1x Stick |
| 🪓 **Wooden/Stone Axe** | 3x Material + 2x Sticks |
| 🧹 **Wooden/Stone Shovel** | 1x Material + 2x Sticks |
| 🧑‍🌾 **Wooden/Stone Hoe** | 2x Material + 2x Sticks |

### Peralatan Besi (v2.0)

| Hasil | Bahan |
|---|---|
| ⛏️ **Iron Pickaxe** | 3x Iron Ingot + 2x Sticks |
| 🗡️ **Iron Sword** | 2x Iron Ingot + 1x Stick |
| 🪓 **Iron Axe** | 3x Iron Ingot + 2x Sticks |
| 🧹 **Iron Shovel** | 1x Iron Ingot + 2x Sticks |
| 🏹 **Bow** | 3x Stick + 3x String |
| 🏹 **Arrow** (4x) | 1x Stone + 1x Stick + 1x Feather |

---

## 💻 Cara Install & Menjalankan Game

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- npm (v9 atau lebih baru)

### 1. Menjalankan Client Game
```bash
git clone https://github.com/Gavinnaufal/minecraft-lite.git
cd minecraft-lite
npm install
npm run dev
```
Buka browser di `http://localhost:5173`.

### 2. Server Multiplayer (Opsional)
```bash
npx tsx server/server.ts
```
Server multiplayer di `ws://localhost:8080`.

---

## 📦 Build for Production

```bash
npm run build
```
Hasil di folder `dist/`.

---

## 🛠️ Struktur Proyek

```
minecraft-lite/
├── docs/                   # Dokumentasi (GDD, PRD, Roadmap, Taskboard v1 + v2)
├── public/                 # Assets (Tekstur 16x16 Pixel Art)
├── server/                 # WebSocket Multiplayer Server
├── src/
│   ├── audio/              # Web Audio API Synthesizer
│   ├── core/               # Engine, Input, Clock, Renderer, GameSettings
│   ├── crafting/           # Crafting Recipes
│   ├── entities/           # Proyektil (Arrow, ProjectileManager)
│   ├── environment/        # Skybox, DayNightCycle, CloudManager
│   ├── interaction/        # BlockBreaker, BlockPlacer, BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, ItemRegistry
│   ├── mobs/               # Mob Base, MobManager, AI State Machine
│   │   ├── hostile/        # Zombie, Skeleton, Spider, Enderman
│   │   ├── npc/            # Villager, IronGolem
│   │   └── passive/        # Cow, Pig, Chicken, Goat, Turtle
│   ├── multiplayer/        # WebSocket NetworkManager, ChatBox
│   ├── player/             # Player Physics, Controller, Collision, Raycaster
│   ├── save/               # IndexedDB SaveManager & StorageAdapter
│   ├── ui/                 # MainMenu, HUD, Inventory, Debug, Toast, Settings, DimensionOverlay
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), Terrain Generator
│   │   ├── dimension/      # DimensionManager, NetherWorldGenerator, PortalDetector
│   │   ├── structures/     # VillageGenerator, House Prefabs, VillageLoot
│   │   └── terrain/        # NoiseGenerator, HeightMap, BiomeGenerator
│   ├── main.ts             # Application Entry Point
│   └── style.css           # Game Styling
├── vercel.json             # SPA Deployment Config
├── package.json
└── README.md
```

---

## 📄 Lisensi
Disusun untuk Proyek Voxel Game Sandbox.
MIT License.
