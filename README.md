# ⛏️ Mini Minecraft 2.0 Expansion (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berkinerja tinggi yang dibangun dari nol berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini menerapkan arsitektur *game engine* modern dengan generasi *mesh* multithreaded (*Web Worker Zero-Copy Transferable ArrayBuffers*), *Frustum Culling*, *Mob Object Pooling*, *Procedural Web Audio API Synthesizer*, dan *WebSocket Multiplayer Synchronization*.

 Seluruh 238 Checkpoint (CP1–CP156 v1.0 & CP157–CP238 Expansion v2.0) telah **100% Selesai & Lolos Pengujian Production Build**.

---

## 🚀 Ringkasan Fitur Utama Expansion v2.0

### 🌍 Bioma, Struktur & Demensi Baru
- 🏡 **Perkampungan Warga (Villages & Prefab Generation)**: Terbentuk secara prosedural di bioma datar (*Plains*). Dilengkapi jalan setapak tanah (*Dirt Path*), prefab rumah kayu ek (*Oak House*), rumah batu (*Cobblestone House*), ladang gandum (*Farm Field*), dan peti harta karun (*Village Loot Chest*).
- 🔮 **Dimensi Nether & Portal Obsidian**: Bingkai obsidian 4x5 vertikal dengan aktivasi portal otomatis, countdown teleportasi 3 detik, efek vignette portal ungu, skala koordinat 1:8, terrain gua Nether subterranean, lahar panas, dan pencahayaan kabut merah hangat.
- 🌋 **Ekspansi Gua & Jurang Ravine**: Generasi jurang terjal dalam (*Ravines*), terowongan gua 3D noise mendalam, kolam lahar underground (*Lava Pools*), dan kluster batu *Obsidian*.
- 🌊 **Perairan Dangkal & Tepian Pantai (River & Water Polish)**: Depresi terrain sungai dangkal, transisi pantai berpasir halus, kemiringan lereng *smoothstep*, dan aliran air mengalir dinamis.

### 🧑‍🌾 NPC & Sistem Mob AI Complete
- **Villager NPC**: Warga desa 3D berpakaian jubah cokelat, hidung ikonik, AI navigasi menyusuri jalan setapak desa, dan efek suara khas *"Hmm"*.
- **Iron Golem**: Pelindung desa raksasa (100 HP, tinggi 2.7 blok), patroli otomatis, serangan animasi lemparan lengan ke atas (*Knockback Upward Toss*), dan membantai mob agresif.
- 💀 **Pemanah Skeleton**: Mob musuh pemanah 3D dengan busur kayu, AI menjaga jarak tembak ideal (6-12 blok), fisika anak panah lintasan parabola (*Ballistic Trajectory Arc*), serta drop *Bone* & *Arrow*.
- 🕷️ **Laba-laba Merayap (Spider)**: Mob berkaki 8 dengan mata merah glowing, fisika panjat tebing vertikal (*Vertical Wall-Climbing*), serangan lompat menerjang (*Leap Attack*), serta drop *String*.
- 👁️ **Enderman**: Mob jangkung setinggi 2.9 blok, mata magenta berkilau, melayang partikel ungu (*Purple Ender Particles*), teleportasi acak 8-20 blok, dan AI terprovokasi tatapan mata (*Stare Trigger*).
- 🐄 🐷 🐔 🐐 🐢 **Passive Animals**: Cow, Pig (animasi trot), Chicken (animasi kepak sayap), Goat (lompatan tinggi Y=8.5 di pegunungan), dan Turtle (AI merayap pantai & berenang cepat 2.2).

### 🍖 Sistem Makanan, Memasak & Crafting
- 🍖 **Furnace & Food Cooking**: Memasak daging mentah (*Raw Porkchop, Raw Chicken, Raw Beef, Mutton*) menjadi daging matang via Furnace (Block ID 10) atau klik kanan makanan untuk memulihkan 8 HP.
- 🛠️ **Crafting System 3x3**: Grid crafting 3x3 dengan 24+ resep lengkap termasuk Iron Tools, Bow, Arrow, Sandstone, Chest, Torch, Bread, dan Glowstone.
- 📦 **Peti Penyimpanan (Chest System)**: Blok peti 27-slot interaktif per koordinat dunia.
- 🌾 **Farming & Pertanian**: Cangkul (*Hoe*), *auto-tilling*, benih gandum, pertumbuhan 4 tahap, dan panen *Bread*.

---

## 🎮 Kontrol Permainan Complete Guide

