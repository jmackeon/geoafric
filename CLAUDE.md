# GeoAfric — Project Context for Claude Code

> This file is read automatically by Claude Code on every session. It contains the project conventions, structure, and current state.

---

## What this project is

**GeoAfric** is an Afrocentric family safety, health monitoring, and place discovery platform built by **Alpha Z Technologies** (Nigeria/Ghana/Ivory Coast). Companion product: **SolarTrack** — smart solar monitoring hardware.

**Founder/Maintainer:** James Mackeon (Jay), CTO of Alpha-Z Technologies.

Build order: Web Dashboard → PWA → Mobile App → Deployment.

---

## Tech stack

### Monorepo
- **Turborepo** at `geoafric/`
- Workspaces: `apps/*` and `packages/*`
- Package manager: npm 10+

### Backend (`apps/api/`)
- **NestJS 10** + TypeScript
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- Port: **3001**
- Start: `npm run dev` (uses ts-node)
- Swagger docs: `/api/docs`
- CRITICAL: Listens on `0.0.0.0`, not `localhost`, so phones on LAN can connect

### Web frontend (`apps/web/`)
- **Next.js 14** App Router + TypeScript
- Port: **3000**
- Styling: **pure inline styles + globals.css** — NO Tailwind compilation
- Auth client: `@supabase/ssr ^0.5.0`
- State: **Zustand** (`useAuthStore`)
- Toast: `react-hot-toast`
- Icons: `lucide-react`

### Mobile (`apps/mobile/`)
- **Expo SDK 54** + React Native 0.81 + React 19
- **Expo Router 6** (file-based routing, mirrors web structure)
- `react-native-maps` (Google Maps), `expo-location`, `expo-secure-store`
- Same brand tokens as web (from `@geoafric/shared`)

### Shared (`packages/shared/`)
- TypeScript types (UserProfile, Family, LocationUpdate, etc.)
- Platform-agnostic API client with pluggable token storage
- Zustand auth store (works on web AND mobile)
- i18n constants

---

## Brand tokens (use these EXACTLY)

```typescript
const BRAND = {
  navy:  '#080F20',   // sidebar background, deep dark
  blue:  '#0D1B3D',   // primary text, gradients
  green: '#00B67A',   // emerald accent, success states
  teal:  '#00E6D2',   // bright accent, "Dashboard" subtitle
  gold:  '#F5A623',   // CTAs, active states, hero highlights
  bg:    '#F0F2F8',   // page background (subtly blue-grey)
} as const;
```

**Fonts:**
- Display: **Sora** (weights 400, 600, 700, 800, 900)
- Body: **DM Sans** (weights 300, 400, 500, 600, 700)

**Design language:** Afrocentric premium. Kente pattern overlays on dark surfaces, Adinkra-inspired hero patterns, Africa continent silhouettes, Africa mesh network SVG. Gold-to-green gradient indicators on active nav. Bloomberg-style status strips.

---

## Critical rules (learned the hard way)

| ❌ NEVER | ✅ ALWAYS |
|---|---|
| `<style>` tags inside JSX components | Put all CSS in `globals.css` |
| `@import url()` in CSS files | Load fonts via `<link>` in root `layout.tsx` |
| `Math.random()` during SSR render | Use static data or `useEffect` + `useState` |
| Tailwind utility classes | Pure inline styles for web |
| Singleton Supabase client | Fresh `createBrowserClient()` per call |
| `@supabase/ssr` below v0.5.0 | Must be `^0.5.0` (older uses localStorage) |
| `globalDotEnv` in turbo.json | Removed in Turborepo v2.9.6+ |
| `.env` in monorepo root | Must be `apps/api/.env` and `apps/web/.env.local` |
| Listening on `localhost` only | Listen on `0.0.0.0` so phones can connect |
| CORS allowing only `localhost:3000` | Allow all `localhost:*` + LAN IPs for mobile |

### Adding a new API module
1. Create `apps/api/src/{module}/` with `.module.ts`, `.service.ts`, `.controller.ts`, `.dto.ts`
2. Import the module and add to `imports` array in `app.module.ts`
3. Run the migration SQL in Supabase SQL Editor
4. **Ctrl+C → `npm run dev`** (NestJS hot reload often misses new modules — must restart)

### Hydration error checklist
Always one of:
- `<style>` tag with `>`, `'`, or `&` getting HTML-escaped on server
- `Math.random()` or `Date.now()` in render
- Dynamic value differs server vs client
Fix: move to `globals.css`, wrap dynamic UI in `useEffect` mount guard.

---

## Subscription plans (from proposal)

| Plan | Monthly | Annual | Members | Key Features |
|---|---|---|---|---|
| Free | $0 | $0 | 1 | Basic location, 5 languages, ad-supported |
| Personal | $3.99 | $38.30 | 3 | All modules, 5 languages, offline mode |
| Family | $9.99 | $95.90 | Unlimited | All 20+ languages, AI health, priority |
| Enterprise | Custom | Custom | Unlimited | API, white-label, SLA, Gov/NGO dashboards |

---

## i18n — 8 languages

| Code | Language | RTL |
|---|---|---|
| `en` | English | No |
| `fr` | Français | No |
| `tw` | Twi (Akan) | No |
| `ha` | Hausa | No |
| `yo` | Yorùbá | No |
| `sw` | Kiswahili | No |
| `am` | አማርኛ (Amharic) | No |
| `ar` | العربية (Arabic) | **Yes** |

