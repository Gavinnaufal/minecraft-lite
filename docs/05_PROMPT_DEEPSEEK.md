# PROMPT DEEPSEEK V4 PRO — PER CHECKPOINT
## Mini Minecraft

Cara pakai: copy-paste prompt sesuai CP yang sedang dikerjakan. **Selalu tempel isi file terkait** (yang disebut di kolom "Files") sebelum prompt, supaya DeepSeek punya konteks penuh (manfaatkan context window 1M token). Gunakan **reasoning mode high/xhigh** untuk CP yang melibatkan algoritma (meshing, physics, AI, noise); mode standar cukup untuk CP UI/setup.

**Template dasar tiap prompt:**
```
Konteks: [tempel isi file relevan]
Tugas: [checkpoint spesifik]
Batasan: TypeScript strict mode, gunakan Three.js, jangan ubah file di luar yang disebutkan.
Kriteria selesai: [acceptance criteria dari roadmap]
Berikan kode lengkap + penjelasan singkat perubahan apa saja.
```

---

## FASE 0 — SETUP & TOOLING

**CP1** — *Files: root project*
> "Buatkan setup awal project game voxel browser pakai Vite + TypeScript template vanilla-ts. Sertakan `package.json`, `tsconfig.json` dasar, dan `index.html` dengan satu `<canvas id="game">` full-screen (tanpa scrollbar, tanpa margin)."

**CP2** — *Files: package.json*
> "Tambahkan dependency `three` dan `simplex-noise` ke project ini, plus `@types/three` sebagai dev dependency. Tunjukkan command install dan contoh import minimal untuk memverifikasi keduanya bisa dipakai."

**CP3** — *Files: -*
> "Buatkan struktur folder kosong (dengan file `.gitkeep` atau placeholder export kosong) sesuai arsitektur berikut: [tempel isi 03_ARSITEKTUR_FOLDER.md bagian struktur direktori]."

**CP4** — *Files: tsconfig.json*
> "Konfigurasikan `tsconfig.json` dengan strict mode penuh (`strict: true`, `noImplicitAny`, `strictNullChecks`), target ES2022, module ESNext, cocok untuk project Three.js dengan Vite."

**CP5** — *Files: src/utils/constants.ts*
> "Buat file `constants.ts` berisi konstanta: CHUNK_SIZE_X=16, CHUNK_SIZE_Z=16, CHUNK_HEIGHT=128, RENDER_DISTANCE=6 (dalam jumlah chunk), GRAVITY=-9.8*3, PLAYER_SPEED, PLAYER_JUMP_FORCE. Beri tipe eksplisit dan komentar singkat tiap konstanta."

**CP6** — *Files: src/core/Engine.ts, src/utils/constants.ts*
> "Buat `Engine.ts` dengan game loop menggunakan `requestAnimationFrame`, hitung delta time (dalam detik), dan panggil callback `update(deltaTime)` tiap frame. Log FPS ke console tiap 1 detik untuk debugging."

**CP7** — *Files: src/core/Renderer.ts*
> "Buat `Renderer.ts` yang menginisialisasi Three.js Scene, PerspectiveCamera (FOV 75), dan WebGLRenderer yang attach ke `<canvas id='game'>`. Background scene warna biru langit sementara (0x87CEEB). Ekspor instance scene, camera, renderer untuk dipakai modul lain."

**CP8** — *Files: src/core/InputManager.ts*
> "Buat `InputManager.ts` singleton yang men-track state keyboard (keydown/keyup) dalam sebuah `Set<string>` dan expose method `isKeyPressed(key: string): boolean`."

**CP9** — *Files: src/core/InputManager.ts, src/core/Renderer.ts*
> "Tambahkan pointer lock API ke canvas: saat canvas diklik, request pointer lock; track `mousemovementX/Y` delta untuk dipakai kamera nanti. Tangani event saat pointer lock keluar (misal user tekan Esc)."

**CP10** — *Files: root project*
> "Setup ESLint + Prettier untuk project TypeScript ini dengan config yang wajar (airbnb-base atau standard), tanpa terlalu strict soal style, fokus catch error umum saja."

---

## FASE 1 — RENDERING DASAR & KAMERA

**CP11** — *Files: src/core/Renderer.ts, src/main.ts*
> "Tambahkan satu `BoxGeometry` sederhana dengan `MeshStandardMaterial` warna hijau ke scene sebagai test object, posisikan di (0,0,-5), pastikan ter-render di layar."

**CP12** — *Files: src/player/Camera.ts, src/core/InputManager.ts*
> "Buat `Camera.ts` yang mengatur rotasi kamera first-person berdasar delta mouse movement dari InputManager (yaw & pitch), clamp pitch antara -89 sampai 89 derajat agar tidak terbalik."

**CP13** — *Files: src/core/Renderer.ts*
> "Tambahkan event listener resize window yang update `camera.aspect` dan `renderer.setSize()` sesuai ukuran window baru, panggil `camera.updateProjectionMatrix()`."

**CP14** — *Files: src/core/Renderer.ts*
> "Tambahkan `AmbientLight` intensitas rendah dan `DirectionalLight` dari atas-samping ke scene supaya object test punya shading jelas."

**CP15** — *Files: src/world/BlockRegistry.ts (baru)*
> "Buat `BlockRegistry.ts` awal dengan interface `BlockType {id, name, color}` dan daftar 5 blok dasar (air, grass, dirt, stone, sand) dengan warna placeholder berbeda."

