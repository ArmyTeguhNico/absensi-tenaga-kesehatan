# 🚀 DEPLOY KE NETLIFY - PANDUAN LENGKAP

## 📌 **Situasi Saat Ini:**
- ✅ Frontend sudah di Netlify
- ❌ Backend masih local (localhost:3000)
- ❌ Tidak bisa login di Netlify karena backend belum deploy

---

## 🎯 **SOLUSI - 2 LANGKAH:**

### **LANGKAH 1: Deploy Backend ke Railway/Render**
Backend API harus online agar bisa diakses dari Netlify

### **LANGKAH 2: Update Frontend Config**
Ubah API URL di frontend ke backend yang sudah deploy

---

## 🚂 **STEP 1: DEPLOY BACKEND KE RAILWAY**

### **A. Signup Railway:**
1. Buka: https://railway.app
2. Klik **"Start a New Project"**
3. Login dengan GitHub
4. Authorize Railway

### **B. Deploy dari GitHub:**

#### **1. Push Project ke GitHub (jika belum):**
```bash
cd D:\WEB_ABSENSI_TENAGA_KESEHATAN

# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Sistem Absensi"

# Set branch to main
git branch -M main

# Add remote (GANTI dengan repo Anda!)
git remote add origin https://github.com/YOUR_USERNAME/absensi-kesehatan.git

# Push
git push -u origin main
```

#### **2. Deploy di Railway:**
1. Railway dashboard → **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: `absensi-kesehatan`
4. Klik **"Deploy Now"**

#### **3. Set Environment Variables:**
Railway dashboard → **Tab "Variables"** → **"New Variable"**

Copy dari `.env` Anda:
```
SUPABASE_URL=https://tbjshustaqijmbtxssod.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=absensi-tenaga-kesehatan-secret-key-2024
JWT_EXPIRE=7d
NODE_ENV=production
ADMIN_EMAIL=armyteguh00@gmail.com
ADMIN_PASSWORD=Admin123!
PORT=3000
```

**⚠️ PENTING:** Paste satu per satu!

#### **4. Generate Domain:**
1. Tab **"Settings"** → Scroll ke **"Domains"**
2. Klik **"Generate Domain"**
3. Railway beri URL: `https://xxxxx.up.railway.app`
4. **COPY URL INI!** Contoh: `https://absensi-backend-production.up.railway.app`

#### **5. Test Backend:**
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

✅ **Backend LIVE!**

---

## 🌐 **STEP 2: UPDATE FRONTEND (NETLIFY)**

### **A. Update API URL:**

Edit file `public/js/config.js`:

**SEBELUM:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://your-backend-app.herokuapp.com/api';
```

**SESUDAH:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://absensi-backend-production.up.railway.app/api'; // ← GANTI INI!
```

**⚠️ Ganti dengan URL Railway Anda!**

### **B. Update CORS di Backend:**

Edit file `server.js`:

**Cari bagian ini:**
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    // tambah URL Netlify
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

**Tambahkan URL Netlify:**
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app',  // ← GANTI dengan URL Netlify Anda!
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### **C. Push Update ke GitHub:**
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### **D. Railway Auto Redeploy:**
- Railway otomatis detect push
- Auto rebuild & redeploy (~2 menit)
- Backend URL tetap sama

### **E. Redeploy Netlify:**

**Cara 1: Auto Deploy (jika connect GitHub)**
- Netlify otomatis detect push
- Auto redeploy

**Cara 2: Manual Deploy**
1. Netlify dashboard → Site
2. Tab **"Deploys"**
3. Klik **"Trigger deploy"** → **"Deploy site"**

---

## 🧪 **STEP 3: TEST LOGIN DI NETLIFY**

### **1. Buka URL Netlify:**
```
https://your-site.netlify.app
```

### **2. Login:**
```
Email   : armyteguh00@gmail.com
Password: Admin123!
```

### **3. Klik "Masuk"**
- Loading animation
- Redirect ke dashboard
- ✅ **LOGIN BERHASIL!**

### **4. Test Fitur:**
- ✅ Dashboard statistics
- ✅ RFID registration
- ✅ Face upload
- ✅ Attendance
- ✅ All working!

---

## 📋 **CHECKLIST DEPLOYMENT:**

### **Backend (Railway):**
- [ ] Project created
- [ ] GitHub repo connected
- [ ] Environment variables set
- [ ] Domain generated
- [ ] `/api/health` returns OK
- [ ] Backend URL copied

