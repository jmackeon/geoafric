import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Share, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Users, Plus, Share2, Copy, UserPlus, Crown, Shield, MapPin, QrCode,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface Family { id: string; name: string; invite_code: string; owner_id: string; }
interface Member {
  id: string; role: string; joined_at: string;
  profiles?: { id: string; full_name: string | null; avatar_url: string | null };
}
interface FamilyLoc { user_id: string; lat: number; lng: number; recorded_at: string; }

export default function FamilyScreen() {
  const { user } = useAuthStore();
  const [families, setFamilies] = useState<Family[]>([]);
  const [active, setActive]     = useState<Family | null>(null);
  const [members, setMembers]   = useState<Member[]>([]);
  const [familyLocs, setFamilyLocs] = useState<FamilyLoc[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none');
  const [name, setName]     = useState('');
  const [code, setCode]     = useState('');
  const [busy, setBusy]     = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/families');
      const list: Family[] = (data ?? []).map((row: any) => row.families).filter(Boolean);
      setFamilies(list);
      if (list.length > 0) {
        setActive(list[0]);
        const [detail, locsRes] = await Promise.all([
          api.get(`/families/${list[0].id}`),
          api.get('/location/family').catch(() => ({ data: [] })),
        ]);
        setMembers(detail.data?.family_members ?? []);
        setFamilyLocs(locsRes.data ?? []);
      } else {
        setActive(null);
        setMembers([]);
        setFamilyLocs([]);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load family' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleCreate = async () => {
    if (!name.trim()) return Toast.show({ type: 'error', text1: 'Enter a family name' });
    setBusy(true);
    try {
      await api.post('/families', { name: name.trim() });
      Toast.show({ type: 'success', text1: 'Family created! 🎉' });
      setName(''); setMode('none');
      await load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? 'Failed to create family' });
    } finally { setBusy(false); }
  };

  const handleJoin = async () => {
    if (!code.trim()) return Toast.show({ type: 'error', text1: 'Enter invite code' });
    setBusy(true);
    try {
      await api.post('/families/join', { invite_code: code.trim().toUpperCase() });
      Toast.show({ type: 'success', text1: 'Joined family! 🎉' });
      setCode(''); setMode('none');
      await load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? 'Invalid invite code' });
    } finally { setBusy(false); }
  };

  const shareCode = (inviteCode: string) => {
    Share.share({ message: `Join my family on GeoAfric! Use invite code: ${inviteCode}` });
  };

  const copyCode = async (inviteCode: string) => {
    await Clipboard.setStringAsync(inviteCode);
    Toast.show({ type: 'success', text1: 'Invite code copied!' });
  };

  const lastSeenFor = (memberId?: string) => familyLocs.find(l => l.user_id === memberId);
  const minutesAgo = (iso: string) => Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const statusColor = (ago: number) => ago < 5 ? colors.green : ago < 30 ? colors.gold : colors.textLight;

  const roleColor = (role: string) => {
    if (role === 'owner' || role === 'admin') return { icon: Crown, color: colors.gold, bg: 'rgba(245,166,35,0.12)' };
    if (role === 'guardian') return { icon: Shield, color: colors.green, bg: 'rgba(0,182,122,0.12)' };
    return { icon: MapPin, color: colors.textLight, bg: colors.surfaceAlt };
  };

  // Invite code/copy/share is UI-only gated here — the API itself doesn't
  // restrict viewing the static invite_code to owner/admin (getFamily only
  // calls assertMember), so this isn't a real security boundary, just UX.
  const myRole = members.find(m => m.profiles?.id === user?.id)?.role;
  const canInvite = myRole === 'owner' || myRole === 'admin';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}><ActivityIndicator color={colors.green} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Family</Text>
        {active && canInvite && (
          <Pressable style={styles.mapBtn} onPress={() => shareCode(active.invite_code)}>
            <UserPlus size={14} color={colors.navy} />
            <Text style={[typography.caption, { color: colors.navy, fontFamily: 'DMSans-Bold' }]}>Invite</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}>

        {/* Empty state */}
        {families.length === 0 && mode === 'none' && (
          <View style={[styles.emptyCard, shadows.sm]}>
            <View style={styles.emptyIcon}>
              <Users size={32} color={colors.gold} />
            </View>
            <Text style={[typography.h2, { marginTop: spacing.lg, textAlign: 'center' }]}>No family yet</Text>
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Create a family group to share locations, monitor health, and set safety zones together.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Join with code" variant="ghost" icon={<QrCode size={16} color={colors.text} />}
                onPress={() => setMode('join')} />
              <Button label="Create family" icon={<Plus size={16} color={colors.navy} />}
                onPress={() => setMode('create')} />
            </View>
          </View>
        )}

        {/* Create form */}
        {mode === 'create' && (
          <View style={[styles.formCard, shadows.sm]}>
            <Text style={typography.h3}>Create a family</Text>
            <View style={{ marginTop: spacing.lg }}>
              <Input value={name} onChangeText={setName} placeholder="e.g. The Mensah Family" />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Cancel" variant="ghost" onPress={() => setMode('none')} />
              <Button label="Create" loading={busy} onPress={handleCreate} />
            </View>
          </View>
        )}

        {/* Join form */}
        {mode === 'join' && (
          <View style={[styles.formCard, shadows.sm]}>
            <Text style={typography.h3}>Join a family</Text>
            <View style={{ marginTop: spacing.lg }}>
              <Input value={code} onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder="FMLY-XXXX" autoCapitalize="characters" />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Cancel" variant="ghost" onPress={() => setMode('none')} />
              <Button label="Join" loading={busy} onPress={handleJoin} />
            </View>
          </View>
        )}

        {/* Active family */}
        {active && (
          <>
            <View style={[styles.familyHeader]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={[typography.overline, { color: 'rgba(255,255,255,0.5)' }]}>ACTIVE FAMILY</Text>
                  <Text style={styles.familyName}>{active.name}</Text>
                </View>
                <View style={styles.memberCountBadge}>
                  <Users size={14} color={colors.teal} />
                  <Text style={[typography.caption, { color: colors.white, fontFamily: 'DMSans-Bold' }]}>
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {canInvite && (
              <View style={styles.inviteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)' }]}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{active.invite_code}</Text>
                </View>
                <Pressable style={styles.copyBtn} onPress={() => copyCode(active.invite_code)}>
                  <Copy size={14} color={colors.white} />
                </Pressable>
                <Pressable style={styles.shareBtn} onPress={() => shareCode(active.invite_code)}>
                  <Share2 size={14} color={colors.navy} />
                  <Text style={[typography.caption, { color: colors.navy, fontFamily: 'DMSans-Bold' }]}>Share</Text>
                </Pressable>
              </View>
              )}
            </View>

            <View style={[styles.membersCard, shadows.sm]}>
              <Text style={[typography.h3, { marginBottom: spacing.lg }]}>Members</Text>

              {members.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                  <Users size={32} color={colors.border} />
                  <Text style={[typography.bodyMuted, { marginTop: spacing.sm }]}>Just you for now</Text>
                </View>
              ) : (
                <View style={{ gap: spacing.sm }}>
                  {members.map((member) => {
                    const fullName = member.profiles?.full_name ?? 'Family member';
                    const initial = fullName[0]?.toUpperCase() ?? 'F';
                    const isMe = member.profiles?.id === user?.id;
                    const { icon: RoleIcon, color, bg } = roleColor(member.role);
                    const loc = lastSeenFor(member.profiles?.id);
                    const ago = loc ? minutesAgo(loc.recorded_at) : null;
                    return (
                      <View key={member.id} style={[styles.memberRow, isMe && styles.memberRowMe]}>
                        <View style={{ position: 'relative' }}>
                          <View style={[styles.memberAvatar, { backgroundColor: isMe ? colors.green : colors.navy }]}>
                            <Text style={{ color: colors.white, fontFamily: 'Sora-ExtraBold', fontSize: 15 }}>{initial}</Text>
                          </View>
                          {ago !== null && (
                            <View style={[styles.statusDot, { backgroundColor: statusColor(ago) }]} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{fullName}</Text>
                            {isMe && (
                              <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>
                            )}
                          </View>
                          <View style={[styles.roleBadge, { backgroundColor: bg, marginTop: 4 }]}>
                            <RoleIcon size={11} color={color} />
                            <Text style={[typography.caption, { color, textTransform: 'capitalize' }]}>{member.role}</Text>
                          </View>
                          {loc && ago !== null && (
                            <Text style={[typography.caption, { marginTop: 4 }]}>
                              {ago < 1 ? 'Just now' : `${ago}m ago`} · {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <Button
              label="View Family Map" variant="secondary" fullWidth
              icon={<MapPin size={16} color={colors.white} />}
              onPress={() => router.push('/(tabs)/location')}
              style={{ marginTop: spacing.lg }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md,
    backgroundColor: 'rgba(0,230,210,0.15)',
  },
  emptyCard: {
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing['2xl'], alignItems: 'center',
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: radius.xl,
    backgroundColor: 'rgba(245,166,35,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  formCard: {
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing.xl, gap: spacing.sm, marginBottom: spacing.lg,
  },
  familyHeader: {
    backgroundColor: colors.navy, borderRadius: radius['2xl'],
    padding: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden',
  },
  familyName: {
    fontFamily: 'Sora-Black', fontSize: 22, color: colors.white, marginTop: 4,
  },
  memberCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  inviteRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg,
    padding: spacing.lg, marginTop: spacing.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  inviteCode: {
    fontFamily: 'Sora-Black', fontSize: 18, color: colors.gold, letterSpacing: 1.5, marginTop: 2,
  },
  copyBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.gold, paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderRadius: radius.md,
  },
  membersCard: {
    backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl,
  },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt,
  },
  memberRowMe: {
    backgroundColor: 'rgba(0,182,122,0.06)', borderWidth: 1, borderColor: 'rgba(0,182,122,0.2)',
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 11, height: 11, borderRadius: 6,
    borderWidth: 2, borderColor: colors.white,
  },
  youBadge: {
    backgroundColor: 'rgba(0,182,122,0.15)', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 1,
  },
  youText: { fontSize: 10, fontFamily: 'DMSans-Bold', color: colors.green },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full,
  },
});
