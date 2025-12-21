import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
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