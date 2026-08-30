# 🌲 Mini Minecraft 3.0: Forest Survival & Defense Edition (Voxel Sandbox Game)

Mini Minecraft adalah game sandbox & survival voxel 3D berkinerja tinggi yang dibangun dari nol berbasis **Three.js**, **TypeScript**, dan **Vite**. Project ini menerapkan arsitektur *game engine* modern dengan generasi *mesh* multithreaded (*Web Worker Zero-Copy Transferable ArrayBuffers*), *Frustum Culling*, *Mob Object Pooling*, *Procedural Web Audio API Synthesizer*, *Combat & Armor Mitigation System*, *Base Defense & Trap System*, *Procedural Structure & Biome Generation*, *WebSocket Multiplayer*, serta mode permainan **15-Day Forest Survival** berbalut antarmuka bertema **Rustic Wood & Parchment**.

🏆 **Status Proyek: 100% Selesai & Lolos Pengujian Production Build (`tsc && vite build` — 0 Errors)**.

---

## 🌲 Mode Permainan Utama: 15-Day Forest Survival Mode

Pemain terdampar di tengah hutan lebat yang liar dan berbahaya. Misimu adalah **bertahan hidup selama 15 Hari** sampai tim penyelamat dan bala bantuan tiba.

```
Pilih Kesulitan → Mulai Hari 1 (06:00 Pagi) → Kumpulkan Sumber Daya Siang Hari
  → Bangun Markas / Pasang Pagar & Trap → Tanam & Olah Makanan → Bertahan dari Serbuan Monster Malam
  → Eskalasi Kesulitan Meningkat Tiap Hari → Capai Fajar Hari ke-15 → 🎉 MENANG & PULANG!
  
  (Jika Nyawa Habis di Tengah Jalan → ☠️ GAME OVER & Layar Ringkasan Statistik)
```

### ⚔️ 1. Tingkat Kesulitan Permainan (Difficulty Settings)
Saat memulai dunia baru dari Menu Utama, pemain dapat memilih 3 tingkat tantangan:
- 🌿 **Santai (Casual)**: Nyawa tak terbatas (`∞`). Laju lapar lambat ($0.5\times$). Kematian tidak menghapus dunia.
- 🛡️ **Normal (Standard)**: Pemain memiliki **3 Nyawa**. Laju lapar normal ($1.0\times$). Monster malam agresif dan bertambah kuat.
- ☠️ **Susah (Hardcore / Permadeath)**: Pemain hanya memiliki **1 Nyawa**. Laju lapar cepat ($1.5\times$). Kematian memicu *Game Over* seketika dan mereset dunia permainan.

### ⏰ 2. Siklus Waktu Terpadu (Day/Night Cycle)
- Durasi 1 hari penuh = **10 menit** (600 detik nyata).
- **Sinkronisasi Otomatis**: Setiap memulai game baru (*New Game*) atau mereset game setelah *Game Over*, waktu selalu dimulai *fresh* dari **Hari 1 • Pukul 06:00 Pagi (Fajar Cerah)**.

### 📜 3. Prolog Narasi & Layar Akhir Permainan (End Game Screen)
- 📖 **Prolog Catatan Survival**: Dialog pembuka saat menginjakkan kaki pertama kali di hutan.
- 🏆 **Layar Kemenangan (Victory Screen)**: Terpicu otomatis di fajar Hari ke-15 dengan cerita penyelamatan epik.
- ☠️ **Layar Kekalahan (Defeat Screen)**: Terpicu saat nyawa habis, menampilkan sebab gugur dan kata penutup.
- 🔄 **Tombol Kembali ke Menu Utama**: Mereset seluruh progres, menyelaraskan waktu ke jam 06:00 pagi, dan siap untuk petualangan berikutnya.

### 📊 4. Pelacak Statistik Lengkap (`StatsTracker.ts`)
Melacak performa permainan secara real-time dan menampilkannya di Layar Akhir:
1. 📅 **Hari Bertahan**: Total hari yang berhasil dilalui (/ 15 Hari).
2. 🛡️ **Tingkat Kesulitan**: Santai / Normal / Susah.
3. ⏱️ **Waktu Bermain**: Durasi nyata permainan (Jam, Menit, Detik).
4. ⚔️ **Monster Dikalahkan**: Total musuh yang ditumbangkan.
5. ⛏️ **Blok Dihancurkan**: Jumlah blok yang ditambang/dipecahkan.
6. 🧱 **Blok Dipasang**: Jumlah blok yang dibangun.
7. 🛠️ **Item Dibuat**: Total item yang di-craft di Meja Crafting.
8. 🍖 **Makanan Dimakan**: Porsi makanan yang dikonsumsi.
9. 🏃 **Jarak Ditempuh**: Akumulasi jarak berjalan kaki dalam satuan meter (blok).

