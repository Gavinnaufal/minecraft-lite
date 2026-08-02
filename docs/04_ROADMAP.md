# ROADMAP PENGEMBANGAN — 130 CHECKPOINT
## Mini Minecraft (Vite + TypeScript + Three.js)

Setiap checkpoint (CP) dirancang untuk **1 sesi vibe coding** (1 prompt DeepSeek → 1 hasil kode → 1 test → 1 commit). Nomor CP dipakai konsisten di dokumen prompt (05) dan task board (06).

---

## FASE 0 — SETUP & TOOLING (CP1–CP10)

| CP | Checkpoint | Output |
|---|---|---|
| 1 | Inisialisasi project Vite + TypeScript | Project berjalan `npm run dev` |
| 2 | Install & konfigurasi Three.js + simplex-noise | Dependency terpasang, import berhasil |
| 3 | Setup struktur folder sesuai dokumen arsitektur | Folder kosong dengan file placeholder |
| 4 | Konfigurasi `tsconfig.json` & strict mode | Type-check jalan tanpa error |
| 5 | Buat `constants.ts` (CHUNK_SIZE, RENDER_DISTANCE, dll) | File constants terisi |
| 6 | Buat `Engine.ts` — game loop dasar (RAF + delta time) | Loop berjalan, log FPS di console |
| 7 | Buat `Renderer.ts` — scene, camera, WebGLRenderer dasar | Canvas kosong ter-render (warna background) |
| 8 | Setup `InputManager.ts` — keyboard state tracking | Tekan tombol ter-log di console |
| 9 | Setup pointer lock untuk mouse look | Klik canvas → cursor terkunci |
| 10 | Setup ESLint/Prettier (opsional tapi disarankan) | Lint jalan tanpa error besar |

## FASE 1 — RENDERING DASAR & KAMERA (CP11–CP20)

| CP | Checkpoint | Output |
|---|---|---|
| 11 | Render 1 kubus tunggal (test mesh) | Kubus tampil di layar |
| 12 | Buat `Camera.ts` — first-person camera dari mouse movement | Kamera berputar sesuai gerak mouse |
| 13 | Implementasi FOV & aspect ratio responsif (resize window) | Resize browser tidak merusak render |
| 14 | Tambahkan ambient + directional light dasar | Kubus test punya shading |
| 15 | Buat material dasar per warna (placeholder sebelum tekstur) | Kubus berwarna sesuai tipe |
| 16 | Load tekstur blok pertama (grass, dirt, stone) dari `public/textures` | Tekstur tampil di kubus test |
| 17 | Setup texture atlas / UV mapping per face blok | 1 blok bisa punya tekstur beda tiap sisi (grass) |
| 18 | Buat `Clock.ts` — delta time presisi & FPS counter overlay | FPS counter tampil di layar |
| 19 | Setup skybox dasar (warna gradient sederhana) | Background bukan solid color |
| 20 | Review performa render 1000 kubus statis (stress test awal) | FPS tercatat sebagai baseline |

## FASE 2 — SISTEM VOXEL & CHUNK (CP21–CP35)

| CP | Checkpoint | Output |
|---|---|---|
| 21 | Buat `BlockRegistry.ts` — daftar tipe blok & properti | Registry berisi ≥8 tipe blok |
| 22 | Buat `Chunk.ts` — struktur data 3D array blok per chunk | Chunk kosong bisa dibuat & diisi manual |
| 23 | Buat `ChunkMesher.ts` — generate mesh naive (semua face) | Chunk 16x16x16 ter-render (belum optimal) |
| 24 | Implementasi face culling (skip face yang tertutup blok solid) | Jumlah triangle turun drastis, FPS naik |
| 25 | Implementasi greedy meshing (opsional tapi disarankan) | Mesh lebih efisien lagi |
| 26 | Buat `ChunkManager.ts` — kelola koleksi chunk aktif | Multiple chunk bisa di-render bersamaan |
| 27 | Implementasi world-to-chunk coordinate conversion | Fungsi konversi teruji dengan unit test |
| 28 | Load/unload chunk berdasar jarak dari player | Chunk jauh otomatis hilang dari scene |
| 29 | Implementasi render distance configurable | Ubah RENDER_DISTANCE mengubah jumlah chunk aktif |
| 30 | Optimasi: pindahkan mesh generation ke Web Worker | Main thread tidak freeze saat load chunk baru |
| 31 | Buat `World.ts` — API get/set block by world coordinate | `world.getBlock(x,y,z)` & `setBlock()` berfungsi |
| 32 | Test edit manual blok lewat console/debug command | Ubah blok via console langsung terlihat |
| 33 | Implementasi chunk border stitching (mesh antar chunk nyambung) | Tidak ada celah/gap visual di border chunk |
| 34 | Buat sistem chunk dirty-flag (re-mesh hanya saat berubah) | Chunk tidak di-remesh tiap frame |
| 35 | Stress test 8x8 chunk area, ukur FPS | FPS ≥30 pada render distance target |

