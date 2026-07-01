import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import {
  MapPin, Heart, Compass, Users, Plus, ArrowUpRight,
  TrendingUp, Bell, Settings as SettingsIcon, Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AfricaMesh } from '@/components/AfricaMesh';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/health/insights')
      .then(({ data }) => setUnreadCount((data ?? []).filter((i: any) => !i.read).length))
      .catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const initials  = useMemo(() => user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'G', [user]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const STATS = [
    { label: 'Family',    value: '—', icon: Users,   color: colors.gold,  bg: 'rgba(245,166,35,0.12)' },
    { label: 'Locations', value: '—', icon: MapPin,  color: colors.teal,  bg: 'rgba(0,230,210,0.12)' },
    { label: 'Health',    value: '—', icon: Heart,   color: colors.danger,bg: 'rgba(239,68,68,0.10)' },
    { label: 'Places',    value: '—', icon: Compass, color: colors.green, bg: 'rgba(0,182,122,0.12)' },
  ];

  const ACTIONS = [
    { label: 'Family Map',    icon: MapPin,  to: '/(tabs)/location', color: colors.teal },
    { label: 'Health Monitor', icon: Heart,   to: '/(tabs)/health',   color: colors.danger },
    { label: 'Discover',      icon: Compass, to: '/(tabs)/discover', color: colors.green },
    { label: 'Invite Family', icon: Users,   to: '/(tabs)/family',   color: colors.gold },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top app bar */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textLight }]}>GeoAfric</Text>
            <Text style={[typography.h2, { marginTop: 2 }]}>Home</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <Pressable style={styles.bellBtn} onPress={() => router.push('/notifications')}>
              <Bell size={20} color={colors.textMuted} />
              {unreadCount > 0 && <View style={styles.bellDot} />}
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/account' as any)}>
              <LinearGradient colors={[colors.gold, colors.green]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.avatar}>
                {user?.avatar_url
                  ? <Image source={{ uri: user.avatar_url }} style={{ width: 36, height: 36 }} />
                  : <Text style={[typography.button, { color: colors.navy, fontSize: 13 }]}>{initials}</Text>}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'] }}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={[colors.navy, colors.blue, '#062F2A']} style={styles.heroBg}>
            <View style={[styles.heroAccent, { backgroundColor: colors.gold }]} />
            <View style={[styles.heroAccent, { backgroundColor: colors.green, left: 60 }]} />
            <View style={[styles.heroAccent, { backgroundColor: colors.teal,  left: 120 }]} />

            <View style={styles.meshAbs}>
              <AfricaMesh width={140} height={150} opacity={0.18} />
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={[typography.overline, { color: 'rgba(255,255,255,0.85)' }]}>
                PLATFORM LIVE — MVP
              </Text>
            </View>

            <Text style={[typography.body, { color: 'rgba(255,255,255,0.55)', marginTop: spacing.lg }]}>
              {greeting},
            </Text>
            <Text style={styles.heroName}>{firstName}</Text>
            <View style={styles.goldUnderline} />

            <Text style={[typography.body, { color: 'rgba(255,255,255,0.6)', marginTop: spacing.md, lineHeight: 20 }]}>
              Your GeoAfric dashboard is ready. Add family members to start{'\n'}
              sharing locations and monitoring health.
            </Text>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>
              <Button label="Invite Family" icon={<Plus size={16} color={colors.navy} />}
                onPress={() => router.push('/(tabs)/family')} />
              <Pressable onPress={() => router.push('/(tabs)/location')}
                style={styles.secondaryBtn}>
                <MapPin size={16} color={colors.teal} />
                <Text style={[typography.button, { color: colors.white }]}>View Map</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Stat cards 2x2 */}
        <View style={styles.statsGrid}>
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <View key={label} style={[styles.statCard, shadows.sm]}>
              <View style={[styles.statIcon, { backgroundColor: bg }]}>
                <Icon size={18} color={color} />
              </View>
              <Text style={[typography.display, { fontSize: 26, marginTop: spacing.md }]}>{value}</Text>
              <Text style={[typography.h3, { fontSize: 13, marginTop: 2 }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={[styles.actionsCard, shadows.sm]}>
          <Text style={[typography.overline, { color: colors.green, marginBottom: spacing.xs }]}>
            START HERE
          </Text>
          <Text style={[typography.h2, { marginBottom: spacing.lg }]}>Quick Actions</Text>
          <View style={{ gap: spacing.sm }}>
            {ACTIONS.map(({ label, icon: Icon, to, color }) => (
              <Pressable key={label} onPress={() => router.push(to as any)} style={styles.actionRow}>
                <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
                  <Icon size={18} color={color} />
                </View>
                <Text style={[typography.body, { flex: 1, fontFamily: 'DMSans-Bold' }]}>{label}</Text>
                <ArrowUpRight size={16} color={colors.textLight} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* SolarTrack teaser */}
        <Pressable onPress={() => router.push('/(tabs)/solar')} style={[styles.solarCard, shadows.sm]}>
          <View style={[styles.solarIcon]}>
            <Zap size={20} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { marginBottom: 4 }]}>SolarTrack</Text>
            <Text style={typography.bodyMuted}>Smart solar monitoring — coming with hardware</Text>
          </View>
          <ArrowUpRight size={16} color={colors.textLight} />
        </Pressable>

        {/* Status strip */}
        <View style={styles.statusStrip}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={styles.pulseDot} />
            <Text style={[typography.overline, { color: colors.white }]}>
              All Systems Operational
            </Text>
          </View>
          <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)' }]}>
            v1.0.0 · MVP
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bellBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  bellDot: {
    position: 'absolute', top: 9, right: 9,
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold,
    borderWidth: 1.5, borderColor: colors.white,
  },
  avatar: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  hero: {
    borderRadius: radius['2xl'], overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  heroBg: {
    padding: spacing['2xl'], position: 'relative',
  },
  heroAccent: {
    position: 'absolute', top: 0, left: 0,
    width: 60, height: 3,
  },
  meshAbs: {
    position: 'absolute', right: -20, bottom: -30,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 6, paddingHorizontal: spacing.md,
    borderRadius: radius.full, alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
  },
  pulseDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green,
  },
  heroName: {
    fontFamily: 'Sora-Black', fontSize: 36,
    color: colors.white, letterSpacing: -1.5,
    marginTop: 4,
  },
  goldUnderline: {
    height: 3, width: '55%', borderRadius: 2,
    backgroundColor: colors.gold, marginTop: spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing['2xl'], paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.md, marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1, minWidth: '47%',
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  actionsCard: {
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing['2xl'], borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  solarCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  solarIcon: {
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: 'rgba(245,166,35,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  statusStrip: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy, borderRadius: radius.lg,
    padding: spacing.md, marginTop: spacing.sm,
  },
});
