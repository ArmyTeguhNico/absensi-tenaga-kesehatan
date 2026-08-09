# 🚀 Setup Supabase untuk Sistem Absensi

Panduan lengkap menggunakan Supabase (PostgreSQL cloud database) sebagai pengganti MySQL lokal.

## 🎯 Keuntungan Menggunakan Supabase

- ✅ **Tidak perlu install MySQL** di komputer lokal
- ✅ **Cloud-based** - bisa diakses dari mana saja
- ✅ **Free tier generous** - 500MB database, 2GB bandwidth
- ✅ **Backup otomatis** - data aman
- ✅ **PostgreSQL** - database modern dan powerful
- ✅ **Easy deployment** - cocok untuk production
- ✅ **Dashboard lengkap** - manage data dengan mudah

---

## 📋 Langkah Setup

### 1️⃣ Buat Akun Supabase (5 menit)

1. **Kunjungi** https://supabase.com
2. **Klik "Start your project"**
3. **Sign up** dengan:
   - GitHub account (recommended), atau
   - Email + password
4. **Verifikasi email** (cek inbox Anda)

### 2️⃣ Buat Project Baru (2 menit)

1. Setelah login, klik **"New project"**
2. Isi form:
   - **Name**: `absensi-tenaga-kesehatan` (atau nama lain)
   - **Database Password**: Buat password yang kuat (SIMPAN INI!)
   - **Region**: Pilih yang terdekat (Singapore/Tokyo untuk Indonesia)
   - **Pricing Plan**: Pilih **"Free"**
3. Klik **"Create new project"**
4. **Tunggu 2-3 menit** sampai project selesai dibuat

### 3️⃣ Jalankan SQL Schema (3 menit)

1. Di dashboard Supabase, **klik icon SQL** (⚡) di sidebar kiri
   atau buka: `https://app.supabase.com/project/YOUR_PROJECT/sql/new`

2. **Copy seluruh isi file** `database/supabase-schema.sql`

3. **Paste** ke SQL Editor di Supabase

4. **Klik "Run"** atau tekan `Ctrl + Enter`

5. Tunggu hingga muncul pesan **"Success. No rows returned"**

✅ Database tables sudah dibuat!

### 4️⃣ Dapatkan API Keys (2 menit)

1. Di dashboard, klik **"Settings"** (⚙️) di sidebar
2. Klik **"API"** di menu settings
3. **Copy** informasi berikut:

#### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

#### API Keys
Ada 2 keys yang perlu dicopy:

**anon (public) key** - untuk frontend:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

**service_role key** - untuk backend (⚠️ JANGAN SHARE!):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

### 5️⃣ Konfigurasi .env (1 menit)

1. Buka file `.env` di root project
2. Update dengan informasi Supabase Anda:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=absensi-tenaga-kesehatan-secret-key-2024
JWT_EXPIRE=7d

# Admin Default
ADMIN_EMAIL=admin@kesehatan.com
ADMIN_PASSWORD=Admin123!
```

⚠️ **PENTING:**
- Ganti `xxxxxxxxxxxxx` dengan project ID Anda
- Copy paste keys dengan lengkap (sangat panjang)
- Jangan share `SUPABASE_SERVICE_KEY` ke siapapun!

### 6️⃣ Install Dependencies (1 menit)

```bash
npm install
```

Ini akan install `@supabase/supabase-js` dan dependencies lainnya.

### 7️⃣ Inisialisasi Database (30 detik)

```bash
npm run init-db
```

**Output yang diharapkan:**
```
🚀 Starting Supabase database initialization...

👤 Creating admin user...
✅ Database initialized successfully!

══════════════════════════════════════════════════
📊 Supabase Database Ready
══════════════════════════════════════════════════
👤 Admin Credentials:
   Email   : admin@kesehatan.com
   Password: Admin123!
══════════════════════════════════════════════════

⚠️  IMPORTANT: Change the admin password after first login!
```

### 8️⃣ Jalankan Server (30 detik)

```bash
npm run dev
```

**Output yang diharapkan:**
```
══════════════════════════════════════════════════
🏥 SISTEM ABSENSI TENAGA KESEHATAN
══════════════════════════════════════════════════
🚀 Server running on port 3000
📡 API URL: http://localhost:3000/api
🌐 Web URL: http://localhost:3000
🔧 Environment: development
══════════════════════════════════════════════════
✓ Supabase connected successfully
```

### 9️⃣ Test Login (1 menit)

1. Buka browser: `http://localhost:3000`
2. Login dengan:
   - Email: `admin@kesehatan.com`
   - Password: `Admin123!`
3. Jika berhasil masuk → **SETUP SELESAI!** 🎉

---

## 📊 Verifikasi Database di Supabase Dashboard

### Cek Tables
1. Buka Supabase Dashboard
2. Klik **"Table Editor"** di sidebar
3. Anda akan lihat 6 tables:
   - ✅ departments (6 data)
   - ✅ positions (7 data)
   - ✅ users (1 admin)
   - ✅ attendance (kosong)
   - ✅ leaves (kosong)
   - ✅ settings (4 data)

### Cek Admin User
1. Klik table **"users"**
2. Anda akan lihat 1 row:
   - NIP: ADMIN001
   - Name: Administrator
   - Email: admin@kesehatan.com
   - Role: admin
   - Status: active

---

