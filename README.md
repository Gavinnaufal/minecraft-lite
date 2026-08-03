# ⛏️ Mini Minecraft 3.0 Master Expansion (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berkinerja tinggi yang dibangun dari nol berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini menerapkan arsitektur *game engine* modern dengan generasi *mesh* multithreaded (*Web Worker Zero-Copy Transferable ArrayBuffers*), *Frustum Culling*, *Mob Object Pooling*, *Procedural Web Audio API Synthesizer*, *Combat Armor Mitigation System*, *Procedural Structure Generation*, dan *WebSocket Multiplayer Synchronization*.

🏆 **Seluruh 296 Checkpoint (v1.0 CP1–CP156, v2.0 CP157–CP238, & v3.0 Expansion CP239–CP296)** telah **100% Selesai & Lolos Pengujian Production Build (0 Errors)**.

---

## 🚀 Ringkasan Fitur Utama Expansion v3.0

### ⚒️ 1. Penambangan & Peleburan Ore (Ore Mining & Smelting)
- ⛏️ **Coal & Iron Ore Subterranean Generation**: Generasi deposit bijih batubara (`coal_ore` ID 21) dan bijih besi (`iron_ore` ID 22) di kedalaman gua bawah tanah dengan *3D Simplex noise clustering*.
- 🔨 **Persyaratan Tier Pickaxe**: `iron_ore` membutuhkan minimal *Stone Pickaxe* (Tier $\ge 2$) untuk dapat ditambang dan mendapatkan `raw_iron`.
- 🔥 **Furnace Block & Interactive 3-Slot UI**: Blok tungku (`furnace` ID 23) interaktif dengan modal UI 3 slot (*Input*, *Fuel*, *Output*), animasi indikator panah & nyala api SVG, serta persitensi pembakaran di `FurnaceManager.ts`.
- 🥩 **Peleburan & Pemrosesan Daging Wajib**: Memasak daging mentah (*Raw Beef, Raw Porkchop, Raw Chicken, Mutton*) dan peleburan `raw_iron` menjadi `iron_ingot` kini wajib dilakukan melalui Furnace (5 detik per item).

### 🌾 2. Sistem Perdagangan Villager (Villager Trading System)
- 💎 **Mata Uang Emerald & Chest Loot Table**: Item `emerald` dapat ditemukan di peti harta karun desa (*Village Loot Chest*) atau diperoleh dari perdagangan.
- 🤝 **Interface Perdagangan Interaktif**: Perdagangan dengan Villager melalui modal GUI `TradingScreen.ts` dengan deteksi klik kanan crosshair.
- 🕒 **Cooldown Transaksi & Feedback Visual**: Cooldown 4 detik anti-spam per Villager, disertai efek suara pop sintetis dan *emerald particle burst* saat transaksi berhasil.

### 💖 3. Pembiakan & Penjinakan Hewan (Animal Breeding & Taming)
- 🌾 **Sistem Pakan Mob Terpusat**: `MobFoodRegistry.ts` memetakan makanan (Gandum, Seeds, Bread) ke hewan pasif (*Cow, Pig, Chicken, Goat, Turtle*).
- 💕 **Love Mode & Heart Particle Burst**: Memberi pakan memicu status *in-love* dengan efek visual partikel hati merah muda (`0xff4081`).
- 🍼 **Anak Mob & Skala Pertumbuhan 3D**: `BreedingManager.ts` mendeteksi kedekatan pasangan ($< 3.5\text{m}$), melahirkan anak mob berskala $0.5\times$, dengan *growth timer* 60 detik menuju dewasa (dapat dipercepat +15s per makanan). Cooldown pembiakan 5 menit (300s) per mob.

### 🛡️ 4. Sistem Zirah & Pertahanan (Armor & Equipment System)
- 🛡️ **4 Slot Equipment Zirah**: `EquipmentSlots.ts` mengelola slot `helmet`, `chestplate`, `leggings`, dan `boots`.
- ⚔️ **8 Item Zirah Leather & Iron**: Mendaftarkan 8 item armor baru (*Leather Set* & *Iron Set*) dengan resep crafting berpola otentik 3x3.
- 📊 **Kalkulasi Reduksi Damage (`ArmorSystem.ts`)**: Formula mitigasi damage $4\%$ per poin defense (maksimal cap $80\%$ reduksi damage, minimum 1 HP damage).
- 🛡️ **HUD Shield Bar & Shift+Click Auto-Equip**: 10 ikon perisai SVG di atas health bar, dilengkapi logika *drag-drop* dan *Shift+Click* auto-equip dari inventory ke slot zirah.

