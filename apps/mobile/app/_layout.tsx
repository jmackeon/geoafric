import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import 'react-native-url-polyfill/auto';

import '@/lib/api'; // Initialize API client at startup
import { useProtectedRoute } from '@/lib/auth';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Sora-Regular':    require('../assets/fonts/Sora-Regular.ttf'),
    'Sora-Bold':       require('../assets/fonts/Sora-Bold.ttf'),
    //'Sora-ExtraBold':  require('../assets/fonts/Sora-ExtraBold.ttf'),
    //'Sora-Black':      require('../assets/fonts/Sora-Black.ttf'),
    'DMSans-Regular':  require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium':   require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold':     require('../assets/fonts/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Branded gap-filler for the moment between the native/Expo Go splash
  // dismissing and fonts finishing load — this is plain JS rendering, so
  // unlike app.json's splash-screen config it works identically in Expo Go
  // and a real build.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={loadingStyles.container}>
        <Image source={require('../assets/icon.png')} style={loadingStyles.logo} resizeMode="contain" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RouteGate />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RouteGate() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: 120, height: 120 },
});