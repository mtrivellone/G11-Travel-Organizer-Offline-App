import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TripsListScreen } from '../screens/TripsListScreen';     // P1
import { TripDetailScreen } from '../screens/TripDetailScreen';   // P1
import { TimelineScreen } from '../screens/TimelineScreen';       // P5
import { StatsScreen } from '../screens/StatsScreen';             // P4
import { theme } from '../theme/theme';
import { PlaneIcon, ChartIcon } from '../components/TabIcons';

export type TripsStackParams = {
  TripsList: undefined;
  TripDetail: { tripId: string };
  Timeline: { tripId: string };
};

const Stack = createNativeStackNavigator<TripsStackParams>();
const Tab = createBottomTabNavigator();

function TripsStack() {
  return (
    <Stack.Navigator> 
      <Stack.Screen name="TripsList" component={TripsListScreen} options={{ title: 'I tuoi viaggi' }} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Viaggi" // NUOVO — vedi punto 2
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
        }}
      >
        <Tab.Screen
          name="Viaggi"
          component={TripsStack}
          options={{ tabBarIcon: ({ color }) => <PlaneIcon color={color} /> }}
        />
        <Tab.Screen
          name="Statistiche"
          component={StatsScreen}
          options={{ tabBarIcon: ({ color }) => <ChartIcon color={color} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}