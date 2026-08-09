# 🔧 FIX ERROR SUPABASE SQL

## ❌ **Error yang Anda Alami:**

```
Failed to run SQL query: ERROR: 42601: syntax error at or near "face_data"
LINE 3: ALTER TABLE users ADD COLUMN rfid_uid VARCHAR(100) UNIQUE, face_user TEXT, ...
```

**Penyebab:** Syntax SQL salah. Tidak bisa pakai koma (`,`) untuk multiple columns dalam satu `ALTER TABLE`.

---

## ✅ **SOLUSI - Copy SQL yang Benar!**

### **CARA 1: Copy File SQL (Paling Mudah)**

1. Buka file: `SUPABASE_SQL_FIX.sql` (sudah saya buatkan!)
2. Copy **SEMUA** isi file
3. Buka **Supabase Dashboard** → **SQL Editor**
4. Paste di editor
5. Klik **"Run"** atau tekan `Ctrl+Enter`
6. Tunggu "Success. No rows returned"

✅ **DONE!**

---

### **CARA 2: Copy Query di Sini**

Copy query ini ke Supabase SQL Editor:

```sql
-- 1. UPDATE TABEL USERS (RFID & FACE COLUMNS)

-- Tambah kolom RFID
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rfid_uid VARCHAR(100) UNIQUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rfid_registered_at TIMESTAMP;

-- Tambah kolom FACE
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS face_data TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS face_registered_at TIMESTAMP;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS face_photos TEXT[];

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS face_embeddings TEXT;


-- 2. UPDATE TABEL ATTENDANCE (VERIFICATION COLUMNS)

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS rfid_uid_in VARCHAR(100);

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS rfid_uid_out VARCHAR(100);

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS face_verified_in BOOLEAN DEFAULT false;

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS face_verified_out BOOLEAN DEFAULT false;

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS verification_method_in VARCHAR(50);

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS verification_method_out VARCHAR(50);


-- 3. CREATE INDEX (OPTIONAL - UNTUK PERFORMA)

CREATE INDEX IF NOT EXISTS idx_users_rfid_uid 
ON users(rfid_uid);

CREATE INDEX IF NOT EXISTS idx_attendance_rfid_in 
ON attendance(rfid_uid_in);
```

**Klik RUN!** ▶️

---

## 📊 **Verifikasi Schema Berhasil**

### **Cek Kolom di Tabel Users:**

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('rfid_uid', 'face_data', 'face_photos', 'face_embeddings')
ORDER BY ordinal_position;
```

**Harus muncul 4 rows:**
```
rfid_uid           | character varying | 100
face_data          | text              | NULL
face_photos        | ARRAY             | NULL
face_embeddings    | text              | NULL
```

### **Cek Kolom di Tabel Attendance:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'attendance'
AND (column_name LIKE '%rfid%' OR column_name LIKE '%face%' OR column_name LIKE '%verification%')
ORDER BY ordinal_position;
```

**Harus muncul 6 rows:**
```
rfid_uid_in               | character varying
rfid_uid_out              | character varying
face_verified_in          | boolean
face_verified_out         | boolean
verification_method_in    | character varying
verification_method_out   | character varying
```

✅ **Kalau muncul semua → SUCCESS!**

---

## 🧪 **Test Insert RFID**

Setelah schema berhasil, test dengan query ini:

```sql
-- Update user admin dengan RFID test
UPDATE users 
SET rfid_uid = 'TEST123456', 
    rfid_registered_at = NOW()
WHERE email = 'admin@kesehatan.com';

-- Verify
SELECT id, name, email, rfid_uid, rfid_registered_at
FROM users
WHERE email = 'admin@kesehatan.com';
```

**Harus muncul:**
```
id  | name  | email                   | rfid_uid    | rfid_registered_at
----+-------+-------------------------+-------------+--------------------
1   | Admin | admin@kesehatan.com     | TEST123456  | 2024-01-15 10:30:00
```

✅ **RFID Registration Working!**

---

## 🔍 **Penjelasan Error**

### ❌ **Syntax SALAH (yang Anda coba):**
```sql
ALTER TABLE users ADD COLUMN 
  rfid_uid VARCHAR(100) UNIQUE,
  face_data TEXT,
  face_photos TEXT[];
```

**Error karena:** PostgreSQL tidak support multiple columns dengan koma dalam satu statement `ALTER TABLE ... ADD COLUMN`.

### ✅ **Syntax BENAR:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS rfid_uid VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_data TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_photos TEXT[];
```

**Setiap kolom = 1 statement terpisah!**

---

## 📋 **Checklist Fix Error**

- [ ] Buka Supabase Dashboard
- [ ] Klik **SQL Editor** (icon ⚡)
- [ ] Copy query dari `SUPABASE_SQL_FIX.sql`
- [ ] Paste & klik **"Run"**
- [ ] Verifikasi dengan query SELECT
- [ ] Test insert RFID
- [ ] Jalankan `npm run dev` lagi
- [ ] Test web interface: `/rfid-face-register.html`

---

## 🚀 **Setelah Fix**

Aplikasi Anda sekarang support:

1. ✅ **RFID Registration** via web
2. ✅ **Face Photo Upload** (multiple photos)
3. ✅ **RFID Verification** saat absensi
4. ✅ **Face Verification** saat absensi
5. ✅ **Dual Verification** (RFID + Face untuk keamanan max)

---

## 🎯 **Next Steps**

1. ✅ Fix Supabase schema (pakai file SQL ini)
2. ✅ Test web interface local (`npm run dev`)
3. ✅ Test RFID registration
4. ✅ Deploy ke Netlify + Railway (ikuti CHECKLIST_DEPLOY.md)

---

## 📞 **Masih Error?**

### Error: "column already exists"
**Solusi:** Abaikan saja, artinya kolom sudah ada. Query pakai `IF NOT EXISTS` jadi aman.

### Error: "relation does not exist"
**Solusi:** Tabel belum dibuat. Jalankan dulu `database/supabase-schema.sql` untuk create tables.

### Error: "permission denied"
**Solusi:** 
1. Pastikan pakai **Service Role Key** di `.env` (bukan Anon Key)
2. Atau run query manual di Supabase SQL Editor (sudah punya permission penuh)

---

**🎉 Query SQL sudah diperbaiki dan siap dijalankan!**

**File:** `SUPABASE_SQL_FIX.sql`

