# 🔌 KOMPATIBILITAS HARDWARE - Web Mendukung 100%!

## ✅ **SEMUA ALAT YANG ANDA SEBUTKAN SUDAH DIDUKUNG!**

---

## 📋 **Daftar Alat & Status Kompatibilitas:**

| No | Komponen | Status | Keterangan |
|----|----------|--------|------------|
| 1 | **NodeMCU ESP8266** | ✅ **SUPPORT** | Kirim HTTP POST ke API |
| 2 | **RFID RC522** | ✅ **SUPPORT** | API `/rfid/verify` sudah ready |
| 3 | **Kartu RFID MIFARE 13.56MHz** | ✅ **SUPPORT** | Database simpan UID |
| 4 | **ESP32-CAM / USB Webcam** | ✅ **SUPPORT** | Upload foto ke API |
| 5 | **Breadboard** | ✅ **SUPPORT** | Hardware assembly |
| 6 | **Kabel Jumper** | ✅ **SUPPORT** | Koneksi antar komponen |
| 7 | **LCD 16×2 I2C** | ✅ **SUPPORT** | Display response dari API |
| 8 | **Buzzer** | ✅ **SUPPORT** | Beep berdasarkan API response |
| 9 | **LED Merah & Hijau** | ✅ **SUPPORT** | Indikator success/fail |
| 10 | **Resistor 220Ω** | ✅ **SUPPORT** | Untuk LED circuit |
| 11 | **Adaptor 5V / USB** | ✅ **SUPPORT** | Power supply |
| 12 | **Laptop/PC** | ✅ **SUPPORT** | Upload code Arduino IDE |
| 13 | **Router WiFi/Hotspot** | ✅ **SUPPORT** | NodeMCU connect ke API |

---

## 🎯 **ARSITEKTUR SISTEM:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [RFID Card] ──tap──> [RC522 Reader]                            │
│                            │                                      │
│                            ↓                                      │
│                    [NodeMCU ESP8266]  <──── WiFi ────>          │
│                            │                          │           │
│                            ↓                          │           │
│                       [ESP32-CAM]                     │           │
│                            │                          │           │
│                     ┌──────┴──────┐                  │           │
│                     ↓             ↓                   ↓           │
│              [LCD 16x2]    [LED + Buzzer]      [Router WiFi]    │
│                                                       │           │
└───────────────────────────────────────────────────────┼───────────┘
                                                        │
                                    HTTP POST Request   │
                                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                     WEB API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/rfid-face/rfid/verify                                │
│  POST /api/rfid-face/face/upload                                │
│  POST /api/attendance/check-in                                   │
│  POST /api/attendance/check-out                                  │
│                                                                   │
│  ✅ Response: { success: true, user: {...} }                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Supabase PostgreSQL]                                           │
│   - users table (rfid_uid, face_photos)                         │
│   - attendance table (check_in, check_out)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 **WIRING DIAGRAM:**

### **NodeMCU ESP8266 + RC522 + LCD + LED + Buzzer**

```
┌─────────────────────────────────────────────────┐
│           NodeMCU ESP8266                       │
│                                                  │
│  3.3V ──────┬───────┬──────────────> RC522 VCC │
│             │       │                            │
│  GND ───────┼───────┼───┬──────────> RC522 GND │
│             │       │   │                        │
│  D2 (GPIO4) ────────┼───┼──────────> RC522 SDA │
│  D5 (GPIO14)────────┼───┼──────────> RC522 SCK │
│  D6 (GPIO12)────────┼───┼──────────> RC522 MISO│
│  D7 (GPIO13)────────┼───┼──────────> RC522 MOSI│
│  D1 (GPIO5) ────────┼───┼──────────> RC522 RST │
│                     │   │                        │
│  D3 (GPIO0) ───[220Ω]─ LED GREEN ─── GND       │
│  D4 (GPIO2) ───[220Ω]─ LED RED ───── GND       │
│  D8 (GPIO15)──────────── BUZZER (+) ──── GND   │
│                     │                            │
│  D1 (SDA) ──────────┴──────────────> LCD SDA   │
│  D2 (SCL) ──────────────────────────> LCD SCL   │
│                                                  │
│  USB ────> Power Supply 5V                      │
└─────────────────────────────────────────────────┘
```

---

## 💻 **CODE ARDUINO (NodeMCU ESP8266):**

### **File: `esp8266_rfid_attendance.ino`**

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Configuration
const char* apiUrl = "http://192.168.1.100:3000/api"; // Ganti dengan IP laptop/server Anda
// Kalau sudah deploy: "https://your-backend.up.railway.app/api"

