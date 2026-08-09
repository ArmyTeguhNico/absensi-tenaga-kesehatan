# 🔌 ARDUINO CODE - NodeMCU ESP8266 + RFID RC522

## 📁 File Code Arduino:
```
esp8266_rfid_attendance.ino   ← Upload file ini ke NodeMCU
```

---

## 🛠️ HARDWARE YANG DIBUTUHKAN:

| No | Komponen | Qty | Harga |
|----|----------|-----|-------|
| 1 | NodeMCU ESP8266 | 1 | Rp 50.000 |
| 2 | RFID RC522 Module | 1 | Rp 30.000 |
| 3 | RFID Cards (MIFARE 13.56MHz) | 50 | Rp 150.000 |
| 4 | LCD 16x2 I2C | 1 | Rp 40.000 |
| 5 | LED Green | 1 | Rp 1.000 |
| 6 | LED Red | 1 | Rp 1.000 |
| 7 | Buzzer Active 5V | 1 | Rp 5.000 |
| 8 | Resistor 220Ω | 2 | Rp 1.000 |
| 9 | Breadboard | 1 | Rp 20.000 |
| 10 | Jumper Wires | 20 | Rp 15.000 |
| 11 | USB Cable Micro | 1 | Rp 10.000 |
| 12 | Adaptor 5V 2A | 1 | Rp 30.000 |
| **TOTAL** | | | **Rp 353.000** |

**Beli di:** Tokopedia, Shopee, Bukalapak  
**Keyword:** "NodeMCU ESP8266", "RFID RC522", "LCD I2C 16x2"

---

## 🔌 WIRING DIAGRAM:

```
┌──────────────────────────────────────────────────────────────┐
│                    NodeMCU ESP8266                            │
│                                                                │
│  3.3V ─────┬─────────────────────────> RC522 VCC            │
│            │                                                   │
│  GND ──────┼────┬────┬────┬──────────> RC522 GND            │
│            │    │    │    │                                   │
│  D2 ───────┼────┼────┼────┼──────────> RC522 SDA            │
│  D5 ───────┼────┼────┼────┼──────────> RC522 SCK            │
│  D6 ───────┼────┼────┼────┼──────────> RC522 MISO           │
│  D7 ───────┼────┼────┼────┼──────────> RC522 MOSI           │
│  D1 ───────┼────┼────┼────┼──────────> RC522 RST            │
│            │    │    │    │            (D1 juga untuk LCD SDA)│
│            │    │    │    │                                   │
│  5V ───────┴────┼────┼────┼──────────> LCD VCC              │
│  GND ───────────┴────┼────┼──────────> LCD GND              │
│  D1 (GPIO5) ─────────┼────┼──────────> LCD SDA              │
│  D2 (GPIO4) ─────────┼────┼──────────> LCD SCL              │
│                      │    │                                   │
│  D3 ───[220Ω]──── LED GREEN (+) ───┴─> GND                  │
│  D4 ───[220Ω]──── LED RED (+) ──────┴> GND                  │
│                                                                │
│  D8 ────────────── BUZZER (+) ─────────> GND (-)             │
│                                                                │
│  USB ──────> Power Supply (5V dari Laptop atau Adaptor)      │
└──────────────────────────────────────────────────────────────┘
```

### **Detail Pin Connection:**

**RFID RC522 → NodeMCU:**
```
RC522 VCC  → NodeMCU 3.3V
RC522 GND  → NodeMCU GND
RC522 SDA  → NodeMCU D2 (GPIO4)
RC522 SCK  → NodeMCU D5 (GPIO14)
RC522 MISO → NodeMCU D6 (GPIO12)
RC522 MOSI → NodeMCU D7 (GPIO13)
RC522 RST  → NodeMCU D1 (GPIO5)
```

**LCD 16x2 I2C → NodeMCU:**
```
LCD VCC → NodeMCU 5V (atau 3.3V)
LCD GND → NodeMCU GND
LCD SDA → NodeMCU D1 (GPIO5)
LCD SCL → NodeMCU D2 (GPIO4)
```

**LED & Buzzer → NodeMCU:**
```
LED GREEN: D3 → Resistor 220Ω → LED (+) → GND
LED RED:   D4 → Resistor 220Ω → LED (+) → GND
BUZZER:    D8 → Buzzer (+) → GND (-)
```

---

## 💻 INSTALL ARDUINO IDE:

### **1. Download Arduino IDE:**
https://www.arduino.cc/en/software

**Pilih:** Windows Win 10 and newer (MSI installer)

