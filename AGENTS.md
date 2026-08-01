# AGENTS.md
## Instruksi Standing untuk AI Coding Agent (Antigravity / opencode / agent lain)

Proyek: **Mini Minecraft** — voxel sandbox berbasis Three.js + TypeScript + Vite.

> **Update v2.0:** file ini menggantikan versi sebelumnya yang berjudul "untuk opencode + DeepSeek V4 Pro" — sekarang project dikerjakan lewat Antigravity, jadi instruksi dibuat tool-agnostic. Isi & aturan kerja tidak berubah, cuma referensi dokumen ditambah untuk expansion v2.0.

---

## 1. SUMBER KEBENARAN (baca sebelum bertindak)

Semua keputusan desain/teknis mengacu ke dokumen di folder `docs/`, urutan prioritas:

**Dokumen v1.0 (MVP, CP1–CP156, status: SELESAI):**
1. `docs/04_ROADMAP.md` — checkpoint 1-130 asli.
2. `docs/05_PROMPT_DEEPSEEK.md` — prompt detail CP1-130.
3. `docs/01_GDD.md` — desain gameplay dasar.
4. `docs/02_PRD.md` — requirement & scope v1.0.
5. `docs/03_ARSITEKTUR_FOLDER.md` — struktur folder inti.
6. `docs/06_TASK_BOARD.md` — status CP1-156 (termasuk Fase 16-17 tambahan yang sudah dikerjakan di luar rencana awal).

**Dokumen v2.0 (Expansion, CP157–CP238, status: SELESAI 100%):**
7. `docs/07_GDD_EXPANSION_V2.md` — desain 10 sistem baru (ocean, cave expansion, village, golem, skeleton, spider, enderman, nether portal, animal baru, food/cooking). **Baca ini dulu sebelum mengerjakan CP157 ke atas**, termasuk bagian "SCOPE BOUNDARY v2.0" di akhir dokumen supaya tidak menambah fitur di luar yang disepakati (misal: JANGAN implementasi villager trading, ore/smelting, atau breeding — itu sengaja di luar scope v2.0).
8. `docs/08_ROADMAP_V2.md` — checkpoint CP157-238, melanjutkan penomoran dari v1.0.
9. `docs/09_PROMPT_AI_V2.md` — instruksi detail per CP157-238.
10. `docs/10_TASK_BOARD_V2.md` — status progress CP157-238, terpisah dari task board v1 tapi saling melengkapi.

Jika user hanya bilang "lanjut" atau "kerjakan checkpoint berikutnya": cek `docs/10_TASK_BOARD_V2.md` dulu (kalau masih ada CP yang belum ✅ di sana, lanjutkan dari situ — jangan cek `06_TASK_BOARD.md` karena v1 & v2 sudah 100% selesai).

---

## 2. ATURAN KERJA PER CHECKPOINT

- Kerjakan **satu CP per sesi/permintaan**. Jangan menggabungkan beberapa CP sekaligus kecuali diminta.
- Sebelum menulis kode, baca isi file-file yang relevan (disebutkan langsung di teks prompt CP terkait, atau bisa diinfer dari nama file/folder yang disinggung) — jangan berasumsi isi file tanpa membacanya, terutama untuk file yang sudah pernah di-fix beberapa kali (ChunkMesher.ts, Raycaster.ts, main.ts) supaya tidak mengulang bug yang sudah pernah diperbaiki.
- Jangan mengubah file di luar yang relevan dengan CP yang sedang dikerjakan.
- Setelah kode ditulis, jalankan `npm run dev` (atau `npm run build`) untuk memastikan tidak ada error kompilasi TypeScript.
- Cocokkan hasil dengan kolom "Output"/acceptance criteria di roadmap (v1 atau v2 sesuai CP) sebelum menyatakan selesai — **jangan menandai CP selesai hanya karena kode compile tanpa error**, verifikasi behavior/visual nyata di game (lihat catatan audit di `10_TASK_BOARD_V2.md`).
- Jika acceptance criteria tidak terpenuhi, perbaiki dulu — jangan lanjut ke CP berikutnya.

---

## 3. STANDAR KODE