### 🏰 5. Benteng Nether & Boss Mobs (Nether Fortress & Boss Mobs)
- 🧱 **Nether Brick & Bounding Box Solid**: Blok `nether_brick` (ID 24) dengan ketahanan tinggi dan kolisi AABB solid.
- 🏛️ **Generasi Benteng Nether 3D (`NetherFortressGenerator.ts`)**: Struktur benteng prosedural pada grid chunk 16x16 di Nether (jembatan koridor, pilar penyangga, dan *Loot Room Chest*).
- ✈️ **Mob Terbang & Pathfinding 3D**: Base class `Mob.ts` dilengkapi flag `isFlying` untuk mengabaikan gravitasi jatuh dan bernavigasi melayang di udara.
- ☄️ **Proyektil Fireball (`Fireball.ts`)**: Bola api lurus dan bola api meledak dengan efek partikel api, suara ledakan, dan mitigasi armor.
- 🔥 **Blaze Boss Mob (`Blaze.ts`)**: Mob melayang dengan 12 batang *orbiting rods*, tembakan bola api beruntun, dan drop `blaze_rod`.
- 👻 **Ghast Boss Mob (`Ghast.ts`)**: Boss mob terbang raksasa (skala $2.2\times$ body + 9 tentakel), tembakan bola api meledak 7.0 HP, dan drop `ghast_tear`.

### 🔮 6. Master Integration & Polish v3.0
- 📊 **F3 Debug Screen Update**: Menampilkan poin zirah (*Armor Pts*), jumlah proyektil aktif, dan status dimensi.
- 🔊 **Web Audio API Synthesized SFX**: Efek suara sintetis komplit tanpa aset eksternal.
- 💾 **Save Migration Pipeline (`SAVE_VERSION = 3`)**: Dukungan migrasi data simpanan dari v1.0 dan v2.0 ke v3.0 secara otomatis dan aman.

---

## 🎮 Kontrol Permainan Complete Guide

| Tombol | Fungsi Utama |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke sudut kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke permukaan air (*Swim Up*) |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar laut (*Dive Down*) |
| **Klik Kiri Mouse** | Memecahkan Blok / Menyerang Mob Musuh |
| **Klik Kanan Mouse** | Memasang Blok / Membuka Peti / Memasak di Furnace / Membuka Perdagangan Villager / Memberi Pakan Hewan / Mencangkul / Menanam |
| **Shift + Klik Kiri** | Memakai Zirah Otomatis (*Auto-Equip Armor*) dari Inventory / Hotbar |
| **Scroll Mouse / 1-9** | Berpindah Slot Hotbar Aktif |
| **E** | Membuka / Menutup Layar Inventory, Zirah Equipment, & Grid Crafting (3x3) |
| **F3** | Membuka / Menutup Screen Debug Overlay (FPS, XYZ, Chunk, Bioma, Dimensi, Mobs, Armor, Proyektil) |
| **T** | Membuka Kotak Chat Multiplayer (*In-Game Chat Box*) |
| **Escape (ESC)** | Membuka Pause Menu / Menutup Layar UI |

---

## 🧱 Daftar Blok (Block Registry) & ID

| ID | Nama Blok | Tipe / Karakteristik | Drops |
|---|---|---|---|
| 0 | `air` | Gas Transparan | - |
| 1 | `grass` | Solid Opaque | Grass / Wheat Seeds |
| 2 | `dirt` | Solid Opaque | Dirt |
| 3 | `stone` | Solid Opaque | Stone |
| 4 | `sand` | Solid Opaque | Sand |
| 5 | `wood_log` | Solid Opaque | Wood Log |
| 6 | `leaves` | Transparan Solid | Leaves |
| 7 | `water` | Liquid Fluid | - |
| 8 | `plank` | Solid Opaque | Plank |
| 9 | `crafting_table` | Interaktif (Crafting UI 3x3) | Crafting Table |
| 10 | `sandstone` | Solid Opaque | Sandstone |
| 11 | `torch` | Light Source Non-Solid | Torch |
| 12 | `chest` | Interaktif (Chest Storage UI 27-Slot) | Chest + Items |
| 13 | `farmland` | Soil Agriculture | Dirt |
| 14 | `wheat_crop` | Plant Growth | Wheat + Wheat Seeds |
| 15 | `obsidian` | Blast Resistant Solid | Obsidian |
| 16 | `netherrack` | Nether Substratum | Netherrack |
| 17 | `glowstone` | Nether Light Source | Glowstone |
| 18 | `nether_portal` | Dimensional Portal | - |
| 19 | `lava` | Liquid Fluid Hazard | - |
| 20 | `soul_sand` | Slowing Soil | Soul Sand |
| 21 | `coal_ore` | Subterranean Ore | Coal Ore / Coal |
| 22 | `iron_ore` | Subterranean Ore (Req. Stone Pickaxe) | Iron Ore / Raw Iron |
| 23 | `furnace` | Interaktif (Furnace UI 3-Slot) | Furnace |
| 24 | `nether_brick` | Nether Fortress Block (Blast Resistant Solid) | Nether Brick |

