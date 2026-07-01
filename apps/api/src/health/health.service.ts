import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { LogHeartRateDto, LogActivityDto, UpdateHealthGoalsDto } from './health.dto';

@Injectable()
export class HealthService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  // ── Heart Rate ─────────────────────────────────────────────────────────────
  async logHeartRate(userId: string, dto: LogHeartRateDto) {
    const { data, error } = await this.supabase.admin
      .from('heart_rate_readings')
      .insert({
        user_id:    userId,
        bpm:        dto.bpm,
        method:     dto.method ?? 'manual',
        confidence: dto.confidence ?? null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Trigger AI anomaly check asynchronously (don't await — non-blocking)
    this.checkHeartRateAnomaly(userId, dto.bpm).catch(() => {});

    return data;
  }

  async getHeartRateHistory(userId: string, limit = 50) {
    const { data, error } = await this.supabase.admin
      .from('heart_rate_readings')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getHeartRateStats(userId: string) {
    const { data } = await this.supabase.admin
      .from('heart_rate_readings')
      .select('bpm, recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    if (!data || data.length === 0) return { avg: null, min: null, max: null, count: 0, latest: null };

    const bpms = data.map(r => r.bpm);
    return {
      avg:    Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
      min:    Math.min(...bpms),
      max:    Math.max(...bpms),
      count:  bpms.length,
      latest: data[0],
    };
  }

  // ── Activity ───────────────────────────────────────────────────────────────
  async logActivity(userId: string, dto: LogActivityDto) {
    const date = dto.date ?? new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.admin
      .from('activity_logs')
      .upsert({
        user_id:     userId,
        date,
        steps:       dto.steps,
        calories:    dto.calories ?? null,
        distance_m:  dto.distance_m ?? null,
        active_mins: dto.active_mins ?? null,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getActivityHistory(userId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase.admin
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getTodayActivity(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase.admin
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    return data ?? { steps: 0, calories: 0, distance_m: 0, active_mins: 0, date: today };
  }

  // ── Goals ──────────────────────────────────────────────────────────────────
  async getGoals(userId: string) {
    const { data } = await this.supabase.admin
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Return defaults if not set
    return data ?? {
      daily_steps: 8000, target_bpm_min: 60,
      target_bpm_max: 100, daily_water_ml: 2000,
    };
  }

  async updateGoals(userId: string, dto: UpdateHealthGoalsDto) {
    const { data, error } = await this.supabase.admin
      .from('health_goals')
      .upsert({ user_id: userId, ...dto, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── AI Insights ────────────────────────────────────────────────────────────
  async getInsights(userId: string) {
    const { data } = await this.supabase.admin
      .from('health_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    return data ?? [];
  }

  async markInsightRead(insightId: string, userId: string) {
    await this.supabase.admin
      .from('health_insights')
      .update({ read: true })
      .eq('id', insightId)
      .eq('user_id', userId);
    return { message: 'Marked as read.' };
  }

  async generateAiInsight(userId: string) {
    // Get recent health data
    const [hrStats, todayActivity, goals] = await Promise.all([
      this.getHeartRateStats(userId),
      this.getTodayActivity(userId),
      this.getGoals(userId),
    ]);

    const apiKey = this.config.get('AZURE_OPENAI_API_KEY');
    const endpoint = this.config.get('AZURE_OPENAI_ENDPOINT');
    const deployment = this.config.get('AZURE_OPENAI_DEPLOYMENT') ?? 'gpt-4o-mini';

    let insight: { type: string; title: string; message: string; severity: string };

    if (apiKey && endpoint) {
      // ── Real Azure OpenAI call ────────────────────────────────────────────
      try {
        const prompt = `You are a health wellness assistant for GeoAfric, an African family safety app.
        
User health data (last 7 days):
- Heart rate: avg ${hrStats.avg ?? 'N/A'} BPM, min ${hrStats.min ?? 'N/A'}, max ${hrStats.max ?? 'N/A'}
- Today's steps: ${todayActivity.steps} / goal ${goals.daily_steps}
- Active minutes today: ${todayActivity.active_mins ?? 0}
- BPM goal range: ${goals.target_bpm_min}–${goals.target_bpm_max}

Give one short, encouraging health tip or alert (max 2 sentences). 
Respond ONLY with JSON: {"type":"tip|alert|achievement","title":"short title","message":"message here","severity":"info|warning|critical"}`;

        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150, temperature: 0.7,
          }),
        });
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content ?? '';
        insight = JSON.parse(raw.replace(/```json|```/g, '').trim());
      } catch {
        insight = this.getFallbackInsight(hrStats, todayActivity, goals);
      }
    } else {
      // ── Placeholder — rule-based insights (works without API key) ─────────
      insight = this.getFallbackInsight(hrStats, todayActivity, goals);
    }

    // Save to database
    const { data } = await this.supabase.admin
      .from('health_insights')
      .insert({ user_id: userId, ...insight })
      .select()
      .single();

    return data;
  }

  // ── Rule-based fallback (no API key needed) ────────────────────────────────
  private getFallbackInsight(hrStats: any, activity: any, goals: any) {
    const stepPct = goals.daily_steps > 0 ? (activity.steps / goals.daily_steps) * 100 : 0;

    if (hrStats.max && hrStats.max > goals.target_bpm_max + 20) {
      return {
        type: 'alert', severity: 'warning',
        title: 'Elevated Heart Rate Detected',
        message: `Your maximum heart rate of ${hrStats.max} BPM is above your target range. Consider resting and staying hydrated.`,
      };
    }
    if (stepPct >= 100) {
      return {
        type: 'achievement', severity: 'info',
        title: '🎉 Step Goal Reached!',
        message: `You've hit your daily step goal of ${goals.daily_steps.toLocaleString()} steps. Excellent work — keep moving!`,
      };
    }
    if (stepPct >= 50) {
      return {
        type: 'tip', severity: 'info',
        title: 'Halfway to Your Goal',
        message: `You're at ${activity.steps.toLocaleString()} steps — just ${(goals.daily_steps - activity.steps).toLocaleString()} more to hit your daily target.`,
      };
    }
    return {
      type: 'tip', severity: 'info',
      title: 'Stay Active Today',
      message: `You've taken ${activity.steps.toLocaleString()} steps so far. A short 15-minute walk can add around 1,500 steps toward your goal.`,
    };
  }

  // ── Anomaly detection (async background check) ────────────────────────────
  private async checkHeartRateAnomaly(userId: string, bpm: number) {
    const goals = await this.getGoals(userId);
    if (bpm > goals.target_bpm_max + 30 || bpm < goals.target_bpm_min - 20) {
      await this.supabase.admin.from('health_insights').insert({
        user_id:  userId,
        type:     'anomaly',
        severity: bpm > 150 || bpm < 40 ? 'critical' : 'warning',
        title:    bpm > goals.target_bpm_max ? 'High Heart Rate Alert' : 'Low Heart Rate Alert',
        message:  `Reading of ${bpm} BPM is outside your normal range (${goals.target_bpm_min}–${goals.target_bpm_max} BPM). Please rest and monitor closely.`,
      });
    }
  }
}
