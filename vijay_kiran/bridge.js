const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

// --- CONFIGURATION ---

// 1. YOUR ARDUINO PORT (Check Arduino IDE -> Tools -> Port)
// Windows Example: "COM3"
// Mac/Linux Example: "/dev/tty.usbmodem14101" or "/dev/ttyUSB0"
const portPath = "COM10"; 

// 2. YOUR BACKEND API URL
// Based on your function 'logRFIDScan', we are targeting this route:
const API_URL = "http://localhost:3000/api/log-rfid"; 

// --- CONNECT TO ARDUINO ---
const port = new SerialPort({ path: portPath, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

console.log(`Bridge active on ${portPath}. Forwarding to ${API_URL}...`);

// --- LISTEN FOR DATA ---
parser.on('data', async (uid) => {
    const cleanUID = uid.trim();
    console.log(`[TAG READ] UID: ${cleanUID}`);

    if (cleanUID.length < 4) return; // Ignore noise/empty lines

    try {
        // Send the ID to your backend
        // We structure the data to match your 'logRFIDScan(cardUID, kioskLocation)' function
        const response = await axios.post(API_URL, { 
            cardUID: cleanUID,
            kioskLocation: "Nalam_Hub_01" // Hardcoded location for this prototype
        });
        
        console.log(`[SUCCESS] Saved to DB:`, response.data);
    } catch (error) {
        console.error(`[ERROR] Backend Connection Failed: ${error.message}`);
    }
});

port.on('error', (err) => {
    console.error('Serial Port Error: ', err.message);
});