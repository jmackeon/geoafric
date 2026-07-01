import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  Search, Compass, Utensils, Heart, GraduationCap, Banknote, Shield,
  Bus, ShoppingBag, Star, Bookmark, BookmarkCheck,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { api } from '@/lib/api';
import { colors, radius, spacing, typography, shadows } from '@/lib/theme';

interface Place {
  google_place_id: string; name: string; address: string | null; category: string;
  lat: number | null; lng: number | null; rating: number | null; open_now: boolean | null;
}
interface SavedPlace extends Place { id: string; }

const ACCRA = { lat: 5.6037, lng: -0.187 };

const CATEGORIES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  other:      { label: 'Other',     icon: Compass,       color: colors.navy,  bg: 'rgba(13,27,61,0.08)' },
  food:       { label: 'Food',      icon: Utensils,      color: '#EF4444',    bg: '#FEF2F2' },
  health:     { label: 'Health',    icon: Heart,         color: colors.green, bg: '#F0FDF4' },
  education:  { label: 'Education', icon: GraduationCap, color: '#8B5CF6',    bg: '#F5F3FF' },
  finance:    { label: 'Finance',   icon: Banknote,      color: colors.gold,  bg: '#FEF5E7' },
  safety:     { label: 'Safety',    icon: Shield,        color: '#DC2626',    bg: '#FEF2F2' },
  transport:  { label: 'Transport', icon: Bus,           color: '#0EA5E9',    bg: '#F0F9FF' },
  shopping:   { label: 'Shopping',  icon: ShoppingBag,   color: '#EC4899',    bg: '#FDF2F8' },
};
const catConfig = (id: string) => CATEGORIES[id] ?? CATEGORIES.other;

// Haversine distance in km between two lat/lng points.
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function DiscoverScreen() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [nearby, setNearby] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silent, no-prompt position check — full permission UX lives on the Location tab.
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(async ({ status }) => {
      if (status === 'granted') {
        try {
          const current = await Location.getCurrentPositionAsync({});
          setPosition({ lat: current.coords.latitude, lng: current.coords.longitude });
        } catch { /* fall back to default below */ }
      }
    });
  }, []);

  const loadSaved = async () => {
    try {
      const { data } = await api.get('/places/saved');
      setSavedPlaces(data ?? []);
      setSavedIds(new Set((data ?? []).map((p: SavedPlace) => p.google_place_id)));
    } catch { /* silent */ }
  };

  const loadNearby = async (q?: string) => {
    setLoading(true);
    try {
      const { lat, lng } = position ?? ACCRA;
      const { data } = await api.get('/places/search', { params: { lat, lng, query: q || undefined, radius: 2000 } });
      setNearby(data ?? []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load nearby places' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSaved(); }, []);
  useEffect(() => { loadNearby(); }, [position]);

  const onSearchChange = (text: string) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadNearby(text), 500);
  };

  const toggleSave = async (place: Place) => {
    const saved = savedIds.has(place.google_place_id);
    try {
      if (saved) {
        await api.delete(`/places/saved/${place.google_place_id}`);
        setSavedIds(prev => { const s = new Set(prev); s.delete(place.google_place_id); return s; });
        setSavedPlaces(prev => prev.filter(p => p.google_place_id !== place.google_place_id));
      } else {
        await api.post('/places/saved', {
          google_place_id: place.google_place_id, name: place.name, address: place.address,
          category: place.category, lat: place.lat, lng: place.lng, rating: place.rating,
        });
        setSavedIds(prev => new Set([...prev, place.google_place_id]));
        Toast.show({ type: 'success', text1: 'Place saved! 📍' });
        loadSaved();
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update saved places' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={typography.h2}>Discover</Text>
        <View style={styles.searchRow}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={query} onChangeText={onSearchChange}
            placeholder="Search hospitals, markets, ATMs…" placeholderTextColor={colors.textLight}
            style={styles.searchInput} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg }}>
        {/* Saved places */}
        <View>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Saved Places</Text>
          {savedPlaces.length === 0 ? (
            <View style={[styles.emptyInline, shadows.sm]}>
              <Bookmark size={24} color={colors.border} />
              <Text style={[typography.bodyMuted, { marginTop: spacing.xs }]}>No saved places yet</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              {savedPlaces.map((place) => {
                const cat = catConfig(place.category);
                const dist = position && place.lat && place.lng ? distanceKm(position, { lat: place.lat, lng: place.lng }) : null;
                return (
                  <View key={place.id} style={[styles.savedCard, shadows.sm]}>
                    <View style={[styles.savedIcon, { backgroundColor: cat.bg }]}>
                      <cat.icon size={20} color={cat.color} />
                    </View>
                    <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]} numberOfLines={1}>{place.name}</Text>
                    <Text style={typography.caption} numberOfLines={1}>
                      {dist !== null ? `${dist.toFixed(1)}km away` : cat.label}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Nearby */}
        <View>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Nearby</Text>
          {loading ? (
            <ActivityIndicator color={colors.green} />
          ) : nearby.length === 0 ? (
            <View style={[styles.emptyInline, shadows.sm]}>
              <Compass size={24} color={colors.border} />
              <Text style={[typography.bodyMuted, { marginTop: spacing.xs }]}>No places found</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {nearby.map((place) => {
                const cat = catConfig(place.category);
                const saved = savedIds.has(place.google_place_id);
                const dist = position && place.lat && place.lng ? distanceKm(position, { lat: place.lat, lng: place.lng }) : null;
                return (
                  <View key={place.google_place_id} style={[styles.nearbyRow, shadows.sm]}>
                    <View style={[styles.savedIcon, { backgroundColor: cat.bg }]}>
                      <cat.icon size={18} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.body, { fontFamily: 'DMSans-Bold' }]} numberOfLines={1}>{place.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        {place.rating && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Star size={11} color={colors.gold} fill={colors.gold} />
                            <Text style={typography.caption}>{place.rating}</Text>
                          </View>
                        )}
                        <Text style={typography.caption} numberOfLines={1}>
                          {dist !== null ? `${dist.toFixed(1)}km · ` : ''}{place.address ?? cat.label}
                        </Text>
                      </View>
                    </View>
                    <Pressable onPress={() => toggleSave(place)} hitSlop={8}>
                      {saved
                        ? <BookmarkCheck size={20} color={colors.gold} />
                        : <Bookmark size={20} color={colors.textLight} />}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: spacing.md,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 14, color: colors.text },
  emptyInline: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.xl, alignItems: 'center',
  },
  savedCard: {
    width: 130, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md,
  },
  savedIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  nearbyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md,
  },
});
