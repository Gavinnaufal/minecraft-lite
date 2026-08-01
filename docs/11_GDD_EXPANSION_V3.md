# Game Design Document (GDD) Expansion v3.0 — Mini Minecraft

Document Version: 3.0
Target Expansion: Checkpoints CP239–CP296
Prasyarat: v1.0 (CP1–156) & v2.0 (CP157–238) berstatus SELESAI 100%.

---

## 1. IKHTISAR EXPANSION v3.0

Expansion v3.0 menutup gap desain yang muncul selama audit v1.0 & v2.0, lalu menambah 5 sistem utama:

1. **Ore Mining & Smelting** — blok bijih (`iron_ore`, `coal_ore`) yang bisa ditambang & dilebur di Furnace jadi Iron Ingot. Ini **bukan** sistem cooking baru (cooking daging sudah selesai di CP-212) — murni menutup lubang bahwa Iron Ingot sebelumnya cuma bisa didapat dari drop Iron Golem.
2. **Villager Trading System** — UI perdagangan dengan Villager, mata uang Emerald.
3. **Animal Breeding & Taming** — breeding Cow/Pig/Chicken/Goat dengan makanan, baby mob yang tumbuh seiring waktu.
4. **Armor & Equipment System** — slot equipment, armor dari Leather/Iron, armor bar pengurang damage. Memberi kegunaan pada item Leather yang sejak v2.0 diproduksi Cow tapi tidak punya recipe apa pun.
5. **Nether Fortress & Boss Mobs (Blaze, Ghast)** — struktur end-game di Nether dengan 2 mob baru bertipe ranged/flying.

> ⚠️ **Catatan skala:** Sistem #5 (Nether Fortress & Boss) kompleksitasnya setara gabungan Fase 20 (Village Generation) + Fase 22 (Hostile Mobs ranged) dari v2.0. JANGAN diperlakukan sebagai "fitur kecil di akhir" — rencanakan sesi terpisah per checkpoint, jangan dipaksakan sekaligus.

---

## 2. SCOPE BOUNDARY v3.0 (BATASAN SCOPE)

FITUR DI LUAR SCOPE v3.0 (JANGAN DIIMPLEMENTASIKAN KECUALI DIMINTA EKSPLISIT):
- 🚫 Sistem XP/Level & Enchanting Table (butuh fondasi XP yang belum ada sama sekali di codebase — ini calon v4.0).
- 🚫 Potion Brewing / Brewing Stand.
- 🚫 Redstone / Logic Circuit.
- 🚫 The End dimension / Ender Dragon.
- 🚫 Horse/mount & animal riding.
- 🚫 Villager profession-specific trade tables (pandai besi vs petani dst.) — cukup 1 tabel trade generik per Villager di v3.0.

---

## 3. DETAIL SISTEM

### 3.1 Ore Mining & Smelting
- Blok baru: `coal_ore` (ID 21), `iron_ore` (ID 22), `raw_iron` (item drop dari `iron_ore`, bukan langsung Iron Ingot — harus dilebur dulu).
- Generasi: `coal_ore` muncul di Y 5–60 (umum), `iron_ore` muncul di Y 5–40 (lebih jarang), pakai cluster noise seperti pola obsidian cluster v2.0 (ingat catatan bug "swiss cheese" — pakai threshold ketat sejak awal).
- Furnace: tambahkan mode smelting ore terpisah dari mode cooking daging yang sudah ada — smelting butuh bahan bakar (`coal` sebagai fuel item hasil break `coal_ore`, atau `plank`) di slot bawah, `raw_iron` di slot atas, output `iron_ingot`.
- UI Furnace: tambahkan progress bar arrow (mengacu pola UI yang sudah ada di Crafting/Chest screen).

### 3.2 Villager Trading System
- Klik kanan Villager → buka Trading Window (mirip pola modal Chest 27-slot yang sudah ada, tapi 1 baris trade slot).
- Currency: `emerald` (item baru, drop dari Villager chest loot & bisa didapat dari trading balik).
- Tabel trade generik contoh: 5x Wheat → 1x Emerald; 1x Emerald → 3x Bread; 3x Emerald → 1x Iron Sword; 5x Emerald → 1x Bow + 5x Arrow.
- Trade cooldown per Villager (tidak bisa infinite-trade instan) agar tidak jadi item duplication exploit.

