import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: number;
}

interface UseGeolocationOptions {
  watch?: boolean;
  intervalMs?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { watch = false, intervalMs = 30_000 } = options;

  const [position, setPosition]       = useState<GeoPosition | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [permission, setPermission]   = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading]         = useState(false);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    return status === 'granted';
  }, []);

  const getCurrent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const granted = permission === 'granted' || (await requestPermission());
      if (!granted) {
        setError('Location permission denied');
        setLoading(false);
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const pos: GeoPosition = {
        lat:       loc.coords.latitude,
        lng:       loc.coords.longitude,
        accuracy:  loc.coords.accuracy,
        timestamp: loc.timestamp,
      };
      setPosition(pos);
      return pos;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, [permission, requestPermission]);

  // ── Watch mode ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!watch) return;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const granted = await requestPermission();
      if (!granted) return;
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: intervalMs,
          distanceInterval: 10,
        },
        (loc) => {
          setPosition({
            lat:       loc.coords.latitude,
            lng:       loc.coords.longitude,
            accuracy:  loc.coords.accuracy,
            timestamp: loc.timestamp,
          });
        },
      );
    })();

    return () => { subscription?.remove(); };
  }, [watch, intervalMs, requestPermission]);

  return { position, error, permission, loading, getCurrent, requestPermission };
}
