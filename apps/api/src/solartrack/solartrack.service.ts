import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDeviceDto, IngestTelemetryDto } from './solartrack.dto';

@Injectable()
export class SolarTrackService {
  constructor(private supabase: SupabaseService) {}

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const { data, error } = await this.supabase.admin
      .from('solar_devices')
      .insert({ user_id: userId, serial_number: dto.serial_number, name: dto.name ?? 'My SolarTrack',
        panel_count: dto.panel_count ?? 1, panel_capacity_w: dto.panel_capacity_w ?? null,
        battery_capacity_wh: dto.battery_capacity_wh ?? null, location_label: dto.location_label ?? null })
      .select().single();
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async getDevices(userId: string) {
    const { data } = await this.supabase.admin.from('solar_devices').select('*').eq('user_id', userId).order('registered_at', { ascending: false });
    return data ?? [];
  }

  async getLatestTelemetry(userId: string) {
    const { data: devices } = await this.supabase.admin.from('solar_devices').select('id').eq('user_id', userId);
    if (!devices?.length) return [];
    const results = await Promise.all(devices.map(async d => {
      const { data } = await this.supabase.admin.from('solar_telemetry')
        .select('*, solar_devices(name, serial_number, panel_capacity_w, battery_capacity_wh, location_label)')
        .eq('device_id', d.id).order('recorded_at', { ascending: false }).limit(1).single();
      return data;
    }));
    return results.filter(Boolean);
  }

  async getTelemetryHistory(userId: string, deviceId: string, hours = 24) {
    const { data: device } = await this.supabase.admin.from('solar_devices').select('id').eq('id', deviceId).eq('user_id', userId).single();
    if (!device) throw new NotFoundException('Device not found.');
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { data } = await this.supabase.admin.from('solar_telemetry')
      .select('solar_watts, battery_pct, load_watts, grid_watts, recorded_at')
      .eq('device_id', deviceId).gte('recorded_at', since).order('recorded_at', { ascending: true });
    return data ?? [];
  }

  async getAlerts(userId: string, includeResolved = false) {
    let q = this.supabase.admin.from('solar_alerts').select('*, solar_devices(name, serial_number)')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (!includeResolved) q = q.eq('resolved', false);
    const { data } = await q;
    return data ?? [];
  }

  async resolveAlert(userId: string, alertId: string) {
    await this.supabase.admin.from('solar_alerts').update({ resolved: true }).eq('id', alertId).eq('user_id', userId);
    return { message: 'Alert resolved.' };
  }

  async ingestTelemetry(dto: IngestTelemetryDto) {
    const { data: device } = await this.supabase.admin.from('solar_devices')
      .select('id, user_id, panel_capacity_w').eq('serial_number', dto.serial_number).single();
    if (!device) throw new NotFoundException('Device not registered.');

    const efficiency = device.panel_capacity_w && dto.solar_watts
      ? Math.min(100, (dto.solar_watts / device.panel_capacity_w) * 100) : null;

    const { data: telemetry } = await this.supabase.admin.from('solar_telemetry').insert({
      device_id: device.id, solar_watts: dto.solar_watts ?? null, solar_voltage: dto.solar_voltage ?? null,
      solar_current: dto.solar_current ?? null, battery_pct: dto.battery_pct ?? null,
      battery_voltage: dto.battery_voltage ?? null, battery_status: dto.battery_status ?? null,
      grid_watts: dto.grid_watts ?? null, load_watts: dto.load_watts ?? null,
      temperature_c: dto.temperature_c ?? null, efficiency_pct: efficiency,
    }).select().single();

    await this.supabase.admin.from('solar_devices').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', device.id);
    await this.checkAlerts(device.id, device.user_id, dto);
    return { received: true, telemetry_id: telemetry?.id };
  }

  private async checkAlerts(deviceId: string, userId: string, dto: IngestTelemetryDto) {
    const alerts: any[] = [];
    if (dto.battery_pct !== undefined && dto.battery_pct < 15)
      alerts.push({ device_id: deviceId, user_id: userId, type: 'low_battery', severity: 'critical',
        title: '🔋 Critical Battery Level', message: `Battery at ${dto.battery_pct.toFixed(1)}%. Connect to grid immediately.` });
    else if (dto.battery_pct !== undefined && dto.battery_pct < 25)
      alerts.push({ device_id: deviceId, user_id: userId, type: 'low_battery', severity: 'warning',
        title: '🔋 Low Battery', message: `Battery at ${dto.battery_pct.toFixed(1)}%. Monitor generation.` });
    if (dto.temperature_c !== undefined && dto.temperature_c > 75)
      alerts.push({ device_id: deviceId, user_id: userId, type: 'overtemperature', severity: 'warning',
        title: '🌡️ High Panel Temperature', message: `${dto.temperature_c.toFixed(1)}°C — check ventilation.` });
    const h = new Date().getHours();
    if (dto.solar_watts !== undefined && dto.solar_watts < 10 && h >= 8 && h <= 17)
      alerts.push({ device_id: deviceId, user_id: userId, type: 'panel_fault', severity: 'warning',
        title: '☀️ Low Solar Output', message: `Only ${dto.solar_watts.toFixed(0)}W during daylight — check for shading.` });
    if (alerts.length) await this.supabase.admin.from('solar_alerts').insert(alerts);
  }

  async getSummary(userId: string) {
    const [devices, latest, alerts] = await Promise.all([
      this.getDevices(userId), this.getLatestTelemetry(userId), this.getAlerts(userId),
    ]);
    const totalWatts = latest.reduce((s: number, t: any) => s + (t?.solar_watts ?? 0), 0);
    const avgBattery = latest.length ? latest.reduce((s: number, t: any) => s + (t?.battery_pct ?? 0), 0) / latest.length : 0;
    return { device_count: devices.length, online_count: devices.filter((d: any) => d.is_online).length,
      total_watts: totalWatts, avg_battery_pct: avgBattery, unresolved_alerts: alerts.length, latest };
  }
}
