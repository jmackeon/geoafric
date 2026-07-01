import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8)   return Toast.show({ type: 'error', text1: 'Password must be 8+ chars' });
    if (password !== confirm)  return Toast.show({ type: 'error', text1: 'Passwords don\'t match' });
    if (!token)                return Toast.show({ type: 'error', text1: 'Invalid reset link' });

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      Toast.show({ type: 'success', text1: 'Password reset!' });
      router.replace('/auth/login');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={[typography.display, { color: colors.white, marginTop: spacing.lg }]}>New password</Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: 4 }]}>
            Create a strong new password
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, shadows.lg]}>
            <Input label="New password" value={password} onChangeText={setPassword}
              placeholder="At least 8 characters" isPassword
              icon={<Lock size={18} color={colors.textMuted} />} />
            <Input label="Confirm password" value={confirm} onChangeText={setConfirm}
              placeholder="Re-enter password" isPassword
              icon={<Lock size={18} color={colors.textMuted} />} />
            <Button label="Set new password" onPress={handleSubmit} loading={loading} fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    marginTop: -spacing['2xl'],
  },
});
