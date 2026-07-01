import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  CreditCard, Settings as SettingsIcon, ChevronRight, Crown, Mail,
  Hotel, Megaphone, Building2, Truck, Zap,
} from 'lucide-react-native';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

const ACCOUNT_ITEMS = [
  { label: 'Billing',  sub: 'Plans, payments & history',      icon: CreditCard,   color: colors.green, bg: 'rgba(0,182,122,0.12)', to: '/(tabs)/billing' },
  { label: 'Settings', sub: 'Profile, account & preferences',  icon: SettingsIcon, color: colors.navy,  bg: 'rgba(13,27,61,0.08)',  to: '/(tabs)/settings' },
] as const;

// B2B / vertical service modules. All are placeholders for now — no backend
// modules exist yet, so they just show a "Coming soon" badge.
//
// TODO: Once a user has a registered SolarTrack device (GET /solartrack/devices
// returns at least one), promote SolarTrack out of here into a top-level tab
// (see the TODO in (tabs)/_layout.tsx) instead of nesting it under Services.
const SERVICE_ITEMS = [
  { label: 'Hospitality', sub: 'Guest safety & property monitoring', icon: Hotel,      color: '#D97706', bg: 'rgba(217,119,6,0.12)',  to: '/(tabs)/solar' },
  { label: 'Reach',       sub: 'Community alerts & outreach',        icon: Megaphone,  color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', to: '/(tabs)/solar' },
  { label: 'Enterprise',  sub: 'Fleet & workforce safety',           icon: Building2,  color: colors.navy, bg: 'rgba(13,27,61,0.08)',  to: '/(tabs)/solar' },
  { label: 'Logistics',   sub: 'Shipment & delivery tracking',       icon: Truck,      color: '#0891B2', bg: 'rgba(8,145,178,0.12)',  to: '/(tabs)/solar' },
  { label: 'SolarTrack',  sub: 'Smart solar monitoring',             icon: Zap,        color: colors.gold, bg: 'rgba(245,166,35,0.12)', to: '/(tabs)/solar' },
] as const;

function SectionHeader({ label }: { label: string }) {
  return <Text style={[typography.overline, { color: colors.textLight, marginBottom: spacing.sm, marginTop: spacing.lg }]}>{label}</Text>;
}

function MenuRow({ label, sub, icon: Icon, color, bg, to }: {
  label: string; sub: string; icon: any; color: string; bg: string; to: string;
}) {
  return (
    <Pressable onPress={() => router.push(to as any)} style={[styles.row, shadows.sm]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{label}</Text>
        <Text style={typography.bodyMuted}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={colors.textLight} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const { user } = useAuthStore();

  const initials = useMemo(() => user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'G', [user]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'] }}>
        {/* Profile summary */}
        <View style={[styles.profileCard, shadows.sm]}>
          <View style={styles.avatar}>
            <Text style={{ color: colors.white, fontFamily: 'Sora-ExtraBold', fontSize: 22 }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>{user?.full_name ?? 'Your Name'}</Text>
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

        <SectionHeader label="Account" />
        <View style={{ gap: spacing.md }}>
          {ACCOUNT_ITEMS.map((item) => (
            <Pressable key={item.label} onPress={() => router.push(item.to as any)} style={[styles.row, shadows.sm]}>
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{item.label}</Text>
                <Text style={typography.bodyMuted}>{item.sub}</Text>
              </View>
              <ChevronRight size={18} color={colors.textLight} />
            </Pressable>
          ))}
        </View>

        <SectionHeader label="Services" />
        <View style={{ gap: spacing.md }}>
          {SERVICE_ITEMS.map((item) => <MenuRow key={item.label} {...item} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center',
  },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
});
