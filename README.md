# ⛏️ Mini Minecraft (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini dirancang dengan standar arsitektur performa tinggi (*Web Worker Mesh Generation*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Audio Synthesizer*, dan *WebSocket Multiplayer Sync*).

---

## 🚀 Fitur Utama

- 🎨 **100% Authentic Minecraft UI/UX Design System**:
  - **Enlarged Inventory & Crafting UI (56px Slots)**: Grid inventaris dan crafting table 3x3 yang dibesarkan dengan slot 56px, ikon 3D 38px, font 15px bold, serta bingkai 3D Bevel abu-abu khas GUI Minecraft klasik (`#c6c6c6`).
  - **Contiguous GUI Hotbar**: Hotbar bawah 1 baris kontainer padat abu-abu (`#8b8b8b`) dilengkapi bingkai 3D seleksi putih berkilau (`#ffffff`).
  - **Main Menu & Options Screen**: Latar belakang tekstur *Minecraft Dirt Block (64x64 repeat)*, Judul 3D `MINECRAFT LITE`, *Splash Yellow Text* bergoyang (*"100% TS + Three.js Voxel Engine!"*), dan tombol-tombol batu 3D Minecraft (*Beveled Stone Buttons*).
  - **Minecraft Crosshair & F3 Overlay**: Formasi Crosshair `+` piksel resmi 16x16 dan overlay F3 2-kolom khas Minecraft.
- 🔥 **Authentic Cross-Mesh Torch & Lighting**: Obor di dunia dan di tangan menggunakan model silang X 2-plane dengan tekstur 16x16 `torch.png` yang otentik, lengkap dengan pancaran cahaya api berkerlip hangat (*Torch Light Manager*).
- 🛡️ **Smooth Non-Solid Physics Collision**: Blok non-padat (obor, tanaman gandum, air) bebas ditrobos tanpa membuat karakter atau mob tersangkut/glitch.
- 🌍 **Procedural Voxel World Generation**: Simplex Noise terrain dengan bioma beragam (Plains, Forest, Desert, Mountains), struktur pohon, gua, perairan cair, serta air mengalir dinamis.
- 🎨 **16x16 Authentic Pixel-Art Textures**: Tekstur piksel 16x16 khusus untuk seluruh jenis blok (`grass`, `dirt`, `stone`, `sand`, `wood_log`, `plank`, `farmland`, `wheat_crop`, `chest`, `crafting_table`, `torch`, dll).
- ☁️ **3D Volumetric Voxel Cloud Layer**: Awan 3D berstruktur voxel kecil-kecil yang tersebar secara natural di langit (`Y = 120`), melayang perlahan ditiup angin, dan berganti warna dinamis.
- ☀️ **Orbital Celestial System (Sun, Moon & Starfield)**: Matahari & Bulan 3D mengorbit secara real-time dengan 400 bintang berkilauan di langit malam.
- 🌾 **Sistem Pertanian & Cangkul (Farming & Agriculture)**: Cangkul (*Wooden/Stone Hoe*) & penanaman benih (*Wheat Seeds*) serbaguna langsung di tanah/rumput dengan fitur *auto-tilling*, pertumbuhan gandum 4 tahap, dan panen *Bread* (+5 HP).
- 🤿 **3D Ocean Diving & Oxygen System**: Fitur berenang dan menyelam bawah air (*camera pitch diving*), filter transparan laut dalam (*blue aquatic tint*), serta bar gelembung nafas (*Oxygen Bubbles UI*).
- 📦 **Peti Penyimpanan (Storage Chest System)**: Blok peti 27-slot interaktif untuk menyimpan item berlebih secara permanen per koordinat lokasi dunia.
- 💡 **Dynamic Held Torch Lighting**: Obor di tangan (*Held Torch*) memberikan pancaran cahaya api melayang (*flickering pointlight*) secara real-time saat menjelajahi gua atau malam hari.
- 🎯 **F3 Debug Screen Overlay**: Overlay statistik modern berefek *glassmorphism* menampilkan FPS, koordinat XYZ pemain, lokasi Chunk `[CX, CZ]`, arah mata angin (*Facing*), bioma aktif, dan jumlah mob aktif.
- 🔔 **Toast Notification System**: Banner notifikasi mengambang di kanan bawah layar (`+1 Item`, `Wheat Planted!`, `World Saved!`), dilengkapi filter pintar penambangan massal.
- 💥 **Mob Hit Visual Flash & Knockback**: Kilatan warna merah terang (`0xff3333`) pada mob saat menerima damage serta efek terpental (*knockback*).
- ⚡ **Web Worker Mesh Generation**: Multithreaded chunk meshing tanpa alokasi memori berlebih (*Zero-copy Transferable ArrayBuffers*).
- 🛠️ **System Crafting & Inventory**: Grid crafting 3x3, hotbar 9 slot, drag-and-drop UI, split stack / drop 1 item, serta tooltip nama item otomatis.
- 🎵 **Web Audio API Sound Synthesizer**: Suara hancur/pasang blok, langkah kaki (*footstep*), deru angin, jangkrik malam (*cricket chirps*), dan musik latar (*background music*) prosedural.
- 🌐 **Real-time WebSocket Multiplayer & Chat**: Multiplayer 2-player client sync untuk posisi avatar 3D, modifikasi blok, damage mob, serta kotak chat *in-game* (`[T]`).
- 💾 **IndexedDB Auto Save System**: Menyimpan posisi pemain, waktu dunia, isi inventory, dan perubahan blok secara otomatis.