## FASE 3 — WORLD GENERATION PROSEDURAL (CP36–CP45)

| CP | Checkpoint | Output |
|---|---|---|
| 36 | Buat `NoiseGenerator.ts` — wrapper simplex-noise dengan seed | Noise value konsisten untuk seed sama |
| 37 | Buat `HeightMap.ts` — generate height per kolom (x,z) | Terrain naik-turun natural, bukan flat |
| 38 | Terapkan height map ke chunk generation (isi blok sesuai tinggi) | Terrain bergelombang ter-render |
| 39 | Implementasi layering blok (stone di bawah, dirt di tengah, grass di atas) | Lapisan blok terlihat benar dari samping |
| 40 | Buat `BiomeGenerator.ts` — tentukan biome per kolom (noise kedua) | Minimal 2 biome berbeda muncul |
| 41 | Terapkan variasi blok per biome (desert=sand, forest=grass+tree) | Biome terlihat visual berbeda |
| 42 | Implementasi generasi pohon sederhana (log + leaves) | Pohon muncul random di area forest |
| 43 | Implementasi water level & isi blok water di bawah level tsb | Danau/laut sederhana muncul |
| 44 | Implementasi cave generation dasar (noise 3D subtract) | Gua kecil terlihat di bawah tanah |
| 45 | Implementasi seed system (world baru = seed baru, reproducible) | Ganti seed menghasilkan dunia berbeda |

## FASE 4 — INTERAKSI BLOK: BREAK & PLACE (CP46–CP55)

| CP | Checkpoint | Output |
|---|---|---|
| 46 | Buat `Raycaster.ts` — deteksi blok yang dilihat player | Blok target ter-highlight (wireframe outline) |
| 47 | Implementasi jarak maksimum interaksi (~5 unit) | Blok jauh tidak bisa ditarget |
| 48 | Buat `BlockBreaker.ts` — hapus blok saat klik kiri | Klik kiri menghapus blok dari dunia |
| 49 | Tambahkan progress bar / animasi breaking (hold-to-break) | Blok butuh waktu untuk hancur sesuai hardness |
| 50 | Trigger re-mesh chunk otomatis setelah blok berubah | Perubahan blok langsung terlihat real-time |
| 51 | Buat `BlockPlacer.ts` — tempatkan blok saat klik kanan | Klik kanan menempatkan blok dari hotbar aktif |
| 52 | Validasi placement: tidak boleh timpa posisi player | Blok tidak bisa ditempatkan menembus player |
| 53 | Snapping placement ke grid & sisi blok yang benar (adjacent face) | Blok baru menempel sesuai sisi yang diklik |
| 54 | Hubungkan break block → drop item ke inventory | Item hasil break masuk hotbar/inventory |
| 55 | Sound/visual feedback break & place (placeholder sebelum audio fase 13) | Ada efek visual sederhana saat break/place |

## FASE 5 — PLAYER PHYSICS & COLLISION (CP56–CP65)

| CP | Checkpoint | Output |
|---|---|---|
| 56 | Buat `PlayerController.ts` — movement WASD dasar (tanpa collision) | Player bisa gerak bebas di dunia |
| 57 | Implementasi gravity sederhana (player jatuh terus jika tidak ada lantai) | Player jatuh ke bawah tanpa collision |
| 58 | Buat `PlayerCollision.ts` — AABB player vs voxel grid | Player berhenti saat kena blok solid |
| 59 | Implementasi ground detection (player berdiri stabil di atas blok) | Player tidak clipping ke lantai |
| 60 | Implementasi jump (Space) dengan physics sederhana | Player bisa lompat & jatuh natural |
| 61 | Implementasi collision dinding (tidak tembus blok saat jalan) | Player berhenti di depan dinding |
| 62 | Implementasi step-up otomatis (naik blok setinggi 1 tanpa lompat, opsional) | Jalan naik tangga 1 blok mulus |
| 63 | Implementasi sneak/shift (jalan pelan, opsional tidak jatuh dari tepi) | Shift mengurangi speed |
| 64 | Implementasi swimming state sederhana saat masuk water | Gerakan berbeda saat di air |
| 65 | Playtest movement 10 menit, catat bug collision | Daftar bug tercatat & sebagian besar diperbaiki |