## 🔧 Troubleshooting

### ❌ Error: "SUPABASE_URL must be set"
**Solusi:**
- Pastikan file `.env` ada di root project
- Periksa isi `.env` sudah benar
- Restart terminal dan jalankan ulang

### ❌ Error: "relation does not exist"
**Solusi:**
- SQL schema belum dijalankan
- Buka Supabase SQL Editor
- Run ulang file `database/supabase-schema.sql`

### ❌ Error: "Invalid API key"
**Solusi:**
- Pastikan `SUPABASE_SERVICE_KEY` dicopy dengan lengkap
- Key sangat panjang, pastikan tidak terpotong
- Jangan gunakan `SUPABASE_ANON_KEY` untuk backend

### ❌ npm install gagal
**Solusi:**
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

### ❌ Admin user sudah ada
**Solusi:**
Jika ingin reset admin:
1. Buka Supabase Dashboard → Table Editor
2. Klik table "users"
3. Hapus row admin
4. Jalankan `npm run init-db` lagi

---

## 🔐 Keamanan Best Practices

### ⚠️ JANGAN LAKUKAN INI:
- ❌ Share `SUPABASE_SERVICE_KEY` ke siapapun
- ❌ Commit file `.env` ke Git/GitHub
- ❌ Screenshot `.env` yang berisi keys
- ❌ Hardcode keys di source code

### ✅ LAKUKAN INI:
- ✅ Gunakan `.env` untuk keys (sudah di `.gitignore`)
- ✅ Ganti JWT_SECRET untuk production
- ✅ Ganti password admin setelah login
- ✅ Backup database secara berkala
- ✅ Update Supabase project password

---

## 📱 Akses dari Perangkat Lain

Dengan Supabase, aplikasi bisa diakses dari perangkat lain di jaringan yang sama:

1. **Cari IP komputer server:**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Akses dari HP/laptop lain:**
   ```
   http://192.168.x.x:3000
   ```
   (Ganti dengan IP komputer Anda)

3. **Database sudah cloud** - tidak perlu setting tambahan!

---

## 🚀 Deploy ke Production

Supabase sangat mudah untuk production:

### Option 1: Deploy ke Vercel/Netlify
- Upload code ke GitHub
- Connect ke Vercel/Netlify
- Set environment variables
- Deploy!

### Option 2: Deploy ke VPS
- Upload code ke server
- Set `.env` di server
- Run `npm start`
- Setup PM2 untuk auto-restart

### Keuntungan Supabase untuk Production:
- ✅ Database sudah cloud, tidak perlu manage server DB
- ✅ Backup otomatis
- ✅ SSL sudah include
- ✅ Monitoring built-in
- ✅ Scale dengan mudah

---

## 📊 Monitoring Database

### Realtime Updates (Optional)
Supabase support realtime subscriptions. Untuk fitur future:
```javascript
// Subscribe to attendance changes
const subscription = supabase
  .from('attendance')
  .on('INSERT', payload => {
    console.log('New attendance:', payload.new)
  })
  .subscribe()
```

### Database Statistics
1. Buka Supabase Dashboard
2. Klik **"Database"** → **"Usage"**
3. Lihat:
   - Database size
   - Number of requests
   - Bandwidth usage

---

## 💡 Tips & Tricks

### 1. Backup Database
**Manual Backup:**
1. Supabase Dashboard → Settings → Database
2. Klik "Download backup"
3. Save file SQL

**Automatic Backup:**
- Free tier: Daily backups (kept for 7 days)
- Paid tier: More frequent backups

### 2. View Data dengan Mudah
- Gunakan Table Editor di dashboard
- Filter, sort, dan search data
- Edit data langsung (hati-hati!)

### 3. SQL Editor
- Bisa run query SQL langsung
- Save favorite queries
- View query history

### 4. Monitor Logs
- Supabase → Logs
- Lihat API requests
- Debug errors

---

## 🎓 Belajar Lebih Lanjut

**Dokumentasi:**
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

**Video Tutorials:**
- Supabase YouTube Channel
- PostgreSQL tutorials

---

## ✅ Checklist Setup

Pastikan semua langkah sudah selesai:

- [ ] Akun Supabase sudah dibuat
- [ ] Project Supabase sudah dibuat
- [ ] SQL schema sudah dijalankan
- [ ] Tables sudah muncul di dashboard
- [ ] API keys sudah dicopy
- [ ] File `.env` sudah dikonfigurasi
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] Database sudah diinisialisasi (`npm run init-db`)
- [ ] Server bisa dijalankan (`npm run dev`)
- [ ] Bisa akses web di `http://localhost:3000`
- [ ] Bisa login dengan akun admin
- [ ] Password admin sudah diganti

---

## 🎉 Selamat!

Setup Supabase Anda sudah selesai! Aplikasi sekarang menggunakan cloud database yang:

- ✅ Tidak perlu install MySQL lokal
- ✅ Bisa diakses dari mana saja
- ✅ Backup otomatis
- ✅ Siap untuk production
- ✅ Free tier yang generous

**Enjoy using your cloud-powered attendance system!** 🚀

---

## 📞 Need Help?

Jika mengalami masalah:
1. Baca troubleshooting section di atas
2. Cek Supabase logs di dashboard
3. Review `.env` configuration
4. Test connection dengan `npm run init-db`

Happy coding! 💻
