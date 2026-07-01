'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Compass, MapPin, Heart, GraduationCap, Banknote,
  Shield, Bus, ShoppingBag, Search, Bookmark,
  BookmarkCheck, Star, Clock, Phone, Globe,
  Loader2, X, Zap, ChevronRight, Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { placesApi } from '@/lib/api/places';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslation } from '@/i18n/TranslationProvider';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Place {
  google_place_id: string;
  name: string;
  address: string | null;
  category: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  user_ratings: number;
  open_now: boolean | null;
  photo_url: string | null;
  types: string[];
}

interface SavedPlace extends Place {
  id: string;
  notes: string | null;
  visited: boolean;
  created_at: string;
}

interface Recommendation {
  id: string;
  name: string;
  category: string;
  reason: string;
  score: number;
  dismissed: boolean;
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',        label: 'All',        icon: Compass,      color: '#0D1B3D', bg: '#EFF6FF' },
  { id: 'food',       label: 'Food',       icon: Heart,        color: '#EF4444', bg: '#FEF2F2' },
  { id: 'health',     label: 'Health',     icon: Heart,        color: '#00B67A', bg: '#F0FDF4' },
  { id: 'education',  label: 'Education',  icon: GraduationCap,color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'finance',    label: 'Finance',    icon: Banknote,     color: '#F5A623', bg: '#FEF5E7' },
  { id: 'safety',     label: 'Safety',     icon: Shield,       color: '#DC2626', bg: '#FEF2F2' },
  { id: 'transport',  label: 'Transport',  icon: Bus,          color: '#0EA5E9', bg: '#F0F9FF' },
  { id: 'shopping',   label: 'Shopping',   icon: ShoppingBag,  color: '#EC4899', bg: '#FDF2F8' },
];

