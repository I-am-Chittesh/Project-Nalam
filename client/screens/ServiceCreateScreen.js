import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ServiceCreateScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Service</Text>
            <Text style={styles.subtitle}>(Jan Setu Module)</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.btnText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F2F1' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#00695C' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20 },
    backBtn: { backgroundColor: '#00695C', padding: 10, borderRadius: 5 },
    btnText: { color: 'white' }
});