import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use SecureStore on native (iOS Keychain / Android EncryptedSharedPreferences),
// AsyncStorage on web (no SecureStore support).
const TOKEN_KEY = 'geoafric_access_token';
const REFRESH_KEY = 'geoafric_refresh_token';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
      return SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setToken(token: string | null): Promise<void> {
    try {
      if (token === null) {
        if (Platform.OS === 'web') await AsyncStorage.removeItem(TOKEN_KEY);
        else await SecureStore.deleteItemAsync(TOKEN_KEY);
        return;
      }
      if (Platform.OS === 'web') await AsyncStorage.setItem(TOKEN_KEY, token);
      else await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Token storage failed:', e);
    }
  },
  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return AsyncStorage.getItem(REFRESH_KEY);
      return SecureStore.getItemAsync(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  async setRefreshToken(token: string | null): Promise<void> {
    try {
      if (token === null) {
        if (Platform.OS === 'web') await AsyncStorage.removeItem(REFRESH_KEY);
        else await SecureStore.deleteItemAsync(REFRESH_KEY);
        return;
      }
      if (Platform.OS === 'web') await AsyncStorage.setItem(REFRESH_KEY, token);
      else await SecureStore.setItemAsync(REFRESH_KEY, token);
    } catch (e) {
      console.warn('Refresh token storage failed:', e);
    }
  },
};
