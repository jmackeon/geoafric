import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Heart, Activity as ActivityIcon, Moon, Droplet, ChevronRight, Users,
} from 'lucide-react-native';

import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface Member { id: string; profiles?: { id: string; full_name: string | null; avatar_url: string | null } }
interface HRStats { avg: number | null; latest: any }
interface DayActivity { steps: number }
interface Goals { daily_steps: number; daily_water_ml: number }

function bpmZone(bpm: number) {
  if (bpm < 60)  return { label: 'Low',      color: '#3B82F6' };
  if (bpm < 100) return { label: 'Normal',   color: colors.green };
  if (bpm < 140) return { label: 'Elevated', color: colors.gold };
  return             { label: 'High',     color: colors.danger };
}

export default function HealthScreen() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(user?.id);

  const [loading, setLoading] = useState(true);
  const [hrStats, setHrStats] = useState<HRStats | null>(null);
  const [today, setToday]     = useState<DayActivity | null>(null);
  const [goals, setGoals]     = useState<Goals | null>(null);

  // Family member list — reused for the avatar selector only, no health data
  // fetched for anyone but the signed-in user (see loadSelf below; the API
  // has no endpoint for viewing another member's health data).
  useEffect(() => {
    api.get('/families').then(async ({ data }) => {
      const list = (data ?? []).map((row: any) => row.families).filter(Boolean);
      if (list.length === 0) return;
      const detail = await api.get(`/families/${list[0].id}`);
      setMembers(detail.data?.family_members ?? []);
    }).catch(() => {});
  }, []);

  const loadSelf = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, act, gl] = await Promise.all([
        api.get('/health/heart-rate/stats'),
        api.get('/health/activity/today'),
        api.get('/health/goals'),
      ]);
      setHrStats(stats.data);
      setToday(act.data);
      setGoals(gl.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId === user?.id) loadSelf();
    else setLoading(false);
  }, [selectedId, user?.id, loadSelf]);

  const isSelf = selectedId === user?.id;
  const stepPct = goals && today ? Math.min(100, Math.round((today.steps / goals.daily_steps) * 100)) : 0;
  const latestBpm = hrStats?.latest?.bpm;
  const zone = latestBpm ? bpmZone(latestBpm) : null;

  const myInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'Y';

  const CARDS = [
    { label: 'Heart Rate', value: latestBpm ? `${latestBpm} BPM` : '—', sub: zone?.label ?? 'No reading yet', icon: Heart, color: zone?.color ?? colors.textLight },
    { label: 'Steps',      value: today?.steps?.toLocaleString() ?? '0', sub: `${stepPct}% of goal`,         icon: ActivityIcon, color: stepPct >= 100 ? colors.green : colors.gold },
    { label: 'Sleep',      value: '—', sub: 'Not tracked yet', icon: Moon, color: colors.textLight },
    { label: 'Hydration',  value: goals ? `${(goals.daily_water_ml / 1000).toFixed(1)}L` : '—', sub: 'Daily goal', icon: Droplet, color: '#0EA5E9' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Health</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg }}>
        {/* Member selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
          <Pressable onPress={() => setSelectedId(user?.id)} style={styles.memberItem}>
            <View style={[styles.memberAvatar, selectedId === user?.id && styles.memberAvatarActive, { backgroundColor: colors.green }]}>
              <Text style={styles.memberInitials}>{myInitials}</Text>
            </View>
            <Text style={[typography.caption, { fontFamily: 'DMSans-Bold' }]}>Me</Text>
          </Pressable>
          {members.filter(m => m.profiles?.id !== user?.id).map((m) => {
            const name = m.profiles?.full_name ?? 'Member';
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'F';
            const active = selectedId === m.profiles?.id;
            return (
              <Pressable key={m.id} onPress={() => setSelectedId(m.profiles?.id)} style={styles.memberItem}>
                <View style={[styles.memberAvatar, active && styles.memberAvatarActive, { backgroundColor: colors.navy }]}>
                  <Text style={styles.memberInitials}>{initials}</Text>
                </View>
                <Text style={[typography.caption, { fontFamily: 'DMSans-Bold' }]} numberOfLines={1}>{name.split(' ')[0]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: spacing.xl }} />
        ) : !isSelf ? (
          <View style={[styles.emptyCard, shadows.sm]}>
            <Users size={32} color={colors.border} />
            <Text style={[typography.body, { fontFamily: 'DMSans-Bold', marginTop: spacing.md, textAlign: 'center' }]}>
              Family health sharing isn't available yet
            </Text>
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: 4 }]}>
              You can only view your own health data right now.
            </Text>
          </View>
        ) : (
          <>
            {/* Metric cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {CARDS.map(({ label, value, sub, icon: Icon, color }) => (
                <View key={label} style={[styles.statCard, shadows.sm]}>
                  <View style={[styles.statIcon, { backgroundColor: color }]}>
                    <Icon size={18} color={colors.white} />
                  </View>
                  <Text style={[typography.display, { fontSize: 20, marginTop: spacing.md }]}>{value}</Text>
                  <Text style={[typography.h3, { fontSize: 12 }]}>{label}</Text>
                  <Text style={typography.caption}>{sub}</Text>
                </View>
              ))}
            </View>

            <Button
              label="View Full Report" variant="secondary" fullWidth
              icon={<ChevronRight size={16} color={colors.white} />}
              onPress={() => router.push('/health-report')} />
          </>
        )}
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
  memberItem: { alignItems: 'center', gap: 6, width: 60 },
  memberAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  memberAvatarActive: { borderColor: colors.gold },
  memberInitials: { color: colors.white, fontFamily: 'Sora-ExtraBold', fontSize: 16 },
  emptyCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing['2xl'], alignItems: 'center',
  },
  statCard: {
    flex: 1, minWidth: '47%', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  statIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
