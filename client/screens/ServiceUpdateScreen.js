import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../config/dbClient';

export default function ServiceUpdateScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [recordId, setRecordId] = useState(null); // The row ID in the database
    
    // RFID Metadata State
    const [uid, setUid] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    // Additional Contact Info (Optional - helpful for "Updates")
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // 1. Get the scanned UID from app_main
            // We assume app_main has the latest scan. 
            const { data: scanData, error: scanError } = await supabase
                .from('app_main')
                .select('*')
                .limit(1)
                .single();

            if (scanError) throw scanError;

            if (scanData) {
                // Display data directly from the scan first
                setUid(scanData.uniqueid || scanData.uid || 'UNKNOWN'); 
                
                // 2. Now fetch the full profile from 'rfid_users' using that UID
                const { data: userProfile, error: profileError } = await supabase
                    .from('rfid_users')
                    .select('*')
                    .eq('uid', scanData.uniqueid) // Matching UID to UID
                    .single();

                if (userProfile) {
                    setRecordId(userProfile.id);
                    setName(userProfile.name);
                    setAge(userProfile.age ? String(userProfile.age) : '');
                    
                    // If your table has these, they will load. If not, they stay empty.
                    setPhone(userProfile.phone || '');
                    setAddress(userProfile.address || '');
                } else {
                    // Fallback if user is not in main DB yet
                    setName(scanData.name || "New User");
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Alert.alert("Error", "Could not fetch user data.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!uid) return;
        setLoading(true);

        try {
            // Update the Age (and contact info) in the database
            const { error } = await supabase
                .from('rfid_users')
                .update({ 
                    age: parseInt(age), // Ensure age is a number
                    phone: phone,
                    address: address 
                })
                .eq('uid', uid);

            if (error) throw error;

            Alert.alert("Success", "User Metadata Updated!");
            navigation.goBack();

        } catch (error) {
            Alert.alert("Update Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00695C" />
                <Text style={{marginTop: 10}}>Accessing RFID Database...</Text>
            </View>
        );
    }

    return (
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
                />

                <Text style={styles.label}>Name (Read Only)</Text>
                <TextInput 
                    style={[styles.input, styles.disabledInput]} 
                    value={name} 
                    editable={false} 
                />

                {/* EDITABLE FIELDS */}
                <Text style={styles.label}>Age</Text>
                <TextInput 
                    style={styles.input} 
                    value={age} 
                    onChangeText={setAge} 
                    keyboardType="numeric"
                    placeholder="Update Age"
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
                />

                <Text style={styles.label}>Address</Text>
                <TextInput 
                    style={[styles.input, { height: 60 }]} 
                    value={address} 
                    onChangeText={setAddress} 
                    placeholder="Add Address"
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
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#E0F2F1', padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    header: { marginBottom: 20, alignItems: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#00695C' },
    subtitle: { fontSize: 14, color: '#555' },

    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
    
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    disabledInput: { backgroundColor: '#E0E0E0', color: '#555', fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#00695C', marginBottom: 10 },

    updateBtn: { backgroundColor: '#00695C', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    cancelBtn: { padding: 15, alignItems: 'center' },
    cancelText: { color: '#777' }
});