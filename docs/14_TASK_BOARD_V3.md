# TASK BOARD V3.0 — Mini Minecraft Expansion

## Expansion Progress

| Fase | CP Range | Selesai | % |
|---|---|---|---|
| Fase 26 — Ore Mining & Smelting | 239–248 | 7 | 70% |
| Fase 27 — Villager Trading System | 249–256 | 0 | 0% |
| Fase 28 — Animal Breeding & Taming | 257–264 | 0 | 0% |
| Fase 29 — Armor & Equipment System | 265–272 | 0 | 0% |
| Fase 30 — Nether Fortress & Boss Mobs | 273–288 | 0 | 0% |
| Fase 31 — Master Integration & Polish v3.0 | 289–296 | 0 | 0% |
| **TOTAL EXPANSION (v3.0)** | | **0** | **0%** |

---

## CHECKLIST DETAIL V3.0

### Fase 26 — Ore Mining & Smelting (7/10)
- [x] CP-239: BlockRegistry addition: coal_ore, iron_ore
- [x] CP-240: OreGenerator.ts cluster noise placement
- [x] CP-241: Ore cluster threshold tuning
- [x] CP-242: Item baru: raw_iron, coal
- [x] CP-243: FurnaceScreen 3-slot UI modal + FurnaceManager + SaveManager persistence (Desain v3.0: Memasak daging mentah kini wajib lewat Furnace UI + Fuel 5s, menggantikan instant right-click CP-212)
- [x] CP-244: Furnace UI progress bar arrow SVG animation + fuel burn timer indicator
- [x] CP-245: Smelting recipe raw_iron + fuel → iron_ingot (Registrasi terpusat di Recipes.ts)
- [ ] CP-246: Pickaxe tier requirement check
- [ ] CP-247: Ore block texture pass
- [ ] CP-248: Playtest & balance rasio ore

### Fase 27 — Villager Trading System (0/8)
- [ ] CP-249: Item baru: emerald + loot table update
- [ ] CP-250: TradeTable.ts struktur data
- [ ] CP-251: VillagerTrading.ts logic terpisah
- [ ] CP-252: Trading Window UI
- [ ] CP-253: Trade execution logic
- [ ] CP-254: Trade cooldown per Villager
- [ ] CP-255: Visual feedback trade sukses
- [ ] CP-256: Playtest full trade chain

### Fase 28 — Animal Breeding & Taming (0/8)
- [ ] CP-257: Item-to-mob food matching
- [ ] CP-258: Love mode state & heart particle
- [ ] CP-259: Breeding detection logic
- [ ] CP-260: Baby mob spawn & scale 0.5x
- [ ] CP-261: Baby-to-adult growth timer
- [ ] CP-262: Breeding cooldown per mob
- [ ] CP-263: SaveManager persist baby growth state
- [ ] CP-264: Playtest breeding chain

### Fase 29 — Armor & Equipment System (0/8)
- [ ] CP-265: EquipmentSlots.ts 4 slot baru
- [ ] CP-266: Inventory Screen UI update
- [ ] CP-267: Item baru armor leather & iron
- [ ] CP-268: Crafting recipes armor
- [ ] CP-269: ArmorSystem.ts damage reduction
- [ ] CP-270: Armor Bar HUD
- [ ] CP-271: Equip/unequip drag-drop logic
- [ ] CP-272: Playtest combat balance

### Fase 30 — Nether Fortress & Boss Mobs (0/16)
- [ ] CP-273: BlockRegistry addition: nether_brick
- [ ] CP-274: NetherFortressGenerator.ts layout
- [ ] CP-275: Fortress placement rule
- [ ] CP-276: Fortress bounding box collision
- [ ] CP-277: Fortress loot chest generation
- [ ] CP-278: Fortress structure persistence
- [ ] CP-279: Base class flag isFlying di Mob.ts
- [ ] CP-280: Flying pathfinding dasar
- [ ] CP-281: Fireball.ts projectile entity
- [ ] CP-282: Blaze base class & 3D model
- [ ] CP-283: Blaze ranged attack state
- [ ] CP-284: Blaze blaze_rod drop
- [ ] CP-285: Ghast base class & 3D model
- [ ] CP-286: Ghast explosive fireball attack
- [ ] CP-287: Ghast ghast_tear drop
- [ ] CP-288: Playtest fortress full combat

### Fase 31 — Master Integration & Polish v3.0 (0/8)
- [ ] CP-289: F3 Debug Screen update
- [ ] CP-290: Crafting recipe book pass
- [ ] CP-291: Audio pass v3.0
- [ ] CP-292: SaveManager schema migration test (v2.0 → v3.0)
- [ ] CP-293: Balance pass menyeluruh
- [ ] CP-294: Stress test fortress + flying mob + existing load
- [ ] CP-295: Production build verification
- [ ] CP-296: Documentation update & final bug bash

---

## BLOCKED / BUG & REFACTOR NOTES
- [x] **[BUGFIX] Furnace Block ID & Raw Meat Instant-Eat Removal**:
  - Menambahkan registrasi blok `furnace` yang sah di `BlockRegistry.ts` (ID 23, `solid: true`, `hardness: 3.5`).
  - Menambahkan item `furnace` di `ItemRegistry.ts` (`isBlock: true`, `blockId: 23`).
  - Menambahkan resep crafting 8x `stone` → 1x `furnace` di `Recipes.ts`.
  - Memperbaiki `main.ts`: klik kanan `hitBlockId === 23` untuk membuka `FurnaceScreen`, mengembalikan `sandstone` (ID 10) sebagai blok biasa.
  - Menutup opsi makan langsung untuk `raw_beef`, `raw_porkchop`, `raw_chicken`, `mutton` di `main.ts` (wajib lewat Furnace UI + Fuel). `rotten_flesh` tetap bisa dimakan mentah.
  - Memperbarui tabel Block Registry & Crafting Guide di `README.md` agar 100% sinkron dengan `BlockRegistry.ts`.
