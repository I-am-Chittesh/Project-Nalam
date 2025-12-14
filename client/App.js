// App.js (Full Code)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// --- SERVICE SCREEN IMPORTS ---
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen'; 

// Jan Setu Screens
import ServiceUpdateScreen from './screens/ServiceUpdateScreen';
import ServiceCreateScreen from './screens/ServiceCreateScreen'; // NEW

// Dhan Seva Screens
import TaxationAndFilingsScreen from './screens/TaxationAndFilingsScreen'; // NEW

// Sevai Jannal Screens
import ServiceLandScreen from './screens/ServiceLandScreen';
import GrievancePortalScreen from './screens/GrievancePortalScreen'; // NEW (was ServiceGrievanceScreen)

// --- NAVIGATORS ---
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ------------------------------------------
// STEP 1: Define the STACKS within each TAB (The contents)
// ------------------------------------------

// 1A. JAN SETU: Houses Update and Create screens
function JanSetuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceUpdate" component={ServiceUpdateScreen} />
      <Stack.Screen name="ServiceCreate" component={ServiceCreateScreen} />
    </Stack.Navigator>
  );
}

// 1B. DHAN SEVA: Houses Taxation screen
function DhanSevaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaxationMain" component={TaxationAndFilingsScreen} />
    </Stack.Navigator>
  );
}

// 1C. SEVAI JANNAL: Houses Land and Grievance screens
function SevaiJannalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LandRecords" component={ServiceLandScreen} />
      <Stack.Screen name="GrievancePortal" component={GrievancePortalScreen} />
    </Stack.Navigator>
  );
}

// ------------------------------------------
// STEP 2: Define the TAB Navigator (The 3 main buttons)
// ------------------------------------------
function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#003366', tabBarInactiveTintColor: 'gray' }}>
      <Tab.Screen 
        name="Jan Setu" 
        component={JanSetuStack}
        options={{ tabBarLabel: ({ color }) => (<Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>Jan Setu</Text>) }} 
      />
      <Tab.Screen 
        name="Dhan Seva" 
        component={DhanSevaStack}
        options={{ tabBarLabel: ({ color }) => (<Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>Dhan Seva</Text>) }}
      />
      <Tab.Screen 
        name="Sevai Jannal" 
        component={SevaiJannalStack}
        options={{ tabBarLabel: ({ color }) => (<Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>Sevai Jannal</Text>) }} 
      />
    </Tab.Navigator>
  );
}

// ------------------------------------------
// STEP 3: Define the ROOT Navigator (Home -> Dashboard)
// ------------------------------------------
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Home Screen is the entry point */}
        <Stack.Screen name="Home" component={HomeScreen} />
        
        {/* Dashboard now hosts the Tab Navigator */}
        <Stack.Screen name="Dashboard" component={MainTabNavigator} />
        
        {/* We keep the old schemes screen outside the main tab navigator for simplicity */}
        <Stack.Screen name="Schemes" component={ServiceSchemesScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}