const getCategoryConfig = (id: string) =>
  CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const { t } = useTranslation();
  const { position, startSharing } = useGeolocation();

  const [activeTab, setActiveTab]         = useState<'discover'|'saved'|'ai'>('discover');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [places, setPlaces]               = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces]     = useState<SavedPlace[]>([]);
  const [recommendations, setRecs]        = useState<Recommendation[]>([]);
  const [savedIds, setSavedIds]           = useState<Set<string>>(new Set());
  const [loading, setLoading]             = useState(false);
  const [recLoading, setRecLoading]       = useState(false);
  const [selected, setSelected]           = useState<Place | null>(null);
  const searchTimer                       = useRef<any>(null);

  // Load saved places on mount
  useEffect(() => {
    loadSaved();
    if (!position) startSharing();
  }, []);

  // Auto-search when category/position changes
  useEffect(() => {
    if (activeTab === 'discover') doSearch();
  }, [activeCategory, position]);

  // Debounced search on query change
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (activeTab === 'discover') doSearch();
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const { data } = await placesApi.search({
        lat:      position?.lat,
        lng:      position?.lng,
        category: activeCategory === 'all' ? undefined : activeCategory,
        query:    searchQuery || undefined,
        radius:   2000,
      });
      setPlaces(data ?? []);
    } catch {
      toast.error('Search failed. Showing sample places.');
    } finally {
      setLoading(false);
    }
  };

  const loadSaved = async () => {
    try {
      const { data } = await placesApi.getSaved();
      setSavedPlaces(data ?? []);
      setSavedIds(new Set((data ?? []).map((p: SavedPlace) => p.google_place_id)));
    } catch {}
  };

  const loadRecommendations = async () => {
    setRecLoading(true);
    try {
      const { data } = await placesApi.getRecommendations(
        position?.lat ?? 5.6037,
        position?.lng ?? -0.1870,
      );
      setRecs(data ?? []);
    } catch {
      toast.error('Could not load recommendations.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleSave = async (place: Place) => {
    try {
      if (savedIds.has(place.google_place_id)) {
        await placesApi.unsavePlace(place.google_place_id);
        setSavedIds(prev => { const s = new Set(prev); s.delete(place.google_place_id); return s; });
        setSavedPlaces(prev => prev.filter(p => p.google_place_id !== place.google_place_id));
        toast.success('Removed from saved');
      } else {
        await placesApi.savePlace({
          google_place_id: place.google_place_id,
          name:      place.name,
          address:   place.address,
          category:  place.category,
          lat:       place.lat,
          lng:       place.lng,
          rating:    place.rating,
          photo_url: place.photo_url,
        });
        setSavedIds(prev => new Set([...prev, place.google_place_id]));
        toast.success('Place saved! 📍');
        loadSaved();
      }
    } catch {
      toast.error('Failed to update saved places.');
    }
  };

  const handleDismissRec = async (id: string) => {
    await placesApi.dismissRec(id).catch(() => {});
    setRecs(prev => prev.filter(r => r.id !== id));
  };

  const TABS = [
    { id: 'discover', label: 'Discover' },
    { id: 'saved',    label: `Saved (${savedPlaces.length})` },
    { id: 'ai',       label: '✨ AI Picks' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D',
          fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
          Discover Places
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          {position
            ? `Searching near ${position.lat.toFixed(3)}, ${position.lng.toFixed(3)}`
            : 'Enable location for personalised results'}
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6',
        padding: '4px', borderRadius: '14px', width: 'fit-content' }}>
        {TABS.map(({ id, label }) => (
          <button key={id}
            onClick={() => {
              setActiveTab(id as any);
              if (id === 'ai' && recommendations.length === 0) loadRecommendations();
            }}
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              background: activeTab === id ? 'white' : 'transparent',
              color: activeTab === id ? '#0D1B3D' : '#6B7280',
              boxShadow: activeTab === id ? '0 1px 4px rgba(13,27,61,0.1)' : 'none',
              fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Discover tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'discover' && (
        <>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', width: '16px', height: '16px',
              color: '#9CA3AF', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, markets, ATMs…"
              style={{ width: '100%', padding: '13px 16px 13px 44px',
                borderRadius: '14px', border: '1.5px solid #E5E7EB',
                fontSize: '14px', color: '#0D1B3D', background: 'white',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => { e.target.style.borderColor = '#00B67A'; }}
              onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }}
            />
            {!position && (
              <button onClick={startSharing}
                style={{ position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', display: 'flex', alignItems: 'center',
                  gap: '4px', padding: '6px 12px', borderRadius: '10px',
                  background: '#00B67A', color: 'white', border: 'none',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Navigation style={{ width: '12px', height: '12px' }} />
                Use my location
              </button>
            )}
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map(({ id, label, icon: Icon, color, bg }) => (
              <button key={id}
                onClick={() => setActiveCategory(id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '999px', border: 'none',
                  background: activeCategory === id ? color : bg,
                  color: activeCategory === id ? 'white' : color,
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  boxShadow: activeCategory === id ? `0 4px 12px ${color}40` : 'none' }}>
                <Icon style={{ width: '13px', height: '13px' }} />
                {label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#00B67A',
                animation: 'spin 1s linear infinite' }} />
            </div>
          ) : places.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white',
              borderRadius: '20px', boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
              <Compass style={{ width: '40px', height: '40px', color: '#D1D5DB', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px' }}>
                No places found
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                Try a different category or enable location
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {places.map(place => (
                <PlaceCard
                  key={place.google_place_id}
                  place={place}
                  saved={savedIds.has(place.google_place_id)}
                  onSave={() => handleSave(place)}
                  onSelect={() => setSelected(place)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Saved tab ────────────────────────────────────────────────────────── */}
      {activeTab === 'saved' && (
        savedPlaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white',
            borderRadius: '20px', boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
            <Bookmark style={{ width: '40px', height: '40px', color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px' }}>
              No saved places yet
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 16px' }}>
              Tap the bookmark icon on any place to save it
            </p>
            <button onClick={() => setActiveTab('discover')}
              style={{ padding: '10px 20px', borderRadius: '12px', border: 'none',
                background: '#00B67A', color: 'white', fontWeight: '700', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit' }}>
              Discover places
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {CATEGORIES.map(({ id, label, color, bg }) => {
                const count = id === 'all'
                  ? savedPlaces.length
                  : savedPlaces.filter(p => p.category === id).length;
                if (id !== 'all' && count === 0) return null;
                return (
                  <button key={id}
                    onClick={() => setActiveCategory(id)}
                    style={{ padding: '6px 14px', borderRadius: '999px', border: 'none',
                      background: activeCategory === id ? color : bg,
                      color: activeCategory === id ? 'white' : color,
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
                    {label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
            {savedPlaces
              .filter(p => activeCategory === 'all' || p.category === activeCategory)
              .map(place => (
                <SavedPlaceRow
                  key={place.id}
                  place={place}
                  onUnsave={() => handleSave(place)}
                  onVisited={async () => {
                    await placesApi.markVisited(place.google_place_id).catch(() => {});
                    loadSaved();
                    toast.success('Marked as visited ✓');
                  }}
                />
              ))}
          </div>
        )
      )}

      {/* ── AI Picks tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* AI banner */}
          <div style={{ background: 'linear-gradient(135deg, #0D1B3D 0%, #1E3A7A 100%)',
            borderRadius: '20px', padding: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white',
                fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
                ✨ AI Place Recommendations
              </h3>
              <p style={{ fontSize: '12px', color: '#93C5FD', margin: 0 }}>
                Personalised picks based on your location and habits
              </p>
            </div>
            <button onClick={loadRecommendations} disabled={recLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                background: '#F5A623', color: '#0D1B3D', fontWeight: '700',
                fontSize: '13px', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
                opacity: recLoading ? 0.75 : 1 }}>
              {recLoading
                ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                : <Zap style={{ width: '14px', height: '14px' }} />}
              {recLoading ? 'Thinking…' : 'Refresh'}
            </button>
          </div>

          {recLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#F5A623',
                animation: 'spin 1s linear infinite' }} />
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white',
              borderRadius: '20px', boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
              <Zap style={{ width: '40px', height: '40px', color: '#D1D5DB', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px' }}>
                No recommendations yet
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 16px' }}>
                Save some places first so the AI can learn your preferences
              </p>
            </div>
          ) : (
            recommendations.map(rec => {
              const cat = getCategoryConfig(rec.category);
              const CatIcon = cat.icon;
              return (
                <div key={rec.id} style={{ background: 'white', borderRadius: '20px',
                  padding: '20px', boxShadow: '0 2px 12px rgba(13,27,61,0.07)',
                  display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px',
                    background: cat.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0 }}>
                    <CatIcon style={{ width: '20px', height: '20px', color: cat.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D', margin: '0 0 2px' }}>
                          {rec.name}
                        </p>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                          borderRadius: '999px', background: cat.bg, color: cat.color }}>
                          {cat.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 8px', borderRadius: '8px', background: '#F9FAFB', flexShrink: 0 }}>
                        <Star style={{ width: '11px', height: '11px', color: '#F5A623', fill: '#F5A623' }} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D1B3D' }}>
                          {rec.score}/10
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 12px', lineHeight: '1.5' }}>
                      {rec.reason}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setActiveCategory(rec.category);
                          setActiveTab('discover');
                          doSearch();
                        }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '6px', padding: '9px', borderRadius: '10px', border: 'none',
                          background: cat.color, color: 'white', fontWeight: '700', fontSize: '12px',
                          cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Search style={{ width: '12px', height: '12px' }} /> Find nearby
                      </button>
                      <button onClick={() => handleDismissRec(rec.id)}
                        style={{ padding: '9px 14px', borderRadius: '10px', border: 'none',
                          background: '#F3F4F6', color: '#6B7280', fontWeight: '600', fontSize: '12px',
                          cursor: 'pointer', fontFamily: 'inherit' }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Place detail modal ────────────────────────────────────────────────── */}
      {selected && (
        <PlaceModal
          place={selected}
          saved={savedIds.has(selected.google_place_id)}
          onSave={() => handleSave(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ── Place Card ─────────────────────────────────────────────────────────────────
function PlaceCard({ place, saved, onSave, onSelect }: {
  place: Place; saved: boolean;
  onSave: () => void; onSelect: () => void;
}) {
  const cat = getCategoryConfig(place.category);
  const CatIcon = cat.icon;

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(13,27,61,0.07)', cursor: 'pointer',
      transition: 'all 0.2s', animation: 'fadeIn 0.3s ease-out' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,27,61,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,27,61,0.07)'; }}>

      {/* Photo or placeholder */}
      <div style={{ height: '140px', background: cat.bg, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onSelect}>
        {place.photo_url ? (
          <img src={place.photo_url} alt={place.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <CatIcon style={{ width: '48px', height: '48px', color: cat.color, opacity: 0.4 }} />
        )}
        {/* Open/Closed badge */}
        {place.open_now !== null && (
          <span style={{ position: 'absolute', top: '10px', left: '10px',
            padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
            background: place.open_now ? '#D1FAE5' : '#FEE2E2',
            color: place.open_now ? '#065F46' : '#DC2626' }}>
            {place.open_now ? 'Open' : 'Closed'}
          </span>
        )}
        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          style={{ position: 'absolute', top: '10px', right: '10px',
            width: '32px', height: '32px', borderRadius: '10px',
            background: saved ? '#F5A623' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          {saved
            ? <BookmarkCheck style={{ width: '16px', height: '16px', color: '#0D1B3D' }} />
            : <Bookmark style={{ width: '16px', height: '16px', color: '#6B7280' }} />}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '14px' }} onClick={onSelect}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D', margin: 0, flex: 1 }}>
            {place.name}
          </p>
          {place.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <Star style={{ width: '12px', height: '12px', color: '#F5A623', fill: '#F5A623' }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D1B3D' }}>{place.rating}</span>
            </div>
          )}
        </div>
        {place.address && (
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {place.address}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px',
            borderRadius: '999px', background: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
          <ChevronRight style={{ width: '14px', height: '14px', color: '#D1D5DB' }} />
        </div>
      </div>
    </div>
  );
}

// ── Saved Place Row ────────────────────────────────────────────────────────────
function SavedPlaceRow({ place, onUnsave, onVisited }: {
  place: SavedPlace; onUnsave: () => void; onVisited: () => void;
}) {
  const cat = getCategoryConfig(place.category);
  const CatIcon = cat.icon;

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '16px',
      boxShadow: '0 2px 8px rgba(13,27,61,0.07)',
      display: 'flex', alignItems: 'center', gap: '14px',
      opacity: place.visited ? 0.7 : 1 }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
        background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CatIcon style={{ width: '20px', height: '20px', color: cat.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D', margin: '0 0 2px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {place.visited && <span style={{ marginRight: '4px' }}>✓</span>}
          {place.name}
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{place.address ?? cat.label}</p>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {!place.visited && (
          <button onClick={onVisited}
            style={{ padding: '7px 12px', borderRadius: '10px', border: 'none',
              background: '#F0FDF4', color: '#00B67A', fontWeight: '700',
              fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Visited
          </button>
        )}
        <button onClick={onUnsave}
          style={{ padding: '7px 10px', borderRadius: '10px', border: 'none',
            background: '#FEF2F2', color: '#EF4444', fontWeight: '700',
            fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
          <X style={{ width: '12px', height: '12px' }} />
        </button>
      </div>
    </div>
  );
}

// ── Place Detail Modal ─────────────────────────────────────────────────────────
function PlaceModal({ place, saved, onSave, onClose }: {
  place: Place; saved: boolean; onSave: () => void; onClose: () => void;
}) {
  const cat = getCategoryConfig(place.category);
  const CatIcon = cat.icon;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(13,27,61,0.6)', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '24px 24px 20px 20px',
        width: '100%', maxWidth: '480px', overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out' }}>

        {/* Photo */}
        <div style={{ height: '180px', background: cat.bg, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {place.photo_url ? (
            <img src={place.photo_url} alt={place.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <CatIcon style={{ width: '64px', height: '64px', color: cat.color, opacity: 0.3 }} />
          )}
          <button onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '12px',
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: '16px', height: '16px', color: '#0D1B3D' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0D1B3D',
                fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>{place.name}</h2>
              {place.address && (
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{place.address}</p>
              )}
            </div>
            {place.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 10px', borderRadius: '12px', background: '#FEF5E7', flexShrink: 0 }}>
                <Star style={{ width: '14px', height: '14px', color: '#F5A623', fill: '#F5A623' }} />
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0D1B3D' }}>{place.rating}</span>
                {place.user_ratings > 0 && (
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({place.user_ratings})</span>
                )}
              </div>
            )}
          </div>

          {/* Status + type */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {place.open_now !== null && (
              <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                background: place.open_now ? '#D1FAE5' : '#FEE2E2',
                color: place.open_now ? '#065F46' : '#DC2626' }}>
                <Clock style={{ width: '11px', height: '11px', display: 'inline', marginRight: '3px' }} />
                {place.open_now ? 'Open now' : 'Closed'}
              </span>
            )}
            <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px',
              fontWeight: '700', background: cat.bg, color: cat.color }}>
              {cat.label}
            </span>
          </div>

          {/* Save button */}
          <button onClick={onSave}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              background: saved ? '#FEF5E7' : '#F5A623',
              color: saved ? '#D97706' : '#0D1B3D',
              fontWeight: '700', fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {saved
              ? <><BookmarkCheck style={{ width: '18px', height: '18px' }} /> Saved — tap to remove</>
              : <><Bookmark style={{ width: '18px', height: '18px' }} /> Save this place</>}
          </button>
        </div>
      </div>
    </div>
  );
}
