# GAME DESIGN DOCUMENT — SURVIVAL MODE
## Mini Minecraft → "15 Hari di Hutan" (nama sementara)

**Versi:** 1.0
**Sifat perubahan:** TOTAL TRANSFORMATION — mengganti mode sandbox bebas jadi satu-satunya cara main
**Terinspirasi dari:** "99 Nights in the Forest" (Roblox) — hanya konsep genre, semua nama/aset/cerita orisinal buatan sendiri

---

## 1. VISI GAME

Pemain terdampar sendirian di hutan setelah sebuah kejadian tragis (detail cerita di bagian 6). Dia harus bertahan hidup selama **15 hari** — membangun tempat berlindung, mencari makanan, membuat alat, dan melawan/menghindar dari monster yang makin berbahaya tiap harinya — sampai akhirnya diselamatkan di hari terakhir.

**Pilar desain:**
1. **Ada tujuan jelas** — bukan sandbox tanpa akhir, tapi ada "menang" (bertahan sampai hari 15) dan "kalah" (nyawa habis).
2. **Makin hari makin susah** — pemain harus terus beradaptasi, bukan cuma jalan santai selamanya.
3. **Base camp jadi pusat strategi** — bukan cuma tempat tinggal, tapi benteng yang harus dikembangkan.
4. **Kesulitan bisa dipilih** — biar pemain baru dan pemain yang suka tantangan sama-sama bisa menikmati.

---

## 2. GAMEPLAY LOOP UTAMA

```
Pilih Kesulitan → Mulai Hari 1 → Cari bahan siang hari 
  → Bangun/perkuat base camp → Masak makanan → Bertahan malam hari
  → Hari berganti → (makin susah) → ... → Bertahan sampai Hari 15
  → MENANG (cerita akhir bahagia) 
  
  ATAU jika nyawa habis di tengah jalan → KALAH (sesuai aturan nyawa 
  dari kesulitan yang dipilih)
```

---

## 3. SISTEM KESULITAN (mengatur semuanya sekaligus)

Dipilih 1x di awal permainan, lewat layar baru sebelum mulai main.

| | 🟢 Santai | 🟡 Normal | 🔴 Susah |
|---|---|---|---|
| **Kalau mati** | Kena penalti kecil (kehilangan sebagian item dari inventory), lanjut terus dari posisi terakhir | Dikasih 3 kesempatan (nyawa), baru setelah 3x mati ulang dari Hari 1 | Sekali mati langsung ulang dari Hari 1 total |
| **Kecepatan lapar** | Pelan — hunger berkurang lambat | Sedang | Cepat — harus rajin makan |
| **Kenaikan kesulitan harian** | Monster bertambah pelan, cuaca jarang mengganggu | Monster + kadang cuaca buruk, kenaikan sedang | Monster + cuaca buruk, kenaikan paling cepat dari semua tingkat |

---

## 4. SISTEM HARI & KURVA KESULITAN

- Total **15 hari** untuk menang.
- 1 hari = kombinasi siang (waktu aman/kerja) + malam (waktu berbahaya), memakai `DayNightCycle.ts` yang sudah ada, cukup disesuaikan durasinya kalau perlu.
- Dibagi 3 fase:

| Fase | Hari | Karakteristik |
|---|---|---|
| **Awal** | 1–5 | Monster sedikit, waktu buat belajar, kumpul bahan dasar, bangun base awal |
| **Tengah** | 6–10 | Monster bertambah jumlah & variasi, base camp mulai diuji |
| **Akhir** | 11–15 | Paling berat — monster terbanyak/terkuat, cuaca buruk (jika ada), base camp harus sudah kuat |

- Di akhir Hari 15 (kalau pemain masih hidup) → trigger layar **Menang** dengan cerita penutup.
- Kalau nyawa habis sebelum Hari 15 → trigger layar **Kalah**, perlakuan sesuai tabel kesulitan di atas.