---

## 🛡️ Sistem Pertahanan Markas (Base Camp Defense & Fortification)

Untuk menahan gempuran monster malam hari yang semakin intensif, pemain dibekali elemen pertahanan benteng:

### 🪵 1. Pagar Kayu (`fence` — ID 27)
- **Tinggi Collision Khusus ($1.5\text{ Blok}$)**: Bounding box pagar dihitung hingga ketinggian $y + 1.5$. Karena tinggi lompatan normal pemain dan mob darat adalah $\sim 1.25\text{ blok}$, Zombie, Skeleton, Penduduk Desa, dan Hewan Ternak **tidak bisa melompati atau menerobos pagar 1 lapis**.
- **Jarak Pandang & Tembus Serangan**: Garis pandang bidikan (*Raycast Crosshair*) tidak terhalang pagar, sehingga pemain **bisa menyerang monster di luar pagar dengan pedang atau panah secara aman**.
- **Interaksi Panjat Laba-Laba (*Spider Wall-Climbing*)**: Mengikuti mekanik asli Minecraft, Laba-laba (*Spider*) dapat memanjat blok solid secara vertikal, sehingga pemain disarankan memasang kanopi/bibir blok di atas pagar agar laba-laba tidak memanjat masuk.
- **Resep Crafting**: `1x Stick` + `1x Plank` + `1x Stick` vertikal $\rightarrow$ **`3x Fence`**.

### ⚔️ 2. Perangkap Duri Baja (`spike_trap` — ID 28)
- **Damage Periodik Otomatis**: Setiap monster agresif (Zombie, Skeleton, Spider, Enderman) yang berdiri atau melangkah di atas blok *Spike Trap* akan menerima **$2.0\text{ HP}$ damage per detik**.
- **Efek Partikel & Audio**: Memicu suara hantaman duri metalik dan partikel serpihan baja abu-abu kebiruan saat monster terinjak trap.
- **Proteksi Total untuk Pemain & Hewan**: Pemain dan hewan ternak yang berjalan di atas perangkap duri **100% aman dan tidak menerima damage sama sekali**, memungkinkan pemain bebas menata barisan trap di sekeliling pintu markas.
- **Resep Crafting**: `4x Stick` + `2x Stone` $\rightarrow$ **`2x Spike Trap`**.

---

## 🍖 Sistem Kebutuhan Hidup & Medis (Hunger & Health System)

### 🍗 1. Bilah Lapar (Hunger Bar)
- Terletak simetris di sebelah kanan bilah Hotbar, dirender dengan **10 ikon paha ayam (Drumstick SVG)** beresolusi tajam.
- Kapasitas maksimal: **20 Poin Lapar**.
- **Laju Pengurangan**:
  - Posisi Diam (*Idle*): Berkurang 1 poin setiap $\sim 40$ detik.
  - Berjalan Normal: $1.4\times$ lebih cepat.
  - Berlari Sprint (*Shift*): $2.0\times$ lebih cepat.
- **Efek Status Lapar**:
  - ☠️ **Kelaparan (Hunger = 0)**: Pemain menerima damage $-1$ HP setiap $3.5$ detik disertai kilatan merah dan notifikasi peringatan.
  - 💖 **Regenerasi Alami (Hunger $\ge 18$)**: Jika darah belum penuh, pemain memulihkan $+1$ HP setiap $4.0$ detik dengan mengonsumsi sedikit energi lapar.

### 🥗 2. Nilai Nutrisi Makanan
Pemain dapat memakan makanan dengan memegang item di Hotbar lalu melakukan **Klik Kanan**:

