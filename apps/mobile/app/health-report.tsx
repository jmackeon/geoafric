import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft, Heart, Activity as ActivityIcon, Target, Zap, TrendingUp,
  Plus, RefreshCw, CheckCircle2, AlertTriangle, Info,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface HRStats { avg: number | null; min: number | null; max: number | null; count: number; latest: any }
interface DayActivity { steps: number; calories: number; distance_m: number; active_mins: number; date: string }
interface Goals { daily_steps: number; target_bpm_min: number; target_bpm_max: number; daily_water_ml: number }
interface Insight { id: string; type: string; title: string; message: string; severity: string; read: boolean; created_at: string }

const TABS = ['Overview', 'Heart Rate', 'Activity', 'Goals', 'Insights'] as const;
type Tab = typeof TABS[number];

function bpmZone(bpm: number) {
  if (bpm < 60)  return { label: 'Low',      color: '#3B82F6' };
  if (bpm < 100) return { label: 'Normal',   color: colors.green };
  if (bpm < 140) return { label: 'Elevated', color: colors.gold };
  return             { label: 'High',     color: colors.danger };
}

function severityIcon(severity: string) {
  if (severity === 'critical') return <AlertTriangle size={16} color={colors.danger} />;
  if (severity === 'warning')  return <AlertTriangle size={16} color={colors.gold} />;
  return <Info size={16} color={colors.green} />;
}

