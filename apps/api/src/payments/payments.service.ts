import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { InitializePaymentDto, VerifyPaymentDto } from './payments.dto';

// ── Plan pricing (matches DB seed) ───────────────────────────────────────────
const PLAN_PRICES: Record<string, Record<string, number>> = {
  personal:   { monthly: 3.99,  annual: 38.30  },
  family:     { monthly: 9.99,  annual: 95.90  },
  enterprise: { monthly: 0,     annual: 0      },
};

// ── Currency conversion rates (approximate, update periodically) ──────────────
const RATES: Record<string, number> = {
  USD: 1, GHS: 15.5, NGN: 1650, KES: 130, ZAR: 18.5,
};

@Injectable()
export class PaymentsService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  // ── Get plans list ─────────────────────────────────────────────────────────
  async getPlans() {
    const { data, error } = await this.supabase.admin
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Get current subscription ───────────────────────────────────────────────
  async getSubscription(userId: string) {
    const { data } = await this.supabase.admin
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .single();
    return data ?? { plan_id: 'free', status: 'active', plans: { name: 'Free', price_monthly: 0 } };
  }

  // ── Get transaction history ────────────────────────────────────────────────
  async getTransactions(userId: string) {
    const { data } = await this.supabase.admin
      .from('transactions')
      .select('*, plans(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return data ?? [];
  }

  // ── Initialize payment ─────────────────────────────────────────────────────
  async initializePayment(userId: string, dto: InitializePaymentDto) {
    const prices = PLAN_PRICES[dto.plan_id];
    if (!prices) throw new BadRequestException('Invalid plan.');

    const amountUSD = prices[dto.billing_cycle];
    const currency  = (dto.currency ?? 'USD').toUpperCase();
    const rate      = RATES[currency] ?? 1;
    const amount    = Math.round(amountUSD * rate * 100) / 100; // local currency

    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const { data: authUser } = await this.supabase.admin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email ?? '';

    // Create pending transaction
    const { data: tx } = await this.supabase.admin
      .from('transactions')
      .insert({
        user_id:      userId,
        plan_id:      dto.plan_id,
        billing_cycle: dto.billing_cycle,
        amount,
        currency,
        provider:     dto.provider,
        status:       'pending',
        metadata:     { plan_id: dto.plan_id, billing_cycle: dto.billing_cycle, amount_usd: amountUSD },
      })
      .select()
      .single();

    const reference = `GEOAFRIC-${tx!.id.slice(0, 8).toUpperCase()}`;

    // Update transaction with reference
    await this.supabase.admin
      .from('transactions')
      .update({ provider_ref: reference })
      .eq('id', tx!.id);

    // Build provider-specific checkout URL
    const callbackUrl = `${this.config.get('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000'}/dashboard/billing?verify=${reference}&provider=${dto.provider}`;

    switch (dto.provider) {
      case 'paystack':
        return this.initPaystack({ email, amount, currency, reference, callbackUrl, profile: profile?.full_name });

      case 'flutterwave':
        return this.initFlutterwave({ email, amount, currency, reference, callbackUrl, profile: profile?.full_name });

      case 'payaza':
        return this.initPayaza({ email, amount, currency, reference, callbackUrl, profile: profile?.full_name });

      default:
        throw new BadRequestException('Unknown provider.');
    }
  }

  // ── Verify payment ─────────────────────────────────────────────────────────
  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    // Find transaction
    const { data: tx, error: txErr } = await this.supabase.admin
      .from('transactions')
      .select('*')
      .eq('provider_ref', dto.reference)
      .eq('user_id', userId)
      .single();

    if (txErr || !tx) throw new NotFoundException('Transaction not found.');
    if (tx.status === 'success') return { status: 'already_verified', transaction: tx };

    let verified = false;

    switch (dto.provider) {
      case 'paystack':
        verified = await this.verifyPaystack(dto.reference);
        break;
      case 'flutterwave':
        verified = await this.verifyFlutterwave(dto.reference);
        break;
      case 'payaza':
        verified = await this.verifyPayaza(dto.reference);
        break;
    }

    if (!verified) {
      await this.supabase.admin.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
      throw new BadRequestException('Payment verification failed.');
    }

    // Mark transaction successful
    await this.supabase.admin
      .from('transactions')
      .update({ status: 'success' })
      .eq('id', tx.id);

    // Activate subscription
    const now   = new Date();
    const end   = new Date(now);
    if (tx.billing_cycle === 'annual') end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);

    await this.supabase.admin
      .from('subscriptions')
      .upsert({
        user_id:              userId,
        plan_id:              tx.plan_id,
        billing_cycle:        tx.billing_cycle,
        status:               'active',
        provider:             dto.provider,
        current_period_start: now.toISOString(),
        current_period_end:   end.toISOString(),
        cancel_at_period_end: false,
        updated_at:           now.toISOString(),
      }, { onConflict: 'user_id' });

    return { status: 'success', plan_id: tx.plan_id, expires: end };
  }

  // ── Cancel subscription ────────────────────────────────────────────────────
  async cancelSubscription(userId: string) {
    await this.supabase.admin
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    return { message: 'Subscription will cancel at end of current period.' };
  }

  // ── Webhook handler ────────────────────────────────────────────────────────
  async handleWebhook(provider: string, payload: any, signature: string) {
    // Verify webhook signature per provider, then process
    switch (provider) {
      case 'paystack':
        return this.processPaystackWebhook(payload, signature);
      case 'flutterwave':
        return this.processFlutterwaveWebhook(payload, signature);
      default:
        return { received: true };
    }
  }

  // ── Paystack ───────────────────────────────────────────────────────────────
  private async initPaystack({ email, amount, currency, reference, callbackUrl, profile }: any) {
    const key = this.config.get('PAYSTACK_SECRET_KEY');
    if (!key) return this.mockCheckoutUrl('paystack', reference, callbackUrl);

    const res  = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email, amount: Math.round(amount * 100), // kobo/pesewas
        currency, reference, callback_url: callbackUrl,
        metadata: { full_name: profile },
      }),
    });
    const data = await res.json();
    if (!data.status) throw new BadRequestException(data.message);
    return { provider: 'paystack', checkout_url: data.data.authorization_url, reference };
  }

  private async verifyPaystack(reference: string): Promise<boolean> {
    const key = this.config.get('PAYSTACK_SECRET_KEY');
    if (!key) return true; // dev mode — auto-verify

    const res  = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    return data.status && data.data?.status === 'success';
  }

  private async processPaystackWebhook(payload: any, signature: string) {
    const secret = this.config.get('PAYSTACK_SECRET_KEY') ?? '';
    const crypto = await import('crypto');
    const hash   = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
    if (hash !== signature) return { received: false };

    if (payload.event === 'charge.success') {
      const ref = payload.data?.reference;
      if (ref) {
        const { data: tx } = await this.supabase.admin
          .from('transactions')
          .select('user_id, plan_id, billing_cycle')
          .eq('provider_ref', ref)
          .single();
        if (tx) {
          await this.verifyPayment(tx.user_id, { reference: ref, provider: 'paystack' });
        }
      }
    }
    return { received: true };
  }

  // ── Flutterwave ────────────────────────────────────────────────────────────
  private async initFlutterwave({ email, amount, currency, reference, callbackUrl, profile }: any) {
    const key = this.config.get('FLUTTERWAVE_SECRET_KEY');
    if (!key) return this.mockCheckoutUrl('flutterwave', reference, callbackUrl);

    const res  = await fetch('https://api.flutterwave.com/v3/payments', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        tx_ref:       reference,
        amount,
        currency,
        redirect_url: callbackUrl,
        customer:     { email, name: profile ?? '' },
        customizations: { title: 'GeoAfric Subscription', logo: 'https://geoafric.app/brand/logo-icon.png' },
      }),
    });
    const data = await res.json();
    if (data.status !== 'success') throw new BadRequestException(data.message);
    return { provider: 'flutterwave', checkout_url: data.data.link, reference };
  }

  private async verifyFlutterwave(reference: string): Promise<boolean> {
    const key = this.config.get('FLUTTERWAVE_SECRET_KEY');
    if (!key) return true;

    const res  = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    return data.status === 'success' && data.data?.status === 'successful';
  }

  private async processFlutterwaveWebhook(payload: any, signature: string) {
    const secret = this.config.get('FLUTTERWAVE_WEBHOOK_SECRET') ?? '';
    if (payload['verif-hash'] !== secret) return { received: false };

    if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
      const ref = payload.data?.tx_ref;
      if (ref) {
        const { data: tx } = await this.supabase.admin
          .from('transactions')
          .select('user_id')
          .eq('provider_ref', ref)
          .single();
        if (tx) await this.verifyPayment(tx.user_id, { reference: ref, provider: 'flutterwave' });
      }
    }
    return { received: true };
  }

  // ── Payaza ─────────────────────────────────────────────────────────────────
  private async initPayaza({ email, amount, currency, reference, callbackUrl, profile }: any) {
    const key = this.config.get('PAYAZA_SECRET_KEY');
    if (!key) return this.mockCheckoutUrl('payaza', reference, callbackUrl);

    // Payaza Payment Page API
    const res  = await fetch('https://api.payaza.africa/live/request/payaza-payment', {
      method:  'POST',
      headers: {
        Authorization: `Payaza ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_type:    'USERDEFINED',
        requested_amount:    amount,
        currency,
        transaction_ref:     reference,
        email_address:       email,
        full_name:           profile ?? '',
        callback_url:        callbackUrl,
        description:         'GeoAfric Subscription',
      }),
    });
    const data = await res.json();
    if (!data.response_code || data.response_code !== '00') {
      return this.mockCheckoutUrl('payaza', reference, callbackUrl);
    }
    return { provider: 'payaza', checkout_url: data.checkout_url, reference };
  }

  private async verifyPayaza(reference: string): Promise<boolean> {
    const key = this.config.get('PAYAZA_SECRET_KEY');
    if (!key) return true;

    const res  = await fetch(`https://api.payaza.africa/live/request/transaction-status/${reference}`, {
      headers: { Authorization: `Payaza ${key}` },
    });
    const data = await res.json();
    return data.transaction_status === 'successful';
  }

  // ── Dev fallback — mock checkout (no API key needed) ──────────────────────
  private mockCheckoutUrl(provider: string, reference: string, callbackUrl: string) {
    const mockUrl = `${callbackUrl}&mock=true`;
    return {
      provider,
      reference,
      checkout_url: mockUrl,
      note: `[DEV] No ${provider} key configured — payment auto-approved in dev mode.`,
    };
  }
}
