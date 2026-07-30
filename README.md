# ⛏️ Mini Minecraft (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox voxel 3D berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini dirancang dengan standar arsitektur performa tinggi (*Web Worker Mesh Generation*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Audio Synthesizer*, dan *WebSocket Multiplayer Sync*).

---

## 🚀 Fitur Utama

- 🌍 **Procedural Voxel World Generation**: Simplex Noise terrain dengan bioma beragam (Plains, Forest, Desert, Mountains), struktur pohon, gua, serta perairan cair.
- ⚡ **Web Worker Mesh Generation**: Multithreaded chunk meshing tanpa alokasi memori berlebih (*Zero-copy Transferable ArrayBuffers*).
- 🛠️ **System Crafting & Inventory**: Grid crafting 3x3, hotbar 9 slot, drag-and-drop UI, serta tooltip nama item otomatis.
- ☀️ **Dynamic Day/Night Cycle**: Siklus siang dan malam dengan perubahan warna langit (*Skybox*) dan pencahayaan matahari secara dinamis.
- 👾 **Mob AI & Terrain Collision**: Mob Pasif (Sapi) dan Mob Hostile (Zombie) dengan kecerdasan buatan (*AI Pathfinding / Wandering*) dan fisik gravitasi/obstacle jumping.
- 🎵 **Web Audio API Sound Synthesizer**: Suara hancur/pasang blok, langkah kaki (*footstep*), deru angin, jangkrik malam (*cricket chirps*), dan musik latar (*background music*) prosedural tanpa file media eksternal.
- 🌐 **Real-time WebSocket Multiplayer**: Multiplayer 2-player client sync untuk posisi avatar 3D, modifikasi blok, dan damage mob secara realtime.
- 💾 **IndexedDB Auto Save System**: Menyimpan posisi pemain, waktu dunia, isi inventory, dan perubahan blok secara otomatis ke penyimpanan browser.

---

## 🎮 Kontrol Permainan

| Tombol | Fungsi |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) |
| **Spacebar** | Melompat (*Jump*) |
| **Shift** | Berjalan Pelan (*Sneak*) |
| **Klik Kiri Mouse** | Memecahkan / Menghancurkan Blok |
| **Klik Kanan Mouse** | Memasang / Meletakkan Blok di Hotbar |
| **Scroll Mouse / Angka 1-9** | Mengganti Slot Active Hotbar |
| **E** | Membuka / Menutup Layar Inventory & Crafting |
| **O** | Membuka / Menutup Settings Menu (Render Distance & Volume) |
| **Escape (ESC)** | Membuka / Menutup Pause Menu |

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
