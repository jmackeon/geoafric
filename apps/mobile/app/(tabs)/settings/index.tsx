import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { confirmDialog } from '@/lib/confirmDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User, Phone, MapPin, Save, LogOut, Trash2, Crown, Mail,
  Check, Bell, Shield, Globe2, ChevronDown, ChevronUp,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { api, tokenStorage } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore, LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface NotifPrefs {
  push_enabled: boolean;
  location_alerts: boolean;
  health_alerts: boolean;
  geofence_alerts: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_on: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  push_enabled: true,
  location_alerts: true,
  health_alerts: true,
  geofence_alerts: true,
  email_enabled: false,
  sms_enabled: false,
  quiet_hours_on: false,
};

// "critical" = safety-related, gets the emerald tinted icon background.
// "passive" = lower-priority/informational, gets a neutral grey tint.
const NOTIF_TOGGLES: { key: keyof NotifPrefs; label: string; sub: string; icon: any; tier: 'critical' | 'passive' }[] = [
  { key: 'push_enabled',     label: 'Push notifications', sub: 'Alerts sent directly to your device',         icon: Bell,    tier: 'critical' },
  { key: 'location_alerts',  label: 'Location alerts',    sub: 'When family members move or change zones',    icon: MapPin,  tier: 'critical' },
  { key: 'health_alerts',    label: 'Health alerts',      sub: 'AI-detected anomalies and safety signals',    icon: Shield,  tier: 'critical' },
  { key: 'geofence_alerts',  label: 'Geofence alerts',    sub: 'Enter and exit zone notifications',            icon: Globe2,  tier: 'critical' },
  { key: 'email_enabled',    label: 'Email notifications', sub: 'Daily and weekly summary emails',             icon: Mail,    tier: 'passive' },
  { key: 'sms_enabled',      label: 'SMS notifications',  sub: 'Important alerts by text message',             icon: Phone,   tier: 'passive' },
  { key: 'quiet_hours_on',   label: 'Quiet hours',        sub: 'Mute non-urgent alerts from 10pm to 7am',      icon: Bell,    tier: 'passive' },
];