| Tombol | Fungsi Utama |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke sudut kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke permukaan air (*Swim Up*) |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar laut (*Dive Down*) |
| **Klik Kiri Mouse** | Memecahkan Blok / Menyerang Mob Musuh |
| **Klik Kanan Mouse** | Memasang Blok / Membuka Peti / Memasak di Furnace / Mencangkul / Menanam / Makan |
| **Scroll Mouse / 1-9** | Berpindah Slot Hotbar Aktif |
| **E** | Membuka / Menutup Layar Inventory & Grid Crafting (3x3) |
| **F3** | Membuka / Menutup Screen Debug Overlay (FPS, XYZ, Chunk, Bioma, Dimensi, Mobs) |
| **T** | Membuka Kotak Chat Multiplayer (*In-Game Chat Box*) |
| **Escape (ESC)** | Membuka Pause Menu / Menutup Layar UI |

---

## 🧱 Daftar Blok (Block Registry) & ID

| ID | Nama Blok | Tipe / Karakteristik | Drops |
|---|---|---|---|
| 0 | `air` | Gas Transparan | - |
| 1 | `grass` | Solid Opaque | Dirt |
| 2 | `dirt` | Solid Opaque | Dirt |
| 3 | `stone` | Solid Opaque | Stone / Cobblestone |
| 4 | `wood_log` | Solid Opaque | Wood Log |
| 5 | `leaves` | Transparan Solid | Leaves / Sapling |
| 6 | `sand` | Solid Opaque | Sand |
| 7 | `water` | Liquid Fluid | - |
| 8 | `plank` | Solid Opaque | Plank |
| 9 | `crafting_table` | Interaktif | Crafting Table |
| 10 | `furnace` / `chest` | Interaktif | Furnace / Chest |
| 11 | `torch` | Light Source Non-Solid | Torch |
| 12 | `farmland` | Soil Agriculture | Dirt |
| 13 | `wheat_crop` | Plant Growth | Wheat / Wheat Seeds |
| 14 | `sandstone` | Solid Opaque | Sandstone |
| 15 | `obsidian` | Blast Resistant Solid | Obsidian |
| 16 | `netherrack` | Nether Substratum | Netherrack |
| 17 | `glowstone` | Nether Light Source | Glowstone |
| 18 | `nether_portal` | Dimensional Portal | - |
| 19 | `lava` | Liquid Fluid Hazard | - |
| 20 | `soul_sand` | Slowing Soil | Soul Sand |

---

## 📜 Panduan Resep Crafting Item (Complete Recipe Index)

Buka inventaris dengan **`E`** (2x2 grid) atau gunakan **Crafting Table** (3x3 grid).

### 1. Komponen Dasar & Blok

| Hasil Crafting | Jumlah | Kombinasi Pola Grid 3x3 | Bahan Dibutuhkan |
|---|---|---|---|
| 🪵 **Plank** | 4x | `[ Wood Log ]` | 1x Wood Log |
| 🥢 **Stick** | 4x | `[ Plank ]`<br>`[ Plank ]` | 2x Planks |
| 🛠️ **Crafting Table** | 1x | `[ Plank ][ Plank ]`<br>`[ Plank ][ Plank ]` | 4x Planks |
| 📦 **Chest** | 1x | `[ Plank ][ Plank ][ Plank ]`<br>`[ Plank ][   -   ][ Plank ]`<br>`[ Plank ][ Plank ][ Plank ]` | 8x Planks |
| 💡 **Torch** | 4x | `[ Plank / Log ]`<br>`[ Stick ]` | 1x Plank/Log + 1x Stick |
| 🍞 **Bread** | 1x | `[ Wheat ][ Wheat ][ Wheat ]` | 3x Wheat |
| 🥪 **Sandstone** | 1x | `[ Sand ][ Sand ]`<br>`[ Sand ][ Sand ]` | 4x Sand |
| ✨ **Glowstone** | 1x | `[ Netherrack ][ Netherrack ]`<br>`[ Netherrack ][ Netherrack ]` | 4x Netherrack |

### 2. Peralatan & Senjata (Tools & Weapons)

