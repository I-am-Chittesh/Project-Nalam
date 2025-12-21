#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =================================================================
// 1. WIFI & iPAD CONFIGURATION
// =================================================================
const char* ssid = "Nalam_Network";
const char* password = "12345678";

// 🚨 CHANGE THESE TO YOUR iPAD'S LOCAL IP AND FLASK SERVER IP
const char* iPadIP = "192.168.1.100";           // Your iPad's local IP address
const int iPadPort = 5000;                      // Flask backend server port
const char* backendEndpoint = "/api/rfid/process"; // Backend endpoint to process RFID

// =================================================================
// 2. PIN DEFINITIONS
// =================================================================
#define SCK_PIN  18
#define MISO_PIN 19
#define MOSI_PIN 23
#define SS_PIN   5
#define RST_PIN  22

MFRC522 rfid(SS_PIN, RST_PIN);

// Function Prototype
void sendRFIDtoBackend(String uid);

// =================================================================
// 3. SETUP
// =================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n--- PROJECT NALAM: RFID TO iPAD ---");

  // Init SPI & RFID
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);
  rfid.PCD_Init();
  
  if(rfid.PCD_PerformSelfTest()) {
     Serial.println("✅ RFID Reader: ONLINE");
  } else {
     rfid.PCD_Init(); // Retry
     Serial.println("⚠️  RFID Reader: Retrying initialization"); 
  }

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   Local IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }
  
  Serial.print("Backend Server: http://");
  Serial.print(iPadIP);
  Serial.print(":");
  Serial.println(iPadPort);
  Serial.println("Ready to scan RFID cards...\n");
}

// =================================================================
// 4. MAIN LOOP
// =================================================================
void loop() {
  // 1. Look for Card
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  // 2. Get UID
  String cardUID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    cardUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    cardUID += String(rfid.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();

  Serial.print("\n💳 RFID Card Detected: ");
  Serial.println(cardUID);

  // 3. Send RFID to Backend
  if (WiFi.status() == WL_CONNECTED) {
    sendRFIDtoBackend(cardUID);
  } else {
    Serial.println("❌ WiFi disconnected. Cannot reach backend.");
  }

  // 4. Halt
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(3000); // 3 second delay to prevent duplicate reads
}

// =================================================================
// 5. SEND RFID TO BACKEND (Flask Server)
// =================================================================
void sendRFIDtoBackend(String uid) {
  HTTPClient http;
  
  // Build the URL to the backend
  String url = "http://" + String(iPadIP) + ":" + String(iPadPort) + String(backendEndpoint);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  DynamicJsonDocument doc(256);
  doc["rfid_uid"] = uid;

  String jsonData;
  serializeJson(doc, jsonData);

  Serial.print("📤 Sending to backend: ");
  Serial.println(url);
  
  int httpCode = http.POST(jsonData);

  if (httpCode == 200 || httpCode == 201) {
    Serial.println("✅ Backend received RFID successfully!");
    String response = http.getString();
    Serial.println("Response: " + response);
  } else if (httpCode == -1) {
    Serial.println("❌ Connection failed. Check:");
    Serial.println("   - Backend server is running");
    Serial.println("   - iPad IP address is correct: " + String(iPadIP));
    Serial.println("   - Both devices on same WiFi network");
  } else {
    Serial.print("❌ HTTP Error Code: ");
    Serial.println(httpCode);
    Serial.println("Response: " + http.getString());
  }
  
  http.end();
}