### 3.3 Animal Breeding & Taming
- Pegang item makanan spesifik dekat mob dewasa (Wheat untuk Cow/Goat, Seeds untuk Chicken, item makanan babi) → klik kanan mob → efek particle hati.
- Dua mob dewasa jenis sama dalam radius pendek & keduanya "in love mode" (timer ±5 detik) → spawn 1 baby mob di antara mereka, lalu kedua induk masuk cooldown breeding (mencegah spam breeding).
- Baby mob: scale 0.5x model dewasa, tumbuh jadi dewasa penuh setelah durasi tertentu (real-time timer, tersimpan di save state).

### 3.4 Armor & Equipment System
- 4 slot equipment baru di Inventory Screen: Helmet, Chestplate, Leggings, Boots.
- Material: Leather (tier rendah) dan Iron Ingot (tier tinggi) — mengikuti pola numerik reduction damage khas Minecraft (persentase damage reduction per slot terisi).
- Armor Bar baru di HUD, di samping Health Bar yang sudah ada.
- Damage reduction diterapkan di titik yang sama dengan `takeDamage()` di `Mob.ts`/`Player.ts` — **ingat catatan bug v2.0**: `takeDamage` mengembalikan `boolean` (`isDead`), pertahankan signature ini saat menambah logic reduction.

### 3.5 Nether Fortress & Boss Mobs
- Struktur `NetherFortress` (blok baru: `nether_brick`, ID 23) di-generate di NetherWorld saat chunk pertama kali dimuat, dengan syarat jarak minimum dari portal spawn (mencegah fortress menimpa area teleport).
- **Blaze**: mob melayang (flying state, bukan ground-based seperti mob lain — butuh state machine baru di luar pola walk/jump yang ada), menembak fireball ranged, drop `blaze_rod`.
- **Ghast**: mob terbang besar, menembak explosive fireball dari jarak jauh, drop `ghast_tear`.
- Karena Blaze & Ghast adalah entitas **terbang pertama** di game ini, `PlayerCollision.ts`/`Mob.ts` physics dasar (gravity-based) tidak berlaku — butuh flag `isFlying` baru pada base class Mob, didesain agar tidak merusak physics mob ground-based yang sudah ada.

---

## 4. MODUL & STRUKTUR FOLDER BARU

- `src/world/ores/` — `OreGenerator.ts` (cluster placement untuk coal_ore & iron_ore).
- `src/world/structures/nether/` — `NetherFortressGenerator.ts`, prefab koridor & ruangan fortress.
- `src/mobs/hostile/` — tambahan `Blaze.ts`, `Ghast.ts` (dengan flag `isFlying`).
- `src/mobs/npc/` — extend `Villager.ts` dengan `VillagerTrading.ts` terpisah (jangan campur logic wander AI dengan logic trading).
- `src/economy/` — `TradeTable.ts`, `Currency.ts` (Emerald handling).
- `src/player/equipment/` — `ArmorSystem.ts`, `EquipmentSlots.ts`.
- `src/entities/projectiles/` — extend folder `entities/` v2.0 dengan `Fireball.ts` (dipakai Blaze & Ghast, mirip pola `Arrow.ts`).

---

## 5. RIWAYAT KEPUTUSAN (agar tidak diulang tanya ke user)

- Smelting ore **dipisah** dari cooking daging di Furnace — dua mode berbeda, bukan digabung jadi satu resep universal.
- Nether Fortress **wajib** dipecah minimal 3-4 sesi terpisah (generation, Blaze, Ghast, loot) — jangan sekaligus dalam 1 CP besar.
- Armor tidak memberi bonus lain (speed, dsb) di v3.0, murni damage reduction — fitur enchant/bonus stat ditunda ke v4.0 (di luar scope, lihat bagian 2).