## FASE 6 — INVENTORY & HOTBAR (CP66–CP75)

| CP | Checkpoint | Output |
|---|---|---|
| 66 | Buat `ItemRegistry.ts` — daftar item & metadata (nama, ikon, stack max) | Registry berisi item dasar |
| 67 | Buat `Inventory.ts` — struktur data slot (array of {itemId, count}) | Data inventory bisa diisi/dikosongkan via kode |
| 68 | Implementasi stacking logic (tambah ke slot existing sebelum slot baru) | Item sejenis menumpuk otomatis |
| 69 | Buat `Hotbar.ts` — 9 slot terpisah dari inventory utama | Hotbar terpisah dari grid utama |
| 70 | Implementasi switch hotbar via angka 1-9 | Tekan angka mengubah slot aktif |
| 71 | Implementasi switch hotbar via scroll mouse | Scroll mengubah slot aktif |
| 72 | Buat `HUD.ts` — render hotbar visual di layar | Hotbar 9 slot tampil di bawah layar |
| 73 | Buat `InventoryScreen.ts` — UI grid 27 slot, toggle dengan tombol E | Tekan E membuka/menutup inventory |
| 74 | Implementasi drag-drop antar slot inventory | Item bisa dipindah via drag mouse |
| 75 | Sinkronisasi: block drop → otomatis masuk slot inventory yang tepat | Full loop break→inventory→hotbar berfungsi |

## FASE 7 — CRAFTING SYSTEM (CP76–CP82)

| CP | Checkpoint | Output |
|---|---|---|
| 76 | Buat `Recipes.ts` — daftar resep (input grid → output item) | Minimal 10 resep terdaftar |
| 77 | Buat `CraftingSystem.ts` — cek pola grid 2x2 (crafting tanpa table) | Kayu → plank bisa di-craft dari inventory |
| 78 | Implementasi crafting table sebagai blok interaktif | Klik crafting table membuka UI 3x3 |
| 79 | Buat UI crafting grid 3x3 + slot output | Grid crafting tampil & bisa diisi |
| 80 | Implementasi validasi pola resep (shaped recipe, misal pickaxe) | Pola pickaxe menghasilkan pickaxe |
| 81 | Implementasi consume item saat craft berhasil | Item input berkurang sesuai resep |
| 82 | Playtest full crafting chain (kayu → plank → table → tool) | Chain lengkap berfungsi tanpa bug |

## FASE 8 — DAY/NIGHT CYCLE & LIGHTING (CP83–CP88)

| CP | Checkpoint | Output |
|---|---|---|
| 83 | Buat `DayNightCycle.ts` — timer siklus waktu (misal 15 menit/hari) | Variabel waktu berjalan otomatis |
| 84 | Update posisi & intensitas directional light sesuai waktu | Matahari "bergerak", cahaya berubah |
| 85 | Update warna skybox sesuai waktu (siang/senja/malam) | Skybox transisi warna halus |
| 86 | Implementasi ambient light minimum saat malam | Dunia tidak gelap total saat malam |
| 87 | Tambahkan indikator waktu di HUD (opsional: jam/ikon matahari-bulan) | Pemain tahu waktu saat ini |
| 88 | Hubungkan waktu malam ke trigger spawn mob (persiapan Fase 9) | Flag `isNight` tersedia untuk sistem lain |

## FASE 9 — MOBS & AI (CP89–CP96)

| CP | Checkpoint | Output |
|---|---|---|
| 89 | Buat `Mob.ts` — base class (posisi, health, model sederhana) | Mob dummy bisa di-spawn manual |
| 90 | Buat `MobManager.ts` — spawn/despawn & update loop semua mob | Beberapa mob update tiap frame |
| 91 | Buat `StateMachine.ts` — state idle/wander | Mob bergerak random saat idle |
| 92 | Implementasi `Cow.ts` (passive) — wander + collision dengan terrain | Sapi jalan-jalan natural di dunia |
| 93 | Implementasi attack pada passive mob → drop item (food) | Sapi bisa diserang & drop item |
| 94 | Implementasi `Zombie.ts` (hostile) — state chase dalam radius deteksi | Zombie mengejar player saat dekat |
| 95 | Implementasi attack state zombie → damage player saat kontak | Player kehilangan HP saat kena zombie |
| 96 | Hubungkan spawn zombie ke `isNight` (spawn lebih banyak malam hari) | Zombie muncul terutama saat malam |

