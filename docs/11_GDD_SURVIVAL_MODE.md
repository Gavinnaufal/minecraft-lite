# GAME DESIGN DOCUMENT — SURVIVAL MODE
## Mini Minecraft → "15 Hari di Hutan" (Forest Survival Edition)

**Versi:** 2.0 (FINAL IMPLEMENTED)  
**Status:** 100% Selesai & Terintegrasi Penuh  
**Platform:** Web (Three.js + TypeScript + Vite) — Kompatibel Desktop & Mobile

---

## 1. VISI GAME

Pemain terdampar sendirian di hutan setelah sebuah kejadian tak terduga. Dia harus bertahan hidup selama **15 hari** — membangun tempat berlindung, mengumpulkan dan menanam makanan, meracik obat darurat, serta menghadapi serbuan monster malam yang semakin ganas — sampai akhirnya bala bantuan penyelamat tiba di fajar Hari ke-15.

**Pilar Desain:**
1. **Objektif Jelas** — Bukan sekadar sandbox tanpa arah; memiliki kondisi **Menang** (mencapai Hari 15) dan **Kalah** (nyawa habis).
2. **Kurva Eskalasi Bertahap** — Keganasan monster malam, jumlah kemunculan, dan bonus HP musuh meningkat secara bertahap setiap harinya.
3. **Kebutuhan Hidup & Strategi Markas** — Pemain harus mengelola *Health*, *Hunger Bar*, zirah pertahanan, dan stok obat perban (*Bandage*).
4. **Fleksibilitas Kesulitan** — Tersedia 3 tingkat kesulitan untuk pemain kasual hingga pecinta hardcore permadeath.

---

## 2. GAMEPLAY LOOP UTAMA

```
Pilih Kesulitan (Menu Utama) → Mulai Hari 1 (06:00 Pagi)
  → Eksplorasi Siang: Berburu hewan, tebang kayu, tambang bijih besi & batubara
  → Pertanian: Cangkul tanah (Hoe) → Tanam benih gandum → Panen gandum & buat roti
  → Medis: Kumpulkan daun & benang laba-laba untuk membuat Perban (Bandage)
  → Bangun/Perkuat Markas & Zirah: Pasang obor, dinding pelindung, peti, dan tungku
  → Bertahan dari Serbuan Monster Malam (AI aggro 35 blok)
  → Fajar Tiba & Hari Berganti (Hari 1 s/d 15)
  → Fajar Hari 15: MENANG (Layar Kemenangan + Statistik Bermain)
  
  ATAU jika nyawa habis: KALAH (Layar Kekalahan + Ringkasan Statistik + Reset ke Hari 1 06:00)
```

---

## 3. SISTEM KESULITAN (DIFFICULTY SYSTEM)

| Parameter | 🟢 Santai (Casual) | 🟡 Normal (Standard) | 🔴 Susah (Hardcore) |
|---|---|---|---|
| **Kapasitas Nyawa** | Nyawa Bebas (`∞`) | **3 Nyawa** | **1 Nyawa (Permadeath)** |
| **Laju Kelaparan** | $0.5\times$ *(Lambat)* | $1.0\times$ *(Normal)* | $1.5\times$ *(Cepat)* |
| **Faktor Monster** | $0.7\times$ *(Ringan)* | $1.0\times$ *(Standar)* | $1.4\times$ *(Sangat Ganas & Tebal)* |
| **Konsekuensi Kematian** | Hari berjalan tetap lanjut, inventaris aman | Nyawa berkurang 1, ulang dari Hari 1 jika habis | Sekali mati langsung Game Over total |

---

## 4. SISTEM KEBUTUHAN HIDUP & KESEHATAN

