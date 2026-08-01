# PROMPT AI V3.0 — Mini Minecraft Expansion

Dokumen ini berisi spesifikasi teknis dan prompt detail untuk eksekusi CP239 hingga CP296.
Format mengikuti pola `09_PROMPT_AI_V2.md`: isi lengkap disediakan bertahap sesuai urutan pengerjaan checkpoint.

## CP-239: BlockRegistry addition — coal_ore & iron_ore
- File: `src/world/BlockRegistry.ts`
- Prasyarat: baca dulu ID yang sudah dipakai (0-20 sesuai README v2.0) sebelum menambah entry baru. Gunakan ID 21 (coal_ore) dan ID 22 (iron_ore).
- Output: entry baru dengan properti solid: true, transparent: false, hardness sedikit lebih tinggi dari `stone` biasa, drop item sesuai CP242.

## CP-240: OreGenerator.ts — cluster noise placement
- File: `src/world/ores/OreGenerator.ts` (folder baru, sah sesuai `11_GDD_EXPANSION_V3.md` bagian 4)
- Output: fungsi generate cluster ore per-chunk menggunakan 3D noise terpisah dari cave noise yang sudah ada, dengan range Y berbeda per jenis ore (coal_ore: Y5-60, iron_ore: Y5-40).
- Peringatan bug: ingat catatan "swiss cheese effect" di `AGENTS.md` — gunakan threshold noise ketat sejak awal, JANGAN mulai longgar lalu diperbaiki belakangan.

## CP-241: Ore cluster threshold tuning
- File: `src/world/ores/OreGenerator.ts`
- Output: tuning rasio kemunculan agar iron_ore terasa "jarang tapi tidak langka berlebihan" (target: pemain rata-rata menemukan cukup ore untuk 1 set tools dalam eksplorasi gua ~5 menit).

## CP-242: Item baru — raw_iron & coal
- File: `src/inventory/ItemRegistry.ts`
- Output: raw_iron (drop dari break iron_ore, TIDAK langsung jadi ingot), coal (drop dari coal_ore, berfungsi ganda sebagai fuel item di CP243).

## CP-243: Furnace smelting mode terpisah dari cooking mode
- File: `src/interaction/` atau lokasi Furnace logic existing (baca dulu implementasi cooking CP-212 sebelum menambah, jangan duplikasi state).
- Output: Furnace punya 2 mode berdasarkan item di slot input — kalau raw meat → cooking (behavior existing, jangan diubah), kalau raw_iron → smelting (behavior baru, fuel dikonsumsi dari slot terpisah).

## CP-244: Furnace UI progress bar arrow
- File: `src/ui/` (mengikuti pola modal Chest/Crafting yang sudah ada)
- Output: elemen visual arrow progress bar yang terisi sesuai smelting/cooking timer.

## CP-245: Smelting recipe — raw_iron + fuel → iron_ingot
- File: `src/crafting/Recipes.ts`
- Output: entry resep baru, pastikan tidak menabrak resep existing yang sudah pakai iron_ingot sebagai bahan (Iron Pickaxe, Sword, Axe — baca ulang tabel resep di README sebelum menambah).

## CP-246: Pickaxe tier requirement check
- File: `src/interaction/BlockBreaker.ts`
- Output: validasi tool tier — iron_ore hanya bisa di-break (dan drop raw_iron) kalau player memegang minimal Stone Pickaxe; kalau tool lebih rendah, blok tetap hancur tapi tidak drop apa pun (silk-touch-less behavior khas Minecraft).

## CP-247: Ore block texture pass
- File: `public/textures/blocks/`
- Output: tekstur 16x16 px baru untuk coal_ore & iron_ore (pola spot/bintik pada base texture stone, mengikuti gaya "Authentic 16x16 Pixel Art Textures Pass" dari CP-153).

## CP-248: Playtest & balance
- Output: laporan playtest rasio kemunculan ore per chunk pada beberapa seed berbeda, dokumentasikan hasil di file laporan terpisah (pola sama seperti `109_PROFILING.md`/`115_STRESS_TEST.md`).

---

*(Spesifikasi lengkap untuk CP249–CP296 dapat diakses sesuai urutan pengerjaan checkpoint — susul di sesi berikutnya sesuai progress Fase 27 ke atas, mengikuti pola bertahap yang sama seperti v2.0.)*
