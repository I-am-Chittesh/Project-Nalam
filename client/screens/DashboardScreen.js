import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen({ navigation }) {
    // State for the live clock
    const [currentTime, setCurrentTime] = useState(new Date());

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

    return (
        <View style={styles.container}>
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
                            style={styles.verticalBtn} 
                            onPress={() => navigation.navigate('ServiceUpdate')}
                        >
                            <Text style={styles.btnText}>Update Documents</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.verticalBtn} 
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
                            style={styles.verticalBtn} 
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
                            style={styles.verticalBtn} 
                            onPress={() => navigation.navigate('LandRecords')}
                        >
                            <Text style={styles.btnText}>Land Records</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.verticalBtn} 
                            onPress={() => navigation.navigate('Grievance')}
                        >
                            <Text style={styles.btnText}>Grievance Portal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    
    // Header Styles (Updated)
    header: {
        height: 90,
        flexDirection: 'row', // Splits left and right
        justifyContent: 'space-between', // Pushes them apart
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
        paddingHorizontal: 30, // Adds space from edges
    },
    headerLeft: {
        justifyContent: 'center',
    },
    headerRight: {
        justifyContent: 'center',
        alignItems: 'flex-end', // Aligns text to the right
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#003366', letterSpacing: 1 },
    headerSubtitle: { fontSize: 14, color: '#888' },
    
    // Clock Styles
    timeText: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
    dateText: { fontSize: 14, color: '#666', marginTop: 2 },

    // The Grid Container
    columnsContainer: {
        flex: 1,
        flexDirection: 'row', 
        padding: 10,
    },

    // Column Styles
    column: {
        flex: 1, 
        margin: 5,
        borderRadius: 15,
        padding: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        justifyContent: 'space-between',
    },

    // Colors
    colJanSetu: { backgroundColor: '#00695C' },   
    colDhanSeva: { backgroundColor: '#EF6C00' },   
    colSevaiJannal: { backgroundColor: '#C62828' }, 

    // Text inside Columns
    colHeader: { alignItems: 'center', marginTop: 20 },
    colTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    colDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', marginTop: 5 },

    // Buttons
    buttonContainer: { marginBottom: 40, width: '100%' },
    verticalBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 20,
        borderRadius: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
    },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});