# 🎴📷 CARA PAKAI RFID CARD + VERIFIKASI WAJAH

## ✅ **YA! Web Ini SUDAH Support RFID + Face Recognition!**

---

## 🎯 **Fitur yang Tersedia:**

### **1. RFID Card (Kartu RFID)** ✅
- ✅ Registrasi RFID via web
- ✅ Verifikasi RFID saat absensi
- ✅ Tracking RFID UID
- ✅ API untuk hardware integration

### **2. Face Recognition (Verifikasi Wajah)** ✅
- ✅ Upload foto wajah (3-5 foto)
- ✅ Camera capture real-time
- ✅ Multiple photos training
- ✅ Face embeddings storage
- ✅ API untuk verification

### **3. Dual Verification** ✅
- ✅ RFID saja
- ✅ Face saja
- ✅ RFID + Face (keamanan maksimal!)

---

## 📋 **STEP 1: REGISTRASI (Setup Awal)**

### **A. Registrasi RFID Card**

#### **Cara 1: Via Web Interface** (Sudah Ada!)
1. Buka browser:
   ```
   http://localhost:3000/rfid-face-register.html
   ```

2. Login sebagai admin (kalau diminta)

3. **Daftar RFID:**
   - Pilih pegawai dari dropdown
   - Masukkan **UID RFID Card**
     - Contoh: `A3B2C104` atau `04:52:B3:DA:12:90`
   - Klik **"Daftarkan RFID"**
   - Status berubah hijau ✅

4. **Test RFID:**
   - Klik tombol **"Test RFID"**
   - Masukkan UID yang sama
   - Kalau valid, muncul info pegawai ✅

#### **Cara 2: Via API** (Untuk Hardware)
```javascript
POST /api/rfid-face/rfid/register
Authorization: Bearer <admin_token>

Body: {
  "userId": 1,
  "rfidUid": "A3B2C104"
}

Response: {
  "success": true,
  "message": "RFID Card berhasil didaftarkan",
  "data": {
    "rfid_uid": "A3B2C104",
    "registered_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### **B. Registrasi Face (Wajah)**

#### **Cara 1: Upload Foto via Web** (Sudah Ada!)
1. Buka:
   ```
   http://localhost:3000/rfid-face-register.html
   ```

2. **Aktivasi Camera:**
   - Klik tombol **"Aktifkan Kamera"**
   - Browser minta permission → Klik **"Allow"**
   - Camera preview muncul

3. **Ambil Foto:**
   - Posisikan wajah di dalam **oval guide**
   - Klik **"Ambil Foto"** → foto tersimpan
   - Ulangi 3-5 kali dari sudut berbeda:
     - Depan
     - Kiri 30°
     - Kanan 30°
     - Sedikit ke atas
     - Sedikit ke bawah

4. **Simpan Data:**
   - Klik **"Simpan Data Wajah"**
   - Status berubah hijau ✅
   - Jumlah foto muncul (contoh: "3 foto")

#### **Cara 2: Via API** (Untuk Hardware)
```javascript
POST /api/rfid-face/face/upload/:userId
Authorization: Bearer <token>

Body: {
  "faceData": "base64_encoded_image",
  "photoUrl": "url_or_base64"
}

Response: {
  "success": true,
  "message": "Foto wajah berhasil ditambahkan (3 foto)",
  "data": {
    "total_photos": 3,
    "face_registered": true
  }
}
```

---

## ⚡ **STEP 2: ABSENSI (Cara Pakai Harian)**

### **Metode 1: RFID Card Only** 🎴

#### **Hardware yang Dibutuhkan:**
- RFID Reader (USB atau ESP32)
- RFID Cards (Mifare/EM4100)

#### **Cara Kerja:**
```
1. Pegawai TAP kartu RFID → Reader
2. Reader kirim UID ke API → /api/rfid-face/rfid/verify
3. System cek database → Cocok dengan siapa?
4. Kalau cocok → Absensi tercatat ✅
5. Display: "Selamat datang, Dr. Ahmad"
```

#### **API Flow:**
```javascript
// 1. RFID Reader baca kartu
UID = "A3B2C104"

// 2. Kirim ke API
POST /api/rfid-face/rfid/verify
Body: { "rfidUid": "A3B2C104" }

// 3. Response
{
  "success": true,
  "message": "RFID Card terverifikasi",
  "data": {
    "id": 1,
    "name": "Dr. Ahmad",
    "nip": "198801012010011001",
    "email": "ahmad@kesehatan.com",
    "photo": "ahmad.jpg"
  }
}

