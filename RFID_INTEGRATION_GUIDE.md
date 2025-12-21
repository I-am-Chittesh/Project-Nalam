# RFID Integration Implementation Guide

## Overview
Complete end-to-end RFID integration that allows an ESP32 to scan RFID cards and send the data to an iPad's React Native app, which then processes it through a Flask backend.

---

## 🔧 Components Modified/Created

### 1. **Backend (Flask API) - api_server.py**
**New Endpoint:** `POST /api/rfid/process`

```python
Request: { "rfid_uid": "A1B2C3D4E5F6" }
Response: { 
    "success": true, 
    "rfid_uid": "A1B2C3D4E5F6",
    "citizen_id": "CITIZEN_A1B2C3D4E5F6",
    "is_new": true/false,
    "data": {...}
}
```

**Functionality:**
- Receives RFID UID from ESP32
- Checks if UID exists in `rfid` database table
- If **exists**: Returns existing citizen data
- If **not exists**: Creates dummy entry with `citizen_id = CITIZEN_{rfid_uid}`
- Returns success/error status

---

### 2. **Frontend - React Native Screens**

#### **New Screen: RFIDStandbyScreen.js**
- Displays "RFID Standby Mode" waiting screen
- Shows WiFi network status
- Listens for RFID data from backend
- Auto-navigates to Dashboard on successful RFID read
- Includes test button for development

**Key Features:**
- Processes RFID via `/api/rfid/process` endpoint
- Passes RFID data to Dashboard screen via navigation params:
  - `rfidUID`: The scanned card's UID
  - `citizenID`: The citizen ID from database
  - `rfidData`: Full response object

#### **Updated: HomeScreen.js**
- Added **RFID Button** (📱 RFID) on left side
- Button navigates to RFIDStandbyScreen
- Maintains existing AI Mode button

#### **Updated: App.js**
- Imported `RFIDStandbyScreen`
- Added route: `<Stack.Screen name="RFIDStandby" component={RFIDStandbyScreen} />`

---

### 3. **ESP32 Hardware Code - esp32_code.ino**

**Configuration Section:**
```cpp
const char* iPadIP = "192.168.1.100";        // ⚠️ Change to your iPad's IP
const int iPadPort = 5000;                   // Flask server port
const char* backendEndpoint = "/api/rfid/process";
```

**Functionality:**
1. Connects to same WiFi as iPad (`Dev 2g`)
2. Scans for RFID cards
3. On card detection:
   - Reads the card's UID
   - Creates JSON payload: `{ "rfid_uid": "..." }`
   - Sends HTTP POST to backend endpoint
   - Displays success/error on serial monitor

**Serial Output Examples:**
```
✅ RFID Reader: ONLINE
✅ WiFi Connected!
   Local IP: 192.168.1.50
Backend Server: http://192.168.1.100:5000

💳 RFID Card Detected: A1B2C3D4E5F6
📤 Sending to backend: http://192.168.1.100:5000/api/rfid/process
✅ Backend received RFID successfully!
```

---

## ⚙️ Setup Instructions

### Step 1: Update iPad IP Address
In `esp32_code.ino`, change line:
```cpp
const char* iPadIP = "192.168.1.100";  // Replace with actual iPad IP
```

**Find iPad IP:**
- iPad Settings → WiFi → Tap network name → Look for IP address

### Step 2: Database Setup
Ensure your Supabase database has an `rfid` table with columns:
```sql
CREATE TABLE rfid (
  id SERIAL PRIMARY KEY,
  rfid_uid VARCHAR(50) UNIQUE NOT NULL,
  citizen_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Start Backend Server
```bash
cd D:\Projects\Project-Nalam
python api_server.py
```

Backend will run on `http://0.0.0.0:5000`

### Step 4: Upload ESP32 Code
1. Connect ESP32 via USB
2. Use Arduino IDE to upload `esp32_code.ino`
3. Open Serial Monitor (9600 baud) to verify

### Step 5: Start React Native App
```bash
cd D:\Projects\Project-Nalam\client
npx expo start
```

### Step 6: Use the App
1. Open app on iPad
2. From Home screen, tap **📱 RFID** button
3. Scan card on ESP32 reader
4. App auto-navigates to Dashboard with RFID data

---

## 📱 Data Flow

```
┌─────────────┐
│   ESP32     │
│   (RFID)    │
└──────┬──────┘
       │ HTTP POST: { "rfid_uid": "ABC..." }
       │
       ▼
┌──────────────────┐
│  Flask Backend   │  /api/rfid/process
│  (api_server.py) │  - Check rfid table
└──────┬───────────┘  - Create if not exists
       │              - Return citizen_id
       │ JSON Response
       │
       ▼
┌────────────────────────┐
│ React Native (iPad)    │
│ RFIDStandbyScreen      │
│ - Process response     │
│ - Navigate to Dashboard│
└────────────────────────┘
```

---

## 🧪 Testing

### Development Test Button
RFIDStandbyScreen includes a yellow test button:
- Tap "Simulate RFID Scan" to test without hardware
- Processes as if RFID "TEST123ABC456" was scanned

### Serial Monitor (ESP32)
Watch for:
```
✅ Backend received RFID successfully!
Response: {"success":true,"rfid_uid":"...","citizen_id":"...",...}
```

### Network Troubleshooting
If ESP32 cannot reach backend:
1. Verify iPad IP is correct
2. Check both devices on same WiFi: `Dev 2g`
3. Ensure Flask server is running
4. Check firewall isn't blocking port 5000

---

## 🔄 Processing Flow Summary

1. **Scan** → ESP32 reads RFID card UID
2. **Send** → ESP32 sends to `POST /api/rfid/process`
3. **Check** → Backend queries `rfid` table
4. **Create** → If new, inserts dummy entry
5. **Receive** → React app gets `citizen_id` & `rfid_uid`
6. **Navigate** → App goes to Dashboard with RFID data
7. **Use** → Dashboard can now use `rfid_uid` as processing value

---

## 📝 Notes

- RFID table auto-generates citizen_id as `CITIZEN_{rfid_uid}`
- 3-second delay between reads to prevent duplicates
- All endpoints include full error handling
- Test button available for development/debugging
