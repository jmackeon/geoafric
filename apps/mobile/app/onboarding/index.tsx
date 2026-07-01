import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Phone, Globe, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AfricaMesh } from '@/components/AfricaMesh';
import { api } from '@/lib/api';
import { useAuthStore, LOCALES, LOCALE_NAMES, LOCALE_FLAGS } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function OnboardingScreen() {
  const { user, setUser } = useAuthStore();
  const [step,     setStep]     = useState<0 | 1 | 2>(0);
  const [phone,    setPhone]    = useState('');
  const [language, setLanguage] = useState<typeof LOCALES[number]>('en');
  const [loading,  setLoading]  = useState(false);

  const finish = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/users/profile', {
        phone:    phone || null,
        language: language,
        onboarded: true,
      });
      setUser(data);
      Toast.show({ type: 'success', text1: 'All set! Welcome to GeoAfric 🎉' });
      router.replace('/(tabs)');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <View style={{ flex: 1 }}>
              {/* Progress dots */}
              <View style={styles.dots}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
                ))}
              </View>
              <Text style={[typography.display, { color: colors.white, marginTop: spacing.lg }]}>
                {step === 0 ? `Hi, ${user?.full_name?.split(' ')[0] ?? 'there'}` : step === 1 ? 'Stay reachable' : 'Your language'}
              </Text>
              <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: 4 }]}>
                {step === 0
                  ? "Let's set up your account in 3 quick steps"
                  : step === 1
                    ? "Add your phone so family can reach you fast"
                    : "Choose your preferred language"}
              </Text>
            </View>
            <View style={styles.meshWrap}>
              <AfricaMesh width={120} height={130} opacity={0.18} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, shadows.lg]}>
            {step === 0 && (
              <>
                <Text style={[typography.h2, { marginBottom: spacing.lg }]}>You're almost ready</Text>
                {[
                  { icon: '📱', title: 'Family safety', sub: 'Live location & geofence alerts' },
                  { icon: '❤️', title: 'Health monitoring', sub: 'AI-powered wellness insights' },
                  { icon: '🌍', title: 'Built for Africa', sub: '8 languages, mobile-first' },
                ].map(f => (
                  <View key={f.title} style={styles.featureRow}>
                    <Text style={{ fontSize: 24 }}>{f.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.h3, { marginBottom: 2 }]}>{f.title}</Text>
                      <Text style={typography.bodyMuted}>{f.sub}</Text>
                    </View>
                  </View>
                ))}
                <Button label="Continue" onPress={() => setStep(1)} fullWidth style={{ marginTop: spacing.lg }} />
              </>
            )}

            {step === 1 && (
              <>
                <Input label="Phone number" value={phone} onChangeText={setPhone}
                  placeholder="+233 24 123 4567" keyboardType="phone-pad"
                  icon={<Phone size={18} color={colors.textMuted} />} />
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button label="Skip"     variant="ghost" onPress={() => setStep(2)}  style={{ flex: 1 }} />
                  <Button label="Continue" onPress={() => setStep(2)} style={{ flex: 2 }} />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={[typography.caption, { marginBottom: spacing.sm }]}>SELECT LANGUAGE</Text>
                <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                  {LOCALES.map(code => (
                    <Pressable key={code} onPress={() => setLanguage(code)}
                      style={[styles.langRow, language === code && styles.langRowActive]}>
                      <Text style={{ fontSize: 20 }}>{LOCALE_FLAGS[code]}</Text>
                      <Text style={[typography.body, { flex: 1, fontFamily: 'DMSans-Bold' }]}>{LOCALE_NAMES[code]}</Text>
                      {language === code && <Check size={18} color={colors.green} />}
                    </Pressable>
                  ))}
                </View>
                <Button label="Get started" onPress={finish} loading={loading} fullWidth />
              </>
            )}
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
  headerInner: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: spacing.lg },
  meshWrap: { position: 'absolute', right: -10, bottom: -30 },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot:       { width: 28, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: colors.gold, width: 40 },
  dotDone:   { backgroundColor: colors.green },
  scrollContent: {
    flexGrow: 1, paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl, paddingBottom: spacing['3xl'],
  },
  card: {
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing['2xl'], marginTop: -spacing['2xl'],
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.lg, marginBottom: spacing.lg,
    padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt,
  },
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, padding: spacing.md,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
  },
  langRowActive: { borderColor: colors.green, backgroundColor: 'rgba(0,182,122,0.06)' },
});