// 4. Catat absensi
POST /api/attendance/check-in
Body: {
  "userId": 1,
  "verification_method": "rfid",
  "rfid_uid": "A3B2C104"
}
```

---

### **Metode 2: Face Recognition Only** 📷

#### **Hardware yang Dibutuhkan:**
- Webcam atau IP Camera
- PC/Raspberry Pi dengan Face-API.js

#### **Cara Kerja:**
```
1. Pegawai berdiri depan kamera
2. System capture foto real-time
3. Face-API.js detect wajah → create embedding
4. Compare dengan database embeddings
5. Kalau similarity > 80% → Match ✅
6. Absensi tercatat
7. Display: "Selamat datang, Dr. Ahmad"
```

#### **API Flow:**
```javascript
// 1. Camera capture foto
const faceImage = captureFromCamera();

// 2. Face-API.js detect & create descriptor
const descriptor = await faceapi
  .detectSingleFace(faceImage)
  .withFaceLandmarks()
  .withFaceDescriptor();

// 3. Kirim ke backend untuk compare
POST /api/rfid-face/face/verify
Body: {
  "faceDescriptor": descriptor.descriptor,
  "faceImage": base64Image
}

// 4. Backend compare dengan semua user
// Cari yang paling match (Euclidean distance < 0.6)

// 5. Response
{
  "success": true,
  "message": "Face recognized",
  "data": {
    "id": 1,
    "name": "Dr. Ahmad",
    "similarity": 0.92
  }
}

// 6. Catat absensi
POST /api/attendance/check-in
Body: {
  "userId": 1,
  "verification_method": "face",
  "face_verified": true,
  "face_confidence": 92.0
}
```

---

### **Metode 3: Dual Verification (RFID + Face)** 🎴📷

#### **Keamanan Maksimal!**

**Cara Kerja:**
```
1. Pegawai TAP kartu RFID
   → System identifikasi user (siapa?)
   
2. System minta verifikasi wajah
   → "Silakan lihat kamera"
   
3. Camera capture foto
   → Face-API.js verify wajah
   
4. Cek: Wajah cocok dengan pemilik kartu?
   → RFID: Dr. Ahmad
   → Face: Dr. Ahmad ✅
   
5. Kedua-duanya match → Absensi tercatat ✅
```

**Keuntungan:**
- ✅ Mencegah pemakaian kartu orang lain
- ✅ Keamanan ganda
- ✅ Audit trail lengkap

---

## 📊 **Database Schema (Sudah Ada!)**

### **Tabel: users**
```sql
rfid_uid VARCHAR(100) UNIQUE       -- UID kartu RFID
rfid_registered_at TIMESTAMP       -- Kapan didaftar
face_data TEXT                     -- Base64 foto wajah
face_registered_at TIMESTAMP       -- Kapan didaftar
face_photos TEXT[]                 -- Array multiple photos
face_embeddings TEXT               -- JSON face descriptors
```

### **Tabel: attendance**
```sql
rfid_uid_in VARCHAR(100)           -- RFID masuk
rfid_uid_out VARCHAR(100)          -- RFID pulang
face_verified_in BOOLEAN           -- Wajah terverifikasi masuk
face_verified_out BOOLEAN          -- Wajah terverifikasi pulang
face_confidence_in DECIMAL(5,2)    -- Confidence score (0-100)
verification_method_in VARCHAR(50) -- 'rfid', 'face', 'rfid+face'
verification_method_out VARCHAR(50)
```

---

## 🛠️ **Hardware Integration**

### **Setup 1: RFID Reader (Minimal)**

#### **Hardware:**
- RFID-RC522 USB Reader (~Rp 200k)
- 50x RFID Cards (~Rp 150k)
- PC Windows/Linux

#### **Koneksi:**
```
RFID Reader (USB) → PC → Web Browser → API
```

#### **Software:**
```javascript
// Node.js script untuk baca RFID
const SerialPort = require('serialport');

const port = new SerialPort('COM3', { baudRate: 9600 });

