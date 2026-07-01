'use client';

/**
 * useGeolocation — Cross-platform location hook
 *
 * Web:    uses navigator.geolocation (Browser API)
 * Mobile: swap navigator.geolocation calls with expo-location equivalents
 *         (same interface, just different underlying API)
 *
 * The locationApi.updateLocation() call is platform-agnostic —
 * it sends to the same NestJS endpoint from both web and mobile.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { locationApi } from '@/lib/api/location';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  sharing: boolean;
  permissionDenied: boolean;
  startSharing: () => void;
  stopSharing: () => void;
  triggerSOS: () => Promise<void>;
}

export function useGeolocation(autoStart = false): UseGeolocationReturn {
  const [position, setPosition]           = useState<GeoPosition | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [sharing, setSharing]             = useState(false);
  const [permissionDenied, setDenied]     = useState(false);
  const watchIdRef                         = useRef<number | null>(null);
  const intervalRef                        = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef                        = useRef<number>(0);
  const SEND_INTERVAL_MS                   = 30_000; // send to API every 30s

  const sendToApi = useCallback(async (pos: GeoPosition) => {
    const now = Date.now();
    if (now - lastSentRef.current < SEND_INTERVAL_MS) return;
    lastSentRef.current = now;

    try {
      await locationApi.updateLocation({
        lat:      pos.lat,
        lng:      pos.lng,
        accuracy: pos.accuracy ?? undefined,
        altitude: pos.altitude ?? undefined,
        speed:    pos.speed ?? undefined,
        heading:  pos.heading ?? undefined,
        source:   'browser',
        // Mobile: change source to 'mobile' in the React Native version
      });
    } catch {
      // Silent fail — don't interrupt tracking if API is temporarily down
    }
  }, []);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);
    setSharing(true);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    // Get immediate position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geoPos: GeoPosition = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          altitude:  pos.coords.altitude,
          speed:     pos.coords.speed,
          heading:   pos.coords.heading,
          timestamp: pos.timestamp,
        };
        setPosition(geoPos);
        setLoading(false);
        sendToApi(geoPos);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDenied(true);
          setError('Location permission denied. Please enable it in your browser settings.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('Unable to get your location. Please check your GPS settings.');
        }
        setSharing(false);
      },
      options,
    );

    // Watch for position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const geoPos: GeoPosition = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          altitude:  pos.coords.altitude,
          speed:     pos.coords.speed,
          heading:   pos.coords.heading,
          timestamp: pos.timestamp,
        };
        setPosition(geoPos);
        setError(null);
        sendToApi(geoPos);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setDenied(true);
          stopSharing();
        }
      },
      options,
    );
  }, [sendToApi]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSharing(false);

    // Tell API we stopped sharing
    locationApi.updateSettings({ sharing_enabled: false }).catch(() => {});
  }, []);

  const triggerSOS = useCallback(async () => {
    if (!position) {
      // Try to get position first
      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await locationApi.triggerSOS(pos.coords.latitude, pos.coords.longitude);
              resolve();
            } catch { reject(new Error('SOS failed')); }
          },
          () => reject(new Error('Cannot get location for SOS')),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      });
    }
    await locationApi.triggerSOS(position.lat, position.lng);
  }, [position]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) startSharing();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { position, error, loading, sharing, permissionDenied, startSharing, stopSharing, triggerSOS };
}
