// screens/DashboardScreen.js (UPDATED: Now a simple placeholder)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// We don't actually need this screen anymore, but we keep it for reference.
// The App.js file points the 'Dashboard' stack entry to MainTabNavigator now.

export default function DashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>This screen is now a Tab Container!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#888',
    }
});