| Hasil Crafting | Kombinasi Pola Grid 3x3 | Bahan Dibutuhkan |
|---|---|---|
| ⛏️ **Wooden / Stone Pickaxe** | `[ Mat ][ Mat ][ Mat ]`<br>`[  -  ][ Stick ][  -  ]`<br>`[  -  ][ Stick ][  -  ]` | 3x Planks/Stone + 2x Sticks |
| 🗡️ **Wooden / Stone Sword** | `[ Mat ]`<br>`[ Mat ]`<br>`[ Stick ]` | 2x Planks/Stone + 1x Stick |
| 🪓 **Wooden / Stone Axe** | `[ Mat ][ Mat ]`<br>`[ Mat ][ Stick ]`<br>`[  -  ][ Stick ]` | 3x Planks/Stone + 2x Sticks |
| 🧹 **Wooden / Stone Shovel** | `[ Mat ]`<br>`[ Stick ]`<br>`[ Stick ]` | 1x Plank/Stone + 2x Sticks |
| 🧑‍🌾 **Wooden / Stone Hoe** | `[ Mat ][ Mat ]`<br>`[  -  ][ Stick ]`<br>`[  -  ][ Stick ]` | 2x Planks/Stone + 2x Sticks |
| ⛏️ **Iron Pickaxe** | `[ Iron ][ Iron ][ Iron ]`<br>`[  -   ][ Stick ][  -   ]`<br>`[  -   ][ Stick ][  -   ]` | 3x Iron Ingot + 2x Sticks |
| 🗡️ **Iron Sword** | `[ Iron ]`<br>`[ Iron ]`<br>`[ Stick ]` | 2x Iron Ingot + 1x Stick |
| 🪓 **Iron Axe** | `[ Iron ][ Iron ]`<br>`[ Iron ][ Stick ]`<br>`[  -   ][ Stick ]` | 3x Iron Ingot + 2x Sticks |
| 🏹 **Bow** | `[  -  ][ Stick ][ String ]`<br>`[ Stick ][  -   ][ String ]`<br>`[  -  ][ Stick ][ String ]` | 3x Stick + 3x String |
| 🏹 **Arrow** (4x) | `[ Stone ]`<br>`[ Stick ]`<br>`[ Feather ]` | 1x Stone + 1x Stick + 1x Feather |

---

## 💻 Cara Install & Menjalankan Game Lokal

### Persyaratan Sistem
- **Node.js**: v18.0.0 atau lebih baru
- **npm**: v9.0.0 atau lebih baru

### 1. Menjalankan Client Game
```bash
# Clone repository
git clone https://github.com/Gavinnaufal/minecraft-lite.git
cd minecraft-lite

# Install dependencies
npm install

# Jalankan dev server Vite
npm run dev
```
Buka browser di alamat `http://localhost:5173`.

### 2. Menjalankan Server Multiplayer WebSocket (Opsional)
```bash
# Buka terminal kedua di folder project
npx tsx server/server.ts
```
Server WebSocket multiplayer akan aktif di `ws://localhost:8080`.

---

## 📦 Build for Production Verification

```bash
npm run build
```
Hasil bundle kompilasi yang dioptimasi siap deploy dapat ditemukan di folder `dist/`.

---

## 🛠️ Arsitektur & Struktur Proyek

```
minecraft-lite/
├── docs/                   # Dokumentasi Resmi (GDD, PRD, Roadmap, Taskboard v1 + v2)
├── public/                 # Assets Tekstur 16x16 Pixel Art & Ikon
├── server/                 # Node.js WebSocket Server (server.ts)
├── src/
│   ├── audio/              # Web Audio API Synthesizer (AudioManager.ts)
│   ├── core/               # Engine, InputManager, Clock, Renderer, GameSettings
│   ├── crafting/           # Crafting Recipes Index (Recipes.ts)
│   ├── entities/           # Entitas Proyektil (Arrow.ts, ProjectileManager.ts)
│   ├── environment/        # Skybox, DayNightCycle, CloudManager
│   ├── interaction/        # BlockBreaker, BlockPlacer, BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, ItemRegistry
│   ├── mobs/               # Mob Base, MobManager & AI State Machine
│   │   ├── hostile/        # Zombie, Skeleton, Spider, Enderman
│   │   ├── npc/            # Villager, IronGolem
│   │   └── passive/        # Cow, Pig, Chicken, Goat, Turtle
│   ├── multiplayer/        # WebSocket NetworkManager, ChatBox
│   ├── player/             # Player Physics, Controller, Collision, Raycaster
│   ├── save/               # IndexedDB SaveManager & StorageAdapter (v1->v2 Migration)
│   ├── ui/                 # MainMenu, HUD, InventoryScreen, DebugScreen, ToastSystem, PauseMenu, SettingsMenu, DimensionOverlay
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), Terrain Generator
│   │   ├── dimension/      # DimensionManager, NetherWorldGenerator, PortalDetector
│   │   ├── structures/     # VillageGenerator, House Prefabs, VillageLoot
│   │   └── terrain/        # NoiseGenerator, HeightMap, BiomeGenerator
│   ├── main.ts             # Application Main Loop & Event Dispatcher
│   └── style.css           # Game UI & Canvas Styling
├── vercel.json             # Deployment Config
├── package.json
└── README.md
```

---

## 📄 Lisensi
Disusun untuk Proyek Voxel Game Sandbox Three.js.  
**MIT License.**