---

## 🎮 Kontrol Permainan

| Tombol | Fungsi |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke sudut pandang kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke atas permukaan air (*Swim Up*) |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar laut (*Dive Down*) |
| **Klik Kiri Mouse** | Memecahkan / Menghancurkan Blok / Menyerang Mob |
| **Klik Kanan Mouse** | Memasang Blok / Membuka Peti / Mencangkul / Menanam Seeds / Memakan Makanan |
| **Scroll Mouse / Angka 1-9** | Mengganti Slot Active Hotbar |
| **E** | Membuka / Menutup Layar Inventory & Crafting Grid (3x3) |
| **F3** | Membuka / Menutup Layar Debug Overlay (FPS, XYZ, Chunk, Bioma) |
| **T** | Membuka Kotak Chat Multiplayer (*In-Game Chat Box*) |
| **Escape (ESC)** | Membuka / Menutup Pause Menu / Menutup Peti & Inventaris |

---

## 📜 Panduan Resep Crafting Item (Item Crafting Recipes)

Tekan tombol **`E`** di dalam game untuk membuka layar Inventory & Crafting Grid (2x2 di inventaris atau 3x3 via Crafting Table). Berikut adalah tabel lengkap kombinasi item yang bisa dibuat (*create*):

### 1. Material Dasar & Komponen

| Hasil Crafting | Jumlah | Kombinasi Pola Grid (Crafting Pattern) | Bahan Yang Dibutuhkan |
|---|---|---|---|
| 🪵 **Plank** (Papan Kayu) | 4x | `[ Wood Log ]` | 1x Wood Log |
| 🥢 **Stick** (Stik Kayu) | 4x | `[ Plank ]`<br>`[ Plank ]` | 2x Planks (Vertikal) |
| 🛠️ **Crafting Table** | 1x | `[ Plank ][ Plank ]`<br>`[ Plank ][ Plank ]` | 4x Planks (Grid 2x2) |
| 📦 **Chest** (Peti) | 1x | `[ Plank ][ Plank ][ Plank ]`<br>`[ Plank ][   -   ][ Plank ]`<br>`[ Plank ][ Plank ][ Plank ]` | 8x Planks (Bingkai 3x3) |
| 💡 **Torch** (Obor) | 4x | `[ Plank / Wood Log ]`<br>`[ Stick ]` | 1x Plank/Log + 1x Stick |
| 🥪 **Sandstone** | 1x | `[ Sand ][ Sand ]`<br>`[ Sand ][ Sand ]` | 4x Sand (Grid 2x2) |
| 🍞 **Bread** (Roti) | 1x | `[ Wheat ][ Wheat ][ Wheat ]` | 3x Wheat (Horizontal) |

---

### 2. Peralatan & Senjata Kayu (Wooden Tools)

