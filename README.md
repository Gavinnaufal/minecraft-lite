# 🌲 Mini Minecraft 3.0: Forest Survival Edition (Voxel Sandbox & Survival Game)

Mini Minecraft adalah game sandbox & survival voxel 3D berkinerja tinggi yang dibangun dari nol berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini menerapkan arsitektur *game engine* modern dengan generasi *mesh* multithreaded (*Web Worker Zero-Copy Transferable ArrayBuffers*), *Frustum Culling*, *Mob Object Pooling*, *Procedural Web Audio API Synthesizer*, *Combat & Armor Mitigation System*, *Procedural Structure & Biome Generation*, *WebSocket Multiplayer*, serta mode permainan **15-Day Forest Survival** berbalut antarmuka bertema **Rustic Wood & Parchment**.

🏆 **100% Selesai & Lolos Pengujian Production Build (`tsc && vite build` — 0 Errors)**.

---

## 🌲 Mode Permainan Utama: 15-Day Forest Survival Mode

Pemain terdampar di tengah hutan lebat yang liar dan berbahaya. Misimu adalah **bertahan hidup selama 15 Hari** sampai tim penyelamat dan bala bantuan tiba.

### ⚔️ 1. Tingkat Kesulitan Permainan (Difficulty Settings)
Saat memulai dunia baru, pemain dapat memilih 3 tingkat tantangan:
- 🌿 **Santai**: Nyawa tak terbatas. Kematian hanya mereset hari berjalan tanpa menghapus progres inventaris/peralatan.
- 🛡️ **Normal**: Pemain memiliki **3 Nyawa**. Monster malam lebih agresif. Nyawa berkurang setiap kali mati.
- ☠️ **Susah (Hardcore / Permadeath)**: Pemain hanya memiliki **1 Nyawa**. Kematian memicu *Game Over* instan dan mereset dunia permainan.

### 📜 2. Prolog Narasi & Epilog Akhir Permainan (End Game Screen)
- 📖 **Prolog Catatan Survival**: Muncul sebelum petualangan dimulai, memberikan narasi cerita dan arahan objektif misi 15 hari.
- 🏆 **Layar Kemenangan (Victory Screen)**: Terpicu otomatis saat mencapai fajar Hari ke-15 dengan cerita penyelamatan.
- ☠️ **Layar Kekalahan (Defeat Screen)**: Terpicu saat nyawa pemain habis atau waktu gagal dipenuhi.
- 🔄 **Tombol Reset Progres**: Menghapus save lama dan mempersiapkan petualangan baru secara mulus.

### 📊 3. Pelacak Statistik Real-Time (`StatsTracker.ts`)
Melacak dan menampilkan ringkasan performa bermain pemain di akhir permainan:
1. 📅 **Hari Bertahan**: Total hari yang berhasil dilewati (/ 15 Hari).
2. 🛡️ **Tingkat Kesulitan**: Santai / Normal / Susah.
3. ⏱️ **Waktu Bermain**: Durasi total bermain (Jam, Menit, Detik).
4. ⚔️ **Monster Dikalahkan**: Total monster yang berhasil dibasmi.
5. ⛏️ **Blok Dihancurkan**: Jumlah blok yang ditambang/dipecahkan.
6. 🧱 **Blok Dipasang**: Jumlah blok yang ditempatkan/dibangun.
7. 🛠️ **Item Dibuat**: Total item yang berhasil di-craft di Crafting Table.
8. 🍖 **Makanan Dimakan**: Porsi makanan yang dikonsumsi untuk mengisi lapar/darah.
9. 🏃 **Jarak Ditempuh**: Akumulasi jarak perjalanan kaki dalam meter (blok).

---

## 🎨 Tema Visual UI/UX "Hutan Survival" (Rustic Wood & Parchment Theme)

