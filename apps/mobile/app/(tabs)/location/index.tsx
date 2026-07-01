import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import {
  Navigation, WifiOff, AlertTriangle, Users, MapPin, CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { LocationMap } from '@/components/LocationMap';
import { api } from '@/lib/api';
import { useAuthStore } from '@geoafric/shared';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface FamilyLoc {
  user_id: string; lat: number; lng: number; recorded_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}
interface Geofence { id: string; name: string; lat: number; lng: number; radius_m: number; }

const POLL_INTERVAL_MS = 30000;
const SOS_HOLD_MS = 3000;

type PermStatus = 'checking' | 'undetermined' | 'denied' | 'granted';

export default function LocationScreen() {
  const { user } = useAuthStore();
  const watchSub = useRef<Location.LocationSubscription | null>(null);

  const myInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'Y';

  const [permStatus, setPermStatus] = useState<PermStatus>('checking');
  const [position, setPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [sharing, setSharing]   = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [familyLocs, setFamilyLocs] = useState<FamilyLoc[]>([]);
  const [geofences, setGeofences]   = useState<Geofence[]>([]);
  const [loading, setLoading]       = useState(true);

  // SOS hold-to-confirm
  const sosAnim = useRef(new Animated.Value(0)).current;
  const sosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sosHolding, setSosHolding] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // ── Permission check (silent — no prompt) on mount ──────────────────────────
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermStatus(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
    });
  }, []);

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermStatus(status === 'granted' ? 'granted' : 'denied');
  };

  // ── Family data — poll every 30s, only while this tab is focused ───────────
  const loadFamily = useCallback(async () => {
    try {
      const [locs, fences] = await Promise.all([
        api.get('/location/family'),
        api.get('/location/geofences'),
      ]);
      setFamilyLocs(locs.data ?? []);
      setGeofences(fences.data ?? []);
    } catch { /* silent — keep showing last known data */ }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFamily();
      const interval = setInterval(loadFamily, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadFamily]),
  );

  useEffect(() => {
    return () => { watchSub.current?.remove(); };
  }, []);

  const startSharing = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      if (permStatus !== 'granted') {
        await requestPermission();
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPosition(current.coords);

      await api.post('/location', {
        lat: current.coords.latitude, lng: current.coords.longitude,
        accuracy: current.coords.accuracy ?? undefined, source: 'mobile',
      }).catch(() => {});

      watchSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 25 },
        (loc) => {
          setPosition(loc.coords);
          api.post('/location', {
            lat: loc.coords.latitude, lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? undefined, speed: loc.coords.speed ?? undefined,
            heading: loc.coords.heading ?? undefined, source: 'mobile',
          }).catch(() => {});
        },
      );

      await api.patch('/location/settings', { sharing_enabled: true, share_with_family: true }).catch(() => {});
      setSharing(true);
    } catch {
      setGeoError('Could not get your location.');
    } finally {
      setGeoLoading(false);
    }
  };

  const stopSharing = async () => {
    watchSub.current?.remove();
    watchSub.current = null;
    setSharing(false);
    await api.patch('/location/settings', { sharing_enabled: false }).catch(() => {});
  };

  // ── SOS: 3-second press-and-hold ────────────────────────────────────────────
  const triggerSOS = async () => {
    setSosHolding(false);
    setSosLoading(true);
    try {
      if (permStatus !== 'granted') {
        Toast.show({ type: 'error', text1: 'Location permission required for SOS', text2: 'Enable location access first.' });
        Animated.timing(sosAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        return;
      }
      let coords = position;
      if (!coords) {
        const current = await Location.getCurrentPositionAsync({});
        coords = current.coords;
      }
      await api.post('/location/sos', { lat: coords.latitude, lng: coords.longitude });
      setSosSent(true);
      Toast.show({ type: 'success', text1: '🆘 Alert sent to all family members!' });
      setTimeout(() => { setSosSent(false); sosAnim.setValue(0); }, 4000);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to send SOS', text2: 'Call emergency services directly.' });
      Animated.timing(sosAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    } finally {
      setSosLoading(false);
    }
  };

  const handleSosPressIn = () => {
    if (sosLoading || sosSent) return;
    setSosHolding(true);
    sosAnim.setValue(0);
    Animated.timing(sosAnim, { toValue: 1, duration: SOS_HOLD_MS, useNativeDriver: false }).start();
    sosTimer.current = setTimeout(triggerSOS, SOS_HOLD_MS);
  };

  const handleSosPressOut = () => {
    if (sosLoading || sosSent) return;
    setSosHolding(false);
    if (sosTimer.current) { clearTimeout(sosTimer.current); sosTimer.current = null; }
    Animated.timing(sosAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Family Map</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing['4xl'] }}>
        {/* Permission gate / status bar */}
        {permStatus !== 'granted' ? (
          <View style={[styles.permCard, shadows.sm]}>
            <View style={styles.permIcon}>
              <MapPin size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>
                {permStatus === 'denied' ? 'Location permission denied' : 'Enable location sharing'}
              </Text>
              <Text style={typography.bodyMuted}>
                {permStatus === 'denied'
                  ? 'GeoAfric needs location access to share your position with family and use SOS. Enable it in your device settings.'
                  : permStatus === 'checking'
                  ? 'Checking permission…'
                  : 'Allow GeoAfric to access your location so family can see you on the map and you can use SOS.'}
              </Text>
            </View>
            {permStatus !== 'checking' && (
              <Button
                label={permStatus === 'denied' ? 'Open Settings' : 'Enable'}
                onPress={permStatus === 'denied' ? () => Linking.openSettings() : requestPermission} />
            )}
          </View>
        ) : (
          <View style={[styles.statusBar, shadows.sm]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
              <View style={[styles.dot, { backgroundColor: sharing ? colors.green : colors.textLight }]} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>
                  {sharing ? 'Sharing location' : 'Location off'}
                </Text>
                {position && (
                  <Text style={typography.caption}>
                    {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                    {position.accuracy ? ` · ±${Math.round(position.accuracy)}m` : ''}
                  </Text>
                )}
                {geoError && <Text style={[typography.caption, { color: colors.danger }]}>{geoError}</Text>}
              </View>
            </View>
            <Pressable
              onPress={sharing ? stopSharing : startSharing}
              disabled={geoLoading}
              style={[styles.shareBtn, sharing && styles.shareBtnActive]}>
              {geoLoading
                ? <ActivityIndicator size="small" color={sharing ? colors.danger : colors.white} />
                : sharing ? <WifiOff size={14} color={colors.danger} /> : <Navigation size={14} color={colors.white} />}
              <Text style={[typography.caption, { color: sharing ? colors.danger : colors.white, fontFamily: 'DMSans-Bold' }]}>
                {geoLoading ? 'Locating…' : sharing ? 'Stop' : 'Share location'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapCard}>
          <LocationMap
            position={position ? { latitude: position.latitude, longitude: position.longitude } : null}
            myInitials={myInitials}
            familyLocs={familyLocs}
            geofences={geofences} />
        </View>

        {/* Family list */}
        <View style={[styles.listCard, shadows.sm]}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Family on map</Text>
          {loading ? (
            <ActivityIndicator color={colors.green} />
          ) : familyLocs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Users size={32} color={colors.border} />
              <Text style={[typography.bodyMuted, { marginTop: spacing.sm, textAlign: 'center' }]}>
                No family members on the map yet
              </Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {familyLocs.map((m) => {
                const name = m.profiles?.full_name ?? 'Family member';
                const initial = name[0]?.toUpperCase() ?? 'F';
                const ago = Math.round((Date.now() - new Date(m.recorded_at).getTime()) / 60000);
                return (
                  <View key={m.user_id} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={{ color: colors.navy, fontFamily: 'Sora-ExtraBold', fontSize: 13 }}>{initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]}>{name}</Text>
                      <Text style={typography.caption}>
                        {ago < 1 ? 'Just now' : `${ago}m ago`} · {m.lat.toFixed(3)}, {m.lng.toFixed(3)}
                      </Text>
                    </View>
                    <View style={[styles.liveDot, { backgroundColor: ago < 5 ? colors.green : ago < 30 ? colors.gold : colors.textLight }]} />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky SOS bar — sits above the tab bar, not inline in the scroll */}
      <View style={[styles.sosBar, shadows.lg]}>
        <Pressable
          onPressIn={handleSosPressIn}
          onPressOut={handleSosPressOut}
          disabled={sosLoading || sosSent}
          style={[styles.sosButton, sosSent && styles.sosButtonSent]}>
          <Animated.View style={[
            styles.sosFill,
            { width: sosAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]} />
          <View style={styles.sosContent}>
            {sosLoading
              ? <ActivityIndicator color={colors.white} />
              : sosSent
              ? <CheckCircle2 size={18} color={colors.white} />
              : <AlertTriangle size={18} color={colors.white} />}
            <Text style={styles.sosLabel}>
              {sosSent ? 'Alert sent' : sosLoading ? 'Sending…' : sosHolding ? 'Keep holding…' : 'Hold for SOS (3s)'}
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  permCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.lg,
    margin: spacing.xl, marginBottom: spacing.lg, padding: spacing.lg,
  },
  permIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,166,35,0.12)',
  },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.lg,
    margin: spacing.xl, marginBottom: spacing.lg, padding: spacing.lg,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md,
    backgroundColor: colors.green,
  },
  shareBtnActive: { backgroundColor: '#FEF2F2' },
  mapCard: {
    marginHorizontal: spacing.xl, marginBottom: spacing.lg,
    borderRadius: radius.xl, overflow: 'hidden', height: 320,
    backgroundColor: colors.white,
  },
  listCard: {
    marginHorizontal: spacing.xl, backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg,
  },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt,
  },
  memberAvatar: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  sosBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  sosButton: {
    height: 52, borderRadius: radius.lg, overflow: 'hidden',
    backgroundColor: '#DC2626', position: 'relative',
  },
  sosButtonSent: { backgroundColor: colors.green },
  sosFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sosContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  sosLabel: { color: colors.white, fontFamily: 'DMSans-Bold', fontSize: 15 },
});