### **Frontend (Netlify):**
- [ ] `config.js` updated with Railway URL
- [ ] `server.js` CORS includes Netlify URL
- [ ] Pushed to GitHub
- [ ] Netlify redeployed
- [ ] Site accessible

### **Testing:**
- [ ] Open Netlify URL
- [ ] Login with armyteguh00@gmail.com
- [ ] Dashboard loads
- [ ] Can navigate all pages
- [ ] RFID registration works
- [ ] Face upload works

---

## 🎯 **HASIL AKHIR:**

```
Frontend (Netlify):
https://your-site.netlify.app ✅

Backend (Railway):
https://xxxxx.up.railway.app ✅

Database (Supabase):
https://tbjshustaqijmbtxssod.supabase.co ✅
```

**Bisa diakses dari:**
- ✅ Laptop/PC mana saja
- ✅ HP Android/iOS
- ✅ Tablet
- ✅ Dimana saja (ada internet)

---

## 🐛 **TROUBLESHOOTING:**

### **❌ Login Gagal di Netlify - "Network Error"**

**Penyebab:** Backend Railway belum deploy atau URL salah

**Solusi:**
1. Test backend: `https://railway-url.up.railway.app/api/health`
2. Check `config.js` → API_BASE_URL benar
3. Check browser console (F12) untuk error

### **❌ CORS Error**

```
Access to fetch blocked by CORS policy
```

**Solusi:**
1. Edit `server.js`
2. Tambah URL Netlify ke `corsOptions.origin`
3. Push ke GitHub
4. Tunggu Railway redeploy

### **❌ Railway Sleep/Inactive**

**Penyebab:** Free tier sleep setelah tidak ada request

**Solusi:**
- Buka backend URL sekali
- Atau upgrade ke Hobby plan ($5/month)

### **❌ Environment Variables Missing**

**Solusi:**
1. Railway dashboard → Variables
2. Check semua var dari `.env` sudah ada
3. Klik "Redeploy" jika tambah var baru

---

## 💰 **BIAYA HOSTING:**

```
Netlify:   GRATIS (100GB bandwidth/month)
Railway:   GRATIS ($5 credit/month)
Supabase:  GRATIS (500MB database)
──────────────────────────────────────
TOTAL:     $0 / bulan ✅
```

Cukup untuk:
- Traffic moderate
- Demo/skripsi
- Produksi skala kecil

---

## 🔄 **UPDATE APLIKASI:**

### **Update Frontend:**
```bash
# Edit files di folder public/
git add .
git commit -m "Update UI"
git push origin main
# Netlify auto deploy
```

### **Update Backend:**
```bash
# Edit files (controllers, routes, dll)
git add .
git commit -m "Update API"
git push origin main
# Railway auto deploy
```

### **No Downtime:**
- Railway/Netlify support zero-downtime deploy
- User tidak terputus saat update

---

## 📱 **SHARE KE TEMAN/DOSEN:**

Kirim URL ini:
```
https://your-site.netlify.app

Login:
Email   : armyteguh00@gmail.com
Password: Admin123!
```

Atau buat user baru untuk mereka:
1. Login sebagai admin
2. Kelola Pegawai → Tambah Pegawai
3. Set role = "user"
4. Share credentials

---

## 🎉 **KESIMPULAN:**

### ✅ **Untuk Login di Netlify (Tanpa localhost):**

**HARUS:**
1. ✅ Deploy backend ke Railway/Render
2. ✅ Update API URL di `config.js`
3. ✅ Update CORS di `server.js`
4. ✅ Redeploy Netlify

**TIDAK BISA:**
- ❌ Login di Netlify tanpa backend online
- ❌ Frontend saja tidak cukup
- ❌ Harus ada backend API

### 💡 **Kenapa Perlu Backend Deploy?**

Frontend (HTML/CSS/JS) hanya tampilan, butuh:
- API untuk login (verify email/password)
- API untuk data pegawai
- API untuk absensi
- API untuk RFID/Face
- Database connection

Semua itu di backend (Node.js + Express).

---

## 🚀 **MULAI SEKARANG:**

### **Quick Start (20 menit):**

```bash
1. Push to GitHub (5 menit)
2. Deploy Railway (7 menit)
3. Update config.js (3 menit)
4. Update CORS (2 menit)
5. Push & redeploy (3 menit)
6. Test login Netlify ✅
```

---

**📞 Butuh bantuan deploy?**  
**Follow panduan di atas step-by-step!** 🎯

---

*Last updated: 2024*
