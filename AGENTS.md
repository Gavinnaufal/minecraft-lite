# AGENTS.md
## Instruksi Standing untuk Coding Agent (opencode + DeepSeek V4 Pro)

Proyek: **Mini Minecraft** — voxel sandbox berbasis Three.js + TypeScript + Vite.

---

## 1. SUMBER KEBENARAN (baca sebelum bertindak)

Semua keputusan desain/teknis mengacu ke dokumen di folder `docs/`, urutan prioritas:

1. `docs/04_ROADMAP.md` — daftar 130 checkpoint (CP), kerjakan **berurutan sesuai nomor**, jangan loncat kecuali diminta eksplisit oleh user.
2. `docs/05_PROMPT_DEEPSEEK.md` — instruksi detail & file yang relevan untuk tiap CP. Gunakan ini sebagai spesifikasi tugas utama.
3. `docs/01_GDD.md` — acuan desain gameplay/mekanik jika ada ambiguitas.
4. `docs/02_PRD.md` — acuan requirement & batasan scope (jangan menambah fitur di luar MVP/stretch goals yang tercantum tanpa persetujuan user).
5. `docs/03_ARSITEKTUR_FOLDER.md` — struktur folder & konvensi kode WAJIB diikuti persis, jangan buat struktur folder baru sendiri.
6. `docs/06_TASK_BOARD.md` — status progres, HARUS di-update setiap CP selesai.

Jika user hanya bilang "lanjut" atau "kerjakan checkpoint berikutnya", cek `docs/06_TASK_BOARD.md` untuk tahu CP terakhir yang sudah ✅ Done, lalu kerjakan CP setelahnya.

---

## 2. ATURAN KERJA PER CHECKPOINT

- Kerjakan **satu CP per sesi/permintaan**. Jangan menggabungkan beberapa CP sekaligus kecuali diminta.
- Sebelum menulis kode, baca isi file-file yang disebut di kolom *Files* pada `05_PROMPT_DEEPSEEK.md` untuk CP terkait — jangan berasumsi isi file tanpa membacanya.
- Jangan mengubah file di luar yang relevan dengan CP yang sedang dikerjakan.
- Setelah kode ditulis, jalankan build/dev server (`npm run dev` atau `npm run build`) untuk memastikan tidak ada error kompilasi TypeScript.
- Cocokkan hasil dengan kolom "Output"/acceptance criteria di `04_ROADMAP.md` untuk CP tsb sebelum menyatakan selesai.
- Jika acceptance criteria tidak terpenuhi, perbaiki dulu — jangan lanjut ke CP berikutnya.

---

## 3. STANDAR KODE

- TypeScript **strict mode** — hindari `any` kecuali benar-benar tidak terhindarkan (beri komentar alasan jika terpaksa).
- Ikuti struktur folder di `03_ARSITEKTUR_FOLDER.md` persis: satu domain sistem = satu folder (`world/`, `player/`, `inventory/`, `mobs/`, `save/`, `ui/`, dst).
- Penamaan file: PascalCase untuk class (`ChunkManager.ts`), camelCase untuk util (`math.ts`).
- Gunakan registry pattern (`BlockRegistry.ts`, `ItemRegistry.ts`) untuk data yang bisa berkembang — jangan hardcode daftar blok/item di banyak tempat.
- Modul `core/` tidak boleh punya dependency langsung ke detail `world/` atau `mobs/` — komunikasi lewat interface/event agar tetap modular.
- Jangan menambah dependency npm baru di luar yang sudah ditentukan (`three`, `simplex-noise`, dan tambahan yang eksplisit disebut di prompt CP tertentu) tanpa konfirmasi ke user.

---

## 4. GIT WORKFLOW

- Setiap CP yang selesai dan lolos acceptance criteria = **1 commit terpisah**.
- Format commit message:
  ```
  feat(<modul>): CP-<nomor> <deskripsi singkat>
  ```
  Contoh: `feat(world): CP-24 implement face culling pada chunk mesher`
- Untuk fix bug yang ditemukan setelah CP dianggap selesai, gunakan format:
  ```
  fix(<modul>): bugfix terkait CP-<nomor> <deskripsi bug>
  ```
- Jangan melakukan commit gabungan untuk banyak CP sekaligus — memudahkan rollback jika satu CP menyebabkan regresi.

---

## 5. UPDATE TASK BOARD

Setiap kali sebuah CP selesai dan sudah di-commit:

1. Buka `docs/06_TASK_BOARD.md`.
2. Centang checklist CP terkait di bagian "CHECKLIST DETAIL PER FASE" (`- [ ]` → `- [x]`).
3. Update tabel "RINGKASAN PROGRESS" (jumlah selesai & persentase per fase).
4. Jika CP tsb tadinya di-note di tabel "BLOCKED / BUG", pindahkan statusnya dan catat cara penyelesaiannya.

---

## 6. KAPAN BERHENTI & BERTANYA KE USER

Jangan lanjut otomatis dan tanyakan dulu ke user jika:

- Acceptance criteria sebuah CP ambigu atau tidak bisa dipenuhi dengan pendekatan yang sudah dicoba.
- Sebuah CP butuh keputusan desain yang tidak tercakup di GDD/PRD (misal ukuran numerik, balance gameplay).
- Terjadi error yang mengindikasikan masalah di luar scope CP saat ini (misal bug di CP sebelumnya yang baru ketahuan).
- Ada permintaan yang akan menambah dependency baru, mengubah stack teknis, atau keluar dari scope MVP/stretch goals di PRD.

---

## 7. MODE REASONING (DeepSeek V4 Pro)

- Gunakan reasoning effort **tinggi** untuk CP yang melibatkan algoritma kompleks: chunk meshing (CP23-25, CP33), noise/world generation (CP36-45), collision/physics (CP56-65), AI mob (CP89-96), optimasi performa (CP109-115).
- Reasoning standar cukup untuk CP setup, UI, dan boilerplate sederhana.
- Untuk task repetitif/volume tinggi (banyak file kecil serupa), boleh disarankan pindah ke `deepseek-v4-flash` demi efisiensi biaya — tanyakan ke user dulu sebelum switch model.