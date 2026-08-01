# Game Design Document (GDD) Expansion v2.0 — Mini Minecraft

Document Version: 2.0
Target Expansion: Checkpoints CP157–CP238 (Status: SELESAI 100% ✅)

---

## 1. IKHTISAR EXPANSION v2.0

Expansion v2.0 menambahkan 10 sistem utama ke dalam Mini Minecraft:
1. **River, Lake & Water Expansion** (Medan perairan melandai, pantai pasir, penyebaran air dinamis, dan pemblokiran air).
2. **Cave & Underground Expansion** (Ravine, ceruk goa dalam, endapan obsidian, dan lava dasar laut/goa).
3. **Villages & Structures** (Generasi desa otomatis dengan rumah kayu/batu, jalur setapak, dan ladang gandum).
4. **Villager NPCs** (NPC Villager yang berjalan santai di sekitar desa).
5. **Iron Golem** (Neutral mob pelindung desa yang menyerang zombie/monster jika terprovokasi).
6. **Hostile Mobs**:
   - **Skeleton** (Monster pemanah dari jarak jauh).
   - **Spider** (Monster pemanjat dinding/blok).
   - **Enderman** (Monster tinggi yang berteleportasi & terprovokasi jika dilihat).
7. **Passive Mobs**:
   - **Pig, Chicken, Goat, Turtle** (Hewan ternak & laut baru).
8. **Food & Cooking System** (Makanan baru & efek pemulihan darah/stamina).
9. **Nether Portal & Dimension** (Dimensi Nether dengan blok Netherrack, Glowstone, Lava, dan Portal Obsidian).
10. **Polish & Expansion Integration** (Sinkronisasi save/load, UI debug, & optimasi mesh).

---

## 2. SCOPE BOUNDARY v2.0 (BATASAN SCOPE)

FITUR DILUAR SCOPE v2.0 (JANGAN DIIMPLEMENTASIKAN KECUALI DIMINTA EKSPLISIT):
- 🚫 Villager Trading UI / Sistem Transaksi Zamrud.
- 🚫 Breeding / Perbiakan Hewan dengan Makanan.
- 🚫 Redstone / Logic Circuit.
- 🚫 Furnitur Kompleks & Enchanter.

---

## 3. MODUL & STRUKTUR FOLDER

- `src/world/structures/` — VillageGenerator & Prefab Bangunan.
- `src/world/dimension/` — NetherWorld, DimensionManager, PortalDetector.
- `src/mobs/npc/` — Villager.ts, IronGolem.ts.
- `src/mobs/hostile/` — Skeleton.ts, Spider.ts, Enderman.ts.
- `src/mobs/passive/` — Pig.ts, Chicken.ts, Goat.ts, Turtle.ts.
