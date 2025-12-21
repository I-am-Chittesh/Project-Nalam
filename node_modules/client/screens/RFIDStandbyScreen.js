import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Backend API configuration
const API_BASE_URL = 'http://10.182.43.47:5000'; // Windows PC IP address
const RFID_RECEIVER_PORT = 8081;

export default function RFIDStandbyScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [rfidData, setRfidData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Initializing RFID receiver...');
  const [wifiSSID, setWifiSSID] = useState('');

  useEffect(() => {
    initializeRFIDReceiver();
    
    // Cleanup on unmount
    return () => {
      // Close the server if needed
    };
  }, []);

  const initializeRFIDReceiver = async () => {
    try {
      // Get WiFi info without blocking
      setTimeout(async () => {
        try {
          const wifiState = await NetInfo.fetch();
          if (wifiState.isConnected && wifiState.details?.ssid) {
            setWifiSSID(wifiState.details.ssid);
          } else {
            setWifiSSID('Network Connected');
          }
        } catch (error) {
          console.log('WiFi info fetch error:', error);
          setWifiSSID('Network Connected');
        }
      }, 100);

      setStatusMessage('Connected to WiFi\nWaiting for RFID scan...');
      setIsListening(true);
      startRFIDPolling();
    } catch (error) {
      console.error('Error initializing RFID receiver:', error);
      setStatusMessage('Error: Could not initialize RFID receiver');
    }
  };

  const startRFIDPolling = () => {
    // This is a simple approach - in production, you'd use WebSockets or a proper server
    // The backend can store the last RFID scanned in memory or session
    const pollInterval = setInterval(() => {
      if (isListening) {
        // Backend will receive RFID from ESP32 and we can poll for it
        // For now, just wait for direct callback from ESP32
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  };

  // This function will be called when ESP32 sends RFID data
  const handleRFIDReceived = async (rfidUID) => {
    try {
      setStatusMessage('Processing RFID...');
      
      // Send RFID UID to backend
      const response = await fetch(`${API_BASE_URL}/api/rfid/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfid_uid: rfidUID }),
      });

      const data = await response.json();

      if (data.success) {
        setRfidData(data);
        setStatusMessage(`RFID Processed!\nCitizen ID: ${data.citizen_id}\n${data.is_new ? '(New Entry Created)' : '(Existing Entry)'}`);
        
        // Navigate to Dashboard with RFID data after 1.5 seconds
        setTimeout(() => {
          navigation.navigate('Dashboard', {
            rfidUID: data.rfid_uid,
            citizenID: data.citizen_id,
            rfidData: data,
          });
        }, 1500);
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error processing RFID:', error);
      setStatusMessage(`Error processing RFID: ${error.message}`);
    }
  };

  // When the app receives an event from ESP32 (via HTTP or other means)
  // This would be triggered by the local server receiving data
  // For testing, you can call this function directly

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>📱 RFID Standby Mode</Text>
        
        <View style={styles.statusSection}>
          {isListening && (
            <>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </>
          )}
          
          {!isListening && (
            <Text style={styles.statusText}>{statusMessage}</Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>📡 WiFi Network:</Text>
          <Text style={styles.infoValue}>{wifiSSID || 'Not connected'}</Text>
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instruction}>1. Ensure ESP32 is connected to the same WiFi network</Text>
          <Text style={styles.instruction}>2. Scan an RFID card on the ESP32 reader</Text>
          <Text style={styles.instruction}>3. Wait for processing and automatic navigation</Text>
        </View>

        {/* For testing - remove in production */}
        <View style={styles.testSection}>
          <Text style={styles.testLabel}>🧪 Test RFID (Development only):</Text>
          <Text 
            style={styles.testButton}
            onPress={() => handleRFIDReceived('TEST123ABC456')}
          >
            Simulate RFID Scan
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    zIndex: 100,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 25,
    textAlign: 'center',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  statusText: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },
  instructionSection: {
    backgroundColor: '#faf9f7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#744210',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 12,
    color: '#744210',
    marginBottom: 5,
    lineHeight: 18,
  },
  testSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: '#fbbf24',
  },
  testLabel: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 10,
  },
  testButton: {
    fontSize: 13,
    color: '#fff',
    backgroundColor: '#fbbf24',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    overflow: 'hidden',
  },
});
