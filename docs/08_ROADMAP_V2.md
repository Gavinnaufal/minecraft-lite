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

## Fase 20 — Village Generation & Prefabs (CP173–CP181) [SELESAI ✅]
- [x] CP173: StructureManager & VillageGenerator layout algorithm
- [x] CP174: Oak Wood House prefab generator
- [x] CP175: Cobblestone House prefab generator
- [x] CP176: Dirt path generator connecting village houses
- [x] CP177: Small wheat farm field structure in villages
- [x] CP178: Village spawn placement on flat Plains biomes
- [x] CP179: Structure bounding box collision & chunk meshing integration
- [x] CP180: Village chest loot generation
- [x] CP181: Structure saving & persistence in SaveManager

## Fase 21 — Villager NPC & Iron Golem (CP182–CP189) [SELESAI ✅]
- [x] CP182: Villager NPC base class & 3D voxel mesh
- [x] CP183: Villager wander state & village pathfinding AI
- [x] CP184: Villager idle & greeting sound effects
- [x] CP185: Iron Golem base class & 3D voxel mesh
- [x] CP186: Iron Golem village patrol state machine
- [x] CP187: Iron Golem attack state & hostile mob targeting
- [x] CP188: Iron Golem knockback attack animation
- [x] CP189: Iron Golem spawn in villages & iron ingot drops

## Fase 22 — Hostile Mobs: Skeleton, Spider & Enderman (CP190–CP204) [SELESAI ✅]
- [x] CP190: Skeleton base class & 3D model with bow
- [x] CP191: Skeleton wander & chase state
- [x] CP192: Arrow projectile entity & physics trajectory
- [x] CP193: Skeleton ranged attack state & arrow shooting
- [x] CP194: Arrow hit detection & damage to player/mobs
- [x] CP195: Skeleton bone & arrow drops
- [x] CP196: Spider base class & 3D model (8 legs)
- [x] CP197: Spider wall-climbing physics & raycast step
- [x] CP198: Spider leap attack & string drops
- [x] CP199: Enderman base class & tall 3D model (3 blocks high)
- [x] CP200: Enderman purple particle effect
- [x] CP201: Enderman neutral wander & stare-trigger provocation logic
- [x] CP202: Enderman hostile chase & melee attack
- [x] CP203: Enderman random teleportation when hit/provoked
- [x] CP204: Enderman Ender Pearl drop item

## Fase 23 — Passive Animals: Pig, Chicken, Goat, Turtle (CP205–CP212) [SELESAI ✅]
- [x] CP205: Pig base class, 3D model & Porkchop item drop
- [x] CP206: Chicken base class, 3D model, Feather & Raw Chicken drop
- [x] CP207: Goat base class, 3D model & high-jump physics
- [x] CP208: Turtle base class, 3D model & beach/water swimming AI
- [x] CP209: Animal sound effects pass (Oink, Cluck, Goat Bleat)
- [x] CP210: Animal spawning distribution per biome
- [x] CP211: Animal flee state when damaged
- [x] CP212: Food items: Cooked Porkchop, Cooked Chicken, Bread

## Fase 24 — Nether Portal & Dimension (CP213–CP226) [SELESAI ✅]
- [x] CP213: DimensionType enum (Overworld, Nether) & DimensionManager
- [x] CP214: BlockRegistry addition: Obsidian, Netherrack, Glowstone, Lava, Nether Portal
- [x] CP215: NetherWorld terrain generator (cavernous ceiling & floor, lava oceans)
- [x] CP216: PortalDetector algorithm (4x5 obsidian frame validation)
- [x] CP217: Nether Portal block filling & glowing purple material effect
- [x] CP218: Portal collision & 3-second teleportation countdown timer
- [x] CP219: Dimension transition screen & camera fade effect
- [x] CP220: Destination portal auto-generation in target dimension
- [x] CP221: Nether ambient lighting & red fog environment settings
- [x] CP222: Nether background music & ambient soundscape
- [x] CP223: Nether mob spawning rules
- [x] CP224: SaveManager support for multi-dimension chunk storage
- [x] CP225: Player position coordinate scaling (1 Nether block = 8 Overworld blocks)
- [x] CP226: Nether Portal sound effects (portal hum & teleport trigger)

## Fase 25 — Master Integration & Polish (CP227–CP238) [SELESAI ✅]
- [x] CP227: F3 Debug Screen update: Biome, Dimension, Mob Count, Active Chunk info
- [x] CP228: Mob Manager performance optimization & distance culling
- [x] CP229: Item Drop Manager optimization & pooling
- [x] CP230: Audio Manager volume balance & ambient sound crossfade
- [x] CP231: HUD Polish & Toast notification for new achievements/discoveries
- [x] CP232: Inventory & Crafting recipes pass for all v2.0 items
- [x] CP233: Settings Menu polish for dimension render distance & particle detail
- [x] CP234: SaveManager schema migration test (v1.0 save -> v2.0 save)
- [x] CP235: Stress test: 50+ active mobs & multi-chunk village meshing
- [x] CP236: Production build verification (`npm run build`)
- [x] CP237: Documentation update: README.md & user control guide
- [x] CP238: Final Bug Bash & Release Pass
