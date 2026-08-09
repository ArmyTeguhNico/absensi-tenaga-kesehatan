# 🏥 Sistem Absensi Tenaga Kesehatan
## RFID Card + Face Recognition + Web Dashboard

Aplikasi web lengkap untuk mengelola absensi tenaga kesehatan dengan teknologi RFID Card dan Face Recognition.

---

## ✨ Fitur Utama

### 👤 Fitur Pegawai
- ✅ Login dengan email dan password
- ⏰ Absen masuk/pulang dengan RFID atau Face Recognition
- 📊 Dashboard statistik kehadiran bulanan
- 📜 Riwayat absensi lengkap
- 📝 Pengajuan izin, sakit, dan cuti
- 👨‍💼 Manajemen profil

### 🔐 Fitur Administrator
- 📈 Dashboard statistik real-time
- 👥 Kelola data pegawai (CRUD)
- 🎴 Registrasi RFID Card pegawai
- 📷 Registrasi Face Recognition pegawai
- 📋 Monitoring absensi semua pegawai
- ✔️ Persetujuan/penolakan pengajuan izin
- 📊 Laporan kehadiran bulanan

### 🆕 Fitur RFID & Face Recognition
- 🎴 **RFID Card Registration** - Daftarkan UID kartu RFID pegawai
- 📷 **Face Photo Upload** - Upload multiple foto untuk training
- 🔍 **RFID Verification** - Verifikasi kartu saat absensi
- 👤 **Face Verification** - Verifikasi wajah saat absensi
- 📊 **Dual Verification** - RFID + Face untuk keamanan maksimal

---

## 🛠️ Teknologi

**Backend:**
- Node.js + Express.js
- Supabase (PostgreSQL Cloud)
- JWT Authentication
- bcryptjs (Password hashing)

**Frontend:**
- HTML5 + CSS3 (Modern gradient design)
- Vanilla JavaScript
- Face-API.js ready
- Responsive & Mobile-friendly

**Database:**
- Supabase (PostgreSQL)
- Cloud-based, auto backup
- Real-time capable

---

## 📋 Prasyarat

