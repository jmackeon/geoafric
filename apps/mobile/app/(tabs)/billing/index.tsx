import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {
  CreditCard, CheckCircle2, XCircle, Crown, Zap, Users, Building2,
  Receipt, Shield,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface Plan {
  id: string; name: string; price_monthly: number; price_annual: number;
  max_members: number | null; max_languages: number | null;
  ai_health: boolean; offline_mode: boolean; priority_support: boolean; ad_supported: boolean;
}
interface Subscription {
  plan_id: string; status: string; billing_cycle: string;
  current_period_end: string | null; cancel_at_period_end: boolean;
  plans: { name: string; price_monthly: number };
}

const PLAN_ICONS: Record<string, any> = { free: Shield, personal: Zap, family: Users, enterprise: Building2 };
const PLAN_COLORS: Record<string, string> = { free: colors.textMuted, personal: colors.green, family: colors.gold, enterprise: colors.navy };
const PROVIDERS = [
  { id: 'paystack', label: 'Paystack', sub: 'Cards + Mobile Money' },
  { id: 'flutterwave', label: 'Flutterwave', sub: 'International cards' },
  { id: 'payaza', label: 'Payaza', sub: 'Ghana MoMo' },
];

export default function BillingScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [provider, setProvider] = useState('paystack');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, txRes] = await Promise.all([
        api.get('/payments/plans'),
        api.get('/payments/subscription'),
        api.get('/payments/transactions'),
      ]);
      setPlans(plansRes.data ?? []);
      setSub(subRes.data);
      setTransactions(txRes.data ?? []);
    } catch { Toast.show({ type: 'error', text1: 'Failed to load billing info' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCheckout = async () => {
    if (!selectedPlan) return Toast.show({ type: 'error', text1: 'Please select a plan' });
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/payments/initialize', {
        plan_id: selectedPlan, billing_cycle: cycle, provider, currency: 'GHS',
      });
      if (!data.checkout_url) throw new Error('no checkout url');

      const result = await WebBrowser.openAuthSessionAsync(data.checkout_url);
      if (result.type === 'success' || result.type === 'dismiss') {
        try {
          await api.post('/payments/verify', { reference: data.reference, provider });
          Toast.show({ type: 'success', text1: '🎉 Payment successful!' });
        } catch {
          Toast.show({ type: 'info', text1: 'Checkout closed', text2: 'If you paid, it may take a moment to reflect.' });
        }
        await loadAll();
        setSelectedPlan(null);
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message ?? 'Checkout failed' });
    } finally { setCheckoutLoading(false); }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.delete('/payments/subscription');
      Toast.show({ type: 'success', text1: 'Subscription will cancel at period end' });
      loadAll();
    } catch { Toast.show({ type: 'error', text1: 'Failed to cancel' }); }
    finally { setCancelLoading(false); }
  };

  const currentPlan = plans.find(p => p.id === sub?.plan_id);
  const PlanIcon = PLAN_ICONS[sub?.plan_id ?? 'free'];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Billing & Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg }}>
        {/* Current plan */}
        <View style={styles.planHero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
            <View style={styles.planIconWrap}>
              {PlanIcon && <PlanIcon size={22} color={PLAN_COLORS[sub?.plan_id ?? 'free']} />}
            </View>
            <View>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.55)' }]}>CURRENT PLAN</Text>
              <Text style={[typography.h2, { color: colors.white }]}>{currentPlan?.name ?? 'Free'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={[styles.statusPill, { backgroundColor: sub?.status === 'active' ? 'rgba(0,182,122,0.25)' : 'rgba(239,68,68,0.25)' }]}>
              <Text style={[typography.caption, { color: sub?.status === 'active' ? colors.teal : '#FCA5A5', fontFamily: 'DMSans-Bold' }]}>
                {sub?.status ?? 'active'}
              </Text>
            </View>
          </View>
          <Text style={styles.priceTag}>
            {currentPlan && currentPlan.price_monthly > 0
              ? `$${sub?.billing_cycle === 'annual' ? currentPlan.price_annual : currentPlan.price_monthly}/${sub?.billing_cycle === 'annual' ? 'yr' : 'mo'}`
              : 'Free'}
          </Text>
          {sub?.current_period_end && (
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)' }]}>
              {sub.cancel_at_period_end ? 'Cancels' : 'Renews'} {new Date(sub.current_period_end).toLocaleDateString()}
            </Text>
          )}
          {sub?.plan_id !== 'free' && !sub?.cancel_at_period_end && (
            <Pressable onPress={handleCancel} disabled={cancelLoading} style={styles.cancelBtn}>
              <Text style={[typography.caption, { color: '#FCA5A5', fontFamily: 'DMSans-Bold' }]}>
                {cancelLoading ? 'Cancelling…' : 'Cancel plan'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Billing cycle toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
          <Text style={[typography.body, { fontFamily: cycle === 'monthly' ? 'DMSans-Bold' : 'DMSans-Regular' }]}>Monthly</Text>
          <Pressable onPress={() => setCycle(c => c === 'monthly' ? 'annual' : 'monthly')} style={[styles.toggleTrack, cycle === 'annual' && styles.toggleTrackOn]}>
            <View style={[styles.toggleThumb, cycle === 'annual' && styles.toggleThumbOn]} />
          </Pressable>
          <Text style={[typography.body, { fontFamily: cycle === 'annual' ? 'DMSans-Bold' : 'DMSans-Regular' }]}>Annual</Text>
          <View style={styles.saveBadge}><Text style={styles.saveText}>Save 20%</Text></View>
        </View>

        {/* Plans */}
        <View style={{ gap: spacing.md }}>
          {plans.filter(p => p.id !== 'enterprise').map((plan) => {
            const Icon = PLAN_ICONS[plan.id] ?? Shield;
            const color = PLAN_COLORS[plan.id] ?? colors.textMuted;
            const price = cycle === 'annual' ? plan.price_annual : plan.price_monthly;
            const isActive = sub?.plan_id === plan.id;
            const selected = selectedPlan === plan.id;

            return (
              <Pressable
                key={plan.id}
                onPress={() => plan.id !== 'free' && setSelectedPlan(plan.id)}
                style={[styles.planCard, { borderColor: selected ? color : isActive ? `${color}80` : colors.border }, selected && { backgroundColor: `${color}10` }]}>
                {isActive && (
                  <View style={[styles.cornerBadge, { backgroundColor: color }]}>
                    <Text style={styles.cornerBadgeText}>Current</Text>
                  </View>
                )}
                <View style={[styles.planCardIcon, { backgroundColor: `${color}18` }]}>
                  <Icon size={20} color={color} />
                </View>
                <Text style={[typography.h3, { marginTop: spacing.sm }]}>{plan.name}</Text>
                <Text style={[typography.display, { fontSize: 22, marginVertical: 4 }]}>
                  {price === 0 ? 'Free' : `$${price}`}
                  {price > 0 && <Text style={typography.caption}>/{cycle === 'annual' ? 'yr' : 'mo'}</Text>}
                </Text>
                <View style={{ gap: 4, marginTop: spacing.xs }}>
                  {[
                    { label: `${plan.max_members ?? '∞'} members`, ok: true },
                    { label: 'AI health alerts', ok: plan.ai_health },
                    { label: 'Offline mode', ok: plan.offline_mode },
                    { label: 'Ad-free', ok: !plan.ad_supported },
                  ].map(({ label, ok }) => (
                    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {ok ? <CheckCircle2 size={13} color={colors.green} /> : <XCircle size={13} color={colors.border} />}
                      <Text style={[typography.caption, { color: ok ? colors.text : colors.textLight }]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Checkout */}
        {selectedPlan && selectedPlan !== sub?.plan_id && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Choose payment method</Text>
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              {PROVIDERS.map((p) => (
                <Pressable key={p.id} onPress={() => setProvider(p.id)}
                  style={[styles.providerRow, provider === p.id && styles.providerRowActive]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{p.label}</Text>
                    <Text style={typography.caption}>{p.sub}</Text>
                  </View>
                  {provider === p.id && <CheckCircle2 size={18} color={colors.green} />}
                </Pressable>
              ))}
            </View>
            <Button
              label={checkoutLoading ? 'Redirecting…' : `Pay with ${PROVIDERS.find(p => p.id === provider)?.label}`}
              icon={<CreditCard size={16} color={colors.navy} />}
              onPress={handleCheckout} loading={checkoutLoading} fullWidth />
          </View>
        )}

        {/* Transactions */}
        {transactions.length > 0 && (
          <View style={[styles.card, shadows.sm]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Receipt size={16} color={colors.textLight} />
              <Text style={typography.h3}>Payment History</Text>
            </View>
            <View style={{ gap: spacing.sm }}>
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: tx.status === 'success' ? '#D1FAE5' : '#FEE2E2' }]}>
                    {tx.status === 'success'
                      ? <CheckCircle2 size={16} color={colors.green} />
                      : <XCircle size={16} color={colors.danger} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{tx.plans?.name ?? tx.plan_id} — {tx.billing_cycle}</Text>
                    <Text style={typography.caption}>{tx.provider} · {new Date(tx.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{tx.currency} {tx.amount}</Text>
                </View>
              ))}
            </View>
          </View>
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
  planHero: { backgroundColor: colors.navy, borderRadius: radius['2xl'], padding: spacing.xl },
  planIconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  statusPill: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full },
  priceTag: { fontFamily: 'Sora-Black', fontSize: 28, color: colors.white, marginBottom: 4 },
  cancelBtn: { marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.md, backgroundColor: 'rgba(239,68,68,0.15)' },
  toggleTrack: { width: 48, height: 26, borderRadius: radius.full, backgroundColor: colors.border, justifyContent: 'center' },
  toggleTrackOn: { backgroundColor: colors.green },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, marginLeft: 3 },
  toggleThumbOn: { marginLeft: 25 },
  saveBadge: { backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  saveText: { fontSize: 11, fontFamily: 'DMSans-Bold', color: '#065F46' },
  planCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 2, position: 'relative' },
  planCardIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cornerBadge: { position: 'absolute', top: spacing.md, right: spacing.md, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  cornerBadgeText: { fontSize: 10, fontFamily: 'DMSans-Bold', color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
  },
  providerRowActive: { borderColor: colors.green, backgroundColor: 'rgba(0,182,122,0.06)' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  txIcon: { width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
