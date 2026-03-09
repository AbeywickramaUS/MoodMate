import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import { LocationProvider } from './src/context/LocationContext';
import HomeScreen from './src/screens/HomeScreen';
import MoodInputScreen from './src/screens/MoodInputScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Trend: '📈',
    Profile: '⚙️',
  };

  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <Text style={{ fontSize: 22 }}>{icons[label]}</Text>
      <Text style={{
        fontSize: 11,
        color: focused ? '#A78BFA' : '#64748B',
        marginTop: 3,
        fontWeight: focused ? '600' : '400',
      }}>
        {label === 'Profile' ? 'Profil' : label}
      </Text>
      {focused && (
        <View style={{
          position: 'absolute',
          bottom: -8,
          width: 20,
          height: 2,
          backgroundColor: '#A78BFA',
          borderRadius: 1,
        }} />
      )}
    </View>
  );
}



function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'relative',
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Trend" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LocationProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0F172A' },
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="MoodInput"
              component={MoodInputScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Recommendation"
              component={RecommendationScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </LocationProvider>
    </AppProvider>
  );
}
