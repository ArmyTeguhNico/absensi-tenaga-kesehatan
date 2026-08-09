# 🚀 QUICK START: Deploy ke Netlify

## 📌 **Yang Anda Butuhkan:**
1. ✅ Akun GitHub (gratis)
2. ✅ Akun Railway.app (gratis)
3. ✅ Akun Netlify (gratis)
4. ✅ Supabase sudah setup (already done!)

---

## ⚡ **3 LANGKAH MUDAH**

### **STEP 1: Push ke GitHub** (5 menit)

```bash
# 1. Inisialisasi Git
cd D:\WEB_ABSENSI_TENAGA_KESEHATAN
git init

# 2. Add & Commit
git add .
git commit -m "Initial commit - Sistem Absensi"

# 3. Buat repo baru di GitHub
# Buka: https://github.com/new
# Nama: absensi-tenaga-kesehatan
# Public/Private: Terserah Anda
# Jangan centang "Initialize with README"

# 4. Push ke GitHub
git branch -M main
git remote add origin https://github.com/USERNAME/absensi-tenaga-kesehatan.git
git push -u origin main
```

**⚠️ PENTING:** Ganti `USERNAME` dengan username GitHub Anda!

---

### **STEP 2: Deploy Backend ke Railway** (7 menit)

#### A. Login & Connect
1. Buka https://railway.app
2. Klik **"Login"** → **"Login with GitHub"**
3. Authorize Railway

#### B. Deploy Project
1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: `absensi-tenaga-kesehatan`
4. Klik **"Deploy Now"**

#### C. Set Environment Variables
1. Klik tab **"Variables"**
2. Klik **"New Variable"**
3. Copy dari `.env` file Anda:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
JWT_SECRET=your-secret-key-production
JWT_EXPIRE=7d
NODE_ENV=production
ADMIN_EMAIL=admin@kesehatan.com
ADMIN_PASSWORD=Admin123!
```

#### D. Get Backend URL
1. Klik tab **"Settings"**
2. Scroll ke **"Domains"**
3. Copy URL: `https://xxxxx.up.railway.app`
4. **SIMPAN URL INI!** ← Penting untuk step berikutnya

#### E. Test Backend
Buka di browser:
```
https://xxxxx.up.railway.app/api/health
```

Harus muncul:
```json
{
  "status": "OK",
  "timestamp": "2024-..."
}
```

---

### **STEP 3: Update & Deploy Frontend ke Netlify** (5 menit)

#### A. Update API URL

**Edit file:** `public/js/config.js`

Ganti baris ini:
```javascript
: 'https://your-backend-app.herokuapp.com/api';
```

Dengan URL Railway Anda (dari Step 2D):
```javascript
: 'https://xxxxx.up.railway.app/api';
```

**Save file!**

#### B. Push Update ke GitHub
```bash
git add public/js/config.js
git commit -m "Update API URL for production"
git push origin main
```

#### C. Deploy ke Netlify

**Cara 1: Auto Deploy (Recommended)**

1. Buka https://app.netlify.com
2. Klik **"Add new site"** → **"Import an existing project"**
3. Pilih **"GitHub"** → Authorize Netlify
4. Pilih repo: `absensi-tenaga-kesehatan`
5. Build settings:
   - **Base directory:** (kosongkan)
   - **Build command:** `echo 'No build needed'`
   - **Publish directory:** `public`
6. Klik **"Deploy site"**
7. Tunggu 1-2 menit

**Cara 2: Manual Upload (Lebih Cepat)**

1. Buka https://app.netlify.com
2. Klik **"Add new site"** → **"Deploy manually"**
3. **Drag folder `public/`** ke browser
4. Tunggu upload selesai

#### D. Update CORS di Backend

Backend perlu tahu domain Netlify Anda!

1. Di Netlify, copy URL site Anda: `https://xxxxx.netlify.app`
2. Edit file `server.js` (lokal):

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://xxxxx.netlify.app',  // ← Tambah ini!
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

