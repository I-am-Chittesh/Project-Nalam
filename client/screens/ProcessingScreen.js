import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function ProcessingScreen({ navigation }) {
  
  // This simulates the "Fetching Data" phase
  useEffect(() => {
    setTimeout(() => {
      // Logic: Once data is found, go to Dashboard
      navigation.replace('Dashboard'); 
    }, 2000); // Fakes a 2-second load time
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Verifying ID...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 18 }
});