| Hasil Crafting | Kombinasi Pola Grid 3x3 | Bahan Yang Dibutuhkan |
|---|---|---|
| ⛏️ **Wooden Pickaxe** | `[ Plank ][ Plank ][ Plank ]`<br>`[   -   ][ Stick ][   -   ]`<br>`[   -   ][ Stick ][   -   ]` | 3x Planks + 2x Sticks |
| 🗡️ **Wooden Sword** | `[ Plank ]`<br>`[ Plank ]`<br>`[ Stick ]` | 2x Planks + 1x Stick |
| 🪓 **Wooden Axe** | `[ Plank ][ Plank ]`<br>`[ Plank ][ Stick ]`<br>`[   -   ][ Stick ]` | 3x Planks + 2x Sticks |
| 🧹 **Wooden Shovel** | `[ Plank ]`<br>`[ Stick ]`<br>`[ Stick ]` | 1x Plank + 2x Sticks |
| 🧑‍🌾 **Wooden Hoe** | `[ Plank ][ Plank ]`<br>`[   -   ][ Stick ]`<br>`[   -   ][ Stick ]` | 2x Planks + 2x Sticks |

---

### 3. Peralatan & Senjata Batu (Stone Tools)

| Hasil Crafting | Kombinasi Pola Grid 3x3 | Bahan Yang Dibutuhkan |
|---|---|---|
| ⛏️ **Stone Pickaxe** | `[ Stone ][ Stone ][ Stone ]`<br>`[   -   ][ Stick ][   -   ]`<br>`[   -   ][ Stick ][   -   ]` | 3x Stone + 2x Sticks |
| 🗡️ **Stone Sword** | `[ Stone ]`<br>`[ Stone ]`<br>`[ Stick ]` | 2x Stone + 1x Stick |
| 🪓 **Stone Axe** | `[ Stone ][ Stone ]`<br>`[ Stone ][ Stick ]`<br>`[   -   ][ Stick ]` | 3x Stone + 2x Sticks |
| 🧹 **Stone Shovel** | `[ Stone ]`<br>`[ Stick ]`<br>`[ Stick ]` | 1x Stone + 2x Sticks |
| 🧑‍🌾 **Stone Hoe** | `[ Stone ][ Stone ]`<br>`[   -   ][ Stick ]`<br>`[   -   ][ Stick ]` | 2x Stone + 2x Sticks |

---

## 💻 Cara Install & Menjalankan Game Secara Lokal

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- npm (v9 atau lebih baru)

### 1. Menjalankan Client Game
```bash
# Clone repository
git clone https://github.com/Gavinnaufal/minecraft-lite.git
cd minecraft-lite

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```
Buka browser di `http://localhost:5173`.

### 2. Menjalankan Server Multiplayer WebSocket (Opsional)
```bash
# Buka terminal kedua di root project
npx tsx server/server.ts
```
Server multiplayer akan berjalan di `ws://localhost:8080`.

---

## 📦 Build for Production

```bash
npm run build
```
Hasil kompilasi produksi siap di-deploy terletak di folder `dist/`.

---

## 🛠️ Struktur Proyek

```
minecraft-lite/
├── docs/                   # Dokumentasi Arsitektur, GDD, PRD, Roadmap & Taskboard
├── public/                 # Assets (Tekstur 16x16 Pixel Art & Icons)
├── server/                 # Node.js WebSocket Multiplayer Server
├── src/
│   ├── audio/              # Web Audio API Synthesizer (AudioManager.ts)
│   ├── core/               # Game Engine, Input, Clock, & Renderer
│   ├── environment/        # Skybox, DayNightCycle, & CloudManager (3D Clouds, Sun/Moon/Stars)
│   ├── interaction/        # BlockBreaker, BlockPlacer, & BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, CraftingRecipes, & ItemRegistry
│   ├── mobs/               # Mob Base, Cow (Passive), Zombie (Hostile), & MobManager
│   ├── multiplayer/        # WebSocket NetworkManager
│   ├── player/             # Player Physics, Controller, Collision, & Raycaster
│   ├── save/               # IndexedDB SaveManager & StorageAdapter
│   ├── ui/                 # MainMenu, HUD, InventoryScreen, DebugScreen, ToastSystem, PauseMenu, & SettingsMenu
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), & Terrain Generator
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