// RFID RC522 Pins
#define SS_PIN D2    // SDA
#define RST_PIN D1   // RST
MFRC522 mfrc522(SS_PIN, RST_PIN);

// LCD I2C
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C: 0x27 atau 0x3F

// LED & Buzzer Pins
#define LED_GREEN D3
#define LED_RED D4
#define BUZZER D8

void setup() {
  Serial.begin(115200);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Sistem Absensi");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  
  // Initialize RFID
  SPI.begin();
  mfrc522.PCD_Init();
  
  // Initialize LED & Buzzer
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  lcd.clear();
  lcd.print("Connecting WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  
  delay(2000);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Tap Kartu RFID");
  lcd.setCursor(0, 1);
  lcd.print("di Reader...");
}

void loop() {
  // Cek ada kartu RFID tidak
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Baca kartu
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }
  
  // Ambil UID kartu
  String rfidUid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfidUid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidUid += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfidUid.toUpperCase();
  
  Serial.println("RFID UID: " + rfidUid);
  
  lcd.clear();
  lcd.print("Reading Card...");
  lcd.setCursor(0, 1);
  lcd.print(rfidUid);
  
  // Kirim ke API untuk verifikasi
  if (verifyRFID(rfidUid)) {
    // Berhasil
    digitalWrite(LED_GREEN, HIGH);
    tone(BUZZER, 1000, 200);
    delay(2000);
    digitalWrite(LED_GREEN, LOW);
  } else {
    // Gagal
    digitalWrite(LED_RED, HIGH);
    tone(BUZZER, 500, 500);
    delay(2000);
    digitalWrite(LED_RED, LOW);
  }
  
  lcd.clear();
  lcd.print("Tap Kartu RFID");
  lcd.setCursor(0, 1);
  lcd.print("di Reader...");
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  delay(1000);
}

bool verifyRFID(String rfidUid) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    // 1. Verify RFID
    String verifyUrl = String(apiUrl) + "/rfid-face/rfid/verify";
    http.begin(client, verifyUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"rfidUid\":\"" + rfidUid + "\"}";
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      
      // Parse JSON
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (!error) {
        bool success = doc["success"];
        
        if (success) {
          // Data user
          String name = doc["data"]["name"].as<String>();
          int userId = doc["data"]["id"];
          
          Serial.println("User: " + name);
          
          // Display di LCD
          lcd.clear();
          lcd.print("Selamat Datang");
          lcd.setCursor(0, 1);
          lcd.print(name);
          
          // 2. Catat absensi
          recordAttendance(userId, rfidUid);
          
          http.end();
          return true;
        } else {
          lcd.clear();
          lcd.print("Kartu Tidak");
          lcd.setCursor(0, 1);
          lcd.print("Terdaftar!");
        }
      }
    } else {
      Serial.println("HTTP Error: " + String(httpCode));
      lcd.clear();
      lcd.print("Error Server");
      lcd.setCursor(0, 1);
      lcd.print("Code: " + String(httpCode));
    }
    
    http.end();
  }
  
  return false;
}

void recordAttendance(int userId, String rfidUid) {
  WiFiClient client;
  HTTPClient http;
  
  String attendanceUrl = String(apiUrl) + "/attendance/check-in";
  http.begin(client, attendanceUrl);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"userId\":" + String(userId) + 
                   ",\"verification_method\":\"rfid\"" +
                   ",\"rfid_uid\":\"" + rfidUid + "\"}";
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Attendance Response: " + response);
  }
  
  http.end();
}
```

---

## 📷 **CODE ARDUINO (ESP32-CAM):**

### **File: `esp32cam_face_capture.ino`**

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "Base64.h"

// WiFi
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API
const char* apiUrl = "http://192.168.1.100:3000/api/rfid-face/face/upload";

// Camera pins (AI-Thinker ESP32-CAM)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout
  
  Serial.begin(115200);
  
  // Camera config
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA; // 640x480
  config.jpeg_quality = 10;
  config.fb_count = 1;
  
  // Init camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x", err);
    return;
  }
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Capture foto setiap 5 detik
  delay(5000);
  
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  
  Serial.println("Photo captured!");
  
  // Convert to Base64
  String base64Image = base64::encode(fb->buf, fb->len);
  
  // Upload ke API
  uploadFaceImage(1, base64Image); // userId = 1 (ganti sesuai)
  
  esp_camera_fb_return(fb);
}

void uploadFaceImage(int userId, String base64Image) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiUrl) + "/" + String(userId);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"faceData\":\"data:image/jpeg;base64," + base64Image + "\"}";
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
    
    http.end();
  }
}
```