| Makanan | Tipe | Nilai Lapar | Deskripsi |
|---|---|:---:|---|
| 🥩 **Cooked Beef (Steak)** | Matang | **$+11$** | Daging sapi bakar lezat dan mengenyangkan. |
| 🍖 **Cooked Porkchop** | Matang | **$+11$** | Daging babi bakar nutrisi tinggi. |
| 🍗 **Cooked Chicken** | Matang | **$+10$** | Daging ayam panggang. |
| 🥩 **Cooked Mutton** | Matang | **$+10$** | Daging kambing panggang. |
| 🍞 **Bread (Roti)** | Olahan | **$+7$** | Makanan pokok olahan dari 3x Gandum. |
| 🥩 **Raw Beef** | Mentah | **$+4$** | Daging sapi mentah hasil berburu. |
| 🍖 **Raw Porkchop** | Mentah | **$+4$** | Daging babi mentah hasil berburu. |
| 🍗 **Raw Chicken** | Mentah | **$+3$** | Daging ayam mentah. |
| 🥩 **Raw Mutton** | Mentah | **$+3$** | Daging kambing mentah. |
| 🌾 **Wheat (Gandum Mentah)** | Tanaman | **$+2$** | Camilan gandum darurat yang bisa dimakan langsung. |
| 🧟 **Rotten Flesh** | Monster Drop | **$+3$** | Daging busuk dari Zombie untuk situasi darurat. |

### 🩹 3. Item Medis Darurat: Perban (Bandage / Medkit)
Item penyembuh instan yang murni independen dari sistem makanan:
- **Khasiat**: Menyembuhkan **$+6$ HP Instan** (setara 3 simbol hati penuh) seketika saat digunakan.
- **Mekanik Penggunaan**: Pegang Bandage di Hotbar lalu **Klik Kanan**.
- **Cooldown Proteksi**: **5.0 Detik** antar penggunaan untuk mencegah eksploitasi spam heal.
- **Proteksi HP Penuh**: Tidak dapat digunakan saat darah sudah maksimal ($20/20$ HP), mencegah pemborosan item.
- **Bahan & Cara Mendapatkan**:
  - **Daun (`Leaves`)**: Hancurkan blok daun pohon di hutan.
  - **Benang (`String`)**: Kalahkan laba-laba (*Spider*) di malam hari.
  - **Resep Crafting**: `3x Leaves` + `1x String` $\rightarrow$ **`2x Bandage`** (mendukung 12 variasi susunan horizontal/vertikal di grid crafting).

---

## 🌾 Sistem Pertanian & Panen Bertahap (Multi-Stage Farming System)

Aktivitas bertani memungkinkan pemain memproduksi bahan makanan berkelanjutan di dekat markas:
1. **Membajak Tanah (*Tilling*)**: Pegang Cangkul (*Hoe*), lalu **Klik Kanan** pada blok Rumput (*Grass*) atau Tanah (*Dirt*) $\rightarrow$ Berubah menjadi tanah gembur (**Farmland - ID 13**).
2. **Menanam Benih (*Planting*)**: Pegang Benih Gandum (*Wheat Seeds*), lalu **Klik Kanan** di atas Farmland $\rightarrow$ Tertanam tunas gandum (**Wheat Sprout - ID 25**).
3. **Pertumbuhan 3 Tahap Dinamis (*Growth Stages*)**:
   - 🌱 **Tahap 1 — Tunas Muda (`wheat_sprout` ID 25)**: Ketinggian $0.40$ blok.
   - 🌿 **Tahap 2 — Batang Hijau (`wheat_growing` ID 26)**: Ketinggian $0.65$ blok.
   - 🌾 **Tahap 3 — Gandum Emas Matang (`wheat_crop` ID 14)**: Ketinggian $0.85$ blok, bulir keemasan siap panen.
4. **Pemupukan Cepat (*Fertilization*)**: **Klik Kanan** tanaman muda dengan Benih (`wheat_seeds`) atau Tulang (`bone`) untuk mempercepat tanaman langsung naik ke tahap berikutnya seketika!
5. **Panen Gandum (*Harvesting*)**:
   - **Tanaman Muda (Tahap 1/2)**: Menjatuhkan **1x Wheat Seeds** (mengembalikan benih, belum menghasilkan gandum).
   - **Tanaman Matang (Tahap 3)**:
     - **Klik Kiri (Pukul)** / **Klik Kanan (*Quick Harvest*)**: Menjatuhkan **1x Wheat** + **1–3x Wheat Seeds**.
     - **Auto-Replant**: Panen cepat dengan klik kanan sambil memegang benih otomatis langsung menanam ulang tunas baru!