Seluruh antarmuka grafis (GUI) didesain ulang dengan tema alam dan petualangan hutan:
- 🪵 **Panel Kayu Tua Rustic (`--theme-panel-bg`)**: Panel jendela bertekstur bevel kayu gelap yang hangat.
- 📜 **Kotak Catatan Perkamen (`--theme-parchment-bg-dark`)**: Area teks berlatar kertas usang dengan tipografi kontras tinggi yang mudah dibaca.
- 🍃 **Aksen Hijau Daun & Emas Hangat (`--theme-accent-green`, `--theme-accent-gold`)**: Tombol aksi primer dan highlight item terpilih dengan efek *amber glow*.
- 🍞 **Slot Inset Kayu Gelap (`--theme-slot-bg`)**: Tampilan slot inventaris dan hotbar yang menyatu dengan estetika kayu.
- 💬 **Sistem Toast Notifikasi (`ToastSystem.ts`)**: Notifikasi mengambang dengan aksen warna kategori (Sukses, Peringatan, Bahaya, Info).

---

## 📱 Optimalisasi Khusus Mobile & Layar Sentuh

Game ini sepenuhnya responsif dan dioptimalkan untuk perangkat ponsel pintar (Android/iOS):
- 👆 **Sistem Tap-to-Select Aman**: Menggantikan mekanisme *drag-and-drop* pada layar sentuh. Cukup ketuk item sumber lalu ketuk slot tujuan untuk memindahkan item tanpa risiko *item stuck*.
- ⏱️ **Modal Pemisah Stack (Stack Splitter)**: Sentuh dan tahan (*long press* $\ge 380\text{ms}$) pada item untuk membuka slider pembagi jumlah item (1 Saja, Setengah, Semua, +/-).
- ☰ **Tombol Menu Cepat (Mobile Pause Button)**: Akses mudah ke Pause Menu, Simpan Dunia, dan Pengaturan Game langsung dari tombol sentuh di layar.
- 📐 **HUD Responsif Dinamis**: Teks koordinat XYZ, kompas waktu/hari, dan bilah status (Health, Oxygen, Armor) menyesuaikan posisi secara otomatis agar tidak bertumpukan.
- 🛡️ **Pencegah Player Nyangkut (Spawn Safeguard)**: Elevasi spawn player dihitung $+0.6$ blok di atas permukaan bukit/lereng untuk mencegah AABB pemain menembus tanah saat pertama kali masuk game.

---

## 🚀 Ringkasan Fitur Lengkap Permainan

### ⚒️ 1. Penambangan, Peleburan & Pertanian (Mining, Smelting & Farming)
- ⛏️ **Deposit Ore**: Generasi bijih batubara (`coal_ore`) dan bijih besi (`iron_ore`) bawah tanah. `iron_ore` memerlukan minimal Stone Pickaxe.
- 🔥 **Furnace Interaktif**: Melebur `raw_iron` menjadi `iron_ingot` serta memasak daging mentah (*Raw Beef, Raw Porkchop, Raw Chicken, Mutton*).
- 🌾 **Pertanian Gandum**: Mencangkul tanah dengan Cangkul (*Hoe*), menanam *Wheat Seeds*, dan memanen gandum matang untuk membuat roti (*Bread*).

### 🌾 2. Desa, Struktur & Perdagangan (Villages & Trading)
- 🏡 **Desa Prosedural (Procedural Villages)**: Rumah kayu ek, jalan setapak kerikil, tiang lampu obor, dan peti rampasan desa (*Village Loot Chest*).
- 🤝 **Villager Trading**: Berinteraksi dengan penduduk desa untuk menukarkan hasil panen/sumber daya dengan `emerald` atau peralatan langka.
- 🛡️ **Iron Golem**: Pelindung desa netral yang akan membalas serangan pemain jika diprovokasi.

