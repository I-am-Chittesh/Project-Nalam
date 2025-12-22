import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../config/dbClient';

// Departments for the Grievance dropdown
const departments = [
    { label: "Select Department", value: "" },
    { label: "Jan Setu (Services/Documents)", value: "JAN_SETU" },
    { label: "Dhan Seva (Tax/Finance)", value: "DHAN_SEVA" },
    { label: "Sevai Jannal (Land/Records)", value: "SEVAI_JANNAL" },
    { label: "General Administration", value: "GENERAL" },
];

export default function GrievancePortalScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);
    const [userName, setUserName] = useState('Citizen');
    
    // Form States
    const [department, setDepartment] = useState(departments[0].value);
    const [subject, setSubject] = useState('');
    const [details, setDetails] = useState('');

    // 1. FETCH USER UID ON LOAD
    useEffect(() => {
        fetchUserUID();
    }, []);

    const fetchUserUID = async () => {
        try {
            // Get the UID of the person currently at the Kiosk (from app_main)
            const { data: scanData, error } = await supabase
                .from('app_main')
                .select('uniqueid, name') 
                .limit(1)
                .single();

            if (error) throw error;

            if (scanData) {
                setUserUid(scanData.uniqueid || scanData.uid);
                setUserName(scanData.name || 'Citizen');
            }
        } catch (error) {
            console.error('Error fetching UID:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. SUBMIT FUNCTION
    const handleSubmitGrievance = async () => {
        if (!userUid) {
            Alert.alert("Error", "Please scan your card to link the grievance to your identity.");
            return;
        }
        if (!department || department === '') {
            Alert.alert("Missing Field", "Please select the department related to your grievance.");
            return;
        }
        if (!subject || subject.trim() === '' || !details || details.trim() === '') {
            Alert.alert("Missing Detail", "Please fill out both the subject and the full details of your complaint.");
            return;
        }

        setLoading(true);

        try {
            // Insert a new grievance record
            const { data, error } = await supabase
                .from('grievances')
                .insert({
                    user_uid: userUid,
                    department: department,
                    subject: subject.trim(),
                    details: details.trim(),
                    status: 'New', // Initial status
                    lodged_by_name: userName // For easy tracking
                }).select(); // Request the inserted record to get its ID

            if (error) throw error;

            const trackingId = data[0].id;

            Alert.alert(
                "Grievance Submitted", 
                `Your complaint has been successfully lodged. Your tracking ID is: G-00${trackingId}. We will contact you shortly.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );

        } catch (error) {
            Alert.alert("Submission Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={{marginTop: 10, color: '#FFFFFF'}}>Loading Grievance Portal...</Text>
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
                <Text style={styles.title}>Official Grievance Portal</Text>
                <Text style={styles.subtitle}>Sevai Jannal (Window of Service) Module</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.idLabel}>Identified Applicant: {userName} (UID: {userUid || 'N/A'})</Text>
                
                <Text style={styles.label}>1. Select Department</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={department}
                        style={styles.picker}
                        onValueChange={(itemValue) => setDepartment(itemValue)}
                    >
                        {departments.map((dept) => (
                            <Picker.Item 
                                key={dept.value} 
                                label={dept.label} 
                                value={dept.value} 
                            />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>2. Subject of Grievance (Short Summary)</Text>
                <TextInput 
                    style={styles.input} 
                    value={subject} 
                    onChangeText={setSubject} 
                    placeholder="E.g., Issue with Patta document verification"
                    maxLength={100}
                />

                <Text style={styles.label}>3. Detailed Complaint</Text>
                <TextInput 
                    style={[styles.input, styles.detailInput]} 
                    value={details} 
                    onChangeText={setDetails} 
                    placeholder="Describe the issue, including dates, names, or reference numbers."
                    multiline
                    maxLength={500}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitGrievance}>
                    <Text style={styles.btnText}>LODGE COMPLAINT NOW</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>← Back to Land Records</Text>
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
    idLabel: { fontSize: 13, color: '#D9E2F2', marginBottom: 16, textAlign: 'center', fontWeight: '700', letterSpacing: 0.3 },
    
    label: { fontSize: 14, fontWeight: '900', color: '#E6F1FF', marginBottom: 6, marginTop: 12, letterSpacing: 0.7 },
    
    input: { 
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 107, 0.60)',
        borderRadius: 14,
        padding: 15,
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.16)',
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '700',
    },
    detailInput: { height: 100, textAlignVertical: 'top', paddingVertical: 12 },

    pickerContainer: { 
        borderWidth: 2, 
        borderColor: 'rgba(255, 107, 107, 0.60)', 
        borderRadius: 14, 
        backgroundColor: 'rgba(255,255,255,0.35)', 
        overflow: 'hidden',
        marginBottom: 8,
        justifyContent: 'center',
    },
    picker: { height: 60, width: '100%', color: '#1A1A1A', fontSize: 15 },

    submitBtn: { 
        backgroundColor: 'rgba(255, 107, 107, 0.35)',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 107, 107, 0.50)',
        shadowColor: '#ff6b6b',
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
