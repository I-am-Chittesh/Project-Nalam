import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all your screens
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';

// Jan Setu Screens
import ServiceUpdateScreen from './screens/ServiceUpdateScreen';
import ServiceCreateScreen from './screens/ServiceCreateScreen';

// Dhan Seva Screens
import TaxationAndFilingsScreen from './screens/TaxationAndFilingsScreen';

// Sevai Jannal Screens
import ServiceLandScreen from './screens/ServiceLandScreen';
import GrievancePortalScreen from './screens/GrievancePortalScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        
        {/* Register the Service Screens */}
        <Stack.Screen name="ServiceUpdate" component={ServiceUpdateScreen} />
        <Stack.Screen name="ServiceCreate" component={ServiceCreateScreen} />
        <Stack.Screen name="Taxation" component={TaxationAndFilingsScreen} />
        <Stack.Screen name="LandRecords" component={ServiceLandScreen} />
        <Stack.Screen name="Grievance" component={GrievancePortalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}