### 💖 3. Pembiakan & Penjinakan Hewan (Animal Breeding)
- 🌾 **Sistem Pakan**: Memberi makan hewan (*Cow, Pig, Chicken, Goat, Turtle*) dengan gandum/biji-bijian.
- 💕 **Love Mode**: Hewan yang diberi makan akan memancarkan partikel hati dan melahirkan anak mob 3D dengan skala $0.5\times$ yang akan tumbuh dewasa.

### 🛡️ 4. Sistem Zirah & Mitigasi Kerusakan (Armor System)
- 🛡️ **4 Slot Zirah**: Helmet, Chestplate, Leggings, dan Boots (Tersedia set *Leather* dan *Iron*).
- 📊 **Formula Pertahanan**: Tiap 1 poin zirah menyerap $4\%$ kerusakan fisik (maksimal $80\%$ reduksi).
- 🛡️ **HUD Shield Bar**: Menampilkan bilah 10 perisai SVG di atas bar darah pemain.

### 🏰 5. Dimensi Nether & Boss Mobs
- 🌀 **Nether Portal**: Membangun portal obsidian $4\times 5$ dan mengaktifkannya untuk berpindah dimensi.
- 🧱 **Benteng Nether (Nether Fortress)**: Lorong jembatan bata nether, kolam lahar, dan peti harta karun neraka.
- 👹 **Monster & Boss**:
  - 🧟 **Zombie & Skeleton**: Membakar saat siang hari, menembakkan panah proyektil.
  - 🕷️ **Spider**: Memanjat dinding vertikal, pasif di siang hari & agresif di malam hari.
  - 👁️ **Enderman**: Berteleportasi saat marah atau tersentuh air; marah saat ditatap 0.8 detik.
  - 🔥 **Blaze**: Boss melayang berputar dengan 12 batang api yang menembakkan bola api beruntun.
  - 👻 **Ghast**: Boss raksasa melayang dengan proyektil bola api peledak (*Explosive Fireballs*).

---

## 🎮 Panduan Kontrol Lengkap (Complete Controls Guide)

### Kontrol PC / Desktop
| Tombol | Fungsi Utama |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke permukaan air |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar air |
| **Klik Kiri Mouse** | Menghancurkan Blok / Menyerang Musuh |
| **Klik Kanan Mouse** | Memasang Blok / Membuka Peti & Furnace / Berdagang / Memberi Makan Mob / Mencangkul / Menanam |
| **Shift + Klik Kiri** | Memakai Zirah Otomatis (*Auto-Equip Armor*) |
| **Scroll Mouse / 1-9** | Mengganti Slot Hotbar Aktif |
| **E** | Membuka / Menutup Layar Inventory, Zirah & Crafting Table (3x3) |
| **F3** | Membuka Debug Overlay (FPS, XYZ, Chunk, Bioma, Dimensi, Mob, Zirah) |
| **T** | Membuka Kotak Chat Multiplayer |
| **Escape (ESC)** | Membuka Menu Jeda (Pause Menu) / Menutup Layar UI Aktif |

### Kontrol Mobile / Layar Sentuh
| Tombol Layar | Fungsi Utama |
|---|---|
| **D-Pad Kiri Virtual** | Berjalan maju, mundur, kiri, kanan |
| **Area Kanan Layar** | Mengarahkan sudut kamera pandang (Sentuh & Geser) |
| **Tombol Lompat (▲)** | Melompat / Berenang naik |
| **Tombol Serang (⚔️)** | Menghancurkan blok yang disorot / Memukul musuh |
| **Tombol Pasang (🧱)** | Memasang blok / Berinteraksi dengan peti, furnace, mob |
| **Tombol Tas (🎒)** | Membuka / Menutup panel inventaris & crafting |
| **Tombol Menu (☰)** | Membuka Pause Menu & Pengaturan Permainan |
| **Tap Slot Inventaris** | Memilih item dan memindahkannya ke slot lain (*Tap-to-Select*) |
| **Tahan Slot Inventaris** | Membuka popup pemisah tumpukan (*Stack Splitter*) |

