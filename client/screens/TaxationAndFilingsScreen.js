import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
import { supabase } from '../config/dbClient';

export default function TaxationAndFilingsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);
    const [userName, setUserName] = useState('Citizen');
    const [taxRecords, setTaxRecords] = useState([]);

    // 1. FETCH USER UID & TAX RECORDS ON LOAD
    useEffect(() => {
        fetchTaxData();
    }, []);

    const fetchTaxData = async () => {
        try {
            // Step A: Get the UID of the person currently at the Kiosk (from app_main)
            const { data: scanData, error: scanError } = await supabase
                .from('app_main')
                .select('uniqueid, name')
                .limit(1)
                .single();

            if (scanError) throw scanError;

            if (scanData && (scanData.uniqueid || scanData.uid)) {
                const uid = scanData.uniqueid || scanData.uid;
                setUserUid(uid);
                setUserName(scanData.name || 'Citizen');

                // Step B: Fetch all tax records for this UID
                const { data: records, error: recordsError } = await supabase
                    .from('tax_records')
                    .select('*')
                    .eq('user_uid', uid)
                    .order('assessment_year', { ascending: false }); // Show newest first
                
                if (recordsError) throw recordsError;
                
                setTaxRecords(records);
            } else {
                Alert.alert("Identification Required", "Please ensure your card is scanned to view tax records.");
            }
        } catch (error) {
            console.error('Error fetching tax data:', error.message);
            Alert.alert("Database Error", "Could not load tax information.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewSummary = (year) => {
        Alert.alert(
            "Summary View", 
            `Simulating download/view of Tax Summary for Assessment Year ${year}. This functionality is ready for integration with a document service.`
        );
    };

    // Get the status of the most recent year
    const latestRecord = taxRecords.length > 0 ? taxRecords[0] : null;
    const latestStatus = latestRecord ? latestRecord.status : 'N/A';

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffac5e" />
                <Text style={{marginTop: 10, color: '#FFFFFF'}}>Checking Dhan Seva Records...</Text>
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
                <Text style={styles.title}>Taxation and Filings</Text>
                <Text style={styles.subtitle}>Applicant: {userName}</Text>
            </View>

            <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Latest Filing Status ({latestRecord?.assessment_year || 'N/A'}):</Text>
                <Text style={[styles.mainStatus, styles[`status_${latestStatus.replace(/\s/g, '')}`]]}>
                    {latestStatus}
                </Text>
            </View>

            <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Filing History</Text>
                {taxRecords.length === 0 ? (
                    <Text style={styles.noData}>No prior tax filing records found for this ID.</Text>
                ) : (
                    <ScrollView style={styles.recordList}>
                        {taxRecords.map((record, index) => (
                            <View key={index} style={styles.recordItem}>
                                <View>
                                    <Text style={styles.recordYear}>Assessment Year: {record.assessment_year}</Text>
                                    <Text style={styles.recordStatus}>Status: {record.status}</Text>
                                    {record.amount_due > 0 && (
                                        <Text style={styles.recordDue}>Amount Due: ₹{record.amount_due.toLocaleString('en-IN')}</Text>
                                    )}
                                </View>
                                <TouchableOpacity 
                                    style={styles.viewBtn}
                                    onPress={() => handleViewSummary(record.assessment_year)}
                                >
                                    <Text style={styles.viewBtnText}>View Summary</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>← Back to Dashboard</Text>
            </TouchableOpacity>
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

    statusBox: { 
        backgroundColor: 'rgba(255,255,255,0.11)',
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(12,21,35,0.50)',
    },
    statusLabel: { fontSize: 14, color: '#D9E2F2', marginBottom: 8, fontWeight: '700' },
    mainStatus: { fontSize: 32, fontWeight: '900', marginTop: 8 },
    
    // Status color classes
    status_Filed: { color: '#2ee3bb' },
    status_Pending: { color: '#ffac5e' },
    status_NotApplicable: { color: '#D9E2F2' },
    'status_N/A': { color: '#D9E2F2' },

    historyContainer: { 
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
        marginBottom: 20,
    },
    historyTitle: { fontSize: 17, fontWeight: '900', color: '#E6F1FF', marginBottom: 12, borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,172,94,0.35)', paddingBottom: 8, letterSpacing: 0.7 },
    noData: { color: '#D9E2F2', textAlign: 'center', paddingVertical: 30, fontWeight: '600' },
    recordList: { flex: 1 },
    recordItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,172,94,0.25)',
        paddingHorizontal: 4,
    },
    recordYear: { fontSize: 15, fontWeight: '800', color: '#E6F1FF', letterSpacing: 0.5 },
    recordStatus: { fontSize: 13, color: '#D9E2F2', marginTop: 4, fontWeight: '600' },
    recordDue: { fontSize: 13, color: '#ff6b6b', fontWeight: '800', marginTop: 4 },
    
    viewBtn: { 
        backgroundColor: 'rgba(255, 172, 94, 0.35)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 172, 94, 0.50)',
        shadowColor: '#ffac5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.20,
        shadowRadius: 8,
        elevation: 4,
    },
    viewBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

    backBtn: { 
        backgroundColor: 'rgba(255, 172, 94, 0.35)',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 172, 94, 0.50)',
        shadowColor: '#ffac5e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.30,
        shadowRadius: 12,
        elevation: 8,
    },
    backBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.7 }
});