import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hi There</Text>
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
        fontSize: 50,
        fontWeight: 'bold',
        color: '#333333',
    }
});