- **Node.js** v14+ - [Download](https://nodejs.org/)
- **Akun Supabase** (GRATIS) - [Sign up](https://supabase.com)

> 💡 **Tidak perlu install MySQL/PostgreSQL lokal!**

---

## 🚀 Instalasi & Setup

### 1. Clone/Download Project
```bash
cd D:\WEB_ABSENSI_TENAGA_KESEHATAN
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase (10 menit)

#### A. Buat Akun & Project
1. Buka https://supabase.com
2. Sign up (bisa pakai GitHub)
3. Klik "New project"
4. Isi:
   - **Name**: absensi-kesehatan
   - **Database Password**: (buat password kuat, simpan!)
   - **Region**: Singapore
   - **Plan**: Free
5. Klik "Create new project"
6. Tunggu 2-3 menit

#### B. Run SQL Schema
1. Di dashboard Supabase, klik **SQL Editor** (⚡)
2. Klik "New query"
3. Copy isi file `database/supabase-schema.sql`
4. Paste & klik **"Run"**
5. Tunggu "Success"

#### C. Update Database untuk RFID & Face
```sql
-- Add RFID & Face columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rfid_uid VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS rfid_registered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS face_data TEXT,
ADD COLUMN IF NOT EXISTS face_registered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS face_photos TEXT[],
ADD COLUMN IF NOT EXISTS face_embeddings TEXT;

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS rfid_uid_in VARCHAR(100),
ADD COLUMN IF NOT EXISTS rfid_uid_out VARCHAR(100),
ADD COLUMN IF NOT EXISTS face_verified_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS face_verified_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_method_in VARCHAR(50),
ADD COLUMN IF NOT EXISTS verification_method_out VARCHAR(50);
```

#### D. Get API Keys
1. Settings (⚙️) → API
2. Copy 3 info:
   - **Project URL**
   - **anon public key**
   - **service_role key** (secret!)

### 4. Konfigurasi .env

Edit file `.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Admin Default
ADMIN_EMAIL=armyteguh00@gmail.com
ADMIN_PASSWORD=Admin123!
```

### 5. Initialize Database
```bash
npm run init-db
```

Output:
```
✅ Database initialized successfully!
👤 Admin: armyteguh00@gmail.com / Admin123!
```

### 6. Start Server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### 7. Buka Browser
```
http://localhost:3000
```

**Login:**
- Email: `armyteguh00@gmail.com`
- Password: `Admin123!`

---

## 📱 Halaman Aplikasi

### User Dashboard
```
http://localhost:3000
```
- Login pegawai
- Dashboard statistik
- Absensi masuk/pulang
- Riwayat absensi
- Pengajuan izin/cuti

### Admin Dashboard
```
http://localhost:3000/admin.html
```
- Dashboard monitoring
- Kelola pegawai
- Lihat semua absensi
- Approve/reject izin
- Laporan bulanan

### RFID & Face Registration
```
http://localhost:3000/rfid-face-register.html
```
- Daftarkan RFID Card
- Upload foto wajah (3-5 foto)
- Test RFID verification
- Camera capture untuk face
- Status registration

---

## 🎴 Cara Daftar RFID & Face

### Registrasi RFID Card:
1. Login sebagai admin
2. Buka `/rfid-face-register.html`
3. Pilih pegawai
4. Masukkan UID RFID (contoh: `A3B2C104`)
5. Klik "Daftarkan RFID"
6. Status berubah hijau ✅

### Registrasi Face:
1. Klik "Aktifkan Kamera"
2. Posisikan wajah di dalam guide
3. Klik "Ambil Foto" 3-5 kali (dari sudut berbeda)
4. Klik "Simpan Data Wajah"
5. Status berubah hijau dengan jumlah foto ✅

---

## 🛠️ Hardware yang Dibutuhkan

### Minimal Setup (~Rp 1 Juta):
- 🎴 RFID USB Reader (Rp 200k)
- 🏷️ 50x RFID Cards (Rp 150k)
- 📷 Webcam Logitech C270 (Rp 350k)
- 💻 PC/Laptop (sudah punya)

### Recommended Setup (~Rp 3-4 Juta):
- 🎴 2x RFID USB Reader (Rp 400k)
- 🏷️ 100x RFID Cards (Rp 300k)
- 📷 Logitech C920 Webcam (Rp 1000k)
- 🖥️ Raspberry Pi 4 Kit (Rp 1500k)
- 📺 7" Touchscreen (Rp 800k)

**Beli di:** Tokopedia, Shopee, Bukalapak
**Keyword:** "RC522 RFID", "ESP32", "Raspberry Pi", "Logitech Webcam"

---

## 📊 Database Schema

### Tables (7):
1. **users** - Data pegawai + RFID + Face
2. **attendance** - Absensi + verification method
3. **leaves** - Pengajuan izin/cuti
4. **departments** - Departemen (6 default)
5. **positions** - Jabatan (7 default)
6. **settings** - Pengaturan sistem

### Default Data:
- ✅ 6 Departemen (Poli Umum, UGD, Farmasi, dll)
- ✅ 7 Jabatan (Dokter, Perawat, Bidan, dll)
- ✅ 1 Admin user
- ✅ 4 System settings

---

## 🔐 Security

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT authentication
- ✅ Role-based access (Admin/User)
- ✅ Input validation
- ✅ SQL injection prevention (Supabase RLS ready)
- ✅ HTTPS ready

---

## 📁 Struktur Project

```
WEB_ABSENSI_TENAGA_KESEHATAN/
├── controllers/           # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── attendanceController.js
│   ├── leaveController.js
│   ├── departmentController.js
│   └── rfidFaceController.js  ✨ NEW
├── database/
│   ├── config.js         # Supabase connection
│   ├── init-db.js        # DB initialization
│   └── supabase-schema.sql
├── middleware/
│   ├── auth.js           # JWT verification
│   └── validator.js      # Input validation
├── public/               # Frontend
│   ├── css/style.css
│   ├── js/
│   ├── index.html        # User dashboard
│   ├── admin.html        # Admin dashboard
│   └── rfid-face-register.html  ✨ NEW
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── attendanceRoutes.js
│   ├── leaveRoutes.js
│   ├── departmentRoutes.js
│   └── rfidFaceRoutes.js  ✨ NEW
├── .env                  # Configuration
├── .env.example
├── .gitignore
├── package.json
├── server.js             # Entry point
├── README.md             # This file
└── SUPABASE_SETUP.md     # Detailed setup guide
```

---

## 🐛 Troubleshooting

### Error: Port 3000 already in use
```powershell
# Kill process
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Atau ganti port di .env
PORT=3001
```

### Error: Cannot connect to Supabase
- Periksa `SUPABASE_URL` dan keys di `.env`
- Pastikan keys di-copy lengkap (sangat panjang!)
- Cek koneksi internet

### Error: RFID/Face columns not found
- Run SQL ALTER TABLE di Supabase SQL Editor
- Lihat section "Setup Supabase" → "Update Database"

### Login gagal
- Pastikan `npm run init-db` sudah dijalankan
- Cek di Supabase Table Editor apakah ada user admin
- Password default: `Admin123!`

---

## 🚀 Deployment

### Deploy ke Cloud:

**Backend:**
- Vercel/Netlify (Serverless)
- Heroku
- DigitalOcean VPS
- Railway.app

**Database:**
- Supabase (sudah cloud!) ✅
- Auto backup
- No extra setup needed

**Steps:**
1. Push ke GitHub
2. Connect ke Vercel/Netlify
3. Set environment variables
4. Deploy!

---

## 📚 Dokumentasi Lengkap

- **README.md** - File ini (overview & quick start)
- **SUPABASE_SETUP.md** - Setup Supabase step-by-step detail

---

## 🎯 Roadmap

### Current (v1.0):
- ✅ Web-based attendance
- ✅ RFID registration interface
- ✅ Face photo upload
- ✅ Admin dashboard
- ✅ Leave management

### Coming Soon:
- [ ] Hardware integration (ESP32/Arduino)
- [ ] Real-time face recognition
- [ ] Export reports (PDF/Excel)
- [ ] Email notifications
- [ ] Mobile app
- [ ] Geolocation verification
- [ ] Multiple branch support

---

## 📞 Support

**Jika mengalami masalah:**
1. Baca dokumentasi di `SUPABASE_SETUP.md`
2. Cek Supabase logs di dashboard
3. Review `.env` configuration
4. Test connection dengan `npm run init-db`

---

## 📄 License

Project ini dibuat untuk keperluan internal/skripsi/tugas akhir.

---

## 🙏 Credits

Dibuat dengan ❤️ untuk kemudahan manajemen absensi tenaga kesehatan.

**Tech Stack:**
- Node.js + Express.js
- Supabase (PostgreSQL)
- HTML/CSS/JavaScript
- JWT Authentication

---

**⭐ Sistem siap digunakan untuk Klinik, Puskesmas, Rumah Sakit, dan fasilitas kesehatan lainnya!**

Last updated: 2024

