import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
import { supabase } from '../config/dbClient';

export default function ServiceLandScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);
    const [userName, setUserName] = useState('Citizen');
    const [landRecords, setLandRecords] = useState([]);

    // 1. FETCH USER UID & LAND RECORDS ON LOAD
    useEffect(() => {
        fetchLandData();
    }, []);

    const fetchLandData = async () => {
        try {
            // Step A: Get the UID of the person currently at the Kiosk (from app_main)
            const { data: scanData, error: scanError } = await supabase
                .from('app_main')
                .select('uniqueid, name')
                .limit(1)
                .single();

            if (scanError) {
                console.error('Error fetching scan data:', scanError.message);
                setLandRecords([]);
                setLoading(false);
                return;
            }

            if (scanData && (scanData.uniqueid || scanData.uid)) {
                const uid = scanData.uniqueid || scanData.uid;
                setUserUid(uid);
                setUserName(scanData.name || 'Citizen');

                // Step B: Fetch all land records for this UID (gracefully handle missing table)
                const { data: records, error: recordsError } = await supabase
                    .from('land_records')
                    .select('*')
                    .eq('user_uid', uid)
                    .order('village_name', { ascending: true }); 
                
                // If table doesn't exist or no records, just use empty array
                if (recordsError) {
                    console.warn('Land records table not available:', recordsError.message);
                    setLandRecords([]);
                } else {
                    setLandRecords(records || []);
                }
            } else {
                console.warn('No scan data available');
                setLandRecords([]);
            }
        } catch (error) {
            console.error('Error fetching land data:', error.message);
            setLandRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentAction = (docType, patta) => {
        Alert.alert(
            `${docType} Request`, 
            `You are requesting a ${docType} for Patta No. ${patta}. This request has been submitted for digital signing and will be available for download shortly.`,
            [
                { text: "OK" },
                { text: "Lodge Grievance", onPress: () => navigation.navigate('Grievance') }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={{marginTop: 10, color: '#FFFFFF'}}>Fetching Land Records via Sevai Jannal...</Text>
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
                <Text style={styles.title}>Land Records (Patta / Chitta)</Text>
                <Text style={styles.subtitle}>Verified records for {userName}</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    Note: All documents displayed here are legally verified. For any discrepancy, please use the Grievance Portal.
                </Text>
            </View>

            {landRecords.length === 0 ? (
                <View style={styles.noDataCard}>
                    <Text style={styles.noDataText}>❌ No Land Ownership Records Found for this UID.</Text>
                    <TouchableOpacity 
                        style={styles.noDataBtn}
                        onPress={() => navigation.navigate('Grievance')}
                    >
                        <Text style={styles.btnText}>LODGE DISPUTE / INQUIRY</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <Text style={styles.sectionTitle}>Registered Properties ({landRecords.length})</Text>
                    {landRecords.map((record, index) => (
                        <View key={index} style={styles.recordCard}>
                            <View style={styles.recordHeader}>
                                <Text style={styles.villageText}>{record.village_name}</Text>
                                <Text style={[styles.statusTag, record.status === 'Verified' ? styles.statusVerified : styles.statusDispute]}>
                                    {record.status}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Patta No:</Text>
                                <Text style={styles.detailValue}>{record.patta_number}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Survey No:</Text>
                                <Text style={styles.detailValue}>{record.survey_number}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Area:</Text>
                                <Text style={styles.detailValue}>{record.area_sqft} sq.ft.</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, styles.pattaBtn]} 
                                    onPress={() => handleDocumentAction('Patta Document', record.patta_number)}
                                >
                                    <Text style={styles.actionBtnText}>VIEW PATTA</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.actionBtn, styles.chittaBtn]} 
                                    onPress={() => handleDocumentAction('Chitta Document', record.patta_number)}
                                >
                                    <Text style={styles.actionBtnText}>VIEW CHITTA</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

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

    infoBox: { 
        backgroundColor: 'rgba(255,107,107,0.15)',
        padding: 14,
        borderRadius: 14,
        marginBottom: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255,107,107,0.35)',
    },
    infoText: { fontSize: 13, color: '#E6F1FF', fontWeight: '600', letterSpacing: 0.3 },

    sectionTitle: { fontSize: 17, fontWeight: '900', color: '#E6F1FF', marginBottom: 12, letterSpacing: 0.7, paddingHorizontal: 2 },
    
    // Record Card Styles
    recordCard: { 
        backgroundColor: 'rgba(255,255,255,0.11)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: 'rgba(255,107,107,0.35)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    recordHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottomWidth: 1.5, 
        borderBottomColor: 'rgba(255,107,107,0.25)', 
        paddingBottom: 10, 
        marginBottom: 10 
    },
    villageText: { fontSize: 16, fontWeight: '800', color: '#E6F1FF', letterSpacing: 0.5 },
    
    statusTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    statusVerified: { backgroundColor: 'rgba(46, 227, 187, 0.40)', borderWidth: 1, borderColor: 'rgba(46, 227, 187, 0.60)' },
    statusDispute: { backgroundColor: 'rgba(255, 107, 107, 0.40)', borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.60)' },

    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 2 },
    detailLabel: { fontSize: 13, color: '#D9E2F2', fontWeight: '700', letterSpacing: 0.3 },
    detailValue: { fontSize: 13, fontWeight: '800', color: '#E6F1FF', letterSpacing: 0.5 },

    // Action Buttons
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: 'rgba(255,107,107,0.25)' },
    actionBtn: { padding: 11, borderRadius: 10, flex: 0.48, alignItems: 'center', borderWidth: 1.5 },
    pattaBtn: { backgroundColor: 'rgba(255, 107, 107, 0.35)', borderColor: 'rgba(255, 107, 107, 0.50)' },
    chittaBtn: { backgroundColor: 'rgba(255, 107, 107, 0.32)', borderColor: 'rgba(255, 107, 107, 0.48)' },
    actionBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
    
    // No Data State
    noDataCard: { 
        backgroundColor: 'rgba(255,255,255,0.11)',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(12,21,35,0.50)',
    },
    noDataText: { fontSize: 15, color: '#E6F1FF', marginBottom: 18, fontWeight: '700' },
    noDataBtn: { 
        backgroundColor: 'rgba(255, 107, 107, 0.35)',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 107, 107, 0.50)',
    },
    btnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },

    backBtn: { 
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
    backBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.7 }
});