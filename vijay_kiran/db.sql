CREATE TABLE rfid_scans (
    id SERIAL PRIMARY KEY,
    card_uid VARCHAR(50),
    scan_time TIMESTAMP DEFAULT NOW(),
    kiosk_location VARCHAR(100)
);