---

## 🧱 Daftar Blok (Block Registry) & ID

| ID | Nama Blok | Karakteristik | Hasil Drop |
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
| 11 | `torch` | Sumber Cahaya Non-Solid | Torch |
| 12 | `chest` | Interaktif (Peti 27-Slot) | Chest + Isi Item |
| 13 | `farmland` | Tanah Pertanian | Dirt |
| 14 | `wheat_crop` | Tanaman Tumbuh | Wheat + Wheat Seeds |
| 15 | `obsidian` | Tahan Ledakan (Portal Frame) | Obsidian |
| 16 | `netherrack` | Batuan Nether | Netherrack |
| 17 | `glowstone` | Sumber Cahaya Nether | Glowstone |
| 18 | `nether_portal` | Dimensi Portal | - |
| 19 | `lava` | Cairan Panas Berbahaya | - |
| 20 | `soul_sand` | Tanah Perlambat Gerak | Soul Sand |
| 21 | `coal_ore` | Bijih Batubara Bawah Tanah | Coal |
| 22 | `iron_ore` | Bijih Besi (Req. Stone Pickaxe) | Raw Iron |
| 23 | `furnace` | Interaktif (Tungku 3-Slot) | Furnace |
| 24 | `nether_brick` | Bata Benteng Nether | Nether Brick |

---

## 📜 Panduan Resep Crafting & Smelting (30+ Resep)

Gunakan **Crafting Table** (Grid 3x3) atau **Furnace** untuk memproses material:

### 1. Blok, Komponen Dasar & Peralatan
- 🪵 **Plank** (4x): `1x Wood Log`
- 🥢 **Stick** (4x): `2x Planks` vertikal
- 🛠️ **Crafting Table** (1x): `4x Planks` (Grid 2x2)
- 📦 **Chest** (1x): `8x Planks` melingkar
- 🔥 **Furnace** (1x): `8x Stone` melingkar
- 💡 **Torch** (4x): `1x Coal / Plank` di atas `1x Stick`
- 🍞 **Bread** (1x): `3x Wheat` horizontal

### 2. Alat & Senjata (Tools & Weapons)
- ⛏️ **Pickaxe** (*Wood/Stone/Iron*): `3x Bahan` horizontal di atas + `2x Sticks` vertikal di tengah.
- 🗡️ **Sword** (*Wood/Stone/Iron*): `2x Bahan` vertikal di atas + `1x Stick` di bawah.
- 🪓 **Axe** (*Wood/Stone/Iron*): `3x Bahan` pola sudut + `2x Sticks` vertikal.
- 🧹 **Shovel** (*Wood/Stone/Iron*): `1x Bahan` di atas + `2x Sticks` vertikal.
- 🧑‍🌾 **Hoe** (*Wood/Stone/Iron*): `2x Bahan` sudut atas + `2x Sticks` vertikal.
- 🏹 **Bow** (1x): `3x Sticks` melengkung + `3x Strings`.
- 🏹 **Arrow** (4x): `1x Stone` atas + `1x Stick` tengah + `1x Feather` bawah.

### 3. Set Zirah (Armor Sets)
- 🪖 **Helmet** (*Leather/Iron*): `5x Bahan` pola helm terbalik.
- 👕 **Chestplate** (*Leather/Iron*): `8x Bahan` mengisi seluruh slot kecuali tengah atas.
- 👖 **Leggings** (*Leather/Iron*): `7x Bahan` pola celana panjang.
- 🥾 **Boots** (*Leather/Iron*): `4x Bahan` pola sepasang sepatu.

### 4. Peleburan & Memasak (Furnace Smelting)
- 🪙 **Iron Ingot**: `Raw Iron` + `Bahan Bakar (Coal/Plank/Log)` (5 detik)
- 🍖 **Cooked Beef / Porkchop / Mutton**: `Daging Mentah` + `Bahan Bakar` (5 detik)
- 🍗 **Cooked Chicken**: `Raw Chicken` + `Bahan Bakar` (5 detik)

