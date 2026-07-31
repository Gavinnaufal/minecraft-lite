# ⛏️ Mini Minecraft (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini dirancang dengan standar arsitektur performa tinggi (*Web Worker Mesh Generation*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Audio Synthesizer*, dan *WebSocket Multiplayer Sync*).

---

## 🚀 Fitur Utama

- 🌍 **Procedural Voxel World Generation**: Simplex Noise terrain dengan bioma beragam (Plains, Forest, Desert, Mountains), struktur pohon, gua, perairan cair, serta air mengalir dinamis.
- 🤿 **3D Ocean Diving & Oxygen System**: Fitur berenang dan menyelam bawah air (*camera pitch diving*), filter transparan laut dalam (*blue aquatic tint & deep fog*), serta bar gelembung nafas (*Oxygen Bubbles UI*) dan damage tenggelam (*drowning damage*).
- 📦 **Peti Penyimpanan (Storage Chest System)**: Blok peti 27-slot interaktif untuk menyimpan item berlebih secara permanen per koordinat lokasi dunia, lengkap dengan fitur Shift-click transfer instan.
- 🌾 **Sistem Pertanian & Cangkul (Farming & Agriculture)**: Cangkul (*Wooden/Stone Hoe*) untuk mencangkul rumput/tanah menjadi *Farmland*, menanam *Wheat Seeds*, memanen *Wheat*, dan membuat *Bread* (+5 HP).
- 💡 **Dynamic Held Torch Lighting**: Obor di tangan (*Held Torch*) memberikan pancaran cahaya api melayang (*flickering pointlight*) secara real-time saat menjelajahi gua atau malam hari.
- 💎 **Glassmorphic UI/UX & Custom SVG Icons**: Antarmuka modern berefek *backdrop blur*, lencana status *XYZ + Compass + FPS*, bar ketahanan alat (*Tool Durability Bars*), indikator HP kritis (*Low HP Red Vignette*), serta ikon vektor SVG khusus.
- ⚔️ **Combat & Mob AI System**: Mob Pasif (Sapi) dan Hostile (Zombie) dengan *damage*, *knockback*, *drop loot* (Daging Sapi & Rotten Flesh), serta sistem makan (*right-click to eat*) untuk memulihkan HP.
- ⚡ **Web Worker Mesh Generation**: Multithreaded chunk meshing tanpa alokasi memori berlebih (*Zero-copy Transferable ArrayBuffers*).
- 🛠️ **System Crafting & Inventory**: Grid crafting 3x3, hotbar 9 slot, drag-and-drop UI, split stack / drop 1 item, serta tooltip nama item otomatis.
- ☀️ **Dynamic Day/Night Cycle**: Siklus siang dan malam dengan perubahan warna langit (*Skybox*) dan pencahayaan matahari secara dinamis.
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
git clone https://github.com/user/minecraft-lite.git
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
├── docs/                   # Dokumentasi Arsitektur, GDD, PRD & Roadmap
├── server/                 # Node.js WebSocket Multiplayer Server
├── src/
│   ├── audio/              # Web Audio API Synthesizer (AudioManager.ts)
│   ├── core/               # Game Engine, Input, Clock, & Renderer
│   ├── environment/        # Skybox & DayNightCycle
│   ├── interaction/        # BlockBreaker & BlockPlacer
│   ├── inventory/          # Inventory, Hotbar, CraftingRecipes, & ItemRegistry
│   ├── mobs/               # Mob Base, Cow (Passive), Zombie (Hostile), & MobManager
│   ├── multiplayer/        # WebSocket NetworkManager
│   ├── player/             # Player Physics, Controller, Collision, & Camera
│   ├── save/               # IndexedDB SaveManager & StorageAdapter
│   ├── ui/                 # MainMenu, HUD, InventoryScreen, PauseMenu, & SettingsMenu
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