## FASE 10 — SAVE / LOAD SYSTEM (CP97–CP102)

| CP | Checkpoint | Output |
|---|---|---|
| 97 | Buat `StorageAdapter.ts` — wrapper IndexedDB (via idb atau native API) | Data dummy bisa disimpan & dibaca |
| 98 | Buat `SaveManager.ts` — serialize world (chunk yang dimodifikasi saja) | World state ter-serialize jadi JSON/binary |
| 99 | Implementasi save posisi player & health | Data player tersimpan |
| 100 | Implementasi save inventory & hotbar | Data inventory tersimpan |
| 101 | Implementasi load: restore semua state saat game dibuka lagi | Reload browser → dunia & progres sama |
| 102 | Implementasi auto-save berkala (misal tiap 2 menit) + tombol save manual | Auto-save berjalan tanpa mengganggu gameplay |

## FASE 11 — UI/UX POLISH (CP103–CP108)

| CP | Checkpoint | Output |
|---|---|---|
| 103 | Buat `PauseMenu.ts` — Resume/Save/Load/Settings/Exit | Tombol Esc membuka pause menu berfungsi |
| 104 | Buat `SettingsMenu.ts` — render distance, sensitivity, volume | Setting tersimpan & berpengaruh real-time |
| 105 | Tambahkan health bar visual (heart icons) | HP tampil jelas & update saat damage |
| 106 | Tambahkan crosshair dinamis (berubah saat target blok/mob) | Crosshair memberi feedback jelas |
| 107 | Tambahkan tooltip nama item saat hover di inventory | Hover slot menampilkan nama item |
| 108 | General visual pass (spacing, font, warna UI konsisten) | UI terasa rapi & konsisten |

## FASE 12 — OPTIMASI & PERFORMANCE (CP109–CP115)

| CP | Checkpoint | Output |
|---|---|---|
| 109 | Profiling dengan Chrome DevTools Performance tab | Bottleneck teridentifikasi & tercatat |
| 110 | Optimasi chunk meshing lebih lanjut (instancing jika perlu) | FPS naik terukur dari baseline |
| 111 | Implementasi object pooling untuk mob (kurangi garbage collection) | Tidak ada frame drop saat banyak mob |
| 112 | Implementasi frustum culling (skip render chunk di luar pandangan) | Chunk di belakang kamera tidak di-render |
| 113 | Optimasi texture atlas (kurangi draw call, 1 material utk semua blok) | Draw call turun signifikan |
| 114 | Lazy-load chunk generation (batasi berapa chunk digenerate per frame) | Tidak ada stutter saat explore cepat |
| 115 | Final stress test (render distance maksimum + banyak mob) | FPS target tercapai di worst-case scenario |

## FASE 13 — AUDIO (CP116–CP120)

| CP | Checkpoint | Output |
|---|---|---|
| 116 | Buat `AudioManager.ts` — load & play SFX dasar | SFX bisa dipanggil dari kode lain |
| 117 | Hubungkan SFX break/place blok | Suara terdengar saat break/place |
| 118 | Tambahkan SFX footstep (beda suara per tipe blok, opsional) | Suara langkah terdengar saat jalan |
| 119 | Tambahkan ambient sound (angin, alam) | Ada background ambience |
| 120 | Tambahkan background music loop + toggle volume di settings | Musik bisa dimatikan/diatur volumenya |

## FASE 14 — MULTIPLAYER (STRETCH, OPSIONAL) (CP121–CP125)

| CP | Checkpoint | Output |
|---|---|---|
| 121 | Setup server WebSocket sederhana (Node.js) | Server bisa terima koneksi client |
| 122 | Sinkronisasi posisi player antar client | 2 client lihat posisi satu sama lain |
| 123 | Sinkronisasi perubahan blok (break/place) antar client | Perubahan dunia konsisten di semua client |
| 124 | Sinkronisasi inventory & mob (opsional, kompleks) | State dasar tersinkron |
| 125 | Playtest multiplayer 2 client sederhana | Bisa main bareng tanpa desync parah |