function ToggleSwitch({ enabled, onPress }: { enabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleTrack, enabled && styles.toggleTrackOn]}>
      <View style={[styles.toggleThumb, enabled && styles.toggleThumbOn]} />
    </Pressable>
  );
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const { user, setUser, logout } = useAuthStore();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [city, setCity]         = useState('');
  const [language, setLanguage] = useState<Locale>('en');
  const [languageOpen, setLanguageOpen] = useState(false);

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setCity(data.city ?? '');
        setLanguage((data.language as Locale) ?? 'en');
        setUser(data);
      })
      .catch(() => Toast.show({ type: 'error', text1: 'Failed to load profile' }))
      .finally(() => setLoadingProfile(false));

    (async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();
        if (data) setPrefs({ ...DEFAULT_PREFS, ...data });
      } catch { /* keep defaults */ }
      finally { setLoadingPrefs(false); }
    })();
  }, []);

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'G';

  // Each of these marks the form dirty — wired into the field handlers below
  // rather than a blanket useEffect, so the initial profile/prefs fetch
  // (which also calls setFullName etc.) doesn't itself flag unsaved changes.
  const updateFullName = (v: string) => { setFullName(v); setHasUnsavedChanges(true); };
  const updatePhone    = (v: string) => { setPhone(v); setHasUnsavedChanges(true); };
  const updateCity     = (v: string) => { setCity(v); setHasUnsavedChanges(true); };
  const selectLanguage = (code: Locale) => { setLanguage(code); setHasUnsavedChanges(true); };
  const toggle = (key: keyof NotifPrefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    setHasUnsavedChanges(true);
  };

  const toggleLanguageOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLanguageOpen(o => !o);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const [profileResult, prefsResult] = await Promise.allSettled([
      api.patch('/users/profile', {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        language,
      }),
      (async () => {
        const supabase = await getSupabaseClient();
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({ user_id: user?.id, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        if (error) throw error;
      })(),
    ]);
    setIsSaving(false);

    if (profileResult.status === 'fulfilled') setUser(profileResult.value.data);

    const profileFailed = profileResult.status === 'rejected';
    const prefsFailed = prefsResult.status === 'rejected';

    if (!profileFailed && !prefsFailed) {
      setHasUnsavedChanges(false);
      Toast.show({ type: 'success', text1: 'All changes saved!' });
    } else if (profileFailed && prefsFailed) {
      Toast.show({ type: 'error', text1: 'Failed to save changes', text2: 'Both profile and notification settings failed to save.' });
    } else if (profileFailed) {
      Toast.show({ type: 'error', text1: 'Profile changes failed to save', text2: 'Notification preferences were saved.' });
    } else {
      Toast.show({ type: 'error', text1: 'Notification preferences failed to save', text2: 'Profile changes were saved.' });
    }
  };

  const handleLogout = async () => {
    await tokenStorage.setToken(null);
    await tokenStorage.setRefreshToken(null);
    logout();
    router.replace('/auth/login');
  };

  const confirmLogout = () => {
    confirmDialog('Sign out', 'Are you sure you want to sign out?', 'Sign out', handleLogout, true);
  };

  const confirmDelete = () => {
    confirmDialog(
      'Delete account',
      'This will permanently delete all your data and cannot be undone. Contact support to proceed?',
      'Email support',
      () => Toast.show({ type: 'info', text1: 'Email support@geoafric.app to request deletion' }),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg }}>
        {/* Profile card */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={{ color: colors.white, fontFamily: 'Sora-Black', fontSize: 24 }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>{fullName || 'Your Name'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Mail size={12} color={colors.textMuted} />
                <Text style={typography.bodyMuted}>{user?.email}</Text>
              </View>
              <View style={styles.planBadge}>
                <Crown size={12} color={colors.gold} />
                <Text style={[typography.caption, { fontFamily: 'DMSans-Bold' }]}>Free Plan</Text>
              </View>
            </View>
          </View>

          {loadingProfile ? (
            <ActivityIndicator color={colors.green} style={{ marginTop: spacing.xl }} />
          ) : (
            <View style={{ marginTop: spacing.xl }}>
              <Input label="Full name" value={fullName} onChangeText={updateFullName}
                placeholder="Kwame Mensah" icon={<User size={16} color={colors.textMuted} />} />
              <Input label="Phone" value={phone} onChangeText={updatePhone}
                placeholder="+233 24 123 4567" keyboardType="phone-pad"
                icon={<Phone size={16} color={colors.textMuted} />} />
              <Input label="City" value={city} onChangeText={updateCity}
                placeholder="Accra" icon={<MapPin size={16} color={colors.textMuted} />} />
            </View>
          )}

          {/* Language picker — collapsed by default, tap header to expand */}
          <Pressable onPress={toggleLanguageOpen} style={styles.langSectionHeader}>
            <Text style={[typography.caption, { color: colors.text, fontFamily: 'DMSans-Bold' }]}>
              Language — {LOCALE_NAMES[language]}
            </Text>
            {languageOpen
              ? <ChevronUp size={16} color={colors.textMuted} />
              : <ChevronDown size={16} color={colors.textMuted} />}
          </Pressable>
          {languageOpen && (
            <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
              {LOCALES.map((code) => (
                <Pressable key={code} onPress={() => selectLanguage(code)}
                  style={[styles.langRow, language === code && styles.langRowActive]}>
                  <Text style={{ fontSize: 18 }}>{LOCALE_FLAGS[code]}</Text>
                  <Text style={[typography.body, { flex: 1, fontFamily: 'DMSans-Bold' }]}>{LOCALE_NAMES[code]}</Text>
                  {language === code && <Check size={16} color={colors.green} />}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Notification preferences */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Notifications</Text>
          {loadingPrefs ? (
            <ActivityIndicator color={colors.green} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {NOTIF_TOGGLES.map(({ key, label, sub, icon: Icon, tier }) => (
                <View key={key} style={[styles.notifRow, prefs[key] && styles.notifRowOn]}>
                  <View style={[styles.notifIcon, tier === 'critical' ? styles.notifIconCritical : styles.notifIconPassive]}>
                    <Icon size={16} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{label}</Text>
                    <Text style={typography.caption}>{sub}</Text>
                  </View>
                  <ToggleSwitch enabled={prefs[key]} onPress={() => toggle(key)} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sign out */}
        <Pressable style={[styles.card, shadows.sm, styles.actionRow]} onPress={confirmLogout}>
          <View style={[styles.actionIcon, { backgroundColor: colors.surfaceAlt }]}>
            <LogOut size={18} color={colors.text} />
          </View>
          <Text style={[typography.body, { fontFamily: 'DMSans-Bold', flex: 1 }]}>Sign out</Text>
        </Pressable>

        {/* Danger zone */}
        <View style={[styles.dangerCard]}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <View style={styles.dangerIcon}>
              <Trash2 size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontFamily: 'DMSans-Bold', color: colors.danger }]}>Delete account</Text>
              <Text style={[typography.caption, { color: '#EF4444', marginTop: 2 }]}>
                This will permanently delete all your data and cannot be undone.
              </Text>
              <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
                <Text style={[typography.caption, { color: colors.danger, fontFamily: 'DMSans-Bold' }]}>Request deletion</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky save bar — sits above the tab bar, not inline in the scroll */}
      {hasUnsavedChanges && (
        <View style={[styles.saveBar, shadows.lg]}>
          <Button
            label={isSaving ? 'Saving…' : 'Save changes'}
            icon={<Save size={16} color={colors.navy} />}
            onPress={handleSaveAll} loading={isSaving} fullWidth />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64, height: 64, borderRadius: radius.lg,
    backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center',
  },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
  },
  langSectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm,
  },
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
  },
  langRowActive: { borderColor: colors.green, backgroundColor: 'rgba(0,182,122,0.06)' },
  notifRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  notifRowOn: { backgroundColor: 'rgba(0,182,122,0.045)' },
  notifIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIconCritical: { backgroundColor: 'rgba(0,182,122,0.12)' },  // emerald — safety-critical
  notifIconPassive:  { backgroundColor: 'rgba(107,114,128,0.12)' }, // neutral grey — lower priority
  toggleTrack: {
    width: 44, height: 26, borderRadius: radius.full,
    backgroundColor: colors.border, justifyContent: 'center',
  },
  toggleTrackOn: { backgroundColor: colors.green },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.white, marginLeft: 3,
  },
  toggleThumbOn: { marginLeft: 21 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dangerCard: {
    backgroundColor: '#FEF2F2', borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: '#FECACA',
  },
  dangerIcon: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    marginTop: spacing.sm, alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#FECACA',
  },
  saveBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
