# AGENTS.md — Addendum v3.0

File ini berisi bagian yang perlu **ditambahkan/disisipkan** ke `AGENTS.md` kalian yang sudah ada.
Karena file asli kalian bersifat "standing instructions" yang sudah dipakai agent, sengaja dibuat
sebagai addendum terpisah dulu — silakan gabungkan manual ke `AGENTS.md` supaya kamu bisa review
sebelum jadi instruksi permanen buat agent.

---

## Tambahan di Bagian 1 — SUMBER KEBENARAN

Tambahkan setelah baris nomor 10 (`docs/10_TASK_BOARD_V2.md`):

```
**Dokumen v3.0 (Expansion, CP239–CP296, status: BELUM DIKERJAKAN):**
11. `docs/11_GDD_EXPANSION_V3.md` — desain 5 sistem baru (ore mining & smelting, villager trading,
    animal breeding, armor system, nether fortress & boss mobs). **Baca ini dulu sebelum
    mengerjakan CP239 ke atas**, termasuk bagian "SCOPE BOUNDARY v3.0" supaya tidak menambah fitur
    di luar yang disepakati (misal: JANGAN implementasi XP/enchanting, potion brewing, redstone,
    The End dimension, atau mount/riding — itu sengaja di luar scope v3.0, calon v4.0).
12. `docs/12_ROADMAP_V3.md` — checkpoint CP239-296, melanjutkan penomoran dari v2.0.
13. `docs/13_PROMPT_AI_V3.md` — instruksi detail per CP239-296 (baru terisi lengkap sampai CP248,
    sisanya menyusul bertahap sesuai progress — ikuti pola yang sama seperti v2.0 yang juga
    awalnya cuma terisi sampai CP178).
14. `docs/14_TASK_BOARD_V3.md` — status progress CP239-296, terpisah dari task board v1/v2 tapi
    saling melengkapi.
```

Update juga baris "Jika user hanya bilang 'lanjut'..." jadi:

```
Jika user hanya bilang "lanjut" atau "kerjakan checkpoint berikutnya": cek
`docs/14_TASK_BOARD_V3.md` dulu (kalau masih ada CP yang belum ✅ di sana, lanjutkan dari situ —
v1 & v2 sudah 100% selesai, jangan cek task board lama kecuali untuk bugfix regresi).
```

---

## Tambahan di Bagian 3 — STANDAR KODE

Tambahkan folder baru yang sah untuk v3.0 (setelah daftar folder v2.0):

```
- **Untuk v3.0, folder baru berikut ini SAH/diizinkan** (sudah direncanakan di `12_ROADMAP_V3.md`):
  - `src/world/ores/` — OreGenerator.ts (cluster placement bijih)
  - `src/world/structures/nether/` — NetherFortressGenerator.ts & prefab fortress
  - `src/economy/` — TradeTable.ts, Currency.ts
  - `src/player/equipment/` — ArmorSystem.ts, EquipmentSlots.ts
  - `src/entities/projectiles/` — Fireball.ts (reuse pola Arrow.ts v2.0)
  - File baru di `src/mobs/hostile/` (Blaze.ts, Ghast.ts) dan `src/mobs/npc/` (VillagerTrading.ts)
    — mengikuti pola yang sudah ada.
```

---

## Tambahan di Bagian 8 — RIWAYAT BUG PENTING

Tambahkan catatan preventif berikut (belum jadi bug nyata, tapi berdasarkan analisis desain v3.0
sebelum coding dimulai — supaya dihindari sejak awal):

```
- **[PREVENTIF v3.0] Ore generation berpotensi swiss-cheese effect**: pola sama seperti cave
  generation & obsidian cluster v2.0 — gunakan threshold noise ketat sejak awal untuk
  coal_ore/iron_ore, jangan mulai longgar lalu diperbaiki belakangan (lihat riwayat CP165-168 &
  CP206 di atas untuk referensi bug yang sama).
- **[PREVENTIF v3.0] Furnace smelting vs cooking mode jangan digabung jadi satu state**: baca dulu
  implementasi cooking existing (CP-212) sebelum menambah smelting (CP243) — kalau state
  tercampur, risiko bug: player masak daging tapi UI nampilin progress smelting besi atau
  sebaliknya.
- **[PREVENTIF v3.0] Flying mob (Blaze/Ghast) adalah entitas terbang pertama**: base class
  Mob.ts saat ini didesain gravity-based (ground mob). Tambahkan flag `isFlying` dengan hati-hati
  supaya tidak merusak physics mob ground-based existing (Cow, Zombie, dst) — uji regresi ke
  semua mob lama setelah CP279 selesai, bukan cuma test Blaze/Ghast saja.
- **[PREVENTIF v3.0] takeDamage() signature harus tetap boolean**: saat menambah ArmorSystem
  (CP269) yang mengintervensi damage calculation, pastikan `takeDamage()` di Player.ts/Mob.ts
  tetap mengembalikan `boolean` (isDead) seperti aturan lama v2.0, jangan diubah jadi void atau
  number tanpa update semua caller.
```

---

## Tambahan di Bagian 6 — KAPAN BERHENTI & BERTANYA KE USER

Tambahkan poin berikut:

```
- Sebuah CP di Fase 30 (Nether Fortress & Boss Mobs) terasa terlalu besar untuk 1 sesi — WAJIB
  diusulkan ke user untuk dipecah jadi sub-langkah (sudah dipecah jadi Sub-fase A-D di
  `12_ROADMAP_V3.md`, tapi kalau 1 CP dalam sub-fase itu sendiri masih terasa besar, pecah lagi).
- Balance numerik baru (rasio ore, harga trade emerald, persentase damage reduction armor,
  damage Blaze/Ghast) tidak tercakup pasti di GDD Expansion v3.0 — ini keputusan desain yang
  butuh konfirmasi user kalau angka default yang diajukan terasa tidak pas saat playtest.
```