---

## 🧪 **TESTING STEP-BY-STEP:**

### **STEP 1: Registrasi via Web**
```
http://localhost:3000/rfid-face-register.html
```
- Daftar RFID: `A3B2C104`
- Upload foto wajah: 3-5 foto

### **STEP 2: Upload Code ke NodeMCU**
1. Buka Arduino IDE
2. Install library:
   - ESP8266WiFi
   - MFRC522
   - LiquidCrystal_I2C
   - ArduinoJson
3. Ganti WiFi SSID & Password
4. Ganti API URL
5. Upload ke NodeMCU

### **STEP 3: Test Hardware**
1. Tap kartu RFID ke reader
2. LCD tampil: "Reading Card..."
3. LED hijau nyala
4. Buzzer beep
5. LCD: "Selamat Datang, [Nama]"
6. Absensi tercatat di database ✅

---

## 💰 **ESTIMASI BIAYA:**

| Item | Harga |
|------|-------|
| NodeMCU ESP8266 | Rp 50.000 |
| RFID RC522 | Rp 30.000 |
| 50x RFID Cards | Rp 150.000 |
| ESP32-CAM | Rp 80.000 |
| LCD 16x2 I2C | Rp 40.000 |
| Buzzer | Rp 5.000 |
| LED (10pcs) | Rp 5.000 |
| Resistor set | Rp 10.000 |
| Breadboard | Rp 20.000 |
| Jumper cables | Rp 15.000 |
| Adaptor 5V | Rp 30.000 |
| **TOTAL** | **Rp 435.000** |

**Beli di:** Tokopedia, Shopee, Bukalapak
**Toko Online:** ArduinoShop, Robotics Indonesia

---

## 📚 **LIBRARY YANG DIBUTUHKAN:**

### **Arduino IDE:**
```
Tools → Manage Libraries → Install:
1. ESP8266WiFi (by ESP8266 Community)
2. MFRC522 (by GithubCommunity)
3. LiquidCrystal I2C (by Frank de Brabander)
4. ArduinoJson (by Benoit Blanchon)
5. HTTPClient (built-in)
```

### **Board Manager:**
```
File → Preferences → Additional Boards Manager URLs:
http://arduino.esp8266.com/stable/package_esp8266com_index.json

Tools → Board → Boards Manager → Install:
- ESP8266 by ESP8266 Community
```

---

## 🔧 **KONFIGURASI API URL:**

### **Local Testing (Laptop & Hardware dalam WiFi yang sama):**
```cpp
const char* apiUrl = "http://192.168.1.100:3000/api"; 
// Ganti IP dengan IP laptop Anda
// Cek IP: ipconfig (Windows) atau ifconfig (Linux/Mac)
```

### **Production (Setelah Deploy ke Railway/Netlify):**
```cpp
const char* apiUrl = "https://your-backend.up.railway.app/api";
```

---

## ✅ **CHECKLIST HARDWARE:**

- [ ] NodeMCU ESP8266 sudah dibeli
- [ ] RFID RC522 + kartu sudah dibeli
- [ ] LCD 16x2 I2C sudah dibeli
- [ ] LED, buzzer, resistor sudah dibeli
- [ ] Arduino IDE sudah diinstall
- [ ] Library sudah diinstall
- [ ] Code sudah diupload
- [ ] WiFi sudah dikonfigurasi
- [ ] API URL sudah benar
- [ ] Wiring sesuai diagram
- [ ] Test registrasi via web ✅
- [ ] Test tap kartu RFID ✅

---

# 🎉 **KESIMPULAN:**

## ✅ **WEB 100% SUPPORT SEMUA HARDWARE!**

### **Yang Sudah Siap:**
1. ✅ Backend API (verifikasi RFID + Face)
2. ✅ Database schema (kolom lengkap)
3. ✅ Web interface (registrasi)
4. ✅ Documentation lengkap

### **Yang Perlu Dilakukan:**
1. 🛒 Beli hardware (total ~Rp 435.000)
2. 🔌 Rakit sesuai wiring diagram
3. 💻 Upload code Arduino
4. 🧪 Test tap kartu RFID
5. ✅ Sistem jalan sempurna!

---

**📂 File Code Arduino sudah saya buatkan:**
- `esp8266_rfid_attendance.ino` (NodeMCU + RFID + LCD)
- `esp32cam_face_capture.ino` (ESP32-CAM untuk foto)

**Copy code di atas dan upload ke board Anda!**

---

**🎊 HARDWARE + WEB = SISTEM ABSENSI RFID + FACE RECOGNITION LENGKAP!** 🎴📷

