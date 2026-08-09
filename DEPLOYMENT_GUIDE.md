# 🚀 Panduan Deployment ke Netlify + Railway/Heroku

## 📋 Arsitektur Deployment

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│   NETLIFY       │ ───> │  RAILWAY/HEROKU  │ ───> │  SUPABASE   │
│  (Frontend)     │      │   (Backend API)  │      │ (Database)  │
│  HTML/CSS/JS    │      │    Node.js       │      │ PostgreSQL  │
└─────────────────┘      └──────────────────┘      └─────────────┘
```

**Kenapa Split?**
- Netlify = Static hosting (HTML/CSS/JS) - GRATIS
- Railway/Heroku = Node.js backend - GRATIS (dengan limit)
- Supabase = Database - GRATIS (sudah setup!)

---

## 🎯 STEP 1: Deploy Backend (Railway - Paling Mudah!)

### A. Buat Akun Railway
1. Buka https://railway.app
2. Klik **"Login"** → Sign up dengan GitHub
3. Authorize Railway

### B. Deploy Backend
1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Connect GitHub account Anda
4. Pilih repository project ini
5. Railway otomatis detect Node.js

### C. Set Environment Variables
1. Di dashboard Railway, klik tab **"Variables"**
2. Tambahkan satu per satu:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-secret-key-production-2024
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000
ADMIN_EMAIL=admin@kesehatan.com
ADMIN_PASSWORD=Admin123!
```

3. Klik **"Add Variable"** untuk setiap item

### D. Deploy!
1. Klik **"Deploy"**
2. Tunggu 2-3 menit
3. Railway akan beri URL: `https://your-app-name.up.railway.app`
4. **COPY URL INI!** (Penting untuk step selanjutnya)

### E. Test Backend
```bash
# Test di browser atau Postman
https://your-app-name.up.railway.app/api/health

# Response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🎨 STEP 2: Deploy Frontend (Netlify)

### A. Update API URL

**Edit file: `public/js/config.js`**

Ganti:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://your-app-name.up.railway.app/api'; // ← GANTI INI!
```

Dengan URL Railway Anda:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://absensi-backend-production.up.railway.app/api';
```

### B. Deploy ke Netlify

#### **Cara 1: Drag & Drop (Paling Mudah!)**

1. Buka https://app.netlify.com
2. Login dengan GitHub/Email
3. Klik **"Add new site"** → **"Deploy manually"**
4. **Drag folder `public/` ke browser**
5. Tunggu upload selesai
6. Netlify beri URL: `https://random-name-123456.netlify.app`

#### **Cara 2: Dari GitHub (Otomatis Update)**

1. Push project ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/absensi-kesehatan.git
git push -u origin main
```

2. Di Netlify:
   - Klik **"Add new site"** → **"Import from Git"**
   - Pilih **GitHub**
   - Pilih repository Anda
   - **Build settings:**
     - Base directory: `/`
     - Build command: `echo 'No build needed'`
     - Publish directory: `public`
   - Klik **"Deploy site"**

3. Netlify akan otomatis deploy setiap kali Anda push ke GitHub!

### C. Custom Domain (Opsional)

1. Di Netlify Dashboard → **"Domain settings"**
2. Klik **"Add custom domain"**
3. Masukkan domain Anda (misal: `absensi.yourdomain.com`)
4. Ikuti instruksi DNS setup
5. Netlify otomatis kasih HTTPS gratis!

---

## 🔐 STEP 3: Update CORS di Backend

**Edit file: `server.js`**

Tambahkan domain Netlify Anda ke CORS:

```javascript
// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app',  // ← Tambah URL Netlify Anda
    'https://absensi.yourdomain.com'  // ← Domain custom (jika ada)
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**Commit & push ke GitHub** (Railway otomatis redeploy!)

---

## ✅ STEP 4: Test Aplikasi Live!

### Test Login:
1. Buka `https://your-site.netlify.app`
2. Login:
   - Email: `admin@kesehatan.com`
   - Password: `Admin123!`
3. Jika berhasil, dashboard muncul! 🎉

### Test API:
```
https://your-site.netlify.app/admin.html
```

### Test RFID & Face:
```
https://your-site.netlify.app/rfid-face-register.html
```

---

## 🐛 Troubleshooting

### ❌ Error: "Failed to fetch" atau "Network Error"

**Penyebab:** Backend belum running atau CORS salah

**Solusi:**
1. Cek backend Railway masih running
2. Test API langsung: `https://your-backend.up.railway.app/api/health`
3. Cek CORS di `server.js` sudah include URL Netlify

### ❌ Error: "Cannot GET /api/..."

**Penyebab:** URL API salah di frontend

