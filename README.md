# GeoAfric Platform

> Tracking. Health. Discovery. Security. — Built for Africa.

**GeoAfric** is a cross-platform family safety and wellness platform by Alpha Zion Technology. This monorepo contains the web dashboard, PWA, and NestJS backend API.

---

## Monorepo Structure

```
geoafric/
├── apps/
│   ├── api/                    # NestJS backend (Azure App Service)
│   │   ├── src/
│   │   │   ├── auth/           # Auth module (register, login, Google SSO, refresh)
│   │   │   ├── users/          # User profile module
│   │   │   ├── supabase/       # Supabase client (db + admin)
│   │   │   └── common/         # Guards, decorators, filters
│   │   └── supabase/
│   │       └── migrations/     # SQL migrations — run in Supabase dashboard
│   └── web/                    # Next.js 14 web dashboard + PWA (Vercel)
│       └── src/
│           ├── app/
│           │   ├── auth/       # Login, Register, Callback pages
│           │   └── dashboard/  # Dashboard shell + module pages
│           ├── components/     # Shared UI components
│           ├── lib/            # Supabase client, Zustand stores, API helpers
│           └── types/          # TypeScript types
├── packages/
│   ├── shared/                 # Shared types and utilities (used by api + web)
│   └── ui/                     # Shared UI components (future)
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions — test, deploy API + web
├── .env.example                # Copy to .env and fill in your values
├── turbo.json                  # Turborepo task pipeline
└── package.json                # Root workspace config
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Included with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/your-org/geoafric.git
cd geoafric
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values. See the [Environment Variables](#environment-variables) section below.

### 4. Run Supabase migrations

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Open your project → **SQL Editor**
3. Paste and run the contents of:
   - `apps/api/supabase/migrations/001_core_schema.sql`

### 5. Start development servers

```bash
# Run both API and web simultaneously
npm run dev

# Or run individually:
npm run dev:api   # NestJS API on http://localhost:3001
npm run dev:web   # Next.js web on http://localhost:3000
```

### 6. Open in browser

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Web dashboard |
| `http://localhost:3000/auth/login` | Login page |
| `http://localhost:3000/auth/register` | Register page |
| `http://localhost:3001/api/docs` | Swagger API docs |

---

## Environment Variables

All variables are listed in `.env.example`. Here's a quick reference:

### Supabase (Required)
Get these from your Supabase project → **Settings → API**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Google (Required for Maps + OAuth)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable: Maps SDK, Places API, Translation API, OAuth 2.0
3. Create credentials → OAuth 2.0 Client ID

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Azure (Required for API hosting + AI)
```
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_WEB_PUBSUB_CONNECTION_STRING=...
```

### Firebase (Required for push notifications)
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Project Settings → Service Accounts → Generate new private key

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

---

## GitHub Secrets (for CI/CD)

Add these in: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret | Where to get it |
|--------|----------------|
| `SUPABASE_URL` | Supabase dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `AZURE_APP_SERVICE_NAME` | Your Azure App Service name |
| `AZURE_PUBLISH_PROFILE` | Azure portal → App Service → Get publish profile |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel dashboard → Settings |
| `VERCEL_PROJECT_ID` | Vercel project → Settings |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State Management | Zustand |
| Animations | Framer Motion |
| Backend API | NestJS, TypeScript |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Realtime | Azure Web PubSub |
| AI — Health | Azure OpenAI GPT-4o-mini |
| AI — Location | Vertex AI Gemini |
| Maps | Google Maps Platform |
| Push Notifications | Firebase FCM |
| Payments | Paystack (GHS/Mobile Money) + Flutterwave (international) |
| Mobile (Phase 3) | React Native + Expo |
| Hosting — API | Azure App Service |
| Hosting — Web | Vercel |
| CI/CD | GitHub Actions + Turborepo |

---

## Brand Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#0B1437` | Primary background, sidebar |
| Solar Gold | `#F4A51A` | Primary CTA, active states |
| Teal | `#00C6AE` | Accent, success, teal badges |
| Font — Display | Sora | Headings, logo |
| Font — Body | DM Sans | Body text, UI |
| Font — Mono | JetBrains Mono | Coordinates, data |

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Foundation & Auth — monorepo, Supabase, auth, dashboard shell | ✅ Week 1 |
| **2** | Location & Mapping — real-time GPS, family map, geofences | 🔜 |
| **3** | Family & Groups — member management, alerts, history | 🔜 |
| **4** | Health & Wellness — camera HR, AI anomaly detection | 🔜 |
| **5** | Place Discovery — nearby places, heatmaps, route safety | 🔜 |
| **6** | Payments — Paystack, Flutterwave, subscription tiers | 🔜 |
| **7** | SolarTrack Hardware — device pairing, SDK activation | 🔜 |

---

## Team

**Alpha Z Technologies** — GeoAfric Platform  
Confidential · 2025