- TypeScript **strict mode** — hindari `any` kecuali benar-benar tidak terhindarkan (beri komentar alasan jika terpaksa).
- Ikuti struktur folder di `03_ARSITEKTUR_FOLDER.md` sebagai basis. **Untuk v2.0, folder baru berikut ini SAH/diizinkan** (sudah direncanakan di `08_ROADMAP_V2.md`, bukan penyimpangan):
  - `src/entities/` — proyektil & entitas independen (`Arrow.ts`, `ProjectileManager.ts`)
  - `src/world/structures/` — village generator & prefab bangunan (`VillageGenerator.ts`, `OakHousePrefab.ts`, `VillageLoot.ts`)
  - `src/world/dimension/` — Nether world, dimension manager, portal detector
  - `src/mobs/npc/` — Villager, IronGolem (NPC/neutral, beda kategori dari passive/hostile)
  - `src/ui/` — UI Renderers & Models (`HandModel.ts`, `IconGenerator.ts`, `SettingsMenu.ts`)
  - `src/multiplayer/` — Sistem Chat & Networking (`ChatBox.ts`, `NetworkManager.ts`)
  - File baru di `src/mobs/hostile/` (`Skeleton.ts`, `Spider.ts`, `Enderman.ts`) dan `src/mobs/passive/` (`Pig.ts`, `Chicken.ts`, `Goat.ts`, `Turtle.ts`) — mengikuti pola yang sudah ada.
  - Di luar daftar ini, tetap berlaku aturan lama: jangan buat struktur folder baru sendiri tanpa konfirmasi user.
- Penamaan file: PascalCase untuk class (`VillageGenerator.ts`), camelCase untuk util.
- Gunakan registry pattern (`BlockRegistry.ts`, `ItemRegistry.ts`) untuk blok/item baru — jangan hardcode di banyak tempat. **Untuk ID blok/item baru: baca dulu isi registry saat ini untuk lihat ID yang sudah dipakai, jangan asumsikan/tebak nomor ID kosong.**
- Mob baru (Villager, IronGolem, Skeleton, Spider, Enderman, Pig, Chicken, Goat, Turtle) **reuse pola `Mob.ts` + `StateMachine.ts`** yang sudah ada — jangan bikin sistem AI paralel dari nol.
- Modul `core/` tidak boleh punya dependency langsung ke detail `world/` atau `mobs/` — komunikasi lewat interface/event.
- Jangan menambah dependency npm baru di luar yang sudah ada tanpa konfirmasi ke user.

---

## 4. GIT WORKFLOW

- Setiap CP yang selesai dan lolos acceptance criteria = **1 commit terpisah**.
- Format commit message:
  ```
  feat(<modul>): CP-<nomor> <deskripsi singkat>
  ```
  Contoh: `feat(mobs): CP-190 buat Skeleton.ts basis state machine`
- Untuk fix bug: `fix(<modul>): bugfix terkait CP-<nomor> <deskripsi bug>`
- Jangan melakukan commit gabungan untuk banyak CP sekaligus.
- **ATURAN PUSH:** Simpan commit di repositori git **lokal**. Jangan langsung me-push (`git push`) setelah tiap CP selesai — lakukan `git push` ke remote GitHub hanya ketika seluruh rangkaian CP/fase telah selesai total atau diminta eksplisit oleh user.

---

## 5. UPDATE TASK BOARD

Setiap kali sebuah CP selesai dan sudah di-commit:

1. Untuk CP1-156: update `docs/06_TASK_BOARD.md` (seharusnya sudah 100%, kecuali ada bugfix ulang).
2. Untuk CP157-238: update `docs/10_TASK_BOARD_V2.md` — centang checklist, update tabel ringkasan progress per fase DAN baris "TOTAL PROJECT (v1+v2)".
3. Jika CP tsb tadinya di-note di tabel "BLOCKED / BUG", pindahkan statusnya dan catat cara penyelesaiannya.

---

## 6. KAPAN BERHENTI & BERTANYA KE USER

Jangan lanjut otomatis dan tanyakan dulu ke user jika:

- Acceptance criteria sebuah CP ambigu atau tidak bisa dipenuhi dengan pendekatan yang sudah dicoba.
- Sebuah CP butuh keputusan desain yang tidak tercakup di GDD/GDD Expansion (misal ukuran numerik, balance gameplay).
- Terjadi error yang mengindikasikan masalah di luar scope CP saat ini.
- Ada permintaan yang akan menambah dependency baru, mengubah stack teknis, atau **menambah fitur yang eksplisit ada di daftar "TIDAK termasuk di v2.0"** pada `07_GDD_EXPANSION_V2.md` (villager trading, ore/smelting, breeding, dst) — kalau user memang mau itu, itu perlu jadi keputusan sadar bukan scope creep otomatis dari agent.
- Sebuah CP di Fase 24 (Nether Portal & Dimension) terasa terlalu besar untuk 1 sesi — boleh diusulkan ke user untuk dipecah jadi sub-langkah, jangan dipaksakan sekaligus sampai kode jadi berantakan.

