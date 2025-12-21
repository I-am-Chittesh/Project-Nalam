import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';

// Backend API URL - Make sure this matches your Flask server IP
const API_BASE_URL = 'http://10.182.43.47:5000';

export default function ServiceUpdateScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);
    const [recordId, setRecordId] = useState(null);
    
    // RFID Metadata State
    const [uid, setUid] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [citizenId, setCitizenId] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            // Get RFID UID from route params (passed from RFIDStandbyScreen)
            // Use specific default RFID if not scanned
            let rfidUID = route?.params?.rfidUID || 'SIM_1766339294667_8PVQU';
            
            setUid(rfidUID);
            console.log('📱 Using RFID ID:', rfidUID);

            // Fetch user profile from backend using RFID UID
            const response = await fetch(`${API_BASE_URL}/api/rfid/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rfid_uid: rfidUID }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setCitizenId(data.citizen_id || '');
                setName(data.citizen_id || 'User ' + rfidUID);
                // Set other fields from data if available
                setAge(data.age ? String(data.age) : '');
                setPhone(data.phone || '');
                setAddress(data.address || '');
                console.log('✅ User profile fetched successfully');
            } else {
                Alert.alert("Error", data.error || "Could not fetch user data");
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Alert.alert("Error", "Could not connect to backend: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!uid) {
            Alert.alert("Error", "No RFID UID available");
            return;
        }

        setLoading(true);

        try {
            // Send update to backend
            const response = await fetch(`${API_BASE_URL}/api/rfid/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rfid_uid: uid,
                    citizen_id: citizenId,
                    name: name,
                    age: age ? parseInt(age) : null,
                    phone: phone,
                    address: address,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "User records updated successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Update Failed", data.error || "Unknown error");
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert("Update Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6395ff" />
                <Text style={{marginTop: 10, color: '#FFFFFF'}}>Accessing RFID Database...</Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/bg.png')}
            style={styles.bgImage}
            blurRadius={26}
        >
            <View style={styles.scrim}>
                <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Update Metadata</Text>
                <Text style={styles.subtitle}>Jan Setu Service Portal</Text>
            </View>

            <View style={styles.card}>
                {/* READ ONLY FIELDS */}
                <Text style={styles.label}>RFID UID (Read Only)</Text>
                <TextInput 
                    style={[styles.input, styles.disabledInput]} 
                    value={uid} 
                    editable={false}
                    placeholderTextColor="rgba(230, 241, 255, 0.6)"
                />

                <Text style={styles.label}>Name (Read Only)</Text>
                <TextInput 
                    style={[styles.input, styles.disabledInput]} 
                    value={name} 
                    editable={false}
                    placeholderTextColor="rgba(230, 241, 255, 0.6)"
                />

                {/* EDITABLE FIELDS */}
                <Text style={styles.label}>Age</Text>
                <TextInput 
                    style={styles.input} 
                    value={age} 
                    onChangeText={setAge} 
                    keyboardType="numeric"
                    placeholder="Update Age"
                    placeholderTextColor="rgba(230, 241, 255, 0.45)"
                />

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Additional Contact Details</Text>

                <Text style={styles.label}>Phone Number</Text>
                <TextInput 
                    style={styles.input} 
                    value={phone} 
                    onChangeText={setPhone} 
                    keyboardType="phone-pad"
                    placeholder="Add Phone Number"
                    placeholderTextColor="rgba(230, 241, 255, 0.45)"
                />

                <Text style={styles.label}>Address</Text>
                <TextInput 
                    style={[styles.input, { height: 60 }]} 
                    value={address} 
                    onChangeText={setAddress} 
                    placeholder="Add Address"
                    placeholderTextColor="rgba(230, 241, 255, 0.45)"
                    multiline
                />

                <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                    <Text style={styles.btnText}>UPDATE RECORDS</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: { flex: 1 },
    scrim: { flex: 1, backgroundColor: 'rgba(6, 16, 30, 0.30)' },
    
    container: { flexGrow: 1, padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(6, 16, 30, 0.30)' },
    
    header: { marginBottom: 20, alignItems: 'center', marginTop: 12, paddingHorizontal: 8 },
    title: { fontSize: 32, fontWeight: '900', color: '#F0F4FF', letterSpacing: 1.2 },
    subtitle: { fontSize: 14, color: '#D8DEEA', marginTop: 6 },

    card: { 
        backgroundColor: 'rgba(255,255,255,0.11)',
        padding: 18,
        borderRadius: 18,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(12,21,35,0.50)',
        marginBottom: 24,
    },
    
    label: { fontSize: 14, fontWeight: '900', color: '#E6F1FF', marginBottom: 6, marginTop: 12, letterSpacing: 0.7 },
    input: { 
        borderWidth: 2,
        borderColor: 'rgba(99, 149, 255, 0.60)',
        borderRadius: 14,
        padding: 15,
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.16)',
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '700',
    },
    disabledInput: { 
        backgroundColor: 'rgba(46, 227, 187, 0.20)',
        color: '#FFFFFF',
        fontWeight: '800',
        borderColor: 'rgba(46, 227, 187, 0.55)',
    },

    divider: { height: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 16, marginHorizontal: 0 },
    sectionHeader: { fontSize: 17, fontWeight: '900', color: '#E6F1FF', marginBottom: 10, marginTop: 2, letterSpacing: 0.9, paddingHorizontal: 2 },

    updateBtn: { 
        backgroundColor: 'rgba(46, 227, 187, 0.35)',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(46, 227, 187, 0.50)',
        shadowColor: '#2ee3bb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.30,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.7 },

    cancelBtn: { 
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.09)',
    },
    cancelText: { color: '#D9E2F2', fontWeight: '800', letterSpacing: 0.5, fontSize: 15 }
});