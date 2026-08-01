# ROADMAP V2.0 — Mini Minecraft Expansion

Fase dan Checkpoint CP157 hingga CP238:

## Fase 18 — River & Water Polish (CP157–CP164) [SELESAI ✅]
- [x] CP157: Shallow water river & lake terrain depression
- [x] CP158: Sand beach shore transition
- [x] CP159: Smoothstep bank slopes to prevent steep cliffs
- [x] CP160: Spawn area water protection zone
- [x] CP161: Reduce water body frequency by 50%
- [x] CP162: Allow placing blocks inside water
- [x] CP163: Dynamic water spreading on block break
- [x] CP164: Tree placement check to avoid water & sand beaches

## Fase 19 — Cave Expansion & Ravines (CP165–CP172) [SELESAI ✅]
- [x] CP165: Ravine generation noise in HeightMap
- [x] CP166: Deep cave 3D noise tunnels
- [x] CP167: Lava pool generation below Y=12
- [x] CP168: Underground obsidian cluster generation near lava/water

## Fase 20 — Village Generation & Prefabs (CP173–CP181)
- [ ] CP173: StructureManager & VillageGenerator layout algorithm
- [ ] CP174: Oak Wood House prefab generator
- [ ] CP175: Cobblestone House prefab generator
- [ ] CP176: Dirt path generator connecting village houses
- [ ] CP177: Small wheat farm field structure in villages
- [ ] CP178: Village spawn placement on flat Plains biomes
- [ ] CP179: Structure bounding box collision & chunk meshing integration
- [ ] CP180: Village chest loot generation
- [ ] CP181: Structure saving & persistence in SaveManager

## Fase 21 — Villager NPC & Iron Golem (CP182–CP189)
- [ ] CP182: Villager NPC base class & 3D voxel mesh
- [ ] CP183: Villager wander state & village pathfinding AI
- [ ] CP184: Villager idle & greeting sound effects
- [ ] CP185: Iron Golem base class & 3D voxel mesh
- [ ] CP186: Iron Golem village patrol state machine
- [ ] CP187: Iron Golem attack state & hostile mob targeting
- [ ] CP188: Iron Golem knockback attack animation
- [ ] CP189: Iron Golem spawn in villages & iron ingot drops

## Fase 22 — Hostile Mobs: Skeleton, Spider & Enderman (CP190–CP204)
- [ ] CP190: Skeleton base class & 3D model with bow
- [ ] CP191: Skeleton wander & chase state
- [ ] CP192: Arrow projectile entity & physics trajectory
- [ ] CP193: Skeleton ranged attack state & arrow shooting
- [ ] CP194: Arrow hit detection & damage to player/mobs
- [ ] CP195: Skeleton bone & arrow drops
- [ ] CP196: Spider base class & 3D model (8 legs)
- [ ] CP197: Spider wall-climbing physics & raycast step
- [ ] CP198: Spider leap attack & string drops
- [ ] CP199: Enderman base class & tall 3D model (3 blocks high)
- [ ] CP200: Enderman purple particle effect
- [ ] CP201: Enderman neutral wander & stare-trigger provocation logic
- [ ] CP202: Enderman hostile chase & melee attack
- [ ] CP203: Enderman random teleportation when hit/provoked
- [ ] CP204: Enderman Ender Pearl drop item

## Fase 23 — Passive Animals: Pig, Chicken, Goat, Turtle (CP205–CP212)
- [ ] CP205: Pig base class, 3D model & Porkchop item drop
- [ ] CP206: Chicken base class, 3D model, Feather & Raw Chicken drop
- [ ] CP207: Goat base class, 3D model & high-jump physics
- [ ] CP208: Turtle base class, 3D model & beach/water swimming AI
- [ ] CP209: Animal sound effects pass (Oink, Cluck, Goat Bleat)
- [ ] CP210: Animal spawning distribution per biome
- [ ] CP211: Animal flee state when damaged
- [ ] CP212: Food items: Cooked Porkchop, Cooked Chicken, Bread

## Fase 24 — Nether Portal & Dimension (CP213–CP226)
- [ ] CP213: DimensionType enum (Overworld, Nether) & DimensionManager
- [ ] CP214: BlockRegistry addition: Obsidian, Netherrack, Glowstone, Lava, Nether Portal
- [ ] CP215: NetherWorld terrain generator (cavernous ceiling & floor, lava oceans)
- [ ] CP216: PortalDetector algorithm (4x5 obsidian frame validation)
- [ ] CP217: Nether Portal block filling & glowing purple material effect
- [ ] CP218: Portal collision & 3-second teleportation countdown timer
- [ ] CP219: Dimension transition screen & camera fade effect
- [ ] CP220: Destination portal auto-generation in target dimension
- [ ] CP221: Nether ambient lighting & red fog environment settings
- [ ] CP222: Nether background music & ambient soundscape
- [ ] CP223: Nether mob spawning rules
- [ ] CP224: SaveManager support for multi-dimension chunk storage
- [ ] CP225: Player position coordinate scaling (1 Nether block = 8 Overworld blocks)
- [ ] CP226: Nether Portal sound effects (portal hum & teleport trigger)

## Fase 25 — Master Integration & Polish (CP227–CP238)
- [ ] CP227: F3 Debug Screen update: Biome, Dimension, Mob Count, Active Chunk info
- [ ] CP228: Mob Manager performance optimization & distance culling
- [ ] CP229: Item Drop Manager optimization & pooling
- [ ] CP230: Audio Manager volume balance & ambient sound crossfade
- [ ] CP231: HUD Polish & Toast notification for new achievements/discoveries
- [ ] CP232: Inventory & Crafting recipes pass for all v2.0 items
- [ ] CP233: Settings Menu polish for dimension render distance & particle detail
- [ ] CP234: SaveManager schema migration test (v1.0 save -> v2.0 save)
- [ ] CP235: Stress test: 50+ active mobs & multi-chunk village meshing
- [ ] CP236: Production build verification (`npm run build`)
- [ ] CP237: Documentation update: README.md & user control guide
- [ ] CP238: Final Bug Bash & Release Pass
