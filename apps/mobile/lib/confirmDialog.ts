import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a no-op stub (does nothing, no error,
// no fallback) — see node_modules/react-native-web/.../exports/Alert. Any
// confirm-before-destructive-action flow needs this instead of calling
// Alert.alert directly, or it silently does nothing on web.
export function confirmDialog(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
  destructive = false,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