### **2. Install ESP8266 Board:**
1. Buka Arduino IDE
2. File → Preferences
3. Di "Additional Boards Manager URLs" tambahkan:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. OK
5. Tools → Board → Boards Manager
6. Cari "esp8266"
7. Install "esp8266 by ESP8266 Community"
8. Tunggu selesai

### **3. Install Libraries:**

Buka: Tools → Manage Libraries

Install library ini (cari dan klik Install):

1. **MFRC522** by GithubCommunity
2. **LiquidCrystal I2C** by Frank de Brabander
3. **ArduinoJson** by Benoit Blanchon (versi 6.x)
4. **ESP8266WiFi** (sudah include di ESP8266 board)
5. **ESP8266HTTPClient** (sudah include)

---

## 🔧 KONFIGURASI CODE:

### **STEP 1: Buka File Arduino**
```
arduino_code/esp8266_rfid_attendance.ino
```

### **STEP 2: Edit Konfigurasi (Baris 20-30)**

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";          // ← GANTI INI!
const char* password = "YOUR_WIFI_PASSWORD";  // ← GANTI INI!

// API URL
const char* apiUrl = "http://192.168.1.100:3000/api"; // ← GANTI INI!
```

**Cara Cek IP Laptop:**
```
Windows: CMD → ipconfig → IPv4 Address
Mac/Linux: Terminal → ifconfig → inet
```

Contoh IP: `192.168.1.100`  
Maka API URL: `http://192.168.1.100:3000/api`

### **STEP 3: Pilih Board & Port**

1. **Tools → Board:** "NodeMCU 1.0 (ESP-12E Module)"
2. **Tools → Upload Speed:** 115200
3. **Tools → CPU Frequency:** 80 MHz
4. **Tools → Flash Size:** 4MB (FS:2MB OTA:~1019KB)
5. **Tools → Port:** COM3 (atau port yang muncul setelah colok USB)

### **STEP 4: Upload Code**

1. Colok NodeMCU ke laptop via USB
2. Klik tombol **Upload** (→) di Arduino IDE
3. Tunggu proses compile & upload selesai
4. Jika berhasil: "Done uploading"

---

## 🧪 TESTING:

### **STEP 1: Serial Monitor**
1. Tools → Serial Monitor (atau Ctrl+Shift+M)
2. Set Baud Rate: **115200**
3. Lihat output:
   ```
   =================================
   SISTEM ABSENSI RFID + FACE
   =================================
   
   ✓ RFID RC522 initialized
   ✓ LED & Buzzer initialized
   Connecting to WiFi........
   ✓ WiFi Connected!
   ✓ IP Address: 192.168.1.105
   
   =================================
   ✓ System Ready!
   Tap RFID Card to check-in...
   =================================
   ```

### **STEP 2: Test LCD**
LCD harus tampil:
```
Tap Kartu RFID
di Reader...
```

### **STEP 3: Registrasi RFID**

**Di Web Browser:**
```
http://localhost:3000/rfid-face-register.html
```

1. Login sebagai admin
2. Pilih pegawai: **Admin**
3. Tap kartu RFID ke reader
4. Lihat UID di Serial Monitor (contoh: `A3:B2:C1:04`)
5. Masukkan UID ke form web (tanpa titik dua: `A3B2C104`)
6. Klik "Daftarkan RFID"
7. Status hijau ✅

### **STEP 4: Test Absensi**

1. Tap kartu RFID yang sudah terdaftar
2. **Serial Monitor** harus tampil:
   ```
   --- RFID CARD DETECTED ---
   UID: A3:B2:C1:04
   
   → Verifying RFID with API...
   HTTP Code: 200
   ✓ RFID Verified!
   User: Admin
   NIP: 198801012010011001
   
   → Recording attendance...
   ✓ Attendance recorded!
   ```

3. **LCD** harus tampil:
   ```
   Selamat Datang
   Admin
   ```
   (berganti)
   ```
   Absen Berhasil!
   Selamat Bekerja
   ```

4. **LED Hijau** nyala 2 detik
5. **Buzzer** beep 3x sukses

### **STEP 5: Verifikasi Database**

Buka Supabase → Table Editor → `attendance`:
```sql
SELECT * FROM attendance 
WHERE verification_method_in = 'rfid' 
ORDER BY created_at DESC 
LIMIT 1;
```

Harus ada record baru dengan:
- `rfid_uid_in`: A3:B2:C1:04
- `verification_method_in`: rfid
- `check_in`: (waktu sekarang)

✅ **SUCCESS!**

---

## 🐛 TROUBLESHOOTING:

