# PROMPT AI V2.0 — Mini Minecraft Expansion

Dokumen ini berisi spesifikasi teknis dan prompt detail untuk eksekusi CP173 hingga CP238.

## CP-173: StructureManager & VillageGenerator layout algorithm
- File: `src/world/structures/VillageGenerator.ts`, `src/world/structures/StructureManager.ts`
- Output: Algoritma penentuan posisi desa pada chunk Plains dan tata letak bangunan.

## CP-174: Oak Wood House prefab generator
- File: `src/world/structures/prefabs/HousePrefab.ts`
- Output: Fungsi generator bangunan rumah kayu ek 5x5 dengan dinding, atap, pintu, dan pencahayaan torch.

## CP-175: Cobblestone House prefab generator
- File: `src/world/structures/prefabs/StoneHousePrefab.ts`
- Output: Fungsi generator bangunan rumah batu (cobblestone) dengan atap dan lantai.

## CP-176: Dirt path generator connecting village houses
- File: `src/world/structures/VillageGenerator.ts`
- Output: Jalur jalan tanah (dirt path / gravel) yang menghubungkan antar pintu rumah di dalam desa.

## CP-177: Small wheat farm field structure in villages
- File: `src/world/structures/prefabs/FarmPrefab.ts`
- Output: Ladang gandum 3x5 dengan parit air di tengah dan blok farmland + wheat.

## CP-178: Village spawn placement on flat Plains biomes
- File: `src/main.ts`, `src/world/ChunkManager.ts`
- Output: Integrasi generasi desa otomatis saat chunk Plains dimuat.

---

*(Spesifikasi lengkap untuk CP179–CP238 dapat diakses sesuai urutan pengerjaan checkpoint)*
