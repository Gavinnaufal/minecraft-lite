# Laporan Playtest & Balance Pertempuran Sistem Armor (CP-272)

## 1. Metodologi & Transparansi Verifikasi

- **Metode Verifikasi**: Trace Logika Kode Terbimbing (*Static Logic Trace*) & Pengujian Kompilasi TypeScript Strict (`npm run build`).
- **Catatan Kejujuran Metodologis**: Sesuai arahan `AGENTS.md`, agen AI tidak memiliki GUI browser runtime visual aktif. Pengujian dilakukan melalui kalkulasi unit-level pada kelas `ArmorSystem`, `EquipmentSlots`, dan `Player.damage()`.

---

## 2. Tabel Simulasi Pengurangan Damage Armor per Set

| Set Armor | Total Poin Defense | % Pengurangan Damage | Zombie (Raw 2.0 HP) | Skeleton/Spider (Raw 3.0 HP) | Enderman (Raw 6.0 HP) | Status |
|---|---|---|---|---|---|---|
| **Tanpa Armor** | 0 Poin | 0% | 2.0 HP | 3.0 HP | 6.0 HP | ✅ Baseline |
| **Leather Set** (Helm+Chest+Legs+Boots) | 7 Poin | 28% | 1.4 HP | 2.2 HP | 4.3 HP | ✅ Pass |
| **Iron Set** (Helm+Chest+Legs+Boots) | 15 Poin | 60% | 1.0 HP *(Cap Min 1)* | 1.2 HP | 2.4 HP | ✅ Pass |
| **Max Cap Defense** | 20 Poin | 80% *(Cap Max 80%)* | 1.0 HP *(Cap Min 1)* | 1.0 HP *(Cap Min 1)* | 1.2 HP | ✅ Pass |

---

## 3. Formulasi & Logika Penyeimbangan Pertempuran

1. **Formula Pengurangan Damage (`ArmorSystem.ts`):**
   $$\text{Mitigated Damage} = \max\left(1, \text{Raw Damage} \times (1 - \min(0.80, \text{Total Defense} \times 0.04))\right)$$
2. **Kesesuaian HUD Bar:**
   - 10 Ikon Perisai (Shield) di atas Health Bar secara akurat merepresentasikan hingga 20 Poin Defense (1 Shield = 2 Poin, Half Shield = 1 Poin).
3. **Mekanik Auto-Equip Shift-Click:**
   - Pemain dapat dengan cepat memakai set armor dari Hotbar/Inventory langsung ke slot Equipment yang sesuai menggunakan Shift + Left Click.

---

## 4. Bugfix: Armor Bypass pada Proyektil & Serangan Melee Non-Zombie (Post-CP272)

> **Bug ditemukan**: Semua serangan mob **kecuali Zombie** langsung memodifikasi `player.health` tanpa melalui `Player.damage(rawAmount, equipmentSlots)`, sehingga armor sama sekali tidak mengurangi damage.

### Sumber Bug:
| File | Kode Buggy | Jenis Serangan |
|---|---|---|
| `ProjectileManager.ts:62` | `player.health = Math.max(0, player.health - 3)` | Arrow (Skeleton) |
| `ProjectileManager.ts:118` | `player.damage(fb.damage)` — tanpa `equipmentSlots` | Fireball (Blaze/Ghast) |
| `Enderman.ts:226` | `player.health = Math.max(0, player.health - 6)` | Enderman Melee |
| `Spider.ts:136` | `player.health = Math.max(0, player.health - 3)` | Spider Melee |

### Perbaikan:
- Semua jalur serangan di atas kini menggunakan `player.damage(rawDamage, equipmentSlots)`.
- `ProjectileManager.update()` menerima parameter `equipmentSlots` dari `main.ts`.
- `Enderman.update()` dan `Spider.update()` menerima `equipmentSlots` dari `Mob.update()` base signature.

### Verifikasi Empiris (Script Test):
**Metode**: Empirical Script Test (`npx tsx test_armor_mitigation.ts`) mengimpor `ArmorSystem`, `Player`, dan `EquipmentSlots` asli.

| Serangan | Raw Damage | Full Iron (15 Def, 60%) | Hasil Script | Status |
|---|---|---|---|---|
| Ghast Fireball | 7.0 HP | 2.8 HP | 2.8 HP | ✅ Pass |
| Blaze Fireball | 4.0 HP | 1.6 HP | 1.6 HP | ✅ Pass |
| Skeleton Arrow | 3.0 HP | 1.2 HP | 1.2 HP | ✅ Pass |
| Enderman Melee | 6.0 HP | 2.4 HP | 2.4 HP | ✅ Pass |
| Spider Melee | 3.0 HP | 1.2 HP | 1.2 HP | ✅ Pass |
| Player E2E (Ghast+Iron) | 7.0 HP | HP: 17.2 | 17.2 | ✅ Pass |

### Damage yang SENGAJA tidak melalui Armor (Environmental):
- Drowning (`PlayerController.ts:108`): 2 HP/tick — environmental, bukan combat ✅
- Fall Damage (`PlayerController.ts:137`): variable — environmental, bukan combat ✅
- Void Death (`PlayerController.ts:146`): instant kill — environmental ✅
- Food Healing (`main.ts:1054`): `player.health +=` — bukan damage ✅

---

## 5. Kesimpulan
Sistem Armor & Peralatan (Fase 29: CP-265 s.d. CP-271) terbukti bekerja dengan seimbang. **Bug bypass armor pada proyektil dan serangan melee Enderman/Spider telah diperbaiki dan diverifikasi secara empiris** — semua jalur serangan combat kini melewati `ArmorSystem.calculateMitigatedDamage()`.
