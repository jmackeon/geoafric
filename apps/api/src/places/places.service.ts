import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { SearchPlacesDto, SavePlaceDto } from './places.dto';

// ── Category → Google Places type mapping ────────────────────────────────────
const CATEGORY_TYPES: Record<string, string> = {
  food:        'restaurant|food|bakery|cafe|bar',
  health:      'hospital|pharmacy|doctor|health|dentist',
  education:   'school|university|library|book_store',
  finance:     'bank|atm|insurance_agency|finance',
  safety:      'police|fire_station|embassy|local_government_office',
  transport:   'bus_station|taxi_stand|transit_station|airport',
  shopping:    'shopping_mall|supermarket|store|market',
  other:       'point_of_interest|establishment',
};

@Injectable()
export class PlacesService {
  private readonly mapsKey: string;
  private readonly vertexKey: string;
  private readonly vertexProject: string;

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {
    this.mapsKey      = this.config.get('GOOGLE_MAPS_SERVER_KEY') ?? '';
    this.vertexKey    = this.config.get('VERTEX_AI_API_KEY') ?? '';
    this.vertexProject = this.config.get('VERTEX_AI_PROJECT') ?? '';
  }

  // ── Search nearby places via Google Places API ────────────────────────────
  async searchNearby(userId: string, dto: SearchPlacesDto) {
    const lat      = dto.lat ?? 5.6037;
    const lng      = dto.lng ?? -0.1870;
    const radius   = dto.radius ?? 1500;
    const type     = dto.category ? CATEGORY_TYPES[dto.category] ?? 'establishment' : 'establishment';
    const keyword  = dto.query ?? '';

    // Log search for AI context
    await this.supabase.admin.from('place_searches').insert({
      user_id:       userId,
      query:         keyword || null,
      category:      dto.category ?? null,
      lat, lng,
    }).maybeSingle();

    if (!this.mapsKey) {
      // Return mock data if no API key — useful during development
      return this.getMockPlaces(lat, lng, dto.category ?? 'other');
    }

    try {
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius:   String(radius),
        type:     type.split('|')[0],
        key:      this.mapsKey,
        ...(keyword && { keyword }),
      });

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
      );
      const data = await res.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new BadRequestException(`Places API error: ${data.status}`);
      }

      return (data.results ?? []).slice(0, 20).map((p: any) => ({
        google_place_id: p.place_id,
        name:           p.name,
        address:        p.vicinity,
        category:       dto.category ?? this.inferCategory(p.types ?? []),
        lat:            p.geometry?.location?.lat,
        lng:            p.geometry?.location?.lng,
        rating:         p.rating ?? null,
        user_ratings:   p.user_ratings_total ?? 0,
        open_now:       p.opening_hours?.open_now ?? null,
        photo_url:      p.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${this.mapsKey}`
          : null,
        types:          p.types ?? [],
      }));
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      // Network error — return mock data
      return this.getMockPlaces(lat, lng, dto.category ?? 'other');
    }
  }

  // ── Get place details from Google ─────────────────────────────────────────
  async getPlaceDetails(placeId: string) {
    if (!this.mapsKey) return null;

    const params = new URLSearchParams({
      place_id: placeId,
      fields:   'name,formatted_address,formatted_phone_number,website,opening_hours,rating,photos,geometry',
      key:      this.mapsKey,
    });

    const res  = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const data = await res.json();
    return data.result ?? null;
  }

  // ── Saved places ──────────────────────────────────────────────────────────
  async getSavedPlaces(userId: string, category?: string) {
    let query = this.supabase.admin
      .from('saved_places')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async savePlace(userId: string, dto: SavePlaceDto) {
    const { data, error } = await this.supabase.admin
      .from('saved_places')
      .upsert({
        user_id:         userId,
        google_place_id: dto.google_place_id,
        name:            dto.name,
        address:         dto.address ?? null,
        category:        dto.category ?? 'other',
        lat:             dto.lat ?? null,
        lng:             dto.lng ?? null,
        rating:          dto.rating ?? null,
        phone:           dto.phone ?? null,
        website:         dto.website ?? null,
        photo_url:       dto.photo_url ?? null,
        notes:           dto.notes ?? null,
      }, { onConflict: 'user_id,google_place_id' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async unsavePlace(userId: string, googlePlaceId: string) {
    await this.supabase.admin
      .from('saved_places')
      .delete()
      .eq('user_id', userId)
      .eq('google_place_id', googlePlaceId);
    return { message: 'Place removed from saved.' };
  }

  async markVisited(userId: string, googlePlaceId: string) {
    await this.supabase.admin
      .from('saved_places')
      .update({ visited: true })
      .eq('user_id', userId)
      .eq('google_place_id', googlePlaceId);
    return { message: 'Marked as visited.' };
  }

  // ── AI Recommendations via Vertex AI Gemini ───────────────────────────────
  async getRecommendations(userId: string, lat: number, lng: number) {
    // Get existing recommendations first
    const { data: existing } = await this.supabase.admin
      .from('place_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (existing && existing.length >= 3) return existing;

    // Build context for AI
    const [savedPlaces, searches, profile] = await Promise.all([
      this.supabase.admin.from('saved_places').select('category, name').eq('user_id', userId).limit(10),
      this.supabase.admin.from('place_searches').select('category, query').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(10),
      this.supabase.admin.from('profiles').select('city, country, language').eq('id', userId).single(),
    ]);

    const recommendations = this.vertexKey
      ? await this.callVertexAI(lat, lng, savedPlaces.data, searches.data, profile.data)
      : this.getRuleBasedRecommendations(lat, lng, savedPlaces.data, profile.data);

    // Save to database
    if (recommendations.length) {
      const { data } = await this.supabase.admin
        .from('place_recommendations')
        .insert(recommendations.map((r: any) => ({ user_id: userId, ...r })))
        .select();
      return data ?? recommendations;
    }

    return recommendations;
  }

  async dismissRecommendation(userId: string, recId: string) {
    await this.supabase.admin
      .from('place_recommendations')
      .update({ dismissed: true })
      .eq('id', recId)
      .eq('user_id', userId);
    return { message: 'Recommendation dismissed.' };
  }

  // ── Vertex AI Gemini call ─────────────────────────────────────────────────
  private async callVertexAI(lat: number, lng: number, saved: any, searches: any, profile: any) {
    try {
      const prompt = `You are GeoAfric's AI assistant helping an African user discover useful nearby places.

User context:
- Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}
- City: ${profile?.city ?? 'Unknown'}, ${profile?.country ?? 'Africa'}
- Language preference: ${profile?.language ?? 'en'}
- Recently saved places categories: ${saved?.map((s: any) => s.category).join(', ') || 'none yet'}
- Recent searches: ${searches?.map((s: any) => s.query ?? s.category).join(', ') || 'none yet'}

Suggest 3 types of places the user should discover nearby. Consider African context — markets, mobile money agents, health clinics, churches/mosques, etc.

Respond ONLY with a JSON array (no markdown):
[
  { "name": "Type of place", "category": "food|health|education|finance|safety|transport|shopping|other", "reason": "Why this is useful here", "score": 8.5 },
  ...
]`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.vertexKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      });

      const data = await res.json();
      const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return this.getRuleBasedRecommendations(lat, lng, saved, profile);
    }
  }

  // ── Rule-based fallback recommendations ───────────────────────────────────
  private getRuleBasedRecommendations(lat: number, lng: number, saved: any, profile: any) {
    const savedCategories = new Set(saved?.map((s: any) => s.category) ?? []);
    const suggestions = [];

    if (!savedCategories.has('health')) {
      suggestions.push({
        name: 'Nearby Pharmacy or Clinic',
        category: 'health',
        reason: 'Having a nearby pharmacy saved is essential for health emergencies.',
        score: 9.0,
      });
    }
    if (!savedCategories.has('finance')) {
      suggestions.push({
        name: 'Mobile Money Agent or ATM',
        category: 'finance',
        reason: 'Quick access to money services is important in daily life.',
        score: 8.5,
      });
    }
    if (!savedCategories.has('safety')) {
      suggestions.push({
        name: 'Nearest Police Station',
        category: 'safety',
        reason: 'Knowing your nearest police station is a key safety measure.',
        score: 8.0,
      });
    }
    if (!savedCategories.has('food')) {
      suggestions.push({
        name: 'Local Market or Food Spot',
        category: 'food',
        reason: 'Discover the best local food options near you.',
        score: 7.5,
      });
    }

    return suggestions.slice(0, 3);
  }

  // ── Infer category from Google place types ─────────────────────────────────
  private inferCategory(types: string[]): string {
    if (types.some(t => ['restaurant','food','bakery','cafe','bar','meal_takeaway'].includes(t))) return 'food';
    if (types.some(t => ['hospital','pharmacy','doctor','health','dentist'].includes(t))) return 'health';
    if (types.some(t => ['school','university','library'].includes(t))) return 'education';
    if (types.some(t => ['bank','atm','finance'].includes(t))) return 'finance';
    if (types.some(t => ['police','fire_station','embassy'].includes(t))) return 'safety';
    if (types.some(t => ['bus_station','transit_station','airport'].includes(t))) return 'transport';
    if (types.some(t => ['shopping_mall','supermarket','store'].includes(t))) return 'shopping';
    return 'other';
  }

  // ── Mock data for development (no API key needed) ─────────────────────────
  private getMockPlaces(lat: number, lng: number, category: string) {
    const offset = () => (Math.random() - 0.5) * 0.01;
    const mocksByCategory: Record<string, any[]> = {
      food: [
        { name: 'Auntie Efua\'s Kitchen', address: 'Market Street, Accra', rating: 4.5, open_now: true },
        { name: 'Chop Bar Central',       address: 'Ring Road East',        rating: 4.2, open_now: true },
        { name: 'Papaye Fast Food',        address: 'Oxford Street',         rating: 4.0, open_now: false },
      ],
      health: [
        { name: 'Korle Bu Teaching Hospital', address: 'Korle Bu, Accra', rating: 4.1, open_now: true },
        { name: 'Trust Hospital',             address: 'Spintex Road',     rating: 4.6, open_now: true },
        { name: 'Pharmacy Plus',              address: 'High Street',       rating: 4.3, open_now: false },
      ],
      finance: [
        { name: 'MTN Mobile Money',  address: 'Kaneshie Market',  rating: 3.9, open_now: true },
        { name: 'GCB Bank ATM',      address: 'Accra Central',    rating: 4.0, open_now: true },
        { name: 'Fidelity Bank',     address: 'Airport City',     rating: 4.2, open_now: false },
      ],
    };

    const base = mocksByCategory[category] ?? mocksByCategory.food;
    return base.map((p, i) => ({
      google_place_id: `mock_${category}_${i}_${Date.now()}`,
      name:      p.name,
      address:   p.address,
      category,
      lat:       lat + offset(),
      lng:       lng + offset(),
      rating:    p.rating,
      open_now:  p.open_now,
      photo_url: null,
      types:     [category],
      user_ratings: Math.floor(Math.random() * 500) + 50,
    }));
  }
}
