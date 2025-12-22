import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Text } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ImageBackground 
                source={require('../assets/bg.png')} 
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Main touchable area */}
                <TouchableOpacity 
                    style={styles.touchArea} 
                    onPress={() => navigation.navigate('Dashboard')}
                    activeOpacity={0.8} 
                />

                {/* AI Mode Button */}
                <TouchableOpacity
                    style={styles.aiButton}
                    onPress={() => navigation.navigate('AIInteractive')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.aiButtonText}>AI Mode</Text>
                </TouchableOpacity>

                {/* RFID Mode Button */}
                <TouchableOpacity
                    style={styles.rfidButton}
                    onPress={() => navigation.navigate('RFIDStandby')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.rfidButtonText}>📱 Tap In</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    touchArea: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    aiButton: {
        position: 'absolute',
        right: 20,
        bottom: 32,
        backgroundColor: 'rgba(46, 227, 187, 0.85)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2ee3bb',
        elevation: 10,
        shadowColor: '#2ee3bb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    aiButtonText: {
        color: '#04101f',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 0.6,
    },
    rfidButton: {
        position: 'absolute',
        left: 20,
        bottom: 32,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#6366f1',
        elevation: 10,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    rfidButtonText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 0.6,
    }
});
