# TASK BOARD V2.0 — Mini Minecraft Expansion

## Expansion Progress

| Fase | CP Range | Selesai | % |
|---|---|---|---|
| Fase 18 — River & Water Polish | 157–164 | 8 | 100% |
| Fase 19 — Cave Expansion & Ravines | 165–168 | 4 | 100% |
| Fase 20 — Village Generation & Prefabs | 173–181 | 1 | 11% |
| Fase 21 — Villager NPC & Iron Golem | 182–189 | 0 | 0% |
| Fase 22 — Hostile Mobs (Skeleton, Spider, Enderman) | 190–204 | 0 | 0% |
| Fase 23 — Passive Animals & Food | 205–212 | 0 | 0% |
| Fase 24 — Nether Portal & Dimension | 213–226 | 0 | 0% |
| Fase 25 — Master Integration & Polish | 227–238 | 0 | 0% |
| **TOTAL EXPANSION (v2.0)** | | **13** | **16%** |

---

## CHECKLIST DETAIL V2.0

### Fase 18 — River & Water Polish (8/8)
- [x] CP-157: Shallow water terrain depression
- [x] CP-158: Sand beach shore transition
- [x] CP-159: Smoothstep bank slopes
- [x] CP-160: Spawn area protection zone
- [x] CP-161: Water body frequency tuning
- [x] CP-162: Block placement in water
- [x] CP-163: Dynamic water spreading
- [x] CP-164: Tree placement check

### Fase 19 — Cave Expansion & Ravines (4/4)
- [x] CP-165: Ravine generation in HeightMap
- [x] CP-166: Deep cave 3D noise tunnels
- [x] CP-167: Lava pool generation
- [x] CP-168: Underground obsidian cluster generation

### Fase 20 — Village Generation & Prefabs (1/9)
- [x] CP-173: StructureManager & VillageGenerator layout algorithm
- [ ] CP-174: Oak Wood House prefab generator
- [ ] CP-175: Cobblestone House prefab generator
- [ ] CP-176: Dirt path generator connecting village houses
- [ ] CP-177: Small wheat farm field structure in villages
- [ ] CP-178: Village spawn placement on flat Plains biomes
- [ ] CP-179: Structure bounding box collision & chunk meshing integration
- [ ] CP-180: Village chest loot generation
- [ ] CP-181: Structure saving & persistence in SaveManager

### Fase 21 — Villager NPC & Iron Golem (0/8)
- [ ] CP-182: Villager NPC base class & 3D voxel mesh
- [ ] CP-183: Villager wander state & village pathfinding AI
- [ ] CP-184: Villager idle & greeting sound effects
- [ ] CP-185: Iron Golem base class & 3D voxel mesh
- [ ] CP-186: Iron Golem village patrol state machine
- [ ] CP-187: Iron Golem attack state & hostile mob targeting
- [ ] CP-188: Iron Golem knockback attack animation
- [ ] CP-189: Iron Golem spawn in villages & iron ingot drops

### Fase 22 — Hostile Mobs: Skeleton, Spider & Enderman (0/15)
- [ ] CP-190: Skeleton base class & 3D model with bow
- [ ] CP-191: Skeleton wander & chase state
- [ ] CP-192: Arrow projectile entity & physics trajectory
- [ ] CP-193: Skeleton ranged attack state & arrow shooting
- [ ] CP-194: Arrow hit detection & damage to player/mobs
- [ ] CP-195: Skeleton bone & arrow drops
- [ ] CP-196: Spider base class & 3D model (8 legs)
- [ ] CP-197: Spider wall-climbing physics & raycast step
- [ ] CP-198: Spider leap attack & string drops
- [ ] CP-199: Enderman base class & tall 3D model (3 blocks high)
- [ ] CP-200: Enderman purple particle effect
- [ ] CP-201: Enderman neutral wander & stare-trigger provocation logic
- [ ] CP-202: Enderman hostile chase & melee attack
- [ ] CP-203: Enderman random teleportation when hit/provoked
- [ ] CP-204: Enderman Ender Pearl drop item

### Fase 23 — Passive Animals: Pig, Chicken, Goat, Turtle (0/8)
- [ ] CP-205: Pig base class, 3D model & Porkchop item drop
- [ ] CP-206: Chicken base class, 3D model, Feather & Raw Chicken drop
- [ ] CP-207: Goat base class, 3D model & high-jump physics
- [ ] CP-208: Turtle base class, 3D model & beach/water swimming AI
- [ ] CP-209: Animal sound effects pass (Oink, Cluck, Goat Bleat)
- [ ] CP-210: Animal spawning distribution per biome
- [ ] CP-211: Animal flee state when damaged
- [ ] CP-212: Food items: Cooked Porkchop, Cooked Chicken, Bread

### Fase 24 — Nether Portal & Dimension (0/14)
- [ ] CP-213: DimensionType enum (Overworld, Nether) & DimensionManager
- [ ] CP-214: BlockRegistry addition: Obsidian, Netherrack, Glowstone, Lava, Nether Portal
- [ ] CP-215: NetherWorld terrain generator (cavernous ceiling & floor, lava oceans)
- [ ] CP-216: PortalDetector algorithm (4x5 obsidian frame validation)
- [ ] CP-217: Nether Portal block filling & glowing purple material effect
- [ ] CP-218: Portal collision & 3-second teleportation countdown timer
- [ ] CP-219: Dimension transition screen & camera fade effect
- [ ] CP-220: Destination portal auto-generation in target dimension
- [ ] CP-221: Nether ambient lighting & red fog environment settings
- [ ] CP-222: Nether background music & ambient soundscape
- [ ] CP-223: Nether mob spawning rules
- [ ] CP-224: SaveManager support for multi-dimension chunk storage
- [ ] CP-225: Player position coordinate scaling (1 Nether block = 8 Overworld blocks)
- [ ] CP-226: Nether Portal sound effects (portal hum & teleport trigger)

### Fase 25 — Master Integration & Polish (0/12)
- [ ] CP-227: F3 Debug Screen update: Biome, Dimension, Mob Count, Active Chunk info
- [ ] CP-228: Mob Manager performance optimization & distance culling
- [ ] CP-229: Item Drop Manager optimization & pooling
- [ ] CP-230: Audio Manager volume balance & ambient sound crossfade
- [ ] CP-231: HUD Polish & Toast notification for new achievements/discoveries
- [ ] CP-232: Inventory & Crafting recipes pass for all v2.0 items
- [ ] CP-233: Settings Menu polish for dimension render distance & particle detail
- [ ] CP-234: SaveManager schema migration test (v1.0 save -> v2.0 save)
- [ ] CP-235: Stress test: 50+ active mobs & multi-chunk village meshing
- [ ] CP-236: Production build verification (`npm run build`)
- [ ] CP-237: Documentation update: README.md & user control guide
- [ ] CP-238: Final Bug Bash & Release Pass
