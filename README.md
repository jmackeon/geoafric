# GeoAfric

<p align="center">
  <img src="https://raw.githubusercontent.com/jmackeon/geoafric/main/apps/web/public/logo.png" alt="GeoAfric Logo" width="120" onerror="this.style.display='none'" />
</p>

<p align="center">
  <strong>Afrocentric Family Safety, Health Monitoring & Place Discovery Platform</strong>
</p>

<p align="center">
  <a href="#about"><img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20(iOS%20%26%20Android)-00B67A?style=flat-square" alt="Platform" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Monorepo-Turborepo-080F20?style=flat-square" alt="Turborepo" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Backend-NestJS%2010%20%2B%20Supabase-0D1B3D?style=flat-square" alt="NestJS & Supabase" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Frontend-Next.js%2014-00E6D2?style=flat-square" alt="Next.js" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Mobile-Expo%20SDK%2054-F5A623?style=flat-square" alt="Expo" /></a>
  <a href="#internationalization"><img src="https://img.shields.io/badge/Languages-8%20Afrocentric%20%26%20Global-00B67A?style=flat-square" alt="i18n" /></a>
</p>

---

## 🌍 About GeoAfric

**GeoAfric** is an Afrocentric family safety, real-time health monitoring, and local place discovery platform built by **Alpha Z Technologies** (operating across Nigeria, Ghana, and Côte d'Ivoire). 

Engineered specifically with African infrastructure, connectivity conditions, and family dynamics in mind, GeoAfric bridges modern location and wellness telemetry with culturally resonant UX, multilingual local language support, and companion smart hardware integration (**SolarTrack** — smart solar energy monitoring).

---

## 🚀 Key Features

- **👨‍👩‍👧‍👦 Family Circles & Real-Time Tracking**: Real-time GPS location sharing with customized geofencing (safe zones: home, school, market), location history, and instant SOS panic broadcasts.
- **❤️ Vital Health Monitoring**: Biometric telemetry tracking (heart rate, activity, health milestones, vitals) with automated wellness alerts and AI-driven insights.
- **📍 Afrocentric Place Discovery**: Curated directories and intelligent recommendations for local hospitals, pharmacies, emergency hubs, markets, and cultural points of interest.
- **☀️ SolarTrack Companion Integration**: Built-in IoT telemetry and device management for domestic and commercial solar power systems across Africa.
- **🌐 Multilingual Support (8 Languages)**: Fully localized in English, French, Twi (Akan), Hausa, Yorùbá, Kiswahili, Amharic (አማርኛ), and Arabic (العربية with full RTL support).
- **💳 Localized African Payment Gateways**: Seamless recurring subscriptions powered by Paystack, Flutterwave, and Payaza.

---

## 🏗️ Repository Architecture

This repository is organized as a high-performance monorepo powered by **Turborepo** and **npm workspaces**:

```text
geoafric/
├── apps/
│   ├── api/          # NestJS 10 backend + Supabase (PostgreSQL + RLS + Auth)
│   ├── web/          # Next.js 14 App Router web platform & dashboard
│   └── mobile/       # Expo SDK 54 / React Native cross-platform mobile application
├── packages/
│   └── shared/       # Cross-platform TypeScript types, API client, Zustand stores & i18n
├── package.json      # Root package scripts and monorepo workspace configuration
├── turbo.json        # Turborepo pipeline cache & execution rules
└── CLAUDE.md         # Architecture guidelines and internal conventions
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Monorepo** | [Turborepo](https://turbo.build/) v2.9+, npm Workspaces |
| **Backend API** | [NestJS 10](https://nestjs.com/), TypeScript, Swagger (`/api/docs`), Passport JWT |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Auth, Edge Functions) |
| **Web Dashboard** | [Next.js 14](https://nextjs.org/) (App Router), `@supabase/ssr`, Zustand, Lucide Icons |
| **Mobile App** | [Expo SDK 54](https://expo.dev/) (React Native 0.81, React 19), Expo Router 6, Google Maps |
| **Payments** | [Paystack](https://paystack.com/), [Flutterwave](https://flutterwave.com/), [Payaza](https://payaza.africa/) |
| **IoT Telemetry** | SolarTrack IoT device ingest service and real-time power analytics |

---

## 🎨 Design System & Afrocentric Identity

The visual language blends modern fintech and healthcare dashboard design with Afrocentric motifs:

- **Typography**: Display: **Sora** (weights 400–900) • Body: **DM Sans** (weights 300–700)
- **Palette**:
  - `Navy` (`#080F20`): Deep background & dark sidebar surfaces
  - `Blue` (`#0D1B3D`): Primary text and subtle surface gradients
  - `Green` (`#00B67A`): Emerald accent, success indicators & verified status
  - `Teal` (`#00E6D2`): Vibrant accent for highlights & status strips
  - `Gold` (`#F5A623`): Primary actions, badges & active states
  - `Canvas` (`#F0F2F8`): Clean, softly toned background
- **Cultural Motifs**: Subtle Kente pattern overlays, Adinkra symbol elements, and pan-African network mesh graphics.

---

## 🏁 Getting Started

### Prerequisites

Ensure you have installed:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Expo Go** (optional, for testing on physical iOS/Android devices)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/jmackeon/geoafric.git
cd geoafric
npm install
```

### 2. Environment Configuration

Copy the example environment files for each app:

#### Backend (`apps/api/.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
API_PORT=3001
FRONTEND_URL=http://localhost:3000
GOOGLE_MAPS_SERVER_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=
PAYAZA_SECRET_KEY=
```

#### Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

#### Mobile (`apps/mobile/.env`)
```env
# Use your computer's LAN IP address (e.g., http://192.168.1.100:3001) so devices on the same Wi-Fi can connect
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3001
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
```

> 💡 **Tip:** On mobile devices, `localhost` points to the phone itself. Always set `EXPO_PUBLIC_API_URL` to your machine's local network IP (`ipconfig` on Windows or `ifconfig` on macOS/Linux).

### 3. Database Setup

Execute the migrations in sequential order via your Supabase SQL editor (`apps/api/supabase/migrations/`):

1. `001_core_schema.sql` — Profiles, families, memberships, geofence zones
2. `002_onboarding.sql` — Profile attributes & notification preferences
3. `003_families_invitations.sql` — Family invite codes (`FMLY-XXXX`)
4. `004_health.sql` — Heart rate, steps, activities, health insights
5. `005_location.sql` — Location telemetry & views
6. `006_places.sql` — Saved locations & recommendation engine
7. `007_payments.sql` — Subscriptions, transaction ledger, pricing plans
8. `008_solartrack.sql` — Solar devices, battery/PV telemetry & alerts

---

## 💻 Development Commands

Run commands from the monorepo root:

| Command | Description |
|---|---|
| `npm run dev` | Starts all workspaces concurrently (**API + Web + Mobile**) |
| `npm run dev:web` | Starts **Backend API** (`:3001`) and **Web Frontend** (`:3000`) |
| `npm run dev:mobile` | Starts the **Expo Mobile** development server |
| `npm run build` | Builds all packages and applications via Turborepo pipeline |
| `npm run lint` | Runs linter checks across all workspaces |
| `npm run clean` | Cleans build caches and generated artifacts |

### Service Endpoints

- **Web Dashboard**: `http://localhost:3000`
- **NestJS REST API**: `http://localhost:3001` (Listens on `0.0.0.0`)
- **API Swagger Documentation**: `http://localhost:3001/api/docs`

---

## 🌐 Supported Languages (i18n)

GeoAfric supports 8 languages with seamless runtime switching:

| Code | Language | Native Name | Direction |
|---|---|---|---|
| `en` | English | English | LTR |
| `fr` | French | Français | LTR |
| `tw` | Twi | Twi (Akan) | LTR |
| `ha` | Hausa | Harshen Hausa | LTR |
| `yo` | Yorùbá | Èdè Yorùbá | LTR |
| `sw` | Swahili | Kiswahili | LTR |
| `am` | Amharic | አማርኛ | LTR |
| `ar` | Arabic | العربية | **RTL** |

---

## 🔒 Security & Architecture Conventions

- **Network Binding**: The NestJS API listens on `0.0.0.0` to permit communication across local networks for physical mobile device testing.
- **Row Level Security (RLS)**: Database authorization and tenant privacy are enforced directly at the Postgres layer via Supabase RLS policies.
- **Shared Architecture**: DTO interfaces, validation models, and authentication state logic are unified inside `packages/shared` to eliminate redundancy between web and mobile clients.

---

## 👥 Organization & Credits

- **Creator & Maintainer**: [James Mackeon](https://github.com/jmackeon) (CTO, Alpha Z Technologies)
- **Developed by**: **Alpha Z Technologies** (Nigeria • Ghana • Côte d'Ivoire)

---

## 📄 License

Proprietary and confidential. Built and maintained by Alpha Z Technologies. All rights reserved.
