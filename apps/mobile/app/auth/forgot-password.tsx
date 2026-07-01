import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function ForgotPasswordScreen() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return Toast.show({ type: 'error', text1: 'Enter your email' });
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      Toast.show({ type: 'success', text1: 'Reset link sent', text2: 'Check your inbox' });
    } catch {
      // For privacy, we show success regardless
      setSent(true);
      Toast.show({ type: 'success', text1: 'If that email exists, a link was sent' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
            <ArrowLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={[typography.display, { color: colors.white }]}>Reset password</Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: 4 }]}>
            We'll send a reset link to your email
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, shadows.lg]}>
            {sent ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                <View style={styles.successIcon}>
                  <Mail size={32} color={colors.green} />
                </View>
                <Text style={[typography.h2, { marginTop: spacing.lg, textAlign: 'center' }]}>
                  Check your email
                </Text>
                <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
                  We sent a password reset link to {'\n'}
                  <Text style={{ fontFamily: 'DMSans-Bold' }}>{email}</Text>
                </Text>
                <Button label="Back to sign in" variant="ghost" fullWidth
                  onPress={() => router.replace('/auth/login')}
                  style={{ marginTop: spacing['2xl'] }} />
              </View>
            ) : (
              <>
                <Input label="Email" value={email} onChangeText={setEmail}
                  placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address"
                  icon={<Mail size={18} color={colors.textMuted} />} />
                <Button label="Send reset link" onPress={handleSubmit} loading={loading} fullWidth />
              </>
            )}
          </View>

          {!sent && (
            <View style={styles.footerRow}>
              <Text style={[typography.body, { color: colors.textMuted }]}>Remember your password? </Text>
              <Link href="/auth/login" asChild>
                <Pressable hitSlop={4}>
                  <Text style={[typography.body, { color: colors.gold, fontFamily: 'DMSans-Bold' }]}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          )}
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
    paddingBottom: spacing['3xl'],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    marginTop: -spacing['2xl'],
  },
  successIcon: {
    width: 72, height: 72, borderRadius: radius['2xl'],
    backgroundColor: 'rgba(0,182,122,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