---

## 💻 Cara Install & Menjalankan Permainan

### Persyaratan Sistem
- **Node.js**: v18.0.0 atau lebih baru
- **npm**: v9.0.0 atau lebih baru
- Browser modern dengan dukungan WebGL & Web Audio API (Chrome, Edge, Firefox, Safari).

### 1. Menjalankan Game Client
```bash
# Clone repository
git clone https://github.com/Gavinnaufal/minecraft-lite.git
cd minecraft-lite

# Install dependencies
npm install

# Jalankan server lokal Vite
npm run dev
```
Buka browser di alamat `http://localhost:5173`.

### 2. Menjalankan Server Multiplayer (Opsional)
```bash
npx tsx server/server.ts
```
Server WebSocket multiplayer akan aktif di `ws://localhost:8080`.

### 3. Build untuk Production
```bash
npm run build
```
Hasil bundle minifikasi siap rilis akan disimpan di folder `dist/`.

---

## 🛠️ Struktur Direktori Proyek

```
minecraft-lite/
├── docs/                   # Dokumentasi Lengkap (GDD, PRD, Roadmap, Survival Mode GDD)
├── public/                 # Assets Tekstur 16x16 Pixel Art & Ikon
├── server/                 # Node.js WebSocket Multiplayer Server (server.ts)
├── src/
│   ├── audio/              # Web Audio API Procedural Synthesizer (AudioManager.ts)
│   ├── core/               # Game Engine, InputManager, Clock, Renderer, GameSettings
│   ├── crafting/           # Daftar Resep Crafting & Smelting (Recipes.ts)
│   ├── economy/            # Sistem Perdagangan (TradeTable.ts, VillagerTrading.ts)
│   ├── entities/           # Proyektil (Arrow.ts, Fireball.ts, ProjectileManager.ts)
│   ├── environment/        # Skybox, DayNightCycle, CloudManager
│   ├── interaction/        # BlockBreaker, BlockPlacer, BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, ItemRegistry, EquipmentSlots, ArmorSystem, FurnaceManager, ChestManager
│   ├── mobs/               # Mob Base, MobManager & State Machine AI
│   │   ├── ai/             # MobFoodRegistry.ts, BreedingManager.ts, StateMachine.ts
│   │   ├── hostile/        # Zombie, Skeleton, Spider, Enderman, Blaze, Ghast
│   │   ├── npc/            # Villager, IronGolem
│   │   └── passive/        # Cow, Pig, Chicken, Goat, Turtle
│   ├── multiplayer/        # WebSocket NetworkManager, ChatBox
│   ├── player/             # Player Physics, Controller, Collision, Raycaster
│   ├── save/               # IndexedDB SaveManager & StorageAdapter
│   ├── survival/           # SurvivalManager.ts, StatsTracker.ts (Mode Survival 15 Hari)
│   ├── ui/                 # MainMenu, HUD, InventoryScreen, EndGameScreen, FurnaceScreen, TradingScreen, DebugScreen, ToastSystem, PauseMenu, SettingsMenu
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), Terrain Generator
│   │   ├── dimension/      # DimensionManager, NetherWorldGenerator, PortalDetector
│   │   ├── ores/           # OreGenerator.ts
│   │   ├── structures/     # VillageGenerator, House Prefabs, VillageLoot, NetherFortressGenerator
│   │   └── terrain/        # NoiseGenerator, HeightMap, BiomeGenerator
│   ├── main.ts             # Application Entry Point & Game Loop
│   └── style.css           # Centralized Design Tokens & Forest Survival Theme
├── package.json
└── README.md
```

---

## 📄 Lisensi
Dibuat dengan ❤️ untuk Pembelajaran & Eksplorasi Game Engine Voxel Three.js + TypeScript.  
**MIT License.**