---

## 7. MODE REASONING

- Gunakan reasoning effort **tinggi** untuk CP yang melibatkan algoritma kompleks:
  - v1.0: chunk meshing, noise/world generation, collision/physics, AI mob, optimasi performa.
  - v2.0: **seluruh Fase 24 (Nether Portal & Dimension)** tanpa terkecuali, Village generation (Fase 20), Enderman teleport & provokasi (CP202-203), Skeleton projectile (CP192-193), Spider wall-climbing (CP197).
- Reasoning standar cukup untuk CP setup, UI, boilerplate, dan animal baru yang murni reuse pola Cow.ts (Fase 23).

---

## 8. RIWAYAT BUG PENTING (jangan diulang)

Beberapa bug signifikan yang pernah terjadi di v1.0 & v2.0 dan cara benarnya, sebagai referensi supaya tidak terulang saat menyentuh sistem terkait:

- **Water/leaves tidak ter-render**: gara-gara fungsi `isSolid()` mencampur konsep "solid" dan "opaque" jadi satu. Solusinya: pisahkan `isSolid` (cek `block.solid` saja) dan `isOpaque` (`block.solid && !block.transparent`). Relevan lagi saat menambah blok baru v2.0 (obsidian, netherrack, glowstone, lava, nether_portal) — pastikan properti solid/transparent tiap blok baru didefinisikan dengan benar sejak awal.
- **`geometry.addGroup()` salah assign material**: karena quad ditulis ke buffer sesuai urutan sweep per-plane (tercampur antar blockId), padahal `addGroup()` butuh quad per-blockId contiguous. Solusinya: kumpulkan quad per-blockId dulu (Map), baru flatten berurutan. Relevan lagi kalau NetherWorld (CP210) punya banyak variasi blok yang saling bersebelahan.
- **Cave generation terlalu agresif ("swiss cheese effect")**: threshold noise terlalu longgar + depth range terlalu dekat surface. Untuk ravine (CP165-168) dan obsidian cluster (CP206), gunakan threshold ketat sejak awal, jangan mulai dari nilai longgar lalu diperbaiki belakangan.
- **Raycaster menganggap non-solid block sebagai target valid**: dulu cuma cek `blockId !== 0`, seharusnya cek `block.solid`. Kalau nanti Raycaster.ts disentuh lagi untuk fitur v2.0 (misal target Villager/mob untuk interaksi), pastikan tetap pakai `block.solid` check yang sudah benar, jangan regresi ke `!== 0`.
- **`takeDamage` return signature**: `takeDamage(amount: number)` di `Mob.ts` mengembalikan `boolean` (artinya `isDead`), bukan `void`. Saat meng-override `takeDamage` di subclass (`Enderman.ts`, dll), selalu kembalikan `boolean` agar type-checking TypeScript `tsc` lolos tanpa error.
- **Enderman Rapid Spinning & Unprovoked Attack**: Gerakan wander Enderman memerlukan timer 3–5 detik agar tidak berputar di tempat. Provokasi tatapan mata memerlukan *0.8s continuous gaze hold* dengan *Pointer Lock* aktif sebelum menjadi marah.
- **Mob Stay Red Forever**: Modifikasi `emissive` terpisah di `MobManager` membuat material tertimpa permanen. Pemulihan material harus menggunakan `hitFlashTimer` dan `resetMaterials()` yang dipanggil langsung di `Mob.ts` `updatePhysics()`.
- **Village Terrain Constraint Too Strict**: Syarat elevasi desa sebelumnya terlalu ketat (`<= 5` blok variation), membuat desa tidak pernah ter-spawn. Solusinya: gunakan `getVillageCenter` dengan toleransi bukit `<= 14` blok dan sediakan **Guaranteed Starter Village** pada grid `(0,0)`.
- **Spider & Undead Day/Night Mechanics**: Undead (Zombie & Skeleton) wajib terbakar saat terkena matahari langsung di siang hari. Spider harus berada dalam status netral pada siang hari dan hanya menjadi agresif pada malam hari / saat diprovokasi.