### 4.1 Bilah Lapar (Hunger Bar)
- Kapasitas: **20 Poin Lapar** (10 Ikon Drumstick SVG).
- Drain Rate: Diam ($\sim 40$s per poin), Jalan ($1.4\times$), Sprint ($2.0\times$).
- **Starvation**: Jika Hunger $= 0$, pemain terkena damage $-1$ HP setiap $3.5$ detik.
- **Natural Regen**: Jika Hunger $\ge 18$ dan HP belum penuh, pulih $+1$ HP setiap $4.0$ detik.
- **Nilai Nutrisi Makanan**:
  - *Cooked Beef / Porkchop*: $+11$ Lapar
  - *Cooked Chicken / Mutton*: $+10$ Lapar
  - *Bread (Roti)*: $+7$ Lapar
  - *Raw Beef / Porkchop*: $+4$ Lapar
  - *Raw Chicken / Mutton*: $+3$ Lapar
  - *Wheat (Gandum Mentah)*: $+2$ Lapar (Camilan darurat instan)
  - *Rotten Flesh*: $+3$ Lapar

### 4.2 Item Medis Darurat: Perban (Bandage)
- Khasiat: **$+6$ HP Instan** seketika saat Klik Kanan.
- Terpisah dari hunger bar.
- Cooldown: 5.0 detik dengan proteksi anti-spam.
- Resep Crafting: `3x Leaves + 1x String` $\rightarrow$ `2x Bandage`.

### 4.3 Sistem Pertanian & Panen (Farming)
- Cangkul (*Wooden / Stone / Iron Hoe*) dengan resep simetris kiri-kanan.
- Klik Kanan rumput/tanah $\rightarrow$ *Farmland (13)*.
- Tanam *Wheat Seeds* di atas Farmland $\rightarrow$ *Wheat Crop (14)*.
- Panen 2 cara: Klik Kiri (hancurkan) atau Klik Kanan (*Quick Harvest*) menjatuhkan `1x Wheat` + `1-2x Wheat Seeds`.

---

## 5. KURVA ESKALASI MALAM & AI MONSTER

- **Pemisahan Kuota Mob**:
  - `mobCapPassive`: 16 ekor di PC / 9 di HP (Sapi, Ayam, Babi, Kambing, Kura-kura, Villager).
  - `mobCapHostile`: 5 hingga 18 ekor di PC / 3 hingga 10 di HP.
- **Radius AI Aggro**: 35 Blok.
- **Fase Malam Hari**:
  - **Fase Awal (Hari 1–5)**: 5 monster, spawn reguler, HP standar (20 HP).
  - **Fase Menengah (Hari 6–10)**: 11 monster, spawn beruntun, monster $+7$ HP ekstra.
  - **Fase Puncak Survival (Hari 11–15)**: 18 monster agresif, spawn sangat padat, bonus hingga $+15$ HP ekstra.

---

## 6. CERITA & LAYAR AKHIR PERMAINAN

### 6.1 Pembukaan (Prolog)
> *"Dalam perjalanan pulang, segalanya berubah begitu cepat. Saat kau tersadar, yang tersisa hanyalah hutan belantara yang sunyi dan dingin. Kau harus bertahan hidup selama 15 Hari sampai tim penyelamat tiba!"*

### 6.2 Layar Kemenangan (Victory Screen — Hari 15)
> *"Hari ke-15. Di kejauhan, kau melihat cahaya terang — bukan dari api unggunmu sendiri. Suara langkah dan panggilan familiar memanggil namamu. Bala bantuan akhirnya tiba. Kau selamat dan pulang!"*

### 6.3 Layar Kekalahan (Defeat Screen)
> *"Kegelapan menelanmu di Hari ke-X. Hutan lebat ini menang kali ini — tapi jangan berkecil hati, pengalaman petualangan ini akan membuatmu bertahan lebih kuat berikutnya!"*

### 6.4 Pelacak Statistik (Stats Tracker)
Melacak 9 metrik: Hari Bertahan, Tingkat Kesulitan, Waktu Bermain, Monster Kalah, Blok Hancur, Blok Pasang, Item Dibuat, Makanan Dimakan, dan Jarak Ditempuh.

---

## 7. SINKRONISASI SIKLUS WAKTU

- Durasi 1 Hari = **10 Menit** (600 detik).
- Setiap Game Over / Reset Progres / New Game, waktu di-reset secara mutlak ke **Hari 1 • Pukul 06:00 Pagi (Fajar Cerah)**.
