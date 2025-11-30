const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// --- DATABASE CONNECTION ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sample',
    password: 'Vijay@1974',
    port: 5432
});

// Middleware to parse JSON
app.use(bodyParser.json());

// --- INIT: CREATE TABLE AUTOMATICALLY ---
// This ensures the table exists when you start the server
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS rfid_scans (
        id SERIAL PRIMARY KEY,
        card_uid VARCHAR(50) NOT NULL,
        kiosk_location VARCHAR(100),
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

pool.query(createTableQuery)
    .then(() => console.log("Table 'rfid_scans' is ready."))
    .catch(err => console.error("Error creating table", err));


// --- API ROUTE ---
app.post('/api/log-rfid', async (req, res) => {
    const { cardUID, kioskLocation } = req.body;

    // Validation
    if (!cardUID) {
        return res.status(400).json({ error: "UID is required" });
    }

    try {
        // SQL Insert Query
        const queryText = 'INSERT INTO rfid_scans (card_uid, kiosk_location) VALUES ($1, $2) RETURNING *';
        const values = [cardUID, kioskLocation];

        const result = await pool.query(queryText, values);
        
        console.log(`[DB] Saved Scan: ${cardUID} at ${kioskLocation}`);
        
        // Respond to the Bridge
        res.json({ 
            status: "success", 
            message: "Scan logged", 
            data: result.rows[0] 
        });

    } catch (err) {
        console.error("[DB Error]", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});