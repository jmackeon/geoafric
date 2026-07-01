import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Bell, AlertTriangle, Info, CheckCheck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface Insight {
  id: string; type: string; title: string; message: string;
  severity: string; read: boolean; created_at: string;
}

function severityIcon(severity: string) {
  if (severity === 'critical') return <AlertTriangle size={18} color={colors.danger} />;
  if (severity === 'warning')  return <AlertTriangle size={18} color={colors.gold} />;
  return <Info size={18} color={colors.green} />;
}

function severityBg(severity: string) {
  if (severity === 'critical') return '#FEF2F2';
  if (severity === 'warning')  return '#FEF5E7';
  return '#F0FDF4';
}

export default function NotificationsScreen() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/health/insights');
      setInsights(data ?? []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load notifications' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const markRead = async (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
    try { await api.patch(`/health/insights/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    const unread = insights.filter(i => !i.read);
    if (unread.length === 0) return;
    setInsights(prev => prev.map(i => ({ ...i, read: true })));
    await Promise.all(unread.map(i => api.patch(`/health/insights/${i.id}/read`).catch(() => {})));
  };

  const unreadCount = insights.filter(i => !i.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={typography.h2}>Notifications</Text>
        <Pressable onPress={markAllRead} disabled={unreadCount === 0} hitSlop={8} style={{ opacity: unreadCount === 0 ? 0.3 : 1 }}>
          <CheckCheck size={20} color={colors.green} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}>
          {insights.length === 0 ? (
            <View style={[styles.empty]}>
              <Bell size={36} color={colors.border} />
              <Text style={[typography.body, { fontFamily: 'DMSans-Bold', marginTop: spacing.sm }]}>
                You're all caught up
              </Text>
              <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: 4 }]}>
                Alerts and health insights will show up here.
              </Text>
            </View>
          ) : (
            insights.map((insight) => (
              <Pressable
                key={insight.id}
                onPress={() => !insight.read && markRead(insight.id)}
                style={[styles.card, shadows.sm, { backgroundColor: severityBg(insight.severity), opacity: insight.read ? 0.7 : 1 }]}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {severityIcon(insight.severity)}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Text style={[typography.body, { fontFamily: 'DMSans-Bold', flex: 1 }]}>{insight.title}</Text>
                      {!insight.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={[typography.bodyMuted, { marginTop: 4 }]}>{insight.message}</Text>
                    <Text style={[typography.caption, { marginTop: spacing.sm }]}>
                      {new Date(insight.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  card: { borderRadius: radius.lg, padding: spacing.lg },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  empty: { alignItems: 'center', paddingVertical: spacing['4xl'] },
});
