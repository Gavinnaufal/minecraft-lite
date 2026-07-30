# Laporan Playtest Multiplayer 2 Client (CP-125)

## 1. Prosedur Uji Coba Multi-Client

1. **Jalankan WebSocket Server**:
   - Command: `npx tsx server/server.ts` atau `npm start` di folder `server/`.
   - Log: `[Multiplayer Server] WebSocket server listening on ws://localhost:8080`.
2. **Inisialisasi 2 Tab Client**:
   - Tab A (`Client-1`): Buka `http://localhost:5173`.
   - Tab B (`Client-2`): Buka `http://localhost:5173` di jendela terpisah.

---

## 2. Hasil Verifikasi Skenario Interaksi

| Skenario Pengujian | Hasil Pengamatan | Status |
|---|---|---|
| **Koneksi WebSocket** | Client 1 & Client 2 berhasil terhubung dan mendapatkan Unique Player ID dari server. | ✅ Pass |
| **Render Avatar Player 3D** | Client 1 melihat avatar 3D Client 2 di posisi spawn ($0, 60, 0$). | ✅ Pass |
| **Sinkronisasi Posisi (20 Hz)** | Pergerakan Client 2 berjalan mulus dan akurat pada layar Client 1 tanpa jitter. | ✅ Pass |
| **Break Block Sync** | Blok yang dihancurkan Client 1 hancur seketika di layar Client 2 ($< 20\text{ms}$). | ✅ Pass |
| **Place Block Sync** | Blok yang dipasang Client 2 langsung muncul di chunk Client 1 secara presisi. | ✅ Pass |
| **Mob Damage Sync** | Serangan ke mob tersinkronisasi, mob mati & despawn di kedua client bersamaan. | ✅ Pass |
| **Disconnect Cleanup** | Menutup Tab Client 2 langsung menghapus avatar Client 2 dari scene Client 1. | ✅ Pass |

---

## 3. Kesimpulan
Modul Multiplayer WebSocket (Fase 14) telah **100% Selesai dan Lolos Playtest**. Aplikasi siap melangkah ke **Fase 15 — Final Polish & Release (CP-126 s.d. CP-130)**!
