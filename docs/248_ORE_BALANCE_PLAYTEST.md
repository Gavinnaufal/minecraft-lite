# Laporan Playtest & Balance Rasio Ore per Chunk (CP-248)

## 1. Konfigurasi Simulasi Headless (Ore Ratio Profiling)

- **Metode**: Simulasi Headless Node.js mengimpor langsung kelas produksi `OreGenerator.ts` dan `Chunk.ts`.
- **Luas Area Sampel**: 3 Seed Berbeda (`12345`, `67890`, `42911`), masing-masing menguji grid $4 \times 4 = 16$ chunk (Total: **48 chunk voxel**).
- **Kedalaman Subterranean**: Y = 5 s.d. Y = 60 (Area subterranean tempat batu/stone berada).
- **Parameter Generator Exiting (CP-240/241)**:
  - `COAL_FREQ = 0.25`, `COAL_THRESHOLD = 0.958` (Y: 5..60)
  - `IRON_FREQ = 0.3`, `IRON_THRESHOLD = 0.972` (Y: 5..40)

---

## 2. Hasil Performa & Metrik Data Empiris

### A. Ringkasan per Seed (16 Chunk / Seed)

| Seed | Area Sampel | Total Coal Ore | Rata-rata Coal/Chunk | Total Iron Ore | Rata-rata Iron/Chunk | Rasio (Coal : Iron) |
|---|---|---|---|---|---|---|
| `12345` | 16 Chunks | 396 | 24.75 | 187 | 11.69 | 2.12 : 1 |
| `67890` | 16 Chunks | 395 | 24.69 | 174 | 10.88 | 2.27 : 1 |
| `42911` | 16 Chunks | 390 | 24.38 | 180 | 11.25 | 2.17 : 1 |
| **GRAND TOTAL** | **48 Chunks** | **1.181** | **24.60** | **541** | **11.27** | **2.18 : 1** |

---

### B. Distribusi Kepadatan per Chunk (Range & Variance)

| Tipe Ore | Min per Chunk | Max per Chunk | Rata-Rata per Chunk | Target Baseline (Estimasi Kualitatif Analisis Ini) | Status Balance |
|---|---|---|---|---|---|
| **Coal Ore** | 16 blok | 38 blok | **24.60 blok** | 15–25 blok / chunk | ✅ Ideal |
| **Iron Ore** | 5 blok | 18 blok | **11.27 blok** | 6–12 blok / chunk | ✅ Ideal |

> *Catatan: Angka kisaran target pada tabel di atas (15–25 dan 6–12 blok/chunk) merupakan estimasi turunan kuantitatif dari kriteria kualitatif asli CP-241 di `13_PROMPT_AI_V3.md` ("pemain rata-rata menemukan cukup ore untuk 1 set tools dalam eksplorasi gua ~5 menit"), bukan angka numerik yang ter-hardcode pada dokumen rujukan.*

---

## 3. Analisis Gameplay & Estimasi Eksplorasi Gua (5 Menit)

Dalam simulasi eksplorasi gua standar selama ~5 menit (mencakup area penjelajahan $\approx 5$ chunk):

1. **Hasil Coal Ore (~123 blok / 5 chunk):**
   - Menyediakan bahan bakar pemanggangan yang sangat melimpah di Furnace (1 Coal memasak 8 item).
   - Menghasilkan pasokan Obor (Torch) yang cukup untuk penerangan eksplorasi panjang.
2. **Hasil Iron Ore (~56 blok / 5 chunk):**
   - Melampaui kebutuhan minimal 1 set Iron Tools (Iron Pickaxe = 3, Iron Sword = 2, Iron Axe = 3 $\to$ Total 8 Ingot).
   - Memberikan cadangan `raw_iron` yang seimbang untuk crafting Furnace tambahan & perbaikan perlengkapan.

---

## 4. Kesimpulan & Rekomendasi

1. **Status Balance Terrain Generator:**
   Nilai threshold `COAL_THRESHOLD = 0.958` dan `IRON_THRESHOLD = 0.972` di [`src/world/ores/OreGenerator.ts`](file:///C:/project%20gabut%20pas%20pkl/minecraft%20lite/src/world/ores/OreGenerator.ts) **SUDAH SANGAT PAS DAN OPTIMAL**. Tidak diperlukan perubahan parameter numerik.
2. **Script Simulasi:**
   Script [`scripts/simulate_ore_ratio.ts`](file:///C:/project%20gabut%20pas%20pkl/minecraft%20lite/scripts/simulate_ore_ratio.ts) disimpan secara permanen di folder `scripts/` sebagai perkakas benchmark otomatis untuk *playtest regression* di masa depan.
3. **Kesiapan Fase:**
   Fase 26 (Ore Mining & Smelting) kini telah **100% selesai** (10/10 Checkpoint).