port.on('data', async (data) => {
  const rfidUid = data.toString().trim();
  
  // Kirim ke API
  const response = await fetch('http://localhost:3000/api/rfid-face/rfid/verify', {
    method: 'POST',
    body: JSON.stringify({ rfidUid }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await response.json();
  console.log(result.message);
});
```

---

### **Setup 2: Face Recognition Camera**

#### **Hardware:**
- Logitech C920 Webcam (~Rp 1jt)
- PC dengan RAM 4GB+

#### **Software:**
```html
<!-- Include Face-API.js -->
<script src="https://cdn.jsdelivr.net/npm/face-api.js"></script>

<script>
// Load models
await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// Capture from camera
const video = document.getElementById('camera');
const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
video.srcObject = stream;

// Detect face
setInterval(async () => {
  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (detection) {
    // Send to API for verification
    verifyFace(detection.descriptor);
  }
}, 1000);
</script>
```

---

### **Setup 3: Dual (RFID + Face) - Recommended!**

#### **Hardware:**
- ESP32 Dev Board (~Rp 100k)
- RFID-RC522 Module (~Rp 50k)
- ESP32-CAM Module (~Rp 80k)
- 7" Touchscreen Display (~Rp 800k)

#### **Arsitektur:**
```
RFID Card → RC522 → ESP32 → WiFi → API
                             ↑
Camera → ESP32-CAM ─────────┘
```

#### **Flow:**
```
1. User tap RFID → ESP32 kirim UID ke API
2. API response: "Silakan lihat kamera"
3. ESP32-CAM capture foto → kirim ke API
4. API verify face → return result
5. Display: "Selamat datang, Dr. Ahmad" ✅
```

---

## 🧪 **TEST SEKARANG!**

### **Test 1: Registrasi RFID** ✅
```
http://localhost:3000/rfid-face-register.html
```
- Pilih pegawai: Admin
- RFID UID: `TEST123456`
- Klik "Daftarkan"
- Status hijau ✅

### **Test 2: Verifikasi RFID** ✅
```
http://localhost:3000/rfid-face-register.html
```
- Klik "Test RFID"
- UID: `TEST123456`
- Muncul info: "Admin" ✅

### **Test 3: Upload Foto Wajah** ✅
```
http://localhost:3000/rfid-face-register.html
```
- Klik "Aktifkan Kamera" (allow permission)
- Ambil 3-5 foto
- Klik "Simpan Data Wajah"
- Status hijau + jumlah foto ✅

### **Test 4: Cek Database** ✅
Buka Supabase → Table Editor → users:
```sql
SELECT 
  name, 
  rfid_uid, 
  array_length(face_photos, 1) as photo_count,
  face_registered_at
FROM users
WHERE rfid_uid IS NOT NULL;
```

---

## 📱 **Mobile App Support (Opsional)**

Bisa bikin mobile app dengan:
- React Native
- Flutter
- Cordova/PhoneX

**Fitur:**
- Scan RFID via NFC (HP support NFC)
- Capture foto via camera HP
- Real-time face recognition
- Push notification

---

## 🎯 **Summary:**

### ✅ **Yang Sudah Ada:**
1. ✅ Database schema (RFID + Face columns)
2. ✅ Backend API (register + verify)
3. ✅ Frontend web interface
4. ✅ Camera capture
5. ✅ Multiple photos storage
6. ✅ API endpoints lengkap

### 🔧 **Yang Perlu Hardware:**
1. 🛒 RFID Reader (beli ~Rp 200k)
2. 🛒 RFID Cards (beli ~Rp 150k)
3. 🛒 Webcam HD (beli ~Rp 350k-1jt)
4. 🔌 Koneksi USB ke PC
5. 💻 Software driver

### 📖 **Next Steps:**
1. ✅ Test web interface (sudah bisa!)
2. 🛒 Beli hardware RFID + camera
3. 🔌 Connect hardware
4. 💻 Integrate dengan API
5. 🧪 Test absensi real

---

## 📞 **Support:**

**File penting:**
- `rfidFaceController.js` - Backend logic
- `rfidFaceRoutes.js` - API endpoints
- `rfid-face-register.html` - Web interface
- `database/supabase-schema.sql` - Database

**API Base URL:**
```
http://localhost:3000/api/rfid-face
```

**Web Interface:**
```
http://localhost:3000/rfid-face-register.html
```

---

# 🎉 **YA! WEB INI SUDAH SUPPORT RFID + FACE RECOGNITION!**

**Tinggal:**
1. ✅ Test interface (sudah bisa sekarang!)
2. 🛒 Beli hardware (optional)
3. 🔌 Integrate (kalau ada hardware)

**Sistem sudah 100% ready untuk RFID Card + Verifikasi Wajah!** 🎴📷

