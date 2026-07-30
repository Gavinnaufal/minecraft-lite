# GAME DESIGN DOCUMENT (GDD)
## Mini Minecraft — Voxel Sandbox Web Game

**Versi:** 1.0
**Tanggal:** 30 Juli 2026
**Engine/Stack:** Three.js + TypeScript + Vite (berjalan di browser)
**Genre:** Sandbox / Survival-lite / Building
**Target platform:** Desktop browser (Chrome/Edge/Firefox), keyboard + mouse

---

## 1. VISI GAME

Mini Minecraft adalah versi ringkas dari Minecraft yang berjalan penuh di browser. Pemain menjelajah dunia voxel yang dihasilkan secara prosedural, menghancurkan dan menempatkan blok, mengumpulkan resource, meracik item sederhana, bertahan dari mob dasar, dan menyimpan progres mereka secara lokal.

**Pilar desain:**
1. **Simplicity first** — mekanik inti (break/place block) harus terasa solid sebelum fitur lain ditambah.
2. **Proceduralism** — dunia dibuat prosedural, bukan hand-crafted, agar replayable.
3. **Performance-aware** — voxel rendering harus tetap ≥30 FPS di laptop menengah (chunking + culling wajib sejak awal).
4. **Incremental scope** — dibangun bertahap lewat checkpoint kecil, cocok untuk vibe coding (satu fitur, satu prompt, satu commit).

---

## 2. GAMEPLAY LOOP

```
Spawn di dunia → Jelajah & kumpulkan resource (kayu, batu, dsb)
   → Craft tools/blok baru → Bangun shelter → Bertahan dari mob (siang/malam)
   → Explore lebih jauh → Progres tools (kayu → batu → besi) → Repeat
```

Loop inti (moment-to-moment): **Lihat blok → Klik kiri (break) / klik kanan (place) → Update inventory → Update dunia.**

---

## 3. MEKANIK INTI

### 3.1 Dunia Voxel
- Dunia terbagi jadi **chunk** (16x16x128 blok per chunk, bisa disesuaikan performa).
- Terrain dihasilkan pakai noise 2D (Simplex/Perlin) untuk height map, plus noise 3D opsional untuk gua.
- Biome sederhana: Plains, Forest, Desert, Mountain, Ocean (minimal 4-5 biome).

### 3.2 Blok
Tipe blok minimum untuk MVP:
`air, grass, dirt, stone, wood_log, leaves, sand, water, coal_ore, iron_ore, plank, crafting_table`

Setiap blok punya: id, nama, tekstur (per-face jika perlu), hardness (waktu break), drop item, apakah solid/transparan.

### 3.3 Interaksi Blok
- **Break**: klik kiri tahan, progress bar hardness, drop item ke inventory.
- **Place**: klik kanan dari hotbar slot aktif, snapping ke grid voxel, cek collision dengan player.
- Raycast dari kamera untuk deteksi blok target (jarak maks ~5 unit).

### 3.4 Player
- First-person controller: WASD gerak, mouse look, Space lompat, Shift sneak (opsional).
- Physics: gravity, collision AABB terhadap voxel grid, ground detection.
- Health bar sederhana (10 heart / 20 HP), damage dari fall & mob.
- Hunger bar (opsional, stretch goal).

### 3.5 Inventory & Hotbar
- Hotbar 9 slot + inventory grid 27 slot (3x9), mirip Minecraft.
- Drag-drop antar slot, stack max 64 per item.
- Hotbar dipilih via angka 1-9 atau scroll mouse.

### 3.6 Crafting
- Crafting table 3x3 grid, resep sederhana (kayu→plank, plank→crafting table, plank+stick→pickaxe, dst).
- Minimal 10-15 resep untuk MVP.

### 3.7 Day/Night Cycle
- Siklus waktu (misal 10-20 menit real-time per hari game).
- Skybox berubah warna, directional light intensity berubah, mob spawn lebih banyak saat malam.

### 3.8 Mobs
- Passive mob: Sapi/Ayam (jalan random, bisa di-attack jadi food).
- Hostile mob: Zombie sederhana (spawn malam hari, chase player dalam radius, damage on contact).
- AI minimal: state machine (idle → wander → chase → attack).

### 3.9 Save/Load
- World state (chunk yang dimodifikasi), inventory, posisi player disimpan di IndexedDB/localStorage.
- Auto-save berkala + save manual (tombol/menu).

---

## 4. KONTROL

| Input | Aksi |
|---|---|
| W/A/S/D | Gerak |
| Mouse | Lihat sekitar |
| Space | Lompat |
| Klik kiri (tahan) | Break blok |
| Klik kiri (mob) | Attack |
| Klik kanan | Place blok |
| 1-9 / scroll | Pilih hotbar slot |
| E | Buka inventory |
| Esc | Pause menu |

---

## 5. UI/UX

- **HUD**: health bar, hunger bar (opsional), hotbar, crosshair.
- **Inventory screen**: grid drag-drop, crafting area.
- **Pause menu**: Resume, Save, Load, Settings (render distance, sensitivity), Exit.
- Gaya visual: flat-shaded low-poly blocky, mirip Minecraft klasik (tekstur 16x16 px per blok).

---

## 6. SCOPE MVP vs STRETCH GOALS

**MVP (wajib untuk "playable"):**
Voxel rendering + chunking, world gen, break/place, player physics, inventory dasar, hotbar, 1 mob hostile + 1 mob passive, day/night, save/load lokal.

**Stretch goals (opsional, dikerjakan setelah MVP solid):**
Crafting penuh (semua tool tier), water simulation sederhana, sound & music, multiplayer (WebSocket), mobile/touch controls, texture pack support, achievement, screenshot/export world.

---

## 7. TARGET TEKNIS

- FPS target: 30-60 FPS pada laptop mid-range (integrated GPU) dengan render distance 6-8 chunk.
- Ukuran chunk: 16x16x128 (bisa dikecilkan ke 16x16x64 kalau performa berat).
- Total waktu development (solo, vibe coding): estimasi 6-10 minggu part-time, tergantung kecepatan iterasi.

---

## 8. REFERENSI INSPIRASI

Minecraft (Mojang), Voxel.js, Eldritch Kingdom (open source voxel game), Craft.js/Ace of Spades — dipelajari hanya sebagai referensi genre, bukan untuk menyalin aset/kode berhak cipta apa pun.
