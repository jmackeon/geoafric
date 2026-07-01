import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AfricaMesh } from '@/components/AfricaMesh';
import { api, tokenStorage } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function LoginScreen() {
  const { setUser } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    setErrors({});
    if (!email.trim())    return setErrors({ email: 'Email is required' });
    if (!password)        return setErrors({ password: 'Password is required' });

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      await tokenStorage.setToken(data.access_token);
      await tokenStorage.setRefreshToken(data.refresh_token);
      setUser(data.user);
      Toast.show({ type: 'success', text1: 'Welcome back!' });
      router.replace(data.user.onboarded ? '/(tabs)' : '/onboarding');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Login failed. Check your credentials.';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      {/* Brand header */}
      <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <View style={{ flex: 1 }}>
              <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
              <Text style={[typography.display, { color: colors.white, marginTop: spacing.lg }]}>Welcome</Text>
              <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: 4 }]}>
                Sign in to your GeoAfric account
              </Text>
            </View>
            <View style={styles.meshWrap}>
              <AfricaMesh width={140} height={150} opacity={0.18} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, shadows.lg]}>
            <Input label="Email" value={email} onChangeText={setEmail}
              placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address"
              icon={<Mail size={18} color={colors.textMuted} />} error={errors.email} />
            <Input label="Password" value={password} onChangeText={setPassword}
              placeholder="••••••••" isPassword
              icon={<Lock size={18} color={colors.textMuted} />} error={errors.password} />

            <Link href="/auth/forgot-password" asChild>
              <Pressable style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
                <Text style={[typography.caption, { color: colors.green, fontFamily: 'DMSans-Bold' }]}>
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            <Button label="Sign in" onPress={handleLogin} loading={loading} fullWidth />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={[typography.caption, { paddingHorizontal: spacing.md }]}>or</Text>
              <View style={styles.divider} />
            </View>

            <Button label="Continue with Google" variant="ghost" fullWidth
              onPress={() => Toast.show({ type: 'info', text1: 'Google sign-in coming soon' })} />
          </View>

          <View style={styles.footerRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>New to GeoAfric? </Text>
            <Link href="/auth/register" asChild>
              <Pressable hitSlop={4}>
                <Text style={[typography.body, { color: colors.gold, fontFamily: 'DMSans-Bold' }]}>
                  Create account
                </Text>
              </Pressable>
            </Link>
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
    overflow: 'hidden',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing.lg,
  },
  logo: { width: 44, height: 44 },
  meshWrap: { position: 'absolute', right: -10, bottom: -30, opacity: 0.9 },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
