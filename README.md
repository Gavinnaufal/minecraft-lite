# 🌲 Mini Minecraft 3.0: Forest Survival & Defense Edition (Voxel Sandbox Game)

<div align="center">

![Three.js](https://img.shields.io/badge/Three.js-0.185.1-black?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.1.5-purple?style=for-the-badge&logo=vite)
![WebGL](https://img.shields.io/badge/WebGL-2.0-red?style=for-the-badge&logo=webgl)
![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Synthesizer-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Game sandbox & survival voxel 3D berkinerja tinggi yang dibangun dari nol di atas Three.js, TypeScript, dan Vite.**  
Menerapkan arsitektur engine modern: *Web Worker Multithreaded Chunk Meshing (Zero-Copy Transferable ArrayBuffers)*, *Greedy Meshing*, *Frustum Culling*, *Mob Object Pooling*, *Procedural Web Audio API Synthesizer*, *Combat & Armor Mitigation*, *Base Defense & Trap System*, *Multi-Dimension World Generation*, *WebSocket Multiplayer*, dan mode survival naratif **15-Day Forest Survival** bertema visual **Rustic Wood & Parchment**.

🏆 **Status Proyek: 100% Selesai & Lolos Verifikasi Production Build (`tsc && vite build` — 0 Errors).**

</div>

---

## 📑 Daftar Isi
1. [Fitur Unggulan (Key Features)](#-fitur-unggulan-key-features)
2. [Mode Permainan: 15-Day Forest Survival](#-mode-permainan-utama-15-day-forest-survival-mode)
3. [Sistem Pertahanan Markas (Base Fortification)](#-sistem-pertahanan-markas-base-camp-defense--fortification)
4. [Sistem Kebutuhan Hidup & Medis (Hunger & Health)](#-sistem-kebutuhan-hidup--medis-hunger--health-system)
5. [Sistem Pertanian & Panen (Multi-Stage Farming)](#-sistem-pertanian--panen-bertahap-multi-stage-farming-system)
6. [Penambangan & Peleburan (Mining & Smelting)](#-sistem-penambangan-ore--peleburan-furnace)
7. [Sistem Ekonomi & Perdagangan Villager (Trading)](#-sistem-ekonomi--perdagangan-villager-trading-system)
8. [Peternakan & Pembiakan Hewan (Breeding & Taming)](#-sistem-peternakan--pembiakan-hewan-breeding-system)
9. [Sistem Zirah & Mitigasi Tempur (Armor & Equipment)](#-sistem-zirah--mitigasi-tempur-armor-system)
10. [Dimensi Nether & Benteng Nether Fortress](#-dimensi-nether--benteng-nether-fortress)
11. [Ekologi Mob & Kecerdasan Buatan (AI)](#-ekologi-mob-kecerdasan-buatan-ai--balancing)
12. [Generasi Dunia, Bioma & Struktur Prosedural](#-generasi-dunia-bioma--struktur-prosedural)
13. [Engine Audio Prosedural (Web Audio Synthesizer)](#-engine-audio-prosedural-web-audio-api-synthesizer)
14. [Optimalisasi Mobile & Layar Sentuh](#-optimalisasi-khusus-mobile--tablet-touchscreen)
15. [Panduan Kontrol Lengkap (PC & Mobile)](#-panduan-kontrol-lengkap)
16. [Katalog Blok & Item Lengkap (ID Registry)](#-katalog-blok--item-lengkap-registries)
17. [Panduan Resep Crafting, Smelting & Trade (50+ Resep)](#-panduan-resep-crafting-smelting--trading)
18. [Cara Menjalankan Permainan & Server](#-cara-install--menjalankan-permainan)
19. [Perintah Console untuk Pengujian (Debug Helpers)](#-perintah-console-untuk-pengujian-debug-helpers)
20. [Arsitektur & Struktur Direktori Proyek](#-arsitektur--struktur-direktori-proyek)

---

## 🌟 Fitur Unggulan (Key Features)

- ⚡ **Zero-Copy Web Worker Chunk Meshing**: Generasi geometri chunk di-offload ke background worker menggunakan `Transferable ArrayBuffers`, menjamin game loop 60 FPS tanpa frame drop saat menjelajah dunia.
- 🧱 **Greedy Meshing & Frustum Culling**: Menggabungkan quad voxel sejenis untuk mengurangi draw calls secara drastis, serta hanya merender chunk yang berada dalam bidang pandang kamera.
- 🌲 **15-Day Forest Survival Campaign**: Mode petualangan bertahan hidup dengan eskalasi ancaman malam hari, sistem nyawa, prolog narasi, dan layar ringkasan statistik akhir.
- 🛡️ **Base Defense & Fortification**: Pagar kayu tinggi $1.5\text{ blok}$ anti-loncat monster dan perangkap duri baja (*Spike Trap*) yang memberikan damage konstan ke musuh namun aman bagi pemain.
- 🍗 **Hunger, Cooking & Bandage System**: Bilah rasa lapar 20 poin dinamis, keharusan memasak daging mentah di Furnace untuk nutrisi maksimal, dan perban medis darurat.
- 🌾 **3-Stage Dynamic Agriculture**: Siklus tanam gandum dari tunas muda hingga matang keemasan, pemupukan cepat, serta auto-replant terintegrasi.
- ⛏️ **Underground Ore Mining & Furnace Smelting**: Formasi bijih batubara (*Coal Ore*) dan besi (*Iron Ore*), persyaratan tier beliung (*Pickaxe Tier Requirement*), dan sistem pembakaran tungku 3-slot interaktif.
- 💰 **Villager Trading Economy**: Interaksi perdagangan dengan Penduduk Desa menggunakan *Emerald* sebagai mata uang bernilai tinggi.
- 🐮 **Animal Breeding & Love State**: Pembiakan sapi, babi, ayam, kambing, dan kura-kura dengan partikel hati (*Heart Burst*), skala anak mob $0.5\times$, dan transisi pertumbuhan linier 60 detik.
- 🪖 **Full Armor & Mitigation System**: 4 slot equipment (Helmet, Chestplate, Leggings, Boots) berbahan Leather dan Iron dengan mitigasi proteksi hingga $80\%$ damage reduction.
- 🌋 **Multi-Dimension Nether & Fortress**: Portal Obsidian $4\times 5$, langit merah berkabut peka audio drone, benteng Nether Brick prosedural, dan monster boss proyektil (Blaze & Ghast).
- 🔊 **Procedural Web Audio API Synthesizer**: Seluruh efek suara (langkah kaki adaptif permukaan, hancur/pasang blok, suara mob khas, portal hum, dan ambient musik) disintesis secara real-time matematika tanpa dependensi file audio eksternal.
- 🌐 **Built-in WebSocket Multiplayer**: Sinkronisasi posisi 3D, animasi swing pemain lain, name tag terapung, perubahan voxel real-time, dan in-game chat box (`T`).
- 📱 **Adaptive Touchscreen Interface**: D-Pad responsif, tap-to-select inventory, long-press stack splitter modal ($\ge 380\text{ms}$), dan spawn safeguard anti-nyangkut.

---

## 🌲 Mode Permainan Utama: 15-Day Forest Survival Mode

Pemain terdampar di tengah hutan lebat yang misterius dan berbahaya. Misimu adalah **bertahan hidup selama 15 Hari** hingga regu penyelamat tiba di fajar Hari ke-15.

```
Pilih Kesulitan → Mulai Hari 1 (06:00 Fajar) → Kumpulkan Kayu & Tambang Ore
  → Bangun Markas / Pasang Pagar & Spike Trap → Tanam Gandum & Ternak Hewan
  → Bertahan dari Eskalasi Monster Malam → Capai Fajar Hari ke-15 → 🏆 MENANG & PULANG!
  
  (Jika Nyawa Habis di Perjalanan → ☠️ GAME OVER & Ringkasan Statistik Permainan)
```

### ⚔️ 1. Tingkat Kesulitan Permainan (Difficulty Settings)
| Tingkat Kesulitan | Nyawa Awal | Laju Lapar | Karakteristik Tantangan & Penalti Kematian |
|---|:---:|:---:|---|
| 🟢 **Santai (Casual)** | $\infty$ (999) | $0.5\times$ | Kematian tidak menghapus dunia, hanya menjatuhkan sebagian kecil item. Monster lebih jinak. |
| 🟡 **Normal (Standard)** | **3 Nyawa** | $1.0\times$ | Pengalaman survival standar seimbang. Kematian menghabiskan 1 nyawa; habis 3 nyawa = Game Over. |
| 🔴 **Susah (Hardcore)** | **1 Nyawa** | $1.5\times$ | Sekali mati langsung **GAME OVER** seketika (*Permadeath*). Lapar sangat cepat, monster paling buas. |

### ⏰ 2. Siklus Waktu Terpadu (Day/Night Synchronization)
- **Durasi 1 Hari Penuh**: **10 Menit** (600 detik nyata) $\rightarrow$ Siang 5 menit, Senja 1 menit, Malam 3 menit, Fajar 1 menit.
- **Inisialisasi Bersih**: Setiap memulai dunia baru (*New Game*) atau mereset game setelah kalah, waktu selalu diawali tepat pada **Hari 1 • Pukul 06:00 Pagi (Fajar Cerah)**.

### 📜 3. Prolog Narasi & Layar Akhir Permainan (End Game Screens)
- 📖 **Prolog Catatan Survival**: Dialog pembuka saat pertama kali menginjakkan kaki di alam liar.
- 🏆 **Layar Kemenangan (Victory Screen)**: Terpicu otomatis di fajar Hari ke-15 dengan cerita penyelamatan heroik.
- ☠️ **Layar Kekalahan (Defeat Screen)**: Terpicu saat nyawa habis, menampilkan penyebab gugur dan kutipan penutup.
- 🔄 **Menu & Reset Terpadu**: Tombol kembali ke menu utama membersihkan data sesi dan siap untuk petualangan baru.

### 📊 4. Pelacak Statistik Real-Time (`StatsTracker.ts`)
Setiap aksi dicatat otomatis ke penyimpanan lokal (`IndexedDB` / `localStorage`) dan dirangkum di Layar Akhir:
1. 📅 **Hari Bertahan**: Total hari yang berhasil dilalui (/ 15 Hari).
2. 🛡️ **Tingkat Kesulitan**: Santai / Normal / Susah.
3. ⏱️ **Waktu Bermain**: Durasi nyata permainan (Jam, Menit, Detik).
4. ⚔️ **Monster Dikalahkan**: Akumulasi musuh yang berhasil ditumpas.
5. ⛏️ **Blok Dihancurkan**: Jumlah blok yang ditambang atau dipecahkan.
6. 🧱 **Blok Dipasang**: Jumlah blok yang dibangun untuk markas.
7. 🛠️ **Item Dibuat**: Total item yang di-craft di Meja Crafting.
8. 🍖 **Makanan Dikonsumsi**: Porsi nutrisi yang telah dimakan.
9. 🏃 **Jarak Ditempuh**: Akumulasi jarak berjalan kaki dalam satuan meter (blok).

---

## 🛡️ Sistem Pertahanan Markas (Base Camp Defense & Fortification)

Untuk menahan gempuran monster malam hari yang kian agresif seiring bertambahnya hari, pemain dapat memanfaatkan konstruksi pertahanan benteng:

### 🪵 1. Pagar Kayu (`fence` — ID 27)
- **Tinggi Collision Khusus ($1.5\text{ Blok}$)**: Bounding box AABB pagar dihitung hingga elevasi $y + 1.5$. Karena lompatan normal pemain dan mob darat berkisar $\sim 1.25\text{ blok}$, monster (Zombie, Skeleton, Enderman), NPC, dan Hewan Ternak **tidak bisa melompati atau menerobos pagar 1 lapis**.
- **Jarak Pandang & Tembus Serangan**: Garis bidik (*Raycast Crosshair*) tidak terhalang batas pagar, memungkinkan pemain **menyerang monster di luar pagar dengan pedang atau busur panah dari posisi aman**.
- **Mekanik Panjat Laba-Laba (*Spider Wall-Climbing*)**: Sesuai mekanik asli, Laba-laba (*Spider*) dapat merayapi dinding vertikal. Pemain disarankan menambahkan bibir kanopi di atas pagar agar laba-laba tidak memanjat masuk.
- **Resep Crafting**: `1x Stick` + `1x Plank` + `1x Stick` vertikal $\rightarrow$ **`3x Fence`**.

### ⚔️ 2. Perangkap Duri Baja (`spike_trap` — ID 28)
- **Damage Otomatis Periodik**: Setiap monster agresif (Zombie, Skeleton, Spider, Enderman) yang menginjak atau melangkah di atas blok *Spike Trap* akan menerima **$2.0\text{ HP}$ damage per detik**.
- **Efek Partikel & Audio**: Memicu suara denting logam tajam dan semburan partikel baja saat duri mengenai musuh.
- **Proteksi Total untuk Pemain & Hewan**: Pemain dan hewan ternak yang berjalan di atas perangkap duri **100% aman tanpa menerima damage**, memberi kebebasan penuh menata barisan jebakan di depan gerbang markas.
- **Resep Crafting**: `4x Stick` + `2x Stone` $\rightarrow$ **`2x Spike Trap`**.

---

## 🍖 Sistem Kebutuhan Hidup & Medis (Hunger & Health System)

### 🍗 1. Bilah Lapar (Hunger Bar)
- Dirender elegan di sebelah kanan bilah Hotbar menggunakan **10 ikon paha ayam (Drumstick SVG)** beresolusi tajam.
- Kapasitas maksimal: **20 Poin Lapar**.
- **Laju Pengurangan**:
  - Posisi Diam (*Idle*): Berkurang 1 poin setiap $\sim 40$ detik.
  - Berjalan Kaki Normal: $1.4\times$ lebih cepat.
  - Berlari Sprint (*Shift / Double Tap W*): $2.0\times$ lebih cepat.
- **Efek Status Lapar**:
  - ☠️ **Kelaparan (Hunger = 0)**: Menerima damage $-1$ HP setiap $3.5$ detik disertai kilatan merah di layar dan peringatan visual.
  - 💖 **Regenerasi Alami (Hunger $\ge 18$)**: Jika HP belum penuh, memulihkan $+1$ HP setiap $4.0$ detik dengan mengonsumsi sedikit poin lapar.

### 🥗 2. Nilai Nutrisi Makanan & Keharusan Memasak
*Catatan Desain v3.0: Daging mentah dari hasil berburu wajib dimasak di dalam Furnace sebelum dapat dikonsumsi demi kebersihan dan pemulihan energi optimal!*

| Makanan | Cara Memperoleh | Nilai Lapar | Deskripsi |
|---|---|:---:|---|
| 🥩 **Cooked Beef (Steak)** | Bakar Raw Beef di Furnace | **$+11$** | Daging sapi panggang lezat penambah stamina tinggi. |
| 🍖 **Cooked Porkchop** | Bakar Raw Porkchop di Furnace | **$+11$** | Daging babi panggang padat energi. |
| 🍗 **Cooked Chicken** | Bakar Raw Chicken di Furnace | **$+10$** | Daging ayam panggang gurih. |
| 🥩 **Cooked Mutton** | Bakar Raw Mutton di Furnace | **$+10$** | Daging domba/kambing panggang bergizi. |
| 🍞 **Bread (Roti)** | Crafting 3x Wheat di Grid | **$+7$** | Makanan pokok olahan gandum praktis. |
| 🌾 **Wheat (Gandum Mentah)** | Panen Tanaman Gandum | **$+2$** | Camilan biji-bijian darurat yang dapat langsung dimakan. |
| 🧟 **Rotten Flesh** | Drop Monster Zombie | **$+3$** | Makanan busuk darurat saat kehabisan bekal di alam liar. |

### 🩹 3. Item Medis Darurat: Perban (Bandage / Medkit)
Item medis pertolongan pertama yang bekerja instan tanpa menunggu regenerasi lapar:
- **Khasiat**: Memulihkan **$+6$ HP Instan** (setara 3 simbol hati penuh) seketika saat digunakan.
- **Mekanik Penggunaan**: Pegang Bandage di Hotbar lalu **Klik Kanan**.
- **Cooldown Proteksi**: **5.0 Detik** antar penggunaan untuk menjaga keseimbangan tempur.
- **Proteksi Darah Penuh**: Tidak dapat digunakan jika HP sudah penuh ($20/20$), mencegah pemborosan item tak sengaja.
- **Bahan & Resep Crafting**:
  - `Leaves` (dari menghancurkan daun pohon) + `String` (dari mengalahkan Spider).
  - **`3x Leaves` + `1x String` $\rightarrow$ `2x Bandage`** (mendukung 12 variasi susunan di grid crafting).

---

## 🌾 Sistem Pertanian & Panen Bertahap (Multi-Stage Farming System)

Pertanian mandiri menjamin ketersediaan bahan pangan berkelanjutan di markas:

```
[Rumput / Tanah] + Cangkul (Klik Kanan) → [Farmland (ID 13)]
  → Tanam Wheat Seeds (Klik Kanan) → [Tunas Muda (ID 25)]
  → Tumbuh Alami / Pupuk Tulang → [Batang Hijau (ID 26)]
  → Gandum Emas Matang (ID 14) → Panen (1x Wheat + 1-3x Seeds) → Olah Jadi Roti!
```

1. **Membajak Tanah (*Tilling*)**: Pegang Cangkul (*Wooden/Stone/Iron Hoe*), arahkan ke blok Rumput (*Grass*) atau Tanah (*Dirt*), lalu **Klik Kanan** $\rightarrow$ Blok berubah menjadi tanah subur (**Farmland — ID 13**).
2. **Menanam Benih (*Planting*)**: Pegang Benih Gandum (*Wheat Seeds*), lalu **Klik Kanan** pada Farmland $\rightarrow$ Tertanam tunas muda (**Wheat Sprout — ID 25**).
3. **3 Tahap Pertumbuhan Dinamis (*Growth Stages*)**:
   - 🌱 **Tahap 1 — Tunas Muda (`wheat_sprout` ID 25)**: Ketinggian $0.40$ blok.
   - 🌿 **Tahap 2 — Batang Hijau (`wheat_growing` ID 26)**: Ketinggian $0.65$ blok.
   - 🌾 **Tahap 3 — Gandum Emas Matang (`wheat_crop` ID 14)**: Ketinggian $0.85$ blok, siap dipanen.
4. **Pemupukan Instan (*Fertilization*)**: **Klik Kanan** tanaman yang sedang tumbuh menggunakan Tulang (`bone`) atau Benih (`wheat_seeds`) untuk mempercepat tanaman langsung naik ke fase berikutnya seketika!
5. **Panen Cepat & Auto-Replant**:
   - Memukul (*Klik Kiri*) atau Quick Harvest (*Klik Kanan*) pada gandum matang menjatuhkan **1x Wheat** + **1–3x Wheat Seeds**.
   - Panen cepat menggunakan klik kanan sambil memegang benih otomatis langsung menanam tunas baru tanpa jeda!

---

## ⛏️ Sistem Penambangan Ore & Peleburan (Furnace)

### 🪨 1. Formasi Bijih Tambang Bawah Tanah (Ore Deposits)
Gua-gua bawah tanah dan tebing batu menyimpan deposit mineral berharga:
- 🖤 **Coal Ore (ID 21)**: Ditemukan melimpah di lapisan batuan atas hingga dalam. Dapat ditambang menggunakan beliung apa saja (Wooden Pickaxe ke atas). Menjatuhkan item **Coal**.
- 🧡 **Iron Ore (ID 22)**: Ditemukan di lapisan bawah tanah yang lebih dalam. **Membutuhkan minimal Stone Pickaxe (Tier $\ge 2$)** untuk ditambang. Menjatuhkan item **Raw Iron**.

### 🔥 2. Tungku Pembakaran Interaktif (`FurnaceScreen.ts` & `FurnaceManager.ts`)
Bangun blok **Furnace (ID 23)** dari 8x Stone, letakkan di dunia, lalu **Klik Kanan** untuk membuka antarmuka peleburan 3-slot:

```
┌──────────────────────────────────────┐
│          FURNACE SMELTER             │
│                                      │
│    [ Input Slot ]                    │
│          │                           │
│          ▼ (Progress Arrow 5.0s)     │
│    [ Output Slot ]                   │
│          ▲                           │
│          │ (Api Pembakaran)          │
│    [ Fuel Slot  ]                    │
│                                      │
└──────────────────────────────────────┘
```

- **Bahan Bakar (*Fuel*)**: Mendukung Coal (efisiensi tinggi), Wood Log, atau Plank.
- **Durasi Peleburan**: $5.0\text{ detik}$ per item dengan animasi indikator api dan panah progres SVG.
- **Resep Peleburan Lengkap**:
  - `Raw Iron` + Bahan Bakar $\rightarrow$ **`Iron Ingot`**
  - `Raw Beef` + Bahan Bakar $\rightarrow$ **`Cooked Beef (Steak)`**
  - `Raw Porkchop` + Bahan Bakar $\rightarrow$ **`Cooked Porkchop`**
  - `Raw Chicken` + Bahan Bakar $\rightarrow$ **`Cooked Chicken`**
  - `Raw Mutton` + Bahan Bakar $\rightarrow$ **`Cooked Mutton`**

---

## 💰 Sistem Ekonomi & Perdagangan Villager (Trading System)

Pemain dapat menjalin hubungan dagang yang menguntungkan dengan Penduduk Desa:
1. **Mencari Desa (*Village*)**: Kunjungi desa awal (*Starter Village*) yang selalu ada pada koordinat `(0, 0)` atau desa prosedural di bioma Plains.
2. **Membuka Jendela Dagang**: Dekati Villager lalu lakukan **Klik Kanan** untuk memunculkan modal antarmuka `TradingScreen`.
3. **Mata Uang Emerald**: Emerald bertindak sebagai valuta utama untuk menukar komoditas pertanian dengan persenjataan tingkat tinggi.
4. **Daftar Resep Perdagangan Generik**:
   - 🌾 `5x Wheat` $\rightarrow$ 💎 **`1x Emerald`**
   - 💎 `1x Emerald` $\rightarrow$ 🍞 **`3x Bread`**
   - 💎 `3x Emerald` $\rightarrow$ 🗡️ **`1x Iron Sword`**
   - 💎 `5x Emerald` $\rightarrow$ 🏹 **`1x Bow` + `5x Arrow`**
5. **Feedback Visual & Audio**: Transaksi sukses memicu efek suara *synthesized pop SFX*, kilauan partikel *Emerald Burst*, serta cooldown anti-spam $4.0\text{ detik}$ per Villager.

---

## 🐮 Sistem Peternakan & Pembiakan Hewan (Breeding System)

Hewan ternak pasif dapat dikembangbiakkan untuk melipatgandakan pasokan sumber daya:

```
Pegang Pakan Favorit → Dekati 2 Hewan Dewasa → Klik Kanan Keduanya
  → Mode Cinta (Partikel Hati Merah Muda 💖) → Keduanya Saling Mendekat (< 3.5m)
  → Lahir Bayi Hewan (Skala 0.5x) → Tumbuh Menjadi Dewasa dalam 60 Detik!
```

### 📋 Tabel Pakan Favorit Hewan Ternak (`MobFoodRegistry.ts`)
| Hewan | Pakan Favorit | Hasil Drop Saat Dewasa | Karakteristik Khusus |
|---|---|---|---|
| 🐄 **Sapi (Cow)** | 🌾 `Wheat` | Raw Beef, Leather | Menghasilkan kulit untuk baju zirah dasar. |
| 🐖 **Babi (Pig)** | 🌾 `Wheat` / 🍞 `Bread` | Raw Porkchop | Sumber daging padat nutrisi. |
| 🐔 **Ayam (Chicken)** | 🌾 `Wheat Seeds` | Raw Chicken, Feather | Menghasilkan bulu untuk pembuatan anak panah. |
| 🐐 **Kambing (Goat)** | 🌾 `Wheat` | Raw Mutton | Memiliki kemampuan lompat tinggi di perbukitan. |
| 🐢 **Kura-kura (Turtle)** | 🌾 `Wheat Seeds` | Seagrass / XP | AI amfibi yang berenang lincah di pantai dan laut. |

- **Masa Tumbuh Bayi (*Baby Growth Timer*)**: Bayi hewan lahir dengan skala model $0.5\times$ dan membesar secara bertahap (*linear interpolation*) hingga ukuran dewasa penuh dalam **60 detik**.
- **Jeda Pembiakan (*Breeding Cooldown*)**: Kedua induk masuk ke fase cooldown selama **5 menit (300 detik)** sebelum dapat dibiakkan kembali.
- **Persistensi Penuh**: Status bayi, waktu tumbuh, dan timer cooldown tersimpan permanen di `SaveManager`.

---

## 🪖 Sistem Zirah & Mitigasi Tempur (Armor System)

Pemain dapat mengenakan zirah pelindung untuk mengurangi kerusakan akibat serangan monster dan bahaya lingkungan:

### 🛡️ 1. Slot Perlengkapan & Mitigasi Kerusakan (`ArmorSystem.ts`)
- **4 Slot Armor Khusus**: Helm (*Helmet*), Baju Zirah (*Chestplate*), Celana Zirah (*Leggings*), dan Sepatu Bot (*Boots*).
- **Rumus Mitigasi**: Setiap 1 poin pertahanan memberikan **$4\%$ reduksi kerusakan** (hingga batas maksimal proteksi **$80\%$ damage reduction** pada 20 poin armor).
- **Bilah Armor HUD**: Dirender di atas health bar menggunakan **10 ikon perisai perak (Shield SVG)**.
- **Kemudahan Pemakaian**: Dukungan drag-and-drop antar slot atau **Shift + Klik Kiri** untuk pemakaian kilat (*Auto-Equip*).

### ⚔️ 2. Perbandingan Set Zirah
| Set Zirah | Total Defense | Reduksi Damage | Durabilitas Total | Bahan Pembuatan |
|---|:---:|:---:|:---:|---|
| 🟤 **Leather Armor Set** | **7 Poin** | **$28\%$ Reduction** | 275 Penggunaan | 24x `Leather` (Sapi) |
| ⚪ **Iron Armor Set** | **15 Poin** | **$60\%$ Reduction** | 825 Penggunaan | 24x `Iron Ingot` (Furnace) |

---

## 🌋 Dimensi Nether & Benteng Nether Fortress

Pemain yang telah mengumpulkan material kuat dapat menembus batas dimensi menuju dunia Nether yang membara:

1. **Pembangunan Portal Nether**:
   - Susun bingkai blok **Obsidian (ID 15)** dengan dimensi minimal $4\times 5$ (lebar 4 blok, tinggi 5 blok).
   - Nyalakan bagian dalam portal menggunakan Torch atau serang dengan percikan $\rightarrow$ Blok terisi **Nether Portal (ID 18)** ungu bercahaya.
   - Masuk ke portal dan berdiri selama **3 detik** untuk memulai transisi teleportasi dimensi dengan efek *camera fade*.
2. **Lingkungan Nether**:
   - Geografi gua raksasa berbahan **Netherrack (ID 16)**, langit-langit berhias **Glowstone (ID 17)** bercahaya, lantai **Soul Sand (ID 20)** yang memperlambat pergerakan, dan danau lautan **Lava (ID 19)** pijar.
   - Efek visual kabut merah tebal (*Red Atmospheric Fog*) dan audio dengungan drone ambien menyeramkan.
   - Rasio koordinat ruang: $1\text{ blok di Nether} = 8\text{ blok di Overworld}$.
3. **Benteng Nether (*Nether Fortress*) & Peti Harta**:
   - Struktur benteng koridor dan pilar megah berbahan **Nether Brick (ID 24)** yang ter-generate secara prosedural pada grid Nether.
   - Menyimpan peti harta karun (*Loot Chest*) berisi material langka: **Blaze Rod**, **Iron Ingot**, dan **Emerald**.
4. **Monster Terbang & Bos Dimensi Nether**:
   - 🔥 **Blaze**: Monster inti api yang melayang di koridor benteng dengan 12 batang api berputar (*orbiting rods*). Menembakkan rentetan proyektil bola api (*Fireball*) ke arah pemain dan menjatuhkan **Blaze Rod**.
   - 👻 **Ghast**: Raksasa terbang berukuran $4\times 4$ blok dengan 9 tentakel di langit terbuka Nether. Melancarkan tembakan bola api ledakan raksasa berdaya rusak **$7.0\text{ HP}$** dan menjatuhkan **Ghast Tear**.

---

## 👹 Ekologi Mob, Kecerdasan Buatan (AI) & Balancing

### 👾 1. Monster Agresif (Hostile Mobs)
- 🧟 **Zombie**: Menyerang jarak dekat, terbakar di bawah terik matahari langsung saat siang hari. Menjatuhkan *Rotten Flesh*.
- 🏹 **Skeleton**: AI penembak jarak jauh dengan balistik proyektil busur akurat, terbakar di bawah terik matahari. Menjatuhkan *Bone* dan *Arrow*.
- 🕷️ **Spider**: Model 3D berkaki 8 dengan animasi merayap artikulasi. Berstatus **netral di siang hari** dan **sangat agresif di malam hari** dengan lompatan terjang $5.8\text{m}$ serta kemampuan memanjat dinding vertikal (*Wall-Climbing*). Menjatuhkan *String*.
- 👁️ **Enderman**:
  - Tinggi $2.9\text{m}$ dengan partikel aura ungu misterius.
  - **Mekanik Tatapan Mata (*0.8s Continuous Gaze*)**: Hanya terprovokasi menjadi marah jika pemain menatap matanya secara konsisten dengan Pointer Lock aktif selama minimal 0.8 detik.
  - **Jeda Teleportasi Taktis (*Combat Balance*)**: Memiliki cooldown teleportasi minimal **3.5 detik** dan jendela jeda **1.8 detik pasca menerima pukulan**, memberi kesempatan bagi pemain melancarkan kombo serangan beruntun.
  - **Kelemahan Air**: Terluka saat terkena air dan otomatis teleportasi menjauh. Menjatuhkan **Ender Pearl**.
- 🔥 **Blaze & Ghast**: Mob terbang proyektil penghuni Nether Fortress.

### 🛡️ 2. Penduduk & Pelindung Desa (Neutral / Friendly)
- 👨‍🌾 **Villager**: Menghuni desa, berjalan-jalan di jalur setapak, dan melayani perdagangan item berharga.
- 🤖 **Iron Golem**: Penjaga desa perkasa dengan darah tebal **100 HP**. Membantu membasmi monster malam dengan serangan pukulan yang melontarkan musuh tinggi ke udara. Menjatuhkan *Iron Ingot* saat gugur.

### 📈 3. Kurva Eskalasi Malam (Hari 1 s/d 15)
- 🟢 **Hari 1–5 (Fase Awal)**: Kuota monster 5 ekor, spawn tenang, HP musuh standar ($20\text{ HP}$).
- 🟡 **Hari 6–10 (Fase Menengah)**: Kuota monster 11 ekor, spawn lebih rapat, musuh lebih tangguh ($+7\text{ HP}$ ekstra).
- 🔴 **Hari 11–15 (Fase Puncak Survival)**: Kuota monster 18 ekor, intensitas serbuan sangat tinggi, monster memiliki darah tebal (hingga $+15\text{ HP}$ ekstra). Menuntut pemain membarikade markas dengan pagar dan perangkap duri!

---

## 🌍 Generasi Dunia, Bioma & Struktur Prosedural

1. **Algoritma Generasi Medan**:
   - Berbasis *Multi-Octave Simplex Noise* dengan koordinat deterministik berdasar *World Seed*.
   - Terowongan gua 3D berliku, jurang ngarai dalam (*Ravines*), kubangan lava bawah tanah, serta formasi gugusan Obsidian dan Ore.
2. **Katalog Bioma Utama**:
   - 🌿 **Plains (Padang Rumput)**: Dataran landai subur, lokasi ideal bagi perkebunan dan spawn desa (*Village*).
   - 🌲 **Forest (Hutan Oak)**: Hutan lebat penuh pepohonan kayu oak dan dedaunan lebat.
   - 🏜️ **Desert (Gurun Pasir)**: Hamparan pasir kuning dan bukit batupasir (*Sandstone*).
   - 🏔️ **Mountains (Pegunungan)**: Tebing batu terjal menjulang tinggi dengan formasi bebatuan curam.
   - 🌊 **Ocean (Lautan Luas)**: Cekungan air dalam berdasar pasir laut yang menghubungkan pulau-pulau daratan.
   - 🌋 **Nether (Dunia Bawah)**: Dimensi gua magma beratap batu Netherrack dengan benteng Nether Brick.
3. **Struktur Bangunan Prosedural**:
   - 🏡 **Starter Village & Plains Village**: Rumah kayu Oak (*Oak House*), rumah batu (*Stone House*), lahan pertanian gandum, jalur jalan tanah (*Dirt Path*), dan peti perbekalan.
   - 🏰 **Nether Fortress**: Jembatan koridor benteng bertingkat dengan peti jarahan Blaze Rod dan Emerald.

---

## 🔊 Engine Audio Prosedural (Web Audio API Synthesizer)

Seluruh lanskap suara game dihasilkan murni secara komputasi matematika melalui Web Audio API tanpa memuat file `.mp3` atau `.wav` eksternal:

- 👟 **Langkah Kaki Adaptif Permukaan (*Surface Footsteps*)**: Suara langkah berbeda untuk Rumput (gesekan lembut), Batu (ketukan padat), Pasir (suara berderik renyah), Kayu (ketukan berongga), Air (percikan cairan), dan Tanah.
- ⛏️ **Interaksi Blok**: Suara hancur (*Noise Bandpass Filter*) dan suara pasang (*Pitch Frequency Ramp Down*).
- 🍖 **Mengunyah Makanan & Medis**: Suara kunyah renyah 3 ketukan bertahap saat makan dan desis perban.
- 🐮 **Vokalisasi Hewan & Mob**:
  - Sapi: Suara *Moo* rendah dengan filter vibrato lowpass.
  - Babi: Suara *Oink* mendengkur cepat.
  - Ayam: Suara *Cluck* nada tinggi ceria.
  - Kambing: Suara *Baa* gelombang kotak bergetar.
  - Zombie: Erangan serak menyeramkan.
  - Villager: Suara sengau khas *"Hmm..."* saat diajak bicara dan rintihan *"Hrh!"* saat terluka.
  - Portal & Dimensi: Suara dengungan frekuensi rendah portal ungu dan drone atmosferik Nether.
- 🎵 **Musik Latar Prosedural**: Melodi santai arpeggio 8 not pentatonik yang berbunyi lembut di latar belakang.

---

## 📱 Optimalisasi Khusus Mobile & Tablet Touchscreen

Game ini dirancang responsif dan nyaman dimainkan di perangkat layar sentuh ponsel maupun tablet:

- 🕹️ **D-Pad Virtual Ergonomis**: Pengendalian arah gerak 8 arah yang presisi di sudut kiri bawah layar.
- 👆 **Sistem Tap-to-Select Aman**: Mengetuk item sumber lalu mengetuk slot tujuan untuk memindahkan barang secara aman tanpa risiko *item stuck*.
- ⏱️ **Modal Pemisah Stack (Stack Splitter)**: Sentuh dan tahan (*long press* $\ge 380\text{ms}$) pada tumpukan item untuk membuka jendela slider pembagi jumlah item (1 Saja, Setengah, Semua, +/-).
- ☰ **Tombol Menu Cepat**: Akses instan ke Pause Menu, Simpan Data, dan Pengaturan Game.
- 🛡️ **Pencegah Player Terjebak (*Spawn Safeguard*)**: Elevasi spawn awal selalu dikompensasi $+0.6\text{ blok}$ di atas puncak bukit untuk mencegah pemain terjebak di dalam tanah.

---

## 🎮 Panduan Kontrol Lengkap

### Kontrol PC / Desktop
| Tombol | Fungsi Utama |
|---|---|
| **W, A, S, D** | Bergerak (Maju, Kiri, Mundur, Kanan) / Berenang mengarah ke sudut kamera |
| **Spacebar** | Melompat (*Jump*) / Berenang naik ke permukaan air |
| **Shift / C** | Berjalan Pelan (*Sneak*) / Menyelam turun ke dasar air |
| **Klik Kiri Mouse** | Menghancurkan Blok / Menyerang Mob / Memukul Panen Tanaman |
| **Klik Kanan Mouse** | Memasang Blok / Memakan Makanan / Menggunakan Bandage / Membuka Peti & Furnace / Membuka Trade Villager / Memberi Makan Ternak / Mencangkul / Menanam |
| **Shift + Klik Kiri** | Memakai Zirah Otomatis (*Auto-Equip Armor*) dari Tas ke Slot Zirah |
| **Scroll Mouse / 1-9** | Mengganti Slot Hotbar Aktif |
| **E** | Membuka / Menutup Layar Tas Inventaris, Slot Zirah & Meja Crafting |
| **F3** | Membuka Debug Overlay (FPS, XYZ, Chunk, Bioma, Dimensi, Mobs, Armor, Proyektil) |
| **T** | Membuka Kotak Chat Multiplayer |
| **Escape (ESC)** | Membuka Menu Jeda (Pause Menu) / Menutup Jendela UI Aktif |

### Kontrol Mobile / Layar Sentuh
| Tombol Layar | Fungsi Utama |
|---|---|
| **D-Pad Kiri Virtual** | Berjalan maju, mundur, melangkah ke samping kiri/kanan |
| **Area Kanan Layar** | Mengarahkan sudut pandang kamera (Sentuh & Usap) |
| **Tombol Lompat (▲)** | Melompat melewati rintangan / Berenang naik ke atas air |
| **Tombol Serang (⚔️)** | Menghancurkan blok yang disorot / Memukul musuh |
| **Tombol Pasang (🧱)** | Memasang blok / Menggunakan item aktif / Interaksi |
| **Tombol Tas (🎒)** | Membuka / Menutup panel inventaris, armor & crafting |
| **Tombol Menu (☰)** | Membuka Pause Menu & Pengaturan Permainan |
| **Ketuk Slot Item** | Memilih item lalu mengetuk slot tujuan untuk memindahkan barang |
| **Sentuh & Tahan Slot** | Membuka popup pemisah jumlah tumpukan (*Stack Splitter Modal*) |

---

## 📦 Katalog Blok & Item Lengkap (Registries)

### 🧱 1. Tabel Registrasi Blok (`BlockRegistry.ts`)
| ID | Nama Blok (`name`) | Solid | Transparan | Kekerasan (*Hardness*) | Catatan & Karakteristik Khusus |
|:---:|---|:---:|:---:|:---:|---|
| **0** | `air` | ❌ | ✅ | 0.0 | Blok udara kosong |
| **1** | `grass` | ✅ | ❌ | 0.8 | Blok rumput permukaan |
| **2** | `dirt` | ✅ | ❌ | 0.5 | Blok tanah biasa |
| **3** | `stone` | ✅ | ❌ | 1.5 | Blok batu alam |
| **4** | `sand` | ✅ | ❌ | 0.5 | Blok pasir gurun & pantai |
| **5** | `wood_log` | ✅ | ❌ | 2.0 | Batang kayu pohon oak |
| **6** | `leaves` | ✅ | ✅ | 0.2 | Dedaunan pohon (Drop Bandage material) |
| **7** | `water` | ❌ | ✅ | -1.0 | Cairan air dinamis |
| **8** | `plank` | ✅ | ❌ | 1.5 | Papan kayu olahan |
| **9** | `crafting_table` | ✅ | ❌ | 2.0 | Meja kerja crafting grid 3x3 |
| **10** | `sandstone` | ✅ | ❌ | 1.5 | Batupasir padat gurun |
| **11** | `torch` | ❌ | ✅ | 0.1 | Obor penerangan dinamis |
| **12** | `chest` | ✅ | ❌ | 2.5 | Peti penyimpanan 27 slot |
| **13** | `farmland` | ✅ | ❌ | 0.6 | Tanah gembur hasil cangkul untuk bertani |
| **14** | `wheat_crop` | ❌ | ✅ | 0.1 | Gandum matang siap panen |
| **15** | `obsidian` | ✅ | ❌ | 10.0 | Batu vulkanik bingkai portal Nether |
| **16** | `netherrack` | ✅ | ❌ | 0.8 | Bebatuan merah dimensi Nether |
| **17** | `glowstone` | ✅ | ❌ | 0.3 | Batu bercahaya penghasil penerangan |
| **18** | `nether_portal` | ❌ | ✅ | -1.0 | Blok gerbang ungu teleportasi antar-dimensi |
| **19** | `lava` | ❌ | ✅ | -1.0 | Cairan magma berpijar |
| **20** | `soul_sand` | ✅ | ❌ | 0.6 | Pasir jiwa Nether pembuat lambat langkah |
| **21** | `coal_ore` | ✅ | ❌ | 2.2 | Bijih batubara penghasil Coal |
| **22** | `iron_ore` | ✅ | ❌ | 3.2 | Bijih besi (Membutuhkan Min. Stone Pickaxe) |
| **23** | `furnace` | ✅ | ❌ | 3.5 | Tungku peleburan mineral & pemanggang daging |
| **24** | `nether_brick` | ✅ | ❌ | 3.0 | Blok batu benteng Nether Fortress |
| **25** | `wheat_sprout` | ❌ | ✅ | 0.1 | Tunas gandum tahap awal |
| **26** | `wheat_growing` | ❌ | ✅ | 0.1 | Tanaman gandum tahap menengah |
| **27** | `fence` | ✅ | ✅ | 1.5 | Pagar pembatas tinggi $1.5\text{ blok}$ anti-loncat |
| **28** | `spike_trap` | ✅ | ✅ | 1.0 | Perangkap duri pembunuh monster ($2.0\text{ DPS}$) |

---

## 📜 Panduan Resep Crafting, Smelting & Trading

### 🛠️ 1. Resep Blok Dasar, Pertahanan & Medis
- 🪵 **Plank (4x)**: `1x Wood Log`
- 🥢 **Stick (4x)**: `2x Planks` vertikal
- 🛠️ **Crafting Table (1x)**: `4x Planks` (Grid 2x2)
- 📦 **Chest (1x)**: `8x Planks` melingkar dengan ruang kosong di tengah
- 🔥 **Furnace (1x)**: `8x Stone` melingkar dengan ruang kosong di tengah
- 💡 **Torch (4x)**: `1x Coal` / `1x Wood Log` / `1x Plank` di atas `1x Stick`
- 🧱 **Sandstone (1x)**: `4x Sand` (Grid 2x2)
- 💡 **Glowstone (1x)**: `4x Netherrack` (Grid 2x2)
- 🪵 **Pagar Kayu / Fence (3x)**: `1x Stick` + `1x Plank` + `1x Stick` vertikal
- ⚔️ **Perangkap Duri / Spike Trap (2x)**: `4x Stick` + `2x Stone`
- 🍞 **Bread (1x)**: `3x Wheat` berjejer horizontal
- 🩹 **Bandage (2x)**: `3x Leaves` + `1x String` (mendukung 12 pola orientasi di grid 3x3)

### 🗡️ 2. Resep Alat & Senjata (Tools & Weapons)
- ⛏️ **Pickaxe** (*Wood / Stone / Iron*): `3x Material` horizontal di atas + `2x Sticks` vertikal di tengah.
- 🗡️ **Sword** (*Wood / Stone / Iron*): `2x Material` vertikal di atas + `1x Stick` di bawah.
- 🪓 **Axe** (*Wood / Stone / Iron*): `3x Material` pola sudut atas + `2x Sticks` vertikal (mendukung hadap kanan & kiri).
- 🧹 **Shovel** (*Wood / Stone / Iron*): `1x Material` di atas + `2x Sticks` vertikal di tengah.
- 🧑‍🌾 **Hoe** (*Wood / Stone / Iron*): `2x Material` sudut atas + `2x Sticks` vertikal.
- 🏹 **Bow (1x)**: `3x Sticks` melengkung + `3x String` di sisi samping.
- 🏹 **Arrow (4x)**: `1x Stone` di atas + `1x Stick` di tengah + `1x Feather` di bawah.

### 🪖 3. Resep Set Zirah Pelindung (Armor Sets)
- 🪖 **Helmet** (*Leather / Iron*): `5x Material` pola topi helm terbalik.
- 👕 **Chestplate** (*Leather / Iron*): `8x Material` mengisi seluruh kotak crafting kecuali slot tengah atas.
- 👖 **Leggings** (*Leather / Iron*): `7x Material` pola celana panjang.
- 🥾 **Boots** (*Leather / Iron*): `4x Material` pola sepasang sepatu bot di kiri dan kanan bawah.

### 🔥 4. Resep Peleburan Tungku (Furnace Smelting)
- 🪙 **Iron Ingot**: `Raw Iron` + Bahan Bakar ($5.0\text{ detik}$)
- 🥩 **Cooked Beef (Steak)**: `Raw Beef` + Bahan Bakar ($5.0\text{ detik}$)
- 🍖 **Cooked Porkchop**: `Raw Porkchop` + Bahan Bakar ($5.0\text{ detik}$)
- 🍗 **Cooked Chicken**: `Raw Chicken` + Bahan Bakar ($5.0\text{ detik}$)
- 🥩 **Cooked Mutton**: `Raw Mutton` + Bahan Bakar ($5.0\text{ detik}$)

---

## 💻 Cara Install & Menjalankan Permainan

### Persyaratan Sistem
- **Node.js**: `v18.0.0` atau versi LTS yang lebih baru
- **npm**: `v9.0.0` atau lebih baru
- Browser modern dengan dukungan WebGL 2.0 & Web Audio API (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### 1. Menjalankan Mode Singleplayer (Game Client)
```bash
# 1. Clone repository dari GitHub
git clone https://github.com/Gavinnaufal/minecraft-lite.git
cd minecraft-lite

# 2. Install seluruh dependencies
npm install

# 3. Jalankan server lokal Vite
npm run dev
```
Buka browser dan akses alamat lokal: **`http://localhost:5173`**.

### 2. Menjalankan Server Multiplayer (WebSocket)
Untuk mengaktifkan fitur mabar (*Multiplayer Synchronization*):
```bash
# Jalankan server multiplayer di terminal terpisah
npm run server
# atau: npx tsx server/server.ts
```
Server multiplayer akan aktif dan siap menerima koneksi WebSocket pada alamat `ws://localhost:8080`.

### 3. Membangun Bundle Produksi (Production Build)
```bash
npm run build
```
Kode TypeScript akan diverifikasi oleh `tsc` dan dibundel minifikasi oleh `vite` ke dalam direktori `dist/` (bebas error dan siap di-deploy ke Vercel, Netlify, atau GitHub Pages).

---

## 🛠️ Perintah Console untuk Pengujian (Debug Helpers)

Tekan tombol **`F12`** di browser untuk membuka jendela *Developer Tools Console*:

| Perintah Console | Fungsi & Contoh Penggunaan |
|---|---|
| `giveItem(itemId, count)` | Memberikan item apa pun ke inventaris pemain (contoh: `giveItem('fence', 32)`, `giveItem('iron_sword', 1)`, `giveItem('spike_trap', 16)`). |
| `spawnMob(type)` | Memunculkan mob di depan pemain (`'zombie'`, `'skeleton'`, `'spider'`, `'enderman'`, `'villager'`, `'iron_golem'`, `'cow'`, `'pig'`, `'chicken'`, `'blaze'`, `'ghast'`). |
| `setHealth(n)` | Mengatur HP darah pemain ($0-20$). |
| `setHunger(n)` | Mengatur tingkat kekenyangan lapar ($0-20$). |
| `giveBandage(n)` | Memberikan $n$ buah perban penyembuh langsung ke hotbar. |
| `setDay(n)` | Melompat langsung ke Hari survival tertentu ($1-15$). |
| `advanceDay()` | Memajukan 1 hari ke depan secara instan. |
| `setSpeed(n)` | Mengatur kecepatan siklus waktu (contoh: `setSpeed(20)` untuk mempercepat siang/malam). |
| `setDifficulty(diff)` | Mengganti tingkat kesulitan (`'santai'`, `'normal'`, atau `'susah'`). |
| `killPlayer()` | Memicu kematian pemain untuk menguji mekanisme nyawa dan layar Game Over. |
| `showEndGame("win" \| "lose")` | Menampilkan layar akhir kemenangan atau kekalahan secara paksa. |
| `tp(x, y, z)` | Berpindah tempat (teleportasi) ke koordinat 3D yang diinginkan. |
| `clearSave()` | Menghapus seluruh data simpanan dunia dari IndexedDB & localStorage lalu memuat ulang game. |

---

## 🏛️ Arsitektur & Struktur Direktori Proyek

```
minecraft-lite/
├── docs/                   # Dokumentasi Lengkap (GDD, PRD, Roadmap, Task Board v1-v3)
├── public/                 # Assets Tekstur 16x16 Pixel Art & Ikon SVG
│   └── textures/blocks/    # Tekstur Voxel (grass, stone, coal_ore, iron_ore, netherrack, dll.)
├── server/                 # Node.js WebSocket Multiplayer Server (server.ts)
├── src/
│   ├── audio/              # Procedural Synthesizer Engine (AudioManager.ts)
│   ├── core/               # Game Loop, Engine, Renderer, InputManager, Clock, GameSettings
│   ├── crafting/           # Crafting & Smelting Database (Recipes.ts, CraftingSystem.ts)
│   ├── economy/            # Sistem Perdagangan Desa (TradeTable.ts, VillagerTrading.ts)
│   ├── entities/           # Entitas Proyektil (Arrow.ts, Fireball.ts, ProjectileManager.ts)
│   ├── environment/        # Celestial Day/Night Cycle, Skybox, CloudManager
│   ├── interaction/        # Raycasting, BlockBreaker, BlockPlacer, BlockHighlight
│   ├── inventory/          # Inventory, Hotbar, ItemRegistry, ArmorSystem, FurnaceManager, ChestManager
│   ├── mobs/               # Mob Base Class, MobManager, Object Pooling & State Machine
│   │   ├── ai/             # BreedingManager.ts, MobFoodRegistry.ts, StateMachine.ts
│   │   ├── hostile/        # Zombie.ts, Skeleton.ts, Spider.ts, Enderman.ts, Blaze.ts, Ghast.ts
│   │   ├── npc/            # Villager.ts, IronGolem.ts
│   │   └── passive/        # Cow.ts, Pig.ts, Chicken.ts, Goat.ts, Turtle.ts
│   ├── multiplayer/        # WebSocket Network Client (NetworkManager.ts, ChatBox.ts)
│   ├── player/             # Player Controller, First-Person Camera, AABB Sweep Collision
│   ├── save/               # IndexedDB SaveManager & StorageAdapter
│   ├── survival/           # SurvivalManager.ts, StatsTracker.ts (Mode Survival 15 Hari)
│   ├── ui/                 # UI Screens (MainMenu, HUD, InventoryScreen, FurnaceScreen, TradingScreen, TouchControls, ToastSystem, EndGameScreen)
│   ├── world/              # Chunk, ChunkManager, ChunkMesher (Worker), ItemDropManager
│   │   ├── dimension/      # DimensionManager.ts, NetherWorldGenerator.ts, PortalDetector.ts
│   │   ├── farming/        # CropManager.ts (Pertumbuhan Gandum 3 Tahap)
│   │   ├── ores/           # OreGenerator.ts (Distribusi Batubara & Besi Bawah Tanah)
│   │   ├── structures/     # VillageGenerator, NetherFortressGenerator, Prefabs Bangunan
│   │   └── terrain/        # NoiseGenerator.ts, HeightMap.ts, BiomeGenerator.ts, TreeGenerator.ts
│   ├── main.ts             # Application Bootstrap & Master Lifecycle Loop
│   └── style.css           # Centralized Design Tokens & Rustic Wood UI Theme
├── package.json
└── README.md
```

---

## 📄 Lisensi

Dibuat dengan ❤️ untuk eksplorasi dan riset *Computer Graphics & Voxel Game Engine* berbasis WebGL / Three.js + TypeScript.  
Proyek ini didistribusikan di bawah lisensi resmi **[MIT License](LICENSE)**.
