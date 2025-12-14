import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TaxationAndFilingsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Taxation & Filings</Text>
            <Text style={styles.subtitle}>(Dhan Seva Module)</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.btnText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#EF6C00' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20 },
    backBtn: { backgroundColor: '#EF6C00', padding: 10, borderRadius: 5 },
    btnText: { color: 'white' }
});