Stored in `geoafric_locale` cookie. Custom `TranslationProvider` React Context.

---

## Database migrations (run in order)

All in `apps/api/supabase/migrations/`:
1. `001_core_schema.sql` — profiles, families, family_members, geofence_zones
2. `002_onboarding.sql` — extended profile fields, notification_preferences
3. `003_families_invitations.sql` — FMLY-XXXX invite codes
4. `004_health.sql` — heart_rate, activity, goals, insights
5. `005_location.sql` — location_updates + latest_locations view
6. `006_places.sql` — saved_places, recommendations
7. `007_payments.sql` — plans (seeded), subscriptions, transactions
8. `008_solartrack.sql` — solar_devices, telemetry, alerts

---

## API endpoints summary

All under base URL `http://localhost:3001` (dev) or `http://192.168.x.x:3001` (mobile on LAN).

- `/auth/*` — register, login, google, otp, forgot/reset password, me
- `/users/profile` — GET, PATCH
- `/families/*` — CRUD + join via code + geofences + members
- `/health/*` — heart-rate, activity, goals, insights
- `/location/*` — current, family, history, settings, SOS
- `/places/*` — search, details, saved, recommendations
- `/payments/*` — plans, subscription, initialize, verify, webhook
- `/solartrack/*` — ingest (no auth), devices, telemetry, alerts

Full Swagger at `/api/docs`.

---

## Environment variables

### `apps/api/.env`
```env
NEXT_PUBLIC_SUPABASE_URL=https://jhzifjzohrofdxqrlcnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AZURE_OPENAI_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=
PAYAZA_SECRET_KEY=
API_PORT=3001
FRONTEND_URL=http://localhost:3000
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://jhzifjzohrofdxqrlcnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

### `apps/mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3001
EXPO_PUBLIC_SUPABASE_URL=https://jhzifjzohrofdxqrlcnq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
```

⚠️ Mobile MUST use the laptop's LAN IP, not `localhost`, otherwise the phone tries to connect to itself. Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.

---

## Current status (May 2026)

### ✅ Completed phases
- **Phase 1** — Auth, families, health, i18n, migrations 001-004
- **Phase 2** — GPS location + family map, place discovery, migrations 005-006
- **Phase 3** — Payments (Paystack + Flutterwave + Payaza), SolarTrack UI shell, migrations 007-008
- **Afrocentric redesign** — Kente sidebar, Adinkra hero, Africa mesh SVG, breadcrumb header
- **Phase 4 scaffold** — Expo SDK 54 mobile app:
  - `packages/shared` extracted (types, API client, Zustand store, i18n)
  - Auth screens: login, register, forgot-password, reset-password
  - Onboarding 3-step flow (phone + language picker)
  - Bottom tabs scaffolded with hero home screen
  - Placeholder screens for: location, health, discover, family, settings, solar, billing

### 🔜 Remaining work
- **Phase 4 finish** — flesh out each placeholder tab (location map, health, family, settings, etc.)
- **Phase 5** — PWA polish + production deployment (Azure for API, Vercel for web)
- **Phase 6** — Marketing websites (geoafric.app + solartrack.app)
- **Phase 7** — Wire up live API keys (Azure OpenAI, Google Maps, payment providers, Firebase FCM)

---

## Dev workflow

```bash
# Start all 3 (API + web + mobile) from root
npm run dev

# Just web + API
npm run dev:web

# Just mobile
npm run dev:mobile

# After adding a new API module — restart, don't hot reload
cd apps/api && npm run dev

# When fonts/Expo deps drift
cd apps/mobile && npx expo install --check
```

---

## Common pitfalls already encountered

1. **Hydration errors** from `<style>` tags with special chars in JSX
2. **CORS blocking mobile** — API only allowed `localhost:3000`
3. **API listening on `localhost`** instead of `0.0.0.0` (mobile on LAN couldn't reach it)
4. **Mobile `.env` `localhost`** instead of LAN IP (phone tried to call itself)
5. **Expo SDK mismatch** — project on SDK 51, Expo Go on SDK 54
6. **Missing `babel-preset-expo`** in mobile devDependencies after SDK upgrade
7. **Missing `class-transformer`** in API after adding `@Type()` decorator
8. **Stale `app.module.ts`** — new module created but not registered in imports array
9. **Duplicate `.env` lines** — old `localhost` URL preceding the LAN IP one
10. **Windows Firewall** blocking port 3001 from phone

---

## When you (Claude Code) help

- **Always check existing files first** before writing — don't duplicate patterns that exist
- **Use Sora/DM Sans + brand colors** — match the existing aesthetic exactly
- **Honor inline-styles-only rule** for web — no Tailwind
- **For mobile** use the `theme` module from `apps/mobile/lib/theme.ts` — never hardcode colors
- **Read SETUP.md** files in `apps/mobile/` before troubleshooting Expo issues
- **Migrations are append-only** — new tables get a new numbered SQL file, never edit existing ones
- **API changes require restart** — Ctrl+C → npm run dev, hot reload misses new modules

Whenever Jay asks for a feature, look at how a similar one was built before (e.g. new dashboard tab → check `apps/web/src/app/dashboard/health/page.tsx` for the pattern).
