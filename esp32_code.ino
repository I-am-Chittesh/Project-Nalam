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

// 🚨 CHANGE THESE TO YOUR WINDOWS PC'S LOCAL IP AND FLASK SERVER IP
const char* iPadIP = "10.182.43.47";           // Your Windows PC's local IP address
const int iPadPort = 5000;                      // Flask backend server port
const char* backendEndpoint = "/api/rfid/process"; // Backend endpoint to process RFID

// Network settings
const int WIFI_TIMEOUT = 20000;  // 20 seconds to connect
const int HTTP_TIMEOUT = 10000;  // 10 seconds for HTTP request
const int MAX_RETRIES = 3;       // Retry failed sends 3 times

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
bool sendRFIDtoBackend(String uid);

// =================================================================
// 3. SETUP
// =================================================================
void setup() {
  Serial.begin(115200);
  delay(2000);  // Give serial port time to initialize

  Serial.println("\n\n===========================================");
  Serial.println("   PROJECT NALAM: RFID TO iPAD");
  Serial.println("===========================================\n");

  // Init SPI & RFID
  Serial.println("🔧 Initializing RFID Reader...");
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);
  rfid.PCD_Init();
  
  if(rfid.PCD_PerformSelfTest()) {
     Serial.println("✅ RFID Reader: ONLINE\n");
  } else {
     rfid.PCD_Init(); // Retry
     Serial.println("⚠️  RFID Reader: Retrying initialization\n"); 
  }

  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  int dotCount = 0;
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
    dotCount++;
    if (dotCount % 10 == 0) Serial.println();
  }
  
  Serial.println("\n");
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi Connected Successfully!");
    Serial.print("   SSID: ");
    Serial.println(ssid);
    Serial.print("   Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("❌ WiFi Connection Failed!");
    Serial.println("   - Check SSID is correct");
    Serial.println("   - Check WiFi password");
    Serial.println("   - Check WiFi network is available\n");
  }
  
  Serial.print("🌐 Backend Server: http://");
  Serial.print(iPadIP);
  Serial.print(":");
  Serial.println(iPadPort);
  Serial.println("\n⏳ Ready to scan RFID cards...\n");
  Serial.println("===========================================\n");
}

// =================================================================
// 4. MAIN LOOP
// =================================================================
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected! Reconnecting...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  // 1. Look for Card
  if (!rfid.PICC_IsNewCardPresent()) {
    delay(100);  // Small delay to reduce CPU usage
    return;
  }
  
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // 2. Get UID
  String cardUID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      cardUID += "0";
    }
    cardUID += String(rfid.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();

  Serial.println("\n===========================================");
  Serial.print("💳 RFID Card Detected: ");
  Serial.println(cardUID);
  Serial.println("===========================================");

  // 3. Send RFID to Backend with retries
  bool sendSuccess = false;
  for (int retry = 0; retry < MAX_RETRIES; retry++) {
    Serial.print("📤 Attempt ");
    Serial.print(retry + 1);
    Serial.print("/");
    Serial.println(MAX_RETRIES);
    
    if (sendRFIDtoBackend(cardUID)) {
      sendSuccess = true;
      break;
    }
    
    if (retry < MAX_RETRIES - 1) {
      Serial.println("⏳ Retrying in 2 seconds...");
      delay(2000);
    }
  }

  if (!sendSuccess) {
    Serial.println("❌ Failed to send after all retries!");
  }

  // 4. Halt RFID reader
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  Serial.println("\n⏳ Waiting 3 seconds before next scan...\n");
  delay(3000); // 3 second delay to prevent duplicate reads
}

// =================================================================
// 5. SEND RFID TO BACKEND (Flask Server)
// =================================================================
bool sendRFIDtoBackend(String uid) {
  HTTPClient http;
  
  // Build the URL to the backend
  String url = "http://" + String(iPadIP) + ":" + String(iPadPort) + String(backendEndpoint);
  
  Serial.print("📍 Connecting to: ");
  Serial.println(url);
  
  http.setTimeout(HTTP_TIMEOUT);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  DynamicJsonDocument doc(256);
  doc["rfid_uid"] = uid;

  String jsonData;
  serializeJson(doc, jsonData);

  Serial.print("📨 Sending JSON: ");
  Serial.println(jsonData);
  
  // Send POST request
  int httpCode = http.POST(jsonData);

  Serial.print("📬 HTTP Response Code: ");
  Serial.println(httpCode);

  if (httpCode == 200 || httpCode == 201) {
    Serial.println("✅ Backend received RFID successfully!");
    String response = http.getString();
    Serial.print("📥 Response: ");
    Serial.println(response);
    http.end();
    return true;
    
  } else if (httpCode == -1) {
    Serial.println("❌ Connection failed!");
    Serial.println("   Possible reasons:");
    Serial.println("   - Backend server is NOT running");
    Serial.println("   - iPad IP is INCORRECT");
    Serial.print("   - Trying to reach: http://");
    Serial.print(iPadIP);
    Serial.print(":");
    Serial.println(iPadPort);
    Serial.println("   - Both devices must be on SAME WiFi network");
    http.end();
    return false;
    
  } else if (httpCode == 0) {
    Serial.println("❌ Server did not respond (timeout)");
    http.end();
    return false;
    
  } else {
    Serial.print("❌ HTTP Error Code: ");
    Serial.println(httpCode);
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
    http.end();
    return false;
  }
}
