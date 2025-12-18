import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Picker, ImageBackground } from 'react-native';
import { supabase } from '../config/dbClient';

// Available Services List
const services = [
    { label: "New Health Card Application", value: "HEALTH_CARD" },
    { label: "Birth Certificate Registration", value: "BIRTH_CERT" },
    { label: "Income Certificate Request", value: "INCOME_CERT" },
    { label: "Other", value: "OTHER" },
];

export default function ServiceCreateScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);
    const [userName, setUserName] = useState('Citizen');
    
    // Form States
    const [selectedService, setSelectedService] = useState(services[0].value);
    const [description, setDescription] = useState('');

    // 1. FETCH USER UID ON LOAD
    useEffect(() => {
        fetchUserUID();
    }, []);

    const fetchUserUID = async () => {
        try {
            // Get the UID of the person currently at the Kiosk (from app_main)
            const { data: scanData, error } = await supabase
                .from('app_main')
                .select('uniqueid, name') // Assuming 'uniqueid' holds the RFID UID
                .limit(1)
                .single();

            if (error) throw error;

            if (scanData) {
                setUserUid(scanData.uniqueid || scanData.uid);
                setUserName(scanData.name || 'Citizen');
            } else {
                Alert.alert("Error", "Please scan your RFID card to initiate a service.");
            }
        } catch (error) {
            console.error('Error fetching UID:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. CREATE FUNCTION
    const handleCreateService = async () => {
        if (!userUid) {
            Alert.alert("Error", "User not identified. Please scan your card.");
            return;
        }
        if (!description || description.trim() === '') {
            Alert.alert("Missing Detail", "Please provide a brief description of your request.");
            return;
        }

        setLoading(true);

        try {
            // Insert a new service request record
            const { error } = await supabase
                .from('service_requests')
                .insert({
                    user_uid: userUid,
                    service_type: selectedService,
                    description: description.trim(),
                    status: 'Pending', // Initial status
                    requested_by_name: userName // For easy tracking
                });

            if (error) throw error;

            Alert.alert("Request Sent", "Your new service request has been successfully submitted! Status: Pending");
            navigation.goBack();

        } catch (error) {
            Alert.alert("Submission Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6395ff" />
                <Text style={{marginTop: 10, color: '#FFFFFF'}}>Initializing Service Form...</Text>
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
                <Text style={styles.title}>New Service Application</Text>
                <Text style={styles.subtitle}>Welcome, {userName}.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Applicant ID (Read Only)</Text>
                <TextInput 
                    style={[styles.input, styles.disabledInput]} 
                    value={userUid || 'Not Scanned'} 
                    editable={false} 
                />
                
                <Text style={styles.label}>Select Service Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedService}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedService(itemValue)}
                        prompt="Choose a Service"
                    >
                        {services.map((service) => (
                            <Picker.Item 
                                key={service.value} 
                                label={service.label} 
                                value={service.value} 
                            />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Brief Description of Request</Text>
                <TextInput 
                    style={[styles.input, styles.descriptionInput]} 
                    value={description} 
                    onChangeText={setDescription} 
                    placeholder="E.g., Applying for my daughter's income certificate for college admission."
                    multiline
                    maxLength={200}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateService}>
                    <Text style={styles.btnText}>SUBMIT APPLICATION</Text>
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
    descriptionInput: { height: 100, textAlignVertical: 'top', paddingVertical: 12 },

    pickerContainer: { 
        borderWidth: 2, 
        borderColor: 'rgba(99, 149, 255, 0.60)', 
        borderRadius: 14, 
        backgroundColor: 'rgba(255,255,255,0.35)', 
        overflow: 'hidden',
        marginBottom: 8,
        justifyContent: 'center',
    },
    picker: { height: 60, width: '100%', color: '#1A1A1A', fontSize: 16, fontWeight: '600' },

    submitBtn: { 
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