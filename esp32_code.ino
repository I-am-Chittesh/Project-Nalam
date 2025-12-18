#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =================================================================
// 1. WIFI & SUPABASE CREDENTIALS
// =================================================================
const char* ssid = "Dev 2g";
const char* password = "12345678";

// 🚨 Your URL and Key
const char* supabaseUrl = "https://apmogbrgeasetudeumdx.supabase.co"; 
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbW9nYnJnZWFzZXR1ZGV1bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjIwNTEsImV4cCI6MjA4MTIzODA1MX0.TUgDeQ_UXpnTTdqj2eLXE8QABl3dU9raaX4FNySgaZM";    
const char* tableName   = "main"; // 🚨 Target the MAIN table directly

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
void createFullUserProfile(String uid);

// =================================================================
// 3. SETUP
// =================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n--- PROJECT NALAM: DATA SEEDER ---");

  // Init SPI & RFID
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN);
  rfid.PCD_Init();
  
  if(rfid.PCD_PerformSelfTest()) {
     Serial.println("RFID Reader: ONLINE ✅");
  } else {
     rfid.PCD_Init(); // Retry
     Serial.println("RFID Reader: READY (Retry)"); 
  }

  // Connect Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi Connected. Ready to Seed Data.");
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

  Serial.print("\n💳 New Card Found: ");
  Serial.println(cardUID);

  // 3. Create Massive Entry in 'main'
  if (WiFi.status() == WL_CONNECTED) {
    createFullUserProfile(cardUID);
  } else {
    Serial.println("❌ No Internet.");
  }

  // 4. Halt
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(3000); // 3 second delay so we don't spam 100 rows per second
}

// =================================================================
// 5. THE MASSIVE INSERT FUNCTION
// =================================================================
void createFullUserProfile(String uid) {
  HTTPClient http;
  
  // 🚨 POST Request to create a NEW row
  String url = String(supabaseUrl) + "/rest/v1/" + tableName;
  
  http.begin(url);
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + String(supabaseKey));
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Prefer", "return=minimal"); // Don't send back the huge object

  // 🚨 LARGE BUFFER for 45 columns
  DynamicJsonDocument doc(4096); 

  // Basic Info
  doc["uniqueid"] = uid;
  doc["name"] = "Citizen " + uid; // Auto-generate name based on ID

  // --- FILLING ALL 43 COLUMNS WITH DUMMY DATA ---
  // Identity
  doc["aadhar_card"] = "XXXX-XXXX-XXXX";
  doc["pan_card"] = "ABCDE1234F";
  doc["voter_id"] = "VOTER123";
  doc["ration_card"] = "RAT-001";
  doc["driving_license"] = "DL-TN-01-2025";
  
  // Certs
  doc["birth_certificate"] = "BIRTH_CERT.pdf";
  doc["community_certificate"] = "COMM_CERT.pdf";
  doc["disability_certificate"] = "N/A";
  doc["domicile_certificate"] = "DOM_CERT.pdf";
  doc["caste_certificate"] = "CASTE_CERT.pdf";
  doc["passport"] = "P1234567";
  doc["visa"] = "N/A";
  doc["guardian_certificate"] = "GUARD_CERT.pdf";

  // Education
  doc["marksheet_10th"] = "PASS (98%)";
  doc["marksheet_12th"] = "PASS (95%)";
  doc["competitive_exams"] = "NEET_RANK_123";
  doc["tc_document"] = "TC_ORIGINAL.pdf";
  doc["mgnrega_job_card"] = "MGN-999";
  doc["lwb_id"] = "LWB-888";
  doc["employment_exchange_card"] = "EMP-777";
  doc["pf_uan_document"] = "UAN-0000000";

  // Health
  doc["vaccination_certificate"] = "COWIN_VERIFIED";
  doc["ayushman_bharat"] = "HEALTH_ID_111";
  doc["medical_insurance_card"] = "INS_POLICY_222";
  doc["esic_card"] = "ESIC_333";

  // Financial
  doc["itr"] = "FILED_2024";
  doc["pm_kisan_card"] = "KISAN_VALID";
  doc["bpl_card"] = "N/A";
  doc["old_age_pension_cert"] = "N/A";

  // Legal
  doc["marriage_certificate"] = "MARRIED_2020";
  doc["divorce_certificate"] = "N/A";
  doc["will_certificate"] = "N/A";
  doc["police_verification_cert"] = "VERIFIED_CLEAN";

  // Transport
  doc["bus_train_card"] = "METRO_CARD_99";
  doc["patta"] = "LAND_PATTA_DOC";
  doc["household_card"] = "FAMILY_CARD";
  doc["puc_certificate"] = "EMISSION_PASS";
  doc["vehicle_rc_certificate"] = "TN-07-AL-4000";
  doc["fastag"] = "ACTIVE_TAG";

  // Utilities
  doc["service_connection_cert"] = "EB_BILL_PAID";
  doc["meter_installation_cert"] = "METER_OK";
  doc["e_shram_certificate"] = "SHRAM_CARD";

  String jsonData;
  serializeJson(doc, jsonData);

  Serial.print("☁️ Uploading Full Profile (" + String(jsonData.length()) + " bytes)... ");
  
  // POST creates a NEW row (Duplicates allowed if ID is not unique in table)
  int httpCode = http.POST(jsonData);

  if (httpCode == 201) { // 201 Created
    Serial.println("SUCCESS! New Row Created.");
  } else {
    Serial.print("FAILED ("); Serial.print(httpCode); Serial.println(")");
    Serial.println(http.getString());
  }
  
  http.end();
}
