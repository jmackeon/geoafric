import { Platform } from 'react-native';
import { configureApiClient, getApiClient } from '@geoafric/shared';
import { tokenStorage } from './storage';

// On web (running in a desktop browser on the same machine as the API), always
// use localhost — it never changes. Only native devices (Expo Go on a phone,
// a separate device on the LAN) need the machine's LAN IP from EXPO_PUBLIC_API_URL.
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3001'
  : (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001');

configureApiClient(API_URL, {
  getToken: tokenStorage.getToken,
  setToken: tokenStorage.setToken,
});

export const api = getApiClient();
export { tokenStorage };
