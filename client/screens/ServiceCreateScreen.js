import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Picker } from 'react-native';
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
                <ActivityIndicator size="large" color="#00695C" />
                <Text style={{marginTop: 10}}>Initializing Service Form...</Text>
            </View>
        );
    }

    return (
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
                    {/* Using Picker from react-native is standard, though styling on web can be tricky */}
                    <Picker
                        selectedValue={selectedService}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedService(itemValue)}
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
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#E0F2F1', padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    header: { marginBottom: 20, alignItems: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#00695C' },
    subtitle: { fontSize: 14, color: '#555' },

    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
    
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
    
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    disabledInput: { backgroundColor: '#E0E0E0', color: '#555', fontWeight: 'bold' },
    descriptionInput: { height: 100, textAlignVertical: 'top' },

    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#FAFAFA', overflow: 'hidden' },
    picker: { height: 50, width: '100%' },

    submitBtn: { backgroundColor: '#00695C', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 },
    btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    cancelBtn: { padding: 15, alignItems: 'center' },
    cancelText: { color: '#777' }
});