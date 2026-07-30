# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Mini Minecraft — Voxel Sandbox Web Game

**Versi:** 1.0
**Pemilik produk:** Kamu (solo dev, dibantu vibe coding via DeepSeek V4 Pro)
**Tanggal:** 30 Juli 2026

---

## 1. TUJUAN PRODUK

Membangun game voxel sandbox berbasis browser yang bisa dimainkan end-to-end (spawn → explore → build → survive → save) sebagai portofolio teknis, dengan seluruh proses development dilakukan lewat pendekatan **vibe coding**: prompt ke DeepSeek V4 Pro → generate kode → jalankan → uji → refine.

## 2. MASALAH YANG DISELESAIKAN

- Ingin punya bukti nyata kemampuan membangun game engine-lite (rendering, physics, world gen) tanpa mengandalkan game engine berat (Unity/Unreal).
- Ingin workflow AI-assisted development yang terstruktur, bukan asal prompt tanpa arah — makanya butuh roadmap checkpoint + prompt siap pakai.

## 3. TARGET PENGGUNA

- **Primer:** Diri sendiri (developer solo) sebagai pembelajaran & portofolio.
- **Sekunder:** Pemain kasual yang ingin coba versi ringan Minecraft langsung di browser tanpa instal apa pun.

## 4. SUCCESS METRICS

| Metrik | Target |
|---|---|
| Playable end-to-end loop | Ya (spawn → craft → survive → save/load) |
| FPS minimum | ≥30 FPS di laptop mid-range |
| Waktu load awal dunia | ≤5 detik |
| Jumlah checkpoint roadmap selesai | 100% dari MVP (~100 checkpoint) |
| Crash/bug blocker saat playtest 15 menit | 0 |
| Save/load berhasil tanpa data loss | 100% dari test case |

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 Must-have (MVP)
- FR-1: Sistem render voxel berbasis chunk dengan face culling (tidak render face yang tertutup blok lain).
- FR-2: World generation prosedural (noise-based height map + minimal 4 biome).
- FR-3: Break & place block dengan raycast dan validasi jarak/collision.
- FR-4: Player controller first-person dengan gravity, collision, jump.
- FR-5: Inventory system (hotbar 9 slot + storage 27 slot) dengan drag-drop dan stacking.
- FR-6: Minimal 1 mob passive dan 1 mob hostile dengan AI state machine dasar.
- FR-7: Day/night cycle yang memengaruhi lighting dan spawn mob.
- FR-8: Save/load world state (block changes, inventory, posisi) ke local storage/IndexedDB.
- FR-9: HUD (health bar, hotbar, crosshair) dan pause menu.

### 5.2 Should-have
- FR-10: Crafting table dengan minimal 10 resep.
- FR-11: Sound effect dasar (break, place, footstep, ambient).
- FR-12: Settings menu (render distance, mouse sensitivity, volume).

### 5.3 Could-have (stretch)
- FR-13: Multiplayer via WebSocket (2+ pemain di dunia sama).
- FR-14: Water flow simulation sederhana.
- FR-15: Texture pack loader (ganti tekstur via file terpisah).
- FR-16: Mobile/touch control layer.

## 6. NON-FUNCTIONAL REQUIREMENTS

- **Performance:** chunk loading/unloading tidak boleh nge-freeze main thread >100ms (pertimbangkan Web Worker untuk mesh generation di fase optimasi).
- **Compatibility:** berjalan baik di Chrome & Firefox versi terbaru (2 tahun terakhir).
- **Maintainability:** kode modular (lihat dokumen arsitektur folder), setiap sistem (world, player, inventory, mob, save) terpisah jelas agar mudah di-prompt ulang ke DeepSeek per modul.
- **No build tool berat:** pakai Vite agar hot-reload cepat selama vibe coding.

## 7. OUT OF SCOPE (untuk versi 1.0)

- Redstone/circuit system.
- Nether/dimension lain.
- Enchanting, potion brewing.
- Mod support/plugin API.
- Anti-cheat / server authoritative multiplayer (kalau multiplayer dikerjakan, cukup peer-honest untuk skala kecil/demo).

## 8. ASUMSI & RISIKO

| Risiko | Mitigasi |
|---|---|
| Performa voxel rendering berat di browser | Terapkan chunking + face culling sejak checkpoint awal (Fase 2), jangan ditunda ke akhir |
| Scope creep (nambah fitur Minecraft asli tanpa batas) | Patuhi MVP vs stretch goals di GDD, roadmap dikunci ke checkpoint yang sudah ditentukan |
| DeepSeek generate kode inkonsisten antar prompt | Selalu sertakan konteks file terkait di tiap prompt (manfaatkan context 1M token), commit tiap checkpoint selesai |
| Kompleksitas physics/collision voxel meleset | Mulai dari AABB sederhana dulu, jangan langsung swept-collision kompleks |

## 9. TIMELINE RINGKAS

| Fase | Estimasi durasi (part-time) |
|---|---|
| Fase 0-2: Setup, rendering, voxel/chunk | 1.5 minggu |
| Fase 3-5: World gen, interaksi blok, physics | 2 minggu |
| Fase 6-8: Inventory, crafting, day/night | 1.5 minggu |
| Fase 9-10: Mob AI, save/load | 1.5 minggu |
| Fase 11-13: UI polish, optimisasi, audio | 1.5 minggu |
| Fase 14-15: Stretch (multiplayer), release polish | fleksibel |

## 10. DEPENDENSI TEKNIS

- Three.js (rendering)
- Vite + TypeScript (tooling)
- simplex-noise / open-simplex-noise (procedural generation)
- Web Worker API (mesh generation off main thread, fase optimasi)
- IndexedDB (via idb library, opsional) untuk save/load
- Howler.js (opsional, untuk audio)