6. **Konsumsi & Olahan Gandum**:
   - 🌾 **Gandum Mentah**: Dapat dimakan langsung (**+2 Lapar**).
   - 🍞 **Roti (`Bread`)**: Olah 3x Gandum secara horizontal di Meja Crafting (**+7 Lapar**).

---

## 👹 Ekologi Mob, Kecerdasan Buatan (AI) & Balancing

### 👾 1. Monster Agresif Malam Hari & Nether (Hostile Mobs)
- 🧟 **Zombie**: Menyerang jarak dekat, terbakar di bawah sinar matahari langsung saat siang hari.
- 🏹 **Skeleton**: AI penembak panah jarak jauh dengan balistik proyektil akurat, terbakar di bawah sinar matahari langsung saat siang hari. Menjatuhkan Tulang & Panah.
- 🕷️ **Spider**: Memiliki model 3D berkaki 8 dengan animasi merayap artikulasi. Berstatus **netral di siang hari** dan **sangat agresif di malam hari** dengan serangan lompat $5.8\text{m}$ serta kemampuan memanjat dinding (*Wall-Climbing*).
- 👁️ **Enderman**:
  - Tinggi $2.9\text{m}$ dengan hitbox pertarungan presisi.
  - **Mekanik Tatapan Mata (*0.8s Gaze Check*)**: Baru menjadi marah (*Provoked*) jika pemain menatap langsung ke arah matanya dengan Pointer Lock aktif selama 0.8 detik.
  - **Keseimbangan Teleportasi (*Combat Balance*)**: Dilengkapi jeda *cooldown* minimal **3.5 detik** dan jendela jeda **1.8 detik pasca menerima serangan** (*Recent Hit Window*), memungkinkan pemain mendaratkan kombo 2–3 pukulan beruntun sebelum Enderman melakukan teleportasi reposisi taktis.
  - **Kelemahan Air**: Terbakar/terluka saat menyentuh air dan otomatis teleport menjauh.
  - Menjatuhkan **Ender Pearl** saat dikalahkan.
- 🔥 **Blaze**: Mob penghuni Nether Fortress yang melayang dan menembakkan rentetan bola api proyektil.
- 👻 **Ghast**: Raksasa terbang berukuran $4\times 4$ blok di langit Nether yang menembakkan bola api ledakan.

### 🛡️ 2. NPC & Pelindung Desa (Neutral / Friendly)
- 👨‍🌾 **Villager (Penduduk Desa)**: Menghuni desa awal (*Starter Village*) pada grid `(0,0)`, berjalan-jalan di jalur desa dan masuk ke dalam rumah.
- 🤖 **Iron Golem**: Penjaga tangguh dengan **100 HP**. Membantu pemain membasmi monster hostile dengan melontarkan mereka tinggi ke udara.

### 🐮 3. Hewan Jinak (Passive Animals)
- **Sapi, Babi, Ayam, Kambing, Kura-kura**: Menghasilkan daging, bulu, kulit, dan dapat dikembangbiakkan (*Breeding*) menggunakan pakan favorit (Gandum, Benih, Rumput Laut).

### 📈 4. Kurva Eskalasi Malam (Hari 1 s/d 15)
- 🟢 **Hari 1–5 (Fase Awal)**: Kuota monster 5 ekor, spawn santai, HP normal (20 HP).
- 🟡 **Hari 6–10 (Fase Menengah)**: Kuota monster 11 ekor, spawn lebih sering, monster lebih alot ($+7$ HP ekstra).
- 🔴 **Hari 11–15 (Fase Puncak Survival)**: Kuota monster 18 ekor, spawn sangat intensif, monster memiliki darah tebal (hingga $+15$ HP ekstra). Memaksa pemain memasang pagar dan jebakan duri di sekeliling markas!

---

## 🌋 Dimensi Nether & Benteng Nether Fortress

Pemain dapat menjelajah ke dimensi Nether yang penuh bahaya:
1. **Portal Nether**: Bangun bingkai Obsidian $4\times 5$ lalu aktifkan portal ungu bercahaya.
2. **Lingkungan Nether**: Dikelilingi blok Netherrack, Glowstone yang berpendar, Soul Sand yang memperlambat langkah, dan lautan Lava pijar.
3. **Nether Fortress**: Struktur benteng prosedural berbahan *Nether Brick* yang dijaga oleh monster Blaze dan peti harta karun berharga.

