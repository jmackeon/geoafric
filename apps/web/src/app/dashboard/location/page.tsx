'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Heart, Compass, Users, TrendingUp, Shield,
  AlertCircle, Navigation, WifiOff, Loader2,
  ZapOff, Radio, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useGeolocation } from '@/hooks/useGeolocation';
import { locationApi } from '@/lib/api/location';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FamilyMember {
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recorded_at: string;
  profiles: { full_name: string | null; avatar_url: string | null };
}

interface GeofenceZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  color: string;
}

// ── Google Maps loader ─────────────────────────────────────────────────────────
declare global { interface Window { google: any; __gmapLoaded?: boolean } }

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.__gmapLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => { window.__gmapLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { position, error: geoError, loading: geoLoading, sharing, permissionDenied, startSharing, stopSharing, triggerSOS } = useGeolocation();

  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef  = useRef<Map<string, any>>(new Map());
  const myMarker    = useRef<any>(null);
  const zonesRef    = useRef<any[]>([]);

  const [mapsReady, setMapsReady]       = useState(false);
  const [mapsError, setMapsError]       = useState(false);
  const [familyLocs, setFamilyLocs]     = useState<FamilyMember[]>([]);
  const [geofences, setGeofences]       = useState<GeofenceZone[]>([]);
  const [sosLoading, setSosLoading]     = useState(false);
  const [sosConfirm, setSosConfirm]     = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.goodMorning') : hour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const initials  = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'G';

  // ── Load Google Maps ───────────────────────────────────────────────────────
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || key === 'your-google-maps-key') { setMapsError(true); return; }
    loadGoogleMaps(key)
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true));
  }, []);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstance.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 5.6037, lng: -0.1870 }, // Default: Accra, Ghana
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f7f7f7' }] },
      ],
    });
  }, [mapsReady]);

  // ── Update my marker when position changes ─────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current || !position) return;
    const pos = { lat: position.lat, lng: position.lng };

    if (!myMarker.current) {
      // Create custom marker with user's initial
      const el = document.createElement('div');
      el.style.cssText = `
        width:40px;height:40px;border-radius:50%;background:#00B67A;
        border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:800;font-size:14px;cursor:pointer;
        font-family:Sora,sans-serif;
      `;
      el.textContent = initials;

      myMarker.current = new window.google.maps.Marker({
        position: pos,
        map: mapInstance.current,
        title: user?.full_name ?? 'You',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#00B67A',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3,
        },
        label: { text: initials, color: 'white', fontWeight: 'bold', fontSize: '12px' },
      });

      // Accuracy circle
      if (position.accuracy) {
        new window.google.maps.Circle({
          map: mapInstance.current,
          center: pos,
          radius: position.accuracy,
          fillColor: '#00B67A',
          fillOpacity: 0.08,
          strokeColor: '#00B67A',
          strokeOpacity: 0.3,
          strokeWeight: 1,
        });
      }

      mapInstance.current.panTo(pos);
    } else {
      myMarker.current.setPosition(pos);
      mapInstance.current.panTo(pos);
    }
  }, [position, mapsReady]);

  // ── Update family markers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current || !mapsReady) return;

    familyLocs.forEach((member) => {
      const pos = { lat: member.lat, lng: member.lng };
      const name = member.profiles?.full_name ?? 'Member';
      const initial = name[0]?.toUpperCase() ?? 'M';
      const existingMarker = markersRef.current.get(member.user_id);

      if (existingMarker) {
        existingMarker.setPosition(pos);
      } else {
        const marker = new window.google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          title: name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: '#F5A623',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          },
          label: { text: initial, color: '#0D1B3D', fontWeight: 'bold', fontSize: '11px' },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family:DM Sans,sans-serif;padding:4px;">
            <p style="font-weight:700;margin:0 0 2px;color:#0D1B3D">${name}</p>
            <p style="font-size:11px;color:#6B7280;margin:0">
              Last seen: ${new Date(member.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>`,
        });

        marker.addListener('click', () => infoWindow.open(mapInstance.current, marker));
        markersRef.current.set(member.user_id, marker);
      }
    });
  }, [familyLocs, mapsReady]);

  // ── Draw geofence zones ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current || !mapsReady) return;
    zonesRef.current.forEach(z => z.setMap(null));
    zonesRef.current = geofences.map(zone => {
      const circle = new window.google.maps.Circle({
        map: mapInstance.current,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radius,
        fillColor: zone.color || '#F5A623',
        fillOpacity: 0.12,
        strokeColor: zone.color || '#F5A623',
        strokeOpacity: 0.6,
        strokeWeight: 2,
      });

      new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: mapInstance.current,
        title: zone.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: zone.color || '#F5A623',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        label: { text: zone.name, color: '#0D1B3D', fontSize: '10px', fontWeight: '600' },
      });

      return circle;
    });
  }, [geofences, mapsReady]);

  // ── Load family data ───────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      locationApi.getFamilyLocations().then(r => setFamilyLocs(r.data ?? [])).catch(() => {}),
      locationApi.getGeofences().then(r => setGeofences(r.data ?? [])).catch(() => {}),
    ]);
  }, []);

  // ── SOS ───────────────────────────────────────────────────────────────────
  const handleSOS = async () => {
    if (!sosConfirm) { setSosConfirm(true); setTimeout(() => setSosConfirm(false), 5000); return; }
    setSosLoading(true);
    try {
      await triggerSOS();
      setSosConfirm(false);
      alert('🆘 SOS sent to all family members!');
    } catch {
      alert('Failed to send SOS. Please call emergency services directly.');
    } finally { setSosLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#00B67A', margin: '0 0 2px' }}>{greeting},</p>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: 0 }}>{firstName} 👋</h1>
        </div>

        {/* SOS button */}
        <button
          onClick={handleSOS}
          disabled={sosLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '14px', border: 'none',
            background: sosConfirm ? '#DC2626' : '#FEF2F2',
            color: sosConfirm ? 'white' : '#DC2626',
            fontWeight: '800', fontSize: '14px', cursor: 'pointer',
            boxShadow: sosConfirm ? '0 4px 20px rgba(220,38,38,0.5)' : 'none',
            transition: 'all 0.2s', fontFamily: 'inherit',
            animation: sosConfirm ? 'pulse-sos 0.8s ease-in-out infinite' : 'none',
          }}>
          {sosLoading
            ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            : <AlertTriangle style={{ width: '16px', height: '16px' }} />}
          {sosConfirm ? 'Tap again to confirm SOS' : 'SOS'}
        </button>
      </div>

      {/* Location control bar */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '16px',
        boxShadow: '0 2px 12px rgba(13,27,61,0.07)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%',
            background: sharing ? '#00B67A' : permissionDenied ? '#EF4444' : '#9CA3AF',
            animation: sharing ? 'pulse-dot 1.5s infinite' : 'none' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B3D', margin: 0 }}>
              {sharing ? 'Sharing location' : permissionDenied ? 'Permission denied' : 'Location off'}
            </p>
            {position && (
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                {position.accuracy ? ` · ±${Math.round(position.accuracy)}m` : ''}
              </p>
            )}
            {geoError && <p style={{ fontSize: '11px', color: '#EF4444', margin: 0 }}>{geoError}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {familyLocs.length > 0 && (
            <span style={{ fontSize: '12px', fontWeight: '600', padding: '6px 12px',
              borderRadius: '999px', background: '#FEF5E7', color: '#D97706' }}>
              {familyLocs.length} member{familyLocs.length !== 1 ? 's' : ''} on map
            </span>
          )}
          <button
            onClick={sharing ? stopSharing : startSharing}
            disabled={geoLoading || permissionDenied}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '12px', border: 'none',
              background: sharing ? '#FEF2F2' : '#00B67A',
              color: sharing ? '#DC2626' : 'white',
              fontWeight: '700', fontSize: '13px',
              cursor: geoLoading || permissionDenied ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: permissionDenied ? 0.5 : 1,
            }}>
            {geoLoading
              ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
              : sharing
              ? <WifiOff style={{ width: '14px', height: '14px' }} />
              : <Navigation style={{ width: '14px', height: '14px' }} />}
            {geoLoading ? 'Getting location…' : sharing ? 'Stop sharing' : 'Share location'}
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(13,27,61,0.07)', position: 'relative' }}>

        {/* Map container */}
        <div ref={mapRef} style={{ width: '100%', height: '420px' }} />

        {/* Map loading/error states */}
        {!mapsReady && !mapsError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#F9FAFB', flexDirection: 'column', gap: '12px' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: '#00B67A', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Loading map…</p>
          </div>
        )}

        {mapsError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#F9FAFB', flexDirection: 'column', gap: '12px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#FEF5E7',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin style={{ width: '32px', height: '32px', color: '#F5A623' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D', margin: '0 0 4px' }}>
                Google Maps API Key Required
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px' }}>
                Add your key to <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>apps/web/.env.local</code>
              </p>
              <code style={{ fontSize: '12px', background: '#F3F4F6', padding: '8px 12px',
                borderRadius: '8px', display: 'block', color: '#0D1B3D' }}>
                NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-key-here
              </code>
            </div>
          </div>
        )}

        {/* Map legend */}
        {mapsReady && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px',
            background: 'white', borderRadius: '12px', padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', gap: '16px' }}>
            {[
              { color: '#00B67A', label: 'You' },
              { color: '#F5A623', label: 'Family' },
              { color: '#F5A623', label: 'Geofence', opacity: 0.3 },
            ].map(({ color, label, opacity }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                  background: color, opacity: opacity ?? 1 }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family members list */}
      {familyLocs.length > 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: '0 0 14px' }}>
            Family on map
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {familyLocs.map(member => {
              const name = member.profiles?.full_name ?? 'Family member';
              const ago = Math.round((Date.now() - new Date(member.recorded_at).getTime()) / 60000);
              return (
                <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px', borderRadius: '12px', background: '#F9FAFB' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px',
                    background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', color: '#0D1B3D' }}>
                      {name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B3D', margin: '0 0 1px' }}>{name}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                      {ago < 1 ? 'Just now' : `${ago}m ago`} · {member.lat.toFixed(3)}, {member.lng.toFixed(3)}
                    </p>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: ago < 5 ? '#00B67A' : ago < 30 ? '#F5A623' : '#9CA3AF' }} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)', textAlign: 'center' }}>
          <Users style={{ width: '36px', height: '36px', color: '#D1D5DB', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px' }}>
            No family members on the map yet
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 14px' }}>
            Invite family members to see their locations here
          </p>
          <Link href="/dashboard/family" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '12px', background: '#F5A623',
            color: '#0D1B3D', fontWeight: '700', fontSize: '13px', textDecoration: 'none',
          }}>
            <Users style={{ width: '14px', height: '14px' }} />
            Invite family
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes pulse-sos { 0%,100%{box-shadow:0 4px 20px rgba(220,38,38,0.5)} 50%{box-shadow:0 4px 30px rgba(220,38,38,0.9)} }
      `}</style>
    </div>
  );
}