---

## 📜 Panduan Resep Crafting Item (Complete Recipe Index)

Buka inventaris dengan **`E`** (2x2 grid) atau gunakan **Crafting Table** (3x3 grid).

### 1. Komponen Dasar, Blok & Furnace

| Hasil Crafting | Jumlah | Kombinasi Pola Grid 3x3 | Bahan Dibutuhkan |
|---|---|---|---|
| 🪵 **Plank** | 4x | `[ Wood Log ]` | 1x Wood Log |
| 🥢 **Stick** | 4x | `[ Plank ]`<br>`[ Plank ]` | 2x Planks |
| 🛠️ **Crafting Table** | 1x | `[ Plank ][ Plank ]`<br>`[ Plank ][ Plank ]` | 4x Planks |
| 📦 **Chest** | 1x | `[ Plank ][ Plank ][ Plank ]`<br>`[ Plank ][   -   ][ Plank ]`<br>`[ Plank ][ Plank ][ Plank ]` | 8x Planks |
| 🔥 **Furnace** | 1x | `[ Stone ][ Stone ][ Stone ]`<br>`[ Stone ][   -   ][ Stone ]`<br>`[ Stone ][ Stone ][ Stone ]` | 8x Stone |
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

### 3. Set Zirah (Armor Sets)

| Hasil Crafting | Kombinasi Pola Grid 3x3 | Bahan Dibutuhkan |
|---|---|---|
| 🪖 **Leather / Iron Helmet** | `[ Mat ][ Mat ][ Mat ]`<br>`[ Mat ][  -  ][ Mat ]` | 5x Leather / Iron Ingot |
| 👕 **Leather / Iron Chestplate** | `[ Mat ][  -  ][ Mat ]`<br>`[ Mat ][ Mat ][ Mat ]`<br>`[ Mat ][ Mat ][ Mat ]` | 8x Leather / Iron Ingot |
| 👖 **Leather / Iron Leggings** | `[ Mat ][ Mat ][ Mat ]`<br>`[ Mat ][  -  ][ Mat ]`<br>`[ Mat ][  -  ][ Mat ]` | 7x Leather / Iron Ingot |
| 🥾 **Leather / Iron Boots** | `[ Mat ][  -  ][ Mat ]`<br>`[ Mat ][  -  ][ Mat ]` | 4x Leather / Iron Ingot |

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
├── docs/                   # Dokumentasi Resmi (GDD, PRD, Roadmap, Taskboard v1 + v2 + v3)
├── public/                 # Assets Tekstur 16x16 Pixel Art & Ikon
├── server/                 # Node.js WebSocket Server (server.ts)
├── src/
│   ├── audio/              # Web Audio API Synthesizer (AudioManager.ts)
│   ├── core/               # Engine, InputManager, Clock, Renderer, GameSettings
│   ├── crafting/           # Crafting Recipes Index & Smelting Recipes (Recipes.ts)
│   ├── economy/            # Sistem Perdagangan (TradeTable.ts, VillagerTrading.ts)
│   ├── entities/           # Entitas Proyektil (Arrow.ts, Fireball.ts, ProjectileManager.ts)
│   ├── environment/        # Skybox, DayNightCycle, CloudManager
│   ├── interaction/        # BlockBreaker, BlockPlacer, BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, ItemRegistry, EquipmentSlots, ArmorSystem, FurnaceManager, ChestManager
│   ├── mobs/               # Mob Base, MobManager & AI State Machine
│   │   ├── ai/             # MobFoodRegistry.ts, BreedingManager.ts, StateMachine.ts
│   │   ├── hostile/        # Zombie, Skeleton, Spider, Enderman, Blaze, Ghast
│   │   ├── npc/            # Villager, IronGolem
│   │   └── passive/        # Cow, Pig, Chicken, Goat, Turtle
│   ├── multiplayer/        # WebSocket NetworkManager, ChatBox
│   ├── player/             # Player Physics, Controller, Collision, Raycaster
│   ├── save/               # IndexedDB SaveManager & StorageAdapter (v1->v2->v3 Migration)
│   ├── ui/                 # MainMenu, HUD, InventoryScreen, FurnaceScreen, TradingScreen, DebugScreen, ToastSystem, PauseMenu, SettingsMenu, DimensionOverlay
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), Terrain Generator
│   │   ├── dimension/      # DimensionManager, NetherWorldGenerator, PortalDetector
│   │   ├── ores/           # OreGenerator.ts
│   │   ├── structures/     # VillageGenerator, House Prefabs, VillageLoot, NetherFortressGenerator
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
