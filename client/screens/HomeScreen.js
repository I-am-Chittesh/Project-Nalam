// screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// CRITICAL FIX: The component MUST receive the 'navigation' prop
export default function HomeScreen({ navigation }) { 
    return (
        <TouchableOpacity 
            style={styles.container} 
            // The onPress function calls navigation.navigate('Dashboard')
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={1} 
        >
            <Text style={styles.title}>NALAM PROJECT</Text>
            <Text style={styles.hint}>(Tap anywhere to start)</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    hint: {
        marginTop: 20,
        color: '#CCCCCC',
        fontSize: 14,
    }
});