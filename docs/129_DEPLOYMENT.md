# Panduan Deployment Web Application (CP-129)

Aplikasi **Mini Minecraft** dibangun menggunakan Vite, TypeScript, dan Three.js. Aplikasi ini dapat di-deploy secara cuma-cuma (*free tier*) ke berbagai platform hosting statis modern.

---

## 1. Opsi A: Deployment ke Vercel (Rekomendasi Utama)

### Metode 1: Lewat Vercel Dashboard & GitHub Repository
1. Push repository proyek Anda ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete mini minecraft voxel game"
   git push origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com/new).
3. Import repository GitHub Anda.
4. Vercel akan secara otomatis mendeteksi framework **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**. URL publik langsung aktif dalam kurun waktu $< 1$ menit!

### Metode 2: Menggunakan Vercel CLI (Direct Command Line)
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 2. Opsi B: Deployment ke GitHub Pages

1. Install package `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Tambahkan script berikut di file `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
3. Tambahkan konfigurasi `base` di `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: '/minecraft-lite/', // sesuaikan dengan nama repo Anda
   });
   ```
4. Jalankan command deploy:
   ```bash
   npm run deploy
   ```

---

## 3. Opsi C: Deployment ke Netlify / Cloudflare Pages

1. Hubungkan repository GitHub ke Netlify atau Cloudflare Pages.
2. Atur konfigurasi build:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Konfigurasi `vercel.json` atau file `_redirects` (`/* /index.html 200`) telah disiapkan untuk mendukung SPA routing.

---

## 4. Deployment Multiplayer WebSocket Server (Opsional)

Untuk mengaktifkan fitur multiplayer publik di luar localhost:
1. Deploy folder `server/` ke platform Node.js gratisan seperti **Render.com**, **Railway.app**, atau **Fly.io**.
2. Dapatkan URL WebSocket publik (contoh: `wss://minecraft-server.onrender.com`).
3. Perbarui alamat koneksi di `NetworkManager.ts`:
   ```ts
   networkManager.connect('wss://minecraft-server.onrender.com');
   ```
