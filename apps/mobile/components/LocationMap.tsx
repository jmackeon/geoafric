import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, radius } from '@/lib/theme';

const ACCRA = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.15, longitudeDelta: 0.15 };

interface FamilyLoc {
  user_id: string; lat: number; lng: number; recorded_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}
interface Geofence { id: string; lat: number; lng: number; radius_m: number; }

interface Props {
  position: { latitude: number; longitude: number } | null;
  myInitials: string;
  familyLocs: FamilyLoc[];
  geofences: Geofence[];
}

function minutesAgo(iso: string) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000);
}

function AvatarBubble({ initials, color }: { initials: string; color: string }) {
  return (
    <View style={[styles.bubble, { backgroundColor: color }]}>
      <Text style={styles.bubbleText}>{initials}</Text>
    </View>
  );
}

export function LocationMap({ position, myInitials, familyLocs, geofences }: Props) {
  const mapRef = useRef<MapView>(null);
  const hasCenteredRef = useRef(false);

  // Center once on initial load: average of family member positions if any
  // exist, otherwise the user's own position. Deliberately doesn't re-center
  // on every poll so the map doesn't jump while someone's looking at it.
  useEffect(() => {
    if (hasCenteredRef.current) return;
    if (familyLocs.length > 0) {
      const avgLat = familyLocs.reduce((s, l) => s + l.lat, 0) / familyLocs.length;
      const avgLng = familyLocs.reduce((s, l) => s + l.lng, 0) / familyLocs.length;
      mapRef.current?.animateToRegion({ latitude: avgLat, longitude: avgLng, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 600);
      hasCenteredRef.current = true;
    } else if (position) {
      mapRef.current?.animateToRegion({ ...position, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 600);
      hasCenteredRef.current = true;
    }
  }, [familyLocs, position]);

  return (
    <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={ACCRA}>
      {position && (
        <Marker coordinate={position} anchor={{ x: 0.5, y: 0.5 }}>
          <AvatarBubble initials={myInitials} color={colors.green} />
          <Callout tooltip={false}>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutName}>You</Text>
              <Text style={styles.calloutSub}>Current location</Text>
            </View>
          </Callout>
        </Marker>
      )}
      {familyLocs.map((m) => {
        const name = m.profiles?.full_name ?? 'Family member';
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'F';
        const ago = minutesAgo(m.recorded_at);
        return (
          <Marker key={m.user_id} coordinate={{ latitude: m.lat, longitude: m.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <AvatarBubble initials={initials} color={colors.gold} />
            <Callout tooltip={false}>
              <View style={styles.calloutBox}>
                <Text style={styles.calloutName}>{name}</Text>
                <Text style={styles.calloutSub}>{ago < 1 ? 'Just now' : `${ago}m ago`}</Text>
              </View>
            </Callout>
          </Marker>
        );
      })}
      {geofences.map((z) => (
        <Circle
          key={z.id}
          center={{ latitude: z.lat, longitude: z.lng }}
          radius={z.radius_m}
          fillColor="rgba(245,166,35,0.15)"
          strokeColor="rgba(245,166,35,0.6)"
          strokeWidth={2} />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  bubble: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3,
    elevation: 4,
  },
  bubbleText: { color: '#FFFFFF', fontFamily: 'Sora-ExtraBold', fontSize: 13 },
  calloutBox: { minWidth: 120, padding: 4 },
  calloutName: { fontFamily: 'Sora-Bold', fontSize: 13, color: colors.text },
  calloutSub: { fontFamily: 'DMSans-Regular', fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
