import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Modal, ScrollView } from 'react-native';

export default function DashboardScreen({ navigation }) {
    // State for the live clock
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [compactMode, setCompactMode] = useState(false);
    const [showNotices, setShowNotices] = useState(false);

    // Effect to update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Helper to format date nicely (e.g., "14 Dec 2025 | 10:48 PM")
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const handleRefreshTime = () => setCurrentTime(new Date());

    const noticeItems = [
        { id: '1', title: 'PM Suraksha Bima – new premium window', tag: 'Finance' },
        { id: '2', title: 'Solar Rooftop subsidy (Phase III)', tag: 'Energy' },
        { id: '3', title: 'Skill uplift grants for MSMEs', tag: 'Employment' },
    ];

    return (
        <ImageBackground
            source={require('../assets/bg.png')}
            style={styles.bgImage}
            blurRadius={26}
        >
            <View style={styles.scrim}>
                {/* Header Section (Updated for Left/Right split) */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>PROJECT NALAM</Text>
                        <Text style={styles.headerSubtitle}>Select your service department</Text>
                    </View>
                    
                    <View style={styles.headerRight}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
                    </View>
                </View>

                {/* Status pills */}
                <View style={styles.statusRow}>
                    <View style={[styles.statusPill, styles.statusPillPositive]}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Systems online</Text>
                    </View>
                    <View style={[styles.statusPill, styles.statusPillInfo]}>
                        <View style={styles.statusDotInfo} />
                        <Text style={styles.statusText}>Auto-sync enabled</Text>
                    </View>
                </View>

                {/* Utility glance cards */}
                <View style={styles.utilityRow}>
                    <View style={[styles.infoCard, styles.infoCardPrimary]}>
                        <Text style={styles.infoLabel}>Active Requests</Text>
                        <Text style={styles.infoValue}>12</Text>
                    </View>
                    <View style={[styles.infoCard, styles.infoCardWarning]}>
                        <Text style={styles.infoLabel}>Pending Approvals</Text>
                        <Text style={styles.infoValue}>4</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.infoCard, styles.infoCardAccent]}
                        activeOpacity={0.86}
                        onPress={() => setShowNotices(true)}
                    >
                        <Text style={styles.infoLabel}>New Notices</Text>
                        <Text style={styles.infoValue}>2</Text>
                        <Text style={styles.infoHint}>Tap to view</Text>
                    </TouchableOpacity>
                </View>

                {/* Focus callout */}
                <View style={styles.focusCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.focusTitle}>Today’s focus</Text>
                        <Text style={styles.focusBody}>Reconcile tax filings and close pending approvals before 6 PM.</Text>
                    </View>
                    <TouchableOpacity style={styles.focusButton} activeOpacity={0.86} onPress={() => navigation.navigate('Taxation')}>
                        <Text style={styles.focusButtonText}>Open workspace</Text>
                    </TouchableOpacity>
                </View>

                {/* Interactive control bar */}
                <View style={styles.controlsRow}>
                    <View style={styles.searchWrapper}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            placeholder="Search services"
                            placeholderTextColor="#C7D1E0"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.primaryControlButton]}
                        activeOpacity={0.86}
                        onPress={() => setCompactMode(!compactMode)}
                    >
                        <Text style={styles.controlButtonText}>{compactMode ? 'Expanded view' : 'Compact view'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.ghostControlButton]}
                        activeOpacity={0.86}
                        onPress={handleRefreshTime}
                    >
                        <Text style={styles.controlButtonText}>Refresh clock</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content: 3 Vertical Columns */}
                <View style={styles.columnsContainer}>
                    
                    {/* --- COLUMN 1: JAN SETU (Left) --- */}
                    <View style={[styles.column, styles.colJanSetu]}>
                        <View style={styles.colHeader}>
                            <Text style={styles.colTitle}>JAN SETU</Text>
                            <Text style={styles.colDesc}>Public Services</Text>
                        </View>
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.verticalBtn, compactMode && styles.verticalBtnCompact]} 
                                activeOpacity={0.86}
                                onPress={() => navigation.navigate('ServiceUpdate')}
                            >
                                <Text style={styles.btnText}>Update Documents</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.verticalBtn, compactMode && styles.verticalBtnCompact]} 
                                activeOpacity={0.86}
                                onPress={() => navigation.navigate('ServiceCreate')}
                            >
                                <Text style={styles.btnText}>Create New Service</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- COLUMN 2: DHAN SEVA (Middle) --- */}
                    <View style={[styles.column, styles.colDhanSeva]}>
                        <View style={styles.colHeader}>
                            <Text style={styles.colTitle}>DHAN SEVA</Text>
                            <Text style={styles.colDesc}>Finance & Tax</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.verticalBtn, compactMode && styles.verticalBtnCompact]} 
                                activeOpacity={0.86}
                                onPress={() => navigation.navigate('Taxation')}
                            >
                                <Text style={styles.btnText}>Taxation & Filings</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- COLUMN 3: SEVAI JANNAL (Right) --- */}
                    <View style={[styles.column, styles.colSevaiJannal]}>
                        <View style={styles.colHeader}>
                            <Text style={styles.colTitle}>SEVAI JANNAL</Text>
                            <Text style={styles.colDesc}>Grievance & Land</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.verticalBtn, compactMode && styles.verticalBtnCompact]} 
                                activeOpacity={0.86}
                                onPress={() => navigation.navigate('LandRecords')}
                            >
                                <Text style={styles.btnText}>Land Records</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.verticalBtn, compactMode && styles.verticalBtnCompact]} 
                                activeOpacity={0.86}
                                onPress={() => navigation.navigate('Grievance')}
                            >
                                <Text style={styles.btnText}>Grievance Portal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                {/* Notices modal */}
                <Modal
                    visible={showNotices}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowNotices(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Schemes & Notices</Text>
                                <TouchableOpacity onPress={() => setShowNotices(false)}>
                                    <Text style={styles.modalClose}>Close</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalBody}>
                                {noticeItems.map((item) => (
                                    <View key={item.id} style={styles.modalItem}>
                                        <Text style={styles.modalItemTitle}>{item.title}</Text>
                                        <Text style={styles.modalItemMeta}>{item.tag}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                style={styles.modalPrimary}
                                activeOpacity={0.86}
                                onPress={() => setShowNotices(false)}
                            >
                                <Text style={styles.modalPrimaryText}>Great, got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: { flex: 1 },
    scrim: { flex: 1, backgroundColor: 'rgba(6, 16, 30, 0.30)' },
    
    // Header Styles (Updated)
    header: {
        height: 82,
        flexDirection: 'row', // Splits left and right
        justifyContent: 'space-between', // Pushes them apart
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderBottomWidth: 1,
        borderColor: 'rgba(12,21,35,0.42)',
        elevation: 2,
        paddingHorizontal: 22, // Adds space from edges
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    headerLeft: {
        justifyContent: 'center',
    },
    headerRight: {
        justifyContent: 'center',
        alignItems: 'flex-end', // Aligns text to the right
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#F0F4FF', letterSpacing: 1 },
    headerSubtitle: { fontSize: 14, color: '#D8DEEA' },
    
    // Status pills
    statusRow: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 16,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 11,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(12,21,35,0.45)',
    },
    statusPillPositive: { backgroundColor: 'rgba(46, 227, 187, 0.28)', borderColor: 'rgba(46, 227, 187, 0.5)' },
    statusPillInfo: { backgroundColor: 'rgba(99, 149, 255, 0.28)', borderColor: 'rgba(99, 149, 255, 0.5)' },
    statusText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.3 },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ee3bb',
        marginRight: 8,
    },
    statusDotInfo: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6395ff',
        marginRight: 8,
    },

    // Utility cards
    utilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        marginHorizontal: 14,
    },
    infoCard: {
        flex: 1,
        padding: 12,
        marginHorizontal: 5,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 6,
    },
    infoLabel: { color: '#D9E2F2', fontSize: 12, letterSpacing: 0.4 },
    infoValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
    infoHint: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 4, letterSpacing: 0.3 },
    infoCardPrimary: { backgroundColor: 'rgba(46, 227, 187, 0.18)', borderColor: 'rgba(46, 227, 187, 0.45)' },
    infoCardWarning: { backgroundColor: 'rgba(255, 193, 7, 0.18)', borderColor: 'rgba(255, 193, 7, 0.42)' },
    infoCardAccent: { backgroundColor: 'rgba(99, 149, 255, 0.18)', borderColor: 'rgba(99, 149, 255, 0.42)' },

    // Focus callout
    focusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginHorizontal: 14,
        padding: 13,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.11)',
        borderWidth: 1,
        borderColor: 'rgba(12,21,35,0.42)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
    },
    focusTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    focusBody: { color: '#D9E2F2', fontSize: 13, lineHeight: 18 },
    focusButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 149, 255, 0.26)',
        borderWidth: 1,
        borderColor: 'rgba(99, 149, 255, 0.48)',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
    },
    focusButtonText: { color: '#FFFFFF', fontWeight: '800' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
    },
    modalCard: {
        width: '92%',
        maxWidth: 420,
        backgroundColor: 'rgba(18, 26, 40, 0.80)',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    modalClose: { color: '#9FB4D7', fontWeight: '700' },
    modalBody: { maxHeight: 320, marginTop: 6 },
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    modalItemTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    modalItemMeta: { color: '#9FB4D7', fontSize: 12, marginTop: 2 },
    modalPrimary: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 149, 255, 0.9)',
        alignItems: 'center',
    },
    modalPrimaryText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.4 },

    // Interactive controls
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        marginHorizontal: 16,
    },
    searchWrapper: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
    },
    searchInput: {
        height: 42,
        color: '#FFFFFF',
        fontSize: 14,
    },
    controlButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    primaryControlButton: {
        backgroundColor: 'rgba(99, 149, 255, 0.26)',
        borderColor: 'rgba(99, 149, 255, 0.55)',
    },
    ghostControlButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    controlButtonText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.4 },

    // Clock Styles
    timeText: { fontSize: 24, fontWeight: 'bold', color: '#E6F1FF' },
    dateText: { fontSize: 14, color: '#C2C9D6', marginTop: 2 },

    // The Grid Container
    columnsContainer: {
        flex: 1,
        flexDirection: 'row', 
        padding: 12,
    },

    // Column Styles
    column: {
        flex: 1, 
        margin: 5,
        borderRadius: 16,
        padding: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.13)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderTopWidth: 3,
        borderTopColor: 'transparent',
    },

    // Colors
    colJanSetu: { backgroundColor: 'rgba(14, 131, 119, 0.32)', borderColor: 'rgba(46, 227, 187, 0.32)', shadowColor: '#2ee3bb', borderTopColor: '#2ee3bb' },   
    colDhanSeva: { backgroundColor: 'rgba(255, 172, 94, 0.30)', borderColor: 'rgba(255, 172, 94, 0.34)', shadowColor: '#ffac5e', borderTopColor: '#ffac5e' },   
    colSevaiJannal: { backgroundColor: 'rgba(255, 107, 107, 0.28)', borderColor: 'rgba(255, 107, 107, 0.34)', shadowColor: '#ff6b6b', borderTopColor: '#ff6b6b' }, 

    // Text inside Columns
    colHeader: { alignItems: 'center', marginTop: 20 },
    colTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    colDesc: { fontSize: 14, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', marginTop: 5, letterSpacing: 1 },

    // Buttons
    buttonContainer: { marginBottom: 40, width: '100%' },
    verticalBtn: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        padding: 20,
        borderRadius: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.26)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
    },
    verticalBtnCompact: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});