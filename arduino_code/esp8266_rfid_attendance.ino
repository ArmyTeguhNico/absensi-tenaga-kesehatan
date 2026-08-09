/*
 * SISTEM ABSENSI RFID + FACE RECOGNITION
 * Hardware: NodeMCU ESP8266 + RFID RC522 + LCD 16x2 I2C + LED + Buzzer
 * 
 * WIRING:
 * RC522:     3.3V=VCC, GND=GND, D2=SDA, D5=SCK, D6=MISO, D7=MOSI, D1=RST
 * LCD I2C:   5V=VCC, GND=GND, D1=SDA, D2=SCL
 * LED GREEN: D3 → 220Ω → LED → GND
 * LED RED:   D4 → 220Ω → LED → GND
 * BUZZER:    D8 → BUZZER(+) → GND
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ============================================
// KONFIGURASI - EDIT DI SINI!
// ============================================

// WiFi
const char* ssid = "YOUR_WIFI_SSID";          // Ganti dengan nama WiFi Anda
const char* password = "YOUR_WIFI_PASSWORD";  // Ganti dengan password WiFi

// API URL
const char* apiUrl = "http://192.168.1.100:3000/api"; // Ganti dengan IP laptop Anda
// Cek IP laptop: buka CMD → ketik "ipconfig" → cari "IPv4 Address"
// Contoh: http://192.168.1.100:3000/api
// Kalau sudah deploy: https://your-backend.up.railway.app/api

// ============================================
// PIN CONFIGURATION
// ============================================

// RFID RC522
#define SS_PIN D2    // SDA
#define RST_PIN D1   // RST

// LED & Buzzer
#define LED_GREEN D3
#define LED_RED D4
#define BUZZER D8

// ============================================
// INITIALIZE
// ============================================

MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C: 0x27 atau 0x3F (coba keduanya)

void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println("SISTEM ABSENSI RFID + FACE");
  Serial.println("=================================\n");
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Sistem Absensi");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  delay(2000);
  
  // Initialize RFID
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("✓ RFID RC522 initialized");
  
  // Initialize LED & Buzzer
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER, LOW);
  Serial.println("✓ LED & Buzzer initialized");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  lcd.clear();
  lcd.print("Connecting WiFi");
  lcd.setCursor(0, 1);
  lcd.print(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED && attempt < 30) {
    delay(500);
    Serial.print(".");
    attempt++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("✓ IP Address: ");
    Serial.println(WiFi.localIP());
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    
    // Beep 2x sukses
    tone(BUZZER, 1000, 100);
    delay(200);
    tone(BUZZER, 1000, 100);
    delay(2000);
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    lcd.clear();
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Check Config");
    
    // Beep panjang error
    tone(BUZZER, 500, 1000);
    
    while(true) {
      digitalWrite(LED_RED, HIGH);
      delay(500);
      digitalWrite(LED_RED, LOW);
      delay(500);
    }
  }
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Tap Kartu RFID");
  lcd.setCursor(0, 1);
  lcd.print("di Reader...");
  
  Serial.println("\n=================================");
  Serial.println("✓ System Ready!");
  Serial.println("Tap RFID Card to check-in...");
  Serial.println("=================================\n");
}

void loop() {
  // Cek apakah ada kartu RFID baru
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Baca kartu
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }
  
  // Ambil UID kartu dalam format HEX
  String rfidUid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (i > 0) rfidUid += ":";
    if (mfrc522.uid.uidByte[i] < 0x10) rfidUid += "0";
    rfidUid += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfidUid.toUpperCase();
  
  Serial.println("\n--- RFID CARD DETECTED ---");
  Serial.print("UID: ");
  Serial.println(rfidUid);
  
  lcd.clear();
  lcd.print("Reading Card...");
  lcd.setCursor(0, 1);
  lcd.print(rfidUid);
  
  // Blink LED saat baca kartu
  digitalWrite(LED_GREEN, HIGH);
  delay(300);
  digitalWrite(LED_GREEN, LOW);
  
  // Kirim ke API untuk verifikasi
  verifyAndRecord(rfidUid);
  
  // Reset LCD
  delay(3000);
  lcd.clear();
  lcd.print("Tap Kartu RFID");
  lcd.setCursor(0, 1);
  lcd.print("di Reader...");
  
  // Halt kartu
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  delay(2000); // Delay sebelum baca kartu berikutnya
}

void verifyAndRecord(String rfidUid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi Disconnected!");
    showError("WiFi Error!");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  // STEP 1: Verify RFID
  Serial.println("\n→ Verifying RFID with API...");
  String verifyUrl = String(apiUrl) + "/rfid-face/rfid/verify";
  
  http.begin(client, verifyUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 second timeout
  
  String payload = "{\"rfidUid\":\"" + rfidUid + "\"}";
  Serial.println("Sending: " + payload);
  
  int httpCode = http.POST(payload);
  
  Serial.print("HTTP Code: ");
  Serial.println(httpCode);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Response: " + response);
    
    // Parse JSON response
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      bool success = doc["success"];
      
      if (success) {
        // Kartu valid!
        String name = doc["data"]["name"].as<String>();
        int userId = doc["data"]["id"];
        String nip = doc["data"]["nip"].as<String>();
        
        Serial.println("✓ RFID Verified!");
        Serial.println("User: " + name);
        Serial.println("NIP: " + nip);
        
        // Tampilkan di LCD
        lcd.clear();
        lcd.print("Selamat Datang");
        lcd.setCursor(0, 1);
        lcd.print(name.substring(0, 16)); // Max 16 char
        
        // LED hijau + beep sukses
        digitalWrite(LED_GREEN, HIGH);
        tone(BUZZER, 1000, 200);
        delay(300);
        tone(BUZZER, 1200, 200);
        
        // STEP 2: Record Attendance
        recordAttendance(userId, rfidUid, name);
        
        delay(2000);
        digitalWrite(LED_GREEN, LOW);
        
      } else {
        // Kartu tidak terdaftar
        String message = doc["message"].as<String>();
        Serial.println("✗ " + message);
        
        showError("Kartu Tidak", "Terdaftar!");
      }
    } else {
      Serial.println("✗ JSON Parse Error!");
      showError("Response Error");
    }
    
  } else if (httpCode == 404) {
    Serial.println("✗ RFID Card not registered!");
    showError("Kartu Tidak", "Terdaftar!");
    
  } else {
    Serial.println("✗ HTTP Error: " + String(httpCode));
    showError("Server Error", "Code: " + String(httpCode));
  }
  
  http.end();
}

void recordAttendance(int userId, String rfidUid, String userName) {
  WiFiClient client;
  HTTPClient http;
  
  Serial.println("\n→ Recording attendance...");
  String attendanceUrl = String(apiUrl) + "/attendance/check-in";
  
  http.begin(client, attendanceUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Get current time (sesuaikan timezone jika perlu)
  String payload = "{\"userId\":" + String(userId) + 
                   ",\"verification_method\":\"rfid\"" +
                   ",\"rfid_uid\":\"" + rfidUid + "\"}";
  
  Serial.println("Sending: " + payload);
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.println("✓ Attendance recorded!");
    Serial.println("Response: " + response);
    
    lcd.clear();
    lcd.print("Absen Berhasil!");
    lcd.setCursor(0, 1);
    lcd.print("Selamat Bekerja");
    
    // Beep 3x sukses
    for (int i = 0; i < 3; i++) {
      tone(BUZZER, 1500, 100);
      delay(150);
    }
    
  } else {
    Serial.println("✗ Attendance failed!");
    Serial.println("HTTP Code: " + String(httpCode));
    
    lcd.clear();
    lcd.print("Absen Gagal!");
    lcd.setCursor(0, 1);
    lcd.print("Coba Lagi");
    
    tone(BUZZER, 500, 500);
  }
  
  http.end();
  delay(2000);
}

void showError(String line1, String line2 = "") {
  lcd.clear();
  lcd.print(line1);
  if (line2 != "") {
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
  
  // LED merah + beep error
  digitalWrite(LED_RED, HIGH);
  tone(BUZZER, 400, 500);
  delay(2000);
  digitalWrite(LED_RED, LOW);
}
