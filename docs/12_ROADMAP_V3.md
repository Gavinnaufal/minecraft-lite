# ROADMAP V3.0 — Mini Minecraft Expansion

Fase dan Checkpoint CP239 hingga CP296. Melanjutkan penomoran dari v2.0 (berakhir di CP238).

## Fase 26 — Ore Mining & Smelting (CP239–CP248)
- [ ] CP239: BlockRegistry addition: coal_ore (ID21), iron_ore (ID22) + hardness & drop properties
- [ ] CP240: OreGenerator.ts — cluster noise placement (coal Y5-60, iron Y5-40)
- [ ] CP241: Ore cluster threshold tuning (hindari swiss-cheese effect, pola sama seperti obsidian v2.0)
- [ ] CP242: Item baru: raw_iron (drop iron_ore), coal (drop coal_ore, dobel fungsi sebagai fuel)
- [ ] CP243: Furnace smelting mode terpisah dari cooking mode (fuel slot + input slot + output slot)
- [ ] CP244: Furnace UI progress bar arrow & smelting timer
- [ ] CP245: Smelting recipe: raw_iron + fuel → iron_ingot
- [ ] CP246: Pickaxe tier requirement check (stone pickaxe minimum untuk mining iron_ore)
- [ ] CP247: Ore block texture pass (16x16 pixel art, spot pattern di permukaan stone)
- [ ] CP248: Playtest & balance: rasio kemunculan ore per chunk

## Fase 27 — Villager Trading System (CP249–CP256)
- [ ] CP249: Item baru: emerald + villager chest loot table update
- [ ] CP250: TradeTable.ts — struktur data tabel trade generik
- [ ] CP251: VillagerTrading.ts — logic terpisah dari Villager wander AI
- [ ] CP252: Trading Window UI (klik kanan Villager membuka modal)
- [ ] CP253: Trade execution logic (consume item pemain, beri hasil trade)
- [ ] CP254: Trade cooldown per Villager (anti-exploit infinite trade)
- [ ] CP255: Visual feedback trade sukses (particle/sound)
- [ ] CP256: Playtest full trade chain (wheat→emerald→tools)

## Fase 28 — Animal Breeding & Taming (CP257–CP264)
- [ ] CP257: Item-to-mob food matching (Wheat/Seeds per jenis hewan)
- [ ] CP258: Love mode state & heart particle effect saat diberi makan
- [ ] CP259: Breeding detection logic (2 mob in-love berdekatan)
- [ ] CP260: Baby mob spawn & scale 0.5x model
- [ ] CP261: Baby-to-adult growth timer & scale interpolation
- [ ] CP262: Breeding cooldown per mob (anti-spam)
- [ ] CP263: SaveManager: persist baby mob growth state
- [ ] CP264: Playtest breeding chain semua hewan pasif

## Fase 29 — Armor & Equipment System (CP265–CP272)
- [ ] CP265: EquipmentSlots.ts — 4 slot baru (Helmet/Chestplate/Leggings/Boots)
- [ ] CP266: Inventory Screen UI update: equipment panel
- [ ] CP267: Item baru: leather_helmet/chestplate/leggings/boots + iron variant
- [ ] CP268: Crafting recipes armor (Leather tier & Iron tier)
- [ ] CP269: ArmorSystem.ts — damage reduction calculation, integrasi ke takeDamage()
- [ ] CP270: Armor Bar HUD (di samping Health Bar)
- [ ] CP271: Equip/unequip drag-drop logic
- [ ] CP272: Playtest combat balance dengan & tanpa armor

## Fase 30 — Nether Fortress & Boss Mobs (CP273–CP288)
### Sub-fase A: Struktur (CP273–CP278)
- [ ] CP273: BlockRegistry addition: nether_brick (ID23)
- [ ] CP274: NetherFortressGenerator.ts — layout algoritma koridor & ruangan
- [ ] CP275: Fortress placement rule (jarak minimum dari portal spawn point)
- [ ] CP276: Fortress bounding box collision & chunk meshing integration
- [ ] CP277: Fortress loot chest generation
- [ ] CP278: Fortress structure persistence di SaveManager

### Sub-fase B: Flying Mob Foundation (CP279–CP281)
- [ ] CP279: Base class extension: flag isFlying di Mob.ts (tanpa merusak physics ground-mob existing)
- [ ] CP280: Flying pathfinding dasar (hover height maintenance, no gravity)
- [ ] CP281: Fireball.ts projectile entity (reuse pola Arrow.ts v2.0)

### Sub-fase C: Blaze (CP282–CP284)
- [ ] CP282: Blaze base class & 3D model (melayang, particle api)
- [ ] CP283: Blaze ranged attack state & fireball shooting
- [ ] CP284: Blaze blaze_rod drop & death animation

### Sub-fase D: Ghast (CP285–CP288)
- [ ] CP285: Ghast base class & 3D model (raksasa terbang)
- [ ] CP286: Ghast explosive fireball attack (area damage + block destruction opsional)
- [ ] CP287: Ghast ghast_tear drop
- [ ] CP288: Playtest fortress full combat scenario (Blaze + Ghast bersamaan)

## Fase 31 — Master Integration & Polish v3.0 (CP289–CP296)
- [ ] CP289: F3 Debug Screen update: ore count, armor value, trade log
- [ ] CP290: Crafting recipe book pass untuk semua item v3.0
- [ ] CP291: Audio pass: smelting sizzle, trade chime, breeding heart pop, blaze/ghast SFX
- [ ] CP292: SaveManager schema migration test (v2.0 save → v3.0 save)
- [ ] CP293: Balance pass menyeluruh (ore rarity, trade value, armor reduction %, boss damage)
- [ ] CP294: Stress test: fortress + flying mob + existing 30-mob load
- [ ] CP295: Production build verification (`npm run build`)
- [ ] CP296: Documentation update: README.md, docs v3.0, final bug bash & release pass