**CP16** — *Files: src/world/BlockRegistry.ts, public/textures/blocks/*
> "Ubah material blok dari warna solid menjadi `MeshStandardMaterial` dengan `TextureLoader` yang load file PNG dari `public/textures/blocks/{nama}.png`, gunakan `NearestFilter` supaya tekstur tetap pixelated (gaya voxel)."

**CP17** — *Files: src/world/BlockRegistry.ts*
> "Implementasikan sistem UV mapping per-face untuk blok grass (sisi atas beda tekstur dari sisi samping dan bawah), gunakan teknik texture atlas atau multi-material array pada BoxGeometry."

**CP18** — *Files: src/core/Clock.ts (baru), src/main.ts*
> "Buat `Clock.ts` dengan class yang hitung delta time presisi dan FPS rata-rata (rolling average 30 frame), lalu tampilkan FPS counter sebagai elemen HTML overlay di pojok kiri atas layar."

**CP19** — *Files: src/core/Renderer.ts*
> "Ganti background solid color scene dengan skybox sederhana berbentuk gradient (bisa pakai `Sky` dari three/examples atau custom shader gradient biru muda ke biru tua)."

**CP20** — *Files: src/main.ts*
> "Buat 1000 kubus test tersusun grid 10x10x10 dengan posisi acak sedikit, render semuanya, dan laporkan FPS yang didapat di console sebagai baseline performa sebelum optimasi chunking."

---

## FASE 2 — SISTEM VOXEL & CHUNK

**CP21** — *Files: src/world/BlockRegistry.ts*
> "Perluas `BlockRegistry.ts` jadi berisi minimal 8 tipe blok (air, grass, dirt, stone, wood_log, leaves, sand, water) dengan properti tambahan: `solid: boolean`, `transparent: boolean`, `hardness: number`."

**CP22** — *Files: src/world/Chunk.ts (baru), src/utils/constants.ts*
> "Buat class `Chunk` dengan penyimpanan blok internal berupa `Uint8Array` berukuran CHUNK_SIZE_X * CHUNK_SIZE_Z * CHUNK_HEIGHT, method `getBlock(x,y,z)` dan `setBlock(x,y,z,blockId)` dengan index flattening yang benar."

**CP23** — *Files: src/world/ChunkMesher.ts (baru), src/world/Chunk.ts*
> "Buat `ChunkMesher.ts` yang generate `BufferGeometry` dari data Chunk dengan cara naive: render semua 6 face tiap blok solid (belum ada culling). Gabungkan jadi satu mesh per chunk."

**CP24** — *Files: src/world/ChunkMesher.ts*
> "Optimasi ChunkMesher: sebelum render sebuah face, cek blok tetangga di arah tersebut — jika tetangga solid dan tidak transparan, skip face itu (face culling). Ukur penurunan jumlah triangle sebelum/sesudah."

**CP25** — *Files: src/world/ChunkMesher.ts*
> "Implementasikan greedy meshing pada ChunkMesher: gabungkan face-face bertetangga sejenis jadi satu quad besar per arah normal, untuk mengurangi jumlah triangle lebih lanjut. Jelaskan algoritma greedy meshing yang dipakai."

**CP26** — *Files: src/world/ChunkManager.ts (baru), src/world/Chunk.ts, src/world/ChunkMesher.ts*
> "Buat `ChunkManager.ts` yang menyimpan `Map<string, Chunk>` (key = 'x,z'), dengan method `loadChunk(chunkX, chunkZ)` dan `unloadChunk(chunkX, chunkZ)` yang menambah/menghapus mesh dari scene."

**CP27** — *Files: src/utils/math.ts (baru)*
> "Buat fungsi util di `math.ts`: `worldToChunkCoord(x,y,z)` mengembalikan {chunkX, chunkZ, localX, localY, localZ}. Tambahkan unit test sederhana (bisa berupa fungsi assert manual) untuk beberapa kasus."

**CP28** — *Files: src/world/ChunkManager.ts, src/player/Player.ts*
> "Tambahkan logic di ChunkManager untuk load chunk dalam radius RENDER_DISTANCE dari posisi player, dan unload chunk yang sudah di luar radius tersebut, dipanggil tiap kali player pindah chunk."

**CP29** — *Files: src/ui/SettingsMenu.ts, src/utils/constants.ts*
> "Buat RENDER_DISTANCE menjadi configurable runtime (bukan konstanta tetap), simpan di semacam `GameSettings` singleton, dan buat UI slider sederhana untuk mengubahnya (hasilnya trigger reload chunk di ChunkManager)."

**CP30** — *Files: src/world/ChunkMesher.ts*
> "Pindahkan proses generate mesh (ChunkMesher) ke Web Worker terpisah menggunakan Comlink atau native `postMessage`, supaya main thread tidak freeze. Kirim data blok chunk ke worker, terima kembali data geometry (positions, normals, uvs, indices) untuk dirakit jadi BufferGeometry di main thread."

**CP31** — *Files: src/world/World.ts (baru), src/world/ChunkManager.ts*
> "Buat `World.ts` sebagai API publik: `getBlock(worldX, worldY, worldZ)` dan `setBlock(worldX, worldY, worldZ, blockId)` yang otomatis menerjemahkan ke chunk yang tepat lewat ChunkManager."

**CP32** — *Files: src/main.ts, src/world/World.ts*
> "Tambahkan debug command sederhana (misal expose `window.world = worldInstance` di dev mode) supaya bisa test `world.setBlock(x,y,z,id)` langsung dari browser console dan lihat perubahan visual real-time."

**CP33** — *Files: src/world/ChunkMesher.ts*
> "Perbaiki chunk border stitching: saat generate mesh untuk sebuah chunk, cek blok tetangga di chunk sebelah untuk face culling di edge, supaya tidak ada gap/celah visual antar chunk."

**CP34** — *Files: src/world/Chunk.ts, src/world/ChunkManager.ts*
> "Tambahkan flag `isDirty: boolean` di Chunk yang di-set true saat `setBlock` dipanggil. ChunkManager hanya re-generate mesh untuk chunk dengan `isDirty === true`, lalu reset flag setelah re-mesh."

**CP35** — *Files: src/main.ts*
> "Buat stress test: generate 8x8 chunk area (kosongkan dulu world generation, isi blok solid acak untuk test), ukur dan log FPS rata-rata selama 10 detik berjalan."

---

## FASE 3 — WORLD GENERATION PROSEDURAL

**CP36** — *Files: src/world/terrain/NoiseGenerator.ts (baru)*
> "Buat `NoiseGenerator.ts` yang membungkus library `simplex-noise`, terima parameter `seed`, dan expose method `noise2D(x, z): number` dan `noise3D(x,y,z): number` ternormalisasi ke range 0-1."

**CP37** — *Files: src/world/terrain/HeightMap.ts (baru), src/world/terrain/NoiseGenerator.ts*
> "Buat `HeightMap.ts` yang generate ketinggian terrain per kolom (x,z) menggunakan beberapa octave noise (fractal Brownian motion, 4 octave) supaya terrain terlihat natural, hasil di-clamp ke range 0-CHUNK_HEIGHT."

**CP38** — *Files: src/world/Chunk.ts, src/world/terrain/HeightMap.ts*
> "Integrasikan HeightMap ke proses inisialisasi Chunk: untuk tiap kolom (x,z) dalam chunk, isi blok solid dari y=0 sampai y=height(x,z), sisanya air."

**CP39** — *Files: src/world/Chunk.ts*
> "Tambahkan layering blok berdasar kedalaman dari surface: 1 blok teratas = grass, 3 blok di bawahnya = dirt, sisanya = stone."

**CP40** — *Files: src/world/terrain/BiomeGenerator.ts (baru)*
> "Buat `BiomeGenerator.ts` yang pakai noise2D kedua (skala lebih besar) untuk menentukan biome per kolom: threshold value rendah = Desert, sedang = Plains, tinggi = Forest/Mountain. Expose fungsi `getBiome(x,z): BiomeType`."

**CP41** — *Files: src/world/Chunk.ts, src/world/terrain/BiomeGenerator.ts*
> "Sesuaikan blok surface berdasar biome: Desert pakai sand di top layer, Plains/Forest pakai grass, Mountain pakai stone jika di atas ketinggian tertentu."

**CP42** — *Files: src/world/terrain/TreeGenerator.ts (baru)*
> "Buat fungsi generate pohon sederhana: pilih posisi acak dalam chunk biome Forest (probabilitas rendah per kolom), buat batang wood_log setinggi 4-5 blok, lalu leaves membentuk kotak 3x3x3 di puncaknya."

**CP43** — *Files: src/world/Chunk.ts, src/utils/constants.ts*
> "Tambahkan WATER_LEVEL konstan. Saat generate chunk, isi blok water untuk semua posisi kosong (air) di bawah WATER_LEVEL yang berada di kolom dengan height < WATER_LEVEL."

**CP44** — *Files: src/world/Chunk.ts, src/world/terrain/NoiseGenerator.ts*
> "Tambahkan cave generation: gunakan noise3D, untuk tiap posisi blok solid bawah tanah, jika noise3D(x,y,z) di atas threshold tertentu, ubah jadi air (membentuk rongga gua)."

**CP45** — *Files: src/world/terrain/NoiseGenerator.ts, src/ui/*
> "Implementasikan sistem seed: seed berupa string/angka yang diinput user di main menu (atau default random), dipakai untuk inisialisasi semua NoiseGenerator supaya world reproducible untuk seed yang sama."

---

## FASE 4 — INTERAKSI BLOK: BREAK & PLACE

**CP46** — *Files: src/player/Raycaster.ts (baru), src/world/World.ts*
> "Buat `Raycaster.ts` yang melakukan voxel raycasting (DDA algorithm) dari posisi kamera ke arah pandang, mengembalikan koordinat blok pertama yang solid dalam jarak maksimum 5 unit, beserta face yang terkena."

**CP47** — *Files: src/player/Raycaster.ts*
> "Tambahkan wireframe outline box yang muncul di sekitar blok target hasil raycast, update posisinya tiap frame mengikuti hasil raycast terbaru."

**CP48** — *Files: src/interaction/BlockBreaker.ts (baru), src/player/Raycaster.ts, src/world/World.ts*
> "Buat `BlockBreaker.ts`: saat mouse klik kiri ditekan pada blok target dari raycast, panggil `world.setBlock(x,y,z, AIR_ID)` untuk menghapusnya."

**CP49** — *Files: src/interaction/BlockBreaker.ts, src/world/BlockRegistry.ts*
> "Tambahkan sistem hold-to-break: klik kiri ditahan, progress bertambah tiap frame berdasar `hardness` blok dari BlockRegistry, blok baru hilang setelah progress mencapai 100%. Tampilkan progress bar sederhana di HUD atau crack overlay di blok."

**CP50** — *Files: src/world/ChunkManager.ts, src/world/World.ts*
> "Pastikan `world.setBlock()` otomatis men-set `isDirty=true` pada chunk terkait (dan chunk tetangga jika blok di border) sehingga re-mesh terpicu otomatis."

**CP51** — *Files: src/interaction/BlockPlacer.ts (baru), src/inventory/Hotbar.ts*
> "Buat `BlockPlacer.ts`: saat klik kanan, ambil item aktif dari Hotbar, jika item itu adalah blok, panggil `world.setBlock()` pada posisi adjacent ke face yang di-raycast (bukan menimpa blok yang di-target)."

**CP52** — *Files: src/interaction/BlockPlacer.ts, src/player/PlayerCollision.ts*
> "Tambahkan validasi di BlockPlacer: sebelum place, cek AABB posisi blok baru tidak overlap dengan AABB player saat ini, batalkan placement jika overlap."

**CP53** — *Files: src/interaction/BlockPlacer.ts, src/player/Raycaster.ts*
> "Perbaiki logic penentuan posisi placement: gunakan face normal dari hasil raycast untuk menentukan blok baru muncul di sisi mana persis (atas/bawah/samping) dari blok target."

**CP54** — *Files: src/interaction/BlockBreaker.ts, src/inventory/Inventory.ts, src/world/BlockRegistry.ts*
> "Hubungkan BlockBreaker dengan Inventory: setelah blok berhasil dihancurkan, ambil `drop` item dari BlockRegistry blok tsb dan tambahkan ke Inventory player (via method addItem)."

**CP55** — *Files: src/interaction/BlockBreaker.ts, src/interaction/BlockPlacer.ts*
> "Tambahkan efek visual sederhana (particle kotak kecil beterbangan / scale animation singkat) saat blok di-break, dan efek 'pop-in' scale saat blok di-place."

---

## FASE 5 — PLAYER PHYSICS & COLLISION

**CP56** — *Files: src/player/PlayerController.ts (baru), src/core/InputManager.ts*
> "Buat `PlayerController.ts`: baca WASD dari InputManager, update posisi player ke arah kamera menghadap (relatif terhadap yaw kamera), tanpa collision dulu."

**CP57** — *Files: src/player/Player.ts (baru), src/utils/constants.ts*
> "Buat `Player.ts` dengan state velocity (Vector3). Tiap frame, tambahkan GRAVITY ke velocity.y, lalu update posisi berdasar velocity * deltaTime."

**CP58** — *Files: src/player/PlayerCollision.ts (baru), src/world/World.ts*
> "Buat `PlayerCollision.ts`: definisikan AABB player (lebar 0.6, tinggi 1.8), untuk tiap axis (x,y,z) cek apakah posisi baru akan overlap dengan blok solid di World, jika ya, hentikan movement di axis tsb dan set velocity axis itu ke 0."

**CP59** — *Files: src/player/PlayerCollision.ts*
> "Tambahkan `isGrounded: boolean` di Player, di-set true jika collision check ke bawah mendeteksi blok solid tepat di bawah kaki player (toleransi kecil ~0.05 unit)."

**CP60** — *Files: src/player/PlayerController.ts, src/player/Player.ts*
> "Tambahkan handling Space key: jika `isGrounded === true` dan Space ditekan, set `velocity.y = PLAYER_JUMP_FORCE`."

**CP61** — *Files: src/player/PlayerCollision.ts*
> "Pastikan collision axis x dan z dicek terpisah (bukan digabung) supaya player bisa 'meluncur' di sepanjang dinding, bukan berhenti total saat menabrak sudut."

**CP62** — *Files: src/player/PlayerCollision.ts*
> "Tambahkan step-up otomatis: jika collision horizontal terjadi tapi ketinggian obstacle hanya 1 blok dan ada ruang kosong di atasnya, otomatis naikkan posisi y player sedikit demi sedikit (bukan lompat) supaya terasa seperti menaiki tangga."

**CP63** — *Files: src/player/PlayerController.ts, src/core/InputManager.ts*
> "Tambahkan sneak mode: saat Shift ditahan, kurangi PLAYER_SPEED jadi setengahnya."

**CP64** — *Files: src/player/PlayerCollision.ts, src/world/World.ts*
> "Deteksi jika posisi kepala player berada dalam blok bertipe water, set flag `isSwimming=true`, kurangi efek gravity dan tambahkan gerakan naik-turun ringan saat swim."

**CP65** — *Files: -*
> "Review kode PlayerController dan PlayerCollision berikut [tempel isi file], identifikasi potensi bug collision (misal player nyangkut di sudut, tembus lantai saat FPS rendah), dan berikan perbaikan kode."

---

## FASE 6 — INVENTORY & HOTBAR

**CP66** — *Files: src/inventory/ItemRegistry.ts (baru)*
> "Buat `ItemRegistry.ts` dengan interface `ItemType {id, name, iconPath, maxStack, isBlock, blockId?}` dan daftar item dasar (wood_log, plank, stick, dirt, stone, dst) sinkron dengan BlockRegistry."

**CP67** — *Files: src/inventory/Inventory.ts (baru)*
> "Buat `Inventory.ts` dengan array `slots: {itemId: string|null, count: number}[]` sepanjang 27, method `addItem(itemId, count)` dan `removeItem(slotIndex, count)`."

**CP68** — *Files: src/inventory/Inventory.ts, src/inventory/ItemRegistry.ts*
> "Perbaiki `addItem()`: jika sudah ada slot dengan itemId sama dan belum penuh (< maxStack dari ItemRegistry), tambahkan ke situ dulu; baru cari slot kosong jika semua slot existing penuh."

**CP69** — *Files: src/inventory/Hotbar.ts (baru), src/inventory/Inventory.ts*
> "Buat `Hotbar.ts` sebagai 9 slot terpisah (bukan bagian dari 27 slot Inventory), dengan `activeSlotIndex: number` dan method `getActiveItem()`."

**CP70** — *Files: src/inventory/Hotbar.ts, src/core/InputManager.ts*
> "Tambahkan handling tombol angka 1-9 untuk mengubah `Hotbar.activeSlotIndex` sesuai angka yang ditekan."

**CP71** — *Files: src/inventory/Hotbar.ts, src/core/InputManager.ts*
> "Tambahkan handling scroll wheel mouse untuk increment/decrement `activeSlotIndex` (wrap around dari 8 ke 0 dan sebaliknya)."

**CP72** — *Files: src/ui/HUD.ts (baru), src/inventory/Hotbar.ts*
> "Buat `HUD.ts` yang render 9 kotak hotbar sebagai elemen HTML/CSS di bagian bawah-tengah layar, kotak aktif diberi highlight border, tampilkan icon item dan jumlah stack di tiap slot."

**CP73** — *Files: src/ui/InventoryScreen.ts (baru), src/inventory/Inventory.ts*
> "Buat `InventoryScreen.ts` yang render grid 3x9 sebagai overlay HTML/CSS, toggle visible saat tombol E ditekan (dan lock/unlock pointer sesuai kondisi buka/tutup)."

**CP74** — *Files: src/ui/InventoryScreen.ts*
> "Implementasikan drag-drop antar slot inventory menggunakan mouse events (mousedown, mousemove, mouseup) — item bisa dipindah dari satu slot ke slot lain, termasuk swap jika slot tujuan terisi."

**CP75** — *Files: src/interaction/BlockBreaker.ts, src/inventory/Hotbar.ts, src/inventory/Inventory.ts*
> "Pastikan alur penuh berjalan: break blok → item masuk ke Inventory (prioritaskan Hotbar dulu jika ada slot kosong) → HUD update otomatis menampilkan perubahan tanpa reload."

---

## FASE 7 — CRAFTING SYSTEM

**CP76** — *Files: src/crafting/Recipes.ts (baru)*
> "Buat `Recipes.ts` berisi minimal 10 resep dengan format `{pattern: (string|null)[][], result: {itemId, count}}`, contoh: wood_log→4 plank (unshaped), plank+plank (2x1)→stick, dst."

**CP77** — *Files: src/crafting/CraftingSystem.ts (baru), src/crafting/Recipes.ts, src/inventory/Inventory.ts*
> "Buat `CraftingSystem.ts` dengan method `checkRecipe(grid2x2): Recipe|null` yang mencocokkan isi grid 2x2 (crafting tanpa table) dengan daftar resep unshaped sederhana."

**CP78** — *Files: src/world/BlockRegistry.ts, src/interaction/*
> "Tambahkan blok baru `crafting_table` ke BlockRegistry, dan tambahkan logic: saat player klik kanan pada blok crafting_table (bukan dari hotbar tapi world), buka UI crafting 3x3 alih-alih place blok."

**CP79** — *Files: src/ui/CraftingScreen.ts (baru)*
> "Buat `CraftingScreen.ts`: UI grid input 3x3 (drag item dari inventory ke situ) plus 1 slot output di sampingnya, mirip layout Minecraft."

**CP80** — *Files: src/crafting/CraftingSystem.ts, src/crafting/Recipes.ts*
> "Perluas `checkRecipe()` untuk mendukung shaped recipe pada grid 3x3 (misal pola pickaxe: 3 plank di baris atas, stick di tengah kolom bawah 2 baris), termasuk pencocokan yang toleran terhadap posisi grid (bukan harus mulai dari pojok kiri atas)."

**CP81** — *Files: src/crafting/CraftingSystem.ts, src/inventory/Inventory.ts*
> "Saat player mengambil item dari slot output crafting, kurangi jumlah item di semua slot grid input sesuai resep yang match (1 per slot yang terpakai), refresh tampilan grid."

**CP82** — *Files: -*
> "Tulis test case manual (daftar langkah) untuk memverifikasi chain crafting: wood_log → plank → crafting_table → stick → wooden_pickaxe. Jalankan tiap langkah di game dan laporkan hasil vs ekspektasi."

---

## FASE 8 — DAY/NIGHT CYCLE & LIGHTING

**CP83** — *Files: src/environment/DayNightCycle.ts (baru), src/utils/constants.ts*
> "Buat `DayNightCycle.ts` dengan variabel `timeOfDay` (0.0-1.0, dimana 0=tengah malam, 0.5=tengah hari), increment tiap frame berdasar deltaTime supaya 1 siklus penuh = DAY_LENGTH_SECONDS (misal 900 detik = 15 menit)."

**CP84** — *Files: src/environment/DayNightCycle.ts, src/core/Renderer.ts*
> "Hubungkan `timeOfDay` ke posisi DirectionalLight (orbit sederhana mengelilingi scene) dan intensitasnya (maksimum saat siang, minimum saat malam, interpolasi halus di senja/subuh)."

**CP85** — *Files: src/environment/Skybox.ts, src/environment/DayNightCycle.ts*
> "Interpolasi warna skybox berdasar `timeOfDay`: biru cerah (siang) → oranye/pink (senja) → biru gelap/hitam (malam) → oranye (subuh), gunakan Color.lerp antar beberapa keyframe warna."

**CP86** — *Files: src/core/Renderer.ts, src/environment/DayNightCycle.ts*
> "Tambahkan AmbientLight dengan intensitas minimum tidak pernah 0 (misal 0.1) supaya dunia tetap terlihat (tidak hitam total) saat malam hari."

**CP87** — *Files: src/ui/HUD.ts, src/environment/DayNightCycle.ts*
> "Tambahkan indikator waktu sederhana di HUD (bisa berupa ikon matahari/bulan yang posisinya bergerak di sebuah bar horizontal kecil mengikuti `timeOfDay`)."

**CP88** — *Files: src/environment/DayNightCycle.ts*
> "Expose getter `isNight(): boolean` (true jika timeOfDay di luar range 0.25-0.75 misalnya) dari DayNightCycle untuk dipakai sistem mob spawning nanti."

---

## FASE 9 — MOBS & AI

**CP89** — *Files: src/mobs/Mob.ts (baru)*
> "Buat base class `Mob.ts` dengan properti posisi, health, model (mesh sederhana box/capsule), method `update(deltaTime)` abstract/virtual untuk di-override subclass."

**CP90** — *Files: src/mobs/MobManager.ts (baru), src/mobs/Mob.ts*
> "Buat `MobManager.ts` yang menyimpan array mob aktif, punya method `spawnMob(type, position)`, `despawnMob(mob)`, dan `update(deltaTime)` yang memanggil update tiap mob."

**CP91** — *Files: src/mobs/ai/StateMachine.ts (baru)*
> "Buat `StateMachine.ts` generic sederhana dengan state 'idle' dan 'wander': saat idle beberapa detik, transisi ke wander (pilih arah & jarak random, gerak ke sana), lalu kembali idle."

**CP92** — *Files: src/mobs/passive/Cow.ts (baru), src/mobs/Mob.ts, src/mobs/ai/StateMachine.ts, src/player/PlayerCollision.ts*
> "Buat `Cow.ts` extends Mob, gunakan StateMachine idle/wander, terapkan collision sederhana terhadap terrain (pakai logic mirip PlayerCollision tapi lebih simpel, cukup ground detection)."

**CP93** — *Files: src/mobs/passive/Cow.ts, src/interaction/*
> "Tambahkan kemampuan attack pada Cow: player bisa klik kiri saat raycast mengenai mob (bukan blok), Cow kehilangan health, dan drop item 'raw_beef' ke inventory saat health <= 0 (mob dihapus dari scene)."

**CP94** — *Files: src/mobs/hostile/Zombie.ts (baru), src/mobs/ai/StateMachine.ts*
> "Buat `Zombie.ts` extends Mob dengan state tambahan 'chase': jika jarak ke player < DETECTION_RADIUS (misal 10 unit), transisi ke chase dan bergerak lurus ke arah posisi player tiap frame."

**CP95** — *Files: src/mobs/hostile/Zombie.ts, src/player/Player.ts*
> "Tambahkan state 'attack' pada Zombie: jika jarak ke player < ATTACK_RANGE (misal 1.5 unit), berhenti bergerak dan kurangi HP player secara periodik (misal tiap 1 detik) selama masih dalam range."

**CP96** — *Files: src/mobs/MobManager.ts, src/environment/DayNightCycle.ts*
> "Hubungkan MobManager dengan `DayNightCycle.isNight()`: spawn Zombie secara periodik di area sekitar player (posisi random dalam radius, tapi tidak terlalu dekat) hanya/lebih sering saat malam, spawn Cow lebih sering saat siang."

---

## FASE 10 — SAVE / LOAD SYSTEM

**CP97** — *Files: src/save/StorageAdapter.ts (baru)*
> "Buat `StorageAdapter.ts` sebagai wrapper IndexedDB (bisa pakai library `idb` untuk simplifikasi) dengan method async `saveData(key, data)` dan `loadData(key): Promise<any|null>`."

**CP98** — *Files: src/save/SaveManager.ts (baru), src/world/ChunkManager.ts*
> "Buat `SaveManager.ts` dengan method `serializeWorld()`: iterasi semua chunk yang pernah dimodifikasi (bukan default generated), simpan hanya delta perubahan blok (koordinat + blockId) sebagai array compact, bukan seluruh chunk mentah."

**CP99** — *Files: src/save/SaveManager.ts, src/player/Player.ts*
> "Tambahkan ke SaveManager: serialize posisi (x,y,z), rotasi kamera (yaw,pitch), dan health player ke object save data."

**CP100** — *Files: src/save/SaveManager.ts, src/inventory/Inventory.ts, src/inventory/Hotbar.ts*
> "Tambahkan ke SaveManager: serialize isi Inventory (27 slot) dan Hotbar (9 slot) ke save data."

**CP101** — *Files: src/save/SaveManager.ts, src/save/StorageAdapter.ts*
> "Buat method `loadWorld()` di SaveManager: baca data dari StorageAdapter, terapkan kembali delta blok ke ChunkManager/World, restore posisi & health Player, restore Inventory & Hotbar. Jika tidak ada save data, generate world baru seperti biasa."

**CP102** — *Files: src/save/SaveManager.ts, src/core/Engine.ts, src/ui/PauseMenu.ts*
> "Tambahkan auto-save tiap 120 detik (panggil `saveManager.serializeWorld()` lalu simpan ke storage) dan tombol 'Save' manual di pause menu yang memanggil fungsi yang sama."

---

## FASE 11 — UI/UX POLISH

**CP103** — *Files: src/ui/PauseMenu.ts (baru), src/core/InputManager.ts*
> "Buat `PauseMenu.ts`: tombol Esc toggle menu overlay dengan tombol Resume, Save, Load, Settings, Exit. Saat menu terbuka, pause game loop update (kecuali render) dan release pointer lock."

**CP104** — *Files: src/ui/SettingsMenu.ts*
> "Lengkapi `SettingsMenu.ts` dengan slider render distance, slider mouse sensitivity, slider volume master, semuanya tersimpan ke sebuah `GameSettings` singleton dan berpengaruh langsung tanpa perlu restart game."

**CP105** — *Files: src/ui/HUD.ts, src/player/Player.ts*
> "Tambahkan health bar bergaya heart icon (10 heart = 20 HP, tiap heart = 2 HP) di HUD, update visual (full/half/empty heart) sesuai HP player saat ini."

**CP106** — *Files: src/ui/HUD.ts, src/player/Raycaster.ts*
> "Buat crosshair dinamis: bentuk default titik/plus kecil, berubah (misal warna beda atau bentuk kotak) saat raycast sedang menargetkan blok breakable atau mob attackable."

**CP107** — *Files: src/ui/InventoryScreen.ts, src/inventory/ItemRegistry.ts*
> "Tambahkan tooltip: saat mouse hover di atas slot inventory yang terisi, tampilkan nama item (dari ItemRegistry) dalam kotak kecil mengikuti posisi cursor."

**CP108** — *Files: src/ui/**
> "Lakukan review visual pass pada semua file UI (HUD, InventoryScreen, PauseMenu, SettingsMenu, CraftingScreen): samakan font, spacing, warna tema (sarankan palet warna earthy/pixel-art), pastikan konsisten."

---

## FASE 12 — OPTIMASI & PERFORMANCE

**CP109** — *Files: -*
> "Jelaskan cara profiling game Three.js ini menggunakan Chrome DevTools Performance tab, lalu berdasar deskripsi bottleneck yang saya temukan [jelaskan hasil profiling kamu], sarankan area kode mana yang paling perlu dioptimasi."

**CP110** — *Files: src/world/ChunkMesher.ts*
> "Review ulang `ChunkMesher.ts` [tempel isi file], cari peluang optimasi tambahan (misal InstancedMesh untuk objek berulang, reduce draw call, merge geometry lebih agresif)."

**CP111** — *Files: src/mobs/MobManager.ts*
> "Implementasikan object pooling untuk mob di MobManager: alih-alih `new Mob()` dan dispose tiap spawn/despawn, gunakan pool mob yang di-reuse (reset posisi & state) untuk mengurangi garbage collection."

**CP112** — *Files: src/world/ChunkManager.ts, src/core/Renderer.ts*
> "Tambahkan frustum culling manual atau manfaatkan `Frustum` dari Three.js: skip update/render untuk chunk yang berada di luar frustum kamera saat ini, meski masih dalam render distance."

**CP113** — *Files: src/world/BlockRegistry.ts, src/world/ChunkMesher.ts*
> "Refactor sistem tekstur blok agar semua blok memakai 1 texture atlas tunggal dan 1 material, supaya chunk mesh bisa jadi 1 draw call per chunk alih-alih banyak material terpisah."

**CP114** — *Files: src/world/ChunkManager.ts*
> "Batasi jumlah chunk yang di-generate per frame (misal maksimum 1-2 chunk baru per frame, sisanya masuk antrian) supaya tidak ada stutter besar saat player bergerak cepat menjelajah area baru."

**CP115** — *Files: -*
> "Jalankan stress test final: render distance maksimum (misal 10 chunk) + 30 mob aktif sekaligus. Laporkan FPS yang didapat, dan jika di bawah 30 FPS, sarankan langkah optimasi lanjutan berdasar kode yang ada."

---

## FASE 13 — AUDIO

**CP116** — *Files: src/audio/AudioManager.ts (baru)*
> "Buat `AudioManager.ts` singleton yang bisa load file audio dari `public/audio/` dan punya method `playSFX(name: string)` dan `playMusic(name: string, loop: boolean)`, dengan volume terpisah untuk SFX dan music."

**CP117** — *Files: src/interaction/BlockBreaker.ts, src/interaction/BlockPlacer.ts, src/audio/AudioManager.ts*
> "Panggil `audioManager.playSFX('break')` saat blok berhasil dihancurkan, dan `playSFX('place')` saat blok berhasil ditempatkan."

**CP118** — *Files: src/player/PlayerController.ts, src/audio/AudioManager.ts*
> "Tambahkan SFX footstep yang diputar berkala (misal tiap 0.4 detik) saat player bergerak dan `isGrounded === true`, opsional beda suara tergantung tipe blok di bawah kaki."

**CP119** — *Files: src/audio/AudioManager.ts, src/main.ts*
> "Tambahkan ambient sound loop (suara angin/alam) yang mulai diputar otomatis saat game dimulai, volume rendah sebagai background."

**CP120** — *Files: src/audio/AudioManager.ts, src/ui/SettingsMenu.ts*
> "Tambahkan background music loop dan slider volume music terpisah di SettingsMenu, termasuk tombol mute cepat."

---

## FASE 14 — MULTIPLAYER (STRETCH)

**CP121** — *Files: server/ (baru, terpisah dari src client)*
> "Buatkan server WebSocket sederhana pakai Node.js + `ws` library yang menerima koneksi client, assign id unik per koneksi, dan broadcast pesan ke semua client lain saat ada client baru connect/disconnect."

**CP122** — *Files: src/network/NetworkManager.ts (baru), server/*
> "Buat `NetworkManager.ts` di client yang connect ke server WebSocket, kirim posisi player tiap beberapa frame (throttle ~10x/detik), terima posisi player lain dan render mereka sebagai mesh sederhana di scene."

**CP123** — *Files: src/network/NetworkManager.ts, src/world/World.ts, server/*
> "Tambahkan sinkronisasi block change: saat player local break/place blok, kirim event ke server, server broadcast ke semua client, client lain menerapkan perubahan yang sama ke World mereka."

**CP124** — *Files: src/network/NetworkManager.ts, src/inventory/Inventory.ts, src/mobs/MobManager.ts*
> "Tambahkan sinkronisasi dasar untuk state inventory pemain sendiri (server-authoritative sederhana) dan posisi mob (server yang menentukan spawn & posisi mob, client hanya render)."

**CP125** — *Files: -*
> "Buatkan checklist playtest multiplayer 2 client: cek posisi tersinkron, block change tersinkron, tidak ada crash saat salah satu client disconnect mendadak. Laporkan hasil tiap poin checklist."

---

## FASE 15 — POLISH & RELEASE

**CP126** — *Files: seluruh project*
> "Buatkan checklist bug bash untuk semua fitur MVP (world gen, break/place, inventory, crafting, mob, save/load, UI). Untuk tiap bug yang saya laporkan [jelaskan bug], analisis kemungkinan penyebab dan berikan perbaikan kode."

**CP127** — *Files: src/ui/MainMenu.ts (baru)*
> "Buat `MainMenu.ts` sebagai layar awal sebelum masuk game: tombol 'New Game' (generate world baru dengan seed random/manual), 'Load Game' (load save terakhir jika ada), 'Settings'."

**CP128** — *Files: vite.config.ts*
> "Jelaskan langkah build production dengan `vite build`, dan sarankan optimasi `vite.config.ts` (minification, chunk splitting) untuk ukuran bundle akhir yang lebih kecil."

**CP129** — *Files: -*
> "Jelaskan langkah-langkah deploy hasil build (folder `dist/`) ke Vercel/Netlify/GitHub Pages, termasuk konfigurasi yang diperlukan untuk static site dengan asset di folder `public/`."

**CP130** — *Files: -*
> "Buatkan README.md untuk end-user (bukan developer): cara membuka/main game, kontrol dasar, tips awal survival, dan cara save/load. Bahasa santai dan jelas."

---

## FASE 16 — FEATURE EXPANSION

**CP131** — *Files: src/mobs/passive/Cow.ts, src/mobs/Mob.ts*
> "Ubah struktur mesh Cow.ts dari kubus tunggal menjadi compound 3D hierarchical mesh (Head, Snout, Torso, 4 Legs) dan tambahkan animasi ayunan kaki saat berjalan."

**CP132** — *Files: src/mobs/hostile/Zombie.ts, src/mobs/Mob.ts*
> "Ubah struktur mesh Zombie.ts dari kubus tunggal menjadi compound 3D hierarchical mesh (Head, Torso, 2 Arms, 2 Legs) dan tambahkan animasi ayunan tangan/kaki saat mengejar player."

**CP133** — *Files: src/player/PlayerController.ts, src/player/Player.ts*
> "Implementasikan fisika fall damage saat mendarat dari ketinggian tinggi (kecepatan jatuh > threshold), lalu kurangi player health bar."

**CP134** — *Files: src/ui/HandModel.ts (baru), src/main.ts*
> "Buat 3D First-Person Hand Model & Tool Model di sudut kanan bawah kamera, dan tambahkan animasi swing saat melakukan aksi memukul/memasang blok."

**CP135** — *Files: src/interaction/BlockBreaker.ts, src/world/ParticleSystem.ts (baru)*
> "Buat particle burst effect yang memancarkan pecahan 3D voxel kecil berwarna senada saat blok hancur."

**CP136** — *Files: src/world/ItemDropManager.ts (baru), src/inventory/Inventory.ts*
> "Buat sistem 3D floating item drop di tanah yang melayang/berputar, dan tertarik secara magnetik ke player saat jarak dekat."

**CP137** — *Files: src/inventory/ItemRegistry.ts, src/interaction/BlockBreaker.ts*
> "Tambahkan bar durabilitas pada alat (Pickaxe, Axe, Shovel) dan bedakan kecepatan menggali tergantung tipe alat yang dipegang."

**CP138** — *Files: src/multiplayer/ChatBox.ts (baru), src/multiplayer/NetworkManager.ts*
> "Buat UI Chat Box interaktif yang dibuka dengan tombol 'T', serta tampilkan name tag melayang di atas avatar player multiplayer."

