import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { User, Mail, Lock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { api, tokenStorage } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function RegisterScreen() {
  const { setUser } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim())   newErrors.fullName = 'Your name is required';
    if (!email.trim())      newErrors.email = 'Email is required';
    if (password.length < 8) newErrors.password = 'At least 8 characters';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        email: email.trim(), password, full_name: fullName.trim(),
      });
      if (data.session) {
        await tokenStorage.setToken(data.session.access_token);
        await tokenStorage.setRefreshToken(data.session.refresh_token);
        setUser(data.user);
        Toast.show({ type: 'success', text1: 'Account created! 🎉' });
        router.replace('/onboarding');
      } else {
        Toast.show({ type: 'success', text1: 'Check your email to confirm', visibilityTime: 5000 });
        router.replace('/auth/login');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message ?? 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[typography.display, { color: colors.white, marginTop: spacing.lg }]}>Join GeoAfric</Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: 4 }]}>
            Family safety. Health monitoring. Together.
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, shadows.lg]}>
            <Input label="Full name" value={fullName} onChangeText={setFullName}
              placeholder="Kofi Mensah" autoCapitalize="words"
              icon={<User size={18} color={colors.textMuted} />} error={errors.fullName} />
            <Input label="Email" value={email} onChangeText={setEmail}
              placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address"
              icon={<Mail size={18} color={colors.textMuted} />} error={errors.email} />
            <Input label="Password" value={password} onChangeText={setPassword}
              placeholder="At least 8 characters" isPassword
              icon={<Lock size={18} color={colors.textMuted} />} error={errors.password} />

            <Text style={[typography.caption, { marginBottom: spacing.lg, color: colors.textMuted, lineHeight: 18 }]}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </Text>

            <Button label="Create account" onPress={handleRegister} loading={loading} fullWidth />
          </View>

          <View style={styles.footerRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <Pressable hitSlop={4}>
                <Text style={[typography.body, { color: colors.gold, fontFamily: 'DMSans-Bold' }]}>Sign in</Text>
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
  },
  logo: { width: 44, height: 44, marginTop: spacing.lg },
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