**Solusi:**
1. Buka `public/js/config.js`
2. Pastikan `API_BASE_URL` sesuai URL Railway
3. Jangan lupa `/api` di akhir!

### ❌ Login berhasil tapi data tidak muncul

**Penyebab:** Database Supabase belum diinit

**Solusi:**
1. SSH ke Railway (tab "Settings" → "SSH")
2. Jalankan: `npm run init-db`
3. Atau buat user admin manual di Supabase Table Editor

### ❌ Railway/Heroku mati karena inactivity

**Railway:** Free tier sleep setelah 5 menit tidak ada request
- Solusi: Upgrade ke Hobby plan ($5/bulan)
- Atau gunakan cron service untuk ping tiap 5 menit

**Heroku:** Free tier dihapus November 2022
- Gunakan Railway atau Render.com sebagai gantinya

---

## 💰 Biaya Hosting

### ✅ GRATIS SELAMANYA:
- **Netlify:** 100GB bandwidth/bulan, unlimited sites
- **Railway:** $5 credit gratis/bulan (cukup untuk 1 backend)
- **Supabase:** 500MB database, 2GB file storage
- **Total:** $0 (dalam batas free tier!)

### 💵 Jika Traffic Tinggi:
- **Netlify Pro:** $19/bulan (1TB bandwidth)
- **Railway Hobby:** $5/bulan (no sleep, lebih stabil)
- **Supabase Pro:** $25/bulan (8GB database)

---

## 🔄 Update Aplikasi

### Update Frontend (Netlify):
```bash
# Edit file di folder public/
git add .
git commit -m "Update UI"
git push origin main
# Netlify otomatis deploy!
```

### Update Backend (Railway):
```bash
# Edit file backend (controllers, routes, dll)
git add .
git commit -m "Update API"
git push origin main
# Railway otomatis deploy!
```

### Update Database (Supabase):
1. Login ke Supabase Dashboard
2. SQL Editor → jalankan query ALTER TABLE
3. Tidak perlu redeploy aplikasi!

---

## 📊 Monitoring

### Railway Dashboard:
- CPU, Memory, Network usage
- Logs real-time
- Restart otomatis jika crash

### Netlify Dashboard:
- Deploy history
- Traffic analytics
- Form submissions (jika pakai Netlify Forms)

### Supabase Dashboard:
- Database usage
- API requests
- Storage usage
- Real-time logs

---

## 🚀 Alternatif Platform

### Backend Alternatives:
1. **Render.com** - Free tier, auto-sleep
2. **Fly.io** - Free 3 VMs
3. **Cyclic.sh** - Unlimited apps
4. **Heroku** - Perlu credit card (tidak gratis lagi)

### Frontend Alternatives:
1. **Vercel** - Sama seperti Netlify
2. **GitHub Pages** - Gratis tapi tidak bisa redirect API
3. **Cloudflare Pages** - Fast CDN

---

## 📱 Bonus: PWA (Progressive Web App)

Tambahkan di `public/manifest.json`:
```json
{
  "name": "Absensi Kesehatan",
  "short_name": "Absensi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

User bisa install seperti app mobile!

---

## ✅ Checklist Deployment

### Pre-Deployment:
- [ ] Supabase sudah setup
- [ ] Database schema sudah dijalankan
- [ ] `.env` sudah terisi lengkap
- [ ] Test local berhasil (`npm run dev`)

### Backend (Railway):
- [ ] Project created di Railway
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Deploy success
- [ ] Test `/api/health` endpoint
- [ ] Copy backend URL

### Frontend (Netlify):
- [ ] Update `public/js/config.js` dengan Railway URL
- [ ] Update CORS di `server.js`
- [ ] Deploy folder `public/` ke Netlify
- [ ] Test login page
- [ ] Test admin dashboard
- [ ] Test RFID registration

### Final Testing:
- [ ] Login berhasil
- [ ] Dashboard load data
- [ ] Bisa tambah pegawai
- [ ] Bisa absensi
- [ ] Bisa daftar RFID/Face

---

## 🎓 Tips Pro

1. **Gunakan Environment Variables** - Jangan hardcode API URL
2. **Enable HTTPS** - Netlify otomatis, Railway perlu setting
3. **Setup Custom Domain** - Lebih profesional
4. **Monitor Logs** - Railway/Netlify punya log viewer
5. **Backup Database** - Supabase otomatis, tapi export juga manual
6. **Use Git Tags** - Untuk track versi deployment
7. **Health Check Endpoint** - Buat `/api/health` untuk monitoring

---

**🎉 Selamat! Aplikasi sudah live di internet!**

**URL Anda:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://your-backend.up.railway.app`
- Database: Supabase (always on)

**Share ke teman/dosen:** ✅
**Test dari HP:** ✅
**Siap untuk produksi:** ✅

---

Last updated: 2024