## FASE 15 — POLISH & RELEASE (CP126–CP130)

| CP | Checkpoint | Output |
|---|---|---|
| 126 | Bug bash menyeluruh (checklist semua fitur MVP) | Daftar bug diperbaiki tuntas |
| 127 | Buat main menu (New Game/Load Game/Settings) | Game punya entry point yang jelas |
| 128 | Build production (`vite build`) & test performa build final | Build production berjalan lancar |
| 129 | Deploy ke hosting statis (Vercel/Netlify/GitHub Pages) | Game bisa diakses via URL publik |
| 130 | Tulis README & dokumentasi cara main untuk pemain | README lengkap dengan cara instal/main |

## FASE 16 — FEATURE EXPANSION (CP131–CP138)

| CP | Checkpoint | Output |
|---|---|---|
| 131 | Structural Compound 3D Body Mesh & Leg Swing Anim for Cow | Sapi memiliki bentuk anatomi 3D (kepala, moncong, badan, 4 kaki) & animasi berjalan |
| 132 | Structural Compound 3D Body Mesh & Arm/Leg Anim for Zombie | Zombie memiliki anatomi 3D (kepala, badan, 2 tangan, 2 kaki) & animasi mengejar |
| 133 | Physics Fall Damage System | Jatuh dari ketinggian tinggi mengurangi HP bar player |
| 134 | First-Person Hand Model & Tool Swing Animation | Model tangan/alat 3D terlihat di sudut layar & berayun saat action |
| 135 | Block Break Particle Burst Effect | Partikel pecahan blok berhamburan saat menggali |
| 136 | Floating 3D Item Drops & Magnet Pickup | Item melayang 3D di tanah dan terbang magnetik ke player |
| 137 | Tool Durability Bar & Mining Efficiency | Pickaxe/Axe memiliki durabilitas & kecepatan menggali bertingkat |
| 138 | In-Game Multiplayer Chat Box ('T') & Name Tags | Chat box dan name tag melayang di atas player multiplayer |

## FASE 17 — COMPREHENSIVE POLISH (CP145–CP152)

| CP | Checkpoint | Output |
|---|---|---|
| 145 | Block Selection Outline Wireframe Box | Translucent 3D wireframe box highlighting targeted voxel block |
| 146 | Time-based Dynamic Exponential Distance Fog | Dynamic fog blending scene edges seamlessly with skybox colors |
| 147 | Surface-based Footstep Audio System | Audio footsteps reflecting block surfaces (Grass, Dirt, Stone, Sand, Wood, Water) |
| 148 | View Bobbing & Camera Impact Shake | Smooth rhythmic walking camera motion & camera impact tilt on damage/land |
| 149 | F3 Debug Overlay Screen | Toggleable debug screen showing FPS, Player XYZ coordinates, Biome, and Facing direction |
| 150 | Floating Toast Notification Banner System | Non-intrusive UI toasts for items collected, tool breakage, and game auto-save |
| 151 | Mob Hit Visual Flash & Knockback Particles | Red flash overlay & directional impact burst particles on mob damage |
| 152 | Submerged Water Fog & Ambient Particle Splash | Underwater blue tint fog effect and water surface entry splash particles |
| 153 | Authentic 16x16 Pixel Art Textures Pass | Custom 16x16 pixel-art PNG textures for all blocks & proper UV face mapping |
| 154 | 3D Volumetric Voxel Clouds & Celestial System | Scattered 3D voxel clouds, orbiting Sun/Moon, starfield, & ACES tone-mapped lighting |
| 155 | Agriculture & Quiet Toast System Polish | Intuitive wheat seeds planting/auto-tilling & bottom-right clutter-free toast notifications |

---

## RINGKASAN

- **Total checkpoint: 155** (130 checkpoint inti + 14 feature expansion + 11 polish CP145-CP155)
  > *Catatan: realisasi final proyek menambahkan CP-156 (Physics/FOV/Knockback Polish) dan CP-EX (Ocean Biome) di luar rencana checkpoint awal ini. Total aktual v1.0: 157 checkpoint — lihat `docs/06_TASK_BOARD.md` untuk rincian resmi.*
- MVP inti selesai di **CP102** (save/load) — dari titik ini game sudah "playable end-to-end".
- CP103–115 = polish & optimasi wajib.
- CP116–130 = audio, multiplayer & release.
- CP131–144 = feature expansion.
- CP145–155 = comprehensive gameplay, audio, visual & environment polish pass.