---

## 5. BASE CAMP (pusat strategi)

### 5.1 Membangun
- Pemain bebas pilih lokasi kapan saja (tidak dibatasi 1 tempat permanen — tapi disarankan menetap karena efisiensi waktu).
- Menggunakan sistem build blok yang sudah ada (break/place block, crafting).

### 5.2 Pertahanan
- **Pagar (Fence):** blok baru, tinggi 1.5 blok, menghalangi jalan mob darat tapi tidak menghalangi pandangan/serangan pemain. Bisa di-craft dari plank.
- **Perangkap (Spike Trap):** blok baru, taruh di tanah, otomatis memberi damage ke mob (BUKAN ke pemain) yang melangkah di atasnya. Di-craft dari stick + stone.
- *(Stretch/opsional nanti: perangkap tipe lain, pagar yang bisa dibuka-tutup kayak pintu — belum untuk versi pertama.)*

---

## 6. CERITA (AWAL → AKHIR)

### 6.1 Pembukaan (ditampilkan sebagai teks singkat sebelum Hari 1 dimulai)
Contoh kerangka (boleh disesuaikan/diperhalus nanti):
> *"Dalam perjalanan pulang, semuanya berubah begitu cepat. Saat kau tersadar, yang tersisa hanya hutan lebat dan keheningan. Tidak ada tanda arah, tidak ada seorang pun. Yang kau tahu, kau harus bertahan — sampai seseorang datang mencarimu."*

### 6.2 Penutup — MENANG (ditampilkan setelah bertahan sampai Hari 15)
Contoh kerangka:
> *"Hari ke-15. Di kejauhan, kau melihat cahaya — bukan dari api unggunmu sendiri. Suara familiar memanggil namamu. Setelah semua yang telah kau lalui, akhirnya... kau pulang."*

### 6.3 Penutup — KALAH (ditampilkan sesuai aturan kesulitan, saat benar-benar habis nyawa)
Contoh kerangka (nada berbeda dari menang, tapi tidak harus terasa "game over" yang dingin):
> *"Kegelapan menelanmu. Hutan ini menang kali ini — tapi ceritamu belum selesai."* (lalu tombol "Coba Lagi")

*(Detail teks final bisa diperhalus belakangan sama-sama — kerangka di atas cukup buat mulai implementasi sistemnya dulu.)*

---

## 7. PERUBAHAN DARI GAME SEKARANG (implikasi teknis, level desain)

Karena ini **mengganti total**, bukan menambah mode terpisah, berikut yang berubah dari game yang sudah ada:

- **Main Menu**: sebelum "New Game" dimulai, ada layar baru pilih kesulitan.
- **Tidak ada lagi main "bebas tanpa akhir"** — selalu ada hari berjalan & kondisi menang/kalah.
- **Sistem nyawa baru** — belum ada di game sekarang, perlu dibuat dari nol (beda dari HP/health biasa yang sudah ada).
- **Hunger sudah direncanakan sebelumnya** (di dokumen v2.0 lama, Fase 26) — tinggal dipastikan kecepatannya bisa diatur sesuai kesulitan.
- **Sprint sudah ada** — cukup dipastikan tetap berfungsi baik dalam konteks kabur dari bahaya.
- **World generation, crafting, mob, dll yang sudah ada** — TETAP DIPAKAI SEMUA, tidak dibuang. Survival Mode ini "membungkus" semua sistem yang sudah ada dengan tujuan/aturan baru, bukan membangun ulang dari nol.

---

## 8. HAL YANG BELUM DIPUTUSKAN (akan dibahas belakangan, jangan dikerjakan dulu)

- Detail final teks cerita pembuka/penutup
- Apakah ada variasi cerita tergantung kesulitan yang dipilih
- Detail suara/musik untuk momen menang/kalah
- Apakah base camp bisa lebih dari 1 titik atau harus 1 saja