---

## 🎨 Tema Visual UI/UX "Hutan Survival" (Rustic Wood & Parchment Theme)

Seluruh antarmuka grafis (GUI) didesain konsisten dengan tema alam dan petualangan:
- 🪵 **Panel Kayu Tua Rustic (`--theme-panel-bg`)**: Panel jendela bertekstur kayu gelap yang hangat.
- 📜 **Kotak Catatan Perkamen (`--theme-parchment-bg-dark`)**: Area teks berlatar kertas usang dengan tipografi kontras tinggi yang mudah dibaca.
- 🍃 **Aksen Hijau Daun & Emas Hangat (`--theme-accent-green`, `--theme-accent-gold`)**: Tombol aksi primer dan highlight item terpilih dengan efek *amber glow*.
- 🍞 **Slot Inset Kayu Gelap (`--theme-slot-bg`)**: Tampilan slot inventaris dan hotbar yang menyatu dengan estetika kayu.
- 💬 **Sistem Toast Notifikasi (`ToastSystem.ts`)**: Notifikasi mengambang dengan tema warna kategori (Sukses, Peringatan, Bahaya, Info).

---

## 📱 Optimalisasi Khusus Mobile & Tablet Touchscreen

Game ini sepenuhnya responsif dan nyaman dimainkan di ponsel maupun tablet:
- 📱 **Skala Responsif Tablet**: Ukuran D-Pad virtual, tombol aksi (Lompat, Serang, Pasang, Tas), dan zona gerak kamera menyesuaikan layar besar secara otomatis.
- 👆 **Sistem Tap-to-Select Aman**: Mengetuk item sumber lalu mengetuk slot tujuan untuk memindahkan item tanpa risiko *item stuck*.
- ⏱️ **Modal Pemisah Stack (Stack Splitter)**: Sentuh dan tahan (*long press* $\ge 380\text{ms}$) pada item untuk membuka slider pembagi jumlah item (1 Saja, Setengah, Semua, +/-).
- ☰ **Tombol Menu Cepat (Mobile Pause Button)**: Akses mudah ke Pause Menu, Simpan Dunia, dan Pengaturan Game langsung dari tombol layar sentuh.
- 📐 **HUD Responsif Terpadu**: Koordinat XYZ digeser aman dari tombol Menu, bilah Health, Hunger, Oxygen, dan Armor tersusun proporsional.
- 🛡️ **Pencegah Player Nyangkut (Spawn Safeguard)**: Elevasi spawn dihitung $+0.6$ blok di atas permukaan bukit untuk mencegah pemain menembus tanah.

---

## 📜 Panduan Resep Crafting & Smelting (45+ Resep Lengkap)

Gunakan **Crafting Table** (Grid 3x3), Grid 2x2 Inventaris, atau **Furnace** untuk memproses material:

### 1. Blok Dasar, Pertahanan & Medis
- 🪵 **Plank** (4x): `1x Wood Log`
- 🥢 **Stick** (4x): `2x Planks` vertikal
- 🛠️ **Crafting Table** (1x): `4x Planks` (Grid 2x2)
- 📦 **Chest** (1x): `8x Planks` melingkar
- 🔥 **Furnace** (1x): `8x Stone` melingkar
- 💡 **Torch** (4x): `1x Coal` / `1x Wood Log` / `1x Plank` di atas `1x Stick`
- 🧱 **Sandstone** (1x): `4x Sand` (Grid 2x2)
- 💡 **Glowstone** (1x): `4x Netherrack` (Grid 2x2)
- 🪵 **Pagar Kayu (Fence)** (3x): `1x Stick` + `1x Plank` + `1x Stick` (vertikal/horizontal)
- ⚔️ **Perangkap Duri (Spike Trap)** (2x): `4x Stick` + `2x Stone`
- 🍞 **Bread** (1x): `3x Wheat` horizontal
- 🩹 **Bandage** (2x): `3x Leaves` + `1x String` (12 variasi orientasi & offset)

