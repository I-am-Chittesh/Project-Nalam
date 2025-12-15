import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ImageBackground 
                source={require('../assets/bg.png')} 
                style={styles.backgroundImage}
                resizeMode="cover" // This makes the image fill the screen nicely
            >
                {/* We keep the TouchableOpacity filling the whole screen 
                   so the user can tap anywhere to start, but it has NO text.
                */}
                <TouchableOpacity 
                    style={styles.touchArea} 
                    onPress={() => navigation.navigate('Dashboard')}
                    activeOpacity={0.8} 
                />
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
        // No background color, no text alignment needed
    }
});