### ❌ **Error: Board Not Found**
**Solusi:**
1. Install driver CH340: https://sparks.gogo.co.nz/ch340.html
2. Restart Arduino IDE
3. Coba port COM lain

### ❌ **Error: WiFi Connection Failed**
**Solusi:**
1. Cek SSID & password sudah benar
2. Pastikan WiFi 2.4GHz (bukan 5GHz)
3. Cek jarak ke router

### ❌ **Error: RFID Not Detected**
**Solusi:**
1. Cek wiring RC522 ke NodeMCU
2. Pastikan pakai 3.3V (bukan 5V!)
3. Jarak kartu max 3cm dari reader

### ❌ **Error: LCD Blank**
**Solusi:**
1. Cek alamat I2C (0x27 atau 0x3F)
2. Test dengan I2C Scanner
3. Putar potensio di belakang LCD (kontras)

### ❌ **Error: HTTP 404 / Cannot Connect to API**
**Solusi:**
1. Cek web server jalan: `npm run dev`
2. Cek IP laptop sudah benar
3. Pastikan laptop & NodeMCU dalam WiFi yang sama
4. Test API di browser: `http://192.168.1.100:3000/api/health`

### ❌ **Error: JSON Parse Error**
**Solusi:**
1. Update library ArduinoJson ke versi 6.x
2. Cek response API di Serial Monitor
3. Pastikan API return valid JSON

---

## 📊 INDICATOR STATUS:

### **LED Hijau:**
- Nyala saat baca kartu
- Nyala 2 detik saat verifikasi sukses

### **LED Merah:**
- Nyala saat error
- Blink saat WiFi gagal

### **Buzzer:**
- 2x beep: WiFi connected
- 1x beep (high): Kartu terbaca
- 3x beep (high): Absen sukses
- 1x beep panjang (low): Error

### **LCD Display:**
```
Normal:        Tap Kartu RFID / di Reader...
Reading:       Reading Card... / A3:B2:C1:04
Success:       Selamat Datang / [Nama Pegawai]
Success:       Absen Berhasil! / Selamat Bekerja
Error:         Kartu Tidak / Terdaftar!
Error:         Server Error / Code: 500
```

---

## 🎯 NEXT STEPS:

### **Kalau Sudah Jalan:**
1. ✅ Deploy web ke Railway + Netlify
2. ✅ Ganti API URL di code Arduino ke production URL
3. ✅ Upload code lagi
4. ✅ Test dengan hardware di lokasi sebenarnya

### **Upgrade (Optional):**
1. Tambah ESP32-CAM untuk face recognition
2. Tambah RTC Module untuk timestamp offline
3. Tambah SD Card untuk logging offline
4. Tambah case/box untuk hardware

---

## 📚 REFERENCE:

**Pin Mapping NodeMCU:**
```
D0  = GPIO16
D1  = GPIO5  (I2C SCL)
D2  = GPIO4  (I2C SDA)
D3  = GPIO0
D4  = GPIO2  (LED_BUILTIN)
D5  = GPIO14 (SPI SCK)
D6  = GPIO12 (SPI MISO)
D7  = GPIO13 (SPI MOSI)
D8  = GPIO15 (SPI CS)
```

**Library Documentation:**
- MFRC522: https://github.com/miguelbalboa/rfid
- LiquidCrystal_I2C: https://github.com/johnrickman/LiquidCrystal_I2C
- ArduinoJson: https://arduinojson.org/

---

## ✅ CHECKLIST:

- [ ] Hardware sudah dibeli
- [ ] Wiring sesuai diagram
- [ ] Arduino IDE installed
- [ ] ESP8266 board installed
- [ ] Libraries installed
- [ ] WiFi SSID & password diisi
- [ ] API URL sudah benar
- [ ] Code uploaded ke NodeMCU
- [ ] Serial Monitor shows "System Ready"
- [ ] LCD tampil "Tap Kartu RFID"
- [ ] RFID sudah didaftarkan via web
- [ ] Test tap kartu berhasil
- [ ] Absensi tercatat di database

---

# 🎉 **HARDWARE SIAP DIGUNAKAN!**

**File penting:**
- `esp8266_rfid_attendance.ino` - Arduino code
- `HARDWARE_COMPATIBILITY.md` - Dokumentasi lengkap

**Butuh bantuan?**
- Cek Serial Monitor untuk debug
- Baca section Troubleshooting
- Test API dengan Postman/browser

---

**🔌 Selamat mencoba! Hardware + Web = Sistem Absensi Lengkap!** 🎴

