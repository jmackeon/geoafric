import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const ACTIVE_COLOR   = '#00B67A'; // Emerald
const INACTIVE_COLOR = '#6B7280'; // Grey

// TODO: Show a SolarTrack tab here (top-level, between Discover and Account)
// only when the signed-in user has at least one registered SolarTrack device
// (GET /solartrack/devices). Until then it's reachable from Account > Services.

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor:   ACTIVE_COLOR,
      tabBarInactiveTintColor: INACTIVE_COLOR,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarItemStyle: { paddingTop: 6 },
    }}>
      <Tabs.Screen name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) =>
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }} />
      {/*
        Each of these lives in its own folder with no nested _layout.tsx, so
        Expo Router's actual route key is "<folder>/index", not "<folder>" —
        the `name` here must match that exactly or this config is silently
        ignored and Expo Router falls back to an auto-generated tab (which is
        what caused the "family/index"-style labels and the extra tabs).
      */}
      <Tabs.Screen name="family/index"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, focused, size }) =>
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />,
        }} />
      <Tabs.Screen name="health/index"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, focused, size }) =>
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />,
        }} />
      <Tabs.Screen name="discover/index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused, size }) =>
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />,
        }} />
      <Tabs.Screen name="account/index"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused, size }) =>
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />,
        }} />
      {/* Hidden from the tab bar — reachable as routes (e.g. via the Account hub) */}
      <Tabs.Screen name="location/index" options={{ href: null }} />
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="solar/index"    options={{ href: null }} />
      <Tabs.Screen name="billing/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#080F20', // Deep Navy
    borderTopWidth: 1,
    borderTopColor: '#1a2744',
    height: 64,
  },
  tabBarLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
  },
});
