// Boilerplate for new screens

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TaxationAndFilingsScreen() {
    const screenTitle = "Taxation and Filings"; 
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>--- {screenTitle} ---</Text>
            <Text>Hi hi file</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 20 },
});