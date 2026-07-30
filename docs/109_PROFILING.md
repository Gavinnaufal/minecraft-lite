# Laporan Profiling Performa Game Mini Minecraft (CP-109)

## 1. Panduan Langkah Profiling Menggunakan Chrome DevTools Performance Tab

1. **Inisialisasi Lingkungan Production/Preview**:
   - Jalankan command build production dan preview server: `npm run build && npm run preview`.
   - Buka Google Chrome di URL preview (misal `http://localhost:4173`).
2. **Membuka Tab Performance**:
   - Tekan `F12` atau `Ctrl+Shift+I` untuk membuka Chrome DevTools, lalu pilih tab **Performance**.
3. **Pengambilan Sesi Rekaman (Recording)**:
   - Tekan tombol **Record** (lingkaran hitam di kiri atas) atau tombol pintas `Ctrl+E`.
   - Lakukan pergerakan aktif di dalam game selama 10–15 detik: berjalan, terbang/melompat menembus terrain baru, menghancurkan/memasang blok, serta berinteraksi dengan mob.
   - Klik **Stop** untuk mengakhiri rekaman dan memproses data profiling.
4. **Metrik Utama yang Dianalisis**:
   - **FPS Graph**: Memeriksa adanya penurunan frame (*frame dip*) di bawah target 60 FPS.
   - **CPU Flame Chart**: Memeriksa alokasi waktu eksekusi JavaScript per frame ($> 16.6\text{ms}$ mengindikasikan stutter).
   - **Garbage Collection (GC Spikes)**: Memeriksa garis merah/spike pada grafik alokasi memori JS Heap.

---

## 2. Hasil Diagnosis Bottleneck Utama

Berdasarkan analisis mendalam terhadap alur eksekusi aplikasi:

### A. Alokasi Objek Sementara (High GC Pressure)
- **Lokasi Kode**: `main.ts`, `Raycaster.ts`, `BlockBreaker.ts`, `MobManager.ts`.
- **Temuan**: Instansiasi objek sementara seperti `new THREE.Vector3()`, `new THREE.Raycaster()`, dan instansiasi mob baru saat spawn terjadi berulangkali di dalam *game loop*.
- **Dampak**: Menimbulkan jeda micro-stutter periodik saat Chrome V8 melakukan Garbage Collection.

### B. Jumlah Material Groups & Draw Calls (Mesh Rendering Load)
- **Lokasi Kode**: `src/world/ChunkMesher.ts`.
- **Temuan**: Chunk geometri dibagi menjadi beberapa sub-group (`geometry.addGroup`) berdasarkan jenis blok, di mana tiap tipe blok memiliki instansi material tersendiri.
- **Dampak**: Pada Render Distance 8 (289 chunk aktif), total *draw call* WebGL dapat melampaui 1.000+ per frame, membebani transmisi komando CPU-ke-GPU.

### C. Raycasting Berulang per Frame
- **Lokasi Kode**: `main.ts` (Dynamic Crosshair) & `BlockBreaker.ts`.
- **Temuan**: Penembakan raycast kamera dilakukan 2 kali per frame untuk mengecek benturan mob dan blok.

---

## 3. Rencana Aksi Optimasi (CP-110 s.d. CP-115)

| Checkpoint | Target Optimasi | Rencana Solusi Kode |
|---|---|---|
| **CP-110 / CP-111** | Object Pooling Mob | Menerapkan *Object Pool* di `MobManager.ts` untuk meng-reuse instansi `Mob` daripada `new`/`dispose` |
| **CP-112** | Frustum Culling Chunk | Melewati update & render chunk yang berada di luar sudut pandang kamera (`camera.frustum`) |
| **CP-113** | Texture Atlas & Single Material | Menyatukan tekstur ke 1 Atlas Texture dan 1 Material tunggal untuk memangkas Draw Calls |
| **CP-114** | Lazy Chunk Loading Rate-Limiting | Membatasi generasi chunk baru maks 1-2 chunk per frame agar FPS tetap konstan saat penjelajahan cepat |