### 2. Alat & Senjata (Tools & Weapons)
- ⛏️ **Pickaxe** (*Wood/Stone/Iron*): `3x Bahan` horizontal di atas + `2x Sticks` vertikal di tengah.
- 🗡️ **Sword** (*Wood/Stone/Iron*): `2x Bahan` vertikal di atas + `1x Stick` di bawah.
- 🪓 **Axe** (*Wood/Stone/Iron*): `3x Bahan` pola sudut + `2x Sticks` vertikal (mendukung hadap kanan & cermin kiri).
- 🧹 **Shovel** (*Wood/Stone/Iron*): `1x Bahan` di atas + `2x Sticks` vertikal.
- 🧑‍🌾 **Hoe** (*Wood/Stone/Iron*): `2x Bahan` sudut atas (mendukung hadap kanan & cermin kiri) + `2x Sticks` vertikal.
- 🏹 **Bow** (1x): `3x Sticks` melengkung + `3x Strings`.
- 🏹 **Arrow** (4x): `1x Stone` atas + `1x Stick` tengah + `1x Feather` bawah.

### 3. Set Zirah (Armor Sets & Mitigation)
- 🪖 **Helmet** (*Leather/Iron*): `5x Bahan` pola helm terbalik.
- 👕 **Chestplate** (*Leather/Iron*): `8x Bahan` mengisi seluruh slot kecuali tengah atas.
- 👖 **Leggings** (*Leather/Iron*): `7x Bahan` pola celana panjang.
- 🥾 **Boots** (*Leather/Iron*): `4x Bahan` pola sepasang sepatu.

### 4. Peleburan & Memasak (Furnace Smelting)
- 🪙 **Iron Ingot**: `Raw Iron` + `Bahan Bakar (Coal/Plank/Log)` (5 detik)
- 🍖 **Cooked Beef / Porkchop / Mutton**: `Daging Mentah` + `Bahan Bakar` (5 detik)
- 🍗 **Cooked Chicken**: `Raw Chicken` + `Bahan Bakar` (5 detik)

---

## 🎮 Panduan Kontrol Lengkap

### Kontrol PC / Desktop
| Tombol | Fungsi Utama |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke permukaan air |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar air |
| **Klik Kiri Mouse** | Menghancurkan Blok / Memanen Gandum / Menyerang Musuh |
| **Klik Kanan Mouse** | Memasang Blok / Memakan Makanan / Menggunakan Perban / Membuka Peti & Tungku / Mencangkul / Menanam / Panen Cepat |
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
| **Tombol Pasang (🧱)** | Memasang blok / Menggunakan item / Berinteraksi |
| **Tombol Tas (🎒)** | Membuka / Menutup panel inventaris & crafting |
| **Tombol Menu (☰)** | Membuka Pause Menu & Pengaturan Permainan |
| **Tap Slot Inventaris** | Memilih item dan memindahkannya ke slot lain (*Tap-to-Select*) |
| **Tahan Slot Inventaris** | Membuka popup pemisah tumpukan (*Stack Splitter*) |

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

## 🛠️ Perintah Console untuk Pengujian (Debug Helpers)

Tekan **`F12`** di browser untuk membuka Developer Tools Console:
- `giveItem(itemId, count)`: Menambahkan item apa pun langsung ke inventaris/hotbar (contoh: `giveItem('fence', 32)`, `giveItem('spike_trap', 16)`).
- `spawnMob(type)`: Memunculkan mob di depan pemain (`'zombie'`, `'skeleton'`, `'spider'`, `'enderman'`, `'villager'`, `'iron_golem'`, `'cow'`, `'pig'`, `'chicken'`).
- `setHealth(n)`: Mengatur HP pemain ($0-20$).
- `setHunger(n)`: Mengatur tingkat lapar ($0-20$).
- `giveBandage(n)`: Memberikan $n$ buah perban ke hotbar.
- `setDay(n)`: Melompat ke Hari tertentu ($1-15$).
- `advanceDay()`: Memajukan 1 hari ke depan secara langsung.
- `setSpeed(n)`: Mengubah kecepatan waktu (contoh: `setSpeed(20)` untuk mempercepat siklus hari).
- `setDifficulty("santai" | "normal" | "susah")`: Mengganti tingkat kesulitan aktif.
- `killPlayer()`: Memicu kematian pemain untuk menguji mekanisme nyawa & Game Over.
- `showEndGame("win" | "lose")`: Menampilkan layar akhir kemenangan atau kekalahan.
- `tp(x, y, z)`: Berpindah tempat (teleportasi) ke koordinat tertentu.
- `clearSave()`: Menghapus data simpanan dan memuat ulang permainan dari awal.

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
