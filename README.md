# ⛏️ Mini Minecraft (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini dirancang dengan standar arsitektur performa tinggi (*Web Worker Mesh Generation*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Audio Synthesizer*, dan *WebSocket Multiplayer Sync*).

---

## 🚀 Fitur Utama

- 🌍 **Procedural Voxel World Generation**: Simplex Noise terrain dengan bioma beragam (Plains, Forest, Desert, Mountains), struktur pohon, gua, perairan cair, serta air mengalir dinamis.
- 🎨 **16x16 Authentic Pixel-Art Textures**: Tekstur piksel 16x16 khusus untuk seluruh jenis blok (`grass`, `dirt`, `stone`, `sand`, `wood_log`, `plank`, `farmland`, `wheat_crop`, `chest`, `crafting_table`, `torch`, dll).
- ☁️ **3D Volumetric Voxel Cloud Layer**: Awan 3D berstruktur voxel kecil-kecil yang tersebar secara natural di langit (`Y = 120`), melayang perlahan ditiup angin, dan berganti warna dinamis (siang putih solid, senja oranye keemasan, malam biru lembut).
- ☀️ **Orbital Celestial System (Sun, Moon & Starfield)**: Matahari & Bulan 3D mengorbit secara real-time dengan 400 bintang berkilauan di langit malam serta sistem pencahayaan cinematic *ACES Filmic Tone Mapping*.
- 🌾 **Sistem Pertanian & Cangkul (Farming & Agriculture)**: Cangkul (*Wooden/Stone Hoe*) & penanaman benih (*Wheat Seeds*) serbaguna langsung di tanah/rumput dengan fitur *auto-tilling*, pertumbuhan tanaman gandum 4 tahap (*Wheat Crop*), panen *Wheat*, dan pembuatan *Bread* (+5 HP).
- 🤿 **3D Ocean Diving & Oxygen System**: Fitur berenang dan menyelam bawah air (*camera pitch diving*), filter transparan laut dalam (*blue aquatic tint & submerged deep fog*), serta bar gelembung nafas (*Oxygen Bubbles UI*) dan damage tenggelam (*drowning damage*).
- 📦 **Peti Penyimpanan (Storage Chest System)**: Blok peti 27-slot interaktif untuk menyimpan item berlebih secara permanen per koordinat lokasi dunia, lengkap dengan fitur Shift-click transfer instan.
- 💡 **Dynamic Held Torch Lighting**: Obor di tangan (*Held Torch*) memberikan pancaran cahaya api melayang (*flickering pointlight*) secara real-time saat menjelajahi gua atau malam hari.
- 🔍 **Target Block Highlight Box**: Indikator sorot blok target menggunakan kotak kawat transparan 3D (*translucent wireframe bounding box*).
- 🎯 **F3 Debug Screen Overlay**: Overlay statistik modern berefek *glassmorphism* menampilkan FPS, koordinat XYZ pemain, lokasi Chunk `[CX, CZ]`, arah mata angin (*Facing*), bioma aktif, dan jumlah mob aktif.
- 🔔 **Bottom-Right Toast Notification System**: Banner notifikasi mengambang di kanan bawah layar (`+1 Item`, `Wheat Planted!`, `World Saved!`), dilengkapi filter pintar agar penambangan tanah/batu massal tidak memenuhi layar.
- 🚶 **View Bobbing & Camera Oscillations**: Ayunan kamera ritmis saat berjalan serta efek guncangan kamera (*impact shake*) saat mendarat dari ketinggian atau terkena damage.
- 🔊 **Surface-Based Footstep SFX**: Sintesis suara langkah kaki dinamis yang membedakan pijakan permukaan rumput, batu, pasir, kayu, dan air.
- 💥 **Mob Hit Red Emissive Flash**: Kilatan warna merah terang (`0xff3333`) selama 0.15 detik pada mob saat menerima damage.
- 🐄 **Balanced Mob AI & Physics**: Sapi (pasif) dan Zombie (hostile) dengan batas lompatan realistis (maksimal 1 blok), *damage*, *knockback*, dan *drop loot* (Daging Sapi & Rotten Flesh).
- 💎 **Glassmorphic UI/UX & Custom SVG Icons**: Antarmuka modern berefek *backdrop blur*, bar ketahanan alat (*Tool Durability Bars*), indikator HP kritis (*Low HP Red Vignette*), serta ikon vektor SVG khusus.
- ⚡ **Web Worker Mesh Generation**: Multithreaded chunk meshing tanpa alokasi memori berlebih (*Zero-copy Transferable ArrayBuffers*).
- 🛠️ **System Crafting & Inventory**: Grid crafting 3x3, hotbar 9 slot, drag-and-drop UI, split stack / drop 1 item, serta tooltip nama item otomatis.
- 🎵 **Web Audio API Sound Synthesizer**: Suara hancur/pasang blok, langkah kaki (*footstep*), deru angin, jangkrik malam (*cricket chirps*), dan musik latar (*background music*) prosedural tanpa file media eksternal.
- 🌐 **Real-time WebSocket Multiplayer & Chat**: Multiplayer 2-player client sync untuk posisi avatar 3D, modifikasi blok, damage mob, serta kotak chat *in-game* (`[T]`).
- 💾 **IndexedDB Auto Save System**: Menyimpan posisi pemain, waktu dunia, isi inventory, dan perubahan blok secara otomatis ke penyimpanan browser.

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
| **O** | Membuka / Menutup Settings Menu (Render Distance & Volume) |
| **Escape (ESC)** | Membuka / Menutup Pause Menu / Menutup Peti & Inventaris |

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