export default function HealthReportScreen() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [loading, setLoading] = useState(true);
  const [hrStats, setHrStats] = useState<HRStats | null>(null);
  const [today, setToday]     = useState<DayActivity | null>(null);
  const [goals, setGoals]     = useState<Goals | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [hrHistory, setHrHistory] = useState<any[]>([]);
  const [actHistory, setActHistory] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [stats, act, gl, ins] = await Promise.all([
        api.get('/health/heart-rate/stats'),
        api.get('/health/activity/today'),
        api.get('/health/goals'),
        api.get('/health/insights'),
      ]);
      setHrStats(stats.data);
      setToday(act.data);
      setGoals(gl.data);
      setInsights(ins.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (tab === 'Heart Rate') api.get('/health/heart-rate?limit=20').then(r => setHrHistory(r.data ?? []));
    if (tab === 'Activity')   api.get('/health/activity/history?days=7').then(r => setActHistory(r.data ?? []));
  }, [tab]);

  const unread = insights.filter(i => !i.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <View>
            <Text style={typography.h2}>Health & Wellness</Text>
            <Text style={typography.bodyMuted}>Vitals, activity & AI insights</Text>
          </View>
        </View>
        <Pressable onPress={loadAll} style={styles.refreshBtn}>
          <RefreshCw size={16} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.xs }}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabPill, tab === t && styles.tabPillActive]}>
              <Text style={[typography.caption, { color: tab === t ? colors.text : colors.textMuted, fontFamily: 'DMSans-Bold' }]}>{t}</Text>
              {t === 'Insights' && unread > 0 && <View style={styles.unreadDot} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg }}>
          {tab === 'Overview' && (
            <OverviewTab hrStats={hrStats} today={today} goals={goals} insights={insights} onTabChange={setTab} />
          )}
          {tab === 'Heart Rate' && (
            <HeartRateTab hrHistory={hrHistory} setHrHistory={setHrHistory} hrStats={hrStats} setHrStats={setHrStats} />
          )}
          {tab === 'Activity' && (
            <ActivityTab today={today} setToday={setToday} goals={goals} history={actHistory} setHistory={setActHistory} />
          )}
          {tab === 'Goals' && <GoalsTab goals={goals} setGoals={setGoals} />}
          {tab === 'Insights' && <InsightsTab insights={insights} setInsights={setInsights} />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ hrStats, today, goals, insights, onTabChange }: any) {
  const stepPct = goals && today ? Math.min(100, Math.round((today.steps / goals.daily_steps) * 100)) : 0;
  const latestBpm = hrStats?.latest?.bpm;
  const zone = latestBpm ? bpmZone(latestBpm) : null;

  const cards = [
    { label: 'Heart Rate', value: latestBpm ? `${latestBpm} BPM` : '—', sub: zone?.label ?? 'No reading yet', icon: Heart, color: zone?.color ?? colors.textLight, tab: 'Heart Rate' },
    { label: 'Steps Today', value: today?.steps?.toLocaleString() ?? '0', sub: `${stepPct}% of goal`, icon: ActivityIcon, color: stepPct >= 100 ? colors.green : colors.gold, tab: 'Activity' },
    { label: 'Active Minutes', value: `${today?.active_mins ?? 0} min`, sub: 'Today', icon: Zap, color: colors.teal, tab: 'Activity' },
    { label: 'AI Insights', value: `${insights.length}`, sub: `${insights.filter((i: any) => !i.read).length} unread`, icon: TrendingUp, color: colors.navy, tab: 'Insights' },
  ];

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {cards.map(({ label, value, sub, icon: Icon, color, tab: t }) => (
          <Pressable key={label} onPress={() => onTabChange(t)} style={[styles.statCard, shadows.sm]}>
            <View style={[styles.statIcon, { backgroundColor: color }]}>
              <Icon size={18} color={colors.white} />
            </View>
            <Text style={[typography.display, { fontSize: 20, marginTop: spacing.md }]}>{value}</Text>
            <Text style={[typography.h3, { fontSize: 12 }]}>{label}</Text>
            <Text style={typography.caption}>{sub}</Text>
          </Pressable>
        ))}
      </View>

      {goals && today && (
        <View style={[styles.card, shadows.sm]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Text style={typography.h3}>Daily Step Progress</Text>
            <Text style={[typography.body, { color: stepPct >= 100 ? colors.green : colors.gold, fontFamily: 'DMSans-Bold' }]}>{stepPct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stepPct}%`, backgroundColor: stepPct >= 100 ? colors.green : colors.gold }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
            <Text style={typography.caption}>{today.steps.toLocaleString()} steps</Text>
            <Text style={typography.caption}>{goals.daily_steps.toLocaleString()} goal</Text>
          </View>
        </View>
      )}

      {insights.length > 0 && (
        <View style={[styles.card, shadows.sm]}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Latest Insight</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt }}>
            {severityIcon(insights[0].severity)}
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{insights[0].title}</Text>
              <Text style={typography.bodyMuted}>{insights[0].message}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Heart Rate ────────────────────────────────────────────────────────────────
function HeartRateTab({ hrHistory, setHrHistory, hrStats, setHrStats }: any) {
  const [bpm, setBpm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    const val = parseInt(bpm, 10);
    if (isNaN(val) || val < 20 || val > 300) return Toast.show({ type: 'error', text1: 'Enter a valid BPM (20-300)' });
    setSaving(true);
    try {
      await api.post('/health/heart-rate', { bpm: val, method: 'manual' });
      Toast.show({ type: 'success', text1: 'Heart rate logged!' });
      setBpm('');
      const [history, stats] = await Promise.all([
        api.get('/health/heart-rate?limit=20'),
        api.get('/health/heart-rate/stats'),
      ]);
      setHrHistory(history.data ?? []);
      setHrStats(stats.data);
    } catch { Toast.show({ type: 'error', text1: 'Failed to log reading' }); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ gap: spacing.lg }}>
      {hrStats && hrStats.count > 0 && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { label: 'Average', value: hrStats.avg, color: colors.green },
            { label: 'Minimum', value: hrStats.min, color: '#3B82F6' },
            { label: 'Maximum', value: hrStats.max, color: colors.danger },
          ].map(({ label, value, color }) => (
            <View key={label} style={[styles.miniStat, shadows.sm]}>
              <Text style={[typography.h2, { color, fontSize: 18 }]}>{value} BPM</Text>
              <Text style={typography.caption}>{label} (7d)</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, shadows.sm]}>
        <Text style={[typography.h3, { marginBottom: spacing.md }]}>Log Heart Rate</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TextInput
            value={bpm} onChangeText={setBpm} keyboardType="number-pad"
            placeholder="Enter BPM" placeholderTextColor={colors.textLight}
            style={styles.bpmInput} />
          <Button label="Log" icon={<Plus size={14} color={colors.navy} />} onPress={handleLog} loading={saving} disabled={!bpm} />
        </View>
      </View>

      {hrHistory.length > 0 && (
        <View style={[styles.card, shadows.sm]}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Recent Readings</Text>
          <View style={{ gap: spacing.sm }}>
            {hrHistory.slice(0, 10).map((r: any) => {
              const z = bpmZone(r.bpm);
              return (
                <View key={r.id} style={styles.hrRow}>
                  <View style={[styles.dot, { backgroundColor: z.color }]} />
                  <Text style={[typography.h3, { flex: 1 }]}>{r.bpm} BPM</Text>
                  <View style={[styles.zoneBadge, { backgroundColor: `${z.color}20` }]}>
                    <Text style={[typography.caption, { color: z.color }]}>{z.label}</Text>
                  </View>
                  <Text style={typography.caption}>{new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Activity ──────────────────────────────────────────────────────────────────
function ActivityTab({ today, setToday, goals, history, setHistory }: any) {
  const [form, setForm] = useState({ steps: '', calories: '', active_mins: '' });
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    if (!form.steps) return Toast.show({ type: 'error', text1: 'Enter step count' });
    setSaving(true);
    try {
      const { data } = await api.post('/health/activity', {
        steps: parseInt(form.steps, 10),
        calories: form.calories ? parseFloat(form.calories) : undefined,
        active_mins: form.active_mins ? parseInt(form.active_mins, 10) : undefined,
      });
      setToday(data);
      setHistory((prev: any[]) => [data, ...prev.filter(h => h.date !== data.date)]);
      Toast.show({ type: 'success', text1: 'Activity logged!' });
      setForm({ steps: '', calories: '', active_mins: '' });
    } catch { Toast.show({ type: 'error', text1: 'Failed to log activity' }); }
    finally { setSaving(false); }
  };

  const stepPct = goals && today ? Math.min(100, Math.round((today.steps / goals.daily_steps) * 100)) : 0;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.activityHero}>
        <Text style={[typography.h3, { color: '#7C2D12', marginBottom: spacing.md }]}>Today's Activity</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {[
            { label: 'Steps', value: today?.steps?.toLocaleString() ?? '0' },
            { label: 'Cal', value: Math.round(today?.calories ?? 0).toString() },
            { label: 'Active min', value: (today?.active_mins ?? 0).toString() },
          ].map(({ label, value }) => (
            <View key={label} style={{ alignItems: 'center' }}>
              <Text style={[typography.display, { fontSize: 20 }]}>{value}</Text>
              <Text style={[typography.caption, { color: '#92400E' }]}>{label}</Text>
            </View>
          ))}
        </View>
        {goals && (
          <View style={{ marginTop: spacing.lg }}>
            <View style={styles.progressTrackLight}>
              <View style={[styles.progressFill, { width: `${stepPct}%`, backgroundColor: colors.navy }]} />
            </View>
            <Text style={[typography.caption, { color: '#92400E', marginTop: 4 }]}>{stepPct}% of {goals.daily_steps.toLocaleString()} step goal</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, shadows.sm]}>
        <Text style={[typography.h3, { marginBottom: spacing.md }]}>Update Today's Activity</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
          {[
            { field: 'steps', label: 'Steps' },
            { field: 'calories', label: 'Cal' },
            { field: 'active_mins', label: 'Active min' },
          ].map(({ field, label }) => (
            <View key={field} style={{ flex: 1 }}>
              <Text style={[typography.caption, { marginBottom: 4 }]}>{label}</Text>
              <TextInput
                value={(form as any)[field]} onChangeText={(v) => setForm(f => ({ ...f, [field]: v }))}
                keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.textLight}
                style={styles.smallInput} />
            </View>
          ))}
        </View>
        <Button label="Log Activity" icon={<Plus size={14} color={colors.navy} />} onPress={handleLog} loading={saving} />
      </View>

      {history.length > 0 && (
        <View style={[styles.card, shadows.sm]}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>7-Day History</Text>
          <View style={{ gap: spacing.sm }}>
            {history.map((day: any) => {
              const pct = goals ? Math.min(100, Math.round((day.steps / goals.daily_steps) * 100)) : 0;
              return (
                <View key={day.date} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={[typography.caption, { width: 60 }]}>
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                  </Text>
                  <View style={[styles.progressTrack, { flex: 1 }]}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct >= 100 ? colors.green : colors.gold }]} />
                  </View>
                  <Text style={[typography.caption, { fontFamily: 'DMSans-Bold', width: 50, textAlign: 'right' }]}>{day.steps.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Goals ─────────────────────────────────────────────────────────────────────
function GoalsTab({ goals, setGoals }: any) {
  const [form, setForm] = useState({ daily_steps: '', target_bpm_min: '', target_bpm_max: '', daily_water_ml: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goals) setForm({
      daily_steps: goals.daily_steps?.toString() ?? '',
      target_bpm_min: goals.target_bpm_min?.toString() ?? '',
      target_bpm_max: goals.target_bpm_max?.toString() ?? '',
      daily_water_ml: goals.daily_water_ml?.toString() ?? '',
    });
  }, [goals]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/health/goals', {
        daily_steps: parseInt(form.daily_steps, 10),
        target_bpm_min: parseInt(form.target_bpm_min, 10),
        target_bpm_max: parseInt(form.target_bpm_max, 10),
        daily_water_ml: parseInt(form.daily_water_ml, 10),
      });
      setGoals(data);
      Toast.show({ type: 'success', text1: 'Goals updated!' });
    } catch { Toast.show({ type: 'error', text1: 'Failed to update goals' }); }
    finally { setSaving(false); }
  };

  const FIELDS = [
    { field: 'daily_steps', label: 'Daily Steps Goal', icon: ActivityIcon },
    { field: 'target_bpm_min', label: 'Min Heart Rate (BPM)', icon: Heart },
    { field: 'target_bpm_max', label: 'Max Heart Rate (BPM)', icon: Heart },
    { field: 'daily_water_ml', label: 'Daily Water Goal (ml)', icon: Target },
  ];

  return (
    <View style={[styles.card, shadows.sm]}>
      <Text style={[typography.h3, { marginBottom: spacing.lg }]}>Health Goals</Text>
      <View style={{ gap: spacing.md }}>
        {FIELDS.map(({ field, label, icon: Icon }) => (
          <View key={field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon size={13} color={colors.textLight} />
              <Text style={[typography.caption, { color: colors.text, fontFamily: 'DMSans-Bold' }]}>{label}</Text>
            </View>
            <TextInput
              value={(form as any)[field]} onChangeText={(v) => setForm(f => ({ ...f, [field]: v }))}
              keyboardType="number-pad" placeholderTextColor={colors.textLight}
              style={styles.goalInput} />
          </View>
        ))}
        <Button label="Save Goals" icon={<CheckCircle2 size={16} color={colors.navy} />} onPress={handleSave} loading={saving} fullWidth />
      </View>
    </View>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────
function InsightsTab({ insights, setInsights }: any) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/health/insights/generate');
      setInsights((prev: Insight[]) => [data, ...prev]);
      Toast.show({ type: 'success', text1: 'New insight generated!' });
    } catch { Toast.show({ type: 'error', text1: 'Failed to generate insight' }); }
    finally { setGenerating(false); }
  };

  const handleMarkRead = async (id: string) => {
    await api.patch(`/health/insights/${id}/read`);
    setInsights((prev: Insight[]) => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const insightBg = (severity: string) => {
    if (severity === 'critical') return { bg: '#FEF2F2' };
    if (severity === 'warning')  return { bg: '#FEF5E7' };
    return { bg: '#F0FDF4' };
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.aiCard}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.white }]}>AI Health Assistant</Text>
          <Text style={[typography.caption, { color: '#93C5FD' }]}>Personalised tips from your data</Text>
        </View>
        <Button label={generating ? 'Generating…' : 'Generate'} icon={<Zap size={14} color={colors.navy} />}
          onPress={handleGenerate} loading={generating} />
      </View>

      {insights.length === 0 ? (
        <View style={[styles.card, shadows.sm, { alignItems: 'center', padding: spacing['2xl'] }]}>
          <Zap size={36} color={colors.border} />
          <Text style={[typography.body, { fontFamily: 'DMSans-Bold', marginTop: spacing.sm }]}>No insights yet</Text>
          <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: 4 }]}>
            Log heart rate and activity, then generate your first insight.
          </Text>
        </View>
      ) : (
        insights.map((insight: Insight) => {
          const { bg } = insightBg(insight.severity);
          return (
            <View key={insight.id} style={[styles.insightCard, { backgroundColor: bg, opacity: insight.read ? 0.7 : 1 }]}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {severityIcon(insight.severity)}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text style={[typography.body, { fontFamily: 'DMSans-Bold', flex: 1 }]}>{insight.title}</Text>
                    {!insight.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[typography.bodyMuted, { marginTop: 4 }]}>{insight.message}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
                    <Text style={typography.caption}>{new Date(insight.created_at).toLocaleDateString()}</Text>
                    {!insight.read && (
                      <Pressable onPress={() => handleMarkRead(insight.id)}>
                        <Text style={[typography.caption, { textDecorationLine: 'underline' }]}>Mark read</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  refreshBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt,
  },
  tabBar: { backgroundColor: colors.white, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  tabPillActive: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  statCard: {
    flex: 1, minWidth: '47%', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  statIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg },
  progressTrack: { height: 10, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, overflow: 'hidden' },
  progressTrackLight: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  miniStat: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  bpmInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 12, color: colors.text, fontFamily: 'DMSans-Regular',
  },
  smallInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontFamily: 'DMSans-Regular', textAlign: 'center',
  },
  goalInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 12, color: colors.text, fontFamily: 'DMSans-Regular',
  },
  hrRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  dot: { width: 10, height: 10, borderRadius: 5 },
  zoneBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  activityHero: { backgroundColor: '#F8C165', borderRadius: radius.xl, padding: spacing.xl },
  aiCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.navy, borderRadius: radius.xl, padding: spacing.lg,
  },
  insightCard: { borderRadius: radius.lg, padding: spacing.lg },
});
