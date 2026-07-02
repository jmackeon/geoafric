'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard, CheckCircle2, XCircle, Loader2,
  Crown, Zap, Users, Building2, ArrowRight,
  Calendar, Receipt, AlertCircle, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api/payments';
import { useAuthStore } from '@/lib/store/auth.store';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
  id: string; name: string;
  price_monthly: number; price_annual: number;
  currency: string; max_members: number | null; max_languages: number | null;
  ai_health: boolean; offline_mode: boolean; priority_support: boolean;
  api_access: boolean; ad_supported: boolean;
}

interface Subscription {
  plan_id: string; status: string; billing_cycle: string;
  current_period_end: string | null; cancel_at_period_end: boolean;
  plans: { name: string; price_monthly: number };
}

// ── Plan icon ─────────────────────────────────────────────────────────────────
const PLAN_ICONS: Record<string, any> = {
  free: Shield, personal: Zap, family: Users, enterprise: Building2,
};
const PLAN_COLORS: Record<string, string> = {
  free: '#6B7280', personal: '#00B67A', family: '#F5A623', enterprise: '#0D1B3D',
};

const PROVIDERS = [
  { id: 'paystack',    label: 'Paystack',    sub: 'Cards + Mobile Money',     flag: '🇳🇬🇬🇭' },
  { id: 'flutterwave', label: 'Flutterwave', sub: 'International cards',       flag: '🌍'     },
  { id: 'payaza',      label: 'Payaza',      sub: 'Ghana MoMo + Cross-border', flag: '🇬🇭'    },
];

function BillingContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

  const [plans, setPlans]               = useState<Plan[]>([]);
  const [sub, setSub]                   = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cycle, setCycle]               = useState<'monthly'|'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string|null>(null);
  const [selectedProvider, setProvider] = useState<string>('paystack');
  const [checkoutLoading, setCheckout]  = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [cancelLoading, setCancel]      = useState(false);

  useEffect(() => {
    loadAll();
    // Handle redirect back from payment provider
    const ref      = searchParams.get('verify');
    const provider = searchParams.get('provider');
    const mock     = searchParams.get('mock');
    if (ref && provider) handleVerify(ref, provider, !!mock);
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, txRes] = await Promise.all([
        paymentsApi.getPlans(),
        paymentsApi.getSubscription(),
        paymentsApi.getTransactions(),
      ]);
      setPlans(plansRes.data ?? []);
      setSub(subRes.data);
      setTransactions(txRes.data ?? []);
    } catch { toast.error('Failed to load billing info.'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (ref: string, provider: string, mock: boolean) => {
    setVerifying(true);
    try {
      if (mock) {
        toast.success('🎉 Payment successful! (Dev mode — auto-approved)');
        await loadAll();
        // Clean URL
        window.history.replaceState({}, '', '/dashboard/billing');
        return;
      }
      await paymentsApi.verify(ref, provider);
      toast.success('🎉 Payment successful! Your plan has been upgraded.');
      await loadAll();
      window.history.replaceState({}, '', '/dashboard/billing');
    } catch {
      toast.error('Payment verification failed. Contact support if charged.');
    } finally { setVerifying(false); }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) { toast.error('Please select a plan.'); return; }
    setCheckout(true);
    try {
      const { data } = await paymentsApi.initialize({
        plan_id:       selectedPlan,
        billing_cycle: cycle,
        provider:      selectedProvider as any,
        currency:      'GHS', // default to Ghana
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error('Could not start checkout. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Checkout failed.');
    } finally { setCheckout(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel at end of billing period?')) return;
    setCancel(true);
    try {
      await paymentsApi.cancel();
      toast.success('Subscription will cancel at period end.');
      loadAll();
    } catch { toast.error('Failed to cancel.'); }
    finally { setCancel(false); }
  };

  const currentPlan = plans.find(p => p.id === sub?.plan_id);
  const PlanIcon    = PLAN_ICONS[sub?.plan_id ?? 'free'];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: '#00B67A', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
          Billing & Subscription
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          Manage your plan, payment method and billing history
        </p>
      </div>

      {/* Verification banner */}
      {verifying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
          borderRadius: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <Loader2 style={{ width: '20px', height: '20px', color: '#00B67A', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#065F46', margin: 0 }}>
            Verifying payment…
          </p>
        </div>
      )}

      {/* Current plan card */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B3D 0%, #12295C 60%, #086B63 100%)',
        borderRadius: '24px', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px',
          borderRadius: '50%', background: 'rgba(0,230,210,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {PlanIcon && <PlanIcon style={{ width: '22px', height: '22px', color: PLAN_COLORS[sub?.plan_id ?? 'free'] ?? 'white' }} />}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Current Plan</p>
                <p style={{ fontSize: '20px', fontWeight: 900, margin: 0, fontFamily: 'Sora, sans-serif' }}>
                  {currentPlan?.name ?? 'Free'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                background: sub?.status === 'active' ? 'rgba(0,182,122,0.25)' : 'rgba(239,68,68,0.25)',
                color: sub?.status === 'active' ? '#00E6D2' : '#FCA5A5' }}>
                {sub?.status ?? 'active'}
              </span>
              {sub?.billing_cycle && sub.billing_cycle !== 'lifetime' && (
                <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  {sub.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {currentPlan && currentPlan.price_monthly > 0 ? (
              <p style={{ fontSize: '32px', fontWeight: 950, margin: '0 0 4px', fontFamily: 'Sora, sans-serif' }}>
                ${sub?.billing_cycle === 'annual' ? currentPlan.price_annual : currentPlan.price_monthly}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
                  /{sub?.billing_cycle === 'annual' ? 'yr' : 'mo'}
                </span>
              </p>
            ) : (
              <p style={{ fontSize: '32px', fontWeight: 950, margin: '0 0 4px', fontFamily: 'Sora, sans-serif' }}>Free</p>
            )}
            {sub?.current_period_end && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {sub.cancel_at_period_end ? 'Cancels' : 'Renews'} {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
            {sub?.plan_id !== 'free' && !sub?.cancel_at_period_end && (
              <button onClick={handleCancel} disabled={cancelLoading}
                style={{ marginTop: '8px', padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.15)', border: 'none', color: '#FCA5A5',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {cancelLoading ? 'Cancelling…' : 'Cancel plan'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: cycle === 'monthly' ? 700 : 500, color: '#0D1B3D' }}>Monthly</span>
        <button onClick={() => setCycle(c => c === 'monthly' ? 'annual' : 'monthly')}
          style={{ width: '48px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer', position: 'relative',
            background: cycle === 'annual' ? '#00B67A' : '#E5E7EB', transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%',
            background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
            left: cycle === 'annual' ? '25px' : '3px' }} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: cycle === 'annual' ? 700 : 500, color: '#0D1B3D' }}>
          Annual
          <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '999px',
            background: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: 700 }}>
            Save 20%
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {plans.filter(p => p.id !== 'enterprise').map(plan => {
          const Icon    = PLAN_ICONS[plan.id] ?? Shield;
          const color   = PLAN_COLORS[plan.id] ?? '#6B7280';
          const price   = cycle === 'annual' ? plan.price_annual : plan.price_monthly;
          const isActive = sub?.plan_id === plan.id;
          const selected = selectedPlan === plan.id;

          return (
            <div key={plan.id}
              onClick={() => plan.id !== 'free' && setSelectedPlan(plan.id)}
              style={{
                borderRadius: '20px', padding: '20px', cursor: plan.id !== 'free' ? 'pointer' : 'default',
                border: `2px solid ${selected ? color : isActive ? color + '60' : '#E5E7EB'}`,
                background: selected ? `${color}10` : 'white',
                boxShadow: selected ? `0 8px 24px ${color}25` : '0 2px 8px rgba(13,27,61,0.06)',
                transition: 'all 0.2s', position: 'relative',
              }}>
              {isActive && (
                <span style={{ position: 'absolute', top: '12px', right: '12px',
                  padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                  background: color, color: plan.id === 'free' ? 'white' : '#0D1B3D' }}>
                  Current
                </span>
              )}
              {plan.id === 'family' && (
                <span style={{ position: 'absolute', top: '12px', right: isActive ? '72px' : '12px',
                  padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                  background: '#0D1B3D', color: 'white' }}>
                  Popular
                </span>
              )}
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Icon style={{ width: '20px', height: '20px', color }} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3D', margin: '0 0 4px', fontFamily: 'Sora, sans-serif' }}>
                {plan.name}
              </p>
              <p style={{ fontSize: '22px', fontWeight: 950, color: '#0D1B3D', margin: '0 0 12px', fontFamily: 'Sora, sans-serif' }}>
                {price === 0 ? 'Free' : `$${price}`}
                {price > 0 && <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>/{cycle === 'annual' ? 'yr' : 'mo'}</span>}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: `${plan.max_members ?? '∞'} members`, ok: true },
                  { label: plan.max_languages ? `${plan.max_languages} languages` : 'All 20+ languages', ok: true },
                  { label: 'AI health alerts', ok: plan.ai_health },
                  { label: 'Offline mode',     ok: plan.offline_mode },
                  { label: 'Priority support', ok: plan.priority_support },
                  { label: 'Ad-free',          ok: !plan.ad_supported },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {ok
                      ? <CheckCircle2 style={{ width: '13px', height: '13px', color: '#00B67A', flexShrink: 0 }} />
                      : <XCircle     style={{ width: '13px', height: '13px', color: '#D1D5DB', flexShrink: 0 }} />}
                    <span style={{ fontSize: '12px', color: ok ? '#0D1B3D' : '#9CA3AF', fontWeight: ok ? 600 : 400 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Enterprise tile */}
        <div style={{ borderRadius: '20px', padding: '20px', background: '#0D1B3D', color: 'white',
          border: '2px solid #0D1B3D', boxShadow: '0 8px 24px rgba(13,27,61,0.2)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,166,35,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Building2 style={{ width: '20px', height: '20px', color: '#F5A623' }} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', fontFamily: 'Sora, sans-serif' }}>Enterprise</p>
          <p style={{ fontSize: '22px', fontWeight: 950, margin: '0 0 12px', fontFamily: 'Sora, sans-serif', color: '#F5A623' }}>
            Custom
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 14px', lineHeight: 1.5 }}>
            Gov/NGO dashboards, API access, white-label, dedicated SLA
          </p>
          <a href="mailto:enterprise@alphaztechnology.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '10px', background: '#F5A623', color: '#0D1B3D',
              fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>
            Contact us <ArrowRight style={{ width: '12px', height: '12px' }} />
          </a>
        </div>
      </div>

      {/* Checkout section */}
      {selectedPlan && selectedPlan !== sub?.plan_id && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.08)', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 16px' }}>
            Choose payment method
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
            {PROVIDERS.map(({ id, label, sub: psub, flag }) => (
              <button key={id} onClick={() => setProvider(id)}
                style={{ padding: '12px', borderRadius: '14px', border: `2px solid ${selectedProvider === id ? '#00B67A' : '#E5E7EB'}`,
                  background: selectedProvider === id ? '#F0FDF4' : 'white', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'center', transition: 'all 0.15s' }}>
                <p style={{ fontSize: '18px', margin: '0 0 4px' }}>{flag}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>{psub}</p>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px', borderRadius: '14px', background: '#F9FAFB', marginBottom: '14px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3D', margin: '0 0 2px' }}>
                {plans.find(p => p.id === selectedPlan)?.name} — {cycle === 'annual' ? 'Annual' : 'Monthly'}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
                {cycle === 'annual' ? '20% discount applied' : 'Switch to annual to save 20%'}
              </p>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#0D1B3D', margin: 0, fontFamily: 'Sora, sans-serif' }}>
              ${cycle === 'annual'
                ? plans.find(p => p.id === selectedPlan)?.price_annual
                : plans.find(p => p.id === selectedPlan)?.price_monthly}
            </p>
          </div>
          <button onClick={handleCheckout} disabled={checkoutLoading}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              background: '#F5A623', color: '#0D1B3D', fontWeight: 800, fontSize: '15px',
              cursor: checkoutLoading ? 'not-allowed' : 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(245,166,35,0.4)', fontFamily: 'inherit',
              opacity: checkoutLoading ? 0.75 : 1 }}>
            {checkoutLoading
              ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Redirecting to checkout…</>
              : <><CreditCard style={{ width: '16px', height: '16px' }} /> Pay with {PROVIDERS.find(p => p.id === selectedProvider)?.label}</>}
          </button>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: '10px 0 0' }}>
            🔒 Secure checkout · Cancel anytime · No hidden fees
          </p>
        </div>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
            Payment History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', borderRadius: '12px', background: '#F9FAFB' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: tx.status === 'success' ? '#D1FAE5' : '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tx.status === 'success'
                    ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#00B67A' }} />
                    : <XCircle     style={{ width: '16px', height: '16px', color: '#EF4444' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 2px' }}>
                    {tx.plans?.name ?? tx.plan_id} — {tx.billing_cycle}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                    {tx.provider} · {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0D1B3D', margin: '0 0 2px' }}>
                    {tx.currency} {tx.amount}
                  </p>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px',
                    background: tx.status === 'success' ? '#D1FAE5' : '#FEE2E2',
                    color: tx.status === 'success' ? '#065F46' : '#DC2626' }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%',
          border: '3px solid #E5E7EB', borderTopColor: '#00B67A',
          animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