3. Push update:
```bash
git add server.js
git commit -m "Add Netlify URL to CORS"
git push origin main
```

4. Railway otomatis redeploy (tunggu 1 menit)

---

## ✅ **STEP 4: TEST LIVE!**

### Test Login
1. Buka: `https://xxxxx.netlify.app`
2. Login:
   - Email: `admin@kesehatan.com`
   - Password: `Admin123!`
3. Kalau dashboard muncul → **SUCCESS!** 🎉

### Test Admin Panel
```
https://xxxxx.netlify.app/admin.html
```

### Test RFID & Face Registration
```
https://xxxxx.netlify.app/rfid-face-register.html
```

---

## 🐛 **Troubleshooting**

### ❌ "Failed to fetch" / "Network Error"

**Cek 1:** Backend Railway masih running?
- Buka Railway dashboard
- Tab "Deployments" harus "Active"

**Cek 2:** URL API sudah benar?
- Buka `public/js/config.js`
- Pastikan URL = Railway URL + `/api`

**Cek 3:** CORS sudah diupdate?
- File `server.js` harus include URL Netlify
- Push ke GitHub → Railway redeploy

### ❌ "Cannot GET /api/..."

API endpoint tidak ditemukan.

**Solusi:**
- Test langsung: `https://railway-url.up.railway.app/api/health`
- Jika 404, cek Railway logs (tab "Logs")
- Pastikan `server.js` jalan dengan benar

### ❌ Login gagal

**Cek database:**
1. Buka Supabase Dashboard
2. Table Editor → `users`
3. Pastikan ada user admin
4. Jika tidak ada, run di Railway:
   - Tab "Settings" → klik "SSH"
   - Ketik: `npm run init-db`

### ❌ CORS Error di Console

```
Access to fetch at '...' has been blocked by CORS policy
```

**Solusi:**
1. Edit `server.js`
2. Tambah URL Netlify ke `corsOptions.origin`
3. Push ke GitHub
4. Tunggu Railway redeploy

---

## 📱 **URL Aplikasi Anda**

Setelah selesai, Anda punya 3 URL:

```
Frontend (Netlify):
https://your-site-name.netlify.app

Backend API (Railway):
https://your-backend.up.railway.app/api

Database (Supabase):
https://xxxxx.supabase.co (dashboard)
```

**Share ke dosen/teman:** ✅  
**Test dari HP:** ✅  
**Siap demo:** ✅

---

## 🎯 **Maintenance**

### Update Frontend:
```bash
# Edit files di folder public/
git add .
git commit -m "Update UI"
git push origin main
# Netlify auto-deploy!
```

### Update Backend:
```bash
# Edit controllers/routes/dll
git add .
git commit -m "Update API"
git push origin main
# Railway auto-deploy!
```

### Monitor:
- **Railway:** Logs, metrics, CPU usage
- **Netlify:** Deploy logs, bandwidth usage
- **Supabase:** Database queries, storage

---

## 💰 **Biaya**

**GRATIS!** (dalam batas free tier)

- ✅ Netlify: 100GB bandwidth/bulan
- ✅ Railway: $5 credit gratis/bulan
- ✅ Supabase: 500MB database, unlimited API requests

Kalau mau unlimited, upgrade nanti aja kalau perlu.

---

## 🚀 **Next Steps**

Setelah deploy:

1. **Custom Domain** (optional)
   - Beli domain di Niagahoster/Rumahweb
   - Connect ke Netlify (auto HTTPS!)

2. **Monitoring**
   - Setup uptime monitoring (UptimeRobot gratis)
   - Email alert kalau down

3. **Backup**
   - Supabase otomatis backup
   - Tapi download manual juga via SQL Editor

4. **Hardware Integration**
   - Connect RFID reader ke backend API
   - Test face recognition dengan webcam

---

**📞 Butuh Bantuan?**

Baca file lengkap: `DEPLOYMENT_GUIDE.md`

**🎉 SELAMAT! Aplikasi Anda sudah LIVE di Internet!**

---

*Last updated: 2024*
